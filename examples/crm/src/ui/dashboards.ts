import type { Dashboard } from '@objectstack/spec/ui';

// Sales Performance Dashboard
export const SalesDashboard: Dashboard = {
  name: 'sales_dashboard',
  label: 'Sales Performance',
  description: 'Key sales metrics and pipeline overview',
  
  widgets: [
    // Row 1: Key Metrics
    {
      title: 'Total Pipeline Value',
      type: 'metric',
      object: 'opportunity',
      filter: {
        stage: { $nin: ['closed_won', 'closed_lost'] }
      },
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 0, y: 0, w: 3, h: 2 },
      options: {
        prefix: '$',
        color: '#4169E1',
      }
    },
    {
      title: 'Closed Won This Quarter',
      type: 'metric',
      object: 'opportunity',
      filter: {
        stage: 'closed_won',
        close_date: { $gte: '{current_quarter_start}' }
      },
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 3, y: 0, w: 3, h: 2 },
      options: {
        prefix: '$',
        color: '#00AA00',
      }
    },
    {
      title: 'Open Opportunities',
      type: 'metric',
      object: 'opportunity',
      filter: {
        stage: { $nin: ['closed_won', 'closed_lost'] }
      },
      aggregate: 'count',
      layout: { x: 6, y: 0, w: 3, h: 2 },
      options: {
        color: '#FFA500',
      }
    },
    {
      title: 'Win Rate',
      type: 'metric',
      object: 'opportunity',
      filter: {
        close_date: { $gte: '{current_quarter_start}' }
      },
      valueField: 'stage',
      aggregate: 'count',
      layout: { x: 9, y: 0, w: 3, h: 2 },
      options: {
        suffix: '%',
        color: '#9370DB',
      }
    },
    
    // Row 2: Pipeline Analysis
    {
      title: 'Pipeline by Stage',
      type: 'funnel',
      object: 'opportunity',
      filter: {
        stage: { $nin: ['closed_won', 'closed_lost'] }
      },
      categoryField: 'stage',
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 0, y: 2, w: 6, h: 4 },
      options: {
        showValues: true,
      }
    },
    {
      title: 'Opportunities by Owner',
      type: 'bar',
      object: 'opportunity',
      filter: {
        stage: { $nin: ['closed_won', 'closed_lost'] }
      },
      categoryField: 'owner',
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 6, y: 2, w: 6, h: 4 },
      options: {
        horizontal: true,
      }
    },
    
    // Row 3: Trends
    {
      title: 'Monthly Revenue Trend',
      type: 'line',
      object: 'opportunity',
      filter: {
        stage: 'closed_won',
        close_date: { $gte: '{last_12_months}' }
      },
      categoryField: 'close_date',
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 0, y: 6, w: 8, h: 4 },
      options: {
        dateGranularity: 'month',
        showTrend: true,
      }
    },
    {
      title: 'Top Opportunities',
      type: 'table',
      object: 'opportunity',
      filter: {
        stage: { $nin: ['closed_won', 'closed_lost'] }
      },
      aggregate: 'count',
      layout: { x: 8, y: 6, w: 4, h: 4 },
      options: {
        columns: ['name', 'amount', 'stage', 'close_date'],
        sortBy: 'amount',
        sortOrder: 'desc',
        limit: 10,
      }
    },
  ]
};

