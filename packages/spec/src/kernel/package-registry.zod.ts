// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';
import { ManifestSchema } from './manifest.zod';
import { DependencyResolutionResultSchema } from './dependency-resolution.zod';

/**
 * # Package Registry Protocol
 * 
 * Defines the runtime state and lifecycle operations for installed packages.
 * 
 * ## Key Distinction: Package vs App
 * - **Package (Manifest)**: The unit of installation — a deployable artifact containing
 *   metadata (objects, actions, flows, etc.) and optionally one or more Apps.
 * - **App (AppSchema)**: A UI navigation shell defined inside a package.
 * 
 * A package may contain:
 * - Zero apps (pure functionality plugin, e.g. a storage driver)
 * - One app (typical business application)
 * - Multiple apps (suite of applications)
 * 
 * ## Architecture Alignment
 * - **Salesforce**: Managed Packages with install/uninstall lifecycle
 * - **VS Code**: Extension marketplace with enable/disable per-workspace
 * - **Kubernetes**: Helm charts with release state tracking
 * - **npm**: Package registry with install/uninstall/version management
 */

// ==========================================
// Package Status & Lifecycle
// ==========================================

/**
 * Package installation status.
 */
export const PackageStatusEnum = z.enum([
  'installed',     // Successfully installed and enabled
  'disabled',      // Installed but disabled (metadata not active)
  'installing',    // Installation in progress
  'upgrading',     // Upgrade in progress
  'uninstalling',  // Removal in progress
  'error',         // Installation or runtime error
]);
export type PackageStatus = z.infer<typeof PackageStatusEnum>;

/**
 * Installed Package Schema
 * 
 * Wraps a ManifestSchema with runtime lifecycle state.
 * This is the "row" in the installed packages table.
 */
export const InstalledPackageSchema = z.object({
  /** 
   * The full package manifest (source of truth for package definition).
   */
  manifest: ManifestSchema,

  /**
   * Current lifecycle status.
   */
  status: PackageStatusEnum.default('installed'),

  /**
   * Whether the package is currently enabled (active).
   * When disabled, the package's metadata is not loaded into the registry.
   */
  enabled: z.boolean().default(true),

  /**
   * ISO 8601 timestamp of when the package was installed.
   */
  installedAt: z.string().datetime().optional(),

  /**
   * ISO 8601 timestamp of last update.
   */
  updatedAt: z.string().datetime().optional(),

  /**
   * The currently installed version string.
   * Mirrors manifest.version for quick access without parsing the full manifest.
   */
  installedVersion: z.string().optional()
    .describe('Currently installed version for quick access'),

  /**
   * The previously installed version (before last upgrade).
   * Useful for rollback and upgrade tracking.
   */
  previousVersion: z.string().optional()
    .describe('Version before the last upgrade'),

  /**
   * ISO 8601 timestamp of when the package was last enabled/disabled.
   */
  statusChangedAt: z.string().datetime().optional(),

  /**
   * Error message if status is 'error'.
   */
  errorMessage: z.string().optional(),

  /**
   * Configuration values set by the user for this package.
   * Keys correspond to the package's `configuration.properties`.
   */
  settings: z.record(z.string(), z.unknown()).optional(),

  /**
   * Upgrade history for this package.
   * Records each version migration with status and optional log.
   */
  upgradeHistory: z.array(z.object({
    /** Previous version before upgrade */
    fromVersion: z.string().describe('Version before upgrade'),
    /** New version after upgrade */
    toVersion: z.string().describe('Version after upgrade'),
    /** Timestamp of the upgrade */
    upgradedAt: z.string().datetime().describe('Upgrade timestamp'),
    /** Outcome of the upgrade */
    status: z.enum(['success', 'failed', 'rolled_back']).describe('Upgrade outcome'),
    /** Migration log entries */
    migrationLog: z.array(z.string()).optional().describe('Migration step logs'),
  })).optional().describe('Version upgrade history'),

  /**
   * Namespaces registered by this package.
   * Tracks which namespace prefixes are occupied by this package.
   */
  registeredNamespaces: z.array(z.string()).optional()
    .describe('Namespace prefixes registered by this package'),
});
export type InstalledPackage = z.infer<typeof InstalledPackageSchema>;

// ==========================================
// Namespace Registry
// ==========================================

/**
 * Namespace Registry Entry
 * Tracks namespace ownership within the platform instance.
 */
export const NamespaceRegistryEntrySchema = z.object({
  /** Namespace prefix */
  namespace: z.string().describe('Namespace prefix'),

  /** Package that owns this namespace */
  packageId: z.string().describe('Owning package ID'),

  /** Registration timestamp */
  registeredAt: z.string().datetime().describe('Registration timestamp'),

  /** Namespace status */
  status: z.enum(['active', 'disabled', 'reserved'])
    .describe('Namespace status'),
}).describe('Namespace ownership entry in the registry');

