import type { Profile } from '@objectstack/spec/security';

export const SalesRepProfile: Profile = {
  name: 'sales_rep',
  label: 'Sales Representative',
  description: 'Standard sales rep with access to sales objects',
  objectPermissions: {
    lead:        { create: true,  read: true,  update: true,  delete: false, viewAll: false, modifyAll: false },
    account:     { create: true,  read: true,  update: true,  delete: false, viewAll: false, modifyAll: false },
    contact:     { create: true,  read: true,  update: true,  delete: false, viewAll: false, modifyAll: false },
    opportunity: { create: true,  read: true,  update: true,  delete: false, viewAll: false, modifyAll: false },
    quote:       { create: true,  read: true,  update: true,  delete: false, viewAll: false, modifyAll: false },
    contract:    { create: false, read: true,  update: false, delete: false, viewAll: false, modifyAll: false },
    product:     { create: false, read: true,  update: false, delete: false, viewAll: true,  modifyAll: false },
    campaign:    { create: false, read: true,  update: false, delete: false, viewAll: true,  modifyAll: false },
    case:        { create: false, read: true,  update: false, delete: false, viewAll: false, modifyAll: false },
    task:        { create: true,  read: true,  update: true,  delete: true,  viewAll: false, modifyAll: false },
  },
  fieldPermissions: {
    account:     { annual_revenue: { read: true, update: false }, description: { read: true, update: true } },
    opportunity: { amount: { read: true, update: true }, probability: { read: true, update: true } },
  },
  tabVisibility: {
    lead: 'default', account: 'default', contact: 'default', opportunity: 'default',
    quote: 'default', product: 'available', campaign: 'available', case: 'hidden',
  },
  recordTypeVisibility: {},
  applicationVisibility: { crm_example: true },
};
