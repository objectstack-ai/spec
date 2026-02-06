import type { Profile } from '@objectstack/spec/security';

export const MarketingUserProfile: Profile = {
  name: 'marketing_user',
  label: 'Marketing User',
  description: 'Marketing user with access to campaigns and leads',
  objectPermissions: {
    lead:        { create: true,  read: true,  update: true,  delete: false, viewAll: true,  modifyAll: false },
    account:     { create: false, read: true,  update: false, delete: false, viewAll: true,  modifyAll: false },
    contact:     { create: true,  read: true,  update: true,  delete: false, viewAll: true,  modifyAll: false },
    campaign:    { create: true,  read: true,  update: true,  delete: false, viewAll: true,  modifyAll: false },
    opportunity: { create: false, read: true,  update: false, delete: false, viewAll: false, modifyAll: false },
  },
  fieldPermissions: {},
  tabVisibility: {
    campaign: 'default', lead: 'default', contact: 'default',
    account: 'available', opportunity: 'available',
  },
  recordTypeVisibility: {},
  applicationVisibility: { crm_example: true },
};
