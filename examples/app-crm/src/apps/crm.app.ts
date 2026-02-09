// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { App } from '@objectstack/spec/ui';

export const CrmApp = App.create({
  name: 'crm_enterprise',
  label: 'Enterprise CRM',
  icon: 'briefcase',
  branding: {
    primaryColor: '#4169E1',
    secondaryColor: '#00AA00',
    logo: '/assets/crm-logo.png',
    favicon: '/assets/crm-favicon.ico',
  },
  
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
});
