import { z } from 'zod';
import { FieldSchema } from './field.zod';
import { ValidationRuleSchema } from './validation.zod';
import { ExtensionsMapSchema } from '../system/extension.zod';

/**
 * Capability Flags
 * Defines what system features are enabled for this object.
 * 
 * Optimized based on industry standards (Salesforce, ServiceNow):
 * - Added `activities` (Tasks/Events)
 * - Added `mru` (Recent Items)
 * - Added `feeds` (Social/Chatter)
 * - Grouped API permissions
 */
export const ObjectCapabilities = z.object({
  /** Enable history tracking (Audit Trail) */
  trackHistory: z.boolean().default(false).describe('Enable field history tracking for audit compliance'),
  
  /** Enable global search indexing */
  searchable: z.boolean().default(true).describe('Index records for global search'),
  
  /** Enable REST/GraphQL API access */
  apiEnabled: z.boolean().default(true).describe('Expose object via automatic APIs'),

  /** 
   * API Supported Operations
   * Granular control over API exposure.
   */
  apiMethods: z.array(z.enum([
    'get', 'list',          // Read
    'create', 'update', 'delete', // Write
    'upsert',               // Idempotent Write
    'bulk',                 // Batch operations
    'aggregate',            // Analytics (count, sum)
    'history',              // Audit access
    'search',               // Search access
    'restore', 'purge',     // Trash management
    'import', 'export',     // Data portability
  ])).optional().describe('Whitelist of allowed API operations'),
  
  /** Enable standard attachments/files engine */
  files: z.boolean().default(false).describe('Enable file attachments and document management'),
  
  /** Enable social collaboration (Comments, Mentions, Feeds) */
  feeds: z.boolean().default(false).describe('Enable social feed, comments, and mentions (Chatter-like)'),
  
  /** Enable standard Activity suite (Tasks, Calendars, Events) */
  activities: z.boolean().default(false).describe('Enable standard tasks and events tracking'),
  
  /** Enable Recycle Bin / Soft Delete */
  trash: z.boolean().default(true).describe('Enable soft-delete with restore capability'),

  /** Enable "Recently Viewed" tracking */
  mru: z.boolean().default(true).describe('Track Most Recently Used (MRU) list for users'),
  
  /** Allow cloning records */
  clone: z.boolean().default(true).describe('Allow record deep cloning'),
});

/**
 * Schema for database indexes.
 */
export const IndexSchema = z.object({
  name: z.string().optional().describe('Index name'),
  fields: z.array(z.string()).describe('Fields included in the index'),
  unique: z.boolean().optional().describe('Whether the index is unique'),
  type: z.enum(['btree', 'hash', 'gin', 'gist']).optional().describe('Index type (default: btree)'),
});

/**
 * Search Configuration
 * Defines how this object behaves in search results.
 */
export const SearchConfigSchema = z.object({
  fields: z.array(z.string()).describe('Fields to index for full-text search weighting'),
  displayFields: z.array(z.string()).optional().describe('Fields to display in search result cards'),
  filters: z.array(z.string()).optional().describe('Default filters for search results'),
});

/**
 * Base Object Schema Definition
 * 
 * The Blueprint of a Business Object.
 * Represents a table, a collection, or a virtual entity.
 */
const ObjectSchemaBase = z.object({
  /** 
   * Identity & Metadata 
   */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Machine unique key (snake_case). Immutable.'),
  label: z.string().optional().describe('Human readable singular label (e.g. "Account")'),
  pluralLabel: z.string().optional().describe('Human readable plural label (e.g. "Accounts")'),
  description: z.string().optional().describe('Developer documentation / description'),
  icon: z.string().optional().describe('Icon name (Lucide/Material) for UI representation'),
  
  /**
   * Taxonomy & Organization
   */
  tags: z.array(z.string()).optional().describe('Categorization tags (e.g. "sales", "system", "reference")'),
  active: z.boolean().default(true).describe('Is the object active and usable'),
  isSystem: z.boolean().default(false).describe('Is system object (protected from deletion)'),
  abstract: z.boolean().default(false).describe('Is abstract base object (cannot be instantiated)'),

  /** 
   * Storage & Virtualization 
   */
  datasource: z.string().default('default').describe('Target Datasource ID. "default" is the primary DB.'),
  tableName: z.string().optional().describe('Physical table/collection name in the target datasource'),
  
  /** 
   * Data Model 
   */
  fields: z.record(FieldSchema).describe('Field definitions map'),
  indexes: z.array(IndexSchema).optional().describe('Database performance indexes'),
  
  /**
   * Logic & Validation (Co-located)
   * Best Practice: Define rules close to data.
   */
  validations: z.array(ValidationRuleSchema).optional().describe('Object-level validation rules'),

  /** 
   * Display & UI Hints (Data-Layer)
   */
  titleFormat: z.string().optional().describe('Title expression (e.g. "{name} - {code}"). Overrides nameField.'),
  compactLayout: z.array(z.string()).optional().describe('Primary fields for hover/cards/lookups'),
  
  /** 
   * Search Engine Config 
   */
  search: SearchConfigSchema.optional().describe('Search engine configuration'),
  
  /** 
   * System Capabilities 
   */
  enable: ObjectCapabilities.optional().describe('Enabled system features modules'),

  /**
   * Extensions
   * 
   * Custom extension properties from plugins and modules.
   * Use namespaced keys (e.g., 'ai_assistant.enableRAG', 'workflow_engine.autoApprovalRules').
   * 
   * @example
   * {
   *   'ai_assistant.enableRAG': true,
   *   'ai_assistant.contextFields': ['name', 'description', 'notes'],
   *   'ai_assistant.embeddingModel': 'text-embedding-3-small',
   *   'workflow_engine.autoApprovalRules': [...]
   * }
   */
  extensions: ExtensionsMapSchema,
});

/**
 * Enhanced ObjectSchema with Factory
 */
export const ObjectSchema = Object.assign(ObjectSchemaBase, {
  create: <T extends z.input<typeof ObjectSchemaBase>>(config: T) => config,
});

export type ServiceObject = z.infer<typeof ObjectSchemaBase>;
export type ObjectCapabilities = z.infer<typeof ObjectCapabilities>;
export type ObjectIndex = z.infer<typeof IndexSchema>;
