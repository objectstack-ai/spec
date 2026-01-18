import { z } from 'zod';

/**
 * Navigation Tab Type
 */
export const TabType = z.enum([
  'entity',   // Standard object list view
  'dashboard',// Dashboard page
  'page',     // Custom page
  'url'       // External link
]);

/**
 * Schema for App Navigation Items (Tabs)
 */
export const AppTabSchema = z.object({
  name: z.string().describe('Tab unique name'),
  label: z.string().optional().describe('Override label'),
  type: TabType.default('entity').describe('Tab type'),
  
  /** 
   * Reference ID based on type:
   * - entity: entity_name
   * - dashboard: dashboard_name
   * - page: page_component_name
   * - url: https://...
   */
  reference: z.string().describe('Target reference ID'),
  
  icon: z.string().optional().describe('Icon name'),
});

/**
 * Schema for Applications (Apps).
 * An App is a container that groups tabs/entities for a specific business function.
 */
export const AppSchema = z.object({
  /** Machine name */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('App unique machine name'),
  
  /** Display label (e.g., "Sales CRM") */
  label: z.string().describe('App display label'),
  
  /** Description */
  description: z.string().optional().describe('App description'),
  
  /** Icon name (Lucide) */
  icon: z.string().optional().describe('App icon'),
  
  /** Active status */
  active: z.boolean().default(true).describe('Whether the app is enabled'),
  
  /** Ordered list of tabs/menu items */
  tabs: z.array(AppTabSchema).describe('Navigation structure'),
  
  /** 
   * Profiles/Roles that can access this app.
   * If empty, accessible to everyone (or controlled by other means).
   */
  profiles: z.array(z.string()).optional().describe('Profiles that can access this app'),
});

export type App = z.infer<typeof AppSchema>;
export type AppTab = z.infer<typeof AppTabSchema>;
