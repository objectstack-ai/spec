import { describe, it, expect } from 'vitest';
import {
  AppSchema,
  AppBrandingSchema,
  NavigationItemSchema,
  ObjectNavItemSchema,
  DashboardNavItemSchema,
  PageNavItemSchema,
  UrlNavItemSchema,
  GroupNavItemSchema,
  defineApp,
  type App,
  type NavigationItem,
} from './app.zod';

describe('AppBrandingSchema', () => {
  it('should accept empty branding', () => {
    const branding = {};
    expect(() => AppBrandingSchema.parse(branding)).not.toThrow();
  });

  it('should accept full branding config', () => {
    const branding = {
      primaryColor: '#0070F3',
      logo: '/assets/logo.png',
      favicon: '/assets/favicon.ico',
    };

    expect(() => AppBrandingSchema.parse(branding)).not.toThrow();
  });
});

describe('ObjectNavItemSchema', () => {
  it('should accept minimal object nav item', () => {
    const navItem = {
      id: 'nav_accounts',
      label: 'Accounts',
      type: 'object' as const,
      objectName: 'account',
    };

    expect(() => ObjectNavItemSchema.parse(navItem)).not.toThrow();
  });

  it('should accept object nav item with all properties', () => {
    const navItem = {
      id: 'nav_active_tasks',
      label: 'Active Tasks',
      icon: 'check-square',
      type: 'object' as const,
      objectName: 'task',
      viewName: 'active',
      visible: 'user.has_permission("task.read")',
    };

    expect(() => ObjectNavItemSchema.parse(navItem)).not.toThrow();
  });
});

describe('DashboardNavItemSchema', () => {
  it('should accept dashboard nav item', () => {
    const navItem = {
      id: 'nav_sales_dashboard',
      label: 'Sales Dashboard',
      icon: 'chart-bar',
      type: 'dashboard' as const,
      dashboardName: 'sales_overview',
    };

    expect(() => DashboardNavItemSchema.parse(navItem)).not.toThrow();
  });
});

describe('PageNavItemSchema', () => {
  it('should accept page nav item without params', () => {
    const navItem = {
      id: 'nav_settings',
      label: 'Settings',
      icon: 'settings',
      type: 'page' as const,
      pageName: 'user_settings',
    };

    expect(() => PageNavItemSchema.parse(navItem)).not.toThrow();
  });

  it('should accept page nav item with params', () => {
    const navItem = {
      id: 'nav_custom_page',
      label: 'Custom Page',
      type: 'page' as const,
      pageName: 'custom_component',
      params: {
        mode: 'advanced',
        theme: 'dark',
      },
    };

    expect(() => PageNavItemSchema.parse(navItem)).not.toThrow();
  });
});

describe('UrlNavItemSchema', () => {
  it('should accept URL nav item with default target', () => {
    const navItem = {
      id: 'nav_documentation',
      label: 'Documentation',
      type: 'url' as const,
      url: 'https://docs.example.com',
    };

    const result = UrlNavItemSchema.parse(navItem);
    expect(result.target).toBe('_self');
  });

  it('should accept URL nav item with blank target', () => {
    const navItem = {
      id: 'nav_external',
      label: 'External Link',
      icon: 'external-link',
      type: 'url' as const,
      url: 'https://example.com',
      target: '_blank' as const,
    };

    expect(() => UrlNavItemSchema.parse(navItem)).not.toThrow();
  });
});

describe('GroupNavItemSchema', () => {
  it('should accept group nav item', () => {
    const navItem = {
      id: 'nav_sales',
      label: 'Sales',
      icon: 'briefcase',
      type: 'group' as const,
    };

    const result = GroupNavItemSchema.parse(navItem);
    expect(result.expanded).toBe(false);
  });

  it('should accept group with expanded state', () => {
    const navItem = {
      id: 'nav_admin',
      label: 'Administration',
      type: 'group' as const,
      expanded: true,
    };

    const result = GroupNavItemSchema.parse(navItem);
    expect(result.expanded).toBe(true);
  });
});

