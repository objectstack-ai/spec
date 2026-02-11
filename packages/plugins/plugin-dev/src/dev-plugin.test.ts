import { describe, it, expect, vi } from 'vitest';
import { DevPlugin } from './dev-plugin';

describe('DevPlugin', () => {
  it('should have correct metadata', () => {
    const plugin = new DevPlugin();
    expect(plugin.name).toBe('com.objectstack.plugin.dev');
    expect(plugin.type).toBe('standard');
    expect(plugin.version).toBe('1.0.0');
  });

  it('should accept default options', () => {
    const plugin = new DevPlugin();
    expect(plugin).toBeDefined();
  });

  it('should accept custom options including stack', () => {
    const plugin = new DevPlugin({
      port: 4000,
      seedAdminUser: false,
      verbose: false,
      services: { auth: false, dispatcher: false, security: false },
      stack: { manifest: { id: 'test', name: 'test', version: '1.0.0', type: 'app' } },
    });
    expect(plugin).toBeDefined();
  });

  it('should init with mocked context and handle missing deps gracefully', async () => {
    const ctx: any = {
      logger: {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
      getService: vi.fn().mockImplementation(() => { throw new Error('not found'); }),
      getServices: vi.fn().mockReturnValue(new Map()),
      registerService: vi.fn(),
      hook: vi.fn(),
      trigger: vi.fn(),
      getKernel: vi.fn(),
    };

    // DevPlugin should not throw even if peer dependencies are missing
    const plugin = new DevPlugin({ seedAdminUser: false });
    await expect(plugin.init(ctx)).resolves.not.toThrow();
  });

  it('should register dev stubs for all core services', async () => {
    const registeredServices = new Map<string, any>();
    const ctx: any = {
      logger: {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
      getService: vi.fn().mockImplementation((name: string) => {
        if (registeredServices.has(name)) return registeredServices.get(name);
        throw new Error('not found');
      }),
      getServices: vi.fn().mockReturnValue(new Map()),
      registerService: vi.fn().mockImplementation((name: string, svc: any) => {
        registeredServices.set(name, svc);
      }),
      hook: vi.fn(),
      trigger: vi.fn(),
      getKernel: vi.fn(),
    };

    // Disable real plugins (which need real packages) but allow stubs
    const plugin = new DevPlugin({
      seedAdminUser: false,
      services: {
        objectql: false,
        driver: false,
        auth: false,
        server: false,
        rest: false,
        dispatcher: false,
      },
    });

    await plugin.init(ctx);

    // Should have registered dev stubs for all 17 core services + 3 security services
    const stubLog = ctx.logger.info.mock.calls.find(
      (call: any[]) => typeof call[0] === 'string' && call[0].includes('Dev stubs registered'),
    );
    expect(stubLog).toBeDefined();

    // Verify stub services are callable
    const cacheStub = registeredServices.get('cache');
    expect(cacheStub).toBeDefined();
    expect(cacheStub._dev).toBe(true);
    // Stub methods should return promises
    const result = await cacheStub.get('key');
    expect(result).toBeUndefined();
  });

  it('should skip disabled services', async () => {
    const ctx: any = {
      logger: {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
      getService: vi.fn().mockImplementation(() => { throw new Error('not found'); }),
      getServices: vi.fn().mockReturnValue(new Map()),
      registerService: vi.fn(),
      hook: vi.fn(),
      trigger: vi.fn(),
      getKernel: vi.fn(),
    };

    const plugin = new DevPlugin({
      seedAdminUser: false,
      services: {
        objectql: false,
        driver: false,
        auth: false,
        server: false,
        rest: false,
        dispatcher: false,
        security: false,
        // Disable all core services too
        metadata: false,
        data: false,
        cache: false,
        queue: false,
        job: false,
        'file-storage': false,
        search: false,
        automation: false,
        graphql: false,
        analytics: false,
        realtime: false,
        notification: false,
        ai: false,
        i18n: false,
        ui: false,
        workflow: false,
      },
    });

    await plugin.init(ctx);

    // No child plugins AND no stubs should be registered
    const initLog = ctx.logger.info.mock.calls.find(
      (call: any[]) => typeof call[0] === 'string' && call[0].includes('initialized'),
    );
    expect(initLog).toBeDefined();
    expect(initLog[0]).toContain('0 plugin');
    expect(initLog[0]).toContain('0 dev stub');
  });

  it('should destroy without errors', async () => {
    const plugin = new DevPlugin();
    await expect(plugin.destroy()).resolves.not.toThrow();
  });
});
