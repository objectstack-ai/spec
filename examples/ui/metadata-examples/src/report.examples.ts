// @ts-nocheck
import { Report } from '@objectstack/spec/ui';

/**
 * Report Examples - Demonstrating ObjectStack Report Protocol
 * 
 * Reports define data analysis and visualization configurations.
 * Inspired by Salesforce Reports and ServiceNow Reporting.
 */

// ============================================================================
// TABULAR REPORTS (Simple Lists)
// ============================================================================

/**
 * Example 1: Simple Tabular Report
 * Basic list of records with selected columns
 * Use Case: Quick data review, export to CSV
 */
export const AllContactsReport: Report = {
  name: 'all_contacts',
  label: 'All Contacts',
  description: 'Complete list of all contacts in the system',
  objectName: 'contact',
  type: 'tabular',
  columns: [
    { field: 'full_name', label: 'Name' },
    { field: 'email' },
    { field: 'phone' },
    { field: 'account_name', label: 'Company' },
    { field: 'created_at', label: 'Created' },
  ],
};

/**
 * Example 2: Tabular Report with Filtering
 * Filtered list showing specific records
 * Use Case: Active opportunities, hot leads
 */
export const ActiveOpportunitiesReport: Report = {
  name: 'active_opportunities',
  label: 'Active Opportunities',
  objectName: 'opportunity',
  type: 'tabular',
  columns: [
    { field: 'name', label: 'Opportunity Name' },
    { field: 'account_name', label: 'Account' },
    { field: 'amount', label: 'Value' },
    { field: 'stage', label: 'Stage' },
    { field: 'close_date', label: 'Close Date' },
    { field: 'probability', label: 'Probability %' },
  ],
  filter: {
    $and: [
      { stage: { $ne: 'Closed Won' } },
      { stage: { $ne: 'Closed Lost' } },
    ],
  },
};

// ============================================================================
// SUMMARY REPORTS (Grouped Data)
// ============================================================================

/**
 * Example 3: Summary Report with Row Grouping
 * Data grouped by a single field with aggregations
 * Use Case: Sales by rep, cases by status
 */
export const OpportunitiesByStageReport: Report = {
  name: 'opportunities_by_stage',
  label: 'Opportunities by Stage',
  objectName: 'opportunity',
  type: 'summary',
  columns: [
    { field: 'name', label: 'Opportunity Name' },
    { field: 'amount', label: 'Amount', aggregate: 'sum' },
    { field: 'id', label: 'Count', aggregate: 'count' },
  ],
  groupingsDown: [
    { field: 'stage', sortOrder: 'asc' },
  ],
};

/**
 * Example 4: Multi-Level Summary Report
 * Data grouped by multiple fields
 * Use Case: Sales by region and rep, cases by priority and assigned to
 */
export const SalesByRegionAndRepReport: Report = {
  name: 'sales_by_region_rep',
  label: 'Sales by Region and Rep',
  objectName: 'opportunity',
  type: 'summary',
  columns: [
    { field: 'amount', label: 'Total Amount', aggregate: 'sum' },
    { field: 'amount', label: 'Average Deal', aggregate: 'avg' },
    { field: 'id', label: 'Count', aggregate: 'count' },
  ],
  groupingsDown: [
    { field: 'region', sortOrder: 'asc' },
    { field: 'owner_name', sortOrder: 'asc' },
  ],
  filter: {
    stage: { $eq: 'Closed Won' },
  },
};

/**
 * Example 5: Summary Report with Date Grouping
 * Data grouped by date fields with granularity
 * Use Case: Trends over time, monthly/quarterly analysis
 */
export const MonthlyRevenueReport: Report = {
  name: 'monthly_revenue',
  label: 'Monthly Revenue Trend',
  objectName: 'opportunity',
  type: 'summary',
  columns: [
    { field: 'amount', label: 'Total Revenue', aggregate: 'sum' },
    { field: 'amount', label: 'Average Deal Size', aggregate: 'avg' },
    { field: 'id', label: 'Deals Closed', aggregate: 'count' },
  ],
  groupingsDown: [
    { field: 'close_date', sortOrder: 'desc', dateGranularity: 'month' },
  ],
  filter: {
    stage: { $eq: 'Closed Won' },
  },
};

// ============================================================================
// MATRIX REPORTS (Two-Dimensional Grouping)
// ============================================================================

/**
 * Example 6: Matrix Report
 * Data grouped by rows AND columns
 * Use Case: Sales by product and quarter, cases by status and priority
 */
export const SalesByProductAndQuarterReport: Report = {
  name: 'sales_by_product_quarter',
  label: 'Sales by Product and Quarter',
  objectName: 'opportunity',
  type: 'matrix',
  columns: [
    { field: 'amount', label: 'Total Revenue', aggregate: 'sum' },
    { field: 'id', label: 'Deals', aggregate: 'count' },
  ],
  groupingsDown: [
    { field: 'product_name', sortOrder: 'asc' },
  ],
  groupingsAcross: [
    { field: 'close_date', sortOrder: 'asc', dateGranularity: 'quarter' },
  ],
  filter: {
    stage: { $eq: 'Closed Won' },
  },
};

