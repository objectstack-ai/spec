import { z } from 'zod';
import { QuerySchema } from '../data/query.zod';

/**
 * View Definition Storage Protocol
 * 
 * Implements P2 requirement for ObjectStack kernel.
 * Allows persisting UI view configurations (list views, filters, layouts).
 * 
 * Features:
 * - Save custom views with filters and columns
 * - Share views with users/teams
 * - Set default views per user/profile
 * - View templates and presets
 * 
 * Industry alignment: Salesforce List Views, Microsoft Dynamics Saved Views
 */

// ==========================================
// View Configuration Types
// ==========================================

/**
 * View Type Enum
 * Types of views that can be stored
 */
export const ViewType = z.enum([
  'list',          // List/table view
  'kanban',        // Kanban board view
  'calendar',      // Calendar view
  'gantt',         // Gantt chart view
  'timeline',      // Timeline view
  'chart',         // Chart/graph view
  'pivot',         // Pivot table view
  'custom',        // Custom view type
]);

export type ViewType = z.infer<typeof ViewType>;

/**
 * View Visibility Enum
 * Who can see and use this view
 */
export const ViewVisibility = z.enum([
  'private',       // Only the creator can see it
  'shared',        // Shared with specific users/teams
  'public',        // All users can see it
  'organization',  // All org users can see it
]);

export type ViewVisibility = z.infer<typeof ViewVisibility>;

/**
 * Column Configuration Schema
 * Defines which columns to display and how
 */
export const ViewColumnSchema = z.object({
  field: z.string().describe('Field name'),
  label: z.string().optional().describe('Custom column label'),
  width: z.number().optional().describe('Column width in pixels'),
  sortable: z.boolean().optional().default(true).describe('Whether column is sortable'),
  filterable: z.boolean().optional().default(true).describe('Whether column is filterable'),
  visible: z.boolean().optional().default(true).describe('Whether column is visible'),
  pinned: z.enum(['left', 'right']).optional().describe('Pin column to left or right'),
  formatter: z.string().optional().describe('Custom formatter name'),
  aggregation: z.string().optional().describe('Aggregation function for column (sum, avg, etc.)'),
});

export type ViewColumn = z.infer<typeof ViewColumnSchema>;

/**
 * View Layout Configuration
 * Layout-specific settings for different view types
 */
export const ViewLayoutSchema = z.object({
  // List view settings
  columns: z.array(ViewColumnSchema).optional().describe('Column configuration for list views'),
  rowHeight: z.number().optional().describe('Row height in pixels'),
  
  // Kanban view settings
  groupByField: z.string().optional().describe('Field to group by (for kanban)'),
  cardFields: z.array(z.string()).optional().describe('Fields to display on cards'),
  
  // Calendar view settings
  dateField: z.string().optional().describe('Date field for calendar view'),
  startDateField: z.string().optional().describe('Start date field for event ranges'),
  endDateField: z.string().optional().describe('End date field for event ranges'),
  titleField: z.string().optional().describe('Field to use as event title'),
  
  // Chart view settings
  chartType: z.enum(['bar', 'line', 'pie', 'scatter', 'area']).optional().describe('Chart type'),
  xAxis: z.string().optional().describe('X-axis field'),
  yAxis: z.string().optional().describe('Y-axis field'),
  series: z.array(z.string()).optional().describe('Series fields for multi-series charts'),
});

export type ViewLayout = z.infer<typeof ViewLayoutSchema>;

// ==========================================
// View Definition Schema
// ==========================================

/**
 * Saved View Schema
 * Complete view configuration that can be persisted
 * 
 * @example
 * {
 *   "id": "view_123",
 *   "name": "active_contacts",
 *   "label": "Active Contacts",
 *   "object": "contact",
 *   "type": "list",
 *   "visibility": "public",
 *   "query": {
 *     "object": "contact",
 *     "where": { "status": "active" },
 *     "orderBy": [{ "field": "last_name", "order": "asc" }],
 *     "limit": 50
 *   },
 *   "layout": {
 *     "columns": [
 *       { "field": "first_name", "label": "First Name", "width": 150 },
 *       { "field": "last_name", "label": "Last Name", "width": 150 },
 *       { "field": "email", "label": "Email", "width": 200 }
 *     ]
 *   },
 *   "isDefault": false,
 *   "createdBy": "user_456",
 *   "createdAt": "2026-01-29T12:00:00Z"
 * }
 */
