// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Plugin, PluginContext } from '@objectstack/core';
import type { PermissionSet, RowLevelSecurityPolicy } from '@objectstack/spec/security';
import { PermissionEvaluator } from './permission-evaluator.js';
import { RLSCompiler } from './rls-compiler.js';
import { FieldMasker } from './field-masker.js';
import { PermissionDeniedError } from './errors.js';
import {
  securityObjects,
  securityDefaultPermissionSets,
  securityPluginManifestHeader,
} from './manifest.js';

export interface SecurityPluginOptions {
  /**
   * Physical column name used by the multi-tenant RLS isolation policy.
   * Default: `'organization_id'` — matches the canonical
   * `sys_organization` foreign key used across platform objects and
   * better-auth's organization plugin (`session.activeOrganizationId`).
   *
   * RLS expressions written as `tenant_id = current_user.tenant_id` are
   * rewritten on the fly to use this physical column when compiled.
   */
  tenantField?: string;
  /**
   * Additional permission sets to register with the metadata service on
   * plugin start. Defaults to {@link securityDefaultPermissionSets}
   * (admin_full_access / member_default / viewer_readonly).
   */
  defaultPermissionSets?: PermissionSet[];
  /**
   * Permission set name applied as an implicit baseline whenever an
   * authenticated request has no resolved permission sets (and no roles
   * that map to one). This guarantees baseline tenant/owner RLS for
   * every logged-in user even before an admin assigns explicit
   * profiles. Set to `null` to disable.
   *
   * @default 'member_default'
   */
  fallbackPermissionSet?: string | null;
}

/**
 * SecurityPlugin
 *
 * Provides RBAC, Row-Level Security, and Field-Level Security runtime.
 * Registers as an engine middleware on the ObjectQL engine.
 *
 * This plugin is fully optional — without it, the system operates
 * without permission checks (same as current behavior).
 *
 * Dependencies:
 * - objectql service (ObjectQL engine with middleware support)
 * - metadata service (MetadataFacade for reading permission sets and RLS policies)
 */
export class SecurityPlugin implements Plugin {
  name = 'com.objectstack.security';
  type = 'standard';
  version = '1.0.0';
  dependencies = ['com.objectstack.engine.objectql'];

  private permissionEvaluator = new PermissionEvaluator();
  private rlsCompiler = new RLSCompiler();
  private fieldMasker = new FieldMasker();
  private readonly tenantField: string;
  private readonly bootstrapPermissionSets: PermissionSet[];
  private readonly fallbackPermissionSet: string | null;

  constructor(options: SecurityPluginOptions = {}) {
    this.tenantField = options.tenantField ?? 'organization_id';
    this.bootstrapPermissionSets =
      options.defaultPermissionSets ?? securityDefaultPermissionSets;
    this.fallbackPermissionSet =
      options.fallbackPermissionSet === undefined
        ? 'member_default'
        : options.fallbackPermissionSet;
  }

  async init(ctx: PluginContext): Promise<void> {
    ctx.logger.info('Initializing Security Plugin...');

    // Register security services
    ctx.registerService('security.permissions', this.permissionEvaluator);
    ctx.registerService('security.rls', this.rlsCompiler);
    ctx.registerService('security.fieldMasker', this.fieldMasker);

    ctx.getService<{ register(m: any): void }>('manifest').register({
      ...securityPluginManifestHeader,
      objects: securityObjects,
      // Permission sets ride along on the manifest so the metadata service
      // can resolve them by name when SecurityPlugin middleware queries
      // `metadata.list('permissions')`.
      permissions: this.bootstrapPermissionSets,
    });

    ctx.logger.info('Security Plugin initialized', {
      tenantField: this.tenantField,
      defaultPermissionSets: this.bootstrapPermissionSets.map((p) => p.name),
    });
  }

