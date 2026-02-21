// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { ObjectLogger } from './logger.js';
import { DependencyResolver, SemanticVersionManager } from './dependency-resolver.js';
import { NamespaceResolver } from './namespace-resolver.js';

/**
 * Installed package record in the runtime registry.
 */
export interface InstalledPackageRecord {
  /** Package identifier */
  packageId: string;
  /** Package version */
  version: string;
  /** Package manifest */
  manifest: Record<string, unknown>;
  /** Installation timestamp */
  installedAt: string;
  /** Current status */
  status: 'installed' | 'disabled' | 'installing' | 'upgrading' | 'uninstalling' | 'error';
  /** Namespaces registered by this package */
  namespaces: string[];
  /** Dependencies of this package */
  dependencies: string[];
}

/**
 * Snapshot of a package's state before upgrade (for rollback).
 */
export interface PackageSnapshot {
  /** Package identifier */
  packageId: string;
  /** Version before upgrade */
  previousVersion: string;
  /** Full manifest before upgrade */
  previousManifest: Record<string, unknown>;
  /** Namespaces before upgrade */
  previousNamespaces: string[];
  /** Snapshot timestamp */
  createdAt: string;
}

/**
 * Result of a package installation attempt.
 */
export interface InstallResult {
  success: boolean;
  packageId: string;
  version: string;
  installedDependencies: string[];
  namespaceConflicts: Array<{ namespace: string; existingPackageId: string }>;
  errorMessage?: string;
}

/**
 * Result of an upgrade attempt.
 */
export interface UpgradeResult {
  success: boolean;
  packageId: string;
  fromVersion: string;
  toVersion: string;
  snapshot: PackageSnapshot;
  errorMessage?: string;
}

/**
 * Result of a rollback attempt.
 */
export interface RollbackResult {
  success: boolean;
  packageId: string;
  restoredVersion: string;
  errorMessage?: string;
}

/**
 * Package Manager
 *
 * Runtime implementation for the full package lifecycle:
 * install → upgrade → rollback → uninstall.
 *
 * Consumes the protocol schemas defined in @objectstack/spec:
 * - DependencyResolutionResultSchema
 * - NamespaceConflictErrorSchema
 * - UpgradePlanSchema / UpgradeSnapshotSchema
 * - PackageArtifactSchema
 *
 * Coordinates with:
 * - DependencyResolver for topological ordering and conflict detection
 * - NamespaceResolver for metadata collision prevention
 */
export class PackageManager {
  private logger: ObjectLogger;
  private packages: Map<string, InstalledPackageRecord> = new Map();
  private snapshots: Map<string, PackageSnapshot> = new Map();
  private dependencyResolver: DependencyResolver;
  private namespaceResolver: NamespaceResolver;
  private platformVersion: string;

  constructor(
    logger: ObjectLogger,
    options: { platformVersion?: string } = {},
  ) {
    this.logger = logger.child({ component: 'PackageManager' });
    this.dependencyResolver = new DependencyResolver(logger);
    this.namespaceResolver = new NamespaceResolver(logger);
    this.platformVersion = options.platformVersion || '3.0.0';
  }

