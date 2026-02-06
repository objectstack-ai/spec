import type { Profile } from '@objectstack/spec/security';

/**
 * CRM Security Profiles
 * Define role-based security profiles for the CRM application
 */

// Sales Representative Profile
export const SalesRepProfile: Profile = {
  name: 'sales_rep',
  label: 'Sales Representative',
  description: 'Standard sales rep with access to sales objects',
  
  objectPermissions: {
    // Sales Objects
    lead: {
      create: true,
      read: true,
      update: true,
      delete: false,
      viewAll: false,
      modifyAll: false,
    },
    account: {
      create: true,
      read: true,
      update: true,
      delete: false,
      viewAll: false,
      modifyAll: false,
    },
    contact: {
      create: true,
      read: true,
      update: true,
      delete: false,
      viewAll: false,
      modifyAll: false,
    },
    opportunity: {
      create: true,
      read: true,
      update: true,
      delete: false,
      viewAll: false,
      modifyAll: false,
    },
    quote: {
      create: true,
      read: true,
      update: true,
      delete: false,
      viewAll: false,
      modifyAll: false,
    },
    contract: {
      create: false,
      read: true,
      update: false,
      delete: false,
      viewAll: false,
      modifyAll: false,
    },
    product: {
      create: false,
      read: true,
      update: false,
      delete: false,
      viewAll: true,
      modifyAll: false,
    },
    campaign: {
      create: false,
      read: true,
      update: false,
      delete: false,
      viewAll: true,
      modifyAll: false,
    },
    // Service Objects
    case: {
      create: false,
      read: true,
      update: false,
      delete: false,
      viewAll: false,
      modifyAll: false,
    },
    task: {
      create: true,
      read: true,
      update: true,
      delete: true,
      viewAll: false,
      modifyAll: false,
    },
  },
  
  fieldPermissions: {
    account: {
      annual_revenue: { read: true, update: false },
      description: { read: true, update: true },
    },
    opportunity: {
      amount: { read: true, update: true },
      probability: { read: true, update: true },
    },
  },
  
  tabVisibility: {
    lead: 'default',
    account: 'default',
    contact: 'default',
    opportunity: 'default',
    quote: 'default',
    product: 'available',
    campaign: 'available',
    case: 'hidden',
  },
  
  recordTypeVisibility: {},
  
  applicationVisibility: {
    crm_example: true,
  },
};

// Sales Manager Profile
export const SalesManagerProfile: Profile = {
  name: 'sales_manager',
  label: 'Sales Manager',
  description: 'Sales manager with full access to sales objects',
  
  objectPermissions: {
    lead: {
      create: true,
      read: true,
      update: true,
      delete: true,
      viewAll: true,
      modifyAll: true,
    },
    account: {
      create: true,
      read: true,
      update: true,
      delete: true,
      viewAll: true,
      modifyAll: true,
    },
    contact: {
      create: true,
      read: true,
      update: true,
      delete: true,
      viewAll: true,
      modifyAll: true,
    },
    opportunity: {
      create: true,
      read: true,
      update: true,
      delete: true,
      viewAll: true,
      modifyAll: true,
    },
    quote: {
      create: true,
      read: true,
      update: true,
      delete: true,
      viewAll: true,
      modifyAll: true,
    },
    contract: {
      create: true,
      read: true,
      update: true,
      delete: false,
      viewAll: true,
      modifyAll: false,
    },
    product: {
      create: true,
      read: true,
      update: true,
      delete: false,
      viewAll: true,
      modifyAll: false,
    },
    campaign: {
      create: true,
      read: true,
      update: true,
      delete: false,
      viewAll: true,
      modifyAll: false,
    },
    case: {
      create: false,
      read: true,
      update: false,
      delete: false,
      viewAll: true,
      modifyAll: false,
    },
    task: {
      create: true,
      read: true,
      update: true,
      delete: true,
      viewAll: true,
      modifyAll: true,
    },
  },
  
  fieldPermissions: {},
  
  tabVisibility: {
    lead: 'default',
    account: 'default',
    contact: 'default',
    opportunity: 'default',
    quote: 'default',
    contract: 'default',
    product: 'default',
    campaign: 'default',
    case: 'available',
    task: 'default',
  },
  
  recordTypeVisibility: {},
  
  applicationVisibility: {
    crm_example: true,
  },
};

