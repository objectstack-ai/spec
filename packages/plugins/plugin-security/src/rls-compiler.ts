// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { RowLevelSecurityPolicy } from '@objectstack/spec/security';
import type { ExecutionContext } from '@objectstack/spec/kernel';

/**
 * RLS User Context
 * Variables available for RLS expression evaluation.
 */
interface RLSUserContext {
  id?: string;
  tenant_id?: string;
  roles?: string[];
  [key: string]: unknown;
}

/**
 * RLSCompiler
 * 
 * Compiles Row-Level Security policy expressions into query filters.
 * Converts `using` / `check` expressions into ObjectQL-compatible filter conditions.
 */
export class RLSCompiler {
  /**
   * Compile RLS policies into a query filter for the given user context.
   * Multiple policies for the same object/operation are OR-combined (any match allows access).
   */
  compileFilter(
    policies: RowLevelSecurityPolicy[],
    executionContext?: ExecutionContext
  ): Record<string, unknown> | null {
    if (policies.length === 0) return null;

    const userCtx: RLSUserContext = {
      id: executionContext?.userId,
      tenant_id: executionContext?.tenantId,
      roles: executionContext?.roles,
    };

    const filters: Record<string, unknown>[] = [];

    for (const policy of policies) {
      if (!policy.using) continue;
      const filter = this.compileExpression(policy.using, userCtx);
      if (filter) {
        filters.push(filter);
      }
    }

    if (filters.length === 0) return null;
    if (filters.length === 1) return filters[0];

    // Multiple policies: OR-combine (any policy allows access)
    return { $or: filters };
  }

  /**
   * Compile a single RLS expression into a query filter.
   * 
   * Supports simple expressions like:
   * - "field_name = current_user.property"
   * - "field_name IN (current_user.array_property)"
   * - "field_name = 'literal_value'"
   */
  compileExpression(
    expression: string,
    userCtx: RLSUserContext
  ): Record<string, unknown> | null {
    if (!expression) return null;

    // Handle simple equality: "field = current_user.property"
    const eqMatch = expression.match(/^\s*(\w+)\s*=\s*current_user\.(\w+)\s*$/);
    if (eqMatch) {
      const [, field, prop] = eqMatch;
      const value = userCtx[prop];
      if (value === undefined) return null;
      return { [field]: value };
    }

    // Handle literal equality: "field = 'value'"
    const litMatch = expression.match(/^\s*(\w+)\s*=\s*'([^']*)'\s*$/);
    if (litMatch) {
      const [, field, value] = litMatch;
      return { [field]: value };
    }

    // Handle IN: "field IN (current_user.array_property)"
    const inMatch = expression.match(/^\s*(\w+)\s+IN\s+\(\s*current_user\.(\w+)\s*\)\s*$/i);
    if (inMatch) {
      const [, field, prop] = inMatch;
      const value = userCtx[prop];
      if (!Array.isArray(value)) return null;
      return { [field]: { $in: value } };
    }

    // Unsupported expression: return null (no filter applied - fail-safe is to deny)
    return null;
  }

  /**
   * Get applicable RLS policies for a given object and operation.
   */
  getApplicablePolicies(
    objectName: string,
    operation: string,
    allPolicies: RowLevelSecurityPolicy[]
  ): RowLevelSecurityPolicy[] {
    // Map engine operation to RLS operation type
    const rlsOp = this.mapOperationToRLS(operation);

    return allPolicies.filter(policy => {
      // Check object match
      if (policy.object !== objectName && policy.object !== '*') return false;

      // Check operation match
      if (policy.operation === 'all') return true;
      if (policy.operation === rlsOp) return true;

      return false;
    });
  }

  private mapOperationToRLS(operation: string): string {
    switch (operation) {
      case 'find':
      case 'findOne':
      case 'count':
      case 'aggregate':
        return 'select';
      case 'insert':
        return 'insert';
      case 'update':
        return 'update';
      case 'delete':
        return 'delete';
      default:
        return 'select';
    }
  }
}
