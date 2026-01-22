import { describe, it, expect } from 'vitest';
import {
  PageSchema,
  PageComponentSchema,
  PageRegionSchema,
  type Page,
  type PageComponent,
  type PageRegion,
} from './page.zod';

describe('PageComponentSchema', () => {
  it('should accept valid minimal component', () => {
    const component: PageComponent = {
      type: 'steedos-labs.related-list',
      properties: {},
    };

    expect(() => PageComponentSchema.parse(component)).not.toThrow();
  });

  it('should accept component with all fields', () => {
    const component = PageComponentSchema.parse({
      type: 'steedos-labs.related-list',
      id: 'related_contacts',
      label: 'Related Contacts',
      properties: {
        objectName: 'contact',
        filterField: 'account_id',
        columns: ['name', 'email', 'phone'],
      },
      visibility: 'record.type == "Customer"',
    });

    expect(component.id).toBe('related_contacts');
    expect(component.label).toBe('Related Contacts');
    expect(component.visibility).toBeDefined();
  });

  it('should accept component with complex properties', () => {
    const component = PageComponentSchema.parse({
      type: 'custom.dashboard-widget',
      properties: {
        title: 'Sales Pipeline',
        chartType: 'funnel',
        dataSource: 'opportunity',
        filters: { stage: { $ne: 'Closed Lost' } },
        groupBy: 'stage',
        aggregate: 'sum',
        field: 'amount',
      },
    });

    expect(component.properties.title).toBe('Sales Pipeline');
  });
});

describe('PageRegionSchema', () => {
  it('should accept valid minimal region', () => {
    const region: PageRegion = {
      name: 'main',
      components: [],
    };

    expect(() => PageRegionSchema.parse(region)).not.toThrow();
  });

  it('should accept region with all fields', () => {
    const region = PageRegionSchema.parse({
      name: 'sidebar',
      width: 'small',
      components: [
        {
          type: 'steedos-labs.quick-actions',
          properties: { actions: ['edit', 'delete'] },
        },
      ],
    });

    expect(region.name).toBe('sidebar');
    expect(region.width).toBe('small');
    expect(region.components).toHaveLength(1);
  });

  it('should accept different region widths', () => {
    const widths: Array<NonNullable<PageRegion['width']>> = ['small', 'medium', 'large', 'full'];

    widths.forEach(width => {
      const region = PageRegionSchema.parse({
        name: 'test',
        width,
        components: [],
      });
      expect(region.width).toBe(width);
    });
  });

  it('should accept region with multiple components', () => {
    const region = PageRegionSchema.parse({
      name: 'main',
      components: [
        { type: 'component.header', properties: {} },
        { type: 'component.body', properties: {} },
        { type: 'component.footer', properties: {} },
      ],
    });

    expect(region.components).toHaveLength(3);
  });
});

