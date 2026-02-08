import { z } from 'zod';
import {
  TimestampedSchema,
  AuditableSchema,
  SoftDeletableSchema,
  NamedEntitySchema,
  VersionableSchema,
  TaggableSchema,
  OwnableSchema,
  ActivatableSchema,
  MetadataContainerSchema,
} from '../shared/base-schemas.zod.js';
import {
  SnakeCaseString,
  EmailString,
  UuidString,
  LENGTH_CONSTRAINTS,
} from '../shared/validation-patterns.zod.js';

/**
 * Example Schema Demonstrating Best Practices
 * 
 * This file demonstrates how to use shared base schemas and validation patterns
 * to create consistent, well-documented, and type-safe Zod schemas.
 * 
 * **Use this as a reference when creating new schemas.**
 */

/**
 * Example 1: Simple Entity with Timestamps
 * 
 * Use TimestampedSchema for entities that only need creation/update tracking.
 */
export const ArticleSchema = TimestampedSchema.extend({
  id: UuidString.describe('Unique article identifier'),
  title: z
    .string()
    .min(LENGTH_CONSTRAINTS.SHORT_TEXT.min)
    .max(LENGTH_CONSTRAINTS.SHORT_TEXT.max)
    .describe('Article title (1-255 characters)'),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Must be a valid URL slug (e.g., "my-article")',
    })
    .describe('URL-friendly article slug'),
  content: z
    .string()
    .min(LENGTH_CONSTRAINTS.MEDIUM_TEXT.min)
    .max(LENGTH_CONSTRAINTS.LONG_TEXT.max)
    .describe('Article content (Markdown or HTML)'),
  status: z
    .enum(['draft', 'published', 'archived'])
    .default('draft')
    .describe('Publication status'),
});

export type Article = z.infer<typeof ArticleSchema>;
export type ArticleInput = z.input<typeof ArticleSchema>;

/**
 * Example 2: Auditable Entity
 * 
 * Use AuditableSchema for entities requiring full audit trail (who + when).
 */
export const ProjectSchema = AuditableSchema.extend({
  id: UuidString.describe('Unique project identifier'),
  name: SnakeCaseString.min(LENGTH_CONSTRAINTS.IDENTIFIER.min)
    .max(LENGTH_CONSTRAINTS.IDENTIFIER.max)
    .describe('Machine-readable project name (snake_case, 2-64 chars)'),
  displayName: z
    .string()
    .min(LENGTH_CONSTRAINTS.SHORT_TEXT.min)
    .max(LENGTH_CONSTRAINTS.SHORT_TEXT.max)
    .describe('Human-readable project display name'),
  description: z
    .string()
    .max(LENGTH_CONSTRAINTS.MEDIUM_TEXT.max)
    .optional()
    .describe('Project description (max 1000 chars)'),
  status: z
    .enum(['planning', 'active', 'on_hold', 'completed', 'cancelled'])
    .default('planning')
    .describe('Current project status'),
  priority: z
    .enum(['low', 'medium', 'high', 'critical'])
    .default('medium')
    .describe('Project priority level'),
  dueDate: z
    .string()
    .datetime()
    .optional()
    .describe('Project due date (ISO 8601 format)'),
});

export type Project = z.infer<typeof ProjectSchema>;
export type ProjectInput = z.input<typeof ProjectSchema>;

/**
 * Example 3: Soft Deletable Entity
 * 
 * Use SoftDeletableSchema for entities that need soft delete (archive instead of remove).
 */
export const CustomerSchema = SoftDeletableSchema.extend({
  id: UuidString.describe('Unique customer identifier'),
  email: EmailString.describe('Customer email address'),
  name: z
    .string()
    .min(1)
    .max(LENGTH_CONSTRAINTS.SHORT_TEXT.max)
    .describe('Customer full name'),
  company: z
    .string()
    .max(LENGTH_CONSTRAINTS.SHORT_TEXT.max)
    .optional()
    .describe('Company name'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, {
      message: 'Must be a valid international phone number',
    })
    .optional()
    .describe('Customer phone number (E.164 format)'),
  tier: z
    .enum(['free', 'starter', 'professional', 'enterprise'])
    .default('free')
    .describe('Customer subscription tier'),
});

