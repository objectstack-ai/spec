import { z } from 'zod';

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
  title: z.string().describe('Page title'),
  subtitle: z.string().optional().describe('Page subtitle'),
  icon: z.string().optional().describe('Icon name'),
  breadcrumb: z.boolean().default(true).describe('Show breadcrumb'),
  actions: z.array(z.string()).optional().describe('Action IDs to show in header'),
});

export const PageTabsProps = z.object({
  type: z.enum(['line', 'card', 'pill']).default('line'),
  position: z.enum(['top', 'left']).default('top'),
  items: z.array(z.object({
    label: z.string(),
    icon: z.string().optional(),
    children: z.array(z.any()).describe('Child components')
  }))
});

export const PageCardProps = z.object({
  title: z.string().optional(),
  bordered: z.boolean().default(true),
  actions: z.array(z.string()).optional(),
  /** Slot for nested content in the Card body */
  body: z.array(z.any()).optional().describe('Card content components (slot)'),
  /** Slot for footer content */
  footer: z.array(z.any()).optional().describe('Card footer components (slot)'),
});

/**
 * ----------------------------------------------------------------------
 * 2. Record Context Components
 * ----------------------------------------------------------------------
 */

export const RecordDetailsProps = z.object({
  columns: z.enum(['1', '2', '3', '4']).default('2'),
  layout: z.enum(['auto', 'custom']).default('auto'),
  // If custom layout
  sections: z.array(z.string()).optional().describe('Section IDs to show')
});

export const RecordRelatedListProps = z.object({
  objectName: z.string().describe('Related object name'),
  relationshipField: z.string().describe('Field on related object that points to this record'),
  columns: z.array(z.string()).describe('Fields to display'),
  sort: z.string().optional(),
  limit: z.number().default(5)
});

export const RecordHighlightsProps = z.object({
  fields: z.array(z.string()).min(1).max(7).describe('Key fields to highlights (max 7)')
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
  'page:accordion': EmptyProps,
  'page:section': EmptyProps,

  // Record
  'record:details': RecordDetailsProps,
  'record:related_list': RecordRelatedListProps,
  'record:highlights': RecordHighlightsProps,
  'record:activity': EmptyProps,
  'record:chatter': EmptyProps,
  'record:path': EmptyProps,

  // Navigation
  'app:launcher': EmptyProps,
  'nav:menu': EmptyProps,
  'nav:breadcrumb': EmptyProps,

  // Utility
  'global:search': EmptyProps,
  'global:notifications': EmptyProps,
  'user:profile': EmptyProps,
  
  // AI
  'ai:chat_window': z.object({ mode: z.enum(['float', 'sidebar', 'inline']).default('float') }),
  'ai:suggestion': z.object({ context: z.string().optional() })
} as const;

/**
 * Type Helper to extract props from map
 */
export type ComponentProps<T extends keyof typeof ComponentPropsMap> = z.infer<typeof ComponentPropsMap[T]>;
