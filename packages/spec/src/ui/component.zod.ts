import { z } from 'zod';

/**
 * Component Type Enum
 * 
 * Defines all reusable UI component types available in the ObjectStack UI system.
 * These components can be composed together to build complex user interfaces for
 * enterprise management software.
 * 
 * Categories:
 * - Layout: card, tabs, accordion, modal, drawer, container, divider, space, grid, flex
 * - Navigation: breadcrumb, stepper, menu, sidebar, pagination, dropdown
 * - Data Display: table, list, tree, description, statistic, tag, collapse, carousel, image, avatar, calendar_view
 * - Data Entry: form, input, select, checkbox, radio, switch, slider, date_picker, time_picker, upload, autocomplete, cascader, transfer, color_picker, rate
 * - Feedback: alert, message, notification, progress, skeleton, spin, result, empty
 * - Interaction: button, button_group, icon_button, split_button
 * - Overlay: tooltip, popover, dialog, confirm
 * - Other: badge, timeline, steps, anchor, back_top, watermark, qrcode
 */
export const ComponentType = z.enum([
  // Layout Components
  'card',
  'tabs',
  'accordion',
  'modal',
  'drawer',
  'container',
  'divider',
  'space',
  'grid',
  'flex',
  
  // Navigation Components
  'breadcrumb',
  'stepper',
  'menu',
  'sidebar',
  'pagination',
  'dropdown',
  
  // Data Display Components
  'table',
  'list',
  'tree',
  'description',
  'statistic',
  'tag',
  'collapse',
  'carousel',
  'image',
  'avatar',
  'calendar_view',
  
  // Data Entry Components
  'form',
  'input',
  'select',
  'checkbox',
  'radio',
  'switch',
  'slider',
  'date_picker',
  'time_picker',
  'upload',
  'autocomplete',
  'cascader',
  'transfer',
  'color_picker',
  'rate',
  
  // Feedback Components
  'alert',
  'message',
  'notification',
  'progress',
  'skeleton',
  'spin',
  'result',
  'empty',
  
  // Interaction Components
  'button',
  'button_group',
  'icon_button',
  'split_button',
  
  // Overlay Components
  'tooltip',
  'popover',
  'dialog',
  'confirm',
  
  // Timeline & Process Components
  'badge',
  'timeline',
  'steps',
  
  // Other Components
  'anchor',
  'back_top',
  'watermark',
  'qrcode',
]);

/**
 * Base Component Schema Definition
 * Internal schema object that can be extended for specialized components
 */
const BaseComponentSchema = z.object({
  /** Component type identifier */
  type: ComponentType.describe('Component type'),
  
  /** Component-specific properties */
  props: z.record(z.any()).optional().describe('Component properties'),
  
  /** Event handlers */
  events: z.record(z.function()).optional().describe('Event handlers'),
  
  /** Custom CSS styles */
  style: z.record(z.string()).optional().describe('Custom styles'),
});

/**
 * Base Component Schema
 * 
 * Defines the structure for reusable UI components with support for:
 * - Component nesting via lazy-loaded children
 * - Event binding through event handlers
 * - Custom styling via style properties
 * - Flexible props configuration
 * 
 * @example
 * ```typescript
 * const card: Component = {
 *   type: 'card',
 *   props: {
 *     title: 'User Profile',
 *     subtitle: 'Account Details'
 *   },
 *   children: [
 *     {
 *       type: 'badge',
 *       props: { label: 'Premium', variant: 'success' }
 *     }
 *   ],
 *   style: {
 *     padding: '16px',
 *     borderRadius: '8px'
 *   }
 * }
 * ```
 */