  /**
   * Install a package with full dependency resolution and namespace checking.
   */
  async install(
    packageId: string,
    version: string,
    manifest: Record<string, unknown>,
  ): Promise<InstallResult> {
    this.logger.info('Installing package', { packageId, version });

    // 1. Check if already installed
    if (this.packages.has(packageId)) {
      const existing = this.packages.get(packageId)!;
      if (existing.status === 'installed') {
        return {
          success: false,
          packageId,
          version,
          installedDependencies: [],
          namespaceConflicts: [],
          errorMessage: `Package ${packageId}@${existing.version} is already installed. Use upgrade instead.`,
        };
      }
    }

    // 2. Check platform compatibility
    const engine = (manifest as any).engine?.objectstack as string | undefined;
    if (engine) {
      const platformSemver = SemanticVersionManager.parse(this.platformVersion);
      if (!SemanticVersionManager.satisfies(platformSemver, engine)) {
        return {
          success: false,
          packageId,
          version,
          installedDependencies: [],
          namespaceConflicts: [],
          errorMessage: `Package requires platform ${engine}, but current platform is v${this.platformVersion}`,
        };
      }
    }

    // 3. Check namespace conflicts
    const namespaces = this.namespaceResolver.extractNamespaces(manifest);
    const nsCheck = this.namespaceResolver.checkAvailability(packageId, namespaces);
    if (!nsCheck.available) {
      return {
        success: false,
        packageId,
        version,
        installedDependencies: [],
        namespaceConflicts: nsCheck.conflicts.map(c => ({
          namespace: c.namespace,
          existingPackageId: c.existingPackageId,
        })),
        errorMessage: `Namespace conflicts detected: ${nsCheck.conflicts.map(c => c.namespace).join(', ')}`,
      };
    }

    // 4. Resolve dependencies
    const deps = (manifest as any).dependencies as Record<string, string> | undefined;
    const depNames = deps ? Object.keys(deps) : [];
    const missingDeps = depNames.filter(d => !this.packages.has(d));
    if (missingDeps.length > 0) {
      return {
        success: false,
        packageId,
        version,
        installedDependencies: [],
        namespaceConflicts: [],
        errorMessage: `Missing dependencies: ${missingDeps.join(', ')}`,
      };
    }

    // 5. Register package
    this.packages.set(packageId, {
      packageId,
      version,
      manifest,
      installedAt: new Date().toISOString(),
      status: 'installed',
      namespaces,
      dependencies: depNames,
    });

    // 6. Register namespaces
    this.namespaceResolver.register(packageId, namespaces);

    this.logger.info('Package installed', { packageId, version, namespaces: namespaces.length });

    return {
      success: true,
      packageId,
      version,
      installedDependencies: depNames,
      namespaceConflicts: [],
    };
  }

  /**
   * Uninstall a package, checking for dependents first.
   */
  async uninstall(packageId: string): Promise<{ success: boolean; errorMessage?: string }> {
    const pkg = this.packages.get(packageId);
    if (!pkg) {
      return { success: false, errorMessage: `Package ${packageId} is not installed` };
    }

    // Check if other packages depend on this one
    const dependents: string[] = [];
    for (const [id, record] of this.packages) {
      if (id !== packageId && record.dependencies.includes(packageId)) {
        dependents.push(id);
      }
    }

    if (dependents.length > 0) {
      return {
        success: false,
        errorMessage: `Cannot uninstall ${packageId}: depended upon by ${dependents.join(', ')}`,
      };
    }

    // Remove namespaces and package
    this.namespaceResolver.unregister(packageId);
    this.packages.delete(packageId);
    this.snapshots.delete(packageId);

    this.logger.info('Package uninstalled', { packageId });
    return { success: true };
  }

