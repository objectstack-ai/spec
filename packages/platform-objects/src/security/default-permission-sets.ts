// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { PermissionSetSchema, type PermissionSet } from '@objectstack/spec/security';

/**
 * Default permission sets seeded by the platform.
 *
 * These are referenced by name (`admin_full_access`, `member_default`,
 * `viewer_readonly`) from `sys_role_permission_set` rows or assigned
 * directly to users via `sys_user_permission_set`.
 *
 * The runtime SecurityPlugin reads these via the metadata service when a
 * permission set name appears in the request `ExecutionContext.permissions[]`.
 *
 * Each entry is run through `PermissionSetSchema.parse(...)` so Zod fills
 * in the boolean/`priority`/`enabled` defaults — keeping the literal
 * source readable while still satisfying the strict output type.
 *
 * `objects: { '*': … }` uses the wildcard sentinel honoured by
 * `PermissionEvaluator` — admins do not need an explicit row per object.
 *
 * RLS policies use the canonical `current_user.*` placeholders compiled
 * by `RLSCompiler`. The default tenant column is `organization_id` so the
 * SecurityPlugin's `tenantField` config (defaults to `organization_id`)
 * rewrites `tenant_id = current_user.tenant_id` accordingly at runtime.
 */
export const defaultPermissionSets: PermissionSet[] = [
  PermissionSetSchema.parse({
    name: 'admin_full_access',
    label: 'Administrator — Full Access',
    isProfile: true,
    objects: {
      '*': {
        allowRead: true,
        allowCreate: true,
        allowEdit: true,
        allowDelete: true,
        viewAllRecords: true,
        modifyAllRecords: true,
      },
    },
    systemPermissions: ['manage_users', 'manage_metadata', 'setup.access'],
  }),
  PermissionSetSchema.parse({
    name: 'member_default',
    label: 'Member — Standard Access',
    isProfile: true,
    objects: {
      '*': {
        allowRead: true,
        allowCreate: true,
        allowEdit: true,
        allowDelete: true,
      },
    },
    rowLevelSecurity: [
      {
        name: 'tenant_isolation',
        object: '*',
        operation: 'all',
        using: 'tenant_id = current_user.tenant_id',
      },
      {
        name: 'owner_only_writes',
        object: '*',
        operation: 'update',
        using: 'owner_id = current_user.id',
      },
      {
        name: 'owner_only_deletes',
        object: '*',
        operation: 'delete',
        using: 'owner_id = current_user.id',
      },
    ],
  }),
  PermissionSetSchema.parse({
    name: 'viewer_readonly',
    label: 'Viewer — Read-Only',
    isProfile: true,
    objects: {
      '*': {
        allowRead: true,
        allowCreate: false,
        allowEdit: false,
        allowDelete: false,
      },
    },
    rowLevelSecurity: [
      {
        name: 'tenant_isolation',
        object: '*',
        operation: 'select',
        using: 'tenant_id = current_user.tenant_id',
      },
    ],
  }),
];
