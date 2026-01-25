// @ts-nocheck
import { Dashboard } from '@objectstack/spec/ui';

/**
 * Dashboard Examples - Demonstrating ObjectStack Dashboard Protocol
 * 
 * Dashboards provide at-a-glance views of key metrics and analytics.
 * Inspired by Salesforce Dashboards and ServiceNow Performance Analytics.
 */

// ============================================================================
// SALES DASHBOARDS
// ============================================================================

/**
 * Example 1: Sales Performance Dashboard
 * Comprehensive sales metrics and pipeline visualization
 * Use Case: Sales leadership, performance monitoring
 */
export const SalesPerformanceDashboard: Dashboard = {
  name: 'sales_performance',
  label: 'Sales Performance',
  description: 'Key sales metrics and pipeline overview',
  
  widgets: [
    // Row 1: Key Metrics (KPIs)
    {
      title: 'Total Pipeline Value',
      type: 'metric',
      object: 'opportunity',
      filter: {
        stage: { $nin: ['closed_won', 'closed_lost'] },
      },
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 0, y: 0, w: 3, h: 2 },
      options: {
        prefix: '$',
        color: '#4169E1',
        comparisonPeriod: 'last_quarter',
        showTrend: true,
      },
    },
    {
      title: 'Closed Won This Quarter',
      type: 'metric',
      object: 'opportunity',
      filter: {
        stage: 'closed_won',
        close_date: { $gte: '{current_quarter_start}' },
      },
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 3, y: 0, w: 3, h: 2 },
      options: {
        prefix: '$',
        color: '#00AA00',
        target: 1000000, // Show progress toward $1M goal
      },
    },
    {
      title: 'Open Opportunities',
      type: 'metric',
      object: 'opportunity',
      filter: {
        stage: { $nin: ['closed_won', 'closed_lost'] },
      },
      aggregate: 'count',
      layout: { x: 6, y: 0, w: 3, h: 2 },
      options: {
        color: '#FFA500',
      },
    },
    {
      title: 'Win Rate',
      type: 'metric',
      object: 'opportunity',
      filter: {
        close_date: { $gte: '{current_quarter_start}' },
      },
      valueField: 'stage',
      aggregate: 'count',
      layout: { x: 9, y: 0, w: 3, h: 2 },
      options: {
        suffix: '%',
        color: '#9370DB',
        formula: '(closed_won / total_opportunities) * 100',
      },
    },
    
    // Row 2: Pipeline Analysis
    {
      title: 'Pipeline by Stage',
      type: 'funnel',
      object: 'opportunity',
      filter: {
        stage: { $nin: ['closed_won', 'closed_lost'] },
      },
      categoryField: 'stage',
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 0, y: 2, w: 6, h: 4 },
      options: {
        showValues: true,
        colorScheme: 'blues',
      },
    },
    {
      title: 'Opportunities by Owner',
      type: 'bar',
      object: 'opportunity',
      filter: {
        stage: { $nin: ['closed_won', 'closed_lost'] },
      },
      categoryField: 'owner',
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 6, y: 2, w: 6, h: 4 },
      options: {
        horizontal: true,
        sortBy: 'value',
        sortOrder: 'desc',
        limit: 10,
      },
    },
    
    // Row 3: Trends
    {
      title: 'Monthly Revenue Trend',
      type: 'line',
      object: 'opportunity',
      filter: {
        stage: 'closed_won',
        close_date: { $gte: '{last_12_months}' },
      },
      categoryField: 'close_date',
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 0, y: 6, w: 8, h: 4 },
      options: {
        dateGranularity: 'month',
        showTrend: true,
        showGoalLine: true,
        goalValue: 100000,
      },
    },
    {
      title: 'Top Opportunities',
      type: 'table',
      object: 'opportunity',
      filter: {
        stage: { $nin: ['closed_won', 'closed_lost'] },
      },
      aggregate: 'count',
      layout: { x: 8, y: 6, w: 4, h: 4 },
      options: {
        columns: ['name', 'amount', 'stage', 'close_date'],
        sortBy: 'amount',
        sortOrder: 'desc',
        limit: 10,
      },
    },
  ],
};

