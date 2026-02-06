import { defineStack } from '@objectstack/spec';
import { App } from '@objectstack/spec/ui';

// Sales Domain Objects
import { Account } from './src/domains/sales/account.object';
import { Contact } from './src/domains/sales/contact.object';
import { Opportunity } from './src/domains/sales/opportunity.object';
import { Lead } from './src/domains/sales/lead.object';
import { Quote } from './src/domains/sales/quote.object';
import { Contract } from './src/domains/sales/contract.object';

// Service Domain Objects
import { Case } from './src/domains/service/case.object';
import { Task } from './src/domains/service/task.object';

// Marketing Domain Objects
import { Campaign } from './src/domains/marketing/campaign.object';

// Product Domain Objects
import { Product } from './src/domains/products/product.object';

// APIs
import { PipelineStatsApi, LeadConvertApi } from './src/server';

// UI Configuration
import { CrmActions } from './src/ui/actions';
import { CrmDashboards } from './src/ui/dashboards';
import { CrmReports } from './src/ui/reports';

// Security Configuration
import { CrmProfiles } from './src/security/profiles';
import { CrmSharingRules } from './src/security/sharing-rules';

// AI Configuration
import { CrmAgents } from './src/ai/agents';
import { CrmRagPipelines } from './src/ai/rag-pipelines';

// Automation
import { CrmFlows } from './src/automation/flows';

export default defineStack({
  manifest: {
    id: 'com.example.crm',
    version: '3.0.0',
    type: 'app',
    name: 'Enterprise CRM',
    description: 'Comprehensive enterprise CRM demonstrating all ObjectStack Protocol features including AI, security, and automation',
    author: 'ObjectStack Team',
    repository: 'https://github.com/objectstack-ai/spec',
    license: 'MIT',
  },
  
  // Data Model - Organized by Domain
  objects: [
    // Sales Domain (6 objects)
    Account,
    Contact,
    Lead,
    Opportunity,
    Quote,
    Contract,
    
    // Service Domain (2 objects)
    Case,
    Task,
    
    // Marketing Domain (1 object)
    Campaign,
    
    // Product Domain (1 object)
    Product,
  ],
  
  // Custom APIs
  apis: [
    PipelineStatsApi,
    LeadConvertApi,
  ],
  
  // User Interface
  actions: Object.values(CrmActions),
  dashboards: Object.values(CrmDashboards),
  reports: Object.values(CrmReports),
  
  // Security Configuration
  profiles: Object.values(CrmProfiles),
  sharingRules: [
    CrmSharingRules.AccountTeamSharingRule,
    CrmSharingRules.OpportunitySalesSharingRule,
    CrmSharingRules.CaseEscalationSharingRule,
    ...CrmSharingRules.TerritorySharingRules,
  ],
  roleHierarchy: CrmSharingRules.RoleHierarchy,
  organizationDefaults: CrmSharingRules.OrganizationDefaults,
  
  // AI & Automation
  agents: Object.values(CrmAgents),
  ragPipelines: Object.values(CrmRagPipelines),
  flows: Object.values(CrmFlows),
  
  // Application Definition
  apps: [
    App.create({
      name: 'crm_enterprise',
      label: 'Enterprise CRM',
      icon: 'briefcase',
      branding: {
        primaryColor: '#4169E1',
        secondaryColor: '#00AA00',
        logo: '/assets/crm-logo.png',
        favicon: '/assets/crm-favicon.ico',
      },
      
      // Enhanced Navigation Menu Structure
      navigation: [
        {
          id: 'group_sales',
          type: 'group',
          label: 'Sales',
          icon: 'chart-line',
          children: [
            { id: 'nav_lead', type: 'object', objectName: 'lead', label: 'Leads', icon: 'user-plus' },
            { id: 'nav_account', type: 'object', objectName: 'account', label: 'Accounts', icon: 'building' },
            { id: 'nav_contact', type: 'object', objectName: 'contact', label: 'Contacts', icon: 'user' },
            { id: 'nav_opportunity', type: 'object', objectName: 'opportunity', label: 'Opportunities', icon: 'bullseye' },
            { id: 'nav_quote', type: 'object', objectName: 'quote', label: 'Quotes', icon: 'file-invoice' },
            { id: 'nav_contract', type: 'object', objectName: 'contract', label: 'Contracts', icon: 'file-signature' },
            { id: 'nav_sales_dashboard', type: 'dashboard', dashboardName: 'sales_dashboard', label: 'Sales Dashboard', icon: 'chart-bar' },
          ]
        },
        {
          id: 'group_service',
          type: 'group',
          label: 'Service',
          icon: 'headset',
          children: [
            { id: 'nav_case', type: 'object', objectName: 'case', label: 'Cases', icon: 'life-ring' },
            { id: 'nav_task', type: 'object', objectName: 'task', label: 'Tasks', icon: 'tasks' },
            { id: 'nav_service_dashboard', type: 'dashboard', dashboardName: 'service_dashboard', label: 'Service Dashboard', icon: 'chart-pie' },
          ]
        },
        {
          id: 'group_marketing',
          type: 'group',
          label: 'Marketing',
          icon: 'megaphone',
          children: [
            { id: 'nav_campaign', type: 'object', objectName: 'campaign', label: 'Campaigns', icon: 'bullhorn' },
            { id: 'nav_lead_marketing', type: 'object', objectName: 'lead', label: 'Leads', icon: 'user-plus' },
          ]
        },
        {
          id: 'group_products',
          type: 'group',
          label: 'Products',
          icon: 'box',
          children: [
            { id: 'nav_product', type: 'object', objectName: 'product', label: 'Products', icon: 'box-open' },
          ]
        },
        {
          id: 'group_analytics',
          type: 'group',
          label: 'Analytics',
          icon: 'chart-area',
          children: [
            { id: 'nav_exec_dashboard', type: 'dashboard', dashboardName: 'executive_dashboard', label: 'Executive Dashboard', icon: 'tachometer-alt' },
            { id: 'nav_analytics_sales_db', type: 'dashboard', dashboardName: 'sales_dashboard', label: 'Sales Analytics', icon: 'chart-line' },
            { id: 'nav_analytics_service_db', type: 'dashboard', dashboardName: 'service_dashboard', label: 'Service Analytics', icon: 'chart-pie' },
          ]
        }
      ]
    })
  ]
});
