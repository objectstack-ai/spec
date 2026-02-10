// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { FieldPermission } from '@objectstack/spec/security';

/**
 * FieldMasker
 * 
 * Applies field-level security by stripping restricted fields from query results.
 */
export class FieldMasker {
  /**
   * Mask fields in query results based on field permissions.
   * Removes fields that the user does not have read access to.
   */
  maskResults(
    results: any | any[],
    fieldPermissions: Record<string, FieldPermission>,
    _objectName: string
  ): any | any[] {
    // If no field permissions defined, return results as-is
    if (Object.keys(fieldPermissions).length === 0) return results;

    // Get list of non-readable fields
    const hiddenFields = Object.entries(fieldPermissions)
      .filter(([, perm]) => !perm.readable)
      .map(([field]) => field);

    if (hiddenFields.length === 0) return results;

    if (Array.isArray(results)) {
      return results.map(record => this.maskRecord(record, hiddenFields));
    }

    return this.maskRecord(results, hiddenFields);
  }

  /**
   * Get non-editable fields for use in write operations.
   * Returns a list of field names that should be stripped from incoming data.
   */
  getNonEditableFields(
    fieldPermissions: Record<string, FieldPermission>
  ): string[] {
    return Object.entries(fieldPermissions)
      .filter(([, perm]) => !perm.editable)
      .map(([field]) => field);
  }

  /**
   * Strip non-editable fields from write data.
   */
  stripNonEditableFields(
    data: Record<string, any>,
    fieldPermissions: Record<string, FieldPermission>
  ): Record<string, any> {
    const nonEditable = this.getNonEditableFields(fieldPermissions);
    if (nonEditable.length === 0) return data;

    const result = { ...data };
    for (const field of nonEditable) {
      delete result[field];
    }
    return result;
  }

  private maskRecord(record: any, hiddenFields: string[]): any {
    if (!record || typeof record !== 'object') return record;

    const result = { ...record };
    for (const field of hiddenFields) {
      delete result[field];
    }
    return result;
  }
}