  /**
   * Upgrade a package: snapshot → update → register.
   */
  async upgrade(
    packageId: string,
    newVersion: string,
    newManifest: Record<string, unknown>,
  ): Promise<UpgradeResult> {
    const existing = this.packages.get(packageId);
    if (!existing) {
      return {
        success: false,
        packageId,
        fromVersion: '',
        toVersion: newVersion,
        snapshot: { packageId, previousVersion: '', previousManifest: {}, previousNamespaces: [], createdAt: new Date().toISOString() },
        errorMessage: `Package ${packageId} is not installed`,
      };
    }

    // 1. Create snapshot for rollback
    const snapshot: PackageSnapshot = {
      packageId,
      previousVersion: existing.version,
      previousManifest: existing.manifest,
      previousNamespaces: [...existing.namespaces],
      createdAt: new Date().toISOString(),
    };
    this.snapshots.set(packageId, snapshot);

    // 2. Check platform compatibility
    const engine = (newManifest as any).engine?.objectstack as string | undefined;
    if (engine) {
      const platformSemver = SemanticVersionManager.parse(this.platformVersion);
      if (!SemanticVersionManager.satisfies(platformSemver, engine)) {
        return {
          success: false,
          packageId,
          fromVersion: existing.version,
          toVersion: newVersion,
          snapshot,
          errorMessage: `New version requires platform ${engine}, current is v${this.platformVersion}`,
        };
      }
    }

    // 3. Check namespace changes
    const newNamespaces = this.namespaceResolver.extractNamespaces(newManifest);
    // Temporarily remove old namespaces to check new ones
    this.namespaceResolver.unregister(packageId);
    const nsCheck = this.namespaceResolver.checkAvailability(packageId, newNamespaces);
    if (!nsCheck.available) {
      // Restore old namespaces on failure
      this.namespaceResolver.register(packageId, existing.namespaces);
      return {
        success: false,
        packageId,
        fromVersion: existing.version,
        toVersion: newVersion,
        snapshot,
        errorMessage: `Namespace conflicts in new version: ${nsCheck.conflicts.map(c => c.namespace).join(', ')}`,
      };
    }

    // 4. Register new namespaces and update record
    this.namespaceResolver.register(packageId, newNamespaces);
    const deps = (newManifest as any).dependencies as Record<string, string> | undefined;

    this.packages.set(packageId, {
      packageId,
      version: newVersion,
      manifest: newManifest,
      installedAt: existing.installedAt,
      status: 'installed',
      namespaces: newNamespaces,
      dependencies: deps ? Object.keys(deps) : [],
    });

    this.logger.info('Package upgraded', { packageId, from: existing.version, to: newVersion });

    return {
      success: true,
      packageId,
      fromVersion: existing.version,
      toVersion: newVersion,
      snapshot,
    };
  }

  /**
   * Rollback a package to its pre-upgrade snapshot.
   */
  async rollback(packageId: string): Promise<RollbackResult> {
    const snapshot = this.snapshots.get(packageId);
    if (!snapshot) {
      return {
        success: false,
        packageId,
        restoredVersion: '',
        errorMessage: `No upgrade snapshot found for ${packageId}`,
      };
    }

    // Restore previous state
    this.namespaceResolver.unregister(packageId);
    this.namespaceResolver.register(packageId, snapshot.previousNamespaces);

    const deps = (snapshot.previousManifest as any).dependencies as Record<string, string> | undefined;
    this.packages.set(packageId, {
      packageId,
      version: snapshot.previousVersion,
      manifest: snapshot.previousManifest,
      installedAt: new Date().toISOString(),
      status: 'installed',
      namespaces: snapshot.previousNamespaces,
      dependencies: deps ? Object.keys(deps) : [],
    });

    this.snapshots.delete(packageId);

    this.logger.info('Package rolled back', { packageId, to: snapshot.previousVersion });

    return {
      success: true,
      packageId,
      restoredVersion: snapshot.previousVersion,
    };
  }

  /**
   * Get an installed package record.
   */
  getPackage(packageId: string): InstalledPackageRecord | undefined {
    return this.packages.get(packageId);
  }

  /**
   * List all installed packages.
   */
  listPackages(): InstalledPackageRecord[] {
    return Array.from(this.packages.values());
  }

  /**
   * Resolve dependencies for a set of packages.
   */
  resolveDependencies(
    packages: Map<string, { version?: string; dependencies?: string[] }>,
  ): string[] {
    return this.dependencyResolver.resolve(packages);
  }

  /**
   * Check namespace availability for a package's metadata.
   */
  checkNamespaces(packageId: string, config: Record<string, unknown>): {
    available: boolean;
    conflicts: Array<{ namespace: string; existingPackageId: string }>;
  } {
    const namespaces = this.namespaceResolver.extractNamespaces(config);
    const result = this.namespaceResolver.checkAvailability(packageId, namespaces);
    return {
      available: result.available,
      conflicts: result.conflicts.map(c => ({
        namespace: c.namespace,
        existingPackageId: c.existingPackageId,
      })),
    };
  }

  /**
   * Get the namespace resolver instance.
   */
  getNamespaceResolver(): NamespaceResolver {
    return this.namespaceResolver;
  }

  /**
   * Get a snapshot for a given package (if available).
   */
  getSnapshot(packageId: string): PackageSnapshot | undefined {
    return this.snapshots.get(packageId);
  }
}