export type Customer = z.infer<typeof CustomerSchema>;
export type CustomerInput = z.input<typeof CustomerSchema>;

/**
 * Example 4: Named Entity (Machine Name + Human Label)
 * 
 * Use NamedEntitySchema for metadata entities with both technical and display names.
 */
export const CustomFieldSchema = NamedEntitySchema.extend({
  id: UuidString.describe('Unique field identifier'),
  objectName: SnakeCaseString.describe('Parent object machine name (e.g., "crm_account")'),
  type: z
    .enum(['text', 'number', 'boolean', 'date', 'select', 'multiselect'])
    .describe('Field data type'),
  required: z
    .boolean()
    .default(false)
    .describe('Whether this field is mandatory'),
  defaultValue: z
    .unknown()
    .optional()
    .describe('Default value for new records'),
  validationRules: z
    .array(
      z.object({
        type: z.enum(['regex', 'min', 'max', 'email', 'url']),
        value: z.unknown(),
        message: z.string(),
      })
    )
    .optional()
    .describe('Validation rules for this field'),
});

export type CustomField = z.infer<typeof CustomFieldSchema>;
export type CustomFieldInput = z.input<typeof CustomFieldSchema>;

/**
 * Example 5: Versionable Entity
 * 
 * Use VersionableSchema for entities with semantic versioning.
 */
export const PluginManifestSchema = VersionableSchema.extend({
  id: UuidString.describe('Unique plugin identifier'),
  name: SnakeCaseString.min(LENGTH_CONSTRAINTS.IDENTIFIER.min)
    .max(LENGTH_CONSTRAINTS.IDENTIFIER.max)
    .describe('Plugin machine name (snake_case, 2-64 chars)'),
  displayName: z
    .string()
    .min(1)
    .max(LENGTH_CONSTRAINTS.SHORT_TEXT.max)
    .describe('Plugin display name'),
  description: z
    .string()
    .max(LENGTH_CONSTRAINTS.MEDIUM_TEXT.max)
    .describe('Plugin description'),
  author: z.string().describe('Plugin author name or organization'),
  license: z
    .string()
    .default('MIT')
    .describe('SPDX license identifier'),
  dependencies: z
    .record(z.string(), z.string())
    .default({})
    .describe('Plugin dependencies (name → semver range)'),
});

export type PluginManifest = z.infer<typeof PluginManifestSchema>;
export type PluginManifestInput = z.input<typeof PluginManifestSchema>;

/**
 * Example 6: Taggable Entity
 * 
 * Use TaggableSchema for entities with free-form classification.
 */
export const DocumentSchema = TaggableSchema.merge(AuditableSchema).extend({
  id: UuidString.describe('Unique document identifier'),
  title: z
    .string()
    .min(1)
    .max(LENGTH_CONSTRAINTS.SHORT_TEXT.max)
    .describe('Document title'),
  filename: z.string().describe('Original filename'),
  mimeType: z.string().describe('MIME type (e.g., "application/pdf")'),
  size: z.number().positive().describe('File size in bytes'),
  storageUrl: z.string().url().describe('Cloud storage URL'),
  category: z
    .enum(['contract', 'invoice', 'report', 'presentation', 'other'])
    .default('other')
    .describe('Document category'),
});

export type Document = z.infer<typeof DocumentSchema>;
export type DocumentInput = z.input<typeof DocumentSchema>;

/**
 * Example 7: Ownable Entity
 * 
 * Use OwnableSchema for entities with ownership tracking.
 */
export const WorkspaceSchema = OwnableSchema.merge(AuditableSchema).extend({
  id: UuidString.describe('Unique workspace identifier'),
  name: z
    .string()
    .min(1)
    .max(LENGTH_CONSTRAINTS.SHORT_TEXT.max)
    .describe('Workspace name'),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Must be a valid URL slug',
    })
    .describe('URL-friendly workspace slug'),
  description: z
    .string()
    .max(LENGTH_CONSTRAINTS.MEDIUM_TEXT.max)
    .optional()
    .describe('Workspace description'),
  visibility: z
    .enum(['private', 'team', 'organization', 'public'])
    .default('private')
    .describe('Workspace visibility level'),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;
