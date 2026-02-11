// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';
import { SnakeCaseIdentifierSchema } from '../shared/identifiers.zod';
import { I18nLabelSchema } from './i18n.zod';

/**
 * Base Navigation Item Schema
 * Shared properties for all navigation types.
 * 
 * **NAMING CONVENTION:**
 * Navigation item IDs are used in URLs and configuration and must be lowercase snake_case.
 * 
 * @example Good IDs
 * - 'menu_accounts'
 * - 'page_dashboard'
 * - 'nav_settings'
 * 
 * @example Bad IDs (will be rejected)
 * - 'MenuAccounts' (PascalCase)
 * - 'Page Dashboard' (spaces)
 */
const BaseNavItemSchema = z.object({
  /** Unique identifier for the item */
  id: SnakeCaseIdentifierSchema.describe('Unique identifier for this navigation item (lowercase snake_case)'),
  
  /** Display label */
  label: I18nLabelSchema.describe('Display proper label'),
  
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
  params: z.record(z.string(), z.unknown()).optional().describe('Parameters passed to the page context'),
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
    // Object Item can now have children (Airtable style: Object -> Views)
    ObjectNavItemSchema.extend({
      children: z.array(NavigationItemSchema).optional().describe('Child navigation items (e.g. specific views)'),
    }),
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
 * 
 * **NAMING CONVENTION:**
 * App names are used in URLs and routing and must be lowercase snake_case.
 * Prefix with 'app_' is recommended for clarity.
 * 
 * @example Good app names
 * - 'app_crm'
 * - 'app_finance'
 * - 'app_portal'
 * - 'sales_app'
 * 
 * @example Bad app names (will be rejected)
 * - 'CRM' (uppercase)
 * - 'FinanceApp' (mixed case)
 * - 'Sales App' (spaces)
 */
/**
 * App Configuration Schema
 * Defines a business application container, including its navigation, branding, and permissions.
 * 
 * @example CRM App
 * {
 *   name: "crm",
 *   label: "Sales CRM",
 *   icon: "briefcase",
 *   navigation: [
 *     { type: "object", id: "nav_leads", label: "Leads", objectName: "leads" },
 *     { type: "object", id: "nav_deals", label: "Deals", objectName: "deals" }
 *   ],
 *   requiredPermissions: ["app.crm.access"]
 * }
 */
export const AppSchema = z.object({
  /** Machine name (id) */
  name: SnakeCaseIdentifierSchema.describe('App unique machine name (lowercase snake_case)'),
  
  /** Display label */
  label: I18nLabelSchema.describe('App display label'),

  /** App version */
  version: z.string().optional().describe('App version'),
  
  /** Description */
  description: I18nLabelSchema.optional().describe('App description'),
  
  /** Icon name (Lucide) */
  icon: z.string().optional().describe('App icon used in the App Launcher'),
  
  /** Branding/Theming Configuration */
  branding: AppBrandingSchema.optional().describe('App-specific branding'),
  
  /** Application status */
  active: z.boolean().optional().default(true).describe('Whether the app is enabled'),

  /** Is this the default app for new users? */
  isDefault: z.boolean().optional().default(false).describe('Is default app'),
  
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
  objects: z.array(z.unknown()).optional().describe('Objects belonging to this app'),
  apis: z.array(z.unknown()).optional().describe('Custom APIs belonging to this app'),

  /** Mobile navigation mode */
  mobileNavigation: z.object({
    mode: z.enum(['drawer', 'bottom_nav', 'hamburger']).default('drawer')
      .describe('Mobile navigation mode: drawer sidebar, bottom navigation bar, or hamburger menu'),
    bottomNavItems: z.array(z.string()).optional()
      .describe('Navigation item IDs to show in bottom nav (max 5)'),
  }).optional().describe('Mobile-specific navigation configuration'),
});

/**
 * App Factory Helper
 */
export const App = {
  create: (config: z.input<typeof AppSchema>): App => AppSchema.parse(config),
} as const;

// Main Types
export type App = z.infer<typeof AppSchema>;
export type AppInput = z.input<typeof AppSchema>;
export type AppBranding = z.infer<typeof AppBrandingSchema>;
export type NavigationItem = z.infer<typeof NavigationItemSchema>;

// Discriminated Item Types (Helper exports)
export type ObjectNavItem = z.infer<typeof ObjectNavItemSchema>;
export type DashboardNavItem = z.infer<typeof DashboardNavItemSchema>;
export type PageNavItem = z.infer<typeof PageNavItemSchema>;
export type UrlNavItem = z.infer<typeof UrlNavItemSchema>;
export type GroupNavItem = z.infer<typeof GroupNavItemSchema> & { children: NavigationItem[] };
