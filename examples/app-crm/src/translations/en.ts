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
};
