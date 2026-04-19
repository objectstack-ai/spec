// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * sys_environment_database — Control Plane Physical Database Mapping
 *
 * One row per environment, mapping an environment to the physical
 * database (Turso/libSQL/Postgres/SQLite/…) that backs it.
 *
 * The `environment_id` is UNIQUE — there is always **exactly one**
 * database per environment.
 *
 * Credentials live in the separate `sys_database_credential` table so
 * they can be rotated without touching the addressing record.
 *
 * @namespace sys
 */
export const SysEnvironmentDatabase = ObjectSchema.create({
  namespace: 'sys',
  name: 'environment_database',
  label: 'Environment Database',
  pluralLabel: 'Environment Databases',
  icon: 'database',
  isSystem: true,
  description: 'Physical database mapping for each environment (one-to-one with sys_environment).',
  titleFormat: '{database_name}',
  compactLayout: ['database_name', 'environment_id', 'driver', 'region'],

  fields: {
    id: Field.text({
      label: 'Mapping ID',
      required: true,
      readonly: true,
      description: 'UUID of the environment-database mapping.',
    }),

    created_at: Field.datetime({
      label: 'Created At',
      defaultValue: 'NOW()',
      readonly: true,
      description: 'Creation timestamp.',
    }),

    updated_at: Field.datetime({
      label: 'Updated At',
      defaultValue: 'NOW()',
      readonly: true,
      description: 'Last update timestamp.',
    }),

    environment_id: Field.text({
      label: 'Environment ID',
      required: true,
      description: 'Foreign key to sys_environment (UNIQUE — one DB per environment).',
    }),

    database_name: Field.text({
      label: 'Database Name',
      required: true,
      maxLength: 255,
      description: 'Physical database name (immutable once provisioned).',
    }),

    database_url: Field.url({
      label: 'Database URL',
      required: true,
      description: 'Full connection URL (e.g. libsql://env-{uuid}.turso.io, postgres://…).',
    }),

    driver: Field.text({
      label: 'Driver',
      required: true,
      maxLength: 50,
      description: 'Data-plane driver key (turso, libsql, sqlite, postgres, …).',
    }),

    region: Field.text({
      label: 'Region',
      required: true,
      maxLength: 100,
      description: 'Region of the physical database (used for latency-aware routing).',
    }),

    storage_limit_mb: Field.number({
      label: 'Storage Limit (MB)',
      required: true,
      defaultValue: 1024,
      description: 'Storage quota in megabytes.',
    }),

    provisioned_at: Field.datetime({
      label: 'Provisioned At',
      required: true,
      defaultValue: 'NOW()',
      description: 'When the physical database was provisioned.',
    }),

    last_accessed_at: Field.datetime({
      label: 'Last Accessed At',
      required: false,
      description: 'Last successful access (populated by the router for cache invalidation).',
    }),

    metadata: Field.textarea({
      label: 'Metadata',
      required: false,
      description: 'JSON-serialized free-form metadata (replica topology, group, backup policy, …).',
    }),
  },

  indexes: [
    { fields: ['environment_id'], unique: true },
    { fields: ['database_name'], unique: true },
    { fields: ['driver'] },
    { fields: ['region'] },
  ],

  enable: {
    trackHistory: true,
    searchable: true,
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update'],
    trash: false,
    mru: true,
  },
});