/**
 * Example 2: Sales Leaderboard Dashboard
 * Gamified sales performance tracking
 * Use Case: Team motivation, performance tracking
 */
export const SalesLeaderboardDashboard: Dashboard = {
  name: 'sales_leaderboard',
  label: 'Sales Leaderboard',
  description: 'Team performance and rankings',
  
  widgets: [
    {
      title: 'Top Performers (This Month)',
      type: 'table',
      object: 'opportunity',
      filter: {
        stage: 'closed_won',
        close_date: { $gte: '{current_month_start}' },
      },
      aggregate: 'count',
      layout: { x: 0, y: 0, w: 6, h: 6 },
      options: {
        columns: ['owner', 'total_amount', 'deal_count', 'avg_deal_size'],
        groupBy: 'owner',
        sortBy: 'total_amount',
        sortOrder: 'desc',
        showRank: true,
      },
    },
    {
      title: 'Revenue by Rep',
      type: 'bar',
      object: 'opportunity',
      filter: {
        stage: 'closed_won',
        close_date: { $gte: '{current_quarter_start}' },
      },
      categoryField: 'owner',
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 6, y: 0, w: 6, h: 6 },
      options: {
        horizontal: true,
        colorGradient: true,
      },
    },
  ],
};

// ============================================================================
// CUSTOMER SERVICE DASHBOARDS
// ============================================================================

/**
 * Example 3: Customer Service Dashboard
 * Support case metrics and performance
 * Use Case: Support team management, SLA monitoring
 */
export const CustomerServiceDashboard: Dashboard = {
  name: 'customer_service',
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
      },
    },
    {
      title: 'Critical Cases',
      type: 'metric',
      object: 'case',
      filter: {
        priority: 'critical',
        is_closed: false,
      },
      aggregate: 'count',
      layout: { x: 3, y: 0, w: 3, h: 2 },
      options: {
        color: '#FF0000',
        threshold: { warning: 5, critical: 10 },
      },
    },
    {
      title: 'Avg Resolution Time',
      type: 'metric',
      object: 'case',
      filter: { is_closed: true },
      valueField: 'resolution_time_hours',
      aggregate: 'avg',
      layout: { x: 6, y: 0, w: 3, h: 2 },
      options: {
        suffix: 'h',
        color: '#4169E1',
        target: 24, // 24 hour target
      },
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
        threshold: { warning: 1, critical: 5 },
      },
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
        showPercentage: true,
      },
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
        colorMap: {
          'critical': '#FF0000',
          'high': '#FFA500',
          'medium': '#FFFF00',
          'low': '#00AA00',
        },
      },
    },
    {
      title: 'Cases by Origin',
      type: 'bar',
      object: 'case',
      categoryField: 'origin',
      aggregate: 'count',
      layout: { x: 8, y: 2, w: 4, h: 4 },
    },
    
    // Row 3: Trends
    {
      title: 'Daily Case Volume',
      type: 'line',
      object: 'case',
      filter: {
        created_date: { $gte: '{last_30_days}' },
      },
      categoryField: 'created_date',
      aggregate: 'count',
      layout: { x: 0, y: 6, w: 8, h: 4 },
      options: {
        dateGranularity: 'day',
        showMovingAverage: true,
        movingAveragePeriod: 7,
      },
    },
    {
      title: 'My Open Cases',
      type: 'table',
      object: 'case',
      filter: {
        owner: '{current_user}',
        is_closed: false,
      },
      aggregate: 'count',
      layout: { x: 8, y: 6, w: 4, h: 4 },
      options: {
        columns: ['case_number', 'subject', 'priority', 'status'],
        sortBy: 'priority',
        sortOrder: 'desc',
        limit: 10,
      },
    },
  ],
};

// ============================================================================
// EXECUTIVE DASHBOARDS
// ============================================================================

/**
 * Example 4: Executive Dashboard
 * High-level business metrics for leadership
 * Use Case: Executive overview, board meetings
 */
