// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';
import { SnakeCaseIdentifierSchema } from '../shared/identifiers.zod';
import { I18nLabelSchema, AriaPropsSchema } from './i18n.zod';
import { PageSchema } from './page.zod';
import { AppBrandingSchema } from './app.zod';
import { SharingConfigSchema, EmbedConfigSchema } from './sharing.zod';

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
 * An App can contain multiple Interfaces. When used with `AppSchema.interfaces[]`,
 * the interface's `icon` and `group` properties control sidebar rendering.
 *
 * **NAMING CONVENTION:**
 * Interface names must be lowercase snake_case.
 *
 * @example Sales Workspace Interface
 * ```ts
 * const salesInterface = defineInterface({
 *   name: 'sales_workspace',
 *   label: 'Sales Workspace',
 *   icon: 'briefcase',
 *   group: 'Sales Cloud',
 *   object: 'opportunity',
 *   pages: [
 *     {
 *       name: 'pipeline',
 *       label: 'Pipeline',
 *       type: 'kanban',
 *       object: 'opportunity',
 *       regions: [],
 *     },
 *   ],
 * });
 * ```
 * 
 * @example Order Review Interface
 * ```ts
 * const reviewInterface = defineInterface({
 *   name: 'order_review',
 *   label: 'Order Review',
 *   icon: 'clipboard-check',
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

  /** Icon for sidebar display in the App's Interface→Pages menu */
  icon: z.string().optional()
    .describe('Icon name for sidebar display (Lucide icon)'),

  /** Business group for sidebar grouping (rendered as a section separator label) */
  group: z.string().optional()
    .describe('Business group label for sidebar grouping (e.g. "Sales Cloud", "Service Cloud")'),

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

  /** Sharing configuration for public access */
  sharing: SharingConfigSchema.optional().describe('Public sharing configuration'),

  /** Embed configuration for iframe embedding */
  embed: EmbedConfigSchema.optional().describe('Iframe embedding configuration'),

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
