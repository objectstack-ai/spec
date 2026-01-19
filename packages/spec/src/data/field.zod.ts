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
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Machine name (snake_case)').optional(),
  label: z.string().optional().describe('Human readable label'),
  type: FieldType.describe('Field Data Type'),
  description: z.string().optional().describe('Tooltip/Help text'),
  format: z.string().optional().describe('Format string (e.g. email, phone)'),

  /** Database Constraints */
  required: z.boolean().default(false).describe('Is required'),
  searchable: z.boolean().default(false).describe('Is searchable'),
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
  expression: z.string().optional().describe('Formula expression'),
  formula: z.string().optional().describe('Deprecated: Use expression'),
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

/**
 * Field Factory Helper
 */
export type FieldInput = Omit<Partial<Field>, 'type'>;

export const Field = {
  text: (config: FieldInput = {}) => ({ type: 'text', ...config } as const),
  textarea: (config: FieldInput = {}) => ({ type: 'textarea', ...config } as const),
  number: (config: FieldInput = {}) => ({ type: 'number', ...config } as const),
  boolean: (config: FieldInput = {}) => ({ type: 'boolean', ...config } as const),
  date: (config: FieldInput = {}) => ({ type: 'date', ...config } as const),
  datetime: (config: FieldInput = {}) => ({ type: 'datetime', ...config } as const),
  currency: (config: FieldInput = {}) => ({ type: 'currency', ...config } as const),
  percent: (config: FieldInput = {}) => ({ type: 'percent', ...config } as const),
  url: (config: FieldInput = {}) => ({ type: 'url', ...config } as const),
  email: (config: FieldInput = {}) => ({ type: 'email', ...config } as const),
  phone: (config: FieldInput = {}) => ({ type: 'phone', ...config } as const),
  image: (config: FieldInput = {}) => ({ type: 'image', ...config } as const),
  file: (config: FieldInput = {}) => ({ type: 'file', ...config } as const),
  avatar: (config: FieldInput = {}) => ({ type: 'avatar', ...config } as const),
  formula: (config: FieldInput = {}) => ({ type: 'formula', ...config } as const),
  summary: (config: FieldInput = {}) => ({ type: 'summary', ...config } as const),
  autonumber: (config: FieldInput = {}) => ({ type: 'autonumber', ...config } as const),
  markdown: (config: FieldInput = {}) => ({ type: 'markdown', ...config } as const),
  html: (config: FieldInput = {}) => ({ type: 'html', ...config } as const),
  password: (config: FieldInput = {}) => ({ type: 'password', ...config } as const),
  
  select: (optionsOrConfig: SelectOption[] | string[] | FieldInput & { options: SelectOption[] | string[] }, config?: FieldInput) => {
    // Support both old and new signatures:
    // Old: Field.select(['a', 'b'], { label: 'X' })
    // New: Field.select({ options: [{label: 'A', value: 'a'}], label: 'X' })
    let options: SelectOption[];
    let finalConfig: FieldInput;
    
    if (Array.isArray(optionsOrConfig)) {
      // Old signature: array as first param
      options = optionsOrConfig.map(o => typeof o === 'string' ? { label: o, value: o } : o);
      finalConfig = config || {};
    } else {
      // New signature: config object with options
      options = (optionsOrConfig.options || []).map(o => typeof o === 'string' ? { label: o, value: o } : o);
      finalConfig = optionsOrConfig;
    }
    
    return { type: 'select', ...finalConfig, options } as const;
  },
  
  multiselect: (optionsOrConfig: SelectOption[] | string[] | FieldInput & { options: SelectOption[] | string[] }, config?: FieldInput) => {
    // Support both old and new signatures
    let options: SelectOption[];
    let finalConfig: FieldInput;
    
    if (Array.isArray(optionsOrConfig)) {
      // Old signature: array as first param
      options = optionsOrConfig.map(o => typeof o === 'string' ? { label: o, value: o } : o);
      finalConfig = config || {};
    } else {
      // New signature: config object with options
      options = (optionsOrConfig.options || []).map(o => typeof o === 'string' ? { label: o, value: o } : o);
      finalConfig = optionsOrConfig;
    }
    
    return { type: 'multiselect', ...finalConfig, options } as const;
  },
  
  lookup: (reference: string, config: FieldInput = {}) => ({ 
    type: 'lookup', 
    reference, 
    ...config 
  } as const),
  
  master_detail: (reference: string, config: FieldInput = {}) => ({ 
    type: 'master_detail', 
    reference, 
    ...config 
  } as const),
};
