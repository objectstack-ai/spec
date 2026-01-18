import { z } from 'zod';

/**
 * Sharing Rule Type
 * How is the data shared?
 */
export const SharingRuleType = z.enum([
  'owner',        // Based on record ownership (Role Hierarchy)
  'criteria',     // Based on field values (e.g. Status = 'Open')
  'manual',       // Ad-hoc sharing (User specific)
  'guest'         // Public access
]);

/**
 * Sharing Level
 * What access is granted?
 */
export const SharingLevel = z.enum([
  'read',      // Read Only
  'edit'       // Read / Write
]);

/**
 * Sharing Rule Schema
 * Defines AUTOMATIC access grants based on logic.
 * The core engine of the governance layer.
 */
export const SharingRuleSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Unique rule name'),
  label: z.string().optional(),
  active: z.boolean().default(true),
  
  /** Target Object */
  object: z.string().describe('Object to share'),
  
  /** Grant Logic */
  type: SharingRuleType.default('criteria'),
  
  /** 
   * Criteria (for type='criteria') 
   * SQL-like condition: "department = 'Sales' AND amount > 10000"
   */
  criteria: z.string().optional(),
  
  /** Access Level */
  accessLevel: SharingLevel.default('read'),
  
  /** 
   * Target Audience (Whom to share with)
   * ID of a Group, Role, or User.
   */
  sharedWith: z.string().describe('Group/Role ID to share records with'),
});

/**
 * Organization-Wide Defaults (OWD)
 * The baseline security posture for an object.
 */
export const OWDModel = z.enum([
  'private',          // Only owner can see
  'public_read',      // Everyone can see, owner can edit
  'public_read_write' // Everyone can see and edit
]);

export type SharingRule = z.infer<typeof SharingRuleSchema>;
export type SharingRuleType = z.infer<typeof SharingRuleType>;
