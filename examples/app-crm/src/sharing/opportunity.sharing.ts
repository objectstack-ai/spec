/** Share high-value open opportunities with management */
export const OpportunitySalesSharingRule = {
  name: 'opportunity_sales_sharing',
  label: 'Opportunity Sales Team Sharing',
  object: 'opportunity',
  type: 'criteria' as const,
  condition: 'stage NOT IN ("closed_won", "closed_lost") AND amount >= 100000',
  accessLevel: 'read',
  sharedWith: { type: 'role_and_subordinates', value: 'sales_director' },
};
