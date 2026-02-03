import { z } from 'zod';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * LAYOUT COMPONENTS PROTOCOL
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Structural components for organizing content in enterprise management software.
 * Mobile-first responsive design with adaptive layouts.
 * 
 * **Design Principles:**
 * - Responsive grid system (12-column)
 * - Flexbox-based layouts
 * - CSS Grid support
 * - Mobile-first breakpoints
 * - Accessibility-first navigation
 */

// ══════════════════════════════════════════════════════════════════════════════
// 1. CONTAINER COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Card Props
 * Content container with optional header/footer
 */
export const CardPropsSchema = z.object({
  title: z.string().optional().describe('Card title'),
  subtitle: z.string().optional().describe('Card subtitle'),
  bordered: z.boolean().default(true).describe('Show border'),
  shadow: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('sm').describe('Shadow elevation'),
  padding: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('md').describe('Inner padding'),
  header: z.any().optional().describe('Custom header content'),
  footer: z.any().optional().describe('Custom footer content'),
  actions: z.array(z.any()).optional().describe('Action buttons in header'),
  hoverable: z.boolean().default(false).describe('Hover effect'),
  clickable: z.boolean().default(false).describe('Clickable card'),
  collapsible: z.boolean().default(false).describe('Can be collapsed'),
  defaultCollapsed: z.boolean().default(false).describe('Initially collapsed'),
  loading: z.boolean().default(false).describe('Loading state'),
  size: z.enum(['small', 'default', 'large']).default('default').describe('Card size preset'),
});

/**
 * Panel Props
 * Bordered content area
 */
export const PanelPropsSchema = z.object({
  title: z.string().optional().describe('Panel title'),
  bordered: z.boolean().default(true).describe('Show border'),
  collapsible: z.boolean().default(false).describe('Can be collapsed'),
  defaultCollapsed: z.boolean().default(false).describe('Initially collapsed'),
  showHeader: z.boolean().default(true).describe('Show header'),
  extra: z.any().optional().describe('Extra content in header'),
  size: z.enum(['small', 'default', 'large']).default('default').describe('Panel size'),
});

/**
 * Section Props
 * Semantic content section
 */
export const SectionPropsSchema = z.object({
  title: z.string().optional().describe('Section title'),
  description: z.string().optional().describe('Section description'),
  divider: z.boolean().default(false).describe('Show divider after section'),
  spacing: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('md').describe('Vertical spacing'),
  fullWidth: z.boolean().default(false).describe('Full width container'),
  centered: z.boolean().default(false).describe('Center content'),
});

/**
 * Well Props
 * Inset content area (like iOS grouped list background)
 */
export const WellPropsSchema = z.object({
  padding: z.enum(['sm', 'md', 'lg']).default('md').describe('Inner padding'),
  size: z.enum(['small', 'default', 'large']).default('default').describe('Well size'),
  variant: z.enum(['default', 'primary', 'secondary']).default('default').describe('Color variant'),
});

/**
 * Container Props
 * Responsive width container
 */
