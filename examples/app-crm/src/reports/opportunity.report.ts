// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { ReportInput } from '@objectstack/spec/ui';

export const OpportunitiesByStageReport: ReportInput = {
  name: 'opportunities_by_stage',
  label: 'Opportunities by Stage',
  description: 'Summary of opportunities grouped by stage',
  objectName: 'opportunity',
  type: 'summary',
  columns: [
    { field: 'name', label: 'Opportunity Name' },
    { field: 'account', label: 'Account' },
    { field: 'amount', label: 'Amount', aggregate: 'sum' },
    { field: 'close_date', label: 'Close Date' },
    { field: 'probability', label: 'Probability', aggregate: 'avg' },
  ],
  groupingsDown: [{ field: 'stage', sortOrder: 'asc' }],
  filter: { stage: { $ne: 'closed_lost' }, close_date: { $gte: '{current_year_start}' } },
  chart: { type: 'bar', title: 'Pipeline by Stage', showLegend: true, xAxis: 'stage', yAxis: 'amount' }
};

export const WonOpportunitiesByOwnerReport: ReportInput = {
  name: 'won_opportunities_by_owner',
  label: 'Won Opportunities by Owner',
  description: 'Closed won opportunities grouped by owner',
  objectName: 'opportunity',
  type: 'summary',
  columns: [
    { field: 'name', label: 'Opportunity Name' },
    { field: 'account', label: 'Account' },
    { field: 'amount', label: 'Amount', aggregate: 'sum' },
    { field: 'close_date', label: 'Close Date' },
  ],
  groupingsDown: [{ field: 'owner', sortOrder: 'desc' }],
  filter: { stage: 'closed_won' },
  chart: { type: 'column', title: 'Revenue by Sales Rep', showLegend: false, xAxis: 'owner', yAxis: 'amount' }
};
