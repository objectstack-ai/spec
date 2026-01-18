import { z } from 'zod';

/**
 * Field Type Enum
 */
export const FieldType = z.enum([
  // Core Text
  'text', 'textarea', 'email', 'url', 'phone', 'password',
  // Rich Content
  'markdown', 'html', 
  // Numbers
  'number', 'currency', 'percent', 
  // Date & Time
  'date', 'datetime', 'time',
  // Logic
  'boolean',
  // Selection
  'select', 'multiselect', // Static options
  // Relational
  'lookup', 'master_detail', // Dynamic reference to other objects
  // Media
  'image', 'file', 'avatar',
  // Calculated / System
  'formula', 'summary', 'autonumber'
]);

export type FieldType = z.infer<typeof FieldType>;

/**
 * Select Option Schema
 */
export const SelectOptionSchema = z.object({
  label: z.string().describe('Display label'),
  value: z.string().describe('Stored value'),
  color: z.string().optional().describe('Color code for badges/charts'),
  default: z.boolean().optional().describe('Is default option'),
});

/**
 * Field Schema - Best Practice Enterprise Pattern
 */
export const FieldSchema = z.object({
  /** Identity */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Machine name (snake_case)'),
  label: z.string().describe('Human readable label'),
  type: FieldType.describe('Field Data Type'),
  description: z.string().optional().describe('Tooltip/Help text'),

  /** Database Constraints */
  required: z.boolean().default(false).describe('Is required'),
  multiple: z.boolean().default(false).describe('Allow multiple values (Stores as Array/JSON). Applicable for select, lookup, file, image.'),
  unique: z.boolean().default(false).describe('Is unique constraint'),
  defaultValue: z.any().optional().describe('Default value'),
  
  /** Text/String Constraints */
  maxLength: z.number().optional().describe('Max character length'),
  minLength: z.number().optional().describe('Min character length'),
  
  /** Number Constraints */
  precision: z.number().optional().describe('Total digits'),
  scale: z.number().optional().describe('Decimal places'),
  min: z.number().optional().describe('Minimum value'),
  max: z.number().optional().describe('Maximum value'),

  /** Selection Options */
  options: z.array(SelectOptionSchema).optional().describe('Static options for select/multiselect'),

  /** Relationship Config */
  reference: z.string().optional().describe('Target Object Name'),
  referenceFilters: z.array(z.string()).optional().describe('Filters applied to lookup dialogs (e.g. "active = true")'),
  writeRequiresMasterRead: z.boolean().optional().describe('If true, user needs read access to master record to edit this field'),
  deleteBehavior: z.enum(['set_null', 'cascade', 'restrict']).optional().default('set_null').describe('What happens if referenced record is deleted'),

  /** Calculation */
  expression: z.string().optional().describe('Formula expression'), // Changed from formula to expression to match common usage, but keeping one consistent is key. Let's use expression as generic.
  formula: z.string().optional().describe('Deprecated: Use expression'), // Backwards compat or just keep.
  summaryOperations: z.object({
    object: z.string(),
    field: z.string(),
    function: z.enum(['count', 'sum', 'min', 'max', 'avg'])
  }).optional().describe('Roll-up summary definition'),

  /** Security & Visibility */
  hidden: z.boolean().default(false).describe('Hidden from default UI'),
  readonly: z.boolean().default(false).describe('Read-only in UI'),
  encryption: z.boolean().default(false).describe('Encrypt at rest'),
  
  /** Indexing */
  index: z.boolean().default(false).describe('Create standard database index'),
  externalId: z.boolean().default(false).describe('Is external ID for upsert operations'),
});

export type Field = z.infer<typeof FieldSchema>;
export type SelectOption = z.infer<typeof SelectOptionSchema>;
