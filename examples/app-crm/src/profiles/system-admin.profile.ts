import type { Profile } from '@objectstack/spec/security';

export const SystemAdminProfile: Profile = {
  name: 'system_admin',
  label: 'System Administrator',
  description: 'Full system administrator with all permissions',
  objectPermissions: {
    '*': { create: true, read: true, update: true, delete: true, viewAll: true, modifyAll: true },
  },
  fieldPermissions: {},
  tabVisibility: { '*': 'default' },
  recordTypeVisibility: {},
  applicationVisibility: { '*': true },
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