// ============================================================================
// REPORTS WITH CHARTS
// ============================================================================

/**
 * Example 7: Report with Bar Chart
 * Tabular/summary report with embedded visualization
 * Use Case: Visual sales pipeline, case analysis
 */
export const PipelineByStageWithChartReport: Report = {
  name: 'pipeline_by_stage_chart',
  label: 'Sales Pipeline by Stage',
  objectName: 'opportunity',
  type: 'summary',
  columns: [
    { field: 'amount', label: 'Total Value', aggregate: 'sum' },
    { field: 'id', label: 'Opportunities', aggregate: 'count' },
  ],
  groupingsDown: [
    { field: 'stage', sortOrder: 'asc' },
  ],
  chart: {
    type: 'bar',
    title: 'Pipeline Value by Stage',
    showLegend: true,
    xAxis: 'stage',
    yAxis: 'amount',
  },
};

/**
 * Example 8: Report with Pie Chart
 * Summary report with pie chart visualization
 * Use Case: Distribution analysis, win/loss breakdown
 */
export const LeadSourceDistributionReport: Report = {
  name: 'lead_source_distribution',
  label: 'Lead Source Distribution',
  objectName: 'lead',
  type: 'summary',
  columns: [
    { field: 'id', label: 'Lead Count', aggregate: 'count' },
  ],
  groupingsDown: [
    { field: 'lead_source', sortOrder: 'desc' },
  ],
  chart: {
    type: 'pie',
    title: 'Leads by Source',
    showLegend: true,
    xAxis: 'lead_source',
    yAxis: 'id',
  },
};

/**
 * Example 9: Report with Line Chart
 * Time-series trend analysis
 * Use Case: Growth trends, historical analysis
 */
export const QuarterlyGrowthTrendReport: Report = {
  name: 'quarterly_growth_trend',
  label: 'Quarterly Revenue Growth',
  objectName: 'opportunity',
  type: 'summary',
  columns: [
    { field: 'amount', label: 'Revenue', aggregate: 'sum' },
    { field: 'id', label: 'Deals', aggregate: 'count' },
  ],
  groupingsDown: [
    { field: 'close_date', sortOrder: 'asc', dateGranularity: 'quarter' },
  ],
  filter: {
    stage: { $eq: 'Closed Won' },
  },
  chart: {
    type: 'line',
    title: 'Revenue Trend Over Time',
    showLegend: true,
    xAxis: 'close_date',
    yAxis: 'amount',
  },
};

/**
 * Example 10: Report with Funnel Chart
 * Conversion analysis through stages
 * Use Case: Sales funnel, conversion tracking
 */
export const SalesFunnelReport: Report = {
  name: 'sales_funnel',
  label: 'Sales Funnel Analysis',
  objectName: 'opportunity',
  type: 'summary',
  columns: [
    { field: 'id', label: 'Opportunities', aggregate: 'count' },
    { field: 'amount', label: 'Total Value', aggregate: 'sum' },
  ],
  groupingsDown: [
    { field: 'stage', sortOrder: 'asc' },
  ],
  chart: {
    type: 'funnel',
    title: 'Sales Funnel',
    showLegend: false,
    xAxis: 'stage',
    yAxis: 'id',
  },
};

// ============================================================================
// ADVANCED REPORTS
// ============================================================================

/**
 * Example 11: Complex Filtered Report
 * Multiple filter conditions with AND/OR logic
 * Use Case: Targeted analysis with complex criteria
 */
export const HighValueOpportunitiesReport: Report = {
  name: 'high_value_opportunities',
  label: 'High-Value Opportunities (>$100K)',
  objectName: 'opportunity',
  type: 'tabular',
  columns: [
    { field: 'name', label: 'Opportunity' },
    { field: 'account_name', label: 'Account' },
    { field: 'amount', label: 'Value' },
    { field: 'stage', label: 'Stage' },
    { field: 'owner_name', label: 'Owner' },
    { field: 'close_date', label: 'Close Date' },
  ],
  filter: {
    $and: [
      { amount: { $gte: 100000 } },
      {
        $or: [
          { stage: { $eq: 'Negotiation' } },
          { stage: { $eq: 'Proposal' } },
        ],
      },
    ],
  },
};

/**
 * Example 12: Report with Multiple Aggregations
 * Various aggregate functions on different columns
 * Use Case: Statistical analysis, performance metrics
 */
export const SalesPerformanceReport: Report = {
  name: 'sales_performance',
  label: 'Sales Rep Performance',
  objectName: 'opportunity',
  type: 'summary',
  columns: [
    { field: 'id', label: 'Total Deals', aggregate: 'count' },
    { field: 'amount', label: 'Total Revenue', aggregate: 'sum' },
    { field: 'amount', label: 'Average Deal', aggregate: 'avg' },
    { field: 'amount', label: 'Largest Deal', aggregate: 'max' },
    { field: 'amount', label: 'Smallest Deal', aggregate: 'min' },
  ],
  groupingsDown: [
    { field: 'owner_name', sortOrder: 'desc' },
  ],
  filter: {
    stage: { $eq: 'Closed Won' },
  },
};
