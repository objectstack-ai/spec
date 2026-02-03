import { z } from 'zod';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * COMPONENT REGISTRY - MASTER COMPONENT CATALOG
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Central registry for all UI components in the ObjectStack platform.
 * This file combines all component prop schemas from specialized modules.
 * 
 * **Architecture:**
 * - Input components: input.zod.ts (form inputs, pickers, editors)
 * - Display components: display.zod.ts (read-only content, media, stats)
 * - Layout components: layout.zod.ts (containers, grids, navigation, overlays)
 * - Data components: Defined inline (tables, lists, timelines, kanban)
 * - Feedback components: Defined inline (alerts, empty states)
 * 
 * **Import Structure:**
 * These are re-exported for convenience but defined in specialized files
 */

// Import component prop schemas from specialized modules
import { InputComponentPropsMap } from './input.zod';
import { DisplayComponentPropsMap } from './display.zod';
import { LayoutComponentPropsMap } from './layout.zod';

/**
 * Empty Properties Schema (for components with no props)
 */
const EmptyProps = z.object({});

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * 1. STRUCTURE COMPONENTS
 * ══════════════════════════════════════════════════════════════════════════════
 */

export const PageHeaderProps = z.object({
  title: z.string().describe('Page title'),
  subtitle: z.string().optional().describe('Page subtitle'),
  icon: z.string().optional().describe('Icon name'),
  breadcrumb: z.boolean().default(true).describe('Show breadcrumb'),
  actions: z.array(z.string()).optional().describe('Action IDs to show in header'),
  backButton: z.boolean().default(false).describe('Show back button'),
  sticky: z.boolean().default(false).describe('Sticky header on scroll'),
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
  children: z.array(z.any()).describe('Card content')
});

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * 2. RECORD CONTEXT COMPONENTS
 * ══════════════════════════════════════════════════════════════════════════════
 */

export const RecordDetailsProps = z.object({
  columns: z.enum(['1', '2', '3', '4']).default('2'),
  layout: z.enum(['auto', 'custom']).default('auto'),
  sections: z.array(z.string()).optional().describe('Section IDs to show'),
  compact: z.boolean().default(false).describe('Compact mode for mobile'),
});

export const RecordRelatedListProps = z.object({
  objectName: z.string().describe('Related object name'),
  relationshipField: z.string().describe('Field on related object that points to this record'),
  columns: z.array(z.string()).describe('Fields to display'),
  sort: z.string().optional(),
  limit: z.number().default(5),
  showActions: z.boolean().default(true).describe('Show action buttons'),
  inline: z.boolean().default(false).describe('Inline editing'),
});

export const RecordHighlightsProps = z.object({
  fields: z.array(z.string()).min(1).max(7).describe('Key fields to highlights (max 7)'),
  layout: z.enum(['horizontal', 'grid']).default('horizontal').describe('Layout mode'),
});

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * 3. DATA COMPONENTS (Complex data interactions)
 * ══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Advanced Data Table Props
 * Feature-rich data grid with sorting, filtering, pagination
 */
export const DataTableProps = z.object({
  columns: z.array(z.object({
    key: z.string(),
    title: z.string(),
    dataIndex: z.string().optional(),
    width: z.number().optional(),
    fixed: z.enum(['left', 'right']).optional(),
    sortable: z.boolean().default(false),
    filterable: z.boolean().default(false),
    resizable: z.boolean().default(true),
    align: z.enum(['left', 'center', 'right']).default('left'),
    ellipsis: z.boolean().default(false),
  })).describe('Table columns'),
  selectable: z.boolean().default(false).describe('Enable row selection'),
  selectType: z.enum(['checkbox', 'radio']).default('checkbox').describe('Selection type'),
  expandable: z.boolean().default(false).describe('Expandable rows'),
  pagination: z.boolean().default(true).describe('Enable pagination'),
  pageSize: z.number().default(20).describe('Rows per page'),
  bordered: z.boolean().default(true).describe('Show borders'),
  striped: z.boolean().default(false).describe('Striped rows'),
  hoverable: z.boolean().default(true).describe('Highlight row on hover'),
  sticky: z.boolean().default(false).describe('Sticky header'),
  virtual: z.boolean().default(false).describe('Virtual scrolling for large datasets'),
  loading: z.boolean().default(false).describe('Loading state'),
  size: z.enum(['small', 'medium', 'large']).default('medium').describe('Table size'),
});

/**
 * Tree View Props
 * Hierarchical data display
 */
export const TreeViewProps = z.object({
  selectable: z.boolean().default(false).describe('Enable node selection'),
  checkable: z.boolean().default(false).describe('Enable checkboxes'),
  draggable: z.boolean().default(false).describe('Enable drag-and-drop'),
  expandable: z.boolean().default(true).describe('Expandable nodes'),
  defaultExpandAll: z.boolean().default(false).describe('Expand all by default'),
  showLine: z.boolean().default(true).describe('Show connecting lines'),
  showIcon: z.boolean().default(true).describe('Show node icons'),
  virtual: z.boolean().default(false).describe('Virtual scrolling'),
  searchable: z.boolean().default(false).describe('Enable search'),
});

