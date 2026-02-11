// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';
import { SnakeCaseIdentifierSchema } from '../shared/identifiers.zod';
import { I18nLabelSchema, AriaPropsSchema } from './i18n.zod';
import { ResponsiveConfigSchema } from './responsive.zod';

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
 * Standard Page Component Types
 */
export const PageComponentType = z.enum([
  // Structure
  'page:header', 'page:footer', 'page:sidebar', 'page:tabs', 'page:accordion', 'page:card', 'page:section',
  // Record Context
  'record:details', 'record:highlights', 'record:related_list', 'record:activity', 'record:chatter', 'record:path',
  // Navigation
  'app:launcher', 'nav:menu', 'nav:breadcrumb',
  // Utility
  'global:search', 'global:notifications', 'user:profile',
  // AI
  'ai:chat_window', 'ai:suggestion'
]);

/**
 * Page Component Schema
 * A configured instance of a UI component.
 */
export const PageComponentSchema = z.object({
  /** Definition */
  type: z.union([
    PageComponentType,
    z.string()
  ]).describe('Component Type (Standard enum or custom string)'),
  id: z.string().optional().describe('Unique instance ID'),
  
  /** Configuration */
  label: I18nLabelSchema.optional(),
  properties: z.record(z.string(), z.unknown()).describe('Component props passed to the widget. See component.zod.ts for schemas.'),
  
  /** 
   * Event Handlers 
   * Map event names to Action expressions.
   * "onClick": "set_variable('userId', $event.id)"
   * "onRowSelect": "navigate_to('page_detail', { id: $event.id })"
   */
  events: z.record(z.string(), z.string()).optional().describe('Event handlers map'),

  /** Appearance */
  style: z.record(z.string(), z.string()).optional().describe('Inline styles or utility classes'),
  className: z.string().optional().describe('CSS class names'),

  /** Visibility Rule */
  visibility: z.string().optional().describe('Visibility filter/formula'),

  /** Responsive layout overrides per breakpoint */
  responsive: ResponsiveConfigSchema.optional().describe('Responsive layout configuration'),

  /** ARIA accessibility attributes */
  aria: AriaPropsSchema.optional().describe('ARIA accessibility attributes'),
});

/**
 * Page Variable Schema
 * Defines local state for the page.
 */
export const PageVariableSchema = z.object({
  name: z.string().describe('Variable name'),
  type: z.enum(['string', 'number', 'boolean', 'object', 'array']).default('string'),
  defaultValue: z.unknown().optional(),
});

/**
 * Page Schema
 * Defines a composition of components for a specific context (Record, Home, App).
 * Compare to Salesforce FlexiPage.
 * 
 * **NAMING CONVENTION:**
 * Page names are used in routing and must be lowercase snake_case.
 * Prefix with 'page_' is recommended for clarity.
 * 
 * @example Good page names
 * - 'page_dashboard'
 * - 'page_settings'
 * - 'home_page'
 * - 'record_detail'
 * 
 * @example Bad page names (will be rejected)
 * - 'PageDashboard' (PascalCase)
 * - 'Settings Page' (spaces)
 */
export const PageSchema = z.object({
  name: SnakeCaseIdentifierSchema.describe('Page unique name (lowercase snake_case)'),
  label: I18nLabelSchema,
  description: I18nLabelSchema.optional(),
  
  /** Page Type */
  type: z.enum(['record', 'home', 'app', 'utility']).default('record'),
  
  /** Page State Definitions */
  variables: z.array(PageVariableSchema).optional().describe('Local page state variables'),

  /** Context */
  object: z.string().optional().describe('Bound object (for Record pages)'),
  
  /** Layout Template */
  template: z.string().default('default').describe('Layout template name (e.g. "header-sidebar-main")'),
  
  /** Regions & Content */
  regions: z.array(PageRegionSchema).describe('Defined regions with components'),
  
  /** Activation */
  isDefault: z.boolean().default(false),
  assignedProfiles: z.array(z.string()).optional(),

  /** ARIA accessibility attributes */
  aria: AriaPropsSchema.optional().describe('ARIA accessibility attributes'),
});

export type Page = z.infer<typeof PageSchema>;
export type PageComponent = z.infer<typeof PageComponentSchema>;
export type PageRegion = z.infer<typeof PageRegionSchema>;
export type PageVariable = z.infer<typeof PageVariableSchema>;
