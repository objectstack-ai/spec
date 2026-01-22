# Component Library Protocol

The Component Library Protocol defines reusable UI components for the ObjectStack UI system. These components can be composed together to build complex user interfaces with support for nesting, event binding, and custom styling.

## Overview

All components follow a consistent schema pattern:

```typescript
{
  type: ComponentType,      // Component type identifier
  props?: Record<string, any>,  // Component-specific properties
  children?: Component[],   // Nested child components (supports recursion)
  events?: Record<string, Function>, // Event handlers
  style?: Record<string, string>     // Custom CSS styles
}
```

## Component Types

The following component types are available:

- **Layout Components**: `card`, `tabs`, `accordion`, `modal`, `drawer`
- **Navigation Components**: `breadcrumb`, `stepper`
- **Display Components**: `timeline`, `alert`, `badge`
- **Overlay Components**: `tooltip`, `popover`

## Usage Examples

### Card Component

A container component that displays content in a card layout:

```typescript
const projectCard: CardComponent = {
  type: 'card',
  props: {
    title: 'Project Overview',
    subtitle: 'Q4 2025 Planning',
    image: 'https://example.com/project-thumbnail.jpg',
    actions: [
      { label: 'Edit', onClick: () => handleEdit() },
      { label: 'Share', onClick: () => handleShare() }
    ]
  },
  children: [
    {
      type: 'alert',
      props: {
        message: 'Project is on track',
        variant: 'success'
      }
    },
    {
      type: 'badge',
      props: {
        label: 'High Priority',
        variant: 'error',
        icon: 'alert-triangle'
      }
    }
  ],
  style: {
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }
}
```

### Tabs Component

A tabbed navigation component for switching between content panels:

```typescript
const dashboardTabs: TabsComponent = {
  type: 'tabs',
  props: {
    tabs: [
      {
        label: 'Overview',
        icon: 'home',
        content: {
          type: 'card',
          props: { title: 'Dashboard Overview' },
          children: [
            {
              type: 'timeline',
              props: {
                items: [
                  {
                    title: 'Project Kickoff',
                    timestamp: '2025-01-15T09:00:00Z',
                    description: 'Project started with team meeting',
                    icon: 'play'
                  },
                  {
                    title: 'Milestone 1 Complete',
                    timestamp: '2025-02-01T15:30:00Z',
                    description: 'Successfully completed first phase',
                    icon: 'check-circle'
                  }
                ],
                orientation: 'vertical'
              }
            }
          ]
        }
      },
      {
        label: 'Analytics',
        icon: 'bar-chart',
        content: {
          type: 'card',
          props: { title: 'Performance Metrics' }
        }
      },
      {
        label: 'Settings',
        icon: 'settings',
        content: {
          type: 'card',
          props: { title: 'Configuration' }
        }
      }
    ],
    defaultTab: 0
  }
}
```

### Accordion Component

An expandable/collapsible panel component:

```typescript
const faqAccordion: AccordionComponent = {
  type: 'accordion',
  props: {
    items: [
      {
        title: 'Getting Started',
        icon: 'help-circle',
        defaultExpanded: true,
        content: {
          type: 'card',
          props: { 
            title: 'How to begin',
            subtitle: 'Follow these steps to get started'
          }
        }
      },
      {
        title: 'Advanced Features',
        icon: 'star',
        content: {
          type: 'card',
          props: { title: 'Power user guide' }
        }
      }
    ],
    allowMultiple: false
  }
}
```

### Modal Component

A dialog overlay for focused user interactions:

```typescript
const confirmationModal: ModalComponent = {
  type: 'modal',
  props: {
    title: 'Confirm Deletion',
    size: 'medium',
    closeOnOverlay: false,
    showClose: true
  },
  children: [
    {
      type: 'alert',
      props: {
        title: 'Warning',
        message: 'This action cannot be undone. Are you sure you want to delete this item?',
        variant: 'warning',
        icon: 'alert-triangle'
      }
    }
  ],
  events: {
    onConfirm: () => handleDelete(),
    onCancel: () => closeModal()
  }
}
```

### Drawer Component

A slide-in panel from the screen edge:

```typescript
const filtersDrawer: DrawerComponent = {
  type: 'drawer',
  props: {
    title: 'Advanced Filters',
    position: 'right',
    size: 'medium',
    closeOnOverlay: true
  },
  children: [
    {
      type: 'accordion',
      props: {
        items: [
          {
            title: 'Date Range',
            defaultExpanded: true,
            content: {
              type: 'card',
              props: { title: 'Select date range' }
            }
          },
          {
            title: 'Categories',
            content: {
              type: 'card',
              props: { title: 'Filter by category' }
            }
          }
        ],
        allowMultiple: true
      }
    }
  ]
}
```