export const ComponentSchema: z.ZodType<{
  type: z.infer<typeof ComponentType>;
  props?: Record<string, any>;
  children?: Array<any>;
  events?: Record<string, Function>;
  style?: Record<string, string>;
}> = BaseComponentSchema.extend({
  /** Nested child components */
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Card Component Schema
 * 
 * A container component that displays content in a card layout.
 * Commonly used for displaying grouped information with optional header, image, and actions.
 * 
 * @example
 * ```typescript
 * const card: CardComponent = {
 *   type: 'card',
 *   props: {
 *     title: 'Project Overview',
 *     subtitle: 'Q4 2025',
 *     image: 'https://example.com/project.jpg',
 *     actions: [
 *       { label: 'Edit', onClick: () => {} },
 *       { label: 'Delete', onClick: () => {} }
 *     ]
 *   },
 *   children: [
 *     { type: 'alert', props: { message: 'Project on track', variant: 'success' } }
 *   ]
 * }
 * ```
 */
export const CardComponentSchema = BaseComponentSchema.extend({
  type: z.literal('card'),
  props: z.object({
    /** Card title */
    title: z.string().optional().describe('Card title'),
    
    /** Card subtitle */
    subtitle: z.string().optional().describe('Card subtitle'),
    
    /** Header image URL */
    image: z.string().url().optional().describe('Card image URL'),
    
    /** Action buttons */
    actions: z.array(z.any()).optional().describe('Card action buttons'),
  }).optional(),
}).extend({
  /** Nested child components */
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Tabs Component Schema
 * 
 * A tabbed navigation component that allows switching between different content panels.
 * 
 * @example
 * ```typescript
 * const tabs: TabsComponent = {
 *   type: 'tabs',
 *   props: {
 *     tabs: [
 *       {
 *         label: 'Overview',
 *         icon: 'home',
 *         content: { type: 'card', props: { title: 'Overview Content' } }
 *       },
 *       {
 *         label: 'Settings',
 *         icon: 'settings',
 *         content: { type: 'card', props: { title: 'Settings Content' } }
 *       }
 *     ],
 *     defaultTab: 0
 *   }
 * }
 * ```
 */
export const TabsComponentSchema = BaseComponentSchema.extend({
  type: z.literal('tabs'),
  props: z.object({
    /** Tab definitions */
    tabs: z.array(z.object({
      /** Tab label */
      label: z.string().describe('Tab label'),
      
      /** Tab icon (Lucide icon name) */
      icon: z.string().optional().describe('Tab icon'),
      
      /** Tab content component */
      content: z.lazy(() => ComponentSchema).optional().describe('Tab content'),
    })).describe('Tab items'),
    
    /** Default active tab index (0-based) */
    defaultTab: z.number().int().min(0).optional().describe('Default active tab index'),
  }),
}).extend({
  /** Nested child components */
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Accordion Component Schema
 * 
 * An expandable/collapsible panel component for showing and hiding content.
 * 
 * @example
 * ```typescript
 * const accordion: AccordionComponent = {
 *   type: 'accordion',
 *   props: {
 *     items: [
 *       {
 *         title: 'Section 1',
 *         content: { type: 'card', props: { title: 'Content 1' } }
 *       }
 *     ],
 *     allowMultiple: false
 *   }
 * }
 * ```
 */
export const AccordionComponentSchema = BaseComponentSchema.extend({
  type: z.literal('accordion'),
  props: z.object({
    /** Accordion items */
    items: z.array(z.object({
      /** Section title */
      title: z.string().describe('Section title'),
      
      /** Section icon */
      icon: z.string().optional().describe('Section icon'),
      
      /** Section content */
      content: z.lazy(() => ComponentSchema).optional().describe('Section content'),
      
      /** Initially expanded state */
      defaultExpanded: z.boolean().optional().describe('Initially expanded'),
    })).describe('Accordion items'),
    
    /** Allow multiple sections to be open simultaneously */
    allowMultiple: z.boolean().optional().describe('Allow multiple open sections'),
  }),
}).extend({
  /** Nested child components */
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Modal Component Schema
 * 
 * A dialog overlay component that displays content in a centered popup.
 * 
 * @example
 * ```typescript
 * const modal: ModalComponent = {
 *   type: 'modal',
 *   props: {
 *     title: 'Confirm Action',
 *     size: 'medium',
 *     closeOnOverlay: true
 *   },
 *   children: [
 *     { type: 'alert', props: { message: 'Are you sure?' } }
 *   ]
 * }
 * ```
 */
export const ModalComponentSchema = BaseComponentSchema.extend({
  type: z.literal('modal'),
  props: z.object({
    /** Modal title */
    title: z.string().optional().describe('Modal title'),
    
    /** Modal size variant */
    size: z.enum(['small', 'medium', 'large', 'full']).optional().describe('Modal size'),
    
    /** Close on overlay click */
    closeOnOverlay: z.boolean().optional().describe('Close on overlay click'),
    
    /** Show close button */
    showClose: z.boolean().optional().describe('Show close button'),
  }).optional(),
}).extend({
  /** Nested child components */
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Drawer Component Schema
 * 
 * A slide-in panel component that appears from the edge of the screen.
 * 
 * @example
 * ```typescript
 * const drawer: DrawerComponent = {
 *   type: 'drawer',
 *   props: {
 *     title: 'Filters',
 *     position: 'right',
 *     size: 'medium'
 *   },
 *   children: [
 *     { type: 'card', props: { title: 'Filter Options' } }
 *   ]
 * }
 * ```
 */
export const DrawerComponentSchema = BaseComponentSchema.extend({
  type: z.literal('drawer'),
  props: z.object({
    /** Drawer title */
    title: z.string().optional().describe('Drawer title'),
    
    /** Position from which drawer slides in */
    position: z.enum(['left', 'right', 'top', 'bottom']).optional().describe('Drawer position'),
    
    /** Drawer size */
    size: z.enum(['small', 'medium', 'large', 'full']).optional().describe('Drawer size'),
    
    /** Close on overlay click */
    closeOnOverlay: z.boolean().optional().describe('Close on overlay click'),
  }).optional(),
}).extend({
  /** Nested child components */
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Timeline Component Schema
 * 
 * A chronological display of events or activities.
 * 
 * @example
 * ```typescript
 * const timeline: TimelineComponent = {
 *   type: 'timeline',
 *   props: {
 *     items: [
 *       {
 *         title: 'Project Started',
 *         timestamp: '2025-01-01T00:00:00Z',
 *         description: 'Project kickoff meeting',
 *         icon: 'play'
 *       }
 *     ],
 *     orientation: 'vertical'
 *   }
 * }
 * ```
 */
export const TimelineComponentSchema = BaseComponentSchema.extend({
  type: z.literal('timeline'),
  props: z.object({
    /** Timeline items */
    items: z.array(z.object({
      /** Event title */
      title: z.string().describe('Event title'),
      
      /** Event timestamp */
      timestamp: z.string().optional().describe('Event timestamp'),
      
      /** Event description */
      description: z.string().optional().describe('Event description'),
      
      /** Event icon */
      icon: z.string().optional().describe('Event icon'),
      
      /** Event content */
      content: z.lazy(() => ComponentSchema).optional().describe('Event content'),
    })).describe('Timeline items'),
    
    /** Timeline orientation */
    orientation: z.enum(['vertical', 'horizontal']).optional().describe('Timeline orientation'),
  }),
}).extend({
  /** Nested child components */
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Stepper Component Schema
 * 
 * A step-by-step navigation component for multi-step processes.
 * 
 * @example
 * ```typescript
 * const stepper: StepperComponent = {
 *   type: 'stepper',
 *   props: {
 *     steps: [
 *       { label: 'Account Info', icon: 'user' },
 *       { label: 'Payment', icon: 'credit-card' },
 *       { label: 'Confirmation', icon: 'check' }
 *     ],
 *     currentStep: 0,
 *     orientation: 'horizontal'
 *   }
 * }
 * ```
 */
export const StepperComponentSchema = BaseComponentSchema.extend({
  type: z.literal('stepper'),
  props: z.object({
    /** Step definitions */
    steps: z.array(z.object({
      /** Step label */
      label: z.string().describe('Step label'),
      
      /** Step description */
      description: z.string().optional().describe('Step description'),
      
      /** Step icon */
      icon: z.string().optional().describe('Step icon'),
      
      /** Step content */
      content: z.lazy(() => ComponentSchema).optional().describe('Step content'),
    })).describe('Stepper steps'),
    
    /** Current active step index (0-based) */
    currentStep: z.number().int().min(0).optional().describe('Current step index'),
    
    /** Stepper orientation */
    orientation: z.enum(['horizontal', 'vertical']).optional().describe('Stepper orientation'),
  }),
}).extend({
  /** Nested child components */
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Breadcrumb Component Schema
 * 
 * A navigation component showing the current page's location in the hierarchy.
 * 
 * @example
 * ```typescript
 * const breadcrumb: BreadcrumbComponent = {
 *   type: 'breadcrumb',
 *   props: {
 *     items: [
 *       { label: 'Home', href: '/' },
 *       { label: 'Projects', href: '/projects' },
 *       { label: 'Project 1', href: '/projects/1' }
 *     ],
 *     separator: '/'
 *   }
 * }
 * ```
 */
export const BreadcrumbComponentSchema = BaseComponentSchema.extend({
  type: z.literal('breadcrumb'),
  props: z.object({
    /** Breadcrumb items */
    items: z.array(z.object({
      /** Item label */
      label: z.string().describe('Breadcrumb label'),
      
      /** Item link */
      href: z.string().optional().describe('Breadcrumb link'),
      
      /** Item icon */
      icon: z.string().optional().describe('Breadcrumb icon'),
    })).describe('Breadcrumb items'),
    
    /** Separator between items */
    separator: z.string().optional().describe('Breadcrumb separator'),
  }),
}).extend({
  /** Nested child components */
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Alert Component Schema
 * 
 * A notification component for displaying important messages.
 * 
 * @example
 * ```typescript
 * const alert: AlertComponent = {
 *   type: 'alert',
 *   props: {
 *     title: 'Success',
 *     message: 'Your changes have been saved.',
 *     variant: 'success',
 *     dismissible: true
 *   }
 * }
 * ```
 */
export const AlertComponentSchema = BaseComponentSchema.extend({
  type: z.literal('alert'),
  props: z.object({
    /** Alert title */
    title: z.string().optional().describe('Alert title'),
    
    /** Alert message */
    message: z.string().describe('Alert message'),
    
    /** Alert variant/severity */
    variant: z.enum(['info', 'success', 'warning', 'error']).optional().describe('Alert variant'),
    
    /** Allow dismissing the alert */
    dismissible: z.boolean().optional().describe('Dismissible alert'),
    
    /** Alert icon */
    icon: z.string().optional().describe('Alert icon'),
  }),
}).extend({
  /** Nested child components */
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Badge Component Schema
 * 
 * A small label component for highlighting status or counts.
 * 
 * @example
 * ```typescript
 * const badge: BadgeComponent = {
 *   type: 'badge',
 *   props: {
 *     label: 'New',
 *     variant: 'primary',
 *     icon: 'star'
 *   }
 * }
 * ```
 */
export const BadgeComponentSchema = BaseComponentSchema.extend({
  type: z.literal('badge'),
  props: z.object({
    /** Badge label */
    label: z.string().describe('Badge label'),
    
    /** Badge variant/color scheme */
    variant: z.enum(['primary', 'secondary', 'success', 'warning', 'error', 'info']).optional().describe('Badge variant'),
    
    /** Badge icon */
    icon: z.string().optional().describe('Badge icon'),
    
    /** Badge size */
    size: z.enum(['small', 'medium', 'large']).optional().describe('Badge size'),
  }),
}).extend({
  /** Nested child components */
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Tooltip Component Schema
 * 
 * A small popup that appears on hover to provide additional context.
 * 
 * @example
 * ```typescript
 * const tooltip: TooltipComponent = {
 *   type: 'tooltip',
 *   props: {
 *     content: 'Additional information',
 *     position: 'top'
 *   },
 *   children: [
 *     { type: 'badge', props: { label: 'Hover me' } }
 *   ]
 * }
 * ```
 */
export const TooltipComponentSchema = BaseComponentSchema.extend({
  type: z.literal('tooltip'),
  props: z.object({
    /** Tooltip content */
    content: z.string().describe('Tooltip content'),
    
    /** Tooltip position relative to trigger */
    position: z.enum(['top', 'bottom', 'left', 'right']).optional().describe('Tooltip position'),
    
    /** Delay before showing tooltip (ms) */
    delay: z.number().optional().describe('Show delay in milliseconds'),
  }),
}).extend({
  /** Nested child components */
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Popover Component Schema
 * 
 * A popup component that displays rich content on click or hover.
 * 
 * @example
 * ```typescript
 * const popover: PopoverComponent = {
 *   type: 'popover',
 *   props: {
 *     title: 'More Options',
 *     trigger: 'click',
 *     position: 'bottom'
 *   },
 *   children: [
 *     { type: 'card', props: { title: 'Popover Content' } }
 *   ]
 * }
 * ```
 */
export const PopoverComponentSchema = BaseComponentSchema.extend({
  type: z.literal('popover'),
  props: z.object({
    /** Popover title */
    title: z.string().optional().describe('Popover title'),
    
    /** Trigger type */
    trigger: z.enum(['click', 'hover']).optional().describe('Trigger type'),
    
    /** Popover position */
    position: z.enum(['top', 'bottom', 'left', 'right']).optional().describe('Popover position'),
    
    /** Close on outside click */
    closeOnOutsideClick: z.boolean().optional().describe('Close on outside click'),
  }).optional(),
}).extend({
  /** Nested child components */
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Table Component Schema
 * 
 * A data table component for displaying structured data with sorting, filtering, and pagination.
 * Essential for enterprise data management.
 * 
 * @example
 * ```typescript
 * const table: TableComponent = {
 *   type: 'table',
 *   props: {
 *     columns: [
 *       { key: 'name', label: 'Name', sortable: true },
 *       { key: 'email', label: 'Email' },
 *       { key: 'status', label: 'Status', filterable: true }
 *     ],
 *     dataSource: 'users',
 *     pagination: { pageSize: 20, showSizeChanger: true },
 *     selection: { type: 'checkbox', selectedKeys: [] }
 *   }
 * }
 * ```
 */
export const TableComponentSchema = BaseComponentSchema.extend({
  type: z.literal('table'),
  props: z.object({
    /** Column definitions */
    columns: z.array(z.object({
      key: z.string().describe('Column key'),
      label: z.string().describe('Column label'),
      width: z.number().optional().describe('Column width'),
      sortable: z.boolean().optional().describe('Enable sorting'),
      filterable: z.boolean().optional().describe('Enable filtering'),
      fixed: z.enum(['left', 'right']).optional().describe('Fixed column position'),
      dataType: z.enum(['text', 'number', 'date', 'boolean', 'currency', 'percent']).optional().describe('Data type'),
    })).describe('Table columns'),
    
    dataSource: z.string().optional().describe('Data source reference or object name'),
    
    pagination: z.object({
      pageSize: z.number().default(10).describe('Page size'),
      showSizeChanger: z.boolean().optional().describe('Show page size changer'),
      pageSizeOptions: z.array(z.number()).optional().describe('Page size options'),
    }).optional().describe('Pagination configuration'),
    
    selection: z.object({
      type: z.enum(['checkbox', 'radio']).describe('Selection type'),
      selectedKeys: z.array(z.string()).optional().describe('Selected row keys'),
    }).optional().describe('Row selection configuration'),
    
    rowActions: z.array(z.any()).optional().describe('Actions for each row'),
    size: z.enum(['small', 'medium', 'large']).optional().describe('Table size'),
    bordered: z.boolean().optional().describe('Show borders'),
    striped: z.boolean().optional().describe('Striped rows'),
  }),
}).extend({
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Form Component Schema
 * 
 * A form container for data entry with validation support.
 * Critical for enterprise data management.
 */
export const FormComponentSchema = BaseComponentSchema.extend({
  type: z.literal('form'),
  props: z.object({
    layout: z.enum(['horizontal', 'vertical', 'inline']).optional().describe('Form layout'),
    
    fields: z.array(z.object({
      name: z.string().describe('Field name'),
      label: z.string().describe('Field label'),
      type: z.string().describe('Field type'),
      required: z.boolean().optional().describe('Required field'),
      placeholder: z.string().optional().describe('Placeholder text'),
      defaultValue: z.any().optional().describe('Default value'),
      validation: z.record(z.any()).optional().describe('Validation rules'),
    })).optional().describe('Form fields'),
    
    submitButton: z.object({
      label: z.string().describe('Button label'),
      variant: z.enum(['primary', 'secondary', 'success', 'danger']).optional().describe('Button variant'),
    }).optional().describe('Submit button configuration'),
    
    cancelButton: z.object({
      label: z.string().describe('Button label'),
      variant: z.enum(['primary', 'secondary', 'success', 'danger']).optional().describe('Button variant'),
    }).optional().describe('Cancel button configuration'),
    
    labelWidth: z.number().optional().describe('Label width'),
    labelAlign: z.enum(['left', 'right']).optional().describe('Label alignment'),
  }).optional(),
}).extend({
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Menu Component Schema
 * 
 * Navigation menu component for application structure.
 */
export const MenuComponentSchema = BaseComponentSchema.extend({
  type: z.literal('menu'),
  props: z.object({
    items: z.array(z.lazy(() => z.object({
      key: z.string().describe('Menu item key'),
      label: z.string().describe('Menu item label'),
      icon: z.string().optional().describe('Menu item icon'),
      href: z.string().optional().describe('Link URL'),
      disabled: z.boolean().optional().describe('Disabled state'),
      children: z.array(z.any()).optional().describe('Submenu items'),
    }))).describe('Menu items'),
    
    mode: z.enum(['horizontal', 'vertical', 'inline']).optional().describe('Menu mode'),
    theme: z.enum(['light', 'dark']).optional().describe('Menu theme'),
    defaultSelectedKeys: z.array(z.string()).optional().describe('Default selected keys'),
    defaultOpenKeys: z.array(z.string()).optional().describe('Default opened keys'),
    collapsible: z.boolean().optional().describe('Collapsible menu'),
    collapsed: z.boolean().optional().describe('Collapsed state'),
  }),
}).extend({
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Button Component Schema
 * 
 * Interactive button component.
 */
export const ButtonComponentSchema = BaseComponentSchema.extend({
  type: z.literal('button'),
  props: z.object({
    label: z.string().describe('Button label'),
    variant: z.enum(['primary', 'secondary', 'success', 'warning', 'danger', 'text', 'link']).optional().describe('Button variant'),
    icon: z.string().optional().describe('Button icon'),
    iconPosition: z.enum(['left', 'right']).optional().describe('Icon position'),
    size: z.enum(['small', 'medium', 'large']).optional().describe('Button size'),
    loading: z.boolean().optional().describe('Loading state'),
    disabled: z.boolean().optional().describe('Disabled state'),
    block: z.boolean().optional().describe('Block button (full width)'),
    danger: z.boolean().optional().describe('Danger button'),
    shape: z.enum(['default', 'circle', 'round']).optional().describe('Button shape'),
  }),
}).extend({
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Input Component Schema
 * 
 * Text input field for data entry.
 */
export const InputComponentSchema = BaseComponentSchema.extend({
  type: z.literal('input'),
  props: z.object({
    type: z.enum(['text', 'password', 'email', 'number', 'tel', 'url', 'search', 'textarea']).optional().describe('Input type'),
    placeholder: z.string().optional().describe('Placeholder text'),
    defaultValue: z.string().optional().describe('Default value'),
    size: z.enum(['small', 'medium', 'large']).optional().describe('Input size'),
    disabled: z.boolean().optional().describe('Disabled state'),
    readonly: z.boolean().optional().describe('Read-only state'),
    maxLength: z.number().optional().describe('Maximum length'),
    showCount: z.boolean().optional().describe('Show character count'),
    prefix: z.string().optional().describe('Prefix icon'),
    suffix: z.string().optional().describe('Suffix icon'),
    allowClear: z.boolean().optional().describe('Allow clear button'),
    rows: z.number().optional().describe('Rows for textarea type'),
  }).optional(),
}).extend({
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Select Component Schema
 * 
 * Dropdown select component for choosing from options.
 */
export const SelectComponentSchema = BaseComponentSchema.extend({
  type: z.literal('select'),
  props: z.object({
    options: z.array(z.object({
      label: z.string().describe('Option label'),
      value: z.any().describe('Option value'),
      disabled: z.boolean().optional().describe('Disabled option'),
      icon: z.string().optional().describe('Option icon'),
    })).describe('Select options'),
    
    placeholder: z.string().optional().describe('Placeholder text'),
    defaultValue: z.any().optional().describe('Default value'),
    multiple: z.boolean().optional().describe('Multiple selection'),
    searchable: z.boolean().optional().describe('Allow search'),
    allowClear: z.boolean().optional().describe('Allow clear'),
    size: z.enum(['small', 'medium', 'large']).optional().describe('Select size'),
    disabled: z.boolean().optional().describe('Disabled state'),
    loading: z.boolean().optional().describe('Loading state'),
  }),
}).extend({
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * List Component Schema
 * 
 * List component for displaying a series of items.
 */
export const ListComponentSchema = BaseComponentSchema.extend({
  type: z.literal('list'),
  props: z.object({
    dataSource: z.string().optional().describe('Data source reference'),
    itemLayout: z.enum(['horizontal', 'vertical']).optional().describe('Item layout'),
    bordered: z.boolean().optional().describe('Show borders'),
    size: z.enum(['small', 'medium', 'large']).optional().describe('List size'),
    split: z.boolean().optional().describe('Split items with divider'),
    loading: z.boolean().optional().describe('Loading state'),
    pagination: z.object({
      pageSize: z.number().describe('Page size'),
      total: z.number().optional().describe('Total items'),
    }).optional().describe('Pagination configuration'),
  }).optional(),
}).extend({
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Tree Component Schema
 * 
 * Hierarchical tree structure component.
 */
export const TreeComponentSchema = BaseComponentSchema.extend({
  type: z.literal('tree'),
  props: z.object({
    treeData: z.array(z.lazy(() => z.object({
      title: z.string().describe('Node title'),
      key: z.string().describe('Node key'),
      icon: z.string().optional().describe('Node icon'),
      disabled: z.boolean().optional().describe('Disabled node'),
      children: z.array(z.any()).optional().describe('Child nodes'),
    }))).optional().describe('Tree data'),
    
    checkable: z.boolean().optional().describe('Show checkbox on nodes'),
    selectable: z.boolean().optional().describe('Selectable nodes'),
    multiple: z.boolean().optional().describe('Multiple selection'),
    defaultExpandedKeys: z.array(z.string()).optional().describe('Default expanded keys'),
    defaultSelectedKeys: z.array(z.string()).optional().describe('Default selected keys'),
    defaultCheckedKeys: z.array(z.string()).optional().describe('Default checked keys'),
    showLine: z.boolean().optional().describe('Show tree line'),
    showIcon: z.boolean().optional().describe('Show node icon'),
  }).optional(),
}).extend({
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Progress Component Schema
 * 
 * Progress indicator for showing completion status.
 */
export const ProgressComponentSchema = BaseComponentSchema.extend({
  type: z.literal('progress'),
  props: z.object({
    percent: z.number().min(0).max(100).describe('Progress percentage'),
    type: z.enum(['line', 'circle', 'dashboard']).optional().describe('Progress type'),
    status: z.enum(['normal', 'active', 'success', 'exception']).optional().describe('Progress status'),
    showInfo: z.boolean().optional().describe('Show progress info'),
    strokeWidth: z.number().optional().describe('Stroke width'),
    strokeColor: z.string().optional().describe('Stroke color'),
  }),
}).extend({
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Pagination Component Schema
 * 
 * Pagination control for navigating through pages.
 */
export const PaginationComponentSchema = BaseComponentSchema.extend({
  type: z.literal('pagination'),
  props: z.object({
    total: z.number().describe('Total items'),
    pageSize: z.number().default(10).describe('Items per page'),
    current: z.number().default(1).describe('Current page'),
    showSizeChanger: z.boolean().optional().describe('Show size changer'),
    pageSizeOptions: z.array(z.number()).optional().describe('Page size options'),
    showQuickJumper: z.boolean().optional().describe('Show quick jumper'),
    showTotal: z.boolean().optional().describe('Show total items'),
    simple: z.boolean().optional().describe('Simple mode'),
    size: z.enum(['small', 'medium', 'large']).optional().describe('Pagination size'),
  }),
}).extend({
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * Upload Component Schema
 * 
 * File upload component.
 */
export const UploadComponentSchema = BaseComponentSchema.extend({
  type: z.literal('upload'),
  props: z.object({
    action: z.string().optional().describe('Upload URL'),
    accept: z.string().optional().describe('Accepted file types'),
    multiple: z.boolean().optional().describe('Multiple file upload'),
    maxSize: z.number().optional().describe('Max file size'),
    maxCount: z.number().optional().describe('Max file count'),
    listType: z.enum(['text', 'picture', 'picture-card']).optional().describe('Upload list type'),
    showUploadList: z.boolean().optional().describe('Show upload list'),
    disabled: z.boolean().optional().describe('Disabled state'),
  }).optional(),
}).extend({
  children: z.lazy(() => z.array(ComponentSchema)).optional().describe('Child components'),
});

/**
 * TypeScript Type Exports
 */
export type ComponentTypeEnum = z.infer<typeof ComponentType>;
export type Component = z.infer<typeof ComponentSchema>;
export type CardComponent = z.infer<typeof CardComponentSchema>;
export type TabsComponent = z.infer<typeof TabsComponentSchema>;
export type AccordionComponent = z.infer<typeof AccordionComponentSchema>;
export type ModalComponent = z.infer<typeof ModalComponentSchema>;
export type DrawerComponent = z.infer<typeof DrawerComponentSchema>;
export type TimelineComponent = z.infer<typeof TimelineComponentSchema>;
export type StepperComponent = z.infer<typeof StepperComponentSchema>;
export type BreadcrumbComponent = z.infer<typeof BreadcrumbComponentSchema>;
export type AlertComponent = z.infer<typeof AlertComponentSchema>;
export type BadgeComponent = z.infer<typeof BadgeComponentSchema>;
export type TooltipComponent = z.infer<typeof TooltipComponentSchema>;
export type PopoverComponent = z.infer<typeof PopoverComponentSchema>;
export type TableComponent = z.infer<typeof TableComponentSchema>;
export type FormComponent = z.infer<typeof FormComponentSchema>;
export type MenuComponent = z.infer<typeof MenuComponentSchema>;
export type ButtonComponent = z.infer<typeof ButtonComponentSchema>;
export type InputComponent = z.infer<typeof InputComponentSchema>;
export type SelectComponent = z.infer<typeof SelectComponentSchema>;
export type ListComponent = z.infer<typeof ListComponentSchema>;
export type TreeComponent = z.infer<typeof TreeComponentSchema>;
export type ProgressComponent = z.infer<typeof ProgressComponentSchema>;
export type PaginationComponent = z.infer<typeof PaginationComponentSchema>;
export type UploadComponent = z.infer<typeof UploadComponentSchema>;

/**
 * Component Factory Helper
 * 
 * Provides a convenient way to create validated component instances.
 * 
 * @example
 * ```typescript
 * const card = Component.create({
 *   type: 'card',
 *   props: { title: 'Hello World' }
 * });
 * ```
 */
export const Component = {
  create: (config: z.input<typeof ComponentSchema>): Component => ComponentSchema.parse(config),
} as const;
