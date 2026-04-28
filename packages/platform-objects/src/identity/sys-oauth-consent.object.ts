// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * sys_oauth_consent — Recorded user consent for an OAuth client + scopes
 *
 * Backed by better-auth's `oidc-provider` plugin. When a user consents to a
 * client requesting a particular set of scopes, the decision is persisted
 * here so future authorization requests for the same client+scopes can skip
 * the consent screen.
 *
 * @namespace sys
 */
export const SysOauthConsent = ObjectSchema.create({
  name: 'sys_oauth_consent',
  label: 'OAuth Consent',
  pluralLabel: 'OAuth Consents',
  icon: 'shield-check',
  isSystem: true,
  description: 'User consent records for OAuth client applications',
  compactLayout: ['client_id', 'user_id', 'consent_given'],

  fields: {
    id: Field.text({
      label: 'ID',
      required: true,
      readonly: true,
    }),

    client_id: Field.text({
      label: 'Client ID',
      required: true,
      description: 'Foreign key to sys_oauth_application.client_id',
    }),

    user_id: Field.text({
      label: 'User ID',
      required: true,
      description: 'Foreign key to sys_user.id',
    }),

    scopes: Field.text({
      label: 'Scopes',
      required: false,
      maxLength: 1024,
    }),

    consent_given: Field.boolean({
      label: 'Consent Given',
      required: true,
      defaultValue: false,
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
  },

  indexes: [
    { fields: ['client_id'] },
    { fields: ['user_id'] },
  ],

  enable: {
    trackHistory: false,
    searchable: false,
    apiEnabled: false,
    apiMethods: [],
    trash: false,
    mru: false,
  },
});
