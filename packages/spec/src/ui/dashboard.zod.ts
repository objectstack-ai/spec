import { z } from 'zod';
import { FilterConditionSchema } from '../data/filter.zod';

/**
 * Chart Type Enum
 */
export const ChartType = z.enum([
  'metric',    // Single big number
  'bar',       // Bar chart
  'line',      // Line chart
  'pie',       // Pie/Donut chart
  'donut',     // Donut chart
  'funnel',    // Funnel chart
  'table',     // Data table
  'text'       // Rich text / Markdown
]);

/**
 * Dashboard Widget Schema
 * A single component on the dashboard grid.
 */
export const DashboardWidgetSchema = z.object({
  /** Widget Title */
  title: z.string().optional().describe('Widget title'),
  
  /** Visualization Type */
  type: ChartType.default('metric').describe('Visualization type'),
  
  /** Data Source Object */
  object: z.string().optional().describe('Data source object name'),
  
  /** Data Filter (MongoDB-style FilterCondition) */
  filter: FilterConditionSchema.optional().describe('Data filter criteria'),
  
  /** Category Field (X-Axis / Group By) */
  categoryField: z.string().optional().describe('Field for grouping (X-Axis)'),
  
  /** Value Field (Y-Axis) */
  valueField: z.string().optional().describe('Field for values (Y-Axis)'),
  
  /** Aggregate operation */
  aggregate: z.enum(['count', 'sum', 'avg', 'min', 'max']).optional().default('count').describe('Aggregate function'),
  
  /** 
   * Layout Position (React-Grid-Layout style)
   * x: column (0-11)
   * y: row
   * w: width (1-12)
   * h: height
   */
  layout: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
  }).describe('Grid layout position'),
  
  /** Widget specific options (colors, legend, etc.) */
  options: z.any().optional().describe('Widget specific configuration'),
});

/**
 * Dashboard Schema
 * Represents a page containing multiple visualizations.
 */
export const DashboardSchema = z.object({
  /** Machine name */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Dashboard unique name'),
  
  /** Display label */
  label: z.string().describe('Dashboard label'),
  
  /** Description */
  description: z.string().optional().describe('Dashboard description'),
  
  /** Collection of widgets */
  widgets: z.array(DashboardWidgetSchema).describe('Widgets to display'),
});

export type Dashboard = z.infer<typeof DashboardSchema>;
export type DashboardWidget = z.infer<typeof DashboardWidgetSchema>;

/**
 * Dashboard Factory Helper
 */
export const Dashboard = {
  create: (config: z.input<typeof DashboardSchema>): Dashboard => DashboardSchema.parse(config),
} as const;
