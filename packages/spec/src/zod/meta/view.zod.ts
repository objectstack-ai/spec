import { z } from 'zod';

/**
 * Schema for ListView configuration.
 */
export const ListViewSchema = z.object({
  /** Fields to display as columns */
  columns: z.array(z.string()).describe('Fields to display as columns'),
  
  /** Default sort order (e.g. "created_at desc") */
  sort: z.string().optional().describe('Default sort order'),
  
  /** Filter criteria */
  filter: z.any().optional().describe('Filter criteria'), // TODO: Define Filter Schema strictly later
  
  /** Fields enabled for search */
  searchable_fields: z.array(z.string()).optional().describe('Fields enabled for search'),
});

/**
 * Schema for Form Group (Section).
 */
export const FormGroupSchema = z.object({
  /** Group Label */
  label: z.string().describe('Group Label'),
  
  /** Number of columns in this group (1 or 2) */
  columns: z.enum(['1', '2']).optional().default('1').transform(val => parseInt(val) as 1 | 2).describe('Number of columns'),
  
  /** Fields included in this group */
  fields: z.array(z.string()).describe('Fields included in this group'),
});

/**
 * Schema for FormView configuration.
 */
export const FormViewSchema = z.object({
  /** Layout type */
  layout: z.enum(['simple', 'tabbed', 'wizard']).default('simple').describe('Layout type'),
  
  /** Field groups */
  groups: z.array(FormGroupSchema).optional().describe('Field groups'),
});

/**
 * Schema for View definitions (Layouts).
 */
export const ViewSchema = z.object({
    list: ListViewSchema.optional().describe('List view configuration'),
    form: FormViewSchema.optional().describe('Form view configuration'),
});

/**
 * TypeScript type inferred from ViewSchema.
 */
export type View = z.infer<typeof ViewSchema>;
export type ListView = z.infer<typeof ListViewSchema>;
export type FormView = z.infer<typeof FormViewSchema>;
export type FormGroup = z.infer<typeof FormGroupSchema>;
