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
 * by `RLSCompiler`. The active organization is exposed under
 * `current_user.organization_id` (sourced from
 * `ExecutionContext.tenantId` at request time) — there is no rewrite
 * step or `tenantField` indirection in SecurityPlugin. Schemas with a
 * different physical tenant column should fork these defaults.
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
        using: 'organization_id = current_user.organization_id',
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
      // ── better-auth system tables that lack `organization_id` and would
      //    otherwise be left unprotected by the wildcard rule above. ────
      {
        name: 'sys_organization_self',
        object: 'sys_organization',
        operation: 'all',
        using: 'id = current_user.organization_id',
      },
      {
        name: 'sys_user_self',
        object: 'sys_user',
        operation: 'select',
        using: 'id = current_user.id',
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
        using: 'organization_id = current_user.organization_id',
      },
      {
        name: 'sys_organization_self',
        object: 'sys_organization',
        operation: 'select',
        using: 'id = current_user.organization_id',
      },
      {
        name: 'sys_user_self',
        object: 'sys_user',
        operation: 'select',
        using: 'id = current_user.id',
      },
    ],
  }),
];
