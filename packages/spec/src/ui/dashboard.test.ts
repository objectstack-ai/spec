import { describe, it, expect } from 'vitest';
import {
  DashboardSchema,
  DashboardWidgetSchema,
  ChartType,
  type Dashboard,
  type DashboardWidget,
} from './dashboard.zod';

describe('ChartType', () => {
  it('should accept all chart types', () => {
    const types = ['metric', 'bar', 'line', 'pie', 'donut', 'funnel', 'table', 'text'];
    
    types.forEach(type => {
      expect(() => ChartType.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid chart types', () => {
    expect(() => ChartType.parse('scatter')).toThrow();
    expect(() => ChartType.parse('invalid')).toThrow();
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
      filter: [{ field: 'annual_revenue', operator: '>', value: 1000000 }],
      layout: { x: 0, y: 6, w: 12, h: 4 },
    };

    expect(() => DashboardWidgetSchema.parse(widget)).not.toThrow();
  });

  it('should accept widget with filter', () => {
    const widget: DashboardWidget = {
      title: 'Active Opportunities',
      type: 'metric',
      object: 'opportunity',
      filter: { field: 'status', operator: 'equals', value: 'active' },
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

  it('should accept text widget', () => {
    const widget: DashboardWidget = {
      title: 'Welcome Message',
      type: 'text',
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
    const dashboard: Dashboard = {
      name: 'sales_overview',
      label: 'Sales Overview',
      widgets: [],
    };

    expect(() => DashboardSchema.parse(dashboard)).not.toThrow();
  });

  it('should enforce snake_case for dashboard name', () => {
    const validNames = ['sales_dashboard', 'revenue_overview', 'my_metrics', '_internal'];
    validNames.forEach(name => {
      expect(() => DashboardSchema.parse({ name, label: 'Test', widgets: [] })).not.toThrow();
    });

    const invalidNames = ['salesDashboard', 'Sales-Dashboard', '123dashboard'];
    invalidNames.forEach(name => {
      expect(() => DashboardSchema.parse({ name, label: 'Test', widgets: [] })).toThrow();
    });
  });

  it('should accept dashboard with description', () => {
    const dashboard: Dashboard = {
      name: 'executive_dashboard',
      label: 'Executive Dashboard',
      description: 'High-level metrics for executive team',
      widgets: [],
    };

    expect(() => DashboardSchema.parse(dashboard)).not.toThrow();
  });

  describe('Real-World Dashboard Examples', () => {
    it('should accept sales pipeline dashboard', () => {
      const salesDashboard: Dashboard = {
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
            filter: { field: 'is_closed', operator: 'equals', value: false },
            layout: { x: 0, y: 0, w: 3, h: 2 },
          },
          {
            title: 'Open Opportunities',
            type: 'metric',
            object: 'opportunity',
            aggregate: 'count',
            filter: { field: 'is_closed', operator: 'equals', value: false },
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
            filter: { field: 'status', operator: 'equals', value: 'won' },
            layout: { x: 9, y: 0, w: 3, h: 2 },
          },
          {
            title: 'Pipeline by Stage',
            type: 'bar',
            object: 'opportunity',
            categoryField: 'stage',
            valueField: 'amount',
            aggregate: 'sum',
            filter: { field: 'is_closed', operator: 'equals', value: false },
            layout: { x: 0, y: 2, w: 8, h: 4 },
            options: {
              horizontal: true,
              showValues: true,
            },
          },
          {
            title: 'Opportunities by Type',
            type: 'donut',
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
            filter: { field: 'close_date', operator: 'last_n_months', value: 12 },
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
      const serviceDashboard: Dashboard = {
        name: 'service_desk',
        label: 'Service Desk Overview',
        description: 'Customer support metrics and case tracking',
        widgets: [
          {
            title: 'Open Cases',
            type: 'metric',
            object: 'case',
            aggregate: 'count',
            filter: { field: 'status', operator: 'not_equals', value: 'closed' },
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
            filter: [
              { field: 'status', operator: 'equals', value: 'closed' },
              { field: 'closed_date', operator: 'today' },
            ],
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
            filter: { field: 'satisfaction_rating', operator: 'not_null' },
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
            filter: { field: 'status', operator: 'not_equals', value: 'closed' },
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
            filter: { field: 'priority', operator: 'equals', value: 'high' },
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
      const executiveDashboard: Dashboard = {
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
            filter: [
              { field: 'status', operator: 'equals', value: 'won' },
              { field: 'close_date', operator: 'this_quarter' },
            ],
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
            filter: { field: 'created_date', operator: 'this_month' },
            layout: { x: 4, y: 0, w: 4, h: 3 },
          },
          {
            title: 'Active Users',
            type: 'metric',
            object: 'user',
            aggregate: 'count',
            filter: { field: 'is_active', operator: 'equals', value: true },
            layout: { x: 8, y: 0, w: 4, h: 3 },
          },
          {
            title: 'Revenue by Product Line',
            type: 'bar',
            object: 'opportunity',
            categoryField: 'product_line',
            valueField: 'amount',
            aggregate: 'sum',
            filter: { field: 'status', operator: 'equals', value: 'won' },
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
            type: 'text',
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
