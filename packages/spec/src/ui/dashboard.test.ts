import { describe, it, expect } from 'vitest';
import {
  DashboardSchema,
  DashboardWidgetSchema,
  Dashboard,
  type Dashboard as DashboardType,
  type DashboardWidget,
} from './dashboard.zod';
import { ChartTypeSchema } from './chart.zod';

describe('ChartTypeSchema', () => {
  it('should accept all chart types', () => {
    const types = ['metric', 'bar', 'line', 'pie', 'funnel', 'table', 'bubble', 'gauge', 'heatmap'];
    
    types.forEach(type => {
      expect(() => ChartTypeSchema.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid chart types', () => {
    expect(() => ChartTypeSchema.parse('invalid-chart')).toThrow();
    expect(() => ChartTypeSchema.parse('unknown')).toThrow();
  });
});

describe('DashboardWidgetSchema', () => {
  it('should accept minimal widget with layout', () => {
    const widget: DashboardWidget = {
      layout: {
        x: 0,
        y: 0,
        w: 4,
        h: 2,
      },
    };

    const result = DashboardWidgetSchema.parse(widget);
    expect(result.type).toBe('metric');
    expect(result.aggregate).toBe('count');
  });

  it('should accept metric widget', () => {
    const widget: DashboardWidget = {
      title: 'Total Opportunities',
      type: 'metric',
      object: 'opportunity',
      aggregate: 'count',
      layout: { x: 0, y: 0, w: 3, h: 2 },
    };

    expect(() => DashboardWidgetSchema.parse(widget)).not.toThrow();
  });

  it('should accept bar chart widget', () => {
    const widget: DashboardWidget = {
      title: 'Opportunities by Stage',
      type: 'bar',
      object: 'opportunity',
      categoryField: 'stage',
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 3, y: 0, w: 6, h: 4 },
    };

    expect(() => DashboardWidgetSchema.parse(widget)).not.toThrow();
  });

  it('should accept line chart widget', () => {
    const widget: DashboardWidget = {
      title: 'Revenue Trend',
      type: 'line',
      object: 'opportunity',
      categoryField: 'close_date',
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 0, y: 2, w: 12, h: 4 },
    };

    expect(() => DashboardWidgetSchema.parse(widget)).not.toThrow();
  });

  it('should accept pie chart widget', () => {
    const widget: DashboardWidget = {
      title: 'Opportunities by Type',
      type: 'pie',
      object: 'opportunity',
      categoryField: 'type',
      aggregate: 'count',
      layout: { x: 9, y: 0, w: 3, h: 3 },
    };

    expect(() => DashboardWidgetSchema.parse(widget)).not.toThrow();
  });

  it('should accept table widget', () => {
    const widget: DashboardWidget = {
      title: 'Top Accounts',
      type: 'table',
      object: 'account',
      filter: { annual_revenue: { $gt: 1000000 } },  // Modern MongoDB-style filter
      layout: { x: 0, y: 6, w: 12, h: 4 },
    };

    expect(() => DashboardWidgetSchema.parse(widget)).not.toThrow();
  });

  it('should accept widget with filter', () => {
    const widget: DashboardWidget = {
      title: 'Active Opportunities',
      type: 'metric',
      object: 'opportunity',
      filter: { status: 'active' },
      aggregate: 'count',
      layout: { x: 0, y: 0, w: 3, h: 2 },
    };

    expect(() => DashboardWidgetSchema.parse(widget)).not.toThrow();
  });

  it('should accept all aggregate functions', () => {
    const aggregates = ['count', 'sum', 'avg', 'min', 'max'] as const;
    
    aggregates.forEach(aggregate => {
      const widget: DashboardWidget = {
        type: 'metric',
        aggregate,
        layout: { x: 0, y: 0, w: 3, h: 2 },
      };
      expect(() => DashboardWidgetSchema.parse(widget)).not.toThrow();
    });
  });

  it('should accept widget with custom options', () => {
    const widget: DashboardWidget = {
      title: 'Custom Chart',
      type: 'bar',
      object: 'opportunity',
      categoryField: 'stage',
      valueField: 'amount',
      layout: { x: 0, y: 0, w: 6, h: 4 },
      options: {
        colors: ['#FF6384', '#36A2EB', '#FFCE56'],
        showLegend: true,
        orientation: 'horizontal',
      },
    };

    expect(() => DashboardWidgetSchema.parse(widget)).not.toThrow();
  });

  it('should accept metric widget for text/markdown content', () => {
    const widget: DashboardWidget = {
      title: 'Welcome Message',
      type: 'metric',
      layout: { x: 0, y: 0, w: 12, h: 2 },
      options: {
        content: '# Welcome to Sales Dashboard\n\nThis dashboard shows...',
      },
    };

    expect(() => DashboardWidgetSchema.parse(widget)).not.toThrow();
  });
});

describe('DashboardSchema', () => {
  it('should accept minimal dashboard', () => {
    const dashboard: DashboardType = {
      name: 'sales_overview',
      label: 'Sales Overview',
      widgets: [],
    };

    expect(() => DashboardSchema.parse(dashboard)).not.toThrow();
  });

  it('should enforce snake_case for dashboard name', () => {
    const validNames = ['sales_dashboard', 'revenue_overview', 'my_metrics'];
    validNames.forEach(name => {
      expect(() => DashboardSchema.parse({ name, label: 'Test', widgets: [] })).not.toThrow();
    });

    const invalidNames = ['salesDashboard', 'Sales-Dashboard', '123dashboard', '_internal'];
    invalidNames.forEach(name => {
      expect(() => DashboardSchema.parse({ name, label: 'Test', widgets: [] })).toThrow();
    });
  });

  it('should accept dashboard with description', () => {
    const dashboard: DashboardType = {
      name: 'executive_dashboard',
      label: 'Executive Dashboard',
      description: 'High-level metrics for executive team',
      widgets: [],
    };

    expect(() => DashboardSchema.parse(dashboard)).not.toThrow();
  });

  describe('Real-World Dashboard Examples', () => {
    it('should accept sales pipeline dashboard', () => {
      const salesDashboard: DashboardType = {
        name: 'sales_pipeline',
        label: 'Sales Pipeline',
        description: 'Overview of sales opportunities and pipeline health',
        widgets: [
          {
            title: 'Total Pipeline Value',
            type: 'metric',
            object: 'opportunity',
            valueField: 'amount',
            aggregate: 'sum',
            filter: { is_closed: false },
            layout: { x: 0, y: 0, w: 3, h: 2 },
          },
          {
            title: 'Open Opportunities',
            type: 'metric',
            object: 'opportunity',
            aggregate: 'count',
            filter: { is_closed: false },
            layout: { x: 3, y: 0, w: 3, h: 2 },
          },
          {
            title: 'Win Rate',
            type: 'metric',
            object: 'opportunity',
            layout: { x: 6, y: 0, w: 3, h: 2 },
            options: {
              formula: 'COUNT(status="won") / COUNT(is_closed=true) * 100',
              suffix: '%',
            },
          },
          {
            title: 'Avg Deal Size',
            type: 'metric',
            object: 'opportunity',
            valueField: 'amount',
            aggregate: 'avg',
            filter: { status: 'won' },
            layout: { x: 9, y: 0, w: 3, h: 2 },
          },
          {
            title: 'Pipeline by Stage',
            type: 'bar',
            object: 'opportunity',
            categoryField: 'stage',
            valueField: 'amount',
            aggregate: 'sum',
            filter: { is_closed: false },
            layout: { x: 0, y: 2, w: 8, h: 4 },
            options: {
              horizontal: true,
              showValues: true,
            },
          },
          {
            title: 'Opportunities by Type',
            type: 'pie',
            object: 'opportunity',
            categoryField: 'type',
            aggregate: 'count',
            layout: { x: 8, y: 2, w: 4, h: 4 },
          },
          {
            title: 'Revenue Trend (Last 12 Months)',
            type: 'line',
            object: 'opportunity',
            categoryField: 'close_date',
            valueField: 'amount',
            aggregate: 'sum',
            filter: { close_date: '{last_12_months}' },
            layout: { x: 0, y: 6, w: 12, h: 4 },
            options: {
              smoothCurve: true,
              showDataPoints: true,
            },
          },
        ],
      };

      expect(() => DashboardSchema.parse(salesDashboard)).not.toThrow();
    });

    it('should accept service desk dashboard', () => {
      const serviceDashboard: DashboardType = {
        name: 'service_desk',
        label: 'Service Desk Overview',
        description: 'Customer support metrics and case tracking',
        widgets: [
          {
            title: 'Open Cases',
            type: 'metric',
            object: 'case',
            aggregate: 'count',
            filter: { status: { $ne: 'closed' } },
            layout: { x: 0, y: 0, w: 3, h: 2 },
            options: {
              color: '#FF6384',
            },
          },
          {
            title: 'Cases Closed Today',
            type: 'metric',
            object: 'case',
            aggregate: 'count',
            filter: {  // Modern MongoDB-style filter
              status: 'closed',
              closed_date: '{today}'
            },
            layout: { x: 3, y: 0, w: 3, h: 2 },
          },
          {
            title: 'Avg Response Time',
            type: 'metric',
            object: 'case',
            valueField: 'first_response_time',
            aggregate: 'avg',
            layout: { x: 6, y: 0, w: 3, h: 2 },
            options: {
              unit: 'hours',
            },
          },
          {
            title: 'Customer Satisfaction',
            type: 'metric',
            object: 'case',
            valueField: 'satisfaction_rating',
            aggregate: 'avg',
            filter: { satisfaction_rating: { $null: false } },
            layout: { x: 9, y: 0, w: 3, h: 2 },
            options: {
              max: 5,
              suffix: '/5',
            },
          },
          {
            title: 'Cases by Priority',
            type: 'funnel',
            object: 'case',
            categoryField: 'priority',
            aggregate: 'count',
            filter: { status: { $ne: 'closed' } },
            layout: { x: 0, y: 2, w: 6, h: 4 },
          },
          {
            title: 'Cases by Status',
            type: 'pie',
            object: 'case',
            categoryField: 'status',
            aggregate: 'count',
            layout: { x: 6, y: 2, w: 6, h: 4 },
          },
          {
            title: 'Recent High Priority Cases',
            type: 'table',
            object: 'case',
            filter: { priority: 'high' },  // Modern MongoDB-style filter
            layout: { x: 0, y: 6, w: 12, h: 4 },
            options: {
              columns: ['case_number', 'subject', 'account', 'owner', 'created_date'],
              limit: 10,
            },
          },
        ],
      };

      expect(() => DashboardSchema.parse(serviceDashboard)).not.toThrow();
    });

    it('should accept executive dashboard with mixed widgets', () => {
      const executiveDashboard: DashboardType = {
        name: 'executive_overview',
        label: 'Executive Overview',
        description: 'Key business metrics at a glance',
        widgets: [
          {
            title: 'Quarterly Revenue',
            type: 'metric',
            object: 'opportunity',
            valueField: 'amount',
            aggregate: 'sum',
            filter: {  // Modern MongoDB-style filter
              status: 'won',
              close_date: '{this_quarter}'
            },
            layout: { x: 0, y: 0, w: 4, h: 3 },
            options: {
              prefix: '$',
              trend: 'up',
              trendValue: '+15%',
            },
          },
          {
            title: 'New Customers',
            type: 'metric',
            object: 'account',
            aggregate: 'count',
            filter: { created_date: '{this_month}' },  // Modern MongoDB-style filter
            layout: { x: 4, y: 0, w: 4, h: 3 },
          },
          {
            title: 'Active Users',
            type: 'metric',
            object: 'user',
            aggregate: 'count',
            filter: { is_active: true },
            layout: { x: 8, y: 0, w: 4, h: 3 },
          },
          {
            title: 'Revenue by Product Line',
            type: 'bar',
            object: 'opportunity',
            categoryField: 'product_line',
            valueField: 'amount',
            aggregate: 'sum',
            filter: { status: 'won' },
            layout: { x: 0, y: 3, w: 8, h: 4 },
          },
          {
            title: 'Team Performance',
            type: 'table',
            object: 'user',
            layout: { x: 8, y: 3, w: 4, h: 4 },
            options: {
              columns: ['name', 'deals_closed', 'revenue_generated'],
            },
          },
          {
            title: 'Welcome',
            type: 'metric',
            layout: { x: 0, y: 7, w: 12, h: 1 },
            options: {
              content: '**Last updated:** {NOW()}',
            },
          },
        ],
      };

      expect(() => DashboardSchema.parse(executiveDashboard)).not.toThrow();
    });
  });
});

describe('Dashboard Factory', () => {
  it('should create dashboard with default widget values', () => {
    const dashboard = Dashboard.create({
      name: 'test_dashboard',
      label: 'Test Dashboard',
      widgets: [
        {
          title: 'Test Widget',
          type: 'table',
          object: 'account',
          layout: { x: 0, y: 0, w: 12, h: 4 },
        },
      ],
    });
    
    expect(dashboard.name).toBe('test_dashboard');
    expect(dashboard.widgets).toHaveLength(1);
    expect(dashboard.widgets[0].aggregate).toBe('count');
  });

  it('should create dashboard without aggregate (uses default)', () => {
    const dashboard = Dashboard.create({
      name: 'sales_dashboard',
      label: 'Sales Dashboard',
      widgets: [
        {
          title: 'Total Revenue',
          type: 'metric',
          object: 'opportunity',
          valueField: 'amount',
          layout: { x: 0, y: 0, w: 3, h: 2 },
        },
      ],
    });
    
    expect(dashboard.widgets[0].aggregate).toBe('count');
  });
});

describe('Dashboard I18n Integration', () => {
  it('should accept i18n object as dashboard label', () => {
    expect(() => DashboardSchema.parse({
      name: 'i18n_dashboard',
      label: { key: 'dashboards.sales', defaultValue: 'Sales Dashboard' },
      widgets: [],
    })).not.toThrow();
  });
  it('should accept i18n object as dashboard description', () => {
    expect(() => DashboardSchema.parse({
      name: 'test_dashboard',
      label: 'Test',
      description: { key: 'dashboards.test.desc', defaultValue: 'Test dashboard' },
      widgets: [],
    })).not.toThrow();
  });
  it('should accept i18n object as widget title', () => {
    expect(() => DashboardWidgetSchema.parse({
      title: { key: 'widgets.revenue', defaultValue: 'Total Revenue' },
      type: 'metric',
      layout: { x: 0, y: 0, w: 3, h: 2 },
    })).not.toThrow();
  });
  it('should accept i18n object in global filter label', () => {
    expect(() => DashboardSchema.parse({
      name: 'filter_dash',
      label: 'Filtered',
      widgets: [],
      globalFilters: [{
        field: 'status',
        label: { key: 'filters.status', defaultValue: 'Status' },
        type: 'select',
      }],
    })).not.toThrow();
  });
});

describe('Dashboard ARIA Integration', () => {
  it('should accept dashboard with ARIA attributes', () => {
    expect(() => DashboardSchema.parse({
      name: 'accessible_dash',
      label: 'Accessible Dashboard',
      widgets: [],
      aria: { ariaLabel: 'Sales dashboard overview', role: 'region' },
    })).not.toThrow();
  });
  it('should accept widget with ARIA attributes', () => {
    expect(() => DashboardWidgetSchema.parse({
      title: 'Revenue',
      type: 'metric',
      layout: { x: 0, y: 0, w: 3, h: 2 },
      aria: { ariaLabel: 'Total revenue metric', ariaDescribedBy: 'revenue-desc' },
    })).not.toThrow();
  });
});

describe('Dashboard Responsive Integration', () => {
  it('should accept widget with responsive config', () => {
    expect(() => DashboardWidgetSchema.parse({
      type: 'metric',
      layout: { x: 0, y: 0, w: 6, h: 2 },
      responsive: { hiddenOn: ['xs'] },
    })).not.toThrow();
  });
});

describe('Dashboard Performance Integration', () => {
  it('should accept dashboard with performance config', () => {
    expect(() => DashboardSchema.parse({
      name: 'perf_dash',
      label: 'Performance Dashboard',
      widgets: [],
      performance: { lazyLoad: true, cacheStrategy: 'stale-while-revalidate' },
    })).not.toThrow();
  });
});

// ============================================================================
// Protocol Improvement Tests: Dashboard dateRange
// ============================================================================

describe('DashboardSchema - dateRange', () => {
  it('should accept dateRange configuration', () => {
    const result = DashboardSchema.parse({
      name: 'sales_dashboard',
      label: 'Sales',
      widgets: [],
      dateRange: {
        field: 'created_at',
        defaultRange: 'this_quarter',
        allowCustomRange: true,
      },
    });
    expect(result.dateRange?.field).toBe('created_at');
    expect(result.dateRange?.defaultRange).toBe('this_quarter');
    expect(result.dateRange?.allowCustomRange).toBe(true);
  });

  it('should default dateRange.defaultRange to this_month', () => {
    const result = DashboardSchema.parse({
      name: 'dashboard',
      label: 'Dashboard',
      widgets: [],
      dateRange: {},
    });
    expect(result.dateRange?.defaultRange).toBe('this_month');
    expect(result.dateRange?.allowCustomRange).toBe(true);
  });

  it('should accept all dateRange preset values', () => {
    const presets = ['today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 'this_quarter', 'last_quarter', 'this_year', 'last_year', 'last_7_days', 'last_30_days', 'last_90_days', 'custom'];
    for (const preset of presets) {
      expect(() => DashboardSchema.parse({
        name: 'test_dash',
        label: 'Test',
        widgets: [],
        dateRange: { defaultRange: preset },
      })).not.toThrow();
    }
  });

  it('should accept dashboard without dateRange (optional)', () => {
    const result = DashboardSchema.parse({
      name: 'simple_dash',
      label: 'Simple',
      widgets: [],
    });
    expect(result.dateRange).toBeUndefined();
  });
});
