// @ts-nocheck
import { Page } from '@objectstack/spec/ui';

/**
 * Page Examples - Demonstrating ObjectStack Page Protocol
 * 
 * Pages define component composition and layouts.
 * Inspired by Salesforce Lightning Pages and ServiceNow UI Builder.
 */

// ============================================================================
// RECORD PAGES (Detail/Edit Pages)
// ============================================================================

/**
 * Example 1: Simple Record Page
 * Basic record page with standard layout
 * Use Case: Default record views for most objects
 */
export const SimpleRecordPage: Page = {
  name: 'account_record_page',
  label: 'Account Record Page',
  description: 'Default record page for accounts',
  type: 'record',
  object: 'account',
  template: 'header-sidebar-main',
  
  regions: [
    {
      name: 'header',
      components: [
        {
          type: 'record-header',
          properties: {
            title: '{name}',
            subtitle: '{industry}',
            icon: 'building',
            fields: ['owner', 'type', 'annual_revenue'],
          },
        },
      ],
    },
    {
      name: 'sidebar',
      width: 'small',
      components: [
        {
          type: 'highlights-panel',
          label: 'Key Details',
          properties: {
            fields: ['account_number', 'phone', 'website', 'is_active'],
          },
        },
      ],
    },
    {
      name: 'main',
      components: [
        {
          type: 'record-detail',
          properties: {
            sections: [
              {
                label: 'Account Information',
                fields: ['name', 'type', 'industry', 'annual_revenue'],
              },
              {
                label: 'Address Information',
                fields: ['billing_address', 'shipping_address'],
              },
            ],
          },
        },
        {
          type: 'related-lists',
          label: 'Related Lists',
          properties: {
            lists: [
              { object: 'contact', relationField: 'account_id', label: 'Contacts' },
              { object: 'opportunity', relationField: 'account_id', label: 'Opportunities' },
              { object: 'case', relationField: 'account_id', label: 'Cases' },
            ],
          },
        },
      ],
    },
  ],
  
  isDefault: true,
};

/**
 * Example 2: Advanced Record Page with Multiple Regions
 * Complex page layout with tabs and multiple component types
 * Use Case: High-value objects requiring rich context (e.g., Account, Opportunity)
 */
