// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * sys_oauth_access_token — Issued OAuth/OIDC access + refresh token pair
 *
 * Backed by better-auth's `oidc-provider` plugin. One row per token issuance.
 * Tokens are short-lived; expired rows can be safely pruned.
 *
 * @namespace sys
 */
export const SysOauthAccessToken = ObjectSchema.create({
  name: 'sys_oauth_access_token',
  label: 'OAuth Access Token',
  pluralLabel: 'OAuth Access Tokens',
  icon: 'ticket',
  isSystem: true,
  description: 'OAuth access and refresh tokens issued to client applications',
  compactLayout: ['client_id', 'user_id', 'access_token_expires_at'],

  fields: {
    id: Field.text({
      label: 'ID',
      required: true,
      readonly: true,
    }),

    access_token: Field.text({
      label: 'Access Token',
      required: true,
      maxLength: 1024,
    }),

    refresh_token: Field.text({
      label: 'Refresh Token',
      required: true,
      maxLength: 1024,
    }),

    access_token_expires_at: Field.datetime({
      label: 'Access Token Expires At',
      required: true,
    }),

    refresh_token_expires_at: Field.datetime({
      label: 'Refresh Token Expires At',
      required: true,
    }),

    client_id: Field.text({
      label: 'Client ID',
      required: true,
      description: 'Foreign key to sys_oauth_application.client_id',
    }),

    user_id: Field.text({
      label: 'User ID',
      required: false,
      description: 'Foreign key to sys_user.id',
    }),

    scopes: Field.text({
      label: 'Scopes',
      required: false,
      maxLength: 1024,
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
    { fields: ['access_token'], unique: true },
    { fields: ['refresh_token'], unique: true },
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