### Stepper Component

Multi-step process navigation:

```typescript
const wizardStepper: StepperComponent = {
  type: 'stepper',
  props: {
    steps: [
      {
        label: 'Account Information',
        description: 'Enter your account details',
        icon: 'user',
        content: {
          type: 'card',
          props: { title: 'Account Setup' }
        }
      },
      {
        label: 'Payment Method',
        description: 'Configure payment details',
        icon: 'credit-card',
        content: {
          type: 'card',
          props: { title: 'Payment Information' }
        }
      },
      {
        label: 'Confirmation',
        description: 'Review and confirm',
        icon: 'check-circle',
        content: {
          type: 'card',
          props: { title: 'Review Your Information' }
        }
      }
    ],
    currentStep: 0,
    orientation: 'horizontal'
  },
  events: {
    onStepChange: (step: number) => handleStepChange(step)
  }
}
```

### Alert Component

Notification messages with different severity levels:

```typescript
const successAlert: AlertComponent = {
  type: 'alert',
  props: {
    title: 'Success!',
    message: 'Your changes have been saved successfully.',
    variant: 'success',
    dismissible: true,
    icon: 'check-circle'
  },
  events: {
    onDismiss: () => handleDismiss()
  }
}

const errorAlert: AlertComponent = {
  type: 'alert',
  props: {
    title: 'Error',
    message: 'Failed to save changes. Please try again.',
    variant: 'error',
    dismissible: true,
    icon: 'x-circle'
  }
}
```

### Badge Component

Small labels for status or counts:

```typescript
const premiumBadge: BadgeComponent = {
  type: 'badge',
  props: {
    label: 'Premium',
    variant: 'primary',
    icon: 'star',
    size: 'medium'
  }
}

const countBadge: BadgeComponent = {
  type: 'badge',
  props: {
    label: '99+',
    variant: 'error',
    size: 'small'
  }
}
```

### Timeline Component

Chronological event display:

```typescript
const activityTimeline: TimelineComponent = {
  type: 'timeline',
  props: {
    items: [
      {
        title: 'Task Completed',
        timestamp: '2025-01-22T10:30:00Z',
        description: 'John Doe completed the design review',
        icon: 'check-circle',
        content: {
          type: 'card',
          props: {
            title: 'Design Review Results',
            subtitle: 'All checks passed'
          }
        }
      },
      {
        title: 'Comment Added',
        timestamp: '2025-01-22T09:15:00Z',
        description: 'Jane Smith left a comment',
        icon: 'message-circle'
      },
      {
        title: 'Project Created',
        timestamp: '2025-01-20T14:00:00Z',
        description: 'Project was initialized',
        icon: 'play'
      }
    ],
    orientation: 'vertical'
  }
}
```

### Breadcrumb Component

Hierarchical navigation:

```typescript
const navBreadcrumb: BreadcrumbComponent = {
  type: 'breadcrumb',
  props: {
    items: [
      { label: 'Home', href: '/', icon: 'home' },
      { label: 'Projects', href: '/projects', icon: 'folder' },
      { label: 'Design System', href: '/projects/design-system', icon: 'palette' },
      { label: 'Components', href: '/projects/design-system/components' }
    ],
    separator: '/'
  }
}
```

### Tooltip Component

Contextual information on hover:

```typescript
const infoTooltip: TooltipComponent = {
  type: 'tooltip',
  props: {
    content: 'This feature is only available for premium users',
    position: 'top',
    delay: 300
  },
  children: [
    {
      type: 'badge',
      props: {
        label: 'Premium Feature',
        variant: 'primary',
        icon: 'lock'
      }
    }
  ]
}
```

### Popover Component

Rich content popup on click or hover:

```typescript
const actionsPopover: PopoverComponent = {
  type: 'popover',
  props: {
    title: 'Quick Actions',
    trigger: 'click',
    position: 'bottom',
    closeOnOutsideClick: true
  },
  children: [
    {
      type: 'card',
      children: [
        {
          type: 'alert',
          props: {
            message: 'Select an action',
            variant: 'info'
          }
        }
      ]
    }
  ]
}
```

## Complex Composition Example

Here's a complex example showing how components can be deeply nested:

