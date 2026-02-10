// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { PermissionSet, ObjectPermission, FieldPermission } from '@objectstack/spec/security';

/**
 * Operation type mapping to permission checks
 */
const OPERATION_TO_PERMISSION: Record<string, keyof ObjectPermission> = {
  find: 'allowRead',
  findOne: 'allowRead',
  count: 'allowRead',
  aggregate: 'allowRead',
  insert: 'allowCreate',
  update: 'allowEdit',
  delete: 'allowDelete',
};

/**
 * PermissionEvaluator
 * 
 * Runtime evaluator for PermissionSet definitions.
 * Resolves aggregated permissions from roles to concrete allow/deny decisions.
 */
export class PermissionEvaluator {
  /**
   * Check if an operation is allowed on an object for the given permission sets.
   * Uses "most permissive" merging: if ANY permission set allows, it's allowed.
   */
  checkObjectPermission(
    operation: string,
    objectName: string,
    permissionSets: PermissionSet[]
  ): boolean {
    const permKey = OPERATION_TO_PERMISSION[operation];
    if (!permKey) return true; // Unknown operations are allowed by default

    for (const ps of permissionSets) {
      const objPerm = ps.objects?.[objectName];
      if (objPerm) {
        // Check if modifyAllRecords is set (super-user bypass for write ops)
        if (['allowEdit', 'allowDelete'].includes(permKey) && objPerm.modifyAllRecords) {
          return true;
        }
        // Check if viewAllRecords is set (super-user bypass for read ops)
        if (permKey === 'allowRead' && (objPerm.viewAllRecords || objPerm.modifyAllRecords)) {
          return true;
        }
        // Check the specific permission
        if (objPerm[permKey]) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get the merged field permissions for an object.
   * Returns a map of field names to their effective permissions.
   * Uses "most permissive" merging.
   */
  getFieldPermissions(
    objectName: string,
    permissionSets: PermissionSet[]
  ): Record<string, FieldPermission> {
    const result: Record<string, FieldPermission> = {};

    for (const ps of permissionSets) {
      if (!ps.fields) continue;

      for (const [key, perm] of Object.entries(ps.fields)) {
        // Field keys are in format: "object_name.field_name"
        if (!key.startsWith(`${objectName}.`)) continue;
        const fieldName = key.substring(objectName.length + 1);

        if (!result[fieldName]) {
          result[fieldName] = { readable: false, editable: false };
        }

        // Most permissive merge
        if (perm.readable) result[fieldName].readable = true;
        if (perm.editable) result[fieldName].editable = true;
      }
    }

    return result;
  }

  /**
   * Resolve permission sets for a list of role names from metadata.
   */
  resolvePermissionSets(
    roles: string[],
    metadataService: any
  ): PermissionSet[] {
    const result: PermissionSet[] = [];

    // Get all permission sets from metadata
    const allPermSets = metadataService.list?.('permissions') || [];

    for (const ps of allPermSets) {
      // A permission set is relevant if it's a profile assigned to any of the user's roles,
      // or if the role name matches the permission set name
      if (roles.includes(ps.name)) {
        result.push(ps);
      }
    }

    return result;
  }
}
