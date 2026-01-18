import { z } from 'zod';

/**
 * Entity (Object) Level Permissions
 * Defines CRUD + VAMA (View All / Modify All) access.
 */
export const ObjectPermissionSchema = z.object({
  /** C: Create */
  allowCreate: z.boolean().default(false).describe('Create permission'),
  /** R: Read (Owned records or Shared records) */
  allowRead: z.boolean().default(false).describe('Read permission'),
  /** U: Edit (Owned records or Shared records) */
  allowEdit: z.boolean().default(false).describe('Edit permission'),
  /** D: Delete (Owned records or Shared records) */
  allowDelete: z.boolean().default(false).describe('Delete permission'),
  
  /** 
   * View All Records: Super-user read access. 
   * Bypasses Sharing Rules and Ownership checks.
   * Equivalent to Microsoft Dataverse "Organization" level read access.
   */
  viewAllRecords: z.boolean().default(false).describe('View All Data (Bypass Sharing)'),
  
  /** 
   * Modify All Records: Super-user write access. 
   * Bypasses Sharing Rules and Ownership checks.
   * Equivalent to Microsoft Dataverse "Organization" level write access.
   */
  modifyAllRecords: z.boolean().default(false).describe('Modify All Data (Bypass Sharing)'),
});

/**
 * Field Level Security (FLS)
 */
export const FieldPermissionSchema = z.object({
  /** Can see this field */
  readable: z.boolean().default(true).describe('Field read access'),
  /** Can edit this field */
  editable: z.boolean().default(false).describe('Field edit access'),
});

/**
 * Permission Set Schema
 * Defines a collection of permissions that can be assigned to users.
 * 
 * DIFFERENTIATION:
 * - Profile: The ONE primary functional definition of a user (e.g. Standard User).
 * - Permission Set: Add-on capabilities assigned to users (e.g. Export Reports).
 * - Role: (Defined in src/system/role.zod.ts) Defines data visibility hierarchy.
 */
export const PermissionSetSchema = z.object({
  /** Unique permission set name */
  name: z.string().describe('Permission set unique name'),
  
  /** Display label */
  label: z.string().optional().describe('Display label'),
  
  /** Is this a Profile? (Base set for a user) */
  isProfile: z.boolean().default(false).describe('Whether this is a user profile'),
  
  /** Object Permissions Map: <entity_name> -> permissions */
  objects: z.record(ObjectPermissionSchema).describe('Entity permissions'),
  
  /** Field Permissions Map: <entity_name>.<field_name> -> permissions */
  fields: z.record(FieldPermissionSchema).optional().describe('Field level security'),
  
  /** System permissions (e.g., "manage_users") */
  system_permissions: z.array(z.string()).optional().describe('System level capabilities'),
});

export type PermissionSet = z.infer<typeof PermissionSetSchema>;
export type ObjectPermission = z.infer<typeof ObjectPermissionSchema>;
export type FieldPermission = z.infer<typeof FieldPermissionSchema>;