// Customer Service Dashboard
export const ServiceDashboard: Dashboard = {
  name: 'service_dashboard',
  label: 'Customer Service',
  description: 'Support case metrics and performance',
  
  widgets: [
    // Row 1: Key Metrics
    {
      title: 'Open Cases',
      type: 'metric',
      object: 'case',
      filter: { is_closed: false },
      aggregate: 'count',
      layout: { x: 0, y: 0, w: 3, h: 2 },
      options: {
        color: '#FFA500',
      }
    },
    {
      title: 'Critical Cases',
      type: 'metric',
      object: 'case',
      filter: {
        priority: 'critical',
        is_closed: false
      },
      aggregate: 'count',
      layout: { x: 3, y: 0, w: 3, h: 2 },
      options: {
        color: '#FF0000',
      }
    },
    {
      title: 'Avg Resolution Time (hrs)',
      type: 'metric',
      object: 'case',
      filter: { is_closed: true },
      valueField: 'resolution_time_hours',
      aggregate: 'avg',
      layout: { x: 6, y: 0, w: 3, h: 2 },
      options: {
        suffix: 'h',
        color: '#4169E1',
      }
    },
    {
      title: 'SLA Violations',
      type: 'metric',
      object: 'case',
      filter: { is_sla_violated: true },
      aggregate: 'count',
      layout: { x: 9, y: 0, w: 3, h: 2 },
      options: {
        color: '#FF4500',
      }
    },
    
    // Row 2: Case Distribution
    {
      title: 'Cases by Status',
      type: 'donut',
      object: 'case',
      filter: { is_closed: false },
      categoryField: 'status',
      aggregate: 'count',
      layout: { x: 0, y: 2, w: 4, h: 4 },
      options: {
        showLegend: true,
      }
    },
    {
      title: 'Cases by Priority',
      type: 'pie',
      object: 'case',
      filter: { is_closed: false },
      categoryField: 'priority',
      aggregate: 'count',
      layout: { x: 4, y: 2, w: 4, h: 4 },
      options: {
        showLegend: true,
      }
    },
    {
      title: 'Cases by Origin',
      type: 'bar',
      object: 'case',
      categoryField: 'origin',
      aggregate: 'count',
      layout: { x: 8, y: 2, w: 4, h: 4 },
    },
    
    // Row 3: Trends and Lists
    {
      title: 'Daily Case Volume',
      type: 'line',
      object: 'case',
      filter: {
        created_date: { $gte: '{last_30_days}' }
      },
      categoryField: 'created_date',
      aggregate: 'count',
      layout: { x: 0, y: 6, w: 8, h: 4 },
      options: {
        dateGranularity: 'day',
      }
    },
    {
      title: 'My Open Cases',
      type: 'table',
      object: 'case',
      filter: {
        owner: '{current_user}',
        is_closed: false
      },
      aggregate: 'count',
      layout: { x: 8, y: 6, w: 4, h: 4 },
      options: {
        columns: ['case_number', 'subject', 'priority', 'status'],
        sortBy: 'priority',
        sortOrder: 'desc',
        limit: 10,
      }
    },
  ]
};

// Executive Dashboard
export const ExecutiveDashboard: Dashboard = {
  name: 'executive_dashboard',
  label: 'Executive Overview',
  description: 'High-level business metrics',
  
  widgets: [
    // Row 1: Revenue Metrics
    {
      title: 'Total Revenue (YTD)',
      type: 'metric',
      object: 'opportunity',
      filter: {
        stage: 'closed_won',
        close_date: { $gte: '{current_year_start}' }
      },
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 0, y: 0, w: 3, h: 2 },
      options: {
        prefix: '$',
        color: '#00AA00',
      }
    },
    {
      title: 'Total Accounts',
      type: 'metric',
      object: 'account',
      filter: { is_active: true },
      aggregate: 'count',
      layout: { x: 3, y: 0, w: 3, h: 2 },
      options: {
        color: '#4169E1',
      }
    },
    {
      title: 'Total Contacts',
      type: 'metric',
      object: 'contact',
      aggregate: 'count',
      layout: { x: 6, y: 0, w: 3, h: 2 },
      options: {
        color: '#9370DB',
      }
    },
    {
      title: 'Total Leads',
      type: 'metric',
      object: 'lead',
      filter: { is_converted: false },
      aggregate: 'count',
      layout: { x: 9, y: 0, w: 3, h: 2 },
      options: {
        color: '#FFA500',
      }
    },
    
    // Row 2: Revenue Analysis
    {
      title: 'Revenue by Industry',
      type: 'bar',
      object: 'opportunity',
      filter: {
        stage: 'closed_won',
        close_date: { $gte: '{current_year_start}' }
      },
      categoryField: 'account.industry',
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 0, y: 2, w: 6, h: 4 },
    },
    {
      title: 'Quarterly Revenue Trend',
      type: 'line',
      object: 'opportunity',
      filter: {
        stage: 'closed_won',
        close_date: { $gte: '{last_4_quarters}' }
      },
      categoryField: 'close_date',
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 6, y: 2, w: 6, h: 4 },
      options: {
        dateGranularity: 'quarter',
      }
    },
    
    // Row 3: Customer & Activity Metrics
    {
      title: 'New Accounts by Month',
      type: 'bar',
      object: 'account',
      filter: {
        created_date: { $gte: '{last_6_months}' }
      },
      categoryField: 'created_date',
      aggregate: 'count',
      layout: { x: 0, y: 6, w: 4, h: 4 },
      options: {
        dateGranularity: 'month',
      }
    },
    {
      title: 'Lead Conversion Rate',
      type: 'metric',
      object: 'lead',
      valueField: 'is_converted',
      aggregate: 'avg',
      layout: { x: 4, y: 6, w: 4, h: 4 },
      options: {
        suffix: '%',
        color: '#00AA00',
      }
    },
    {
      title: 'Top Accounts by Revenue',
      type: 'table',
      object: 'account',
      aggregate: 'count',
      layout: { x: 8, y: 6, w: 4, h: 4 },
      options: {
        columns: ['name', 'annual_revenue', 'type'],
        sortBy: 'annual_revenue',
        sortOrder: 'desc',
        limit: 10,
      }
    },
  ]
};

export const CrmDashboards = {
  SalesDashboard,
  ServiceDashboard,
  ExecutiveDashboard,
};