export const ExecutiveDashboard: Dashboard = {
  name: 'executive_overview',
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
        close_date: { $gte: '{current_year_start}' },
      },
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 0, y: 0, w: 3, h: 2 },
      options: {
        prefix: '$',
        color: '#00AA00',
        comparisonPeriod: 'last_year',
        showTrend: true,
      },
    },
    {
      title: 'Active Customers',
      type: 'metric',
      object: 'account',
      filter: { is_active: true },
      aggregate: 'count',
      layout: { x: 3, y: 0, w: 3, h: 2 },
      options: {
        color: '#4169E1',
      },
    },
    {
      title: 'Customer Satisfaction',
      type: 'metric',
      object: 'survey',
      filter: {
        survey_type: 'csat',
        submitted_date: { $gte: '{current_quarter_start}' },
      },
      valueField: 'score',
      aggregate: 'avg',
      layout: { x: 6, y: 0, w: 3, h: 2 },
      options: {
        suffix: '/5',
        color: '#9370DB',
        decimals: 1,
      },
    },
    {
      title: 'Active Leads',
      type: 'metric',
      object: 'lead',
      filter: { is_converted: false },
      aggregate: 'count',
      layout: { x: 9, y: 0, w: 3, h: 2 },
      options: {
        color: '#FFA500',
      },
    },
    
    // Row 2: Revenue Analysis
    {
      title: 'Revenue by Product',
      type: 'bar',
      object: 'opportunity',
      filter: {
        stage: 'closed_won',
        close_date: { $gte: '{current_year_start}' },
      },
      categoryField: 'product_line',
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 0, y: 2, w: 6, h: 4 },
      options: {
        sortBy: 'value',
        sortOrder: 'desc',
      },
    },
    {
      title: 'Quarterly Revenue Trend',
      type: 'line',
      object: 'opportunity',
      filter: {
        stage: 'closed_won',
        close_date: { $gte: '{last_4_quarters}' },
      },
      categoryField: 'close_date',
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 6, y: 2, w: 6, h: 4 },
      options: {
        dateGranularity: 'quarter',
        showForecast: true,
      },
    },
    
    // Row 3: Customer Insights
    {
      title: 'Customer Growth',
      type: 'bar',
      object: 'account',
      filter: {
        created_date: { $gte: '{last_6_months}' },
      },
      categoryField: 'created_date',
      aggregate: 'count',
      layout: { x: 0, y: 6, w: 4, h: 4 },
      options: {
        dateGranularity: 'month',
      },
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
        formula: '(converted_leads / total_leads) * 100',
      },
    },
    {
      title: 'Top Accounts by Revenue',
      type: 'table',
      object: 'account',
      aggregate: 'count',
      layout: { x: 8, y: 6, w: 4, h: 4 },
      options: {
        columns: ['name', 'annual_revenue', 'industry'],
        sortBy: 'annual_revenue',
        sortOrder: 'desc',
        limit: 10,
      },
    },
  ],
};

// ============================================================================
// MARKETING DASHBOARDS
// ============================================================================

/**
 * Example 5: Marketing Performance Dashboard
 * Campaign and lead generation metrics
 * Use Case: Marketing team performance monitoring
 */
