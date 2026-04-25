// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppCatalogService, type AppCatalogEventPayload } from './services/app-catalog.service.js';

type Hook = (payload: any) => Promise<void> | void;

function createMockDriver(initialRows: Array<Record<string, any>> = []) {
  const upsert = vi.fn(async (_obj: string, row: any, _keys: string[]) => row);
  const deleteMany = vi.fn(async (_obj: string, _query: any) => undefined);
  const find = vi.fn(async (_obj: string, _query: any) => initialRows);
  return { upsert, deleteMany, find } as any;
}

function createMockCtx(driver: any) {
  const hooks = new Map<string, Hook>();
  const ctx: any = {
    hook: (event: string, handler: Hook) => hooks.set(event, handler),
    getService: (name: string) => {
      if (name === 'driver.cloud') return driver;
      throw new Error(`unknown service ${name}`);
    },
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
    },
    _hooks: hooks,
  };
  return ctx;
}

const basePayload = (overrides: Partial<AppCatalogEventPayload> = {}): AppCatalogEventPayload => ({
  projectId: 'proj-1',
  organizationId: 'org-1',
  projectName: 'Project One',
  app: {
    name: 'crm',
    label: 'CRM',
    icon: 'briefcase',
    branding: { color: '#fff' },
    isDefault: false,
    active: true,
  },
  source: 'package',
  packageId: 'pkg-1',
  ...overrides,
});

describe('AppCatalogService', () => {
  let service: AppCatalogService;

  beforeEach(() => {
    service = new AppCatalogService();
  });

  it('upserts a sys_app row when app:registered fires', async () => {
    const driver = createMockDriver();
    const ctx = createMockCtx(driver);
    service.install(ctx);

    const handler = ctx._hooks.get('app:registered')!;
    await handler(basePayload());

    expect(driver.upsert).toHaveBeenCalledTimes(1);
    const [object, row, keys] = driver.upsert.mock.calls[0];
    expect(object).toBe('sys_app');
    expect(keys).toEqual(['project_id', 'name']);
    expect(row).toMatchObject({
      organization_id: 'org-1',
      project_id: 'proj-1',
      project_name: 'Project One',
      name: 'crm',
      label: 'CRM',
      icon: 'briefcase',
      branding: JSON.stringify({ color: '#fff' }),
      is_default: false,
      active: true,
      source: 'package',
      package_id: 'pkg-1',
    });
    expect(typeof row.updated_at).toBe('string');
  });

  it('deletes the sys_app row when app:unregistered fires', async () => {
    const driver = createMockDriver();
    const ctx = createMockCtx(driver);
    service.install(ctx);

    const handler = ctx._hooks.get('app:unregistered')!;
    await handler(basePayload());

    expect(driver.deleteMany).toHaveBeenCalledTimes(1);
    const [object, query] = driver.deleteMany.mock.calls[0];
    expect(object).toBe('sys_app');
    expect(query).toEqual({ where: { project_id: 'proj-1', name: 'crm' } });
  });

  it('reconcileProject removes only rows whose name is not in currentNames', async () => {
    const driver = createMockDriver([
      { name: 'crm', id: 1 },
      { name: 'inventory', id: 2 },
      { name: 'legacy', id: 3 },
    ]);
    const ctx = createMockCtx(driver);

    await service.reconcileProject(ctx, 'proj-1', ['crm', 'inventory']);

    expect(driver.find).toHaveBeenCalledWith('sys_app', {
      where: { project_id: 'proj-1' },
      limit: 10_000,
    });
    expect(driver.deleteMany).toHaveBeenCalledTimes(1);
    expect(driver.deleteMany).toHaveBeenCalledWith('sys_app', {
      where: { project_id: 'proj-1', name: 'legacy' },
    });
  });

  it('skips upsert silently when driver.cloud is not registered', async () => {
    const captured: Record<string, Hook> = {};
    const ctx: any = {
      hook: (event: string, handler: Hook) => {
        captured[event] = handler;
      },
      getService: (_n: string) => {
        throw new Error('not registered');
      },
      logger: { info: vi.fn(), warn: vi.fn(), debug: vi.fn(), error: vi.fn() },
    };
    service.install(ctx);

    await captured['app:registered'](basePayload());
    // No throw; logger.debug called for the skip path
    expect(ctx.logger.debug).toHaveBeenCalled();
  });
});
