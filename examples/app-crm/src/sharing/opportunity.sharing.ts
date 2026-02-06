import type { SharingRule } from '@objectstack/spec/security';

/** Share high-value open opportunities with management */
export const OpportunitySalesSharingRule: SharingRule = {
  name: 'opportunity_sales_sharing',
  label: 'Opportunity Sales Team Sharing',
  objectName: 'opportunity',
  type: 'criteria_based',
  criteria: { stage: { $nin: ['closed_won', 'closed_lost'] }, amount: { $gte: 100000 } },
  sharedWith: { type: 'role', roles: ['sales_manager', 'sales_director', 'executive'] },
  accessLevel: 'read_only',
};
