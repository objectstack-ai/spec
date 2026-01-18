import { z } from 'zod';

/**
 * Field Type Enum
 * Defines the available data types for fields.
 */
export const FieldType = z.enum([
  // Basic
  'text', 'textarea', 'markdown', 'html', 'password', 'email',
  // Number
  'number', 'currency', 'percent',
  // Date
  'date', 'datetime', 'time',
  // Logic
  'boolean',
  // Choice
  'select', 'multiselect',
  // Relational
  'lookup', 'master_detail',
  // Calculated
  'formula', 'summary',
  // Media
  'image', 'file', 'avatar',
  // System
  'id', 'owner', 'created_at', 'updated_at'
]);

export type FieldType = z.infer<typeof FieldType>;

/**
 * Schema for select options (for select/multiselect types).
 */
export const SelectOptionSchema = z.object({
  label: z.string().describe('Display label for the option'),
  value: z.string().describe('Stored value for the option'),
});

/**
 * Base Schema for all fields.
 * Contains properties common to all field types.
 */
export const FieldSchema = z.object({
  /** Machine name of the field */
  name: z.string().describe('Machine name of the field'),
  
  /** Human readable label */
  label: z.string().optional().describe('Human readable label'),
  
  /** Field Data Type */
  type: FieldType.describe('Field Data Type'),
  
  /** Whether the field is required */
  required: z.boolean().optional().describe('Whether the field is required'),
  
  /** Default value for the field */
  defaultValue: z.any().optional().describe('Default value for the field'),
  
  /** Help text / tooltip description */
  description: z.string().optional().describe('Help text / tooltip description'),
  
  /** Whether the field is hidden from UI */
  hidden: z.boolean().optional().describe('Whether the field is hidden from UI'),
  
  /** Whether the field is read-only */
  readonly: z.boolean().optional().describe('Whether the field is read-only'),

  /** Options for select/multiselect types */
  options: z.array(SelectOptionSchema).optional().describe('Options for select/multiselect types'),

  /** Target object name for lookup/master_detail types */
  reference: z.string().optional().describe('Target object name for lookup/master_detail types'),

  /** Expression for formula/summary types */
  expression: z.string().optional().describe('Expression for formula/summary types'),
});

/**
 * TypeScript type inferred from FieldSchema.
 */
export type Field = z.infer<typeof FieldSchema>;
