/** Share accounts with sales managers/directors based on customer status */
export const AccountTeamSharingRule = {
  name: 'account_team_sharing',
  label: 'Account Team Sharing',
  object: 'account',
  type: 'criteria' as const,
  condition: 'type = "customer" AND is_active = true',
  accessLevel: 'edit',
  sharedWith: { type: 'role', value: 'sales_manager' },
};

/** Territory-Based Sharing (criteria-based, by billing country) */
export const TerritorySharingRules = [
  {
    name: 'north_america_territory',
    label: 'North America Territory',
    object: 'account',
    type: 'criteria' as const,
    condition: 'billing_country IN ("US", "CA", "MX")',
    accessLevel: 'edit',
    sharedWith: { type: 'role', value: 'na_sales_team' },
  },
  {
    name: 'europe_territory',
    label: 'Europe Territory',
    object: 'account',
    type: 'criteria' as const,
    condition: 'billing_country IN ("UK", "DE", "FR", "IT", "ES")',
    accessLevel: 'edit',
    sharedWith: { type: 'role', value: 'eu_sales_team' },
  },
];
