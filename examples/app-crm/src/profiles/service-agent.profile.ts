import type { Security } from '@objectstack/spec';

export const ServiceAgentProfile: Security.PermissionSet = {
  name: 'service_agent',
  label: 'Service Agent',
  isProfile: true,
  objects: {
    lead:        { allowCreate: false, allowRead: true,  allowEdit: false, allowDelete: false, viewAllRecords: false, modifyAllRecords: false },
    account:     { allowCreate: false, allowRead: true,  allowEdit: false, allowDelete: false, viewAllRecords: false, modifyAllRecords: false },
    contact:     { allowCreate: false, allowRead: true,  allowEdit: true,  allowDelete: false, viewAllRecords: false, modifyAllRecords: false },
    opportunity: { allowCreate: false, allowRead: false, allowEdit: false, allowDelete: false, viewAllRecords: false, modifyAllRecords: false },
    case:        { allowCreate: true,  allowRead: true,  allowEdit: true,  allowDelete: false, viewAllRecords: false, modifyAllRecords: false },
    task:        { allowCreate: true,  allowRead: true,  allowEdit: true,  allowDelete: true,  viewAllRecords: false, modifyAllRecords: false },
    product:     { allowCreate: false, allowRead: true,  allowEdit: false, allowDelete: false, viewAllRecords: true,  modifyAllRecords: false },
  },
  fields: {
    'case.is_sla_violated':        { readable: true, editable: false },
    'case.resolution_time_hours':  { readable: true, editable: false },
  },
};
