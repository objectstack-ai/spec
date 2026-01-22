import { describe, it, expect } from 'vitest';
import {
  ComponentType,
  ComponentSchema,
  CardComponentSchema,
  TabsComponentSchema,
  AccordionComponentSchema,
  ModalComponentSchema,
  DrawerComponentSchema,
  TimelineComponentSchema,
  StepperComponentSchema,
  BreadcrumbComponentSchema,
  AlertComponentSchema,
  BadgeComponentSchema,
  TooltipComponentSchema,
  PopoverComponentSchema,
  TableComponentSchema,
  FormComponentSchema,
  MenuComponentSchema,
  ButtonComponentSchema,
  InputComponentSchema,
  SelectComponentSchema,
  ListComponentSchema,
  TreeComponentSchema,
  ProgressComponentSchema,
  PaginationComponentSchema,
  UploadComponentSchema,
  Component,
  type Component as ComponentType,
} from './component.zod';

describe('ComponentType', () => {
  it('should accept all valid component types', () => {
    const validTypes = [
      // Original types
      'card',
      'tabs',
      'accordion',
      'modal',
      'drawer',
      'timeline',
      'stepper',
      'breadcrumb',
      'alert',
      'badge',
      'tooltip',
      'popover',
      // New enterprise types
      'table',
      'form',
      'menu',
      'button',
      'input',
      'select',
      'list',
      'tree',
      'progress',
      'pagination',
      'upload',
      'container',
      'divider',
      'space',
      'grid',
      'flex',
      'sidebar',
      'dropdown',
      'description',
      'statistic',
      'tag',
      'collapse',
      'carousel',
      'image',
      'avatar',
      'calendar_view',
      'checkbox',
      'radio',
      'switch',
      'slider',
      'date_picker',
      'time_picker',
      'autocomplete',
      'cascader',
      'transfer',
      'color_picker',
      'rate',
      'message',
      'notification',
      'skeleton',
      'spin',
      'result',
      'empty',
      'button_group',
      'icon_button',
      'split_button',
      'dialog',
      'confirm',
      'steps',
      'anchor',
      'back_top',
      'watermark',
      'qrcode',
    ] as const;

    validTypes.forEach(type => {
      expect(() => ComponentType.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid component types', () => {
    const invalidTypes = ['invalid', 'custom', 'unknown'];

    invalidTypes.forEach(type => {
      expect(() => ComponentType.parse(type)).toThrow();
    });
  });
});

describe('ComponentSchema', () => {
  describe('Basic Component', () => {
    it('should accept minimal component', () => {
      const component: ComponentType = {
        type: 'card',
      };

      expect(() => ComponentSchema.parse(component)).not.toThrow();
    });

    it('should accept component with props', () => {
      const component: ComponentType = {
        type: 'card',
        props: {
          title: 'Test Card',
          customProp: 'value',
        },
      };

      expect(() => ComponentSchema.parse(component)).not.toThrow();
    });

    it('should accept component with style', () => {
      const component: ComponentType = {
        type: 'card',
        style: {
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: '#f5f5f5',
        },
      };

      expect(() => ComponentSchema.parse(component)).not.toThrow();
    });
  });

  describe('Component Nesting (Children)', () => {
    it('should accept component with single child', () => {
      const component: ComponentType = {
        type: 'card',
        children: [
          {
            type: 'badge',
            props: { label: 'New' },
          },
        ],
      };

      expect(() => ComponentSchema.parse(component)).not.toThrow();
    });

    it('should accept component with multiple children', () => {
      const component: ComponentType = {
        type: 'card',
        props: {
          title: 'Container',
        },
        children: [
          {
            type: 'badge',
            props: { label: 'Status' },
          },
          {
            type: 'alert',
            props: { message: 'Information' },
          },
        ],
      };

      expect(() => ComponentSchema.parse(component)).not.toThrow();
    });

    it('should accept deeply nested components', () => {
      const component: ComponentType = {
        type: 'card',
        children: [
          {
            type: 'accordion',
            children: [
              {
                type: 'tabs',
                children: [
                  {
                    type: 'badge',
                    props: { label: 'Deeply nested' },
                  },
                ],
              },
            ],
          },
        ],
      };

      expect(() => ComponentSchema.parse(component)).not.toThrow();
    });
  });

  describe('Event Binding', () => {
    it('should accept component with events', () => {
      const component = {
        type: 'card' as const,
        events: {
          onClick: () => {},
          onHover: () => {},
        },
      };

      expect(() => ComponentSchema.parse(component)).not.toThrow();
    });

    it('should accept component with multiple event handlers', () => {
      const component = {
        type: 'modal' as const,
        events: {
          onOpen: () => console.log('opened'),
          onClose: () => console.log('closed'),
          onSubmit: () => console.log('submitted'),
        },
      };

      expect(() => ComponentSchema.parse(component)).not.toThrow();
    });
  });
});

describe('CardComponentSchema', () => {
  it('should accept minimal card', () => {
    const card = {
      type: 'card' as const,
    };

    expect(() => CardComponentSchema.parse(card)).not.toThrow();
  });

  it('should accept card with title and subtitle', () => {
    const card = {
      type: 'card' as const,
      props: {
        title: 'Project Overview',
        subtitle: 'Q4 2025',
      },
    };

    expect(() => CardComponentSchema.parse(card)).not.toThrow();
  });

  it('should accept card with image', () => {
    const card = {
      type: 'card' as const,
      props: {
        title: 'User Profile',
        image: 'https://example.com/avatar.jpg',
      },
    };

    expect(() => CardComponentSchema.parse(card)).not.toThrow();
  });

  it('should reject card with invalid image URL', () => {
    const card = {
      type: 'card' as const,
      props: {
        image: 'not-a-url',
      },
    };

    expect(() => CardComponentSchema.parse(card)).toThrow();
  });

  it('should accept card with actions', () => {
    const card = {
      type: 'card' as const,
      props: {
        title: 'Task Card',
        actions: [
          { label: 'Edit', onClick: () => {} },
          { label: 'Delete', onClick: () => {} },
        ],
      },
    };

    expect(() => CardComponentSchema.parse(card)).not.toThrow();
  });

  it('should accept card with children', () => {
    const card = {
      type: 'card' as const,
      props: {
        title: 'Container Card',
      },
      children: [
        {
          type: 'alert' as const,
          props: { message: 'Success!' },
        },
      ],
    };

    expect(() => CardComponentSchema.parse(card)).not.toThrow();
  });
});

describe('TabsComponentSchema', () => {
  it('should accept minimal tabs', () => {
    const tabs = {
      type: 'tabs' as const,
      props: {
        tabs: [
          { label: 'Tab 1' },
          { label: 'Tab 2' },
        ],
      },
    };

    expect(() => TabsComponentSchema.parse(tabs)).not.toThrow();
  });

  it('should accept tabs with icons', () => {
    const tabs = {
      type: 'tabs' as const,
      props: {
        tabs: [
          { label: 'Home', icon: 'home' },
          { label: 'Settings', icon: 'settings' },
        ],
      },
    };

    expect(() => TabsComponentSchema.parse(tabs)).not.toThrow();
  });

  it('should accept tabs with content', () => {
    const tabs = {
      type: 'tabs' as const,
      props: {
        tabs: [
          {
            label: 'Overview',
            content: {
              type: 'card' as const,
              props: { title: 'Overview Content' },
            },
          },
          {
            label: 'Details',
            content: {
              type: 'card' as const,
              props: { title: 'Details Content' },
            },
          },
        ],
      },
    };

    expect(() => TabsComponentSchema.parse(tabs)).not.toThrow();
  });

  it('should accept tabs with default tab', () => {
    const tabs = {
      type: 'tabs' as const,
      props: {
        tabs: [
          { label: 'Tab 1' },
          { label: 'Tab 2' },
        ],
        defaultTab: 1,
      },
    };

    expect(() => TabsComponentSchema.parse(tabs)).not.toThrow();
  });

  it('should reject negative default tab index', () => {
    const tabs = {
      type: 'tabs' as const,
      props: {
        tabs: [{ label: 'Tab 1' }],
        defaultTab: -1,
      },
    };

    expect(() => TabsComponentSchema.parse(tabs)).toThrow();
  });
});

describe('AccordionComponentSchema', () => {
  it('should accept minimal accordion', () => {
    const accordion = {
      type: 'accordion' as const,
      props: {
        items: [
          { title: 'Section 1' },
          { title: 'Section 2' },
        ],
      },
    };

    expect(() => AccordionComponentSchema.parse(accordion)).not.toThrow();
  });

  it('should accept accordion with content', () => {
    const accordion = {
      type: 'accordion' as const,
      props: {
        items: [
          {
            title: 'User Info',
            content: {
              type: 'card' as const,
              props: { title: 'User Details' },
            },
          },
        ],
      },
    };

    expect(() => AccordionComponentSchema.parse(accordion)).not.toThrow();
  });

  it('should accept accordion with icons and expanded state', () => {
    const accordion = {
      type: 'accordion' as const,
      props: {
        items: [
          {
            title: 'Account',
            icon: 'user',
            defaultExpanded: true,
          },
          {
            title: 'Settings',
            icon: 'settings',
            defaultExpanded: false,
          },
        ],
        allowMultiple: true,
      },
    };

    expect(() => AccordionComponentSchema.parse(accordion)).not.toThrow();
  });
});

describe('ModalComponentSchema', () => {
  it('should accept minimal modal', () => {
    const modal = {
      type: 'modal' as const,
    };

    expect(() => ModalComponentSchema.parse(modal)).not.toThrow();
  });

  it('should accept modal with all properties', () => {
    const modal = {
      type: 'modal' as const,
      props: {
        title: 'Confirm Delete',
        size: 'medium' as const,
        closeOnOverlay: true,
        showClose: true,
      },
    };

    expect(() => ModalComponentSchema.parse(modal)).not.toThrow();
  });

  it('should accept all modal sizes', () => {
    const sizes = ['small', 'medium', 'large', 'full'] as const;

    sizes.forEach(size => {
      const modal = {
        type: 'modal' as const,
        props: { size },
      };
      expect(() => ModalComponentSchema.parse(modal)).not.toThrow();
    });
  });

  it('should accept modal with children', () => {
    const modal = {
      type: 'modal' as const,
      props: { title: 'Warning' },
      children: [
        {
          type: 'alert' as const,
          props: { message: 'This action cannot be undone' },
        },
      ],
    };

    expect(() => ModalComponentSchema.parse(modal)).not.toThrow();
  });
});

describe('DrawerComponentSchema', () => {
  it('should accept minimal drawer', () => {
    const drawer = {
      type: 'drawer' as const,
    };

    expect(() => DrawerComponentSchema.parse(drawer)).not.toThrow();
  });

  it('should accept all drawer positions', () => {
    const positions = ['left', 'right', 'top', 'bottom'] as const;

    positions.forEach(position => {
      const drawer = {
        type: 'drawer' as const,
        props: { position },
      };
      expect(() => DrawerComponentSchema.parse(drawer)).not.toThrow();
    });
  });

  it('should accept drawer with all properties', () => {
    const drawer = {
      type: 'drawer' as const,
      props: {
        title: 'Filters',
        position: 'right' as const,
        size: 'medium' as const,
        closeOnOverlay: true,
      },
    };

    expect(() => DrawerComponentSchema.parse(drawer)).not.toThrow();
  });
});

describe('TimelineComponentSchema', () => {
  it('should accept minimal timeline', () => {
    const timeline = {
      type: 'timeline' as const,
      props: {
        items: [
          { title: 'Event 1' },
          { title: 'Event 2' },
        ],
      },
    };

    expect(() => TimelineComponentSchema.parse(timeline)).not.toThrow();
  });

  it('should accept timeline with full event details', () => {
    const timeline = {
      type: 'timeline' as const,
      props: {
        items: [
          {
            title: 'Project Started',
            timestamp: '2025-01-01T00:00:00Z',
            description: 'Project kickoff meeting',
            icon: 'play',
          },
          {
            title: 'Milestone Reached',
            timestamp: '2025-02-01T00:00:00Z',
            description: 'Completed Phase 1',
            icon: 'flag',
          },
        ],
        orientation: 'vertical' as const,
      },
    };

    expect(() => TimelineComponentSchema.parse(timeline)).not.toThrow();
  });

  it('should accept timeline with nested content', () => {
    const timeline = {
      type: 'timeline' as const,
      props: {
        items: [
          {
            title: 'Event with details',
            content: {
              type: 'card' as const,
              props: { title: 'Event Content' },
            },
          },
        ],
      },
    };

    expect(() => TimelineComponentSchema.parse(timeline)).not.toThrow();
  });

  it('should accept both timeline orientations', () => {
    const orientations = ['vertical', 'horizontal'] as const;

    orientations.forEach(orientation => {
      const timeline = {
        type: 'timeline' as const,
        props: {
          items: [{ title: 'Event' }],
          orientation,
        },
      };
      expect(() => TimelineComponentSchema.parse(timeline)).not.toThrow();
    });
  });
});

describe('StepperComponentSchema', () => {
  it('should accept minimal stepper', () => {
    const stepper = {
      type: 'stepper' as const,
      props: {
        steps: [
          { label: 'Step 1' },
          { label: 'Step 2' },
        ],
      },
    };

    expect(() => StepperComponentSchema.parse(stepper)).not.toThrow();
  });

  it('should accept stepper with full step details', () => {
    const stepper = {
      type: 'stepper' as const,
      props: {
        steps: [
          {
            label: 'Account Info',
            description: 'Enter your account details',
            icon: 'user',
          },
          {
            label: 'Payment',
            description: 'Enter payment information',
            icon: 'credit-card',
          },
          {
            label: 'Confirmation',
            description: 'Review and confirm',
            icon: 'check',
          },
        ],
        currentStep: 1,
        orientation: 'horizontal' as const,
      },
    };

    expect(() => StepperComponentSchema.parse(stepper)).not.toThrow();
  });

  it('should accept stepper with step content', () => {
    const stepper = {
      type: 'stepper' as const,
      props: {
        steps: [
          {
            label: 'Step 1',
            content: {
              type: 'card' as const,
              props: { title: 'Step 1 Content' },
            },
          },
        ],
      },
    };

    expect(() => StepperComponentSchema.parse(stepper)).not.toThrow();
  });

  it('should accept both stepper orientations', () => {
    const orientations = ['horizontal', 'vertical'] as const;

    orientations.forEach(orientation => {
      const stepper = {
        type: 'stepper' as const,
        props: {
          steps: [{ label: 'Step 1' }],
          orientation,
        },
      };
      expect(() => StepperComponentSchema.parse(stepper)).not.toThrow();
    });
  });
});

describe('BreadcrumbComponentSchema', () => {
  it('should accept minimal breadcrumb', () => {
    const breadcrumb = {
      type: 'breadcrumb' as const,
      props: {
        items: [
          { label: 'Home' },
          { label: 'Projects' },
        ],
      },
    };

    expect(() => BreadcrumbComponentSchema.parse(breadcrumb)).not.toThrow();
  });

  it('should accept breadcrumb with hrefs', () => {
    const breadcrumb = {
      type: 'breadcrumb' as const,
      props: {
        items: [
          { label: 'Home', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: 'Project 1', href: '/projects/1' },
        ],
      },
    };

    expect(() => BreadcrumbComponentSchema.parse(breadcrumb)).not.toThrow();
  });

  it('should accept breadcrumb with icons and separator', () => {
    const breadcrumb = {
      type: 'breadcrumb' as const,
      props: {
        items: [
          { label: 'Home', href: '/', icon: 'home' },
          { label: 'Settings', href: '/settings', icon: 'settings' },
        ],
        separator: '/',
      },
    };

    expect(() => BreadcrumbComponentSchema.parse(breadcrumb)).not.toThrow();
  });
});

describe('AlertComponentSchema', () => {
  it('should accept minimal alert', () => {
    const alert = {
      type: 'alert' as const,
      props: {
        message: 'This is an alert',
      },
    };

    expect(() => AlertComponentSchema.parse(alert)).not.toThrow();
  });

  it('should accept all alert variants', () => {
    const variants = ['info', 'success', 'warning', 'error'] as const;

    variants.forEach(variant => {
      const alert = {
        type: 'alert' as const,
        props: {
          message: 'Test message',
          variant,
        },
      };
      expect(() => AlertComponentSchema.parse(alert)).not.toThrow();
    });
  });

  it('should accept alert with all properties', () => {
    const alert = {
      type: 'alert' as const,
      props: {
        title: 'Success',
        message: 'Your changes have been saved.',
        variant: 'success' as const,
        dismissible: true,
        icon: 'check-circle',
      },
    };

    expect(() => AlertComponentSchema.parse(alert)).not.toThrow();
  });
});

describe('BadgeComponentSchema', () => {
  it('should accept minimal badge', () => {
    const badge = {
      type: 'badge' as const,
      props: {
        label: 'New',
      },
    };

    expect(() => BadgeComponentSchema.parse(badge)).not.toThrow();
  });

  it('should accept all badge variants', () => {
    const variants = ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const;

    variants.forEach(variant => {
      const badge = {
        type: 'badge' as const,
        props: {
          label: 'Test',
          variant,
        },
      };
      expect(() => BadgeComponentSchema.parse(badge)).not.toThrow();
    });
  });

  it('should accept all badge sizes', () => {
    const sizes = ['small', 'medium', 'large'] as const;

    sizes.forEach(size => {
      const badge = {
        type: 'badge' as const,
        props: {
          label: 'Test',
          size,
        },
      };
      expect(() => BadgeComponentSchema.parse(badge)).not.toThrow();
    });
  });

  it('should accept badge with icon', () => {
    const badge = {
      type: 'badge' as const,
      props: {
        label: 'Premium',
        variant: 'primary' as const,
        icon: 'star',
      },
    };

    expect(() => BadgeComponentSchema.parse(badge)).not.toThrow();
  });
});

describe('TooltipComponentSchema', () => {
  it('should accept minimal tooltip', () => {
    const tooltip = {
      type: 'tooltip' as const,
      props: {
        content: 'Tooltip text',
      },
    };

    expect(() => TooltipComponentSchema.parse(tooltip)).not.toThrow();
  });

  it('should accept all tooltip positions', () => {
    const positions = ['top', 'bottom', 'left', 'right'] as const;

    positions.forEach(position => {
      const tooltip = {
        type: 'tooltip' as const,
        props: {
          content: 'Test tooltip',
          position,
        },
      };
      expect(() => TooltipComponentSchema.parse(tooltip)).not.toThrow();
    });
  });

  it('should accept tooltip with delay', () => {
    const tooltip = {
      type: 'tooltip' as const,
      props: {
        content: 'Delayed tooltip',
        delay: 500,
      },
    };

    expect(() => TooltipComponentSchema.parse(tooltip)).not.toThrow();
  });

  it('should accept tooltip with children', () => {
    const tooltip = {
      type: 'tooltip' as const,
      props: {
        content: 'Hover for info',
      },
      children: [
        {
          type: 'badge' as const,
          props: { label: 'Hover me' },
        },
      ],
    };

    expect(() => TooltipComponentSchema.parse(tooltip)).not.toThrow();
  });
});

describe('PopoverComponentSchema', () => {
  it('should accept minimal popover', () => {
    const popover = {
      type: 'popover' as const,
    };

    expect(() => PopoverComponentSchema.parse(popover)).not.toThrow();
  });

  it('should accept all popover trigger types', () => {
    const triggers = ['click', 'hover'] as const;

    triggers.forEach(trigger => {
      const popover = {
        type: 'popover' as const,
        props: { trigger },
      };
      expect(() => PopoverComponentSchema.parse(popover)).not.toThrow();
    });
  });

  it('should accept all popover positions', () => {
    const positions = ['top', 'bottom', 'left', 'right'] as const;

    positions.forEach(position => {
      const popover = {
        type: 'popover' as const,
        props: { position },
      };
      expect(() => PopoverComponentSchema.parse(popover)).not.toThrow();
    });
  });

  it('should accept popover with all properties', () => {
    const popover = {
      type: 'popover' as const,
      props: {
        title: 'More Options',
        trigger: 'click' as const,
        position: 'bottom' as const,
        closeOnOutsideClick: true,
      },
    };

    expect(() => PopoverComponentSchema.parse(popover)).not.toThrow();
  });

  it('should accept popover with children', () => {
    const popover = {
      type: 'popover' as const,
      props: { title: 'Actions' },
      children: [
        {
          type: 'card' as const,
          props: { title: 'Popover Content' },
        },
      ],
    };

    expect(() => PopoverComponentSchema.parse(popover)).not.toThrow();
  });
});

describe('Real-World Component Examples', () => {
  it('should accept complex nested dashboard layout', () => {
    const dashboard = {
      type: 'card' as const,
      props: {
        title: 'Dashboard',
      },
      children: [
        {
          type: 'tabs' as const,
          props: {
            tabs: [
              {
                label: 'Overview',
                icon: 'home',
                content: {
                  type: 'card' as const,
                  children: [
                    {
                      type: 'alert' as const,
                      props: {
                        message: 'Welcome back!',
                        variant: 'info' as const,
                      },
                    },
                    {
                      type: 'timeline' as const,
                      props: {
                        items: [
                          {
                            title: 'Activity 1',
                            timestamp: '2025-01-22T12:00:00Z',
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                label: 'Settings',
                icon: 'settings',
                content: {
                  type: 'accordion' as const,
                  props: {
                    items: [
                      {
                        title: 'Profile',
                        icon: 'user',
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      ],
    };

    expect(() => ComponentSchema.parse(dashboard)).not.toThrow();
  });

  it('should accept wizard flow with stepper', () => {
    const wizard = {
      type: 'modal' as const,
      props: {
        title: 'Setup Wizard',
        size: 'large' as const,
      },
      children: [
        {
          type: 'stepper' as const,
          props: {
            steps: [
              {
                label: 'Account',
                content: {
                  type: 'card' as const,
                  props: { title: 'Account Setup' },
                },
              },
              {
                label: 'Payment',
                content: {
                  type: 'card' as const,
                  props: { title: 'Payment Details' },
                },
              },
            ],
            currentStep: 0,
          },
        },
      ],
    };

    expect(() => ComponentSchema.parse(wizard)).not.toThrow();
  });

  it('should accept card with badge and tooltip', () => {
    const card = {
      type: 'card' as const,
      props: {
        title: 'Premium Feature',
        subtitle: 'Unlock advanced capabilities',
      },
      children: [
        {
          type: 'tooltip' as const,
          props: {
            content: 'Only for premium users',
          },
          children: [
            {
              type: 'badge' as const,
              props: {
                label: 'Premium',
                variant: 'primary' as const,
                icon: 'star',
              },
            },
          ],
        },
      ],
    };

    expect(() => ComponentSchema.parse(card)).not.toThrow();
  });

  it('should accept notification drawer with timeline', () => {
    const drawer = {
      type: 'drawer' as const,
      props: {
        title: 'Notifications',
        position: 'right' as const,
        size: 'medium' as const,
      },
      children: [
        {
          type: 'timeline' as const,
          props: {
            items: [
              {
                title: 'New message',
                timestamp: '2025-01-22T10:30:00Z',
                icon: 'mail',
                content: {
                  type: 'card' as const,
                  props: { title: 'Message details' },
                },
              },
              {
                title: 'Task completed',
                timestamp: '2025-01-22T09:00:00Z',
                icon: 'check',
              },
            ],
            orientation: 'vertical' as const,
          },
        },
      ],
    };

    expect(() => ComponentSchema.parse(drawer)).not.toThrow();
  });
});

describe('Enterprise Components', () => {
  describe('TableComponentSchema', () => {
    it('should accept table with columns', () => {
      const table = {
        type: 'table' as const,
        props: {
          columns: [
            { key: 'name', label: 'Name', sortable: true },
            { key: 'email', label: 'Email', filterable: true },
          ],
          dataSource: 'users',
          pagination: { pageSize: 20 },
        },
      };

      expect(() => TableComponentSchema.parse(table)).not.toThrow();
    });
  });

  describe('FormComponentSchema', () => {
    it('should accept form with fields', () => {
      const form = {
        type: 'form' as const,
        props: {
          layout: 'vertical' as const,
          fields: [
            { name: 'username', label: 'Username', type: 'input', required: true },
          ],
          submitButton: { label: 'Submit', variant: 'primary' as const },
        },
      };

      expect(() => FormComponentSchema.parse(form)).not.toThrow();
    });
  });

  describe('MenuComponentSchema', () => {
    it('should accept menu with nested items', () => {
      const menu = {
        type: 'menu' as const,
        props: {
          items: [
            { key: 'dashboard', label: 'Dashboard', icon: 'home' },
            {
              key: 'users',
              label: 'Users',
              children: [{ key: 'users-list', label: 'User List' }],
            },
          ],
          mode: 'vertical' as const,
        },
      };

      expect(() => MenuComponentSchema.parse(menu)).not.toThrow();
    });
  });

  describe('ButtonComponentSchema', () => {
    it('should accept button with all properties', () => {
      const button = {
        type: 'button' as const,
        props: {
          label: 'Submit',
          variant: 'primary' as const,
          icon: 'check',
          size: 'large' as const,
          loading: false,
        },
      };

      expect(() => ButtonComponentSchema.parse(button)).not.toThrow();
    });
  });

  describe('InputComponentSchema', () => {
    it('should accept input with properties', () => {
      const input = {
        type: 'input' as const,
        props: {
          type: 'email' as const,
          placeholder: 'Enter email',
          maxLength: 100,
          allowClear: true,
        },
      };

      expect(() => InputComponentSchema.parse(input)).not.toThrow();
    });
  });

  describe('SelectComponentSchema', () => {
    it('should accept select with options', () => {
      const select = {
        type: 'select' as const,
        props: {
          options: [
            { label: 'Option 1', value: '1' },
            { label: 'Option 2', value: '2' },
          ],
          multiple: true,
          searchable: true,
        },
      };

      expect(() => SelectComponentSchema.parse(select)).not.toThrow();
    });
  });

  describe('ListComponentSchema', () => {
    it('should accept list with configuration', () => {
      const list = {
        type: 'list' as const,
        props: {
          dataSource: 'tasks',
          itemLayout: 'horizontal' as const,
          bordered: true,
        },
      };

      expect(() => ListComponentSchema.parse(list)).not.toThrow();
    });
  });

  describe('TreeComponentSchema', () => {
    it('should accept tree with data', () => {
      const tree = {
        type: 'tree' as const,
        props: {
          treeData: [
            {
              title: 'Parent',
              key: '0',
              children: [{ title: 'Child', key: '0-0' }],
            },
          ],
          checkable: true,
        },
      };

      expect(() => TreeComponentSchema.parse(tree)).not.toThrow();
    });
  });

  describe('ProgressComponentSchema', () => {
    it('should accept progress with percent', () => {
      const progress = {
        type: 'progress' as const,
        props: {
          percent: 75,
          type: 'circle' as const,
          status: 'active' as const,
        },
      };

      expect(() => ProgressComponentSchema.parse(progress)).not.toThrow();
    });

    it('should reject invalid percent', () => {
      const progress = {
        type: 'progress' as const,
        props: { percent: 150 },
      };

      expect(() => ProgressComponentSchema.parse(progress)).toThrow();
    });
  });

  describe('PaginationComponentSchema', () => {
    it('should accept pagination with configuration', () => {
      const pagination = {
        type: 'pagination' as const,
        props: {
          total: 100,
          pageSize: 20,
          showSizeChanger: true,
        },
      };

      expect(() => PaginationComponentSchema.parse(pagination)).not.toThrow();
    });
  });

  describe('UploadComponentSchema', () => {
    it('should accept upload with configuration', () => {
      const upload = {
        type: 'upload' as const,
        props: {
          action: '/api/upload',
          accept: '.jpg,.png',
          multiple: true,
          maxSize: 5242880,
        },
      };

      expect(() => UploadComponentSchema.parse(upload)).not.toThrow();
    });
  });

  describe('Enterprise Component Composition', () => {
    it('should accept form with input and select', () => {
      const form = {
        type: 'form' as const,
        children: [
          { type: 'input' as const, props: { placeholder: 'Name' } },
          {
            type: 'select' as const,
            props: {
              options: [{ label: 'Active', value: 'active' }],
            },
          },
        ],
      };

      expect(() => ComponentSchema.parse(form)).not.toThrow();
    });

    it('should accept dashboard with table', () => {
      const dashboard = {
        type: 'card' as const,
        props: { title: 'Dashboard' },
        children: [
          {
            type: 'table' as const,
            props: {
              columns: [{ key: 'name', label: 'Name' }],
            },
          },
        ],
      };

      expect(() => ComponentSchema.parse(dashboard)).not.toThrow();
    });
  });
});

describe('Component Factory', () => {
  it('should create component via factory', () => {
    const component = Component.create({
      type: 'card',
      props: { title: 'Test Card' },
    });

    expect(component.type).toBe('card');
    expect(component.props?.title).toBe('Test Card');
  });

  it('should validate component via factory', () => {
    expect(() =>
      Component.create({
        type: 'invalid' as any,
      })
    ).toThrow();

    expect(() =>
      Component.create({
        type: 'card',
      })
    ).not.toThrow();
  });

  it('should create nested component via factory', () => {
    const component = Component.create({
      type: 'card',
      children: [
        {
          type: 'badge',
          props: { label: 'New' },
        },
      ],
    });

    expect(component.children).toHaveLength(1);
    expect(component.children![0].type).toBe('badge');
  });
});
