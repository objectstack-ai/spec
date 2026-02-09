// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Dashboard } from '@objectstack/spec/ui';

export const SalesDashboard: Dashboard = {
  name: 'sales_dashboard',
  label: 'Sales Performance',
  description: 'Key sales metrics and pipeline overview',
  
  widgets: [
    // Row 1: Key Metrics
    {
      title: 'Total Pipeline Value',
      type: 'metric',
      object: 'opportunity',
      filter: { stage: { $nin: ['closed_won', 'closed_lost'] } },
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 0, y: 0, w: 3, h: 2 },
      options: { prefix: '$', color: '#4169E1' }
    },
    {
      title: 'Closed Won This Quarter',
      type: 'metric',
      object: 'opportunity',
      filter: { stage: 'closed_won', close_date: { $gte: '{current_quarter_start}' } },
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 3, y: 0, w: 3, h: 2 },
      options: { prefix: '$', color: '#00AA00' }
    },
    {
      title: 'Open Opportunities',
      type: 'metric',
      object: 'opportunity',
      filter: { stage: { $nin: ['closed_won', 'closed_lost'] } },
      aggregate: 'count',
      layout: { x: 6, y: 0, w: 3, h: 2 },
      options: { color: '#FFA500' }
    },
    {
      title: 'Win Rate',
      type: 'metric',
      object: 'opportunity',
      filter: { close_date: { $gte: '{current_quarter_start}' } },
      valueField: 'stage',
      aggregate: 'count',
      layout: { x: 9, y: 0, w: 3, h: 2 },
      options: { suffix: '%', color: '#9370DB' }
    },
    
    // Row 2: Pipeline Analysis
    {
      title: 'Pipeline by Stage',
      type: 'funnel',
      object: 'opportunity',
      filter: { stage: { $nin: ['closed_won', 'closed_lost'] } },
      categoryField: 'stage',
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 0, y: 2, w: 6, h: 4 },
      options: { showValues: true }
    },
    {
      title: 'Opportunities by Owner',
      type: 'bar',
      object: 'opportunity',
      filter: { stage: { $nin: ['closed_won', 'closed_lost'] } },
      categoryField: 'owner',
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 6, y: 2, w: 6, h: 4 },
      options: { horizontal: true }
    },
    
    // Row 3: Trends
    {
      title: 'Monthly Revenue Trend',
      type: 'line',
      object: 'opportunity',
      filter: { stage: 'closed_won', close_date: { $gte: '{last_12_months}' } },
      categoryField: 'close_date',
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 0, y: 6, w: 8, h: 4 },
      options: { dateGranularity: 'month', showTrend: true }
    },
    {
      title: 'Top Opportunities',
      type: 'table',
      object: 'opportunity',
      filter: { stage: { $nin: ['closed_won', 'closed_lost'] } },
      aggregate: 'count',
      layout: { x: 8, y: 6, w: 4, h: 4 },
      options: {
        columns: ['name', 'amount', 'stage', 'close_date'],
        sortBy: 'amount',
        sortOrder: 'desc',
        limit: 10,
      }
    },
  ]
};