describe('NavigationItemSchema (Recursive)', () => {
  it('should accept flat navigation items', () => {
    const items = [
      {
        id: 'nav_home',
        label: 'Home',
        type: 'dashboard' as const,
        dashboardName: 'home',
      },
      {
        id: 'nav_accounts',
        label: 'Accounts',
        type: 'object' as const,
        objectName: 'account',
      },
    ];

    items.forEach(item => {
      expect(() => NavigationItemSchema.parse(item)).not.toThrow();
    });
  });

  it('should accept nested navigation with groups', () => {
    const navItem = {
      id: 'nav_sales',
      label: 'Sales',
      icon: 'briefcase',
      type: 'group' as const,
      children: [
        {
          id: 'nav_accounts',
          label: 'Accounts',
          type: 'object' as const,
          objectName: 'account',
        },
        {
          id: 'nav_opportunities',
          label: 'Opportunities',
          type: 'object' as const,
          objectName: 'opportunity',
        },
      ],
    };

    expect(() => NavigationItemSchema.parse(navItem)).not.toThrow();
  });

  it('should accept deeply nested navigation', () => {
    const navItem = {
      id: 'nav_admin',
      label: 'Administration',
      type: 'group' as const,
      children: [
        {
          id: 'nav_users',
          label: 'Users & Permissions',
          type: 'group' as const,
          children: [
            {
              id: 'nav_users_list',
              label: 'Users',
              type: 'object' as const,
              objectName: 'user',
            },
            {
              id: 'nav_roles',
              label: 'Roles',
              type: 'object' as const,
              objectName: 'role',
            },
          ],
        },
      ],
    };

    expect(() => NavigationItemSchema.parse(navItem)).not.toThrow();
  });
});

