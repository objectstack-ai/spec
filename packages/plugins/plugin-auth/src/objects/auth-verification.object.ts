// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * Auth Verification Object
 * 
 * Uses better-auth's native schema for seamless migration:
 * - id: string
 * - createdAt: Date
 * - updatedAt: Date
 * - value: string (verification token/code)
 * - expiresAt: Date
 * - identifier: string (email or phone number)
 */
export const AuthVerification = ObjectSchema.create({
  name: 'verification',
  label: 'Verification',
  pluralLabel: 'Verifications',
  icon: 'shield-check',
  description: 'Email and phone verification tokens',
  titleFormat: 'Verification for {identifier}',
  compactLayout: ['identifier', 'expiresAt', 'createdAt'],
  
  fields: {
    id: Field.text({
      label: 'Verification ID',
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
    
    value: Field.text({
      label: 'Verification Token',
      required: true,
      description: 'Token or code for verification',
    }),
    
    expiresAt: Field.datetime({
      label: 'Expires At',
      required: true,
    }),
    
    identifier: Field.text({
      label: 'Identifier',
      required: true,
      description: 'Email address or phone number',
    }),
  },
  
  // Database indexes for performance
  indexes: [
    { fields: ['value'], unique: true },
    { fields: ['identifier'], unique: false },
    { fields: ['expiresAt'], unique: false },
  ],
  
  // Enable features
  enable: {
    trackHistory: false,
    searchable: false,
    apiEnabled: true,
    apiMethods: ['get', 'create', 'delete'], // No list or update
    trash: false, // Hard delete expired tokens
    mru: false,
  },
});
