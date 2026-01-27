import { defineStack } from '@objectstack/spec';
import { App } from '@objectstack/spec/ui';
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

export default defineStack({
  manifest: {
    id: 'com.example.crm',
    version: '2.0.0',
    type: 'app',
    name: 'CRM App',
    description: 'Comprehensive CRM example demonstrating all ObjectStack Protocol features'
  },
  
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

  // Actions available in the app
  actions: Object.values(CrmActions),
  
  // Dashboards
  dashboards: Object.values(CrmDashboards),
  
  // Reports
  reports: Object.values(CrmReports),
  
  apps: [
    App.create({
      name: 'crm_example',
      label: 'CRM App',
      icon: 'briefcase',
      branding: {
        primaryColor: '#4169E1',
        logo: '/assets/crm-logo.png',
        favicon: '/assets/crm-favicon.ico',
      },
      
      // Navigation menu structure
      navigation: [
        {
          id: 'group_sales',
          type: 'group',
          label: 'Sales',
          children: [
            { id: 'nav_lead', type: 'object', objectName: 'lead', label: 'Leads' },
            { id: 'nav_account', type: 'object', objectName: 'account', label: 'Accounts' },
            { id: 'nav_contact', type: 'object', objectName: 'contact', label: 'Contacts' },
            { id: 'nav_opportunity', type: 'object', objectName: 'opportunity', label: 'Opportunities' },
            { id: 'nav_sales_dashboard', type: 'dashboard', dashboardName: 'sales_dashboard', label: 'Sales Dashboard' },
          ]
        },
        {
          id: 'group_service',
          type: 'group',
          label: 'Service',
          children: [
            { id: 'nav_case', type: 'object', objectName: 'case', label: 'Cases' },
            { id: 'nav_service_dashboard', type: 'dashboard', dashboardName: 'service_dashboard', label: 'Service Dashboard' },
          ]
        },
        {
          id: 'group_activities',
          type: 'group',
          label: 'Activities',
          children: [
            { id: 'nav_task', type: 'object', objectName: 'task', label: 'Tasks' },
          ]
        },
        {
          id: 'group_analytics',
          type: 'group',
          label: 'Analytics',
          children: [
            { id: 'nav_exec_dashboard', type: 'dashboard', dashboardName: 'executive_dashboard', label: 'Executive Dashboard' },
            { id: 'nav_analytics_sales_db', type: 'dashboard', dashboardName: 'sales_dashboard', label: 'Sales Dashboard' },
            { id: 'nav_analytics_service_db', type: 'dashboard', dashboardName: 'service_dashboard', label: 'Service Dashboard' },
          ]
        }
      ]
    })
  ]
});
