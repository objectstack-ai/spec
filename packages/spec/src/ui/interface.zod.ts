// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';
import { SnakeCaseIdentifierSchema } from '../shared/identifiers.zod';
import { I18nLabelSchema, AriaPropsSchema } from './i18n.zod';
import { PageRegionSchema, PageVariableSchema } from './page.zod';

/**
 * Interface Page Type Schema
 * Page types available within an Interface (Airtable Interface parity).
 */
export const InterfacePageTypeSchema = z.enum([
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
]);

/**
 * Record Review Config Schema
 * Configuration for a sequential record review/approval page.
 * Users navigate through records one-by-one, taking actions (approve/reject/skip).
 */
export const RecordReviewConfigSchema = z.object({
  object: z.string().describe('Target object for review'),
  filter: z.any().optional().describe('Filter criteria for review queue'),
  sort: z.array(z.object({
    field: z.string().describe('Field name to sort by'),
    order: z.enum(['asc', 'desc']).describe('Sort direction'),
  })).optional().describe('Sort order for review queue'),
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
 * Interface Page Schema
 * A page within an Interface, with Airtable-inspired page types.
 */
export const InterfacePageSchema = z.object({
  id: z.string().describe('Unique page identifier within the interface'),
  label: I18nLabelSchema.describe('Page display label'),
  description: I18nLabelSchema.optional().describe('Page description'),
  icon: z.string().optional().describe('Page icon name'),

  /** Page Type */
  type: InterfacePageTypeSchema.default('blank').describe('Page type'),

  /** Object Context */
  object: z.string().optional().describe('Bound object (for data-driven page types)'),

  /** Record Review Configuration (only for record_review pages) */
  recordReview: RecordReviewConfigSchema.optional()
    .describe('Record review configuration (required when type is "record_review")'),

  /** Page State Definitions */
  variables: z.array(PageVariableSchema).optional().describe('Local page state variables'),

  /** Layout Template */
  template: z.string().default('default').describe('Layout template name'),

  /** Regions & Content */
  regions: z.array(PageRegionSchema).describe('Defined regions with components'),

  /** ARIA accessibility attributes */
  aria: AriaPropsSchema.optional().describe('ARIA accessibility attributes'),
});

/**
 * Interface Branding Schema
 * Visual branding overrides for an interface.
 */
export const InterfaceBrandingSchema = z.object({
  primaryColor: z.string().optional().describe('Primary theme color hex code'),
  logo: z.string().optional().describe('Custom logo URL'),
  coverImage: z.string().optional().describe('Cover image URL for the interface landing'),
});

/**
 * Interface Schema
 * A self-contained, shareable, multi-page application surface.
 *
 * Unlike `AppSchema` (which is a navigation container for the full platform),
 * an Interface is a focused, role-specific surface that stitches together
 * views, elements, and actions into a cohesive experience.
 *
 * An App can contain multiple Interfaces.
 *
 * **NAMING CONVENTION:**
 * Interface names must be lowercase snake_case.
 *
 * @example
 * ```ts
 * const reviewInterface = defineInterface({
 *   name: 'order_review',
 *   label: 'Order Review',
 *   object: 'order',
 *   pages: [
 *     {
 *       id: 'review_queue',
 *       label: 'Review Queue',
 *       type: 'record_review',
 *       object: 'order',
 *       recordReview: {
 *         object: 'order',
 *         actions: [
 *           { label: 'Approve', type: 'approve', field: 'status', value: 'approved' },
 *           { label: 'Reject', type: 'reject', field: 'status', value: 'rejected' },
 *         ],
 *       },
 *       regions: [],
 *     },
 *   ],
 * });
 * ```
 */
export const InterfaceSchema = z.object({
  name: SnakeCaseIdentifierSchema.describe('Interface unique machine name (lowercase snake_case)'),
  label: I18nLabelSchema.describe('Interface display label'),
  description: I18nLabelSchema.optional().describe('Interface purpose description'),

  /** Primary object binding */
  object: z.string().optional().describe('Primary object binding (snake_case)'),

  /** Pages */
  pages: z.array(InterfacePageSchema).describe('Ordered list of pages in this interface'),

  /** Default landing page */
  homePageId: z.string().optional().describe('Default landing page ID'),

  /** Visual branding */
  branding: InterfaceBrandingSchema.optional().describe('Visual branding overrides'),

  /** Access control */
  assignedRoles: z.array(z.string()).optional().describe('Roles that can access this interface'),

  /** Default flag */
  isDefault: z.boolean().optional().describe('Whether this is the default interface for the object'),

  /** ARIA accessibility attributes */
  aria: AriaPropsSchema.optional().describe('ARIA accessibility attributes'),
});

/**
 * Type-safe factory for creating interface definitions.
 */
export function defineInterface(config: z.input<typeof InterfaceSchema>): Interface {
  return InterfaceSchema.parse(config);
}

// Type Exports
export type Interface = z.infer<typeof InterfaceSchema>;
export type InterfaceInput = z.input<typeof InterfaceSchema>;
export type InterfacePage = z.infer<typeof InterfacePageSchema>;
export type InterfacePageType = z.infer<typeof InterfacePageTypeSchema>;
export type InterfaceBranding = z.infer<typeof InterfaceBrandingSchema>;
export type RecordReviewConfig = z.infer<typeof RecordReviewConfigSchema>;
