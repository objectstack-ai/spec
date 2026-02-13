// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';
import { I18nLabelSchema, AriaPropsSchema } from './i18n.zod';

/**
 * Empty Properties Schema
 */
const EmptyProps = z.object({});

/**
 * ----------------------------------------------------------------------
 * 1. Structure Components
 * ----------------------------------------------------------------------
 */

export const PageHeaderProps = z.object({
  title: I18nLabelSchema.describe('Page title'),
  subtitle: I18nLabelSchema.optional().describe('Page subtitle'),
  icon: z.string().optional().describe('Icon name'),
  breadcrumb: z.boolean().default(true).describe('Show breadcrumb'),
  actions: z.array(z.string()).optional().describe('Action IDs to show in header'),
  /** ARIA accessibility */
  aria: AriaPropsSchema.optional().describe('ARIA accessibility attributes'),
});

export const PageTabsProps = z.object({
  type: z.enum(['line', 'card', 'pill']).default('line'),
  position: z.enum(['top', 'left']).default('top'),
  items: z.array(z.object({
    label: I18nLabelSchema,
    icon: z.string().optional(),
    children: z.array(z.unknown()).describe('Child components')
  })),
  /** ARIA accessibility */
  aria: AriaPropsSchema.optional().describe('ARIA accessibility attributes'),
});

export const PageCardProps = z.object({
  title: I18nLabelSchema.optional(),
  bordered: z.boolean().default(true),
  actions: z.array(z.string()).optional(),
  /** Slot for nested content in the Card body */
  body: z.array(z.unknown()).optional().describe('Card content components (slot)'),
  /** Slot for footer content */
  footer: z.array(z.unknown()).optional().describe('Card footer components (slot)'),
  /** ARIA accessibility */
  aria: AriaPropsSchema.optional().describe('ARIA accessibility attributes'),
});

/**
 * ----------------------------------------------------------------------
 * 2. Record Context Components
 * ----------------------------------------------------------------------
 */

export const RecordDetailsProps = z.object({
  columns: z.enum(['1', '2', '3', '4']).default('2').describe('Number of columns for field layout (1-4)'),
  layout: z.enum(['auto', 'custom']).default('auto').describe('Layout mode: auto uses object compactLayout, custom uses explicit sections'),
  sections: z.array(z.string()).optional().describe('Section IDs to show (required when layout is "custom")'),
  fields: z.array(z.string()).optional().describe('Explicit field list to display (optional, overrides compactLayout)'),
  /** ARIA accessibility */
  aria: AriaPropsSchema.optional().describe('ARIA accessibility attributes'),
});

export const RecordRelatedListProps = z.object({
  objectName: z.string().describe('Related object name (e.g., "task", "opportunity")'),
  relationshipField: z.string().describe('Field on related object that points to this record (e.g., "account_id")'),
  columns: z.array(z.string()).describe('Fields to display in the related list'),
  sort: z.union([
    z.string(),
    z.array(z.object({
      field: z.string(),
      order: z.enum(['asc', 'desc'])
    }))
  ]).optional().describe('Sort order for related records'),
  limit: z.number().int().positive().default(5).describe('Number of records to display initially'),
  filter: z.array(z.unknown()).optional().describe('Additional filter criteria for related records'),
  title: I18nLabelSchema.optional().describe('Custom title for the related list'),
  showViewAll: z.boolean().default(true).describe('Show "View All" link to see all related records'),
  actions: z.array(z.string()).optional().describe('Action IDs available for related records'),
  /** ARIA accessibility */
  aria: AriaPropsSchema.optional().describe('ARIA accessibility attributes'),
});

export const RecordHighlightsProps = z.object({
  fields: z.array(z.string()).min(1).max(7).describe('Key fields to highlight (1-7 fields max, typically displayed as prominent cards)'),
  layout: z.enum(['horizontal', 'vertical']).default('horizontal').describe('Layout orientation for highlight fields'),
  /** ARIA accessibility */
  aria: AriaPropsSchema.optional().describe('ARIA accessibility attributes'),
});

export const RecordActivityProps = z.object({
  types: z.array(z.enum(['task', 'event', 'email', 'call', 'note'])).optional().describe('Activity types to display'),
  limit: z.number().int().positive().default(10).describe('Number of activities to show'),
  showCompleted: z.boolean().default(false).describe('Include completed activities'),
  /** ARIA accessibility */
  aria: AriaPropsSchema.optional().describe('ARIA accessibility attributes'),
});

export const RecordPathProps = z.object({
  statusField: z.string().describe('Field name representing the current status/stage'),
  stages: z.array(z.object({
    value: z.string(),
    label: I18nLabelSchema,
  })).optional().describe('Explicit stage definitions (if not using field metadata)'),
  /** ARIA accessibility */
  aria: AriaPropsSchema.optional().describe('ARIA accessibility attributes'),
});

export const PageAccordionProps = z.object({
  items: z.array(z.object({
    label: I18nLabelSchema,
    icon: z.string().optional(),
    collapsed: z.boolean().default(false),
    children: z.array(z.unknown()).describe('Child components'),
  })),
  allowMultiple: z.boolean().default(false).describe('Allow multiple panels to be expanded simultaneously'),
  /** ARIA accessibility */
  aria: AriaPropsSchema.optional().describe('ARIA accessibility attributes'),
});

export const AIChatWindowProps = z.object({
  mode: z.enum(['float', 'sidebar', 'inline']).default('float').describe('Display mode for the chat window'),
  agentId: z.string().optional().describe('Specific AI agent to use'),
  context: z.record(z.string(), z.unknown()).optional().describe('Contextual data to pass to the AI'),
  /** ARIA accessibility */
  aria: AriaPropsSchema.optional().describe('ARIA accessibility attributes'),
});

/**
 * ----------------------------------------------------------------------
 * Component Props Map
 * Maps Component Type to its Property Schema
 * ----------------------------------------------------------------------
 */
export const ComponentPropsMap = {
  // Structure
  'page:header': PageHeaderProps,
  'page:tabs': PageTabsProps,
  'page:card': PageCardProps,
  'page:footer': EmptyProps,
  'page:sidebar': EmptyProps,
  'page:accordion': PageAccordionProps,
  'page:section': EmptyProps,

  // Record
  'record:details': RecordDetailsProps,
  'record:related_list': RecordRelatedListProps,
  'record:highlights': RecordHighlightsProps,
  'record:activity': RecordActivityProps,
  'record:chatter': EmptyProps,
  'record:path': RecordPathProps,

  // Navigation
  'app:launcher': EmptyProps,
  'nav:menu': EmptyProps,
  'nav:breadcrumb': EmptyProps,

  // Utility
  'global:search': EmptyProps,
  'global:notifications': EmptyProps,
  'user:profile': EmptyProps,
  
  // AI
  'ai:chat_window': AIChatWindowProps,
  'ai:suggestion': z.object({ context: z.string().optional() })
} as const;

/**
 * Type Helper to extract props from map
 */
export type ComponentProps<T extends keyof typeof ComponentPropsMap> = z.infer<typeof ComponentPropsMap[T]>;
export type ComponentPropsInput<T extends keyof typeof ComponentPropsMap> = z.input<typeof ComponentPropsMap[T]>;
