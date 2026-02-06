import type { ReportInput } from '@objectstack/spec/ui';

export const CasesByStatusPriorityReport: ReportInput = {
  name: 'cases_by_status_priority',
  label: 'Cases by Status and Priority',
  description: 'Summary of cases by status and priority',
  objectName: 'case',
  type: 'summary',
  columns: [
    { field: 'case_number', label: 'Case Number' },
    { field: 'subject', label: 'Subject' },
    { field: 'account', label: 'Account' },
    { field: 'owner', label: 'Owner' },
    { field: 'resolution_time_hours', label: 'Resolution Time', aggregate: 'avg' },
  ],
  groupingsDown: [
    { field: 'status', sortOrder: 'asc' },
    { field: 'priority', sortOrder: 'desc' },
  ],
  chart: { type: 'bar', title: 'Cases by Status', showLegend: true, xAxis: 'status', yAxis: 'case_number' }
};

export const SlaPerformanceReport: ReportInput = {
  name: 'sla_performance',
  label: 'SLA Performance Report',
  description: 'Analysis of SLA compliance',
  objectName: 'case',
  type: 'summary',
  columns: [
    { field: 'case_number', aggregate: 'count' },
    { field: 'is_sla_violated', label: 'SLA Violated', aggregate: 'count' },
    { field: 'resolution_time_hours', label: 'Avg Resolution Time', aggregate: 'avg' },
  ],
  groupingsDown: [{ field: 'priority', sortOrder: 'desc' }],
  filter: { is_closed: true },
  chart: { type: 'column', title: 'SLA Violations by Priority', showLegend: false, xAxis: 'priority', yAxis: 'is_sla_violated' }
};
