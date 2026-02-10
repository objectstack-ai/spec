// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * Auth Session Object
 * 
 * Uses better-auth's native schema for seamless migration:
 * - id: string
 * - createdAt: Date
 * - updatedAt: Date
 * - userId: string
 * - expiresAt: Date
 * - token: string
 * - ipAddress: string | null
 * - userAgent: string | null
 */
export const AuthSession = ObjectSchema.create({
  name: 'session',
  label: 'Session',
  pluralLabel: 'Sessions',
  icon: 'key',
  description: 'Active user sessions',
  titleFormat: 'Session {token}',
  compactLayout: ['userId', 'expiresAt', 'ipAddress'],
  
  fields: {
    id: Field.text({
      label: 'Session ID',
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
    
    userId: Field.text({
      label: 'User ID',
      required: true,
    }),
    
    expiresAt: Field.datetime({
      label: 'Expires At',
      required: true,
    }),
    
    token: Field.text({
      label: 'Session Token',
      required: true,
    }),
    
    ipAddress: Field.text({
      label: 'IP Address',
      required: false,
      maxLength: 45, // Support IPv6
    }),
    
    userAgent: Field.textarea({
      label: 'User Agent',
      required: false,
    }),
  },
  
  // Database indexes for performance
  indexes: [
    { fields: ['token'], unique: true },
    { fields: ['userId'], unique: false },
    { fields: ['expiresAt'], unique: false },
  ],
  
  // Enable features
  enable: {
    trackHistory: false, // Sessions don't need history tracking
    searchable: false,
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'delete'], // No update for sessions
    trash: false, // Sessions should be hard deleted
    mru: false,
  },
});
