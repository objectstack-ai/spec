import { z } from 'zod';

/**
 * Base Navigation Item Schema
 * Shared properties for all navigation types.
 */
const BaseNavItemSchema = z.object({
  /** Unique identifier for the item */
  id: z.string().describe('Unique identifier for this navigation item'),
  
  /** Display label */
  label: z.string().describe('Display proper label'),
  
  /** Icon name (Lucide) */
  icon: z.string().optional().describe('Icon name'),

  /** 
   * Visibility condition. 
   * Formula expression returning boolean. 
   * e.g. "user.is_admin || user.department == 'sales'"
   */
  visible: z.string().optional().describe('Visibility formula condition'),
});

/**
 * 1. Object Navigation Item
 * Navigates to an object's list view.
 */
export const ObjectNavItemSchema = BaseNavItemSchema.extend({
  type: z.literal('object'),
  objectName: z.string().describe('Target object name'),
  viewName: z.string().optional().describe('Default list view to open. Defaults to "all"'),
});

/**
 * 2. Dashboard Navigation Item
 * Navigates to a specific dashboard.
 */
export const DashboardNavItemSchema = BaseNavItemSchema.extend({
  type: z.literal('dashboard'),
  dashboardName: z.string().describe('Target dashboard name'),
});

/**
 * 3. Page Navigation Item
 * Navigates to a custom UI page/component.
 */
export const PageNavItemSchema = BaseNavItemSchema.extend({
  type: z.literal('page'),
  pageName: z.string().describe('Target custom page component name'),
  params: z.record(z.any()).optional().describe('Parameters passed to the page context'),
});

/**
 * 4. URL Navigation Item
 * Navigates to an external or absolute URL.
 */
export const UrlNavItemSchema = BaseNavItemSchema.extend({
  type: z.literal('url'),
  url: z.string().describe('Target external URL'),
  target: z.enum(['_self', '_blank']).default('_self').describe('Link target window'),
});

/**
 * 5. Group Navigation Item
 * A container for child navigation items (Sub-menu).
 * Does not perform navigation itself.
 */
export const GroupNavItemSchema = BaseNavItemSchema.extend({
  type: z.literal('group'),
  expanded: z.boolean().default(false).describe('Default expansion state in sidebar'),
  // children property is added in the recursive definition below
});

/**
 * Recursive Union of all navigation item types.
 * Allows constructing a navigation tree.
 */
export const NavigationItemSchema: z.ZodType<any> = z.lazy(() => 
  z.union([
    ObjectNavItemSchema,
    DashboardNavItemSchema,
    PageNavItemSchema,
    UrlNavItemSchema,
    GroupNavItemSchema.extend({
      children: z.array(NavigationItemSchema).describe('Child navigation items'),
    })
  ])
);

/**
 * App Branding Configuration
 * Allows configuring the look and feel of the specific app.
 */
export const AppBrandingSchema = z.object({
  primaryColor: z.string().optional().describe('Primary theme color hex code'),
  logo: z.string().optional().describe('Custom logo URL for this app'),
  favicon: z.string().optional().describe('Custom favicon URL for this app'),
});

/**
 * Schema for Applications (Apps).
 * A logical container for business functionality (e.g., "Sales CRM", "HR Portal").
 */
export const AppSchema = z.object({
  /** Machine name (id) */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('App unique machine name'),
  
  /** Display label */
  label: z.string().describe('App display label'),

  /** App version */
  version: z.string().optional().describe('App version'),
  
  /** Description */
  description: z.string().optional().describe('App description'),
  
  /** Icon name (Lucide) */
  icon: z.string().optional().describe('App icon used in the App Launcher'),
  
  /** Branding/Theming Configuration */
  branding: AppBrandingSchema.optional().describe('App-specific branding'),
  
  /** Application status */
  active: z.boolean().default(true).describe('Whether the app is enabled'),

  /** Is this the default app for new users? */
  isDefault: z.boolean().default(false).describe('Is default app'),
  
  /** 
   * Navigation Tree Structure.
   * Replaces the old flat 'tabs' list with a structured menu.
   */
  navigation: z.array(NavigationItemSchema).optional().describe('Structured navigation menu tree'),
  
  /** 
   * App-level Home Page Override
   * ID of the navigation item to act as the landing page.
   * If not set, usually defaults to the first navigation item.
   */
  homePageId: z.string().optional().describe('ID of the navigation item to serve as landing page'),

  /** 
   * Access Control
   * List of permissions required to access this app.
   * Modern replacement for role/profile based assignment.
   * Example: ["app.access.crm"]
   */
  requiredPermissions: z.array(z.string()).optional().describe('Permissions required to access this app'),
  
  /** 
   * Package Components (For config file convenience)
   * In a real monorepo these might be auto-discovered, but here we allow explicit registration.
   */
  objects: z.array(z.any()).optional().describe('Objects belonging to this app'),
  apis: z.array(z.any()).optional().describe('Custom APIs belonging to this app'),
});

export const App = Object.assign(AppSchema, {
  create: <T extends z.input<typeof AppSchema>>(config: T) => config,
});

// Main Types
export type App = z.infer<typeof AppSchema>;
export type AppBranding = z.infer<typeof AppBrandingSchema>;
export type NavigationItem = z.infer<typeof NavigationItemSchema>;

// Discriminated Item Types (Helper exports)
export type ObjectNavItem = z.infer<typeof ObjectNavItemSchema>;
export type DashboardNavItem = z.infer<typeof DashboardNavItemSchema>;
export type PageNavItem = z.infer<typeof PageNavItemSchema>;
export type UrlNavItem = z.infer<typeof UrlNavItemSchema>;
export type GroupNavItem = z.infer<typeof GroupNavItemSchema> & { children: NavigationItem[] };
