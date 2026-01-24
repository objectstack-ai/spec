import { z } from 'zod';
import { ManifestSchema } from './manifest.zod';

/**
 * # Cloud Composer Protocol
 * 
 * Defines the interface for the ObjectStack Composer Service.
 * The Composer is responsible for "compiling" a Tenant's configuration (BOM)
 * into a single executable System Manifest.
 */

/**
 * Dependency Requirement
 * Specifies a plugin and its version constraints.
 */
export const DependencyRequirementSchema = z.object({
  id: z.string().describe('Plugin ID (e.g. "com.example.crm")'),
  version: z.string().default('latest').describe('SemVer range or "latest"'),
  
  /**
   * Configuration Overrides
   * Tenant-specific settings that override plugin defaults.
   * Example: { "currency": "USD", "apiKey": "..." }
   */
  configuration: z.record(z.any()).optional().describe('Configuration overrides'),
  
  /**
   * Feature Flags
   * Enable/Disable specific features within the plugin.
   */
  features: z.record(z.boolean()).optional().describe('Feature toggles'),
});

/**
 * Bill of Materials (BOM)
 * The "Shopping List" for a specific tenant.
 * Represents the high-level intent of what the tenant wants to install.
 */
export const BillOfMaterialsSchema = z.object({
  tenantId: z.string().describe('Target Tenant ID'),
  
  /**
   * List of installed plugins/apps.
   * implementation order matters (later plugins override earlier ones by default).
   */
  dependencies: z.array(DependencyRequirementSchema).describe('Installed packages'),
  
  /**
   * Environment Variables injection.
   * Maps abstract keys to secure vault references or concrete values.
   */
  environment: z.record(z.string()).optional(),
  
  /**
   * Global Resolution Strategy
   * How to handle conflicts when multiple plugins define the same resource.
   */
  resolutionStrategy: z.enum(['strict', 'override', 'merge']).default('override')
    .describe('Conflict resolution strategy (strict=fail, override=last-wins, merge=deep-merge)'),
});

/**
 * Conflict Report
 * Detailed information about collision during composition.
 */
export const ConflictReportSchema = z.object({
  resourceType: z.enum(['object', 'field', 'api', 'ui']).describe('Type of colliding resource'),
  resourceId: z.string().describe('ID of the resource'),
  sources: z.array(z.string()).describe('List of plugin IDs defining this resource'),
  resolution: z.string().describe('How it was resolved (e.g. "com.example.erp won")'),
  severity: z.enum(['info', 'warning', 'error']).describe('Severity of the conflict'),
});

/**
 * Composer Request
 * The RPC payload sent to the Composer Service.
 */
export const ComposerRequestSchema = z.object({
  bom: BillOfMaterialsSchema,
  
  /**
   * Target Runtime Version
   * Ensure generated manifest is compatible with the specific runtime version.
   */
  runtimeVersion: z.string().optional(),
  
  /**
   * Dry Run
   * If true, generates report but does not persist the manifest.
   */
  dryRun: z.boolean().default(false),
});

/**
 * Composer Response
 * The result of the compilation process.
 */
export const ComposerResponseSchema = z.object({
  success: z.boolean(),
  
  /**
   * The Holy Grail: The Executable System Manifest.
   * This is what the Runtime loads to boot.
   */
  manifest: ManifestSchema.optional().describe('The compiled System Manifest'),
  
  /**
   * Compilation Metadata
   */
  buildId: z.string(),
  timestamp: z.string().datetime(),
  duration: z.number().describe('Compilation time in ms'),
  
  /**
   * Analysis
   */
  conflicts: z.array(ConflictReportSchema).optional(),
  errors: z.array(z.string()).optional(),
});

export type BillOfMaterials = z.infer<typeof BillOfMaterialsSchema>;
export type ComposerRequest = z.infer<typeof ComposerRequestSchema>;
export type ComposerResponse = z.infer<typeof ComposerResponseSchema>;
