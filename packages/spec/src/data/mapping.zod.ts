import { z } from 'zod';
import { QuerySchema } from './query.zod';

/**
 * Transformation Logic
 * Built-in helpers for converting data during import.
 */
export const TransformType = z.enum([
  'none',         // Direct copy
  'constant',     // Use a hardcoded value
  'lookup',       // Resolve FK (Name -> ID)
  'split',        // "John Doe" -> ["John", "Doe"]
  'join',         // ["John", "Doe"] -> "John Doe"
  'javascript',   // Custom script (Review security!)
  'map'           // Value mapping (e.g. "Active" -> "active")
]);

/**
 * Field Mapping Item
 */
export const FieldMappingSchema = z.object({
  /** Source Column */
  source: z.union([z.string(), z.array(z.string())]).describe('Source column header(s)'),
  
  /** Target Field */
  target: z.union([z.string(), z.array(z.string())]).describe('Target object field(s)'),
  
  /** Transformation */
  transform: TransformType.default('none'),
  
  /** Configuration for transform */
  params: z.object({
    // Constant
    value: z.any().optional(),
    
    // Lookup
    object: z.string().optional(), // Lookup Object
    fromField: z.string().optional(), // Match on (e.g. "name")
    toField: z.string().optional(), // Value to take (e.g. "_id")
    autoCreate: z.boolean().optional(), // Create if missing
    
    // Map
    valueMap: z.record(z.any()).optional(), // { "Open": "draft" }
    
    // Split/Join
    separator: z.string().optional()
  }).optional()
});

/**
 * ETL Mapping Schema
 * Definition for importing/exporting data defined in `integration-etl.mdx`.
 */
export const MappingSchema = z.object({
  /** Identity */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/),
  label: z.string().optional(),
  
  /** Scope */
  sourceFormat: z.enum(['csv', 'json', 'xml', 'sql']).default('csv'),
  targetObject: z.string().describe('Target Object Name'),
  
  /** Column Mappings */
  fieldMapping: z.array(FieldMappingSchema),
  
  /** Upsert Logic */
  mode: z.enum(['insert', 'update', 'upsert']).default('insert'),
  upsertKey: z.array(z.string()).optional().describe('Fields to match for upsert (e.g. email)'),
  
  /** Extract Logic (For Export) */
  extractQuery: QuerySchema.optional().describe('Query to run for export only'),
  
  /** Error Handling */
  errorPolicy: z.enum(['skip', 'abort', 'retry']).default('skip'),
  batchSize: z.number().default(1000)
});

export type Mapping = z.infer<typeof MappingSchema>;
export type FieldMapping = z.infer<typeof FieldMappingSchema>;
