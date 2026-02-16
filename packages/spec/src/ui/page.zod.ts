// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';
import { SnakeCaseIdentifierSchema } from '../shared/identifiers.zod';
import { SortItemSchema } from '../shared/enums.zod';
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
  'ai:chat_window', 'ai:suggestion',
  // Content Elements (Airtable Interface parity)
  'element:text', 'element:number', 'element:image', 'element:divider'
]);

/**
 * Element Data Source Schema
 * Per-element data binding for multi-object pages.
 * Overrides page-level object context so each element can query a different object.
 */
export const ElementDataSourceSchema = z.object({
  object: z.string().describe('Object to query'),
  view: z.string().optional().describe('Named view to apply'),
  filter: z.any().optional().describe('Additional filter criteria'),
  sort: z.array(SortItemSchema).optional().describe('Sort order'),
  limit: z.number().int().positive().optional().describe('Max records to display'),
});

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

  /** Per-element data binding, overrides page-level object context */
  dataSource: ElementDataSourceSchema.optional().describe('Per-element data binding for multi-object pages'),

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
 * Page Type Schema
 * Unified page type enum covering both platform pages (record, home, app, utility)
 * and Airtable-inspired interface page types (dashboard, grid, kanban, etc.).
 */
export const PageTypeSchema = z.enum([
  // Platform page types
  'record',         // Record detail page (Salesforce FlexiPage)
  'home',           // Home/landing page
  'app',            // App-level page
  'utility',        // Utility panel
  // Interface page types (Airtable Interface parity)
  'dashboard',      // KPI summary with charts/metrics
  'grid',           // Spreadsheet-like data table
  'list',           // Record list with quick actions
  'gallery',        // Card-based visual browsing
  'kanban',         // Status-based board
  'calendar',       // Date-based scheduling
  'timeline',       // Gantt-like project timeline
  'form',           // Data entry form
  'record_detail',  // Single record deep-dive
  'record_review',  // Sequential record review/approval
  'overview',       // Landing/navigation hub
  'blank',          // Free-form canvas
]).describe('Page type — platform or interface page types');

/**
 * Record Review Config Schema
 * Configuration for a sequential record review/approval page.
 * Users navigate through records one-by-one, taking actions (approve/reject/skip).
 * Only applicable when page type is 'record_review'.
 */
export const RecordReviewConfigSchema = z.object({
  object: z.string().describe('Target object for review'),
  filter: z.any().optional().describe('Filter criteria for review queue'),
  sort: z.array(SortItemSchema).optional().describe('Sort order for review queue'),
  displayFields: z.array(z.string()).optional()
    .describe('Fields to display on the review page'),
  actions: z.array(z.object({
    label: z.string().describe('Action button label'),
    type: z.enum(['approve', 'reject', 'skip', 'custom'])
      .describe('Action type'),
    field: z.string().optional()
      .describe('Field to update on action'),
    value: z.any().optional()
      .describe('Value to set on action'),
    nextRecord: z.boolean().optional().default(true)
      .describe('Auto-advance to next record after action'),
  })).describe('Review actions'),
  navigation: z.enum(['sequential', 'random', 'filtered'])
    .optional().default('sequential')
    .describe('Record navigation mode'),
  showProgress: z.boolean().optional().default(true)
    .describe('Show review progress indicator'),
});

/**
 * Page Schema
 * Defines a composition of components for a specific context.
 * Supports both platform pages (Salesforce FlexiPage style: record, home, app, utility)
 * and interface pages (Airtable Interface style: dashboard, grid, kanban, record_review, etc.).
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

  /** Icon (used in interface navigation) */
  icon: z.string().optional().describe('Page icon name'),
  
  /** Page Type */
  type: PageTypeSchema.default('record').describe('Page type'),
  
  /** Page State Definitions */
  variables: z.array(PageVariableSchema).optional().describe('Local page state variables'),

  /** Context */
  object: z.string().optional().describe('Bound object (for Record pages)'),

  /** Record Review Configuration (only for record_review pages) */
  recordReview: RecordReviewConfigSchema.optional()
    .describe('Record review configuration (required when type is "record_review")'),
  
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
export type PageType = z.infer<typeof PageTypeSchema>;
export type PageComponent = z.infer<typeof PageComponentSchema>;
export type PageRegion = z.infer<typeof PageRegionSchema>;
export type PageVariable = z.infer<typeof PageVariableSchema>;
export type ElementDataSource = z.infer<typeof ElementDataSourceSchema>;
export type RecordReviewConfig = z.infer<typeof RecordReviewConfigSchema>;