export type NamespaceRegistryEntry = z.infer<typeof NamespaceRegistryEntrySchema>;

/**
 * Namespace Conflict Error
 * Describes a namespace collision detected during package installation.
 */
export const NamespaceConflictErrorSchema = z.object({
  /** Error type discriminator */
  type: z.literal('namespace_conflict').describe('Error type'),

  /** Namespace that was requested */
  requestedNamespace: z.string().describe('Requested namespace'),

  /** ID of the package that already owns the namespace */
  conflictingPackageId: z.string().describe('Conflicting package ID'),

  /** Name of the conflicting package */
  conflictingPackageName: z.string().describe('Conflicting package display name'),

  /** Suggested alternative namespace */
  suggestion: z.string().optional()
    .describe('Suggested alternative namespace'),
}).describe('Namespace collision error during installation');

export type NamespaceConflictError = z.infer<typeof NamespaceConflictErrorSchema>;

// ==========================================
// Package Registry Request/Response Schemas
// ==========================================

/**
 * List Packages Request
 */
export const ListPackagesRequestSchema = z.object({
  /** Filter by status */
  status: PackageStatusEnum.optional(),
  /** Filter by package type */
  type: ManifestSchema.shape.type.optional(),
  /** Filter by enabled state */
  enabled: z.boolean().optional(),
});
export type ListPackagesRequest = z.infer<typeof ListPackagesRequestSchema>;

/**
 * List Packages Response
 */
export const ListPackagesResponseSchema = z.object({
  packages: z.array(InstalledPackageSchema),
  total: z.number(),
});
export type ListPackagesResponse = z.infer<typeof ListPackagesResponseSchema>;

/**
 * Get Package Request
 */
export const GetPackageRequestSchema = z.object({
  /** Package ID (reverse domain identifier from manifest) */
  id: z.string(),
});
export type GetPackageRequest = z.infer<typeof GetPackageRequestSchema>;

/**
 * Get Package Response
 */
export const GetPackageResponseSchema = z.object({
  package: InstalledPackageSchema,
});
export type GetPackageResponse = z.infer<typeof GetPackageResponseSchema>;

/**
 * Install Package Request
 * 
 * Accepts a full manifest to install. In a production system,
 * this might also accept a package ID to fetch from a marketplace.
 */
export const InstallPackageRequestSchema = z.object({
  /** The package manifest to install */
  manifest: ManifestSchema,
  /** Optional: user-provided settings at install time */
  settings: z.record(z.string(), z.unknown()).optional(),
  /** Whether to enable immediately after install (default: true) */
  enableOnInstall: z.boolean().default(true),
  /**
   * Current platform version for compatibility checking.
   * When provided, the system compares this against the package's
   * `engine.objectstack` requirement to verify compatibility.
   */
  platformVersion: z.string().optional()
    .describe('Current platform version for compatibility verification'),
});
export type InstallPackageRequest = z.infer<typeof InstallPackageRequestSchema>;

/**
 * Install Package Response
 */
export const InstallPackageResponseSchema = z.object({
  package: InstalledPackageSchema,
  message: z.string().optional(),
  /** Dependency resolution result (when dependencies were analyzed) */
  dependencyResolution: DependencyResolutionResultSchema.optional()
    .describe('Dependency resolution result from install analysis'),
});
export type InstallPackageResponse = z.infer<typeof InstallPackageResponseSchema>;

/**
 * Uninstall Package Request
 */
export const UninstallPackageRequestSchema = z.object({
  /** Package ID to uninstall */
  id: z.string(),
});
export type UninstallPackageRequest = z.infer<typeof UninstallPackageRequestSchema>;

/**
 * Uninstall Package Response
 */
export const UninstallPackageResponseSchema = z.object({
  id: z.string(),
  success: z.boolean(),
  message: z.string().optional(),
});
export type UninstallPackageResponse = z.infer<typeof UninstallPackageResponseSchema>;

/**
 * Enable Package Request
 */
export const EnablePackageRequestSchema = z.object({
  /** Package ID to enable */
  id: z.string(),
});
export type EnablePackageRequest = z.infer<typeof EnablePackageRequestSchema>;

/**
 * Enable Package Response
 */
export const EnablePackageResponseSchema = z.object({
  package: InstalledPackageSchema,
  message: z.string().optional(),
});
export type EnablePackageResponse = z.infer<typeof EnablePackageResponseSchema>;

/**
 * Disable Package Request
 */
export const DisablePackageRequestSchema = z.object({
  /** Package ID to disable */
  id: z.string(),
});
export type DisablePackageRequest = z.infer<typeof DisablePackageRequestSchema>;

/**
 * Disable Package Response
 */
export const DisablePackageResponseSchema = z.object({
  package: InstalledPackageSchema,
  message: z.string().optional(),
});
export type DisablePackageResponse = z.infer<typeof DisablePackageResponseSchema>;
