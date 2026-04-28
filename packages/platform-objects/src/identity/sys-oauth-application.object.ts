// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * sys_oauth_application — Registered OAuth/OIDC client application
 *
 * Backed by better-auth's `oidc-provider` plugin. Each row represents an
 * external application that has been registered to authenticate users
 * against this ObjectStack server (acting as an OpenID Connect IdP).
 *
 * @namespace sys
 */
export const SysOauthApplication = ObjectSchema.create({
  name: 'sys_oauth_application',
  label: 'OAuth Application',
  pluralLabel: 'OAuth Applications',
  icon: 'key-round',
  isSystem: true,
  description: 'Registered OAuth/OIDC client applications',
  displayNameField: 'name',
  titleFormat: '{name}',
  compactLayout: ['name', 'client_id', 'type', 'disabled'],

  fields: {
    // ── Identity ─────────────────────────────────────────────────
    id: Field.text({
      label: 'ID',
      required: true,
      readonly: true,
      group: 'System',
    }),

    name: Field.text({
      label: 'Name',
      required: true,
      searchable: true,
      maxLength: 255,
      group: 'Identity',
    }),

    icon: Field.url({
      label: 'Icon',
      required: false,
      description: 'Logo URL shown on the consent screen',
      group: 'Identity',
    }),

    metadata: Field.textarea({
      label: 'Metadata',
      required: false,
      description: 'JSON-serialized application metadata',
      group: 'Identity',
    }),

    // ── OAuth Credentials ────────────────────────────────────────
    client_id: Field.text({
      label: 'Client ID',
      required: true,
      readonly: true,
      maxLength: 255,
      description: 'Public OAuth client identifier',
      group: 'Credentials',
    }),

    client_secret: Field.text({
      label: 'Client Secret',
      required: false,
      maxLength: 1024,
      description: 'OAuth client secret (hashed/encrypted at rest)',
      group: 'Credentials',
    }),

    redirect_urls: Field.textarea({
      label: 'Redirect URLs',
      required: true,
      description: 'Comma-separated list of allowed redirect URIs',
      group: 'Credentials',
    }),

    type: Field.select(['web', 'native', 'user-agent-based', 'public'], {
      label: 'Client Type',
      required: true,
      defaultValue: 'web',
      group: 'Credentials',
    }),

    disabled: Field.boolean({
      label: 'Disabled',
      required: false,
      defaultValue: false,
      group: 'Credentials',
    }),

    // ── Ownership ────────────────────────────────────────────────
    user_id: Field.text({
      label: 'Owner User ID',
      required: false,
      description: 'User who registered this application',
      group: 'System',
    }),

    created_at: Field.datetime({
      label: 'Created At',
      defaultValue: 'NOW()',
      readonly: true,
      group: 'System',
    }),

    updated_at: Field.datetime({
      label: 'Updated At',
      defaultValue: 'NOW()',
      readonly: true,
      group: 'System',
    }),
  },

  indexes: [
    { fields: ['client_id'], unique: true },
    { fields: ['user_id'] },
  ],

  enable: {
    trackHistory: true,
    searchable: true,
    apiEnabled: true,
    apiMethods: ['get', 'list', 'delete'],
    trash: false,
    mru: false,
  },
});
