// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/** CRM Role Hierarchy */
export const RoleHierarchy = {
  name: 'crm_role_hierarchy',
  label: 'CRM Role Hierarchy',
  roles: [
    { name: 'executive',          label: 'Executive',            parentRole: null },
    { name: 'sales_director',     label: 'Sales Director',       parentRole: 'executive' },
    { name: 'sales_manager',      label: 'Sales Manager',        parentRole: 'sales_director' },
    { name: 'sales_rep',          label: 'Sales Representative', parentRole: 'sales_manager' },
    { name: 'service_director',   label: 'Service Director',     parentRole: 'executive' },
    { name: 'service_manager',    label: 'Service Manager',      parentRole: 'service_director' },
    { name: 'service_agent',      label: 'Service Agent',        parentRole: 'service_manager' },
    { name: 'marketing_director', label: 'Marketing Director',   parentRole: 'executive' },
    { name: 'marketing_manager',  label: 'Marketing Manager',    parentRole: 'marketing_director' },
    { name: 'marketing_user',     label: 'Marketing User',       parentRole: 'marketing_manager' },
  ],
};