export const MarketingDashboard: Dashboard = {
  name: 'marketing_performance',
  label: 'Marketing Performance',
  description: 'Campaign metrics and lead generation',
  
  widgets: [
    {
      title: 'Campaign ROI',
      type: 'metric',
      object: 'campaign',
      filter: {
        status: 'completed',
        end_date: { $gte: '{current_quarter_start}' },
      },
      valueField: 'roi_percentage',
      aggregate: 'avg',
      layout: { x: 0, y: 0, w: 3, h: 2 },
      options: {
        suffix: '%',
        color: '#00AA00',
      },
    },
    {
      title: 'Leads Generated',
      type: 'metric',
      object: 'lead',
      filter: {
        created_date: { $gte: '{current_month_start}' },
      },
      aggregate: 'count',
      layout: { x: 3, y: 0, w: 3, h: 2 },
      options: {
        color: '#4169E1',
        comparisonPeriod: 'last_month',
      },
    },
    {
      title: 'Cost Per Lead',
      type: 'metric',
      object: 'campaign',
      valueField: 'cost_per_lead',
      aggregate: 'avg',
      layout: { x: 6, y: 0, w: 3, h: 2 },
      options: {
        prefix: '$',
        color: '#FFA500',
      },
    },
    {
      title: 'Active Campaigns',
      type: 'metric',
      object: 'campaign',
      filter: { status: 'active' },
      aggregate: 'count',
      layout: { x: 9, y: 0, w: 3, h: 2 },
      options: {
        color: '#9370DB',
      },
    },
    {
      title: 'Leads by Source',
      type: 'donut',
      object: 'lead',
      filter: {
        created_date: { $gte: '{current_quarter_start}' },
      },
      categoryField: 'lead_source',
      aggregate: 'count',
      layout: { x: 0, y: 2, w: 6, h: 4 },
      options: {
        showLegend: true,
      },
    },
    {
      title: 'Campaign Performance',
      type: 'table',
      object: 'campaign',
      filter: {
        status: { $in: ['active', 'completed'] },
      },
      aggregate: 'count',
      layout: { x: 6, y: 2, w: 6, h: 4 },
      options: {
        columns: ['name', 'leads_generated', 'total_cost', 'roi_percentage'],
        sortBy: 'roi_percentage',
        sortOrder: 'desc',
      },
    },
  ],
};

// ============================================================================
// OPERATIONAL DASHBOARDS
// ============================================================================

/**
 * Example 6: Team Productivity Dashboard
 * Activity tracking and productivity metrics
 * Use Case: Team management, workload monitoring
 */
export const TeamProductivityDashboard: Dashboard = {
  name: 'team_productivity',
  label: 'Team Productivity',
  description: 'Activity and workload metrics',
  
  widgets: [
    {
      title: 'Tasks Completed Today',
      type: 'metric',
      object: 'task',
      filter: {
        is_completed: true,
        completed_date: { $gte: '{today}' },
      },
      aggregate: 'count',
      layout: { x: 0, y: 0, w: 3, h: 2 },
    },
    {
      title: 'Overdue Tasks',
      type: 'metric',
      object: 'task',
      filter: {
        is_completed: false,
        due_date: { $lt: '{today}' },
      },
      aggregate: 'count',
      layout: { x: 3, y: 0, w: 3, h: 2 },
      options: {
        color: '#FF0000',
      },
    },
    {
      title: 'Team Utilization',
      type: 'metric',
      object: 'user',
      valueField: 'utilization_percentage',
      aggregate: 'avg',
      layout: { x: 6, y: 0, w: 3, h: 2 },
      options: {
        suffix: '%',
      },
    },
    {
      title: 'Meetings This Week',
      type: 'metric',
      object: 'event',
      filter: {
        start_date: { $gte: '{week_start}', $lte: '{week_end}' },
      },
      aggregate: 'count',
      layout: { x: 9, y: 0, w: 3, h: 2 },
    },
    {
      title: 'Tasks by Team Member',
      type: 'bar',
      object: 'task',
      filter: {
        is_completed: false,
      },
      categoryField: 'assigned_to',
      aggregate: 'count',
      layout: { x: 0, y: 2, w: 6, h: 4 },
      options: {
        horizontal: true,
      },
    },
    {
      title: 'Task Completion Trend',
      type: 'line',
      object: 'task',
      filter: {
        completed_date: { $gte: '{last_30_days}' },
      },
      categoryField: 'completed_date',
      aggregate: 'count',
      layout: { x: 6, y: 2, w: 6, h: 4 },
      options: {
        dateGranularity: 'day',
      },
    },
  ],
};

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export const DashboardExamples: any = {
  SalesPerformanceDashboard,
  SalesLeaderboardDashboard,
  CustomerServiceDashboard,
  ExecutiveDashboard,
  MarketingDashboard,
  TeamProductivityDashboard,
};
