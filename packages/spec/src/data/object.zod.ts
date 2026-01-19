import { z } from 'zod';
import { FieldSchema } from './field.zod';

/**
 * Capability Flags
 * Defines what system features are enabled for this object.
 */
export const ObjectCapabilities = z.object({
  /** Enable history tracking (Audit Trail) */
  trackHistory: z.boolean().default(false),
  
  /** Enable global search indexing */
  searchable: z.boolean().default(true),
  
  /** Enable REST/GraphQL API access */
  apiEnabled: z.boolean().default(true),
  
  /** Enable attachments/files */
  files: z.boolean().default(false),
  
  /** Enable discussions/chatter */
  feedEnabled: z.boolean().default(false),
  
  /** Enable Recycle Bin mechanics */
  trash: z.boolean().default(true),
});

/**
 * Schema for database indexes.
 */
export const IndexSchema = z.object({
  name: z.string().optional().describe('Index name'),
  fields: z.array(z.string()).describe('Fields included in the index'),
  unique: z.boolean().optional().describe('Whether the index is unique'),
});

/**
 * Base Object Schema Definition
 */
const ObjectSchemaBase = z.object({
  /** Identify */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Machine name (snake_case)'),
  label: z.string().optional().describe('Singular Label (e.g. "Account")'),
  pluralLabel: z.string().optional().describe('Plural Label (e.g. "Accounts")'),
  description: z.string().optional().describe('Internal description'),
  icon: z.string().optional().describe('Lucide icon name'),

  /** 
   * Storage / Virtualization Config 
   * Defines where the data actually lives.
   */
  datasource: z.string().default('default').describe('Target Datasource ID (e.g. "postgres", "salesforce"). references sys_datasource.'),
  tableName: z.string().optional().describe('Physical table/collection name in the target datasource'),
  isSystem: z.boolean().default(false).describe('Is system object (protected)'),
  
  /** Fields Definition */
  fields: z.record(FieldSchema).describe('Map of field definitions'),
  
  /** Indexes */
  indexes: z.array(IndexSchema).optional().describe('Database indexes definition'),
  
  /** Key Fields */
  nameField: z.string().optional().describe('Which field represents the record name/title (usually "name")'),
  
  /** Features & Capabilities */
  enable: ObjectCapabilities.optional().describe('Enabled system capabilities'),
});

/**
 * Enhanced ObjectSchema with Factory
 */
export const ObjectSchema = Object.assign(ObjectSchemaBase, {
  create: <T extends z.input<typeof ObjectSchemaBase>>(config: T) => config,
});

export type ServiceObject = z.infer<typeof ObjectSchemaBase>;
