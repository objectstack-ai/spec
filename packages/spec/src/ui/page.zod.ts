import { z } from 'zod';
import { DashboardWidgetSchema } from './dashboard.zod';

/**
 * Page Region Schema
 * A named region in the template where components are dropped.
 */
export const PageRegionSchema = z.object({
  name: z.string().describe('Region name (e.g. "sidebar", "main", "header")'),
  width: z.enum(['small', 'medium', 'large', 'full']).optional(),
  components: z.array(z.lazy(() => PageComponentSchema)).describe('Components in this region')
});

/**
 * Page Component Schema
 * A configured instance of a UI component.
 */
export const PageComponentSchema = z.object({
  /** Definition */
  type: z.string().describe('Component Type (e.g. "steedos-labs.related-list")'),
  id: z.string().optional().describe('Unique instance ID'),
  
  /** Configuration */
  label: z.string().optional(),
  properties: z.record(z.any()).describe('Component props passed to the widget'),
  
  /** Visibility Rule */
  visibility: z.string().optional().describe('Visibility filter/formula')
});

/**
 * Page Schema
 * Defines a composition of components for a specific context (Record, Home, App).
 * Compare to Salesforce FlexiPage.
 */
export const PageSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/),
  label: z.string(),
  description: z.string().optional(),
  
  /** Page Type */
  type: z.enum(['record', 'home', 'app', 'utility']).default('record'),
  
  /** Context */
  object: z.string().optional().describe('Bound object (for Record pages)'),
  
  /** Layout Template */
  template: z.string().default('default').describe('Layout template name (e.g. "header-sidebar-main")'),
  
  /** Regions & Content */
  regions: z.array(PageRegionSchema).describe('Defined regions with components'),
  
  /** Activation */
  isDefault: z.boolean().default(false),
  assignedProfiles: z.array(z.string()).optional()
});

export type Page = z.infer<typeof PageSchema>;
export type PageComponent = z.infer<typeof PageComponentSchema>;
export type PageRegion = z.infer<typeof PageRegionSchema>;
