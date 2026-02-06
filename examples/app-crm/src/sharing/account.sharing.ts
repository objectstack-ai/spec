import type { SharingRule } from '@objectstack/spec/security';

/** Share accounts with sales managers/directors */
export const AccountTeamSharingRule: SharingRule = {
  name: 'account_team_sharing',
  label: 'Account Team Sharing',
  objectName: 'account',
  type: 'criteria_based',
  criteria: { type: { $eq: 'customer' }, is_active: { $eq: true } },
  sharedWith: { type: 'role', roles: ['sales_manager', 'sales_director'] },
  accessLevel: 'read_write',
  includeRelatedObjects: [
    { objectName: 'contact', accessLevel: 'read_only' },
    { objectName: 'opportunity', accessLevel: 'read_only' },
  ],
};

/** Territory-Based Sharing */
export const TerritorySharingRules = [
  {
    name: 'north_america_territory',
    label: 'North America Territory',
    objectName: 'account',
    type: 'territory_based',
    criteria: { billing_address: { country: { $in: ['US', 'CA', 'MX'] } } },
    sharedWith: { type: 'territory', territory: 'north_america' },
    accessLevel: 'read_write',
  },
  {
    name: 'europe_territory',
    label: 'Europe Territory',
    objectName: 'account',
    type: 'territory_based',
    criteria: { billing_address: { country: { $in: ['UK', 'DE', 'FR', 'IT', 'ES'] } } },
    sharedWith: { type: 'territory', territory: 'europe' },
    accessLevel: 'read_write',
  },
];
