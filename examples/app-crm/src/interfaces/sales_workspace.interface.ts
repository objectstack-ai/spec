// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineInterface } from '@objectstack/spec/ui';

/**
 * Sales Workspace Interface
 * Primary sales rep workspace with pipeline, accounts, and leads
 */
export const SalesWorkspaceInterface = defineInterface({
  name: 'sales_workspace',
  label: 'Sales Workspace',
  description: 'Primary workspace for sales representatives',
  icon: 'briefcase',
  group: 'Sales Cloud',
  object: 'opportunity',
  
  pages: [
    {
      name: 'page_pipeline',
      label: 'Pipeline',
      type: 'kanban',
      icon: 'columns',
      object: 'opportunity',
      regions: [],
    },
    {
      name: 'page_accounts',
      label: 'Accounts',
      type: 'grid',
      icon: 'building',
      object: 'account',
      regions: [],
    },
    {
      name: 'page_leads',
      label: 'Leads',
      type: 'list',
      icon: 'user-plus',
      object: 'lead',
      regions: [],
    },
  ],
  
  homePageName: 'page_pipeline',
  assignedRoles: ['sales_rep', 'sales_manager'],
});