describe('AppSchema', () => {
  it('should accept minimal app', () => {
    const app: App = {
      name: 'crm',
      label: 'CRM',
      navigation: [],
    };

    const result = AppSchema.parse(app);
    expect(result.active).toBe(true);
    expect(result.isDefault).toBe(false);
  });

  it('should enforce snake_case for app name', () => {
    const validNames = ['crm', 'sales_cloud', 'hr_portal'];
    validNames.forEach(name => {
      expect(() => AppSchema.parse({ name, label: 'Test', navigation: [] })).not.toThrow();
    });

    const invalidNames = ['CRM', 'sales-cloud', 'SalesCloud', '123app', '_internal'];
    invalidNames.forEach(name => {
      expect(() => AppSchema.parse({ name, label: 'Test', navigation: [] })).toThrow();
    });
  });

  it('should accept app with basic properties', () => {
    const app: App = {
      name: 'sales_app',
      label: 'Sales Application',
      description: 'Manage sales processes',
      icon: 'briefcase',
      active: true,
      isDefault: true,
      navigation: [],
    };

    expect(() => AppSchema.parse(app)).not.toThrow();
  });

  it('should accept app with branding', () => {
    const app: App = {
      name: 'custom_app',
      label: 'Custom App',
      branding: {
        primaryColor: '#FF6B6B',
        logo: '/custom-logo.svg',
        favicon: '/custom-favicon.ico',
      },
      navigation: [],
    };

    expect(() => AppSchema.parse(app)).not.toThrow();
  });

  it('should accept app with home page', () => {
    const app: App = {
      name: 'portal',
      label: 'Customer Portal',
      homePageId: 'nav_dashboard',
      navigation: [
        {
          id: 'nav_dashboard',
          label: 'Dashboard',
          type: 'dashboard',
          dashboardName: 'customer_dashboard',
        },
      ],
    };

    expect(() => AppSchema.parse(app)).not.toThrow();
  });

  it('should accept app with required permissions', () => {
    const app: App = {
      name: 'admin_console',
      label: 'Admin Console',
      requiredPermissions: ['app.access.admin', 'system.admin'],
      navigation: [],
    };

    expect(() => AppSchema.parse(app)).not.toThrow();
  });

  describe('Real-World App Examples', () => {
    it('should accept CRM app with complex navigation', () => {
      const crmApp: App = {
        name: 'sales_crm',
        label: 'Sales CRM',
        description: 'Complete sales management solution',
        icon: 'chart-line',
        isDefault: true,
        branding: {
          primaryColor: '#0070F3',
        },
        homePageId: 'nav_home',
        navigation: [
          {
            id: 'nav_home',
            label: 'Home',
            icon: 'home',
            type: 'dashboard',
            dashboardName: 'sales_dashboard',
          },
          {
            id: 'nav_sales',
            label: 'Sales',
            icon: 'trending-up',
            type: 'group',
            expanded: true,
            children: [
              {
                id: 'nav_leads',
                label: 'Leads',
                icon: 'users',
                type: 'object',
                objectName: 'lead',
              },
              {
                id: 'nav_opportunities',
                label: 'Opportunities',
                icon: 'target',
                type: 'object',
                objectName: 'opportunity',
              },
              {
                id: 'nav_pipeline',
                label: 'Sales Pipeline',
                icon: 'chart-bar',
                type: 'dashboard',
                dashboardName: 'pipeline',
              },
            ],
          },
          {
            id: 'nav_customers',
            label: 'Customers',
            icon: 'building-2',
            type: 'group',
            children: [
              {
                id: 'nav_accounts',
                label: 'Accounts',
                type: 'object',
                objectName: 'account',
              },
              {
                id: 'nav_contacts',
                label: 'Contacts',
                type: 'object',
                objectName: 'contact',
              },
            ],
          },
          {
            id: 'nav_reports',
            label: 'Reports',
            icon: 'file-chart-line',
            type: 'page',
            pageName: 'reports_page',
          },
        ],
        requiredPermissions: ['app.access.crm'],
      };

      expect(() => AppSchema.parse(crmApp)).not.toThrow();
    });

    it('should accept HR portal app', () => {
      const hrApp: App = {
        name: 'hr_portal',
        label: 'HR Portal',
        description: 'Human resources management',
        icon: 'users-cog',
        branding: {
          primaryColor: '#10B981',
          logo: '/hr-logo.svg',
        },
        navigation: [
          {
            id: 'nav_my_info',
            label: 'My Information',
            icon: 'user',
            type: 'page',
            pageName: 'employee_profile',
          },
          {
            id: 'nav_time_off',
            label: 'Time Off',
            icon: 'calendar',
            type: 'object',
            objectName: 'time_off_request',
          },
          {
            id: 'nav_admin',
            label: 'Admin',
            icon: 'shield',
            type: 'group',
            visible: 'user.is_hr_admin',
            children: [
              {
                id: 'nav_employees',
                label: 'Employees',
                type: 'object',
                objectName: 'employee',
              },
              {
                id: 'nav_departments',
                label: 'Departments',
                type: 'object',
                objectName: 'department',
              },
            ],
          },
          {
            id: 'nav_help',
            label: 'Help Center',
            icon: 'help-circle',
            type: 'url',
            url: 'https://help.example.com',
            target: '_blank',
          },
        ],
        requiredPermissions: ['app.access.hr'],
      };

      expect(() => AppSchema.parse(hrApp)).not.toThrow();
    });

    it('should accept app with sharing and embed config', () => {
      const app = AppSchema.parse({
        name: 'shared_portal',
        label: 'Shared Portal',
        navigation: [],
        sharing: {
          enabled: true,
          allowAnonymous: true,
        },
        embed: {
          enabled: true,
          allowedOrigins: ['https://example.com'],
          responsive: true,
        },
      });

      expect(app.sharing?.enabled).toBe(true);
      expect(app.embed?.enabled).toBe(true);
      expect(app.embed?.allowedOrigins).toEqual(['https://example.com']);
    });

    it('should accept CRM app with deeply nested navigation tree', () => {
      const crmApp = AppSchema.parse({
        name: 'crm',
        label: 'Sales CRM',
        icon: 'briefcase',
        branding: { primaryColor: '#4169E1' },
        navigation: [
          {
            id: 'grp_sales',
            type: 'group',
            label: 'Sales Cloud',
            icon: 'briefcase',
            expanded: true,
            children: [
              { id: 'nav_pipeline', type: 'page', label: 'Pipeline', icon: 'columns', pageName: 'page_pipeline' },
              { id: 'nav_accounts', type: 'page', label: 'Accounts', icon: 'building', pageName: 'page_accounts' },
              { id: 'nav_leads', type: 'page', label: 'Leads', icon: 'user-plus', pageName: 'page_leads' },
              {
                id: 'grp_review',
                type: 'group',
                label: 'Lead Review',
                icon: 'clipboard-check',
                expanded: false,
                children: [
                  { id: 'nav_review_queue', type: 'page', label: 'Review Queue', icon: 'check-square', pageName: 'page_review_queue' },
                  { id: 'nav_qualified', type: 'page', label: 'Qualified', icon: 'check-circle', pageName: 'page_qualified' },
                ],
              },
            ],
          },
          {
            id: 'grp_analytics',
            type: 'group',
            label: 'Analytics',
            icon: 'chart-line',
            expanded: false,
            children: [
              { id: 'nav_overview', type: 'page', label: 'Overview', icon: 'gauge', pageName: 'page_overview' },
              { id: 'nav_pipeline_report', type: 'page', label: 'Pipeline Report', icon: 'chart-bar', pageName: 'page_pipeline_report' },
            ],
          },
          { id: 'nav_settings', type: 'page', label: 'Settings', icon: 'settings', pageName: 'admin_settings' },
          { id: 'nav_help', type: 'url', label: 'Help', icon: 'help-circle', url: 'https://help.example.com', target: '_blank' },
        ],
        homePageId: 'nav_pipeline',
        requiredPermissions: ['app.access.crm'],
      });

      expect(crmApp.navigation).toHaveLength(4);
      // Verify nested groups
      const salesGroup = crmApp.navigation![0];
      expect(salesGroup.type).toBe('group');
      expect(salesGroup.children).toHaveLength(4);
      // Verify deeply nested sub-group
      const reviewGroup = salesGroup.children[3];
      expect(reviewGroup.type).toBe('group');
      expect(reviewGroup.children).toHaveLength(2);
    });
  });
});

