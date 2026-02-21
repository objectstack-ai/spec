// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { ObjectLogger } from './logger.js';

/**
 * Namespace entry representing an object/view/flow etc. registered by a package.
 */
export interface NamespaceEntry {
  /** The namespace path (e.g. "objects.project_task", "views.task_list") */
  namespace: string;
  /** The package that owns this namespace */
  packageId: string;
  /** When this entry was registered */
  registeredAt: string;
}

/**
 * Result of a namespace conflict check.
 */
export interface NamespaceConflict {
  /** The conflicting namespace path */
  namespace: string;
  /** The package that currently owns this namespace */
  existingPackageId: string;
  /** The package attempting to register the same namespace */
  incomingPackageId: string;
  /** A suggested alternative name to avoid the conflict */
  suggestion?: string;
}

/**
 * Result of namespace availability check.
 */
export interface NamespaceCheckResult {
  /** Whether all requested namespaces are available */
  available: boolean;
  /** List of conflicts detected */
  conflicts: NamespaceConflict[];
  /** Suggested alternatives for each conflict */
  suggestions: Record<string, string>;
}

/**
 * Namespace Resolver
 *
 * Manages namespace registration for installed packages and detects collisions
 * during install-time. Each metadata item (object, view, flow, page, etc.)
 * produces a namespace like `objects.<name>` or `views.<name>`.
 *
 * When a new package declares objects, views, or other metadata that would
 * collide with an existing package's metadata, this resolver reports the
 * conflicts and suggests prefixed alternatives.
 */
export class NamespaceResolver {
  private logger: ObjectLogger;
  private registry: Map<string, NamespaceEntry> = new Map();

  constructor(logger: ObjectLogger) {
    this.logger = logger.child({ component: 'NamespaceResolver' });
  }

  /**
   * Register namespaces owned by a package.
   */
  register(packageId: string, namespaces: string[]): void {
    const now = new Date().toISOString();
    for (const ns of namespaces) {
      if (this.registry.has(ns)) {
        const existing = this.registry.get(ns)!;
        if (existing.packageId !== packageId) {
          this.logger.warn('Overwriting namespace entry', { namespace: ns, existing: existing.packageId, incoming: packageId });
        }
      }
      this.registry.set(ns, { namespace: ns, packageId, registeredAt: now });
      this.logger.debug('Namespace registered', { namespace: ns, packageId });
    }
  }

  /**
   * Unregister all namespaces belonging to a package.
   */
  unregister(packageId: string): string[] {
    const removed: string[] = [];
    for (const [ns, entry] of this.registry) {
      if (entry.packageId === packageId) {
        this.registry.delete(ns);
        removed.push(ns);
      }
    }
    this.logger.debug('Namespaces unregistered', { packageId, count: removed.length });
    return removed;
  }

  /**
   * Check whether a set of namespaces is available for a given package.
   */
  checkAvailability(packageId: string, namespaces: string[]): NamespaceCheckResult {
    const conflicts: NamespaceConflict[] = [];
    const suggestions: Record<string, string> = {};

    for (const ns of namespaces) {
      const existing = this.registry.get(ns);
      if (existing && existing.packageId !== packageId) {
        const suggestion = this.suggestAlternative(ns, packageId);
        conflicts.push({
          namespace: ns,
          existingPackageId: existing.packageId,
          incomingPackageId: packageId,
          suggestion,
        });
        suggestions[ns] = suggestion;
      }
    }

    return {
      available: conflicts.length === 0,
      conflicts,
      suggestions,
    };
  }

  /**
   * Extract namespace strings from a package's metadata definition.
   */
  extractNamespaces(config: Record<string, unknown>): string[] {
    const namespaces: string[] = [];
    const categories = [
      'objects', 'views', 'pages', 'flows', 'workflows',
      'apps', 'dashboards', 'reports', 'actions', 'agents',
    ];

    for (const category of categories) {
      const items = config[category];
      if (Array.isArray(items)) {
        for (const item of items) {
          const name = (item as Record<string, unknown>)?.name;
          if (typeof name === 'string') {
            namespaces.push(`${category}.${name}`);
          }
        }
      } else if (items && typeof items === 'object') {
        for (const key of Object.keys(items as object)) {
          namespaces.push(`${category}.${key}`);
        }
      }
    }

    return namespaces;
  }

  /**
   * Get all registered entries.
   */
  getRegistry(): ReadonlyMap<string, NamespaceEntry> {
    return this.registry;
  }

  /**
   * Get all namespaces belonging to a specific package.
   */
  getPackageNamespaces(packageId: string): string[] {
    const namespaces: string[] = [];
    for (const [ns, entry] of this.registry) {
      if (entry.packageId === packageId) {
        namespaces.push(ns);
      }
    }
    return namespaces;
  }

  /**
   * Generate a prefixed alternative namespace to avoid conflicts.
   */
  private suggestAlternative(ns: string, packageId: string): string {
    // Extract the short package name for prefixing
    const shortName = packageId
      .replace(/^@[^/]+\//, '')
      .replace(/^plugin-/, '')
      .replace(/-/g, '_');

    const parts = ns.split('.');
    if (parts.length >= 2) {
      // e.g. "objects.task" → "objects.crm_task"
      return `${parts[0]}.${shortName}_${parts.slice(1).join('.')}`;
    }
    return `${shortName}_${ns}`;
  }
}
