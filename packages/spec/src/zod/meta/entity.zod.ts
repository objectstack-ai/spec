import { z } from 'zod';
import { FieldSchema } from './field.zod';

/**
 * Schema for database indexes.
 */
export const IndexSchema = z.object({
  name: z.string().optional().describe('Index name'),
  fields: z.array(z.string()).describe('Fields included in the index'),
  unique: z.boolean().optional().describe('Whether the index is unique'),
});

/**
 * Schema for Entities (Models/Tables).
 */
export const EntitySchema = z.object({
  /** Machine name (snake_case) */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Machine name (snake_case)'),
  
  /** Human readable label */
  label: z.string().optional().describe('Human readable label'),
  
  /** Documentation / Description */
  description: z.string().optional().describe('Documentation / Description'),
  
  /** Icon name (Lucide) */
  icon: z.string().optional().describe('Icon name (Lucide)'),
  
  /** Datasource name */
  datasource: z.string().default('default').describe('Datasource name'),
  
  /** Physical database table name override */
  dbName: z.string().optional().describe('Physical database table name override'),
  
  /** Map of field definitions */
  fields: z.record(FieldSchema).describe('Map of field definitions'),
  
  /** Database indexes */
  indexes: z.array(IndexSchema).optional().describe('Database indexes definition'),
});

/**
 * TypeScript type inferred from EntitySchema.
 */
export type Entity = z.infer<typeof EntitySchema>;
