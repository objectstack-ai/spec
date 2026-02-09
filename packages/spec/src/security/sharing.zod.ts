// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';

/**
 * Organization-Wide Defaults (OWD)
 * The baseline security posture for an object.
 */
export const OWDModel = z.enum([
  'private',               // Only owner can see
  'public_read',           // Everyone can see, owner can edit
  'public_read_write',     // Everyone can see and edit
  'controlled_by_parent'   // Access derived from parent record (Master-Detail)
]).describe('Organization-Wide Default access level for an object');

/**
 * Sharing Rule Type
 * How is the data shared?
 */
export const SharingRuleType = z.enum([
  'owner',        // Based on record ownership (Role Hierarchy)
  'criteria',     // Based on field values (e.g. Status = 'Open')
]).describe('Type of sharing rule (owner-based or criteria-based)');

/**
 * Sharing Level
 * What access is granted?
 */
export const SharingLevel = z.enum([
  'read',      // Read Only
  'edit',      // Read / Write
  'full'       // Full Access (Transfer, Share, Delete)
]).describe('Level of access granted by the sharing rule');

/**
 * Recipient Type 
 * Who receives the access?
 */
export const ShareRecipientType = z.enum([
  'user',
  'group',
  'role',
  'role_and_subordinates',
  'guest' // for public sharing
]).describe('Type of recipient receiving shared access');

/**
 * Base Sharing Rule
 * Common metadata for all sharing strategies.
 */
const BaseSharingRuleSchema = z.object({
  // Identification
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Unique rule name (snake_case)'),
  label: z.string().optional().describe('Human-readable label'),
  description: z.string().optional().describe('Administrative notes'),
  
  // Scope
  object: z.string().describe('Target Object Name'),
  active: z.boolean().default(true).describe('Whether the sharing rule is currently active'),
  
  // Access
  accessLevel: SharingLevel.default('read').describe('Level of access granted'),
  
  // Recipient (Whom to share with)
  sharedWith: z.object({
    type: ShareRecipientType.describe('Type of recipient'),
    value: z.string().describe('ID or Code of the User/Group/Role'),
  }).describe('The recipient of the shared access'),
});

/**
 * 1. Criteria-Based Sharing Rule
 * Share records that meet specific field criteria.
 */
export const CriteriaSharingRuleSchema = BaseSharingRuleSchema.extend({
  type: z.literal('criteria'),
  condition: z.string().describe('Formula condition determining which records to share (e.g. "department = \'Sales\'")'),
});

/**
 * 2. Owner-Based Sharing Rule
 * Share records owned by a specific group of users.
 */
export const OwnerSharingRuleSchema = BaseSharingRuleSchema.extend({
  type: z.literal('owner'),
  ownedBy: z.object({
    type: ShareRecipientType.describe('Type of owner'),
    value: z.string().describe('ID or Code of the owner'),
  }).describe('Source group/role whose owned records are being shared'),
});

/**
 * Master Sharing Rule Schema
 */
export const SharingRuleSchema = z.discriminatedUnion('type', [
  CriteriaSharingRuleSchema,
  OwnerSharingRuleSchema
]);

export type SharingRule = z.infer<typeof SharingRuleSchema>;
export type CriteriaSharingRule = z.infer<typeof CriteriaSharingRuleSchema>;
export type OwnerSharingRule = z.infer<typeof OwnerSharingRuleSchema>;