  async start(ctx: PluginContext): Promise<void> {
    ctx.logger.info('Starting Security Plugin...');

    // Get required services
    let ql: any;
    let metadata: any;

    try {
      ql = ctx.getService('objectql');
      metadata = ctx.getService('metadata');
    } catch (e) {
      ctx.logger.warn('ObjectQL or metadata service not available, security middleware not registered');
      return;
    }

    if (!ql || typeof ql.registerMiddleware !== 'function') {
      ctx.logger.warn('ObjectQL engine does not support middleware, security middleware not registered');
      return;
    }

    // Register security middleware
    ql.registerMiddleware(async (opCtx: any, next: () => Promise<void>) => {
      // System operations bypass security
      if (opCtx.context?.isSystem) {
        return next();
      }

      const roles = opCtx.context?.roles ?? [];
      const explicitPermissionSets = opCtx.context?.permissions ?? [];

      // Skip security checks if no roles AND no explicit permission sets
      // AND no userId (anonymous/unauthenticated). The auth middleware
      // should handle authentication separately.
      if (
        roles.length === 0 &&
        explicitPermissionSets.length === 0 &&
        !opCtx.context?.userId
      ) {
        return next();
      }

      // 1. Resolve permission sets from BOTH role names and explicit
      //    permission set names attached to the execution context.
      let permissionSets: PermissionSet[] = [];
      try {
        const requested = [...roles, ...explicitPermissionSets];
        // Implicit baseline: when an authenticated request resolved zero
        // permission sets, fall back to the configured baseline (default
        // `member_default`). This guarantees tenant + owner RLS even
        // before an admin has assigned a profile/permission set.
        if (
          requested.length === 0 &&
          opCtx.context?.userId &&
          this.fallbackPermissionSet
        ) {
          requested.push(this.fallbackPermissionSet);
        }
        permissionSets = await this.permissionEvaluator.resolvePermissionSets(
          requested,
          metadata,
        );
      } catch (e) {
        // If metadata service is misconfigured, log and continue without permission checks
        // rather than blocking all operations
        return next();
      }

      // 2. CRUD permission check
      if (permissionSets.length > 0) {
        const allowed = this.permissionEvaluator.checkObjectPermission(
          opCtx.operation,
          opCtx.object,
          permissionSets
        );

        if (!allowed) {
          throw new PermissionDeniedError(
            `[Security] Access denied: operation '${opCtx.operation}' on object '${opCtx.object}' ` +
              `is not permitted for roles [${roles.join(', ')}]`,
            { operation: opCtx.operation, object: opCtx.object, roles, permissionSets: explicitPermissionSets },
          );
        }
      }

      // 3. RLS filter injection
      const allRlsPolicies = this.collectRLSPolicies(permissionSets, opCtx.object, opCtx.operation);
      if (allRlsPolicies.length > 0 && opCtx.ast) {
        // Substitute the canonical `tenant_id` placeholder for the
        // configured physical column so site-specific tenant columns
        // (e.g. `organization_id`) work without rewriting every policy.
        const rewritten = this.tenantField === 'tenant_id'
          ? allRlsPolicies
          : allRlsPolicies.map((p) => ({
              ...p,
              using: p.using
                ? p.using.replace(/\btenant_id\b/g, this.tenantField)
                : p.using,
            }));
        // Drop policies whose target field doesn't exist on the object —
        // wildcard policies like `tenant_id = ...` must not corrupt
        // queries against system tables that lack the column (sys_jwks,
        // sys_audit_log, etc.). When schema lookup fails we keep the
        // policy (fail-closed for unknown objects).
        const objectFields = await this.getObjectFieldNames(metadata, opCtx.object);
        const safe = objectFields
          ? rewritten.filter((p) => {
              const targetField = this.extractTargetField(p.using);
              return targetField ? objectFields.has(targetField) : true;
            })
          : rewritten;
        const rlsFilter = this.rlsCompiler.compileFilter(safe, opCtx.context);
        if (rlsFilter) {
          if (opCtx.ast.where) {
            opCtx.ast.where = { $and: [opCtx.ast.where, rlsFilter] };
          } else {
            opCtx.ast.where = rlsFilter;
          }
        }
      }

      await next();

      // 4. Field-level security: mask restricted fields in read results
      if (opCtx.result && ['find', 'findOne'].includes(opCtx.operation)) {
        const fieldPerms = this.permissionEvaluator.getFieldPermissions(opCtx.object, permissionSets);
        if (Object.keys(fieldPerms).length > 0) {
          opCtx.result = this.fieldMasker.maskResults(opCtx.result, fieldPerms, opCtx.object);
        }
      }
    });

    ctx.logger.info('Security middleware registered on ObjectQL engine');
  }

  async destroy(): Promise<void> {
    // No cleanup needed
  }

  /**
   * Collect all RLS policies from permission sets applicable to the given object/operation.
   */
  private collectRLSPolicies(
    permissionSets: PermissionSet[],
    objectName: string,
    operation: string
  ): RowLevelSecurityPolicy[] {
    const allPolicies: RowLevelSecurityPolicy[] = [];

    for (const ps of permissionSets) {
      if (ps.rowLevelSecurity) {
        allPolicies.push(...ps.rowLevelSecurity);
      }
    }

    return this.rlsCompiler.getApplicablePolicies(objectName, operation, allPolicies);
  }

  /**
   * Resolve the column-name set for an object (lowercased). Returns
   * `null` if the schema can't be loaded — caller should fail-closed.
   */
  private async getObjectFieldNames(
    metadata: any,
    objectName: string,
  ): Promise<Set<string> | null> {
    try {
      const obj = await metadata?.get?.('object', objectName);
      if (!obj || !Array.isArray(obj.fields)) return null;
      const set = new Set<string>(['id']);
      for (const f of obj.fields) {
        if (f?.name) set.add(String(f.name));
      }
      return set;
    } catch {
      return null;
    }
  }

  /**
   * Extract the left-hand field name from a simple RLS expression like
   * `field = current_user.x` or `field IN (current_user.y)`. Returns
   * `null` for unsupported shapes (in which case we keep the policy).
   */
  private extractTargetField(using?: string): string | null {
    if (!using) return null;
    const m = using.match(/^\s*([a-z_][a-z0-9_]*)\s*(=|IN|in)\b/);
    return m ? m[1] : null;
  }
}