export const AdvancedRecordPage: Page = {
  name: 'opportunity_record_page',
  label: 'Opportunity Record Page',
  description: 'Enhanced record page for opportunities',
  type: 'record',
  object: 'opportunity',
  template: 'header-sidebar-main-footer',
  
  regions: [
    {
      name: 'header',
      components: [
        {
          type: 'path-component',
          properties: {
            stages: ['prospecting', 'qualification', 'needs_analysis', 'proposal', 'negotiation', 'closed_won'],
            currentStageField: 'stage',
            completionField: 'probability',
          },
        },
        {
          type: 'record-header',
          properties: {
            title: '{name}',
            subtitle: '{account_name}',
            icon: 'trending-up',
            fields: ['amount', 'close_date', 'probability', 'owner'],
            quickActions: ['edit', 'clone', 'delete', 'change_owner'],
          },
        },
      ],
    },
    {
      name: 'sidebar',
      width: 'medium',
      components: [
        {
          type: 'highlights-panel',
          label: 'Key Metrics',
          properties: {
            fields: ['amount', 'probability', 'expected_revenue', 'close_date', 'stage'],
          },
        },
        {
          type: 'activity-timeline',
          label: 'Activity Timeline',
          properties: {
            types: ['task', 'event', 'email', 'call'],
            limit: 10,
            showUpcoming: true,
          },
        },
        {
          type: 'chatter-feed',
          label: 'Collaboration',
          properties: {
            showPosts: true,
            showFiles: true,
          },
        },
      ],
    },
    {
      name: 'main',
      components: [
        {
          type: 'tabset',
          properties: {
            tabs: [
              {
                label: 'Details',
                components: [
                  {
                    type: 'record-detail',
                    properties: {
                      sections: [
                        {
                          label: 'Opportunity Information',
                          fields: ['name', 'account_name', 'type', 'stage', 'probability'],
                        },
                        {
                          label: 'Financial Details',
                          fields: ['amount', 'expected_revenue', 'close_date', 'next_step'],
                        },
                      ],
                    },
                  },
                ],
              },
              {
                label: 'Products',
                components: [
                  {
                    type: 'related-list',
                    properties: {
                      object: 'opportunity_line_item',
                      relationField: 'opportunity_id',
                      columns: ['product_name', 'quantity', 'unit_price', 'total_price'],
                      allowInlineEdit: true,
                    },
                  },
                ],
              },
              {
                label: 'Competitors',
                components: [
                  {
                    type: 'related-list',
                    properties: {
                      object: 'opportunity_competitor',
                      relationField: 'opportunity_id',
                      columns: ['competitor_name', 'strengths', 'weaknesses'],
                    },
                  },
                ],
              },
              {
                label: 'Related',
                components: [
                  {
                    type: 'related-lists',
                    properties: {
                      lists: [
                        { object: 'contact', relationField: 'opportunity_id', label: 'Contact Roles' },
                        { object: 'task', relationField: 'related_to_id', label: 'Open Tasks' },
                        { object: 'note', relationField: 'parent_id', label: 'Notes' },
                      ],
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      name: 'footer',
      components: [
        {
          type: 'record-footer',
          properties: {
            fields: ['created_by', 'created_date', 'last_modified_by', 'last_modified_date'],
          },
        },
      ],
    },
  ],
  
  isDefault: true,
};

/**
 * Example 3: Compact Record Page
 * Minimal page for quick views
 * Use Case: Simple objects, quick popups, mobile views
 */
export const CompactRecordPage: Page = {
  name: 'task_compact_page',
  label: 'Task Quick View',
  description: 'Compact view for tasks',
  type: 'record',
  object: 'task',
  template: 'single-column',
  
  regions: [
    {
      name: 'main',
      components: [
        {
          type: 'record-detail',
          properties: {
            sections: [
              {
                label: 'Task Details',
                fields: ['subject', 'status', 'priority', 'due_date', 'assigned_to'],
              },
            ],
          },
        },
      ],
    },
  ],
};

// ============================================================================
// HOME PAGES (Dashboard/Landing Pages)
// ============================================================================

/**
 * Example 4: Home Page with Dashboard
 * User's home landing page
 * Use Case: Default landing page, personalized dashboards
 */
export const UserHomePage: Page = {
  name: 'sales_home',
  label: 'Sales Home',
  description: 'Sales representative home page',
  type: 'home',
  template: 'two-column',
  
  regions: [
    {
      name: 'left',
      width: 'large',
      components: [
        {
          type: 'dashboard-embed',
          label: 'My Performance',
          properties: {
            dashboardName: 'my_sales_performance',
            filters: {
              owner: '{current_user}',
            },
          },
        },
        {
          type: 'chart',
          label: 'Pipeline by Stage',
          properties: {
            chartType: 'funnel',
            object: 'opportunity',
            groupBy: 'stage',
            measureField: 'amount',
            filter: {
              owner: '{current_user}',
              stage: { $nin: ['closed_won', 'closed_lost'] },
            },
          },
        },
      ],
    },
    {
      name: 'right',
      width: 'medium',
      components: [
        {
          type: 'list-view',
          label: 'My Tasks',
          properties: {
            object: 'task',
            viewName: 'my_open_tasks',
            filter: {
              assigned_to: '{current_user}',
              is_completed: false,
            },
            limit: 10,
          },
        },
        {
          type: 'list-view',
          label: 'My Opportunities',
          properties: {
            object: 'opportunity',
            viewName: 'my_opportunities',
            filter: {
              owner: '{current_user}',
              close_date: { $lte: '{next_30_days}' },
            },
            limit: 5,
          },
        },
        {
          type: 'recent-items',
          label: 'Recent Records',
          properties: {
            limit: 10,
          },
        },
      ],
    },
  ],
  
  isDefault: true,
};

/**
 * Example 5: Executive Home Page
 * High-level overview for executives
 * Use Case: Executive dashboards, KPI monitoring
 */
export const ExecutiveHomePage: Page = {
  name: 'executive_home',
  label: 'Executive Home',
  description: 'Executive dashboard view',
  type: 'home',
  template: 'three-column',
  
  regions: [
    {
      name: 'header',
      components: [
        {
          type: 'kpi-banner',
          properties: {
            kpis: [
              { label: 'Revenue (YTD)', value: '{total_revenue_ytd}', format: 'currency' },
              { label: 'New Customers', value: '{new_customers_qtd}', format: 'number' },
              { label: 'Customer Satisfaction', value: '{csat_score}', format: 'percentage' },
            ],
          },
        },
      ],
    },
    {
      name: 'left',
      width: 'medium',
      components: [
        {
          type: 'chart',
          label: 'Revenue Trend',
          properties: {
            chartType: 'line',
            object: 'opportunity',
            groupBy: 'close_date',
            measureField: 'amount',
            dateGranularity: 'month',
          },
        },
      ],
    },
    {
      name: 'middle',
      width: 'medium',
      components: [
        {
          type: 'chart',
          label: 'Pipeline by Stage',
          properties: {
            chartType: 'bar',
            object: 'opportunity',
            groupBy: 'stage',
            measureField: 'amount',
          },
        },
      ],
    },
    {
      name: 'right',
      width: 'medium',
      components: [
        {
          type: 'list-view',
          label: 'Top Opportunities',
          properties: {
            object: 'opportunity',
            columns: ['name', 'amount', 'close_date'],
            sortBy: 'amount',
            sortOrder: 'desc',
            limit: 10,
          },
        },
      ],
    },
  ],
};

// ============================================================================
// APP PAGES (Custom Application Pages)
// ============================================================================

/**
 * Example 6: Custom Application Page
 * Specialized page for custom functionality
 * Use Case: Custom tools, calculators, wizards
 */
export const QuoteBuilderPage: Page = {
  name: 'quote_builder',
  label: 'Quote Builder',
  description: 'Interactive quote creation tool',
  type: 'app',
  template: 'wizard',
  
  regions: [
    {
      name: 'steps',
      components: [
        {
          type: 'wizard-step',
          label: 'Select Account',
          properties: {
            fields: ['account', 'contact', 'opportunity'],
          },
        },
        {
          type: 'wizard-step',
          label: 'Add Products',
          properties: {
            component: 'product-selector',
          },
        },
        {
          type: 'wizard-step',
          label: 'Configure Pricing',
          properties: {
            component: 'pricing-calculator',
          },
        },
        {
          type: 'wizard-step',
          label: 'Review & Submit',
          properties: {
            component: 'quote-preview',
          },
        },
      ],
    },
  ],
};

/**
 * Example 7: Report Builder Page
 * Custom report creation interface
 * Use Case: Report builders, query tools
 */
export const ReportBuilderPage: Page = {
  name: 'report_builder',
  label: 'Report Builder',
  description: 'Custom report creation tool',
  type: 'app',
  template: 'sidebar-main',
  
  regions: [
    {
      name: 'sidebar',
      width: 'small',
      components: [
        {
          type: 'field-picker',
          label: 'Available Fields',
          properties: {
            objects: ['account', 'contact', 'opportunity'],
          },
        },
      ],
    },
    {
      name: 'main',
      components: [
        {
          type: 'report-canvas',
          properties: {
            allowFilters: true,
            allowGrouping: true,
            allowCharting: true,
          },
        },
      ],
    },
  ],
};

// ============================================================================
// UTILITY PAGES (Modal/Popup Pages)
// ============================================================================

/**
 * Example 8: Utility Bar Page
 * Persistent utility sidebar
 * Use Case: Quick access tools, calculators, notes
 */
export const UtilityBarPage: Page = {
  name: 'utility_bar',
  label: 'Utility Bar',
  description: 'Quick access tools',
  type: 'utility',
  template: 'single-column',
  
  regions: [
    {
      name: 'main',
      components: [
        {
          type: 'quick-notes',
          label: 'Notes',
          properties: {
            allowRichText: true,
          },
        },
        {
          type: 'calculator',
          label: 'Calculator',
        },
        {
          type: 'recent-items',
          label: 'Recent',
          properties: {
            limit: 5,
          },
        },
      ],
    },
  ],
};

// ============================================================================
// CONDITIONAL PAGES (Context-Aware Pages)
// ============================================================================

/**
 * Example 9: Profile-Specific Record Page
 * Different layouts for different user profiles
 * Use Case: Role-based UI variations
 */
export const SalesRecordPage: Page = {
  name: 'account_sales_view',
  label: 'Account (Sales View)',
  description: 'Account page optimized for sales users',
  type: 'record',
  object: 'account',
  template: 'header-sidebar-main',
  
  regions: [
    {
      name: 'header',
      components: [
        {
          type: 'record-header',
          properties: {
            title: '{name}',
            subtitle: '{annual_revenue}',
            icon: 'briefcase',
            fields: ['owner', 'type', 'lead_source'],
          },
        },
      ],
    },
    {
      name: 'sidebar',
      width: 'medium',
      components: [
        {
          type: 'highlights-panel',
          label: 'Sales Insights',
          properties: {
            fields: ['total_opportunities', 'total_revenue', 'last_activity_date'],
          },
        },
        {
          type: 'activity-composer',
          label: 'Log Activity',
          properties: {
            types: ['call', 'email', 'meeting'],
          },
        },
      ],
    },
    {
      name: 'main',
      components: [
        {
          type: 'record-detail',
          properties: {
            sections: [
              {
                label: 'Account Information',
                fields: ['name', 'type', 'industry', 'annual_revenue'],
              },
            ],
          },
        },
        {
          type: 'related-lists',
          properties: {
            lists: [
              { object: 'opportunity', relationField: 'account_id', label: 'Opportunities' },
              { object: 'contact', relationField: 'account_id', label: 'Contacts' },
            ],
          },
        },
      ],
    },
  ],
  
  assignedProfiles: ['sales_user', 'sales_manager'],
};

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export const PageExamples = {
  // Record Pages
  SimpleRecordPage,
  AdvancedRecordPage,
  CompactRecordPage,
  
  // Home Pages
  UserHomePage,
  ExecutiveHomePage,
  
  // App Pages
  QuoteBuilderPage,
  ReportBuilderPage,
  
  // Utility Pages
  UtilityBarPage,
  
  // Conditional Pages
  SalesRecordPage,
};
