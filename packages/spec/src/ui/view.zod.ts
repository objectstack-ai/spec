import { z } from 'zod';
import { SnakeCaseIdentifierSchema } from '../shared/identifiers.zod';

/**
 * HTTP Method Enum
 */
export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * HTTP Request Configuration for API Provider
 */
export const HttpRequestSchema = z.object({
  url: z.string().describe('API endpoint URL'),
  method: HttpMethodSchema.optional().default('GET').describe('HTTP method'),
  headers: z.record(z.string()).optional().describe('Custom HTTP headers'),
  params: z.record(z.unknown()).optional().describe('Query parameters'),
  body: z.unknown().optional().describe('Request body for POST/PUT/PATCH'),
});

/**
 * View Data Source Configuration
 * Supports three modes:
 * 1. 'object': Standard Protocol - Auto-connects to ObjectStack Metadata and Data APIs
 * 2. 'api': Custom API - Explicitly provided API URLs
 * 3. 'value': Static Data - Hardcoded data array
 */
export const ViewDataSchema = z.discriminatedUnion('provider', [
  z.object({
    provider: z.literal('object'),
    object: z.string().describe('Target object name'),
  }),
  z.object({
    provider: z.literal('api'),
    read: HttpRequestSchema.optional().describe('Configuration for fetching data'),
    write: HttpRequestSchema.optional().describe('Configuration for submitting data (for forms/editable tables)'),
  }),
  z.object({
    provider: z.literal('value'),
    items: z.array(z.unknown()).describe('Static data array'),
  }),
]);

/**
 * List Column Configuration Schema
 * Detailed configuration for individual list view columns
 */
export const ListColumnSchema = z.object({
  field: z.string().describe('Field name (snake_case)'),
  label: z.string().optional().describe('Display label override'),
  width: z.number().positive().optional().describe('Column width in pixels'),
  align: z.enum(['left', 'center', 'right']).optional().describe('Text alignment'),
  hidden: z.boolean().optional().describe('Hide column by default'),
  sortable: z.boolean().optional().describe('Allow sorting by this column'),
  resizable: z.boolean().optional().describe('Allow resizing this column'),
  wrap: z.boolean().optional().describe('Allow text wrapping'),
  type: z.string().optional().describe('Renderer type override (e.g., "currency", "date")'),
});

/**
 * List View Selection Configuration
 */
export const SelectionConfigSchema = z.object({
  type: z.enum(['none', 'single', 'multiple']).default('none').describe('Selection mode'),
});

/**
 * List View Pagination Configuration
 */
export const PaginationConfigSchema = z.object({
  pageSize: z.number().int().positive().default(25).describe('Number of records per page'),
  pageSizeOptions: z.array(z.number().int().positive()).optional().describe('Available page size options'),
});

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
 * 
 * **NAMING CONVENTION:**
 * View names (when provided) are machine identifiers and must be lowercase snake_case.
 * 
 * @example Good view names
 * - 'all_accounts'
 * - 'my_open_leads'
 * - 'high_priority_cases'
 * 
 * @example Bad view names (will be rejected)
 * - 'AllAccounts' (PascalCase)
 * - 'My Open Leads' (spaces)
 */
export const ListViewSchema = z.object({
  name: SnakeCaseIdentifierSchema.optional().describe('Internal view name (lowercase snake_case)'),
  label: z.string().optional(), // Display label override
  type: z.enum(['grid', 'kanban', 'calendar', 'gantt', 'map']).default('grid'),
  
  /** Data Source Configuration */
  data: ViewDataSchema.optional().describe('Data source configuration (defaults to "object" provider)'),
  
  /** Shared Query Config */
  columns: z.union([
    z.array(z.string()), // Legacy: simple field names
    z.array(ListColumnSchema), // Enhanced: detailed column config
  ]).describe('Fields to display as columns'),
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

  /** Grid Features */
  resizable: z.boolean().optional().describe('Enable column resizing'),
  striped: z.boolean().optional().describe('Striped row styling'),
  bordered: z.boolean().optional().describe('Show borders'),

  /** Selection */
  selection: SelectionConfigSchema.optional().describe('Row selection configuration'),

  /** Pagination */
  pagination: PaginationConfigSchema.optional().describe('Pagination configuration'),

  /** Type Specific Config */
  kanban: KanbanConfigSchema.optional(),
  calendar: CalendarConfigSchema.optional(),
  gantt: GanttConfigSchema.optional(),
});

/**
 * Form Field Configuration Schema
 * Detailed configuration for individual form fields
 */
export const FormFieldSchema = z.object({
  field: z.string().describe('Field name (snake_case)'),
  label: z.string().optional().describe('Display label override'),
  placeholder: z.string().optional().describe('Placeholder text'),
  helpText: z.string().optional().describe('Help/hint text'),
  readonly: z.boolean().optional().describe('Read-only override'),
  required: z.boolean().optional().describe('Required override'),
  hidden: z.boolean().optional().describe('Hidden override'),
  colSpan: z.number().int().min(1).max(4).optional().describe('Column span in grid layout (1-4)'),
  widget: z.string().optional().describe('Custom widget/component name'),
  dependsOn: z.string().optional().describe('Parent field name for cascading'),
  visibleOn: z.string().optional().describe('Visibility condition expression'),
});

/**
 * Form Layout Section
 */
export const FormSectionSchema = z.object({
  label: z.string().optional(),
  collapsible: z.boolean().default(false),
  collapsed: z.boolean().default(false),
  columns: z.enum(['1', '2', '3', '4']).default('2').transform(val => parseInt(val) as 1 | 2 | 3 | 4),
  fields: z.array(z.union([
    z.string(), // Legacy: simple field name
    FormFieldSchema, // Enhanced: detailed field config
  ])),
});

/**
 * Form View Schema
 */
export const FormViewSchema = z.object({
  type: z.enum(['simple', 'tabbed', 'wizard']).default('simple'),
  
  /** Data Source Configuration */
  data: ViewDataSchema.optional().describe('Data source configuration (defaults to "object" provider)'),
  
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
    listViews: z.record(ListViewSchema).optional().describe('Additional named list views'),
    formViews: z.record(FormViewSchema).optional().describe('Additional named form views'),
});

export type View = z.infer<typeof ViewSchema>;
export type ListView = z.infer<typeof ListViewSchema>;
export type FormView = z.infer<typeof FormViewSchema>;
export type FormSection = z.infer<typeof FormSectionSchema>;
export type ListColumn = z.infer<typeof ListColumnSchema>;
export type FormField = z.infer<typeof FormFieldSchema>;
export type SelectionConfig = z.infer<typeof SelectionConfigSchema>;
export type PaginationConfig = z.infer<typeof PaginationConfigSchema>;
export type ViewData = z.infer<typeof ViewDataSchema>;
export type HttpRequest = z.infer<typeof HttpRequestSchema>;
export type HttpMethod = z.infer<typeof HttpMethodSchema>;
