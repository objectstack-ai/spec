import type { Security } from '@objectstack/spec';

export const SalesRepProfile: Security.PermissionSet = {
  name: 'sales_rep',
  label: 'Sales Representative',
  isProfile: true,
  objects: {
    lead:        { allowCreate: true,  allowRead: true,  allowEdit: true,  allowDelete: false, viewAllRecords: false, modifyAllRecords: false },
    account:     { allowCreate: true,  allowRead: true,  allowEdit: true,  allowDelete: false, viewAllRecords: false, modifyAllRecords: false },
    contact:     { allowCreate: true,  allowRead: true,  allowEdit: true,  allowDelete: false, viewAllRecords: false, modifyAllRecords: false },
    opportunity: { allowCreate: true,  allowRead: true,  allowEdit: true,  allowDelete: false, viewAllRecords: false, modifyAllRecords: false },
    quote:       { allowCreate: true,  allowRead: true,  allowEdit: true,  allowDelete: false, viewAllRecords: false, modifyAllRecords: false },
    contract:    { allowCreate: false, allowRead: true,  allowEdit: false, allowDelete: false, viewAllRecords: false, modifyAllRecords: false },
    product:     { allowCreate: false, allowRead: true,  allowEdit: false, allowDelete: false, viewAllRecords: true,  modifyAllRecords: false },
    campaign:    { allowCreate: false, allowRead: true,  allowEdit: false, allowDelete: false, viewAllRecords: true,  modifyAllRecords: false },
    case:        { allowCreate: false, allowRead: true,  allowEdit: false, allowDelete: false, viewAllRecords: false, modifyAllRecords: false },
    task:        { allowCreate: true,  allowRead: true,  allowEdit: true,  allowDelete: true,  viewAllRecords: false, modifyAllRecords: false },
  },
  fields: {
    'account.annual_revenue': { readable: true, editable: false },
    'account.description':    { readable: true, editable: true },
    'opportunity.amount':     { readable: true, editable: true },
    'opportunity.probability': { readable: true, editable: true },
  },
};
