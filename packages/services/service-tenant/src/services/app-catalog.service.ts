// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { PluginContext } from '@objectstack/spec/kernel';
import type { IDataDriver } from '@objectstack/spec/contracts';

/**
 * Payload emitted by AppPlugin when an app is registered/unregistered in a
 * project kernel. Mirrors the shape constructed in
 * `packages/runtime/src/app-plugin.ts → emitCatalogEvent()`.
 */
export interface AppCatalogEventPayload {
  projectId: string;
  organizationId: string;
  projectName?: string;
  app: {
    name: string;
    label?: string;
    icon?: string;
    branding?: unknown;
    isDefault?: boolean;
    active?: boolean;
  };
  source?: 'package' | 'user';
  packageId?: string;
}

/**
 * AppCatalogService
 *
 * Bridges per-project `app:registered` / `app:unregistered` kernel hooks into
 * the org-scoped `sys_app` catalog stored in the control-plane DB. Frontend
 * "all apps in this org" views can then run a single
 * `find('sys_app', { where: { organization_id } })` query through
 * `ControlPlaneProxyDriver` instead of fanning out to every project DB.
 *
 * Writes go through the kernel-registered `driver.cloud` service — which is
 * the `ControlPlaneProxyDriver` mounted by `DefaultProjectKernelFactory`.
 * That driver auto-injects the `organization_id` filter, so writes/reads are
 * always tenant-safe.
 */
export class AppCatalogService {
  /** Tracks which app names we've seen per project, used by reconcileProject. */
  private readonly known = new Map<string, Set<string>>();

  install(ctx: PluginContext): void {
    ctx.hook('app:registered', async (payload: AppCatalogEventPayload) => {
      try {
        await this.handleRegistered(ctx, payload);
      } catch (err: any) {
        ctx.logger.warn('[AppCatalogService] app:registered handler failed', {
          error: err?.message,
          projectId: payload?.projectId,
          appName: payload?.app?.name,
        });
      }
    });

    ctx.hook('app:unregistered', async (payload: AppCatalogEventPayload) => {
      try {
        await this.handleUnregistered(ctx, payload);
      } catch (err: any) {
        ctx.logger.warn('[AppCatalogService] app:unregistered handler failed', {
          error: err?.message,
          projectId: payload?.projectId,
          appName: payload?.app?.name,
        });
      }
    });

    ctx.logger.info('[AppCatalogService] hooks installed (app:registered, app:unregistered)');
  }

  /**
   * Drop `sys_app` rows for `projectId` whose name is not in `currentNames`.
   * Call after a project kernel finishes booting all of its AppPlugins to
   * heal the catalog across restarts/upgrades and tolerate missed events.
   */
  async reconcileProject(
    ctx: PluginContext,
    projectId: string,
    currentNames: Iterable<string>,
  ): Promise<void> {
    const driver = this.getCloudDriver(ctx);
    if (!driver) return;

    const keep = new Set(currentNames);
    const deleteMany = (driver as any).deleteMany;
    if (typeof deleteMany !== 'function') return;

    try {
      const existing = await driver.find('sys_app', {
        where: { project_id: projectId },
        limit: 10_000,
      } as any);
      const rows: Array<{ name?: string; id?: string | number }> = Array.isArray(existing)
        ? existing
        : ((existing as any)?.value ?? []);
      const stale = rows.filter((r) => r?.name && !keep.has(r.name));
      for (const row of stale) {
        await deleteMany.call(driver, 'sys_app', {
          where: { project_id: projectId, name: row.name },
        });
      }
      if (stale.length) {
        ctx.logger.info('[AppCatalogService] reconciled stale sys_app rows', {
          projectId,
          removed: stale.length,
        });
      }
    } catch (err: any) {
      ctx.logger.warn('[AppCatalogService] reconcileProject failed', {
        projectId,
        error: err?.message,
      });
    }
  }

  private async handleRegistered(
    ctx: PluginContext,
    payload: AppCatalogEventPayload,
  ): Promise<void> {
    const driver = this.getCloudDriver(ctx);
    if (!driver) {
      ctx.logger.debug('[AppCatalogService] no driver.cloud — skipping upsert', {
        projectId: payload.projectId,
        appName: payload.app?.name,
      });
      return;
    }

    const { projectId, organizationId, projectName, app, source, packageId } = payload;
    if (!projectId || !organizationId || !app?.name) return;

    const branding = serializeBranding(app.branding);
    const row = {
      organization_id: organizationId,
      project_id: projectId,
      project_name: projectName ?? null,
      name: app.name,
      label: app.label ?? null,
      icon: app.icon ?? null,
      branding,
      is_default: app.isDefault ?? false,
      active: app.active !== false,
      source: source ?? (packageId ? 'package' : 'user'),
      package_id: packageId ?? null,
      updated_at: new Date().toISOString(),
    };

    await driver.upsert('sys_app', row, ['project_id', 'name']);

    let set = this.known.get(projectId);
    if (!set) {
      set = new Set();
      this.known.set(projectId, set);
    }
    set.add(app.name);
  }

  private async handleUnregistered(
    ctx: PluginContext,
    payload: AppCatalogEventPayload,
  ): Promise<void> {
    const driver = this.getCloudDriver(ctx);
    if (!driver) return;

    const { projectId, app } = payload;
    if (!projectId || !app?.name) return;

    const deleteMany = (driver as any).deleteMany;
    if (typeof deleteMany === 'function') {
      await deleteMany.call(driver, 'sys_app', {
        where: { project_id: projectId, name: app.name },
      });
    }

    this.known.get(projectId)?.delete(app.name);
  }

  private getCloudDriver(ctx: PluginContext): IDataDriver | undefined {
    try {
      return ctx.getService<IDataDriver>('driver.cloud');
    } catch {
      return undefined;
    }
  }
}

function serializeBranding(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}
