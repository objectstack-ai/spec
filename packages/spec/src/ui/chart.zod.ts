import { z } from 'zod';

/**
 * Unified Chart Type Taxonomy
 * 
 * Shared by Dashboard and Report widgets.
 * Provides a comprehensive set of chart types for data visualization.
 */

/**
 * Chart Type Enum
 * Categorized by visualization purpose
 */
export const ChartTypeSchema = z.enum([
  // Comparison
  'bar',
  'horizontal-bar',
  'column',
  'grouped-bar',
  'stacked-bar',
  
  // Trend
  'line',
  'area',
  'stacked-area',
  'step-line',
  
  // Distribution
  'pie',
  'donut',
  'funnel',
  
  // Relationship
  'scatter',
  'bubble',
  
  // Composition
  'treemap',
  'sunburst',
  'sankey',
  
  // Performance
  'gauge',
  'metric',
  'kpi',
  
  // Geo
  'choropleth',
  'bubble-map',
  
  // Advanced
  'heatmap',
  'radar',
  'waterfall',
  'box-plot',
  'violin',
  
  // Tabular
  'table',
  'pivot',
]);

export type ChartType = z.infer<typeof ChartTypeSchema>;

/**
 * Chart Configuration Base
 * Common configuration for all chart types
 */
export const ChartConfigSchema = z.object({
  type: ChartTypeSchema,
  title: z.string().optional().describe('Chart title'),
  description: z.string().optional().describe('Chart description'),
  showLegend: z.boolean().optional().default(true).describe('Display legend'),
  showDataLabels: z.boolean().optional().default(false).describe('Display data labels on chart'),
  colors: z.array(z.string()).optional().describe('Custom color palette'),
});

export type ChartConfig = z.infer<typeof ChartConfigSchema>;
