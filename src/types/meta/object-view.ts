/**
 * Object View Interface
 * 
 * Defines the structure of a view in the ObjectStack metamodel.
 * Views represent different UI presentations of entity data (list, form, detail, etc.).
 * 
 * @module types/meta/object-view
 */

/**
 * Available view types in the ObjectStack metamodel
 * 
 * @remarks
 * Each view type corresponds to a different UI presentation pattern:
 * 
 * - `list`: Tabular list view (grid/table)
 * - `detail`: Single record detail view (read-only)
 * - `form`: Single record form view (editable)
 * - `card`: Card-based list view
 * - `kanban`: Kanban board view
 * - `calendar`: Calendar view (for date-based records)
 * - `chart`: Chart/graph visualization
 * - `map`: Geographic map view
 * - `timeline`: Timeline view for chronological data
 * - `custom`: Custom view implementation
 */
export type ViewType =
  | 'list'
  | 'detail'
  | 'form'
  | 'card'
  | 'kanban'
  | 'calendar'
  | 'chart'
  | 'map'
  | 'timeline'
  | 'custom';

/**
 * Layout configuration for a view
 * 
 * @remarks
 * Defines how fields are organized visually in the view
 */
export interface ViewLayout {
  /**
   * Layout type/strategy
   * 
   * @remarks
   * - `single-column`: One field per row
   * - `two-column`: Two fields per row
   * - `grid`: Flexible grid layout
   * - `tabs`: Fields organized in tabs
   * - `sections`: Fields grouped in named sections
   * 
   * @defaultValue 'single-column'
   */
  type?: 'single-column' | 'two-column' | 'grid' | 'tabs' | 'sections';

  /**
   * Sections for organizing fields
   * 
   * @remarks
   * Only applicable when layout type is 'sections' or 'tabs'
   */
  sections?: Array<{
    /** Section identifier */
    id: string;
    /** Section title */
    title: string;
    /** Field names to include in this section */
    fields: string[];
    /** Whether section is collapsed by default */
    collapsed?: boolean;
  }>;
}

/**
 * Filter configuration for a view
 * 
 * @remarks
 * Defines how records are filtered in the view
 */
export interface ViewFilter {
  /**
   * Field name to filter on
   * 
   * @example 'status', 'createdAt', 'owner'
   */
  field: string;

  /**
   * Filter operator
   * 
   * @remarks
   * Available operators depend on the field type:
   * - Text: equals, contains, startsWith, endsWith
   * - Number: equals, gt, gte, lt, lte, between
   * - Boolean: equals
   * - Date: equals, before, after, between
   * - Lookup: equals, in
   */
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'before' | 'after' | 'in' | 'notIn';

  /**
   * Filter value(s)
   * 
   * @remarks
   * Type depends on operator and field type.
   * For 'between' operator, should be an array of two values.
   */
  value: unknown;
}

/**
 * Sort configuration for a view
 * 
 * @remarks
 * Defines how records are sorted in the view
 */
export interface ViewSort {
  /**
   * Field name to sort by
   * 
   * @example 'name', 'createdAt', 'priority'
   */
  field: string;

  /**
   * Sort direction
   * 
   * @defaultValue 'asc'
   */
  direction: 'asc' | 'desc';
}

/**
 * Column configuration for list views
 * 
 * @remarks
 * Defines how a field is displayed as a column in a list/table view
 */
export interface ViewColumn {
  /**
   * Field name to display
   * 
   * @remarks
   * Must be a valid field name from the entity
   */
  field: string;

  /**
   * Column header label
   * 
   * @remarks
   * If not provided, uses the field's label
   */
  label?: string;

  /**
   * Column width
   * 
   * @remarks
   * Can be in pixels (e.g., 100) or percentage (e.g., '20%')
   */
  width?: number | string;

  /**
   * Whether the column is sortable
   * 
   * @defaultValue true
   */
  sortable?: boolean;

  /**
   * Whether the column is visible by default
   * 
   * @defaultValue true
   */
  visible?: boolean;

  /**
   * Text alignment in the column
   * 
   * @defaultValue 'left'
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Custom formatting function name
   * 
   * @remarks
   * Reference to a formatting function (e.g., 'currency', 'date', 'percentage')
   * 
   * @example 'currency', 'date:MM/DD/YYYY', 'number:2' (2 decimal places)
   */
  format?: string;
}

/**
 * Represents a view definition for an ObjectEntity
 * 
 * @remarks
 * ObjectView defines how an entity's data is presented in the UI.
 * Multiple views can exist for the same entity, each tailored for
 * different use cases (e.g., "All Users", "Active Users", "Admin Users").
 * 
 * Views are used by ObjectUI to:
 * - Render lists with specific columns and filters
 * - Display forms with specific field layouts
 * - Show detailed records with custom presentations
 * 
 * @example
 * ```typescript
 * const allUsersView: ObjectView = {
 *   name: 'all_users',
 *   label: 'All Users',
 *   entityName: 'User',
 *   type: 'list',
 *   columns: [
 *     { field: 'name', width: '30%' },
 *     { field: 'email', width: '30%' },
 *     { field: 'status', width: '20%' },
 *     { field: 'createdAt', width: '20%', format: 'date:MM/DD/YYYY' }
 *   ],
 *   sort: [
 *     { field: 'name', direction: 'asc' }
 *   ]
 * };
 * 
 * const userFormView: ObjectView = {
 *   name: 'user_form',
 *   label: 'User Form',
 *   entityName: 'User',
 *   type: 'form',
 *   fields: ['name', 'email', 'role', 'status'],
 *   layout: {
 *     type: 'sections',
 *     sections: [
 *       {
 *         id: 'basic',
 *         title: 'Basic Information',
 *         fields: ['name', 'email']
 *       },
 *       {
 *         id: 'settings',
 *         title: 'Settings',
 *         fields: ['role', 'status']
 *       }
 *     ]
 *   }
 * };
 * ```
 */
