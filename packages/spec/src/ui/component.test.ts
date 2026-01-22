import { describe, it, expect } from 'vitest';
import {
  ComponentSchema,
  Component,
  type Component as ComponentType,
} from './component.zod';

describe('ComponentSchema', () => {
  describe('Basic Structure', () => {
    it('should accept minimal component with just type', () => {
      const component: ComponentType = {
        type: 'card',
      };

      expect(() => ComponentSchema.parse(component)).not.toThrow();
    });

    it('should accept any string as type (extensible)', () => {
      const customComponent: ComponentType = {
        type: 'custom-widget',
      };

      expect(() => ComponentSchema.parse(customComponent)).not.toThrow();
    });

    it('should accept component with arbitrary props', () => {
      const component: ComponentType = {
        type: 'button',
        props: {
          label: 'Click me',
          variant: 'primary',
          size: 'large',
          customProp: 'any value',
          nestedProp: {
            foo: 'bar',
            baz: 123,
          },
        },
      };

      expect(() => ComponentSchema.parse(component)).not.toThrow();
    });

    it('should accept component with style', () => {
      const component: ComponentType = {
        type: 'div',
        style: {
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: '#f5f5f5',
        },
      };

      expect(() => ComponentSchema.parse(component)).not.toThrow();
    });

    it('should accept component with events', () => {
      const component = {
        type: 'button',
        events: {
          onClick: () => {},
          onHover: () => {},
          onCustomEvent: () => {},
        },
      };

      expect(() => ComponentSchema.parse(component)).not.toThrow();
    });
  });

  describe('Component Nesting (Recursive Structure)', () => {
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
        type: 'container',
        children: [
          {
            type: 'header',
            props: { title: 'Title' },
          },
          {
            type: 'content',
            props: { text: 'Body' },
          },
          {
            type: 'footer',
            props: { copyright: '2025' },
          },
        ],
      };

      expect(() => ComponentSchema.parse(component)).not.toThrow();
    });

    it('should accept deeply nested components (3+ levels)', () => {
      const component: ComponentType = {
        type: 'page',
        children: [
          {
            type: 'section',
            children: [
              {
                type: 'card',
                children: [
                  {
                    type: 'button',
                    props: { label: 'Deep Button' },
                  },
                ],
              },
            ],
          },
        ],
      };

      expect(() => ComponentSchema.parse(component)).not.toThrow();
    });

    it('should accept complex nested structure with props at each level', () => {
      const component: ComponentType = {
        type: 'dashboard',
        props: { title: 'My Dashboard' },
        children: [
          {
            type: 'grid',
            props: { columns: 3 },
            children: [
              {
                type: 'widget',
                props: { type: 'chart', data: [] },
              },
              {
                type: 'widget',
                props: { type: 'stats', value: 100 },
              },
            ],
          },
        ],
      };

      expect(() => ComponentSchema.parse(component)).not.toThrow();
    });
  });

  describe('Real-World Component Trees', () => {
    it('should accept form with input fields', () => {
      const form = {
        type: 'form',
        props: {
          action: '/submit',
          method: 'POST',
        },
        children: [
          {
            type: 'input',
            props: {
              name: 'username',
              type: 'text',
              placeholder: 'Enter username',
              required: true,
            },
          },
          {
            type: 'input',
            props: {
              name: 'password',
              type: 'password',
              placeholder: 'Enter password',
            },
          },
          {
            type: 'button',
            props: {
              type: 'submit',
              label: 'Login',
            },
          },
        ],
      };

      expect(() => ComponentSchema.parse(form)).not.toThrow();
    });

    it('should accept table component tree', () => {
      const table = {
        type: 'table',
        props: {
          columns: [
            { key: 'name', label: 'Name', sortable: true },
            { key: 'email', label: 'Email' },
          ],
          dataSource: 'users',
          pagination: { pageSize: 20 },
        },
        children: [
          {
            type: 'table-toolbar',
            props: { showSearch: true },
          },
        ],
      };

      expect(() => ComponentSchema.parse(table)).not.toThrow();
    });

    it('should accept navigation menu tree', () => {
      const menu = {
        type: 'menu',
        props: {
          mode: 'vertical',
          theme: 'dark',
        },
        children: [
          {
            type: 'menu-item',
            props: {
              key: 'dashboard',
              label: 'Dashboard',
              icon: 'home',
            },
          },
          {
            type: 'menu-submenu',
            props: {
              key: 'settings',
              label: 'Settings',
            },
            children: [
              {
                type: 'menu-item',
                props: {
                  key: 'profile',
                  label: 'Profile',
                },
              },
              {
                type: 'menu-item',
                props: {
                  key: 'preferences',
                  label: 'Preferences',
                },
              },
            ],
          },
        ],
      };

      expect(() => ComponentSchema.parse(menu)).not.toThrow();
    });

    it('should accept modal with complex content', () => {
      const modal = {
        type: 'modal',
        props: {
          title: 'Confirm Action',
          size: 'medium',
          visible: true,
        },
        children: [
          {
            type: 'alert',
            props: {
              type: 'warning',
              message: 'This action cannot be undone',
            },
          },
          {
            type: 'div',
            children: [
              {
                type: 'button',
                props: { label: 'Cancel', variant: 'secondary' },
                events: { onClick: () => {} },
              },
              {
                type: 'button',
                props: { label: 'Confirm', variant: 'primary' },
                events: { onClick: () => {} },
              },
            ],
          },
        ],
      };

      expect(() => ComponentSchema.parse(modal)).not.toThrow();
    });
  });

  describe('Prop Flexibility', () => {
    it('should accept unknown/custom props without validation', () => {
      const component = {
        type: 'custom-component',
        props: {
          customField1: 'value',
          customField2: 123,
          customField3: true,
          customField4: ['array', 'values'],
          customField5: {
            nested: {
              deeply: 'works',
            },
          },
        },
      };

      expect(() => ComponentSchema.parse(component)).not.toThrow();
    });

    it('should accept components without props', () => {
      const component = {
        type: 'divider',
      };

      expect(() => ComponentSchema.parse(component)).not.toThrow();
    });
  });

  describe('Style and Events', () => {
    it('should accept component with both style and events', () => {
      const component = {
        type: 'interactive-card',
        props: { title: 'Click me' },
        style: {
          cursor: 'pointer',
          border: '1px solid #ccc',
        },
        events: {
          onClick: () => {},
          onMouseEnter: () => {},
        },
        children: [
          {
            type: 'text',
            props: { content: 'Interactive content' },
          },
        ],
      };

      expect(() => ComponentSchema.parse(component)).not.toThrow();
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

  it('should create nested component via factory', () => {
    const component = Component.create({
      type: 'container',
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

  it('should validate structure via factory', () => {
    // Missing required 'type' field
    expect(() =>
      Component.create({
        props: { title: 'No type' },
      } as any)
    ).toThrow();
  });
});
