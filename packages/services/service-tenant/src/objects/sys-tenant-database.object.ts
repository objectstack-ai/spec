// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * sys_tenant_database — Global Tenant Registry Object
 *
 * Stores tenant database configuration in the global control plane.
 * Each tenant can use different database drivers (Turso, Memory, SQL, SQLite, Custom).
 *
 * @namespace sys
 */
export const SysTenantDatabase = ObjectSchema.create({
  namespace: 'sys',
  name: 'tenant_database',
  label: 'Tenant Database',
  pluralLabel: 'Tenant Databases',
  icon: 'database',
  isSystem: true,
  description: 'Tenant database registry with flexible driver configuration',
  titleFormat: '{id}',
  compactLayout: ['id', 'organization_id', 'status', 'plan'],

  fields: {
    id: Field.text({
      label: 'Tenant ID',
      required: true,
      readonly: true,
      description: 'UUID-based tenant identifier',
    }),

    created_at: Field.datetime({
      label: 'Created At',
      defaultValue: 'NOW()',
      readonly: true,
    }),

    updated_at: Field.datetime({
      label: 'Updated At',
      defaultValue: 'NOW()',
      readonly: true,
    }),

    organization_id: Field.text({
      label: 'Organization ID',
      required: true,
      description: 'Foreign key to sys_organization',
    }),

    driver_config: Field.textarea({
      label: 'Driver Configuration',
      required: true,
      description: 'JSON-serialized driver configuration (type: turso|memory|sql|sqlite|custom)',
    }),

    status: Field.picklist({
      label: 'Status',
      required: true,
      options: [
        { value: 'provisioning', label: 'Provisioning' },
        { value: 'active', label: 'Active' },
        { value: 'suspended', label: 'Suspended' },
        { value: 'archived', label: 'Archived' },
        { value: 'failed', label: 'Failed' },
      ],
      defaultValue: 'provisioning',
    }),

    plan: Field.picklist({
      label: 'Plan',
      required: true,
      options: [
        { value: 'free', label: 'Free' },
        { value: 'starter', label: 'Starter' },
        { value: 'pro', label: 'Pro' },
        { value: 'enterprise', label: 'Enterprise' },
        { value: 'custom', label: 'Custom' },
      ],
      defaultValue: 'free',
    }),

    storage_limit_mb: Field.number({
      label: 'Storage Limit (MB)',
      required: true,
      defaultValue: 1024,
      description: 'Maximum storage allowed in megabytes',
    }),

    last_accessed_at: Field.datetime({
      label: 'Last Accessed At',
      required: false,
      description: 'Last time the tenant database was accessed',
    }),

    metadata: Field.textarea({
      label: 'Metadata',
      required: false,
      description: 'JSON-serialized custom tenant configuration',
    }),
  },

  indexes: [
    { fields: ['organization_id'] },
    { fields: ['status'] },
    { fields: ['plan'] },
  ],

  enable: {
    trackHistory: true,
    searchable: true,
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update'],
    trash: false, // Don't allow soft delete - use archive instead
    mru: true,
  },
});
