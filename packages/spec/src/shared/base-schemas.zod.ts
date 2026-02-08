import { z } from 'zod';
import { SnakeCaseIdentifierSchema } from './identifiers.zod.js';

/**
 * Shared Base Schemas for ObjectStack
 * 
 * This module provides reusable base schemas that can be extended or composed
 * across the codebase to ensure consistency and reduce duplication.
 * 
 * **Design Principle:** Define once, compose everywhere.
 */

/**
 * Timestamped Schema
 * 
 * Base schema for entities that track creation and modification timestamps.
 * Uses ISO 8601 datetime strings for JSON serialization compatibility.
 * 
 * @example
 * ```typescript
 * const UserSchema = TimestampedSchema.extend({
 *   id: z.string(),
 *   email: z.string().email()
 * });
 * ```
 */
export const TimestampedSchema = z.object({
  createdAt: z
    .string()
    .datetime()
    .describe('ISO 8601 timestamp when the entity was created'),
  updatedAt: z
    .string()
    .datetime()
    .describe('ISO 8601 timestamp when the entity was last updated'),
});

/**
 * Auditable Schema
 * 
 * Extends TimestampedSchema with user tracking for audit trail purposes.
 * Captures both who and when for all mutations.
 * 
 * @example
 * ```typescript
 * const AccountSchema = AuditableSchema.extend({
 *   id: z.string(),
 *   name: z.string()
 * });
 * ```
 */
export const AuditableSchema = TimestampedSchema.extend({
  createdBy: z
    .string()
    .describe('User ID or system identifier who created the entity'),
  updatedBy: z
    .string()
    .describe('User ID or system identifier who last updated the entity'),
});

/**
 * Soft Deletable Schema
 * 
 * Extends AuditableSchema with soft delete tracking.
 * When deletedAt is present, the entity is considered deleted but remains in storage.
 * 
 * @example
 * ```typescript
 * const ProjectSchema = SoftDeletableSchema.extend({
 *   id: z.string(),
 *   name: z.string()
 * });
 * ```
 */
export const SoftDeletableSchema = AuditableSchema.extend({
  deletedAt: z
    .string()
    .datetime()
    .optional()
    .describe(
      'ISO 8601 timestamp when the entity was soft-deleted. Null if not deleted.',
    ),
  deletedBy: z
    .string()
    .optional()
    .describe('User ID who soft-deleted the entity. Null if not deleted.'),
});

/**
 * Named Entity Schema
 * 
 * Base schema for entities with both machine name and human-readable label.
 * Enforces the ObjectStack naming convention: snake_case for machine names, any case for labels.
 * 
 * @example
 * ```typescript
 * const FieldSchema = NamedEntitySchema.extend({
 *   type: z.enum(['text', 'number', 'boolean'])
 * });
 * ```
 */
export const NamedEntitySchema = z.object({
  name: SnakeCaseIdentifierSchema.describe(
    'Machine-readable identifier (snake_case)',
  ),
  label: z
    .string()
    .min(1)
    .describe('Human-readable display name (any case)'),
  description: z
    .string()
    .optional()
    .describe('Detailed explanation of the entity purpose and usage'),
});

/**
 * Versionable Schema
 * 
 * Schema for entities that support versioning.
 * Useful for metadata, documents, and configuration that need change tracking.
 * 
 * @example
 * ```typescript
 * const PluginManifestSchema = VersionableSchema.extend({
 *   id: z.string(),
 *   dependencies: z.array(z.string())
 * });
 * ```
 */
export const VersionableSchema = z.object({
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+(-[a-z0-9.]+)?$/, {
      message: 'Version must follow semantic versioning (e.g., "1.0.0")',
    })
    .describe('Semantic version number (e.g., "1.2.3" or "2.0.0-beta.1")'),
  versionHistory: z
    .array(
      z.object({
        version: z.string().describe('Version number'),
        timestamp: z.string().datetime().describe('When this version was created'),
        author: z.string().describe('Who created this version'),
        changelog: z.string().optional().describe('Description of changes'),
      }),
    )
    .optional()
    .describe('Historical record of all versions'),
});

/**
 * Taggable Schema
 * 
 * Schema for entities that support free-form tagging/labeling.
 * Useful for classification, search, and organization.
 * 
 * @example
 * ```typescript
 * const AssetSchema = TaggableSchema.extend({
 *   id: z.string(),
 *   url: z.string().url()
 * });
 * ```
 */
export const TaggableSchema = z.object({
  tags: z
    .array(z.string().min(1).describe('Individual tag value'))
    .optional()
    .describe('Free-form tags for categorization and search'),
});

/**
 * Ownable Schema
 * 
 * Schema for entities with ownership and basic permissions.
 * Supports individual owner and optional group ownership.
 * 
 * @example
 * ```typescript
 * const DocumentSchema = OwnableSchema.extend({
 *   id: z.string(),
 *   content: z.string()
 * });
 * ```
 */
export const OwnableSchema = z.object({
  ownerId: z
    .string()
    .describe('User ID of the entity owner'),
  ownerType: z
    .enum(['user', 'team', 'organization'])
    .default('user')
    .describe('Type of owner (user, team, or organization)'),
  groupId: z
    .string()
    .optional()
    .describe('Optional group/team ID for shared ownership'),
});

/**
 * Activatable Schema
 * 
 * Schema for entities that can be enabled/disabled.
 * Useful for feature flags, plugins, integrations, and scheduled tasks.
 * 
 * @example
 * ```typescript
 * const IntegrationSchema = ActivatableSchema.extend({
 *   id: z.string(),
 *   apiKey: z.string()
 * });
 * ```
 */
export const ActivatableSchema = z.object({
  active: z
    .boolean()
    .default(true)
    .describe('Whether the entity is currently active/enabled'),
  activatedAt: z
    .string()
    .datetime()
    .optional()
    .describe('When the entity was last activated'),
  deactivatedAt: z
    .string()
    .datetime()
    .optional()
    .describe('When the entity was last deactivated'),
});

/**
 * Metadata Container Schema
 * 
 * Generic container for extensible metadata.
 * Uses z.unknown() for type safety (requires runtime type narrowing).
 * 
 * @example
 * ```typescript
 * const EventSchema = MetadataContainerSchema.extend({
 *   id: z.string(),
 *   type: z.string()
 * });
 * ```
 */
export const MetadataContainerSchema = z.object({
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .describe(
      'Extensible metadata container for custom properties. Use type narrowing to access values.',
    ),
});

/**
 * Type Exports
 */
export type Timestamped = z.infer<typeof TimestampedSchema>;
export type Auditable = z.infer<typeof AuditableSchema>;
export type SoftDeletable = z.infer<typeof SoftDeletableSchema>;
export type NamedEntity = z.infer<typeof NamedEntitySchema>;
export type Versionable = z.infer<typeof VersionableSchema>;
export type Taggable = z.infer<typeof TaggableSchema>;
export type Ownable = z.infer<typeof OwnableSchema>;
export type Activatable = z.infer<typeof ActivatableSchema>;
export type MetadataContainer = z.infer<typeof MetadataContainerSchema>;

/**
 * Input Type Exports
 * 
 * For schemas with .default() values, also export input types.
 */
export type ActivatableInput = z.input<typeof ActivatableSchema>;
export type OwnableInput = z.input<typeof OwnableSchema>;