export type WorkspaceInput = z.input<typeof WorkspaceSchema>;

/**
 * Example 8: Activatable Entity
 * 
 * Use ActivatableSchema for entities that can be enabled/disabled.
 */
export const IntegrationSchema = ActivatableSchema.merge(AuditableSchema).extend({
  id: UuidString.describe('Unique integration identifier'),
  name: SnakeCaseString.describe('Integration machine name'),
  provider: z
    .enum(['salesforce', 'hubspot', 'stripe', 'slack', 'github', 'jira'])
    .describe('Integration provider'),
  apiKey: z.string().describe('API key or access token'),
  apiSecret: z.string().optional().describe('API secret (if required)'),
  webhookUrl: z.string().url().optional().describe('Webhook endpoint URL'),
  config: z.record(z.string(), z.unknown()).describe('Provider-specific configuration'),
  lastSyncAt: z
    .string()
    .datetime()
    .optional()
    .describe('Last successful sync timestamp'),
  syncStatus: z
    .enum(['never', 'success', 'failed', 'in_progress'])
    .default('never')
    .describe('Last sync operation status'),
});

export type Integration = z.infer<typeof IntegrationSchema>;
export type IntegrationInput = z.input<typeof IntegrationSchema>;

/**
 * Example 9: Entity with Extensible Metadata
 * 
 * Use MetadataContainerSchema for entities with custom extensible properties.
 */
export const EventSchema = MetadataContainerSchema.merge(TimestampedSchema).extend({
  id: UuidString.describe('Unique event identifier'),
  type: z
    .string()
    .regex(/^[a-z][a-z0-9_.]*$/, {
      message: 'Must use dot notation (e.g., "user.login", "order.created")',
    })
    .describe('Event type (dot notation for namespacing)'),
  source: z.string().describe('Event source system or service'),
  userId: z.string().optional().describe('User who triggered the event'),
  sessionId: z.string().optional().describe('Session identifier'),
  payload: z.record(z.string(), z.unknown()).describe('Event-specific data payload'),
  severity: z
    .enum(['debug', 'info', 'warning', 'error', 'critical'])
    .default('info')
    .describe('Event severity level'),
});

export type Event = z.infer<typeof EventSchema>;
export type EventInput = z.input<typeof EventSchema>;

/**
 * Example 10: Complex Composition
 * 
 * Combine multiple base schemas for rich entity models.
 */
export const ResourceSchema = NamedEntitySchema.merge(AuditableSchema)
  .merge(TaggableSchema)
  .merge(OwnableSchema)
  .merge(ActivatableSchema)
  .extend({
    id: UuidString.describe('Unique resource identifier'),
    type: z
      .enum(['document', 'image', 'video', 'dataset', 'model'])
      .describe('Resource type'),
    url: z.string().url().describe('Resource access URL'),
    size: z.number().positive().describe('Resource size in bytes'),
    checksum: z.string().describe('Resource integrity checksum (SHA-256)'),
    expiresAt: z
      .string()
      .datetime()
      .optional()
      .describe('Resource expiration timestamp (for temporary resources)'),
  });

export type Resource = z.infer<typeof ResourceSchema>;
export type ResourceInput = z.input<typeof ResourceSchema>;

/**
 * Best Practices Summary
 * 
 * 1. **Always use base schemas** instead of duplicating timestamp/audit fields
 * 2. **Export both z.infer and z.input types** for schemas with .default() or .transform()
 * 3. **Use validation patterns** from shared/validation-patterns.zod.ts
 * 4. **Apply LENGTH_CONSTRAINTS** for consistent string length validation
 * 5. **Add .describe() to all fields** with clear, concise explanations
 * 6. **Use discriminated unions** for polymorphic types
 * 7. **Document enum values** inline or with JSDoc comments
 * 8. **Use snake_case for machine names**, any case for display names
 * 9. **Prefer composition over duplication** - use .merge() and .extend()
 * 10. **Keep schemas focused** - one responsibility per schema
 */
