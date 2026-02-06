import type { ReportInput } from '@objectstack/spec/ui';

export const AccountsByIndustryTypeReport: ReportInput = {
  name: 'accounts_by_industry_type',
  label: 'Accounts by Industry and Type',
  description: 'Matrix report showing accounts by industry and type',
  objectName: 'account',
  type: 'matrix',
  columns: [
    { field: 'name', aggregate: 'count' },
    { field: 'annual_revenue', aggregate: 'sum' },
  ],
  groupingsDown: [{ field: 'industry', sortOrder: 'asc' }],
  groupingsAcross: [{ field: 'type', sortOrder: 'asc' }],
  filter: { is_active: true },
};
