// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineInterface } from '@objectstack/spec/ui';

/**
 * Sales Analytics Interface
 * Dashboards and reports for sales metrics
 */
export const SalesAnalyticsInterface = defineInterface({
  name: 'sales_analytics',
  label: 'Sales Analytics',
  description: 'Sales performance dashboards and analytics',
  icon: 'chart-line',
  group: 'Analytics',
  object: 'opportunity',
  
  pages: [
    {
      name: 'page_overview',
      label: 'Overview',
      type: 'dashboard',
      icon: 'gauge',
      regions: [
        {
          name: 'main',
          components: [
            {
              type: 'element:text',
              properties: {
                content: '# Sales Performance',
                variant: 'heading',
              },
            },
            {
              type: 'element:number',
              properties: {
                object: 'opportunity',
                aggregate: 'count',
              },
              dataSource: {
                object: 'opportunity',
                filter: { stage: 'closed_won' },
              },
            },
            {
              type: 'element:number',
              properties: {
                object: 'opportunity',
                field: 'amount',
                aggregate: 'sum',
                format: 'currency',
                prefix: '$',
              },
              dataSource: {
                object: 'opportunity',
                filter: { stage: 'closed_won' },
              },
            },
          ],
        },
      ],
    },
    {
      name: 'page_pipeline',
      label: 'Pipeline Report',
      type: 'dashboard',
      icon: 'chart-bar',
      regions: [],
    },
  ],
  
  homePageName: 'page_overview',
  assignedRoles: ['sales_manager', 'exec'],
  branding: {
    primaryColor: '#1A73E8',
  },
});
