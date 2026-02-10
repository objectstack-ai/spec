// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * Auth Account Object
 * 
 * Maps to better-auth's Account schema for OAuth providers:
 * - id: string
 * - createdAt: Date
 * - updatedAt: Date
 * - providerId: string (e.g., 'google', 'github')
 * - accountId: string (provider's user ID)
 * - userId: string (link to auth_user)
 * - accessToken: string | null
 * - refreshToken: string | null
 * - idToken: string | null
 * - accessTokenExpiresAt: Date | null
 * - refreshTokenExpiresAt: Date | null
 * - scope: string | null
 * - password: string | null (for email/password provider)
 */
export const AuthAccount = ObjectSchema.create({
  name: 'auth_account',
  label: 'Account',
  pluralLabel: 'Accounts',
  icon: 'link',
  description: 'OAuth and authentication provider accounts',
  titleFormat: '{provider_id} - {account_id}',
  compactLayout: ['provider_id', 'user_id', 'account_id'],
  
  fields: {
    id: Field.text({
      label: 'Account ID',
      required: true,
      readonly: true,
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
    
    provider_id: Field.text({
      label: 'Provider ID',
      required: true,
      description: 'OAuth provider identifier (google, github, etc.)',
    }),
    
    account_id: Field.text({
      label: 'Provider Account ID',
      required: true,
      description: "User's ID in the provider's system",
    }),
    
    user_id: Field.text({
      label: 'User ID',
      required: true,
      description: 'Link to auth_user',
    }),
    
    access_token: Field.textarea({
      label: 'Access Token',
      required: false,
      encrypted: true, // Sensitive data should be encrypted
    }),
    
    refresh_token: Field.textarea({
      label: 'Refresh Token',
      required: false,
      encrypted: true,
    }),
    
    id_token: Field.textarea({
      label: 'ID Token',
      required: false,
      encrypted: true,
    }),
    
    access_token_expires_at: Field.datetime({
      label: 'Access Token Expires At',
      required: false,
    }),
    
    refresh_token_expires_at: Field.datetime({
      label: 'Refresh Token Expires At',
      required: false,
    }),
    
    scope: Field.text({
      label: 'OAuth Scope',
      required: false,
    }),
    
    password: Field.text({
      label: 'Password Hash',
      required: false,
      encrypted: true,
      description: 'Hashed password for email/password provider',
    }),
  },
  
  // Database indexes for performance
  indexes: [
    { fields: ['user_id'], unique: false },
    { fields: ['provider_id', 'account_id'], unique: true },
  ],
  
  // Enable features
  enable: {
    trackHistory: false,
    searchable: false,
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete'],
    trash: true,
    mru: false,
  },
});
