import type { SharingRule } from '@objectstack/spec/security';

/**
 * CRM Sharing Rules
 * Define organization-wide sharing defaults and sharing rules
 */

// Organization-Wide Defaults (OWD)
export const OrganizationDefaults = {
  lead: {
    internalAccess: 'private',
    externalAccess: 'private',
  },
  account: {
    internalAccess: 'private',
    externalAccess: 'private',
  },
  contact: {
    internalAccess: 'controlled_by_parent', // Controlled by Account
    externalAccess: 'private',
  },
  opportunity: {
    internalAccess: 'private',
    externalAccess: 'private',
  },
  case: {
    internalAccess: 'private',
    externalAccess: 'private',
  },
  campaign: {
    internalAccess: 'public_read_only',
    externalAccess: 'private',
  },
  product: {
    internalAccess: 'public_read_only',
    externalAccess: 'private',
  },
  task: {
    internalAccess: 'private',
    externalAccess: 'private',
  },
};

// Account Sharing Rule - Share accounts with team
export const AccountTeamSharingRule: SharingRule = {
  name: 'account_team_sharing',
  label: 'Account Team Sharing',
  objectName: 'account',
  type: 'criteria_based',
  
  criteria: {
    type: { $eq: 'customer' },
    is_active: { $eq: true },
  },
  
  sharedWith: {
    type: 'role',
    roles: ['sales_manager', 'sales_director'],
  },
  
  accessLevel: 'read_write',
  
  includeRelatedObjects: [
    { objectName: 'contact', accessLevel: 'read_only' },
    { objectName: 'opportunity', accessLevel: 'read_only' },
  ],
};

// Opportunity Sharing Rule - Share with sales team
export const OpportunitySalesSharingRule: SharingRule = {
  name: 'opportunity_sales_sharing',
  label: 'Opportunity Sales Team Sharing',
  objectName: 'opportunity',
  type: 'criteria_based',
  
  criteria: {
    stage: { $nin: ['closed_won', 'closed_lost'] },
    amount: { $gte: 100000 }, // High-value opportunities
  },
  
  sharedWith: {
    type: 'role',
    roles: ['sales_manager', 'sales_director', 'executive'],
  },
  
  accessLevel: 'read_only',
};

// Case Sharing Rule - Share escalated cases
export const CaseEscalationSharingRule: SharingRule = {
  name: 'case_escalation_sharing',
  label: 'Escalated Cases Sharing',
  objectName: 'case',
  type: 'criteria_based',
  
  criteria: {
    priority: 'critical',
    is_closed: false,
  },
  
  sharedWith: {
    type: 'role_and_subordinates',
    roles: ['service_manager'],
  },
  
  accessLevel: 'read_write',
};

// Territory-Based Sharing
export const TerritorySharingRules = [
  {
    name: 'north_america_territory',
    label: 'North America Territory',
    objectName: 'account',
    type: 'territory_based',
    
    criteria: {
      billing_address: {
        country: { $in: ['US', 'CA', 'MX'] },
      },
    },
    
    sharedWith: {
      type: 'territory',
      territory: 'north_america',
    },
    
    accessLevel: 'read_write',
  },
  {
    name: 'europe_territory',
    label: 'Europe Territory',
    objectName: 'account',
    type: 'territory_based',
    
    criteria: {
      billing_address: {
        country: { $in: ['UK', 'DE', 'FR', 'IT', 'ES'] },
      },
    },
    
    sharedWith: {
      type: 'territory',
      territory: 'europe',
    },
    
    accessLevel: 'read_write',
  },
];

// Role Hierarchy
export const RoleHierarchy = {
  name: 'crm_role_hierarchy',
  label: 'CRM Role Hierarchy',
  roles: [
    {
      name: 'executive',
      label: 'Executive',
      parentRole: null,
    },
    {
      name: 'sales_director',
      label: 'Sales Director',
      parentRole: 'executive',
    },
    {
      name: 'sales_manager',
      label: 'Sales Manager',
      parentRole: 'sales_director',
    },
    {
      name: 'sales_rep',
      label: 'Sales Representative',
      parentRole: 'sales_manager',
    },
    {
      name: 'service_director',
      label: 'Service Director',
      parentRole: 'executive',
    },
    {
      name: 'service_manager',
      label: 'Service Manager',
      parentRole: 'service_director',
    },
    {
      name: 'service_agent',
      label: 'Service Agent',
      parentRole: 'service_manager',
    },
    {
      name: 'marketing_director',
      label: 'Marketing Director',
      parentRole: 'executive',
    },
    {
      name: 'marketing_manager',
      label: 'Marketing Manager',
      parentRole: 'marketing_director',
    },
    {
      name: 'marketing_user',
      label: 'Marketing User',
      parentRole: 'marketing_manager',
    },
  ],
};

export const CrmSharingRules = {
  OrganizationDefaults,
  AccountTeamSharingRule,
  OpportunitySalesSharingRule,
  CaseEscalationSharingRule,
  TerritorySharingRules,
  RoleHierarchy,
};
