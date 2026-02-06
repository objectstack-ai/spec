export const SalesManagerProfile = {
  name: 'sales_manager',
  label: 'Sales Manager',
  isProfile: true,
  objects: {
    lead:        { allowCreate: true,  allowRead: true, allowEdit: true,  allowDelete: true,  viewAllRecords: true,  modifyAllRecords: true },
    account:     { allowCreate: true,  allowRead: true, allowEdit: true,  allowDelete: true,  viewAllRecords: true,  modifyAllRecords: true },
    contact:     { allowCreate: true,  allowRead: true, allowEdit: true,  allowDelete: true,  viewAllRecords: true,  modifyAllRecords: true },
    opportunity: { allowCreate: true,  allowRead: true, allowEdit: true,  allowDelete: true,  viewAllRecords: true,  modifyAllRecords: true },
    quote:       { allowCreate: true,  allowRead: true, allowEdit: true,  allowDelete: true,  viewAllRecords: true,  modifyAllRecords: true },
    contract:    { allowCreate: true,  allowRead: true, allowEdit: true,  allowDelete: false, viewAllRecords: true,  modifyAllRecords: false },
    product:     { allowCreate: true,  allowRead: true, allowEdit: true,  allowDelete: false, viewAllRecords: true,  modifyAllRecords: false },
    campaign:    { allowCreate: true,  allowRead: true, allowEdit: true,  allowDelete: false, viewAllRecords: true,  modifyAllRecords: false },
    case:        { allowCreate: false, allowRead: true, allowEdit: false, allowDelete: false, viewAllRecords: true,  modifyAllRecords: false },
    task:        { allowCreate: true,  allowRead: true, allowEdit: true,  allowDelete: true,  viewAllRecords: true,  modifyAllRecords: true },
  },
};