// Service Agent Profile
export const ServiceAgentProfile: Profile = {
  name: 'service_agent',
  label: 'Service Agent',
  description: 'Customer service agent with access to support objects',
  
  objectPermissions: {
    lead: {
      create: false,
      read: true,
      update: false,
      delete: false,
      viewAll: false,
      modifyAll: false,
    },
    account: {
      create: false,
      read: true,
      update: false,
      delete: false,
      viewAll: false,
      modifyAll: false,
    },
    contact: {
      create: false,
      read: true,
      update: true,
      delete: false,
      viewAll: false,
      modifyAll: false,
    },
    opportunity: {
      create: false,
      read: false,
      update: false,
      delete: false,
      viewAll: false,
      modifyAll: false,
    },
    case: {
      create: true,
      read: true,
      update: true,
      delete: false,
      viewAll: false,
      modifyAll: false,
    },
    task: {
      create: true,
      read: true,
      update: true,
      delete: true,
      viewAll: false,
      modifyAll: false,
    },
    product: {
      create: false,
      read: true,
      update: false,
      delete: false,
      viewAll: true,
      modifyAll: false,
    },
  },
  
  fieldPermissions: {
    case: {
      is_sla_violated: { read: true, update: false },
      resolution_time_hours: { read: true, update: false },
    },
  },
  
  tabVisibility: {
    case: 'default',
    task: 'default',
    account: 'available',
    contact: 'available',
    product: 'available',
    lead: 'hidden',
    opportunity: 'hidden',
  },
  
  recordTypeVisibility: {},
  
  applicationVisibility: {
    crm_example: true,
  },
};

// Marketing User Profile
export const MarketingUserProfile: Profile = {
  name: 'marketing_user',
  label: 'Marketing User',
  description: 'Marketing user with access to campaigns and leads',
  
  objectPermissions: {
    lead: {
      create: true,
      read: true,
      update: true,
      delete: false,
      viewAll: true,
      modifyAll: false,
    },
    account: {
      create: false,
      read: true,
      update: false,
      delete: false,
      viewAll: true,
      modifyAll: false,
    },
    contact: {
      create: true,
      read: true,
      update: true,
      delete: false,
      viewAll: true,
      modifyAll: false,
    },
    campaign: {
      create: true,
      read: true,
      update: true,
      delete: false,
      viewAll: true,
      modifyAll: false,
    },
    opportunity: {
      create: false,
      read: true,
      update: false,
      delete: false,
      viewAll: false,
      modifyAll: false,
    },
  },
  
  fieldPermissions: {},
  
  tabVisibility: {
    campaign: 'default',
    lead: 'default',
    contact: 'default',
    account: 'available',
    opportunity: 'available',
  },
  
  recordTypeVisibility: {},
  
  applicationVisibility: {
    crm_example: true,
  },
};

// System Administrator Profile
export const SystemAdminProfile: Profile = {
  name: 'system_admin',
  label: 'System Administrator',
  description: 'Full system administrator with all permissions',
  
  objectPermissions: {
    '*': {
      create: true,
      read: true,
      update: true,
      delete: true,
      viewAll: true,
      modifyAll: true,
    },
  },
  
  fieldPermissions: {},
  
  tabVisibility: {
    '*': 'default',
  },
  
  recordTypeVisibility: {},
  
  applicationVisibility: {
    '*': true,
  },
  
  systemPermissions: {
    viewSetup: true,
    manageUsers: true,
    customizeApplication: true,
    viewAllData: true,
    modifyAllData: true,
    manageProfiles: true,
    manageRoles: true,
    manageSharing: true,
  },
};

export const CrmProfiles = {
  SalesRepProfile,
  SalesManagerProfile,
  ServiceAgentProfile,
  MarketingUserProfile,
  SystemAdminProfile,
};
