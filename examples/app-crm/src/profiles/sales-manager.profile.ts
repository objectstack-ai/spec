import type { Profile } from '@objectstack/spec/security';

export const SalesManagerProfile: Profile = {
  name: 'sales_manager',
  label: 'Sales Manager',
  description: 'Sales manager with full access to sales objects',
  objectPermissions: {
    lead:        { create: true,  read: true, update: true,  delete: true,  viewAll: true,  modifyAll: true },
    account:     { create: true,  read: true, update: true,  delete: true,  viewAll: true,  modifyAll: true },
    contact:     { create: true,  read: true, update: true,  delete: true,  viewAll: true,  modifyAll: true },
    opportunity: { create: true,  read: true, update: true,  delete: true,  viewAll: true,  modifyAll: true },
    quote:       { create: true,  read: true, update: true,  delete: true,  viewAll: true,  modifyAll: true },
    contract:    { create: true,  read: true, update: true,  delete: false, viewAll: true,  modifyAll: false },
    product:     { create: true,  read: true, update: true,  delete: false, viewAll: true,  modifyAll: false },
    campaign:    { create: true,  read: true, update: true,  delete: false, viewAll: true,  modifyAll: false },
    case:        { create: false, read: true, update: false, delete: false, viewAll: true,  modifyAll: false },
    task:        { create: true,  read: true, update: true,  delete: true,  viewAll: true,  modifyAll: true },
  },
  fieldPermissions: {},
  tabVisibility: {
    lead: 'default', account: 'default', contact: 'default', opportunity: 'default',
    quote: 'default', contract: 'default', product: 'default', campaign: 'default',
    case: 'available', task: 'default',
  },
  recordTypeVisibility: {},
  applicationVisibility: { crm_example: true },
};