export interface ObjectView {
  /**
   * Technical name of the view
   * 
   * @remarks
   * Used in code and URLs.
   * Should be in snake_case format.
   * Must be unique within the entity's views.
   * 
   * @example 'all_users', 'active_orders', 'recent_products'
   */
  name: string;

  /**
   * Human-readable label for the view
   * 
   * @remarks
   * Used in UI menus, tabs, and headers.
   * 
   * @example 'All Users', 'Active Orders', 'Recent Products'
   */
  label: string;

  /**
   * Name of the entity this view is for
   * 
   * @remarks
   * Must be a valid entity name in the system.
   * 
   * @example 'User', 'SalesOrder', 'Product'
   */
  entityName: string;

  /**
   * Type of view presentation
   * 
   * @see ViewType
   */
  type: ViewType;

  /**
   * Detailed description of the view's purpose
   * 
   * @remarks
   * Used for tooltips and documentation
   */
  description?: string;

  /**
   * Field names to display in the view
   * 
   * @remarks
   * For form/detail views: determines which fields to show and in what order.
   * For list views: used if columns are not specified.
   * Must be valid field names from the entity.
   */
  fields?: string[];

  /**
   * Column configurations for list views
   * 
   * @remarks
   * Only applicable to 'list', 'card', 'kanban' view types.
   * Defines how each field is rendered as a column.
   * 
   * @see ViewColumn
   */
  columns?: ViewColumn[];

  /**
   * Layout configuration for the view
   * 
   * @remarks
   * Only applicable to 'form' and 'detail' view types.
   * 
   * @see ViewLayout
   */
  layout?: ViewLayout;

  /**
   * Default filters to apply to the view
   * 
   * @remarks
   * Filters are applied when the view is loaded.
   * Users can typically modify or remove these filters.
   * 
   * @see ViewFilter
   */
  filters?: ViewFilter[];

  /**
   * Default sort order for the view
   * 
   * @remarks
   * Can specify multiple sort levels (first by field1, then by field2, etc.)
   * 
   * @see ViewSort
   */
  sort?: ViewSort[];

  /**
   * Number of records to display per page
   * 
   * @remarks
   * Only applicable to list-based views.
   * 
   * @defaultValue 25
   */
  pageSize?: number;

  /**
   * Icon identifier for the view
   * 
   * @remarks
   * Used in view switchers, menus, and tabs.
   * 
   * @example 'list', 'grid', 'calendar'
   */
  icon?: string;

  /**
   * Whether this is the default view for the entity
   * 
   * @remarks
   * The default view is shown when navigating to the entity
   * without specifying a view.
   * 
   * @defaultValue false
   */
  default?: boolean;

  /**
   * Whether the view is visible in navigation menus
   * 
   * @remarks
   * Hidden views can still be accessed directly via URL
   * 
   * @defaultValue true
   */
  visible?: boolean;

  /**
   * Permission required to access this view
   * 
   * @remarks
   * Users without this permission cannot see or access the view.
   * 
   * @example 'user.read', 'sales.order.view.active'
   */
  permission?: string;

  /**
   * Query string for advanced filtering
   * 
   * @remarks
   * Alternative to the filters array for complex queries.
   * Uses the ObjectQL query syntax.
   * 
   * @example 'status = "active" AND createdAt > NOW() - 30d'
   */
  query?: string;

  /**
   * Field name for grouping records (kanban view)
   * 
   * @remarks
   * Only applicable to 'kanban' view type.
   * The field should have predefined options (select/lookup).
   * 
   * @example 'status', 'priority', 'assignedTo'
   */
  groupBy?: string;

  /**
   * Date field name for calendar/timeline views
   * 
   * @remarks
   * Only applicable to 'calendar' and 'timeline' view types.
   * Must be a date or datetime field.
   * 
   * @example 'dueDate', 'scheduledAt', 'eventDate'
   */
  dateField?: string;

  /**
   * Chart configuration for chart views
   * 
   * @remarks
   * Only applicable to 'chart' view type.
   */
  chartConfig?: {
    /** Chart type (bar, line, pie, etc.) */
    type: 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'scatter';
    /** Field for x-axis */
    xAxis?: string;
    /** Field for y-axis */
    yAxis?: string;
    /** Aggregation function (count, sum, avg, etc.) */
    aggregation?: 'count' | 'sum' | 'avg' | 'min' | 'max';
  };

  /**
   * Custom component reference for custom views
   * 
   * @remarks
   * Only applicable to 'custom' view type.
   * References a registered custom component.
   * 
   * @example 'MyCustomDashboard', 'AnalyticsView'
   */
  customComponent?: string;

  /**
   * Custom metadata for extensions and plugins
   * 
   * @remarks
   * Allows third-party code to attach arbitrary metadata to views
   * without modifying the core interface
   */
  metadata?: Record<string, unknown>;
}
