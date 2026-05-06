// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { TranslationData } from '@objectstack/spec/system';

/**
 * English (en) — CRM App Translations
 *
 * Per-locale file: one file per language, following the `per_locale` convention.
 * Each file exports a single `TranslationData` object for its locale.
 */
export const en: TranslationData = {
  objects: {
    account: {
      label: 'Account',
      pluralLabel: 'Accounts',
      fields: {
        account_number: { label: 'Account Number' },
        name: { label: 'Account Name', help: 'Legal name of the company or organization' },
        type: {
          label: 'Type',
          options: { prospect: 'Prospect', customer: 'Customer', partner: 'Partner', former: 'Former' },
        },
        industry: {
          label: 'Industry',
          options: {
            technology: 'Technology', finance: 'Finance', healthcare: 'Healthcare',
            retail: 'Retail', manufacturing: 'Manufacturing', education: 'Education',
          },
        },
        annual_revenue: { label: 'Annual Revenue' },
        number_of_employees: { label: 'Number of Employees' },
        phone: { label: 'Phone' },
        website: { label: 'Website' },
        billing_address: { label: 'Billing Address' },
        office_location: { label: 'Office Location' },
        owner: { label: 'Account Owner' },
        parent_account: { label: 'Parent Account' },
        description: { label: 'Description' },
        is_active: { label: 'Active' },
        last_activity_date: { label: 'Last Activity Date' },
      },
    },

    contact: {
      label: 'Contact',
      pluralLabel: 'Contacts',
      fields: {
        salutation: { label: 'Salutation' },
        first_name: { label: 'First Name' },
        last_name: { label: 'Last Name' },
        full_name: { label: 'Full Name' },
        account: { label: 'Account' },
        email: { label: 'Email' },
        phone: { label: 'Phone' },
        mobile: { label: 'Mobile' },
        title: { label: 'Title' },
        department: {
          label: 'Department',
          options: {
            Executive: 'Executive', Sales: 'Sales', Marketing: 'Marketing',
            Engineering: 'Engineering', Support: 'Support', Finance: 'Finance',
            HR: 'Human Resources', Operations: 'Operations',
          },
        },
        owner: { label: 'Contact Owner' },
        description: { label: 'Description' },
        is_primary: { label: 'Primary Contact' },
      },
    },

    lead: {
      label: 'Lead',
      pluralLabel: 'Leads',
      fields: {
        first_name: { label: 'First Name' },
        last_name: { label: 'Last Name' },
        company: { label: 'Company' },
        title: { label: 'Title' },
        email: { label: 'Email' },
        phone: { label: 'Phone' },
        status: {
          label: 'Status',
          options: {
            new: 'New', contacted: 'Contacted', qualified: 'Qualified',
            unqualified: 'Unqualified', converted: 'Converted',
          },
        },
        lead_source: {
          label: 'Lead Source',
          options: {
            Web: 'Web', Referral: 'Referral', Event: 'Event',
            Partner: 'Partner', Advertisement: 'Advertisement', 'Cold Call': 'Cold Call',
          },
        },
        owner: { label: 'Lead Owner' },
        is_converted: { label: 'Converted' },
        description: { label: 'Description' },
      },
    },

    opportunity: {
      label: 'Opportunity',
      pluralLabel: 'Opportunities',
      fields: {
        name: { label: 'Opportunity Name' },
        account: { label: 'Account' },
        primary_contact: { label: 'Primary Contact' },
        owner: { label: 'Opportunity Owner' },
        amount: { label: 'Amount' },
        expected_revenue: { label: 'Expected Revenue' },
        stage: {
          label: 'Stage',
          options: {
            prospecting: 'Prospecting', qualification: 'Qualification',
            needs_analysis: 'Needs Analysis', proposal: 'Proposal',
            negotiation: 'Negotiation', closed_won: 'Closed Won', closed_lost: 'Closed Lost',
          },
        },
        probability: { label: 'Probability (%)' },
        close_date: { label: 'Close Date' },
        type: {
          label: 'Type',
          options: {
            'New Business': 'New Business',
            'Existing Customer - Upgrade': 'Existing Customer - Upgrade',
            'Existing Customer - Renewal': 'Existing Customer - Renewal',
            'Existing Customer - Expansion': 'Existing Customer - Expansion',
          },
        },
        forecast_category: {
          label: 'Forecast Category',
          options: {
            Pipeline: 'Pipeline', 'Best Case': 'Best Case',
            Commit: 'Commit', Omitted: 'Omitted', Closed: 'Closed',
          },
        },
        description: { label: 'Description' },
        next_step: { label: 'Next Step' },
      },
    },
  },

  apps: {
    crm_enterprise: {
      label: 'Enterprise CRM',
      description: 'Customer relationship management for sales, service, and marketing',
      navigation: {
        group_sales: { label: 'Sales' },
        group_service: { label: 'Service' },
        group_marketing: { label: 'Marketing' },
        group_products: { label: 'Products' },
        group_analytics: { label: 'Analytics' },
      },
    },
  },

  messages: {
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.back': 'Back',
    'common.confirm': 'Confirm',
    'nav.sales': 'Sales',
    'nav.service': 'Service',
    'nav.marketing': 'Marketing',
    'nav.products': 'Products',
    'nav.analytics': 'Analytics',
    'success.saved': 'Record saved successfully',
    'success.converted': 'Lead converted successfully',
    'confirm.delete': 'Are you sure you want to delete this record?',
    'confirm.convert_lead': 'Convert this lead to account, contact, and opportunity?',
    'error.required': 'This field is required',
    'error.load_failed': 'Failed to load data',
  },

  validationMessages: {
    amount_required_for_closed: 'Amount is required when stage is Closed Won',
    close_date_required: 'Close date is required for opportunities',
    discount_limit: 'Discount cannot exceed 40%',
  },

  dashboards: {
    crm_overview_dashboard: {
      label: 'CRM Overview',
      description: 'Revenue metrics, pipeline analytics, and deal insights',
      actions: {
        create_opportunity: { label: 'New Deal' },
        create_lead: { label: 'New Lead' },
        '/reports': { label: 'Reports' },
      },
      widgets: {
        total_revenue: { title: 'Total Revenue', description: 'Closed-won revenue this period' },
        active_deals: { title: 'Active Deals', description: 'Open opportunities in the pipeline' },
        win_rate: { title: 'Win Rate', description: 'Closed-won share of resolved deals this period' },
        avg_deal_size: { title: 'Avg Deal Size', description: 'Average value of closed-won deals' },
        revenue_trends: { title: 'Revenue Trends', description: 'Closed-won revenue over the last 12 months' },
        lead_source: { title: 'Lead Source', description: 'Pipeline value by acquisition channel' },
        pipeline_by_stage: { title: 'Pipeline by Stage', description: 'Open opportunity value at each sales stage' },
        top_products: { title: 'Top Products', description: 'Total list-price revenue by product category' },
        recent_opportunities: { title: 'Recent Opportunities', description: 'Most recently updated deals across the team' },
      },
    },
    executive_dashboard: {
      label: 'Executive Overview',
      description: 'High-level revenue, customer, and pipeline KPIs for leadership',
      actions: {
        export_dashboard_pdf: { label: 'Export PDF' },
        schedule_dashboard_email: { label: 'Schedule Email' },
        customize_dashboard: { label: 'Customize' },
      },
      widgets: {
        total_revenue_ytd: { title: 'Total Revenue (YTD)', description: 'Closed-won revenue this year' },
        total_accounts: { title: 'Active Accounts', description: 'Customers with at least one active relationship' },
        total_contacts: { title: 'Total Contacts', description: 'People in our address book' },
        open_leads: { title: 'Open Leads', description: 'Unconverted leads in the funnel' },
        revenue_trend: { title: 'Revenue Trend', description: 'Closed-won revenue over the last 12 months' },
        revenue_by_industry: { title: 'Revenue by Industry', description: 'YTD closed-won revenue split by account industry' },
        pipeline_by_stage: { title: 'Pipeline by Stage', description: 'Open opportunity value by sales stage' },
        new_accounts_by_month: { title: 'New Accounts', description: 'Account creation cadence — last 6 months' },
        top_accounts_by_revenue: { title: 'Top Accounts by Revenue', description: 'Largest customers ranked by annual revenue' },
      },
    },
    sales_dashboard: {
      label: 'Sales Performance',
      description: 'Pipeline analytics, win rate trends, and rep performance',
      actions: {
        create_opportunity: { label: 'New Opportunity' },
        '/reports/forecast': { label: 'Forecast' },
        export_dashboard_pdf: { label: 'Export' },
      },
      widgets: {
        total_pipeline_value: { title: 'Total Pipeline', description: 'Sum of open opportunity value' },
        closed_won_qtd: { title: 'Closed Won (QTD)', description: 'Revenue closed this quarter' },
        open_opportunities: { title: 'Open Opportunities', description: 'Active deals in flight' },
        avg_deal_size: { title: 'Avg Deal Size', description: 'Average value of closed-won deals this quarter' },
        pipeline_by_stage: { title: 'Pipeline by Stage', description: 'Open opportunity value at each sales stage' },
        monthly_revenue_trend: { title: 'Monthly Revenue Trend', description: 'Closed-won revenue, last 12 months' },
        opportunities_by_owner: { title: 'Opportunities by Owner', description: 'Open pipeline value per sales rep' },
        lead_source_breakdown: { title: 'Lead Source', description: 'Where our pipeline is coming from' },
        top_opportunities: { title: 'Top Open Opportunities', description: 'Highest-value deals still in flight' },
      },
    },
    service_dashboard: {
      label: 'Customer Service',
      description: 'Case load, SLA health, and resolution performance',
      actions: {
        create_case: { label: 'New Case' },
        '/objects/case?owner=current_user': { label: 'My Queue' },
        '/reports/sla': { label: 'SLA Report' },
      },
      widgets: {
        open_cases: { title: 'Open Cases', description: 'Cases that are not yet closed' },
        critical_cases: { title: 'Critical Cases', description: 'Open cases marked as critical priority' },
        avg_resolution_time: { title: 'Avg Resolution Time', description: 'Mean time to close, in hours' },
        sla_violations: { title: 'SLA Violations', description: 'Cases that breached their SLA' },
        cases_by_status: { title: 'Cases by Status', description: 'Workload distribution across the pipeline' },
        cases_by_priority: { title: 'Cases by Priority', description: 'Open case mix by urgency' },
        cases_by_origin: { title: 'Cases by Origin', description: 'Where our cases are coming from' },
        daily_case_volume: { title: 'Daily Case Volume', description: 'New cases created over the last 30 days' },
        sla_compliance_gauge: { title: 'SLA Compliance', description: 'Percent of cases resolved within SLA this period' },
        my_open_cases: { title: 'My Open Cases', description: 'Cases assigned to you, sorted by priority' },
      },
    },
  },
};