describe('PageSchema', () => {
  it('should accept valid minimal page', () => {
    const page: Page = {
      name: 'account_record_page',
      label: 'Account Record Page',
      regions: [],
    };

    expect(() => PageSchema.parse(page)).not.toThrow();
  });

  it('should validate page name format (snake_case)', () => {
    expect(() => PageSchema.parse({
      name: 'valid_page_name',
      label: 'Valid Page',
      regions: [],
    })).not.toThrow();

    expect(() => PageSchema.parse({
      name: 'InvalidPage',
      label: 'Invalid',
      regions: [],
    })).toThrow();

    expect(() => PageSchema.parse({
      name: 'invalid-page',
      label: 'Invalid',
      regions: [],
    })).toThrow();
  });

  it('should apply default values', () => {
    const page = PageSchema.parse({
      name: 'test_page',
      label: 'Test Page',
      regions: [],
    });

    expect(page.type).toBe('record');
    expect(page.template).toBe('default');
    expect(page.isDefault).toBe(false);
  });

  it('should accept page with all fields', () => {
    const page = PageSchema.parse({
      name: 'account_record_page',
      label: 'Account Record Page',
      description: 'Custom record page for accounts',
      type: 'record',
      object: 'account',
      template: 'header-sidebar-main',
      regions: [
        {
          name: 'header',
          components: [
            { type: 'record.header', properties: {} },
          ],
        },
        {
          name: 'sidebar',
          width: 'small',
          components: [
            { type: 'record.details', properties: {} },
          ],
        },
        {
          name: 'main',
          width: 'large',
          components: [
            { type: 'related.list', properties: { objectName: 'contact' } },
          ],
        },
      ],
      isDefault: true,
      assignedProfiles: ['admin', 'sales_user'],
    });

    expect(page.object).toBe('account');
    expect(page.regions).toHaveLength(3);
    expect(page.isDefault).toBe(true);
  });

  it('should accept different page types', () => {
    const types: Array<Page['type']> = ['record', 'home', 'app', 'utility'];

    types.forEach(type => {
      const page = PageSchema.parse({
        name: 'test_page',
        label: 'Test Page',
        type,
        regions: [],
      });
      expect(page.type).toBe(type);
    });
  });

  it('should accept record page', () => {
    const page = PageSchema.parse({
      name: 'opportunity_page',
      label: 'Opportunity Page',
      type: 'record',
      object: 'opportunity',
      regions: [
        {
          name: 'main',
          components: [
            { type: 'record.form', properties: {} },
          ],
        },
      ],
    });

    expect(page.type).toBe('record');
    expect(page.object).toBe('opportunity');
  });

  it('should accept home page', () => {
    const page = PageSchema.parse({
      name: 'sales_home',
      label: 'Sales Home',
      type: 'home',
      regions: [
        {
          name: 'main',
          components: [
            { type: 'dashboard.widget', properties: { dashboardId: 'sales_dashboard' } },
          ],
        },
      ],
    });

    expect(page.type).toBe('home');
  });

  it('should accept app page', () => {
    const page = PageSchema.parse({
      name: 'sales_app',
      label: 'Sales App',
      type: 'app',
      regions: [
        {
          name: 'main',
          components: [
            { type: 'app.navigation', properties: {} },
          ],
        },
      ],
    });

    expect(page.type).toBe('app');
  });

  it('should accept utility page', () => {
    const page = PageSchema.parse({
      name: 'notes_utility',
      label: 'Notes Utility',
      type: 'utility',
      regions: [
        {
          name: 'main',
          components: [
            { type: 'utility.notes', properties: {} },
          ],
        },
      ],
    });

    expect(page.type).toBe('utility');
  });

  it('should accept page with profile assignments', () => {
    const page = PageSchema.parse({
      name: 'custom_page',
      label: 'Custom Page',
      regions: [],
      assignedProfiles: ['admin', 'sales_manager', 'sales_rep'],
    });

    expect(page.assignedProfiles).toHaveLength(3);
  });

  it('should accept page with custom template', () => {
    const page = PageSchema.parse({
      name: 'custom_layout_page',
      label: 'Custom Layout Page',
      template: 'three-column-layout',
      regions: [],
    });

    expect(page.template).toBe('three-column-layout');
  });

  it('should accept default page', () => {
    const page = PageSchema.parse({
      name: 'default_page',
      label: 'Default Page',
      isDefault: true,
      regions: [],
    });

    expect(page.isDefault).toBe(true);
  });

  it('should accept page with multiple regions', () => {
    const page = PageSchema.parse({
      name: 'multi_region_page',
      label: 'Multi Region Page',
      regions: [
        { name: 'header', components: [] },
        { name: 'sidebar', width: 'small', components: [] },
        { name: 'main', width: 'large', components: [] },
        { name: 'footer', components: [] },
      ],
    });

    expect(page.regions).toHaveLength(4);
  });

  it('should accept page with nested component properties', () => {
    const page = PageSchema.parse({
      name: 'complex_page',
      label: 'Complex Page',
      regions: [
        {
          name: 'main',
          components: [
            {
              type: 'custom.widget',
              id: 'widget_1',
              properties: {
                config: {
                  nested: {
                    deeply: {
                      value: 'test',
                    },
                  },
                },
                array: [1, 2, 3],
                bool: true,
              },
            },
          ],
        },
      ],
    });

    expect(page.regions[0].components[0].properties.config).toBeDefined();
  });

  it('should reject page without required fields', () => {
    expect(() => PageSchema.parse({
      label: 'Test Page',
      regions: [],
    })).toThrow();

    expect(() => PageSchema.parse({
      name: 'test_page',
      regions: [],
    })).toThrow();

    expect(() => PageSchema.parse({
      name: 'test_page',
      label: 'Test Page',
    })).toThrow();
  });

  it('should reject invalid page type', () => {
    expect(() => PageSchema.parse({
      name: 'test_page',
      label: 'Test Page',
      type: 'invalid',
      regions: [],
    })).toThrow();
  });
});
