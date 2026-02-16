// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';
import { SnakeCaseIdentifierSchema } from '../shared/identifiers.zod';
import { I18nLabelSchema, AriaPropsSchema } from './i18n.zod';
import { PageSchema } from './page.zod';
import { AppBrandingSchema } from './app.zod';

/**
 * Interface Branding Schema
 * Visual branding overrides for an interface.
 * Extends AppBrandingSchema with interface-specific properties (coverImage).
 */
export const InterfaceBrandingSchema = AppBrandingSchema.extend({
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
 * Pages within an Interface use the unified `PageSchema` with interface page types
 * (dashboard, grid, kanban, record_review, etc.).
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
 *       name: 'review_queue',
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

  /** Pages — uses the unified PageSchema */
  pages: z.array(PageSchema).describe('Ordered list of pages in this interface'),

  /** Default landing page */
  homePageName: z.string().optional().describe('Default landing page name'),

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
export type InterfaceBranding = z.infer<typeof InterfaceBrandingSchema>;
