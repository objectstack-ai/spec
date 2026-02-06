import type { Profile } from '@objectstack/spec/security';

export const ServiceAgentProfile: Profile = {
  name: 'service_agent',
  label: 'Service Agent',
  description: 'Customer service agent with access to support objects',
  objectPermissions: {
    lead:        { create: false, read: true,  update: false, delete: false, viewAll: false, modifyAll: false },
    account:     { create: false, read: true,  update: false, delete: false, viewAll: false, modifyAll: false },
    contact:     { create: false, read: true,  update: true,  delete: false, viewAll: false, modifyAll: false },
    opportunity: { create: false, read: false, update: false, delete: false, viewAll: false, modifyAll: false },
    case:        { create: true,  read: true,  update: true,  delete: false, viewAll: false, modifyAll: false },
    task:        { create: true,  read: true,  update: true,  delete: true,  viewAll: false, modifyAll: false },
    product:     { create: false, read: true,  update: false, delete: false, viewAll: true,  modifyAll: false },
  },
  fieldPermissions: {
    case: { is_sla_violated: { read: true, update: false }, resolution_time_hours: { read: true, update: false } },
  },
  tabVisibility: {
    case: 'default', task: 'default', account: 'available', contact: 'available',
    product: 'available', lead: 'hidden', opportunity: 'hidden',
  },
  recordTypeVisibility: {},
  applicationVisibility: { crm_example: true },
};
