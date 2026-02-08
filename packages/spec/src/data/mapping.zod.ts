import { z } from 'zod';
import { SnakeCaseIdentifierSchema } from '../shared/identifiers.zod';
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
]).describe('Type of transformation to apply during field mapping');

/**
 * Field Mapping Item
 */
export const FieldMappingSchema = z.object({
  /** Source Column */
  source: z.union([z.string(), z.array(z.string())]).describe('Source column header(s)'),
  
  /** Target Field */
  target: z.union([z.string(), z.array(z.string())]).describe('Target object field(s)'),
  
  /** Transformation */
  transform: TransformType.default('none').describe('Type of transformation to apply'),
  
  /** Configuration for transform */
  params: z.object({
    // Constant
    value: z.unknown().optional().describe('Constant value to use (for constant transform)'),
    
    // Lookup
    object: z.string().optional().describe('Lookup object name (for lookup transform)'),
    fromField: z.string().optional().describe('Field to match on in lookup object (e.g. "name")'),
    toField: z.string().optional().describe('Field value to retrieve from lookup (e.g. "_id")'),
    autoCreate: z.boolean().optional().describe('Create record if lookup fails'),
    
    // Map
    valueMap: z.record(z.string(), z.unknown()).optional().describe('Value mapping dictionary (e.g. {"Open": "draft"})'),
    
    // Split/Join
    separator: z.string().optional().describe('Separator character for split/join operations')
  }).optional().describe('Transform-specific parameters')
});

/**
 * Data Mapping Schema
 * Defines a reusable data mapping configuration for ETL operations.
 * 
 * **NAMING CONVENTION:**
 * Mapping names are machine identifiers and must be lowercase snake_case.
 * 
 * @example Good mapping names
 * - 'salesforce_to_crm'
 * - 'csv_import_contacts'
 * - 'api_sync_orders'
 * 
 * @example Bad mapping names (will be rejected)
 * - 'SalesforceToCRM' (PascalCase)
 * - 'CSV Import' (spaces)
 */
export const MappingSchema = z.object({
  /** Identity */
  name: SnakeCaseIdentifierSchema.describe('Mapping unique name (lowercase snake_case)'),
  label: z.string().optional().describe('Human-readable label for the mapping'),
  
  /** Scope */
  sourceFormat: z.enum(['csv', 'json', 'xml', 'sql']).default('csv').describe('Format of the source data'),
  targetObject: z.string().describe('Target Object Name'),
  
  /** Column Mappings */
  fieldMapping: z.array(FieldMappingSchema).describe('Array of field mapping configurations'),
  
  /** Upsert Logic */
  mode: z.enum(['insert', 'update', 'upsert']).default('insert').describe('Import mode for handling existing records'),
  upsertKey: z.array(z.string()).optional().describe('Fields to match for upsert (e.g. email)'),
  
  /** Extract Logic (For Export) */
  extractQuery: QuerySchema.optional().describe('Query to run for export only'),
  
  /** Error Handling */
  errorPolicy: z.enum(['skip', 'abort', 'retry']).default('skip').describe('How to handle errors during import'),
  batchSize: z.number().default(1000).describe('Number of records to process per batch')
});

export type Mapping = z.infer<typeof MappingSchema>;
export type FieldMapping = z.infer<typeof FieldMappingSchema>;
