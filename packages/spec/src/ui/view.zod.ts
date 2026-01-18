import { z } from 'zod';

/**
 * Kanban Settings
 */
export const KanbanConfigSchema = z.object({
  groupByField: z.string().describe('Field to group columns by (usually status/select)'),
  summarizeField: z.string().optional().describe('Field to sum at top of column (e.g. amount)'),
  columns: z.array(z.string()).describe('Fields to show on cards'),
});

/**
 * Calendar Settings
 */
export const CalendarConfigSchema = z.object({
  startDateField: z.string(),
  endDateField: z.string().optional(),
  titleField: z.string(),
  colorField: z.string().optional(),
});

/**
 * Gantt Settings
 */
export const GanttConfigSchema = z.object({
  startDateField: z.string(),
  endDateField: z.string(),
  titleField: z.string(),
  progressField: z.string().optional(),
  dependenciesField: z.string().optional(),
});

/**
 * List View Schema (Expanded)
 */
export const ListViewSchema = z.object({
  name: z.string().optional(), // Internal name
  label: z.string().optional(), // Display label override
  type: z.enum(['grid', 'kanban', 'calendar', 'gantt', 'map']).default('grid'),
  
  /** Shared Query Config */
  columns: z.array(z.string()).describe('Fields to display as columns'),
  filter: z.array(z.any()).optional().describe('Filter criteria (JSON Rules)'),
  sort: z.union([
    z.string(), //Legacy "field desc"
    z.array(z.object({
      field: z.string(),
      order: z.enum(['asc', 'desc'])
    }))
  ]).optional(),
  
  /** Search */
  searchableFields: z.array(z.string()).optional().describe('Fields enabled for search'),

  /** Type Specific Config */
  kanban: KanbanConfigSchema.optional(),
  calendar: CalendarConfigSchema.optional(),
  gantt: GanttConfigSchema.optional(),
});

/**
 * Form Layout Section
 */
export const FormSectionSchema = z.object({
  label: z.string().optional(),
  collapsible: z.boolean().default(false),
  collapsed: z.boolean().default(false),
  columns: z.enum(['1', '2', '3', '4']).default('2').transform(val => parseInt(val) as 1 | 2 | 3 | 4),
  fields: z.array(z.string()), // or complex FieldConfig
});

/**
 * Form View Schema
 */
export const FormViewSchema = z.object({
  type: z.enum(['simple', 'tabbed', 'wizard']).default('simple'),
  sections: z.array(FormSectionSchema).optional(), // For simple layout
  groups: z.array(FormSectionSchema).optional(), // Legacy support -> alias to sections
});

/**
 * Master View Schema
 * Can define multiple named views.
 */
export const ViewSchema = z.object({
    list: ListViewSchema.optional(), // Default list view
    form: FormViewSchema.optional(), // Default form view
    list_views: z.record(ListViewSchema).optional().describe('Additional named list views'),
    form_views: z.record(FormViewSchema).optional().describe('Additional named form views'),
});

export type View = z.infer<typeof ViewSchema>;
export type ListView = z.infer<typeof ListViewSchema>;
export type FormView = z.infer<typeof FormViewSchema>;
export type FormSection = z.infer<typeof FormSectionSchema>;
