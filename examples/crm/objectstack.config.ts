import { App } from '@objectstack/spec';
import { Account } from './src/domains/crm/account.object';
import { Contact } from './src/domains/crm/contact.object';
import { Opportunity } from './src/domains/crm/opportunity.object';
import { Lead } from './src/domains/crm/lead.object';
import { Case } from './src/domains/crm/case.object';
import { Task } from './src/domains/crm/task.object';
import { PipelineStatsApi, LeadConvertApi } from './src/server';

import { CrmActions } from './src/ui/actions';
import { CrmDashboards } from './src/ui/dashboards';
import { CrmReports } from './src/ui/reports';

export default App.create({
  name: 'crm_example',
  label: 'CRM App',
  description: 'Comprehensive CRM example demonstrating all ObjectStack Protocol features',
  version: '2.0.0',
  
  // All objects in the app
  objects: [
    Account,
    Contact,
    Opportunity,
    Lead,
    Case,
    Task
  ],
  
  // Custom APIs
  apis: [
    PipelineStatsApi,
    LeadConvertApi
  ],
  
  // Navigation menu structure
  menus: [
    {
      label: 'Sales',
      items: [
        { type: 'object', object: 'lead', label: 'Leads' },
        { type: 'object', object: 'account', label: 'Accounts' },
        { type: 'object', object: 'contact', label: 'Contacts' },
        { type: 'object', object: 'opportunity', label: 'Opportunities' },
        { type: 'divider' },
        { type: 'dashboard', dashboard: 'sales_dashboard', label: 'Sales Dashboard' },
        { type: 'report', report: 'opportunities_by_stage', label: 'Pipeline Report' },
      ]
    },
    {
      label: 'Service',
      items: [
        { type: 'object', object: 'case', label: 'Cases' },
        { type: 'divider' },
        { type: 'dashboard', dashboard: 'service_dashboard', label: 'Service Dashboard' },
        { type: 'report', report: 'cases_by_status_priority', label: 'Case Report' },
      ]
    },
    {
      label: 'Activities',
      items: [
        { type: 'object', object: 'task', label: 'Tasks' },
      ]
    },
    {
      label: 'Analytics',
      items: [
        { type: 'dashboard', dashboard: 'executive_dashboard', label: 'Executive Dashboard' },
        { type: 'dashboard', dashboard: 'sales_dashboard', label: 'Sales Dashboard' },
        { type: 'dashboard', dashboard: 'service_dashboard', label: 'Service Dashboard' },
        { type: 'divider' },
        { type: 'report', report: 'opportunities_by_stage', label: 'Opportunities by Stage' },
        { type: 'report', report: 'won_opportunities_by_owner', label: 'Won Opportunities' },
        { type: 'report', report: 'accounts_by_industry_type', label: 'Accounts Matrix' },
        { type: 'report', report: 'cases_by_status_priority', label: 'Cases by Status' },
        { type: 'report', report: 'sla_performance', label: 'SLA Performance' },
        { type: 'report', report: 'leads_by_source', label: 'Leads by Source' },
      ]
    }
  ],
  
  // Actions available in the app
  actions: Object.values(CrmActions),
  
  // Dashboards
  dashboards: Object.values(CrmDashboards),
  
  // Reports
  reports: Object.values(CrmReports),
  
  // App-level settings
  settings: {
    theme: {
      primaryColor: '#4169E1',
      logo: '/assets/crm-logo.png',
    },
    features: {
      enableGlobalSearch: true,
      enableNotifications: true,
      enableMobileApp: true,
      enableOfflineMode: true,
    }
  }
});