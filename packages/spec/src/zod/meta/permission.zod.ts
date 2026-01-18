import { z } from 'zod';

/**
 * Entity (Object) Level Permissions
 */
export const ObjectPermissionSchema = z.object({
  /** Can create new records */
  allowCreate: z.boolean().default(false).describe('Create permission'),
  /** Can read records */
  allowRead: z.boolean().default(false).describe('Read permission'),
  /** Can edit records */
  allowEdit: z.boolean().default(false).describe('Edit permission'),
  /** Can delete records */
  allowDelete: z.boolean().default(false).describe('Delete permission'),
  /** Can view all records (ignores sharing rules) */
  viewAllNodes: z.boolean().default(false).describe('View All Data (admin)'),
  /** Can modify all records (ignores sharing rules) */
  modifyAllNodes: z.boolean().default(false).describe('Modify All Data (admin)'),
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