```typescript
const complexDashboard: Component = {
  type: 'card',
  props: {
    title: 'Project Management Dashboard',
    subtitle: 'Q4 2025'
  },
  children: [
    {
      type: 'tabs',
      props: {
        tabs: [
          {
            label: 'Overview',
            icon: 'home',
            content: {
              type: 'card',
              children: [
                {
                  type: 'alert',
                  props: {
                    message: 'All systems operational',
                    variant: 'success'
                  }
                },
                {
                  type: 'timeline',
                  props: {
                    items: [
                      {
                        title: 'Milestone Reached',
                        timestamp: '2025-01-22T12:00:00Z',
                        icon: 'flag',
                        content: {
                          type: 'card',
                          props: { title: 'Phase 1 Complete' },
                          children: [
                            {
                              type: 'badge',
                              props: {
                                label: 'Completed',
                                variant: 'success'
                              }
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            label: 'Team',
            icon: 'users',
            content: {
              type: 'accordion',
              props: {
                items: [
                  {
                    title: 'Active Members',
                    icon: 'users',
                    defaultExpanded: true
                  }
                ]
              }
            }
          }
        ]
      }
    }
  ]
}
```

## Event Binding

Components support event binding through the `events` property:

```typescript
const interactiveCard: Component = {
  type: 'card',
  props: {
    title: 'Interactive Component'
  },
  events: {
    onClick: () => console.log('Card clicked'),
    onHover: () => console.log('Card hovered'),
    onFocus: () => console.log('Card focused'),
    onBlur: () => console.log('Card blurred')
  }
}
```

## Custom Styling

All components accept custom CSS styles:

```typescript
const styledComponent: Component = {
  type: 'card',
  props: {
    title: 'Styled Component'
  },
  style: {
    backgroundColor: '#f5f5f5',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0'
  }
}
```

## Best Practices

### 1. Use Semantic Component Types
Choose the most appropriate component type for your use case:
- Use `card` for grouped content containers
- Use `modal` for focused interactions that require user attention
- Use `drawer` for contextual panels and filters
- Use `alert` for important notifications

### 2. Leverage Component Nesting
Build complex UIs by composing simple components:

```typescript
// Good: Clear hierarchy
{
  type: 'card',
  children: [
    { type: 'alert', props: { message: 'Info' } },
    { type: 'badge', props: { label: 'Status' } }
  ]
}
```

### 3. Keep Props Focused
Each component should have props specific to its purpose:

```typescript
// Good: Focused props
const alert = {
  type: 'alert',
  props: {
    title: 'Error',
    message: 'Something went wrong',
    variant: 'error'
  }
}
```

### 4. Use Event Handlers Consistently
Bind events using standard naming conventions:

```typescript
events: {
  onClick: () => {},
  onSubmit: () => {},
  onCancel: () => {},
  onDismiss: () => {}
}
```

## TypeScript Support

All components are fully typed using Zod schemas with TypeScript type inference:

```typescript
import {
  Component,
  CardComponent,
  TabsComponent,
  AlertComponent,
  // ... other types
} from '@objectstack/spec/ui';

// Type-safe component definition
const myCard: CardComponent = {
  type: 'card',
  props: {
    title: 'Hello World'
  }
};

// Generic component type
const myComponent: Component = {
  type: 'badge',
  props: {
    label: 'New'
  }
};
```

## Factory Helper

Use the Component factory for validated component creation:

```typescript
import { Component } from '@objectstack/spec/ui';

// Creates and validates component
const card = Component.create({
  type: 'card',
  props: { title: 'Test' }
});

// Throws error for invalid component
const invalid = Component.create({
  type: 'invalid' // Error: Invalid component type
});
```

## Validation

All component schemas include runtime validation through Zod:

```typescript
import { ComponentSchema, CardComponentSchema } from '@objectstack/spec/ui';

// Validates any component
ComponentSchema.parse(myComponent);

// Validates specific component type
CardComponentSchema.parse(myCard);
```

## Migration Guide

If migrating from other UI frameworks:

### From React Components
```typescript
// Before (React)
<Card title="Hello">
  <Alert message="Info" variant="info" />
</Card>

// After (ObjectStack)
{
  type: 'card',
  props: { title: 'Hello' },
  children: [
    {
      type: 'alert',
      props: { message: 'Info', variant: 'info' }
    }
  ]
}
```

### From Vue Components
```typescript
// Before (Vue)
<v-card title="Hello">
  <v-alert type="info">Info</v-alert>
</v-card>

// After (ObjectStack)
{
  type: 'card',
  props: { title: 'Hello' },
  children: [
    {
      type: 'alert',
      props: { message: 'Info', variant: 'info' }
    }
  ]
}
```

## Next Steps

- Explore the [UI Protocol Documentation](../README.md)
- Check out [Page Composition](./page.zod.ts) for building full pages
- Learn about [Theme Customization](./theme.zod.ts) for styling

## Related Schemas

- `ActionSchema` - User interaction definitions
- `PageSchema` - Full page composition
- `ThemeSchema` - Visual styling and theming
- `ViewSchema` - Data-driven views (list, form)
