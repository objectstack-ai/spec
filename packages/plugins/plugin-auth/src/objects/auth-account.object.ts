// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * Auth Account Object
 * 
 * Uses better-auth's native schema for seamless migration:
 * - id: string
 * - createdAt: Date
 * - updatedAt: Date
 * - providerId: string (e.g., 'google', 'github')
 * - accountId: string (provider's user ID)
 * - userId: string (link to user table)
 * - accessToken: string | null
 * - refreshToken: string | null
 * - idToken: string | null
 * - accessTokenExpiresAt: Date | null
 * - refreshTokenExpiresAt: Date | null
 * - scope: string | null
 * - password: string | null (for email/password provider)
 */
export const AuthAccount = ObjectSchema.create({
  name: 'account',
  label: 'Account',
  pluralLabel: 'Accounts',
  icon: 'link',
  description: 'OAuth and authentication provider accounts',
  titleFormat: '{providerId} - {accountId}',
  compactLayout: ['providerId', 'userId', 'accountId'],
  
  fields: {
    id: Field.text({
      label: 'Account ID',
      required: true,
      readonly: true,
    }),
    
    createdAt: Field.datetime({
      label: 'Created At',
      defaultValue: 'NOW()',
      readonly: true,
    }),
    
    updatedAt: Field.datetime({
      label: 'Updated At',
      defaultValue: 'NOW()',
      readonly: true,
    }),
    
    providerId: Field.text({
      label: 'Provider ID',
      required: true,
      description: 'OAuth provider identifier (google, github, etc.)',
    }),
    
    accountId: Field.text({
      label: 'Provider Account ID',
      required: true,
      description: "User's ID in the provider's system",
    }),
    
    userId: Field.text({
      label: 'User ID',
      required: true,
      description: 'Link to user table',
    }),
    
    accessToken: Field.textarea({
      label: 'Access Token',
      required: false,
    }),
    
    refreshToken: Field.textarea({
      label: 'Refresh Token',
      required: false,
    }),
    
    idToken: Field.textarea({
      label: 'ID Token',
      required: false,
    }),
    
    accessTokenExpiresAt: Field.datetime({
      label: 'Access Token Expires At',
      required: false,
    }),
    
    refreshTokenExpiresAt: Field.datetime({
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
      description: 'Hashed password for email/password provider',
    }),
  },
  
  // Database indexes for performance
  indexes: [
    { fields: ['userId'], unique: false },
    { fields: ['providerId', 'accountId'], unique: true },
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
