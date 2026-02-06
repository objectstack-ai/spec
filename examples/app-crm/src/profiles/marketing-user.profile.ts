import type { Security } from '@objectstack/spec';

export const MarketingUserProfile: Security.PermissionSet = {
  name: 'marketing_user',
  label: 'Marketing User',
  isProfile: true,
  objects: {
    lead:        { allowCreate: true,  allowRead: true,  allowEdit: true,  allowDelete: false, viewAllRecords: true,  modifyAllRecords: false },
    account:     { allowCreate: false, allowRead: true,  allowEdit: false, allowDelete: false, viewAllRecords: true,  modifyAllRecords: false },
    contact:     { allowCreate: true,  allowRead: true,  allowEdit: true,  allowDelete: false, viewAllRecords: true,  modifyAllRecords: false },
    campaign:    { allowCreate: true,  allowRead: true,  allowEdit: true,  allowDelete: false, viewAllRecords: true,  modifyAllRecords: false },
    opportunity: { allowCreate: false, allowRead: true,  allowEdit: false, allowDelete: false, viewAllRecords: false, modifyAllRecords: false },
  },
};
