import { describe, it, expect } from 'vitest';
import {
  InterfaceSchema,
  InterfaceBrandingSchema,
  defineInterface,
  type Interface,
} from './interface.zod';
import {
  PageSchema,
  PageTypeSchema,
  PageComponentSchema,
  RecordReviewConfigSchema,
  ElementDataSourceSchema,
  BlankPageLayoutSchema,
  PageVariableSchema,
  type Page,
  type ElementDataSource,
  type RecordReviewConfig,
} from './page.zod';
import {
  ElementTextPropsSchema,
  ElementNumberPropsSchema,
  ElementImagePropsSchema,
  ElementButtonPropsSchema,
  ElementFilterPropsSchema,
  ElementFormPropsSchema,
  ElementRecordPickerPropsSchema,
  ComponentPropsMap,
} from './component.zod';
import {
  SharingConfigSchema,
  EmbedConfigSchema,
} from './sharing.zod';

// ---------------------------------------------------------------------------
// PageTypeSchema — unified page types (platform + interface)
// ---------------------------------------------------------------------------
describe('PageTypeSchema', () => {
  it('should accept all platform page types', () => {
    const types = ['record', 'home', 'app', 'utility'];
    types.forEach(type => {
      expect(() => PageTypeSchema.parse(type)).not.toThrow();
    });
  });

  it('should accept all interface page types', () => {
    const types = [
      'dashboard', 'grid', 'list', 'gallery', 'kanban', 'calendar',
      'timeline', 'form', 'record_detail', 'record_review', 'overview', 'blank',
    ];

    types.forEach(type => {
      expect(() => PageTypeSchema.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid page type', () => {
    expect(() => PageTypeSchema.parse('invalid')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// RecordReviewConfigSchema
// ---------------------------------------------------------------------------
describe('RecordReviewConfigSchema', () => {
  it('should accept minimal review config', () => {
    const config: RecordReviewConfig = RecordReviewConfigSchema.parse({
      object: 'order',
      actions: [
        { label: 'Approve', type: 'approve' },
      ],
    });

    expect(config.object).toBe('order');
    expect(config.actions).toHaveLength(1);
    expect(config.navigation).toBe('sequential');
    expect(config.showProgress).toBe(true);
  });

  it('should accept full review config', () => {
    const config = RecordReviewConfigSchema.parse({
      object: 'invoice',
      filter: { status: 'pending' },
      sort: [{ field: 'created_at', order: 'desc' }],
      displayFields: ['amount', 'vendor', 'description'],
      actions: [
        { label: 'Approve', type: 'approve', field: 'status', value: 'approved', nextRecord: true },
        { label: 'Reject', type: 'reject', field: 'status', value: 'rejected' },
        { label: 'Skip', type: 'skip', nextRecord: true },
        { label: 'Flag', type: 'custom', field: 'flagged', value: true },
      ],
      navigation: 'filtered',
      showProgress: false,
    });

    expect(config.actions).toHaveLength(4);
    expect(config.navigation).toBe('filtered');
    expect(config.showProgress).toBe(false);
    expect(config.displayFields).toEqual(['amount', 'vendor', 'description']);
  });

  it('should reject review config without object', () => {
    expect(() => RecordReviewConfigSchema.parse({
      actions: [{ label: 'Approve', type: 'approve' }],
    })).toThrow();
  });

  it('should reject review config without actions', () => {
    expect(() => RecordReviewConfigSchema.parse({
      object: 'order',
    })).toThrow();
  });

  it('should accept all action types', () => {
    const types = ['approve', 'reject', 'skip', 'custom'] as const;

    types.forEach(type => {
      expect(() => RecordReviewConfigSchema.parse({
        object: 'order',
        actions: [{ label: 'Action', type }],
      })).not.toThrow();
    });
  });

  it('should accept all navigation modes', () => {
    const modes = ['sequential', 'random', 'filtered'] as const;

    modes.forEach(navigation => {
      const config = RecordReviewConfigSchema.parse({
        object: 'order',
        actions: [{ label: 'Ok', type: 'approve' }],
        navigation,
      });
      expect(config.navigation).toBe(navigation);
    });
  });
});

// ---------------------------------------------------------------------------
// InterfaceBrandingSchema
// ---------------------------------------------------------------------------
describe('InterfaceBrandingSchema', () => {
  it('should accept empty branding', () => {
    expect(() => InterfaceBrandingSchema.parse({})).not.toThrow();
  });

  it('should accept full branding config', () => {
    const branding = InterfaceBrandingSchema.parse({
      primaryColor: '#0070F3',
      logo: '/assets/logo.png',
      coverImage: '/assets/cover.jpg',
    });

    expect(branding.primaryColor).toBe('#0070F3');
    expect(branding.logo).toBe('/assets/logo.png');
    expect(branding.coverImage).toBe('/assets/cover.jpg');
  });
});

// ---------------------------------------------------------------------------
// PageSchema — interface page types (merged from InterfacePageSchema)
// ---------------------------------------------------------------------------
describe('PageSchema with interface page types', () => {
  it('should accept minimal interface-style page', () => {
    const page: Page = PageSchema.parse({
      name: 'page_overview',
      label: 'Overview',
      type: 'blank',
      regions: [],
    });

    expect(page.name).toBe('page_overview');
    expect(page.type).toBe('blank');
    expect(page.template).toBe('default');
  });

  it('should accept dashboard page', () => {
    const page = PageSchema.parse({
      name: 'page_dashboard',
      label: 'Dashboard',
      type: 'dashboard',
      regions: [
        {
          name: 'main',
          components: [
            { type: 'element:number', properties: { object: 'order', aggregate: 'count' } },
          ],
        },
      ],
    });

    expect(page.type).toBe('dashboard');
    expect(page.regions[0].components).toHaveLength(1);
  });

  it('should accept record_review page with config', () => {
    const page = PageSchema.parse({
      name: 'page_review',
      label: 'Review Queue',
      type: 'record_review',
      object: 'order',
      recordReview: {
        object: 'order',
        actions: [
          { label: 'Approve', type: 'approve', field: 'status', value: 'approved' },
          { label: 'Reject', type: 'reject', field: 'status', value: 'rejected' },
        ],
      },
      regions: [],
    });

    expect(page.type).toBe('record_review');
    expect(page.recordReview?.actions).toHaveLength(2);
  });

  it('should accept page with variables', () => {
    const page = PageSchema.parse({
      name: 'page_filtered',
      label: 'Filtered View',
      type: 'blank',
      variables: [
        { name: 'selectedId', type: 'string' },
        { name: 'showArchived', type: 'boolean', defaultValue: false },
      ],
      regions: [],
    });

    expect(page.variables).toHaveLength(2);
  });

  it('should accept all interface page types', () => {
    const types = [
      'dashboard', 'grid', 'list', 'gallery', 'kanban', 'calendar',
      'timeline', 'form', 'record_detail', 'record_review', 'overview', 'blank',
    ];

    types.forEach(type => {
      expect(() => PageSchema.parse({
        name: 'test_page',
        label: 'Test',
        type,
        regions: [],
      })).not.toThrow();
    });
  });

  it('should accept page with icon', () => {
    const page = PageSchema.parse({
      name: 'page_with_icon',
      label: 'Dashboard',
      type: 'dashboard',
      icon: 'bar-chart',
      regions: [],
    });

    expect(page.icon).toBe('bar-chart');
  });

  it('should accept page with i18n label', () => {
    expect(() => PageSchema.parse({
      name: 'i18n_page',
      label: { key: 'interface.pages.overview', defaultValue: 'Overview' },
      regions: [],
    })).not.toThrow();
  });

  it('should accept page with ARIA attributes', () => {
    expect(() => PageSchema.parse({
      name: 'accessible_page',
      label: 'Accessible Page',
      regions: [],
      aria: { ariaLabel: 'Interface overview page', role: 'main' },
    })).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// InterfaceSchema
// ---------------------------------------------------------------------------
describe('InterfaceSchema', () => {
  it('should accept minimal interface', () => {
    const iface: Interface = InterfaceSchema.parse({
      name: 'order_review',
      label: 'Order Review',
      pages: [],
    });

    expect(iface.name).toBe('order_review');
    expect(iface.label).toBe('Order Review');
    expect(iface.pages).toHaveLength(0);
  });

  it('should accept full interface', () => {
    const iface = InterfaceSchema.parse({
      name: 'sales_portal',
      label: 'Sales Portal',
      description: 'Self-service portal for sales reps',
      object: 'opportunity',
      pages: [
        {
          name: 'page_dashboard',
          label: 'Dashboard',
          type: 'dashboard',
          regions: [],
        },
        {
          name: 'page_pipeline',
          label: 'Pipeline',
          type: 'kanban',
          object: 'opportunity',
          regions: [],
        },
      ],
      homePageName: 'page_dashboard',
      branding: {
        primaryColor: '#1A73E8',
        logo: '/logos/sales.png',
      },
      assignedRoles: ['sales_rep', 'sales_manager'],
      isDefault: true,
    });

    expect(iface.pages).toHaveLength(2);
    expect(iface.homePageName).toBe('page_dashboard');
    expect(iface.assignedRoles).toHaveLength(2);
    expect(iface.isDefault).toBe(true);
  });

  it('should validate name format (snake_case)', () => {
    expect(() => InterfaceSchema.parse({
      name: 'valid_name',
      label: 'Valid',
      pages: [],
    })).not.toThrow();

    expect(() => InterfaceSchema.parse({
      name: 'InvalidName',
      label: 'Invalid',
      pages: [],
    })).toThrow();

    expect(() => InterfaceSchema.parse({
      name: 'invalid-name',
      label: 'Invalid',
      pages: [],
    })).toThrow();
  });

  it('should reject without required fields', () => {
    expect(() => InterfaceSchema.parse({
      label: 'Missing Name',
      pages: [],
    })).toThrow();

    expect(() => InterfaceSchema.parse({
      name: 'missing_label',
      pages: [],
    })).toThrow();

    expect(() => InterfaceSchema.parse({
      name: 'missing_pages',
      label: 'Missing Pages',
    })).toThrow();
  });

  it('should accept interface with ARIA attributes', () => {
    expect(() => InterfaceSchema.parse({
      name: 'accessible_interface',
      label: 'Accessible Interface',
      pages: [],
      aria: { ariaLabel: 'Sales portal interface', role: 'application' },
    })).not.toThrow();
  });

  it('should accept i18n labels', () => {
    expect(() => InterfaceSchema.parse({
      name: 'i18n_interface',
      label: { key: 'interfaces.review', defaultValue: 'Review' },
      description: { key: 'interfaces.review.desc', defaultValue: 'Review orders' },
      pages: [],
    })).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// defineInterface factory
// ---------------------------------------------------------------------------
describe('defineInterface', () => {
  it('should create a validated interface', () => {
    const iface = defineInterface({
      name: 'hr_portal',
      label: 'HR Portal',
      pages: [
        {
          name: 'page_onboarding',
          label: 'Onboarding',
          type: 'overview',
          regions: [],
        },
      ],
    });

    expect(iface.name).toBe('hr_portal');
    expect(iface.pages).toHaveLength(1);
  });

  it('should throw on invalid config', () => {
    expect(() => defineInterface({
      name: 'InvalidName',
      label: 'Invalid',
      pages: [],
    })).toThrow();
  });
});

describe('InterfaceSchema with icon and group fields', () => {
  it('should accept interface with icon', () => {
    const iface = InterfaceSchema.parse({
      name: 'sales_workspace',
      label: 'Sales Workspace',
      icon: 'briefcase',
      pages: [],
    });

    expect(iface.icon).toBe('briefcase');
  });

  it('should accept interface with group', () => {
    const iface = InterfaceSchema.parse({
      name: 'service_portal',
      label: 'Service Portal',
      group: 'Service Cloud',
      pages: [],
    });

    expect(iface.group).toBe('Service Cloud');
  });

  it('should accept interface with both icon and group', () => {
    const iface = InterfaceSchema.parse({
      name: 'analytics_dashboard',
      label: 'Analytics Dashboard',
      icon: 'chart-bar',
      group: 'Analytics',
      pages: [],
    });

    expect(iface.icon).toBe('chart-bar');
    expect(iface.group).toBe('Analytics');
  });

  it('should accept interface without icon or group (backward compatibility)', () => {
    const iface = InterfaceSchema.parse({
      name: 'legacy_interface',
      label: 'Legacy Interface',
      pages: [],
    });

    expect(iface.icon).toBeUndefined();
    expect(iface.group).toBeUndefined();
  });

  it('should accept full interface with all new fields', () => {
    const iface = InterfaceSchema.parse({
      name: 'complete_interface',
      label: 'Complete Interface',
      description: 'Full-featured interface',
      icon: 'layout-dashboard',
      group: 'Sales Cloud',
      object: 'opportunity',
      pages: [
        {
          name: 'page_dashboard',
          label: 'Dashboard',
          type: 'dashboard',
          regions: [],
        },
      ],
      homePageName: 'page_dashboard',
      branding: {
        primaryColor: '#1A73E8',
      },
      assignedRoles: ['sales_rep'],
      isDefault: true,
    });

    expect(iface.icon).toBe('layout-dashboard');
    expect(iface.group).toBe('Sales Cloud');
    expect(iface.object).toBe('opportunity');
    expect(iface.pages).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Content Elements in PageComponentType
// ---------------------------------------------------------------------------
describe('Content Elements', () => {
  it('should accept element:text component', () => {
    expect(() => PageComponentSchema.parse({
      type: 'element:text',
      properties: { content: 'Hello World' },
    })).not.toThrow();
  });

  it('should accept element:number component', () => {
    expect(() => PageComponentSchema.parse({
      type: 'element:number',
      properties: { object: 'order', aggregate: 'count' },
    })).not.toThrow();
  });

  it('should accept element:image component', () => {
    expect(() => PageComponentSchema.parse({
      type: 'element:image',
      properties: { src: '/images/banner.jpg' },
    })).not.toThrow();
  });

  it('should accept element:divider component', () => {
    expect(() => PageComponentSchema.parse({
      type: 'element:divider',
      properties: {},
    })).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// ElementDataSourceSchema (per-element data binding)
// ---------------------------------------------------------------------------
describe('ElementDataSourceSchema', () => {
  it('should accept minimal data source', () => {
    const ds: ElementDataSource = ElementDataSourceSchema.parse({
      object: 'order',
    });

    expect(ds.object).toBe('order');
    expect(ds.view).toBeUndefined();
    expect(ds.filter).toBeUndefined();
    expect(ds.sort).toBeUndefined();
    expect(ds.limit).toBeUndefined();
  });

  it('should accept full data source', () => {
    const ds = ElementDataSourceSchema.parse({
      object: 'invoice',
      view: 'pending_review',
      filter: { status: 'pending' },
      sort: [{ field: 'created_at', order: 'desc' }],
      limit: 50,
    });

    expect(ds.object).toBe('invoice');
    expect(ds.view).toBe('pending_review');
    expect(ds.sort).toHaveLength(1);
    expect(ds.limit).toBe(50);
  });

  it('should reject without object', () => {
    expect(() => ElementDataSourceSchema.parse({})).toThrow();
  });

  it('should reject invalid sort order', () => {
    expect(() => ElementDataSourceSchema.parse({
      object: 'order',
      sort: [{ field: 'name', order: 'invalid' }],
    })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// PageComponentSchema dataSource integration
// ---------------------------------------------------------------------------
describe('PageComponent dataSource integration', () => {
  it('should accept component with dataSource', () => {
    const component = PageComponentSchema.parse({
      type: 'element:number',
      properties: { object: 'order', aggregate: 'sum', field: 'total' },
      dataSource: {
        object: 'order',
        filter: { status: 'completed' },
        limit: 100,
      },
    });

    expect(component.dataSource?.object).toBe('order');
    expect(component.dataSource?.limit).toBe(100);
  });

  it('should accept component without dataSource', () => {
    const component = PageComponentSchema.parse({
      type: 'element:text',
      properties: { content: 'Static text' },
    });

    expect(component.dataSource).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Element Props Schemas
// ---------------------------------------------------------------------------
describe('ElementTextPropsSchema', () => {
  it('should accept minimal text props', () => {
    const props = ElementTextPropsSchema.parse({ content: 'Hello' });
    expect(props.content).toBe('Hello');
    expect(props.variant).toBe('body');
    expect(props.align).toBe('left');
  });

  it('should accept full text props', () => {
    const props = ElementTextPropsSchema.parse({
      content: '# Welcome',
      variant: 'heading',
      align: 'center',
    });
    expect(props.variant).toBe('heading');
    expect(props.align).toBe('center');
  });

  it('should accept all variants', () => {
    const variants = ['heading', 'subheading', 'body', 'caption'] as const;
    variants.forEach(variant => {
      expect(() => ElementTextPropsSchema.parse({ content: 'Test', variant })).not.toThrow();
    });
  });

  it('should reject without content', () => {
    expect(() => ElementTextPropsSchema.parse({})).toThrow();
  });
});

describe('ElementNumberPropsSchema', () => {
  it('should accept minimal number props', () => {
    const props = ElementNumberPropsSchema.parse({
      object: 'order',
      aggregate: 'count',
    });
    expect(props.object).toBe('order');
    expect(props.aggregate).toBe('count');
    expect(props.field).toBeUndefined();
  });

  it('should accept full number props', () => {
    const props = ElementNumberPropsSchema.parse({
      object: 'order',
      field: 'amount',
      aggregate: 'sum',
      filter: { status: 'paid' },
      format: 'currency',
      prefix: '$',
      suffix: ' USD',
    });
    expect(props.format).toBe('currency');
    expect(props.prefix).toBe('$');
    expect(props.suffix).toBe(' USD');
  });

  it('should accept all aggregate functions', () => {
    const aggregates = ['count', 'sum', 'avg', 'min', 'max'] as const;
    aggregates.forEach(aggregate => {
      expect(() => ElementNumberPropsSchema.parse({ object: 'order', aggregate })).not.toThrow();
    });
  });

  it('should accept all format options', () => {
    const formats = ['number', 'currency', 'percent'] as const;
    formats.forEach(format => {
      expect(() => ElementNumberPropsSchema.parse({ object: 'order', aggregate: 'count', format })).not.toThrow();
    });
  });

  it('should reject without required fields', () => {
    expect(() => ElementNumberPropsSchema.parse({})).toThrow();
    expect(() => ElementNumberPropsSchema.parse({ object: 'order' })).toThrow();
  });
});

describe('ElementImagePropsSchema', () => {
  it('should accept minimal image props', () => {
    const props = ElementImagePropsSchema.parse({ src: '/images/hero.jpg' });
    expect(props.src).toBe('/images/hero.jpg');
    expect(props.fit).toBe('cover');
  });

  it('should accept full image props', () => {
    const props = ElementImagePropsSchema.parse({
      src: '/images/banner.png',
      alt: 'Company banner',
      fit: 'contain',
      height: 200,
    });
    expect(props.alt).toBe('Company banner');
    expect(props.fit).toBe('contain');
    expect(props.height).toBe(200);
  });

  it('should accept all fit modes', () => {
    const fits = ['cover', 'contain', 'fill'] as const;
    fits.forEach(fit => {
      expect(() => ElementImagePropsSchema.parse({ src: '/img.png', fit })).not.toThrow();
    });
  });

  it('should reject without src', () => {
    expect(() => ElementImagePropsSchema.parse({})).toThrow();
  });
});

// ---------------------------------------------------------------------------
// ComponentPropsMap content elements
// ---------------------------------------------------------------------------
describe('ComponentPropsMap content elements', () => {
  it('should contain element:text', () => {
    expect(ComponentPropsMap['element:text']).toBeDefined();
  });

  it('should contain element:number', () => {
    expect(ComponentPropsMap['element:number']).toBeDefined();
  });

  it('should contain element:image', () => {
    expect(ComponentPropsMap['element:image']).toBeDefined();
  });

  it('should contain element:divider', () => {
    expect(ComponentPropsMap['element:divider']).toBeDefined();
  });

  it('should parse element:text props', () => {
    const result = ComponentPropsMap['element:text'].parse({ content: 'Hello' });
    expect(result.content).toBe('Hello');
  });

  it('should parse element:number props', () => {
    const result = ComponentPropsMap['element:number'].parse({
      object: 'order',
      aggregate: 'count',
    });
    expect(result.object).toBe('order');
  });

  it('should parse element:image props', () => {
    const result = ComponentPropsMap['element:image'].parse({ src: '/img.png' });
    expect(result.src).toBe('/img.png');
  });

  it('should parse element:divider (empty props)', () => {
    expect(() => ComponentPropsMap['element:divider'].parse({})).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// End-to-end: Full interface with all features
// ---------------------------------------------------------------------------
describe('Interface end-to-end', () => {
  it('should accept a complete real-world interface definition', () => {
    const iface = defineInterface({
      name: 'order_management',
      label: 'Order Management',
      description: 'Complete order management interface',
      object: 'order',
      pages: [
        {
          name: 'page_overview',
          label: 'Overview',
          type: 'dashboard',
          regions: [
            {
              name: 'main',
              components: [
                {
                  type: 'element:text',
                  properties: { content: '# Order Dashboard', variant: 'heading' },
                },
                {
                  type: 'element:number',
                  properties: { object: 'order', aggregate: 'count' },
                  dataSource: { object: 'order', filter: { status: 'pending' } },
                },
                {
                  type: 'element:number',
                  properties: { object: 'order', aggregate: 'sum', field: 'total', format: 'currency', prefix: '$' },
                  dataSource: { object: 'order', filter: { status: 'completed' } },
                },
                {
                  type: 'element:divider',
                  properties: {},
                },
                {
                  type: 'element:image',
                  properties: { src: '/images/banner.jpg', alt: 'Order management', fit: 'cover', height: 200 },
                },
              ],
            },
          ],
        },
        {
          name: 'page_review',
          label: 'Review Queue',
          type: 'record_review',
          object: 'order',
          recordReview: {
            object: 'order',
            filter: { status: 'pending_review' },
            sort: [{ field: 'priority', order: 'desc' }],
            displayFields: ['customer_name', 'total', 'items_count'],
            actions: [
              { label: 'Approve', type: 'approve', field: 'status', value: 'approved' },
              { label: 'Reject', type: 'reject', field: 'status', value: 'rejected' },
              { label: 'Skip', type: 'skip' },
            ],
            navigation: 'sequential',
            showProgress: true,
          },
          regions: [],
        },
        {
          name: 'page_grid',
          label: 'All Orders',
          type: 'grid',
          object: 'order',
          regions: [],
        },
      ],
      homePageName: 'page_overview',
      branding: { primaryColor: '#2563EB', logo: '/logos/orders.png' },
      assignedRoles: ['order_manager', 'admin'],
      isDefault: true,
    });

    expect(iface.name).toBe('order_management');
    expect(iface.pages).toHaveLength(3);
    expect(iface.pages[1].recordReview?.actions).toHaveLength(3);
    expect(iface.branding?.primaryColor).toBe('#2563EB');
    expect(iface.assignedRoles).toEqual(['order_manager', 'admin']);
  });
});

// ---------------------------------------------------------------------------
// Phase B: Interactive Elements
// ---------------------------------------------------------------------------
describe('Interactive Elements — element:button', () => {
  it('should accept element:button component', () => {
    expect(() => PageComponentSchema.parse({
      type: 'element:button',
      properties: { label: 'Submit' },
    })).not.toThrow();
  });

  it('should parse element:button props with defaults', () => {
    const props = ElementButtonPropsSchema.parse({ label: 'Save' });
    expect(props.label).toBe('Save');
    expect(props.variant).toBe('primary');
    expect(props.size).toBe('medium');
    expect(props.iconPosition).toBe('left');
    expect(props.disabled).toBe(false);
  });

  it('should accept full button props', () => {
    const props = ElementButtonPropsSchema.parse({
      label: 'Delete',
      variant: 'danger',
      size: 'large',
      icon: 'trash',
      iconPosition: 'right',
      disabled: true,
    });
    expect(props.variant).toBe('danger');
    expect(props.icon).toBe('trash');
    expect(props.disabled).toBe(true);
  });

  it('should accept all button variants', () => {
    const variants = ['primary', 'secondary', 'danger', 'ghost', 'link'] as const;
    variants.forEach(variant => {
      expect(() => ElementButtonPropsSchema.parse({ label: 'Btn', variant })).not.toThrow();
    });
  });

  it('should reject button without label', () => {
    expect(() => ElementButtonPropsSchema.parse({})).toThrow();
  });
});

describe('Interactive Elements — element:filter', () => {
  it('should accept element:filter component', () => {
    expect(() => PageComponentSchema.parse({
      type: 'element:filter',
      properties: { object: 'order', fields: ['status'] },
    })).not.toThrow();
  });

  it('should parse filter props with defaults', () => {
    const props = ElementFilterPropsSchema.parse({
      object: 'order',
      fields: ['status', 'priority'],
    });
    expect(props.object).toBe('order');
    expect(props.layout).toBe('inline');
    expect(props.showSearch).toBe(true);
  });

  it('should accept filter with targetVariable', () => {
    const props = ElementFilterPropsSchema.parse({
      object: 'task',
      fields: ['status'],
      targetVariable: 'active_filter',
      layout: 'sidebar',
    });
    expect(props.targetVariable).toBe('active_filter');
    expect(props.layout).toBe('sidebar');
  });

  it('should reject filter without required fields', () => {
    expect(() => ElementFilterPropsSchema.parse({})).toThrow();
    expect(() => ElementFilterPropsSchema.parse({ object: 'order' })).toThrow();
  });
});

describe('Interactive Elements — element:form', () => {
  it('should accept element:form component', () => {
    expect(() => PageComponentSchema.parse({
      type: 'element:form',
      properties: { object: 'contact' },
    })).not.toThrow();
  });

  it('should parse form props with defaults', () => {
    const props = ElementFormPropsSchema.parse({ object: 'contact' });
    expect(props.object).toBe('contact');
    expect(props.mode).toBe('create');
  });

  it('should accept full form props', () => {
    const props = ElementFormPropsSchema.parse({
      object: 'contact',
      fields: ['name', 'email', 'phone'],
      mode: 'edit',
      submitLabel: 'Update Contact',
      onSubmit: 'navigate_to("page_detail")',
    });
    expect(props.mode).toBe('edit');
    expect(props.fields).toHaveLength(3);
    expect(props.submitLabel).toBe('Update Contact');
  });

  it('should reject form without object', () => {
    expect(() => ElementFormPropsSchema.parse({})).toThrow();
  });
});

describe('Interactive Elements — element:record_picker', () => {
  it('should accept element:record_picker component', () => {
    expect(() => PageComponentSchema.parse({
      type: 'element:record_picker',
      properties: { object: 'account', displayField: 'name' },
    })).not.toThrow();
  });

  it('should parse record_picker props with defaults', () => {
    const props = ElementRecordPickerPropsSchema.parse({
      object: 'account',
      displayField: 'name',
    });
    expect(props.object).toBe('account');
    expect(props.displayField).toBe('name');
    expect(props.multiple).toBe(false);
  });

  it('should accept full record_picker props', () => {
    const props = ElementRecordPickerPropsSchema.parse({
      object: 'account',
      displayField: 'name',
      searchFields: ['name', 'email'],
      filter: { status: 'active' },
      multiple: true,
      targetVariable: 'selected_account',
      placeholder: 'Search accounts...',
    });
    expect(props.multiple).toBe(true);
    expect(props.targetVariable).toBe('selected_account');
    expect(props.searchFields).toEqual(['name', 'email']);
  });

  it('should reject record_picker without required fields', () => {
    expect(() => ElementRecordPickerPropsSchema.parse({})).toThrow();
    expect(() => ElementRecordPickerPropsSchema.parse({ object: 'account' })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// ComponentPropsMap — interactive elements
// ---------------------------------------------------------------------------
describe('ComponentPropsMap interactive elements', () => {
  it('should contain element:button', () => {
    expect(ComponentPropsMap['element:button']).toBeDefined();
  });

  it('should contain element:filter', () => {
    expect(ComponentPropsMap['element:filter']).toBeDefined();
  });

  it('should contain element:form', () => {
    expect(ComponentPropsMap['element:form']).toBeDefined();
  });

  it('should contain element:record_picker', () => {
    expect(ComponentPropsMap['element:record_picker']).toBeDefined();
  });

  it('should parse element:button props', () => {
    const result = ComponentPropsMap['element:button'].parse({ label: 'Click Me' });
    expect(result.label).toBe('Click Me');
  });

  it('should parse element:filter props', () => {
    const result = ComponentPropsMap['element:filter'].parse({
      object: 'order',
      fields: ['status'],
    });
    expect(result.object).toBe('order');
  });

  it('should parse element:form props', () => {
    const result = ComponentPropsMap['element:form'].parse({ object: 'contact' });
    expect(result.object).toBe('contact');
  });

  it('should parse element:record_picker props', () => {
    const result = ComponentPropsMap['element:record_picker'].parse({
      object: 'account',
      displayField: 'name',
    });
    expect(result.object).toBe('account');
  });
});

// ---------------------------------------------------------------------------
// BlankPageLayoutSchema — free-form canvas composition
// ---------------------------------------------------------------------------
describe('BlankPageLayoutSchema', () => {
  it('should accept minimal layout with defaults', () => {
    const layout = BlankPageLayoutSchema.parse({
      items: [],
    });
    expect(layout.columns).toBe(12);
    expect(layout.rowHeight).toBe(40);
    expect(layout.gap).toBe(8);
    expect(layout.items).toHaveLength(0);
  });

  it('should accept full layout config', () => {
    const layout = BlankPageLayoutSchema.parse({
      columns: 24,
      rowHeight: 20,
      gap: 4,
      items: [
        { componentId: 'text_1', x: 0, y: 0, width: 12, height: 2 },
        { componentId: 'btn_1', x: 0, y: 2, width: 6, height: 1 },
        { componentId: 'picker_1', x: 6, y: 2, width: 6, height: 3 },
      ],
    });
    expect(layout.columns).toBe(24);
    expect(layout.items).toHaveLength(3);
    expect(layout.items[0].x).toBe(0);
    expect(layout.items[2].width).toBe(6);
  });

  it('should reject item with invalid dimensions', () => {
    expect(() => BlankPageLayoutSchema.parse({
      items: [{ componentId: 'a', x: 0, y: 0, width: 0, height: 1 }],
    })).toThrow();

    expect(() => BlankPageLayoutSchema.parse({
      items: [{ componentId: 'a', x: -1, y: 0, width: 1, height: 1 }],
    })).toThrow();
  });

  it('should accept page with blankLayout', () => {
    const page = PageSchema.parse({
      name: 'blank_canvas',
      label: 'Canvas',
      type: 'blank',
      regions: [
        {
          name: 'main',
          components: [
            { id: 'text_1', type: 'element:text', properties: { content: 'Hello' } },
            { id: 'btn_1', type: 'element:button', properties: { label: 'Click' } },
          ],
        },
      ],
      blankLayout: {
        columns: 12,
        items: [
          { componentId: 'text_1', x: 0, y: 0, width: 12, height: 2 },
          { componentId: 'btn_1', x: 0, y: 2, width: 4, height: 1 },
        ],
      },
    });

    expect(page.blankLayout?.items).toHaveLength(2);
    expect(page.blankLayout?.columns).toBe(12);
  });
});

// ---------------------------------------------------------------------------
// PageVariableSchema — record_picker variable binding
// ---------------------------------------------------------------------------
describe('PageVariableSchema record_id type', () => {
  it('should accept record_id variable type', () => {
    const variable = PageVariableSchema.parse({
      name: 'selected_account_id',
      type: 'record_id',
    });
    expect(variable.type).toBe('record_id');
  });

  it('should accept variable with source binding', () => {
    const variable = PageVariableSchema.parse({
      name: 'selected_account',
      type: 'record_id',
      source: 'picker_1',
    });
    expect(variable.source).toBe('picker_1');
  });

  it('should accept page with record_picker variable binding', () => {
    const page = PageSchema.parse({
      name: 'blank_picker',
      label: 'Picker Page',
      type: 'blank',
      variables: [
        { name: 'selected_id', type: 'record_id', source: 'account_picker' },
        { name: 'show_details', type: 'boolean', defaultValue: false },
      ],
      regions: [
        {
          name: 'main',
          components: [
            {
              id: 'account_picker',
              type: 'element:record_picker',
              properties: {
                object: 'account',
                displayField: 'name',
                targetVariable: 'selected_id',
              },
            },
          ],
        },
      ],
    });

    expect(page.variables).toHaveLength(2);
    expect(page.variables![0].type).toBe('record_id');
    expect(page.variables![0].source).toBe('account_picker');
  });
});

// ---------------------------------------------------------------------------
// Phase C: Interface sharing & embedding
// ---------------------------------------------------------------------------
describe('InterfaceSchema sharing and embedding', () => {
  it('should accept interface with sharing config', () => {
    const iface = InterfaceSchema.parse({
      name: 'shared_portal',
      label: 'Shared Portal',
      pages: [],
      sharing: {
        enabled: true,
        publicLink: 'https://app.example.com/share/portal',
        password: 'secure123',
        allowedDomains: ['example.com'],
        expiresAt: '2027-06-01T00:00:00Z',
      },
    });

    expect(iface.sharing?.enabled).toBe(true);
    expect(iface.sharing?.password).toBe('secure123');
    expect(iface.sharing?.allowedDomains).toEqual(['example.com']);
  });

  it('should accept interface with embed config', () => {
    const iface = InterfaceSchema.parse({
      name: 'embedded_portal',
      label: 'Embedded Portal',
      pages: [],
      embed: {
        enabled: true,
        allowedOrigins: ['https://partner.com'],
        width: '100%',
        height: '800px',
        showHeader: false,
      },
    });

    expect(iface.embed?.enabled).toBe(true);
    expect(iface.embed?.allowedOrigins).toEqual(['https://partner.com']);
    expect(iface.embed?.showHeader).toBe(false);
  });

  it('should accept interface with both sharing and embed', () => {
    const iface = InterfaceSchema.parse({
      name: 'full_shared',
      label: 'Full Shared',
      pages: [],
      sharing: { enabled: true },
      embed: { enabled: true },
      assignedRoles: ['viewer', 'editor'],
    });

    expect(iface.sharing?.enabled).toBe(true);
    expect(iface.embed?.enabled).toBe(true);
    expect(iface.assignedRoles).toHaveLength(2);
  });

  it('should accept interface without sharing/embed (backward compatibility)', () => {
    const iface = InterfaceSchema.parse({
      name: 'legacy_iface',
      label: 'Legacy Interface',
      pages: [],
    });

    expect(iface.sharing).toBeUndefined();
    expect(iface.embed).toBeUndefined();
  });
});
