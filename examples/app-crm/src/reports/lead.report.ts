import type { ReportInput } from '@objectstack/spec/ui';

export const LeadsBySourceReport: ReportInput = {
  name: 'leads_by_source',
  label: 'Leads by Source and Status',
  description: 'Lead pipeline analysis',
  objectName: 'lead',
  type: 'summary',
  columns: [
    { field: 'full_name', label: 'Name' },
    { field: 'company', label: 'Company' },
    { field: 'rating', label: 'Rating' },
  ],
  groupingsDown: [
    { field: 'lead_source', sortOrder: 'asc' },
    { field: 'status', sortOrder: 'asc' },
  ],
  filter: { is_converted: false },
  chart: { type: 'pie', title: 'Leads by Source', showLegend: true, xAxis: 'lead_source', yAxis: 'full_name' }
};
