// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';
import { SnakeCaseIdentifierSchema } from '../shared/identifiers.zod';
import { I18nLabelSchema, AriaPropsSchema } from './i18n.zod';

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
 * 5. Interface Navigation Item
 * Navigates to a specific Interface (self-contained multi-page surface).
 * Bridges AppSchema (navigation container) with InterfaceSchema (content surface).
 * 
 * **Note:** While this schema remains for backward compatibility, the preferred pattern
 * is now to use `AppSchema.interfaces[]` to declare interfaces, which automatically
 * generates a two-level Interface→Pages sidebar menu. This navigation item type is 
 * retained for explicit interface navigation and global utility entries.
 */
export const InterfaceNavItemSchema = BaseNavItemSchema.extend({
  type: z.literal('interface'),
  interfaceName: z.string().describe('Target interface name (snake_case)'),
  pageName: z.string().optional().describe('Specific page within the interface to open'),
});

/**
 * 6. Group Navigation Item
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
    InterfaceNavItemSchema,
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
 * The new architecture makes App an "Interface switcher" where the sidebar content is 
 * auto-generated from `interfaces[]`, rendering a two-level Interface→Pages menu. The 
 * `navigation[]` field is retained for global utility entries only (Settings, Help, 
 * external links) and is rendered at the bottom of the sidebar.
 * 
 * @example CRM App with new Interface-driven pattern
 * {
 *   name: "crm",
 *   label: "Sales CRM",
 *   icon: "briefcase",
 *   interfaces: ["sales_workspace", "lead_review", "sales_analytics"],
 *   defaultInterface: "sales_workspace",
 *   navigation: [
 *     { type: "page", id: "nav_settings", label: "Settings", pageName: "admin_settings" }
 *   ]
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
   * Interface names registered in this App.
   * Sidebar renders as a two-level menu: Interface (collapsible group) → Pages (menu items).
   * The runtime auto-generates the sidebar navigation from these interfaces and their pages.
   */
  interfaces: z.array(z.string()).optional()
    .describe('Interface names available in this App. Sidebar renders as Interface→Pages two-level menu.'),

  /** Default interface to activate on App launch */
  defaultInterface: z.string().optional()
    .describe('Default interface to show when the App opens'),
  
  /** 
   * Navigation Tree Structure (Global Utility Entries Only).
   * This field is now repurposed for global utility navigation items only (Settings, Help, 
   * external links, etc.) that are rendered at the bottom of the sidebar. The main sidebar 
   * content is auto-generated from `interfaces[]`.
   * 
   * For backward compatibility, this field remains optional and can still contain the full 
   * navigation tree. However, the new recommended pattern is to use `interfaces[]` for 
   * the main navigation and reserve this field for global utility entries.
   */
  navigation: z.array(NavigationItemSchema).optional().describe('Global utility navigation items (Settings, Help, external links) — rendered at bottom of sidebar'),
  
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

  /** ARIA accessibility attributes */
  aria: AriaPropsSchema.optional().describe('ARIA accessibility attributes for the application'),
});

/**
 * App Factory Helper
 */
export const App = {
  create: (config: z.input<typeof AppSchema>): App => AppSchema.parse(config),
} as const;

/**
 * Type-safe factory for creating application definitions.
 *
 * Validates the config at creation time using Zod `.parse()`.
 *
 * @example New Interface-driven pattern
 * ```ts
 * const crmApp = defineApp({
 *   name: 'crm',
 *   label: 'CRM',
 *   interfaces: ['sales_workspace', 'lead_review', 'sales_analytics'],
 *   defaultInterface: 'sales_workspace',
 *   navigation: [
 *     { id: 'nav_settings', label: 'Settings', type: 'page', pageName: 'settings' },
 *   ],
 * });
 * ```
 * 
 * @example Legacy navigation tree pattern (backward compatible)
 * ```ts
 * const crmApp = defineApp({
 *   name: 'crm',
 *   label: 'CRM',
 *   navigation: [
 *     { id: 'nav_accounts', label: 'Accounts', type: 'object', objectName: 'account' },
 *     { id: 'nav_contacts', label: 'Contacts', type: 'object', objectName: 'contact' },
 *   ],
 * });
 * ```
 */
export function defineApp(config: z.input<typeof AppSchema>): App {
  return AppSchema.parse(config);
}

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
export type InterfaceNavItem = z.infer<typeof InterfaceNavItemSchema>;
export type GroupNavItem = z.infer<typeof GroupNavItemSchema> & { children: NavigationItem[] };
