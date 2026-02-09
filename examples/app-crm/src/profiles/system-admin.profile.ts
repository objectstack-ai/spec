// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

export const SystemAdminProfile = {
  name: 'system_admin',
  label: 'System Administrator',
  isProfile: true,
  objects: {
    lead:        { allowCreate: true, allowRead: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
    account:     { allowCreate: true, allowRead: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
    contact:     { allowCreate: true, allowRead: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
    opportunity: { allowCreate: true, allowRead: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
    quote:       { allowCreate: true, allowRead: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
    contract:    { allowCreate: true, allowRead: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
    product:     { allowCreate: true, allowRead: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
    campaign:    { allowCreate: true, allowRead: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
    case:        { allowCreate: true, allowRead: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
    task:        { allowCreate: true, allowRead: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
  },
  systemPermissions: [
    'view_setup', 'manage_users', 'customize_application',
    'view_all_data', 'modify_all_data', 'manage_profiles',
    'manage_roles', 'manage_sharing',
  ],
};