export const SavedViewSchema = z.object({
  id: z.string().describe('Unique view identifier'),
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('View machine name (snake_case)'),
  label: z.string().describe('Display label'),
  description: z.string().optional().describe('View description'),
  
  // View configuration
  object: z.string().describe('Object/table this view is for'),
  type: ViewType.describe('View type'),
  visibility: ViewVisibility.describe('Who can access this view'),
  
  // Query configuration
  query: QuerySchema.describe('Query configuration (filters, sorting, etc.)'),
  
  // Layout configuration
  layout: ViewLayoutSchema.optional().describe('Layout configuration'),
  
  // Sharing
  sharedWith: z.array(z.string()).optional().describe('User/team IDs this view is shared with'),
  
  // Defaults
  isDefault: z.boolean().optional().default(false).describe('Is this the default view for this object?'),
  isSystem: z.boolean().optional().default(false).describe('Is this a system-defined view?'),
  
  // Metadata
  createdBy: z.string().describe('User ID who created this view'),
  createdAt: z.string().datetime().describe('When the view was created'),
  updatedBy: z.string().optional().describe('User ID who last updated this view'),
  updatedAt: z.string().datetime().optional().describe('When the view was last updated'),
  
  // Settings
  settings: z.record(z.any()).optional().describe('Additional view-specific settings'),
});

export type SavedView = z.infer<typeof SavedViewSchema>;

// ==========================================
// View CRUD Operations
// ==========================================

/**
 * Create View Request Schema
 */
export const CreateViewRequestSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('View machine name'),
  label: z.string().describe('Display label'),
  description: z.string().optional(),
  object: z.string().describe('Object name'),
  type: ViewType.describe('View type'),
  visibility: ViewVisibility.describe('View visibility'),
  query: QuerySchema.describe('Query configuration'),
  layout: ViewLayoutSchema.optional().describe('Layout configuration'),
  sharedWith: z.array(z.string()).optional().describe('Users/teams to share with'),
  isDefault: z.boolean().optional().default(false).describe('Set as default view'),
  settings: z.record(z.any()).optional(),
});

export type CreateViewRequest = z.infer<typeof CreateViewRequestSchema>;

/**
 * Update View Request Schema
 */
export const UpdateViewRequestSchema = CreateViewRequestSchema.partial().extend({
  id: z.string().describe('View ID to update'),
});

export type UpdateViewRequest = z.infer<typeof UpdateViewRequestSchema>;

/**
 * List Views Request Schema
 */
export const ListViewsRequestSchema = z.object({
  object: z.string().optional().describe('Filter by object name'),
  type: ViewType.optional().describe('Filter by view type'),
  visibility: ViewVisibility.optional().describe('Filter by visibility'),
  createdBy: z.string().optional().describe('Filter by creator user ID'),
  isDefault: z.boolean().optional().describe('Filter for default views'),
  limit: z.number().optional().default(50).describe('Max results'),
  offset: z.number().optional().default(0).describe('Offset for pagination'),
});

export type ListViewsRequest = z.infer<typeof ListViewsRequestSchema>;

/**
 * View Response Schema
 */
export const ViewResponseSchema = z.object({
  success: z.boolean(),
  data: SavedViewSchema.optional().describe('The saved view'),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }).optional(),
});

export type ViewResponse = z.infer<typeof ViewResponseSchema>;

/**
 * List Views Response Schema
 */
export const ListViewsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(SavedViewSchema).describe('Array of saved views'),
  pagination: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
  }),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }).optional(),
});

export type ListViewsResponse = z.infer<typeof ListViewsResponseSchema>;

// ==========================================
// View Storage API
// ==========================================

/**
 * View Storage API Contracts
 */
export const ViewStorageApiContracts = {
  createView: {
    input: CreateViewRequestSchema,
    output: ViewResponseSchema,
  },
  updateView: {
    input: UpdateViewRequestSchema,
    output: ViewResponseSchema,
  },
  getView: {
    input: z.object({ id: z.string() }),
    output: ViewResponseSchema,
  },
  listViews: {
    input: ListViewsRequestSchema,
    output: ListViewsResponseSchema,
  },
  deleteView: {
    input: z.object({ id: z.string() }),
    output: z.object({ success: z.boolean() }),
  },
  setDefaultView: {
    input: z.object({
      viewId: z.string(),
      object: z.string(),
      userId: z.string().optional().describe('User to set default for (defaults to current user)'),
    }),
    output: ViewResponseSchema,
  },
};