describe('App Mobile Navigation', () => {
  it('should accept app with mobile navigation', () => {
    const app = AppSchema.parse({
      name: 'mobile_app',
      label: 'Mobile App',
      mobileNavigation: {
        mode: 'bottom_nav',
        bottomNavItems: ['nav_home', 'nav_contacts', 'nav_settings'],
      },
    });
    expect(app.mobileNavigation?.mode).toBe('bottom_nav');
    expect(app.mobileNavigation?.bottomNavItems).toHaveLength(3);
  });
  it('should accept all mobile navigation modes', () => {
    const modes = ['drawer', 'bottom_nav', 'hamburger'] as const;
    modes.forEach(mode => {
      expect(() => AppSchema.parse({
        name: 'mobile_test',
        label: 'Test',
        mobileNavigation: { mode },
      })).not.toThrow();
    });
  });
  it('should default to drawer mode', () => {
    const app = AppSchema.parse({
      name: 'default_mobile',
      label: 'Default Mobile',
      mobileNavigation: {},
    });
    expect(app.mobileNavigation?.mode).toBe('drawer');
  });
});

describe('defineApp', () => {
  it('should return a parsed app', () => {
    const result = defineApp({
      name: 'crm',
      label: 'CRM',
      navigation: [
        { id: 'nav_accounts', label: 'Accounts', type: 'object', objectName: 'account' },
      ],
    });
    expect(result.name).toBe('crm');
    expect(result.label).toBe('CRM');
    expect(result.navigation).toHaveLength(1);
  });

  it('should apply defaults', () => {
    const result = defineApp({
      name: 'my_app',
      label: 'My App',
    });
    expect(result.name).toBe('my_app');
  });

  it('should throw on invalid input', () => {
    expect(() => defineApp({
      name: 'INVALID NAME',
      label: 'Test',
    })).toThrow();
  });
});

describe('AppSchema sharing and embed fields', () => {
  it('should accept app with sharing config', () => {
    const app = AppSchema.parse({
      name: 'public_app',
      label: 'Public App',
      sharing: {
        enabled: true,
        password: 'secret123',
        allowedDomains: ['example.com'],
      },
    });

    expect(app.sharing?.enabled).toBe(true);
    expect(app.sharing?.password).toBe('secret123');
    expect(app.sharing?.allowedDomains).toEqual(['example.com']);
  });

  it('should accept app with embed config', () => {
    const app = AppSchema.parse({
      name: 'embeddable_app',
      label: 'Embeddable App',
      embed: {
        enabled: true,
        allowedOrigins: ['https://portal.example.com'],
        width: '100%',
        height: '800px',
      },
    });

    expect(app.embed?.enabled).toBe(true);
    expect(app.embed?.allowedOrigins).toEqual(['https://portal.example.com']);
  });

  it('should accept app with both sharing and embed', () => {
    const app = AppSchema.parse({
      name: 'shared_embedded',
      label: 'Shared & Embedded',
      sharing: { enabled: true },
      embed: { enabled: true },
    });

    expect(app.sharing?.enabled).toBe(true);
    expect(app.embed?.enabled).toBe(true);
  });

  it('should accept app without sharing/embed (backward compatibility)', () => {
    const app = AppSchema.parse({
      name: 'basic_app',
      label: 'Basic App',
      navigation: [
        { id: 'nav_home', label: 'Home', type: 'object', objectName: 'account' },
      ],
    });

    expect(app.sharing).toBeUndefined();
    expect(app.embed).toBeUndefined();
    expect(app.navigation).toHaveLength(1);
  });
});
