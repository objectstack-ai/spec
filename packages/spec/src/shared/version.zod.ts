import { z } from 'zod';

/**
 * Version Schemas
 * 
 * Standardized version schemas for package versioning across ObjectStack.
 * Supports semantic versioning (SemVer) and other common versioning patterns.
 * 
 * Used by:
 * - system/manifest.zod.ts (Package versions)
 * - system/plugin.zod.ts (Plugin versions)
 * - hub/marketplace.zod.ts (Marketplace versions)
 * 
 * @see https://semver.org/ - Semantic Versioning 2.0.0
 */

// ==========================================
// Semantic Version (SemVer)
// ==========================================

/**
 * Semantic Version Schema (SemVer 2.0.0)
 * 
 * Validates semantic version strings in the format: MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
 * 
 * **Format:** `X.Y.Z` where X, Y, and Z are non-negative integers
 * - X = MAJOR version (incompatible API changes)
 * - Y = MINOR version (backwards-compatible functionality)
 * - Z = PATCH version (backwards-compatible bug fixes)
 * 
 * Optional:
 * - PRERELEASE: `-alpha.1`, `-beta.2`, `-rc.1`
 * - BUILD: `+20130313144700`, `+exp.sha.5114f85`
 * 
 * @example Valid versions
 * - '1.0.0'
 * - '0.1.0'
 * - '2.1.3'
 * - '1.0.0-alpha'
 * - '1.0.0-alpha.1'
 * - '1.0.0-0.3.7'
 * - '1.0.0-x.7.z.92'
 * - '1.0.0+20130313144700'
 * - '1.0.0-beta+exp.sha.5114f85'
 * 
 * @example Invalid versions
 * - '1' (missing minor and patch)
 * - '1.0' (missing patch)
 * - 'v1.0.0' (no 'v' prefix allowed)
 * - '1.0.0.' (trailing dot)
 */
export const SemanticVersionSchema = z
  .string()
  .regex(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
    {
      message: 'Version must follow semantic versioning format (e.g., "1.0.0", "1.0.0-alpha.1", "1.0.0+build.123")',
    }
  )
  .describe('Semantic version (SemVer 2.0.0)');

export type SemanticVersion = z.infer<typeof SemanticVersionSchema>;

// ==========================================
// Version Range
// ==========================================

/**
 * Version Range Schema
 * 
 * Supports common version range patterns used in package dependencies.
 * 
 * **Patterns:**
 * - Exact: `1.0.0`
 * - Caret: `^1.0.0` (compatible with version, allows changes that do not modify the left-most non-zero digit)
 * - Tilde: `~1.0.0` (allows patch-level changes)
 * - Wildcard: `1.0.*` or `1.*` or `*`
 * - Comparison: `>=1.0.0`, `>1.0.0`, `<=2.0.0`, `<2.0.0`
 * - Range: `>=1.0.0 <2.0.0` or `1.0.0 - 2.0.0`
 * 
 * @example Valid ranges
 * - '1.0.0' (exact)
 * - '^1.0.0' (caret - allows 1.x.x)
 * - '~1.0.0' (tilde - allows 1.0.x)
 * - '>=1.0.0' (greater than or equal)
 * - '*' (any version)
 * - '1.x' (any 1.x.x version)
 */
export const VersionRangeSchema = z
  .string()
  .min(1, { message: 'Version range cannot be empty' })
  .describe('Version range (e.g., "^1.0.0", ">=1.0.0 <2.0.0", "*")');

export type VersionRange = z.infer<typeof VersionRangeSchema>;

// ==========================================
// Version Comparison
// ==========================================

/**
 * Version Constraint Schema
 * 
 * Represents a version constraint with an operator and version.
 * 
 * @example
 * ```typescript
 * {
 *   operator: '>=',
 *   version: '1.0.0'
 * }
 * ```
 */
export const VersionConstraintSchema = z.object({
  /**
   * Comparison operator
   */
  operator: z.enum(['=', '>', '>=', '<', '<=', '^', '~']).describe('Comparison operator'),
  
  /**
   * Version to compare against
   */
  version: SemanticVersionSchema.describe('Version to compare against'),
});

export type VersionConstraint = z.infer<typeof VersionConstraintSchema>;

// ==========================================
// Release Channel
// ==========================================

/**
 * Release Channel Enum
 * 
 * Defines the stability/maturity level of a release.
 * Used for versioning and update strategies.
 */
export const ReleaseChannelSchema = z.enum([
  'stable',      // Production-ready releases
  'beta',        // Feature-complete but may have bugs
  'alpha',       // Early preview, unstable
  'nightly',     // Daily builds from main branch
  'canary',      // Bleeding edge, may be broken
]);

export type ReleaseChannel = z.infer<typeof ReleaseChannelSchema>;

// ==========================================
// Version Metadata
// ==========================================

/**
 * Version Metadata Schema
 * 
 * Extended version information including channel, build info, and timestamps.
 * 
 * @example
 * ```typescript
 * {
 *   version: '1.2.3',
 *   channel: 'stable',
 *   buildNumber: '12345',
 *   gitCommit: 'a1b2c3d',
 *   publishedAt: '2024-01-15T10:30:00Z'
 * }
 * ```
 */
export const VersionMetadataSchema = z.object({
  /**
   * Semantic version string
   */
  version: SemanticVersionSchema.describe('Semantic version'),
  
  /**
   * Release channel
   */
  channel: ReleaseChannelSchema.default('stable').describe('Release channel'),
  
  /**
   * Build number (optional)
   */
  buildNumber: z.string().optional().describe('Build number'),
  
  /**
   * Git commit SHA (optional)
   */
  gitCommit: z.string().optional().describe('Git commit SHA'),
  
  /**
   * Publication timestamp (ISO 8601)
   */
  publishedAt: z.string().datetime().optional().describe('Publication timestamp (ISO 8601)'),
  
  /**
   * Custom metadata
   */
  metadata: z.record(z.string(), z.any()).optional().describe('Custom metadata'),
});

export type VersionMetadata = z.infer<typeof VersionMetadataSchema>;
