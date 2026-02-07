import { z } from 'zod';
import { FilterConditionSchema } from '../data/filter.zod';
import { ChartTypeSchema, ChartConfigSchema } from './chart.zod';
import { SnakeCaseIdentifierSchema } from '../shared/identifiers.zod';

/**
 * Dashboard Widget Schema
 * A single component on the dashboard grid.
 */
export const DashboardWidgetSchema = z.object({
  /** Widget Title */
  title: z.string().optional().describe('Widget title'),
  
  /** Visualization Type */
  type: ChartTypeSchema.default('metric').describe('Visualization type'),
  
  /** Chart Configuration */
  chartConfig: ChartConfigSchema.optional().describe('Chart visualization configuration'),
  
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
  options: z.unknown().optional().describe('Widget specific configuration'),
});

/**
 * Dashboard Schema
 * Represents a page containing multiple visualizations.
 * 
 * @example Sales Executive Dashboard
 * {
 *   name: "sales_overview",
 *   label: "Sales Executive Overview",
 *   widgets: [
 *     {
 *       title: "Total Pipe",
 *       type: "metric",
 *       object: "opportunity",
 *       valueField: "amount",
 *       aggregate: "sum",
 *       layout: { x: 0, y: 0, w: 3, h: 2 }
 *     },
 *     {
 *       title: "Revenue by Region",
 *       type: "bar",
 *       object: "order",
 *       categoryField: "region",
 *       valueField: "total",
 *       aggregate: "sum",
 *       layout: { x: 3, y: 0, w: 6, h: 4 }
 *     }
 *   ]
 * }
 */
export const DashboardSchema = z.object({
  /** Machine name */
  name: SnakeCaseIdentifierSchema.describe('Dashboard unique name'),
  
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