export const ContainerPropsSchema = z.object({
  maxWidth: z.enum(['sm', 'md', 'lg', 'xl', '2xl', 'full']).default('lg').describe('Maximum container width'),
  padding: z.enum(['none', 'sm', 'md', 'lg']).default('md').describe('Horizontal padding'),
  centered: z.boolean().default(true).describe('Center container'),
  fluid: z.boolean().default(false).describe('Full width (no max-width)'),
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. GRID & LAYOUT SYSTEMS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Grid Props
 * Responsive grid layout (12-column system)
 */
export const GridPropsSchema = z.object({
  columns: z.union([
    z.number().int().min(1).max(12),
    z.object({
      xs: z.number().int().min(1).max(12).optional(),
      sm: z.number().int().min(1).max(12).optional(),
      md: z.number().int().min(1).max(12).optional(),
      lg: z.number().int().min(1).max(12).optional(),
      xl: z.number().int().min(1).max(12).optional(),
    })
  ]).default(12).describe('Number of columns (responsive)'),
  gap: z.enum(['none', 'xs', 'sm', 'md', 'lg', 'xl']).default('md').describe('Gap between items'),
  gapX: z.enum(['none', 'xs', 'sm', 'md', 'lg', 'xl']).optional().describe('Horizontal gap override'),
  gapY: z.enum(['none', 'xs', 'sm', 'md', 'lg', 'xl']).optional().describe('Vertical gap override'),
  justify: z.enum(['start', 'center', 'end', 'between', 'around', 'evenly']).default('start').describe('Justify content'),
  align: z.enum(['start', 'center', 'end', 'stretch', 'baseline']).default('stretch').describe('Align items'),
});

/**
 * Grid Item Props
 * Individual grid item configuration
 */
export const GridItemPropsSchema = z.object({
  span: z.union([
    z.number().int().min(1).max(12),
    z.object({
      xs: z.number().int().min(1).max(12).optional(),
      sm: z.number().int().min(1).max(12).optional(),
      md: z.number().int().min(1).max(12).optional(),
      lg: z.number().int().min(1).max(12).optional(),
      xl: z.number().int().min(1).max(12).optional(),
    })
  ]).default(12).describe('Column span (responsive)'),
  offset: z.union([
    z.number().int().min(0).max(11),
    z.object({
      xs: z.number().int().min(0).max(11).optional(),
      sm: z.number().int().min(0).max(11).optional(),
      md: z.number().int().min(0).max(11).optional(),
      lg: z.number().int().min(0).max(11).optional(),
      xl: z.number().int().min(0).max(11).optional(),
    })
  ]).optional().describe('Column offset (responsive)'),
  order: z.number().int().optional().describe('Flex order'),
});

/**
 * Flex Props
 * Flexbox container
 */
export const FlexPropsSchema = z.object({
  direction: z.enum(['row', 'row-reverse', 'column', 'column-reverse']).default('row').describe('Flex direction'),
  wrap: z.enum(['nowrap', 'wrap', 'wrap-reverse']).default('nowrap').describe('Flex wrap'),
  justify: z.enum(['start', 'center', 'end', 'between', 'around', 'evenly']).default('start').describe('Justify content'),
  align: z.enum(['start', 'center', 'end', 'stretch', 'baseline']).default('stretch').describe('Align items'),
  gap: z.enum(['none', 'xs', 'sm', 'md', 'lg', 'xl']).default('md').describe('Gap between items'),
  inline: z.boolean().default(false).describe('Inline flex'),
});

/**
 * Stack Props
 * Vertical or horizontal stack with spacing
 */
export const StackPropsSchema = z.object({
  direction: z.enum(['horizontal', 'vertical']).default('vertical').describe('Stack direction'),
  spacing: z.enum(['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']).default('md').describe('Space between items'),
  align: z.enum(['start', 'center', 'end', 'stretch']).default('start').describe('Align items'),
  divider: z.boolean().default(false).describe('Show divider between items'),
  wrap: z.boolean().default(false).describe('Allow wrapping'),
});

/**
 * Masonry Props
 * Masonry grid layout (Pinterest-style)
 */
export const MasonryPropsSchema = z.object({
  columns: z.union([
    z.number().int().min(1).max(8),
    z.object({
      xs: z.number().int().min(1).max(8).optional(),
      sm: z.number().int().min(1).max(8).optional(),
      md: z.number().int().min(1).max(8).optional(),
      lg: z.number().int().min(1).max(8).optional(),
    })
  ]).default(3).describe('Number of columns (responsive)'),
  gap: z.enum(['none', 'xs', 'sm', 'md', 'lg', 'xl']).default('md').describe('Gap between items'),
});

/**
 * Split Pane Props
 * Resizable split view
 */
export const SplitPanePropsSchema = z.object({
  orientation: z.enum(['horizontal', 'vertical']).default('horizontal').describe('Split direction'),
  defaultSize: z.union([z.number(), z.string()]).default('50%').describe('Initial size of first pane'),
  minSize: z.union([z.number(), z.string()]).optional().describe('Minimum size of first pane'),
  maxSize: z.union([z.number(), z.string()]).optional().describe('Maximum size of first pane'),
  resizable: z.boolean().default(true).describe('Allow resizing'),
  snap: z.boolean().default(false).describe('Snap to min/max on drag'),
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. NAVIGATION COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Tabs Props
 * Tabbed navigation
 */
export const TabsPropsSchema = z.object({
  items: z.array(z.object({
    key: z.string(),
    label: z.string(),
    icon: z.string().optional(),
    disabled: z.boolean().optional(),
    closable: z.boolean().optional(),
  })).describe('Tab items'),
  defaultActiveKey: z.string().optional().describe('Initially active tab'),
  type: z.enum(['line', 'card', 'pill']).default('line').describe('Tab style'),
  position: z.enum(['top', 'bottom', 'left', 'right']).default('top').describe('Tab position'),
  size: z.enum(['small', 'medium', 'large']).default('medium').describe('Tab size'),
  centered: z.boolean().default(false).describe('Center tabs'),
  animated: z.boolean().default(true).describe('Animate tab transitions'),
  hideTabBar: z.boolean().default(false).describe('Hide tab bar (show content only)'),
});

/**
 * Accordion Props
 * Collapsible panels
 */
export const AccordionPropsSchema = z.object({
  items: z.array(z.object({
    key: z.string(),
    title: z.string(),
    subtitle: z.string().optional(),
    icon: z.string().optional(),
    disabled: z.boolean().optional(),
  })).describe('Accordion items'),
  defaultActiveKeys: z.array(z.string()).optional().describe('Initially expanded items'),
  multiple: z.boolean().default(false).describe('Allow multiple expanded panels'),
  collapsible: z.enum(['header', 'icon', 'disabled']).default('header').describe('Collapsible trigger'),
  bordered: z.boolean().default(true).describe('Show borders'),
  ghost: z.boolean().default(false).describe('Ghost mode (no background/border)'),
  expandIconPosition: z.enum(['left', 'right']).default('left').describe('Expand icon position'),
});

/**
 * Stepper Props
 * Step-by-step navigation (wizard)
 */
export const StepperPropsSchema = z.object({
  steps: z.array(z.object({
    key: z.string(),
    title: z.string(),
    description: z.string().optional(),
    icon: z.string().optional(),
    status: z.enum(['wait', 'process', 'finish', 'error']).optional(),
  })).describe('Steps'),
  currentStep: z.number().int().min(0).default(0).describe('Current active step'),
  orientation: z.enum(['horizontal', 'vertical']).default('horizontal').describe('Stepper orientation'),
  size: z.enum(['small', 'default']).default('default').describe('Step size'),
  labelPlacement: z.enum(['horizontal', 'vertical']).default('horizontal').describe('Label position'),
  clickable: z.boolean().default(false).describe('Allow clicking steps to navigate'),
  showProgress: z.boolean().default(false).describe('Show progress bar'),
});

/**
 * Breadcrumb Props
 * Breadcrumb navigation
 */
export const BreadcrumbPropsSchema = z.object({
  items: z.array(z.object({
    label: z.string(),
    href: z.string().optional(),
    icon: z.string().optional(),
  })).describe('Breadcrumb items'),
  separator: z.enum(['slash', 'chevron', 'arrow', 'custom']).default('chevron').describe('Separator type'),
  customSeparator: z.string().optional().describe('Custom separator text/icon'),
  maxItems: z.number().int().positive().optional().describe('Max items before collapse'),
  showHome: z.boolean().default(true).describe('Show home icon'),
});

/**
 * Pagination Props
 * Page navigation
 */
export const PaginationPropsSchema = z.object({
  total: z.number().int().min(0).describe('Total number of items'),
  pageSize: z.number().int().positive().default(10).describe('Items per page'),
  currentPage: z.number().int().positive().default(1).describe('Current page number'),
  pageSizeOptions: z.array(z.number().int().positive()).default([10, 20, 50, 100]).describe('Page size options'),
  showSizeChanger: z.boolean().default(true).describe('Show page size selector'),
  showQuickJumper: z.boolean().default(false).describe('Show quick page jumper'),
  showTotal: z.boolean().default(true).describe('Show total count'),
  totalFormat: z.string().optional().describe('Total display format (e.g., "Total {total} items")'),
  simple: z.boolean().default(false).describe('Simple mode (prev/next only)'),
  size: z.enum(['small', 'default', 'large']).default('default').describe('Pagination size'),
  hideOnSinglePage: z.boolean().default(false).describe('Hide when only one page'),
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. OVERLAY COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Modal Props
 * Dialog/modal overlay
 */
export const ModalPropsSchema = z.object({
  title: z.string().optional().describe('Modal title'),
  size: z.enum(['xs', 'sm', 'md', 'lg', 'xl', 'full']).default('md').describe('Modal size'),
  centered: z.boolean().default(false).describe('Vertically center modal'),
  closable: z.boolean().default(true).describe('Show close button'),
  maskClosable: z.boolean().default(true).describe('Close on backdrop click'),
  keyboard: z.boolean().default(true).describe('Close on Esc key'),
  showFooter: z.boolean().default(true).describe('Show footer'),
  okText: z.string().default('OK').describe('OK button text'),
  cancelText: z.string().default('Cancel').describe('Cancel button text'),
  loading: z.boolean().default(false).describe('Loading state'),
  destroyOnClose: z.boolean().default(false).describe('Destroy content on close'),
  zIndex: z.number().int().optional().describe('Custom z-index'),
  fullscreen: z.boolean().default(false).describe('Fullscreen mode'),
});

/**
 * Drawer Props
 * Side panel overlay
 */
export const DrawerPropsSchema = z.object({
  title: z.string().optional().describe('Drawer title'),
  placement: z.enum(['left', 'right', 'top', 'bottom']).default('right').describe('Drawer position'),
  size: z.union([z.enum(['xs', 'sm', 'md', 'lg', 'xl']), z.number(), z.string()]).default('md').describe('Drawer size'),
  closable: z.boolean().default(true).describe('Show close button'),
  maskClosable: z.boolean().default(true).describe('Close on backdrop click'),
  keyboard: z.boolean().default(true).describe('Close on Esc key'),
  showFooter: z.boolean().default(false).describe('Show footer'),
  push: z.boolean().default(true).describe('Push page content when open'),
  destroyOnClose: z.boolean().default(false).describe('Destroy content on close'),
  zIndex: z.number().int().optional().describe('Custom z-index'),
});

/**
 * Popover Props
 * Floating content on hover/click
 */
export const PopoverPropsSchema = z.object({
  title: z.string().optional().describe('Popover title'),
  content: z.string().describe('Popover content'),
  trigger: z.enum(['hover', 'click', 'focus', 'manual']).default('hover').describe('Trigger method'),
  placement: z.enum([
    'top', 'topLeft', 'topRight',
    'bottom', 'bottomLeft', 'bottomRight',
    'left', 'leftTop', 'leftBottom',
    'right', 'rightTop', 'rightBottom'
  ]).default('top').describe('Popover position'),
  arrow: z.boolean().default(true).describe('Show arrow'),
  showClose: z.boolean().default(false).describe('Show close button'),
  mouseEnterDelay: z.number().default(100).describe('Delay before showing (ms)'),
  mouseLeaveDelay: z.number().default(100).describe('Delay before hiding (ms)'),
});

/**
 * Tooltip Props
 * Hover text hint
 */
export const TooltipPropsSchema = z.object({
  content: z.string().describe('Tooltip content'),
  placement: z.enum([
    'top', 'topLeft', 'topRight',
    'bottom', 'bottomLeft', 'bottomRight',
    'left', 'leftTop', 'leftBottom',
    'right', 'rightTop', 'rightBottom'
  ]).default('top').describe('Tooltip position'),
  trigger: z.enum(['hover', 'focus', 'click']).default('hover').describe('Trigger method'),
  arrow: z.boolean().default(true).describe('Show arrow'),
  mouseEnterDelay: z.number().default(100).describe('Delay before showing (ms)'),
  mouseLeaveDelay: z.number().default(100).describe('Delay before hiding (ms)'),
  maxWidth: z.string().optional().describe('Maximum width'),
});

/**
 * Toast/Notification Props
 * Temporary message notification
 */
export const ToastPropsSchema = z.object({
  message: z.string().describe('Toast message'),
  description: z.string().optional().describe('Additional description'),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info').describe('Toast type'),
  duration: z.number().default(3000).describe('Auto-close duration (ms, 0 = no auto-close)'),
  position: z.enum([
    'top-left', 'top-center', 'top-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ]).default('top-right').describe('Toast position'),
  closable: z.boolean().default(true).describe('Show close button'),
  icon: z.string().optional().describe('Custom icon'),
  action: z.object({
    label: z.string(),
    onClick: z.string(),
  }).optional().describe('Action button'),
});

/**
 * Dropdown Menu Props
 * Contextual dropdown menu
 */
export const DropdownPropsSchema = z.object({
  items: z.array(z.union([
    z.object({
      type: z.literal('item'),
      key: z.string(),
      label: z.string(),
      icon: z.string().optional(),
      disabled: z.boolean().optional(),
      danger: z.boolean().optional(),
    }),
    z.object({
      type: z.literal('divider'),
    }),
    z.object({
      type: z.literal('group'),
      label: z.string(),
      items: z.array(z.any()),
    })
  ])).describe('Menu items'),
  trigger: z.array(z.enum(['click', 'hover', 'contextMenu'])).default(['click']).describe('Trigger methods'),
  placement: z.enum([
    'bottomLeft', 'bottom', 'bottomRight',
    'topLeft', 'top', 'topRight'
  ]).default('bottomLeft').describe('Dropdown position'),
  arrow: z.boolean().default(false).describe('Show arrow'),
});

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT REGISTRATION
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Layout Component Props Map
 */
export const LayoutComponentPropsMap = {
  // Containers
  'layout:card': CardPropsSchema,
  'layout:panel': PanelPropsSchema,
  'layout:section': SectionPropsSchema,
  'layout:well': WellPropsSchema,
  'layout:container': ContainerPropsSchema,
  
  // Grid Systems
  'layout:grid': GridPropsSchema,
  'layout:grid_item': GridItemPropsSchema,
  'layout:flex': FlexPropsSchema,
  'layout:stack': StackPropsSchema,
  'layout:masonry': MasonryPropsSchema,
  'layout:split_pane': SplitPanePropsSchema,
  
  // Navigation
  'layout:tabs': TabsPropsSchema,
  'layout:accordion': AccordionPropsSchema,
  'layout:stepper': StepperPropsSchema,
  'layout:breadcrumb': BreadcrumbPropsSchema,
  'layout:pagination': PaginationPropsSchema,
  
  // Overlays
  'layout:modal': ModalPropsSchema,
  'layout:drawer': DrawerPropsSchema,
  'layout:popover': PopoverPropsSchema,
  'layout:tooltip': TooltipPropsSchema,
  'layout:toast': ToastPropsSchema,
  'layout:dropdown': DropdownPropsSchema,
} as const;

// ══════════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

export type CardProps = z.infer<typeof CardPropsSchema>;
export type PanelProps = z.infer<typeof PanelPropsSchema>;
export type SectionProps = z.infer<typeof SectionPropsSchema>;
export type WellProps = z.infer<typeof WellPropsSchema>;
export type ContainerProps = z.infer<typeof ContainerPropsSchema>;

export type GridProps = z.infer<typeof GridPropsSchema>;
export type GridItemProps = z.infer<typeof GridItemPropsSchema>;
export type FlexProps = z.infer<typeof FlexPropsSchema>;
export type StackProps = z.infer<typeof StackPropsSchema>;
export type MasonryProps = z.infer<typeof MasonryPropsSchema>;
export type SplitPaneProps = z.infer<typeof SplitPanePropsSchema>;

export type TabsProps = z.infer<typeof TabsPropsSchema>;
export type AccordionProps = z.infer<typeof AccordionPropsSchema>;
export type StepperProps = z.infer<typeof StepperPropsSchema>;
export type BreadcrumbProps = z.infer<typeof BreadcrumbPropsSchema>;
export type PaginationProps = z.infer<typeof PaginationPropsSchema>;

export type ModalProps = z.infer<typeof ModalPropsSchema>;
export type DrawerProps = z.infer<typeof DrawerPropsSchema>;
export type PopoverProps = z.infer<typeof PopoverPropsSchema>;
export type TooltipProps = z.infer<typeof TooltipPropsSchema>;
export type ToastProps = z.infer<typeof ToastPropsSchema>;
export type DropdownProps = z.infer<typeof DropdownPropsSchema>;