/**
 * Kanban Board Props
 * Drag-and-drop board view
 */
export const KanbanBoardProps = z.object({
  columns: z.array(z.object({
    id: z.string(),
    title: z.string(),
    color: z.string().optional(),
    limit: z.number().optional(),
  })).describe('Board columns'),
  draggable: z.boolean().default(true).describe('Enable drag-and-drop'),
  cardTemplate: z.string().optional().describe('Card template ID'),
  showColumnCount: z.boolean().default(true).describe('Show card count per column'),
  collapsible: z.boolean().default(false).describe('Collapsible columns'),
  swimlanes: z.boolean().default(false).describe('Enable swimlanes'),
});

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * 4. FEEDBACK COMPONENTS (Alerts, notifications, empty states)
 * ══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Alert Props
 * Contextual feedback messages
 */
export const AlertProps = z.object({
  type: z.enum(['info', 'success', 'warning', 'error']).default('info').describe('Alert type'),
  title: z.string().optional().describe('Alert title'),
  message: z.string().describe('Alert message'),
  closable: z.boolean().default(false).describe('Show close button'),
  showIcon: z.boolean().default(true).describe('Show icon'),
  icon: z.string().optional().describe('Custom icon'),
  banner: z.boolean().default(false).describe('Banner style (full width)'),
  action: z.object({
    label: z.string(),
    onClick: z.string(),
  }).optional().describe('Action button'),
});

/**
 * Empty State Props
 * No data / error state display
 */
export const EmptyStateProps = z.object({
  type: z.enum(['no-data', 'no-results', 'error', 'offline', '403', '404', '500']).default('no-data').describe('Empty state type'),
  icon: z.string().optional().describe('Custom icon'),
  title: z.string().describe('Title'),
  description: z.string().optional().describe('Description'),
  image: z.string().url().optional().describe('Illustration image'),
  actions: z.array(z.object({
    label: z.string(),
    type: z.enum(['primary', 'default']).default('default'),
    onClick: z.string(),
  })).optional().describe('Action buttons'),
  compact: z.boolean().default(false).describe('Compact mode'),
});

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * 5. MOBILE-SPECIFIC COMPONENTS
 * ══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Bottom Navigation Props
 * Mobile bottom tab bar
 */
export const BottomNavigationProps = z.object({
  items: z.array(z.object({
    key: z.string(),
    label: z.string(),
    icon: z.string(),
    badge: z.string().optional(),
  })).describe('Navigation items'),
  showLabels: z.enum(['always', 'selected', 'never']).default('always').describe('Label visibility'),
  activeColor: z.string().optional().describe('Active item color'),
});

/**
 * Floating Action Button Props
 * Mobile FAB button
 */
export const FloatingActionButtonProps = z.object({
  icon: z.string().describe('Button icon'),
  label: z.string().optional().describe('Button label'),
  position: z.enum(['bottom-right', 'bottom-left', 'bottom-center', 'top-right', 'top-left']).default('bottom-right').describe('FAB position'),
  size: z.enum(['small', 'medium', 'large']).default('medium').describe('FAB size'),
  actions: z.array(z.object({
    icon: z.string(),
    label: z.string(),
    onClick: z.string(),
  })).optional().describe('Speed dial actions'),
  variant: z.enum(['default', 'primary', 'secondary']).default('primary').describe('Color variant'),
});

/**
 * Pull to Refresh Props
 * Mobile pull-to-refresh
 */
export const PullToRefreshProps = z.object({
  enabled: z.boolean().default(true).describe('Enable pull-to-refresh'),
  threshold: z.number().default(60).describe('Pull distance to trigger (px)'),
  maxPull: z.number().default(100).describe('Maximum pull distance (px)'),
  loadingIndicator: z.enum(['spinner', 'custom']).default('spinner').describe('Loading indicator'),
});

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * COMPONENT PROPS MAP - MASTER REGISTRY
 * ══════════════════════════════════════════════════════════════════════════════
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
  'ai:suggestion': z.object({ context: z.string().optional() }),

  // Data Components
  'data:table': DataTableProps,
  'data:tree': TreeViewProps,
  'data:kanban': KanbanBoardProps,

  // Feedback Components
  'feedback:alert': AlertProps,
  'feedback:empty_state': EmptyStateProps,

  // Mobile Components
  'mobile:bottom_nav': BottomNavigationProps,
  'mobile:fab': FloatingActionButtonProps,
  'mobile:pull_refresh': PullToRefreshProps,

  // Import all Input components
  ...InputComponentPropsMap,

  // Import all Display components
  ...DisplayComponentPropsMap,

  // Import all Layout components
  ...LayoutComponentPropsMap,
} as const;

/**
 * Type Helper to extract props from map
 */
export type ComponentProps<T extends keyof typeof ComponentPropsMap> = z.infer<typeof ComponentPropsMap[T]>;
