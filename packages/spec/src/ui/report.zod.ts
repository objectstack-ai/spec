import { z } from 'zod';
import { FilterConditionSchema } from '../data/filter.zod';
import { ChartConfigSchema } from './chart.zod';

/**
 * Report Type Enum
 */
export const ReportType = z.enum([
  'tabular',   // Simple list
  'summary',   // Grouped by row
  'matrix',    // Grouped by row and column
  'joined'     // Joined multiple blocks
]);

/**
 * Report Column Schema
 */
export const ReportColumnSchema = z.object({
  field: z.string().describe('Field name'),
  label: z.string().optional().describe('Override label'),
  aggregate: z.enum(['sum', 'avg', 'max', 'min', 'count', 'unique']).optional().describe('Aggregation function'),
});

/**
 * Report Grouping Schema
 */
export const ReportGroupingSchema = z.object({
  field: z.string().describe('Field to group by'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  dateGranularity: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional().describe('For date fields'),
});

/**
 * Report Chart Schema
 * Embedded visualization configuration using unified chart taxonomy.
 */
export const ReportChartSchema = ChartConfigSchema.extend({
  /** Report-specific chart configuration */
  xAxis: z.string().describe('Grouping field for X-Axis'),
  yAxis: z.string().describe('Summary field for Y-Axis'),
  groupBy: z.string().optional().describe('Additional grouping field'),
});

/**
 * Report Schema
 * Deep data analysis definition.
 */
export const ReportSchema = z.object({
  /** Identity */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Report unique name'),
  label: z.string().describe('Report label'),
  description: z.string().optional(),
  
  /** Data Source */
  objectName: z.string().describe('Primary object'),
  
  /** Report Configuration */
  type: ReportType.default('tabular').describe('Report format type'),
  
  columns: z.array(ReportColumnSchema).describe('Columns to display'),
  
  /** Grouping (for Summary/Matrix) */
  groupingsDown: z.array(ReportGroupingSchema).optional().describe('Row groupings'),
  groupingsAcross: z.array(ReportGroupingSchema).optional().describe('Column groupings (Matrix only)'),
  
  /** Filtering (MongoDB-style FilterCondition) */
  filter: FilterConditionSchema.optional().describe('Filter criteria'),
  
  /** Visualization */
  chart: ReportChartSchema.optional().describe('Embedded chart configuration'),
});

export type Report = z.infer<typeof ReportSchema>;
export type ReportColumn = z.infer<typeof ReportColumnSchema>;
export type ReportGrouping = z.infer<typeof ReportGroupingSchema>;
export type ReportChart = z.infer<typeof ReportChartSchema>;

/**
 * Report Factory Helper
 */
export const Report = {
  create: (config: z.input<typeof ReportSchema>): Report => ReportSchema.parse(config),
} as const;
