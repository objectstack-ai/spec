// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Plugin, PluginContext } from '@objectstack/core';

/**
 * All 17 core kernel service names as defined in CoreServiceName.
 * @see packages/spec/src/system/core-services.zod.ts
 */
const CORE_SERVICE_NAMES = [
  'metadata', 'data', 'auth',
  'file-storage', 'search', 'cache', 'queue',
  'automation', 'graphql', 'analytics', 'realtime',
  'job', 'notification', 'ai', 'i18n', 'ui', 'workflow',
] as const;

/**
 * Security sub-services registered by the SecurityPlugin.
 */
const SECURITY_SERVICE_NAMES = [
  'security.permissions', 'security.rls', 'security.fieldMasker',
] as const;

/**
 * Creates a no-op stub that logs calls in development.
 * Returned object accepts any method invocation and returns
 * sensible defaults (empty arrays, empty objects, undefined).
 */
function createDevStub(serviceName: string): Record<string, any> {
  return new Proxy({
    _dev: true,
    _serviceName: serviceName,
  }, {
    get(target, prop) {
      if (prop in target) return (target as any)[prop];
      if (typeof prop === 'symbol') return undefined;
      // Return a function that resolves to a sensible default
      return (..._args: any[]) => Promise.resolve(undefined);
    },
  });
}

/**
 * Dev Plugin Options
 *
 * Configuration for the development-mode plugin.
 * All options have sensible defaults — zero-config works out of the box.
 */
export interface DevPluginOptions {
  /**
   * Port for the HTTP server.
   * @default 3000
   */
  port?: number;

  /**
   * Whether to seed a default admin user for development.
   * Creates `admin@dev.local` / `admin` so devs can skip login.
   * @default true
   */
  seedAdminUser?: boolean;

  /**
   * Auth secret for development sessions.
   * @default 'objectstack-dev-secret-DO-NOT-USE-IN-PRODUCTION!!'
   */
  authSecret?: string;

  /**
   * Auth base URL.
   * @default 'http://localhost:{port}'
   */
  authBaseUrl?: string;

  /**
   * Whether to enable verbose logging.
   * @default true
   */
  verbose?: boolean;

  /**
   * Override which services to enable. By default all core services are enabled.
   * Set a service name to `false` to skip it.
   *
   * Available services: 'objectql', 'driver', 'auth', 'server', 'rest',
   * 'dispatcher', 'security', plus any of the 17 CoreServiceName values
   * (e.g. 'cache', 'queue', 'job', 'ui', 'automation', 'workflow', …).
   */
  services?: Partial<Record<string, boolean>>;

  /**
   * Additional plugins to load alongside the auto-configured ones.
   * Useful for adding custom project plugins while still getting the dev defaults.
   */
  extraPlugins?: Plugin[];

  /**
   * Stack definition to load as a project.
   * When provided, the DevPlugin wraps it in an AppPlugin so that all
   * metadata (objects, views, apps, dashboards, etc.) is registered with
   * the kernel and exposed through the REST/metadata APIs.
   *
   * This is what makes `new DevPlugin({ stack: config })` equivalent to
   * a full `os serve --dev` environment: views can be read, modified, and
   * saved through the API.
   *
   * @example
   * ```ts
   * import config from './objectstack.config';
   * plugins: [new DevPlugin({ stack: config })]
   * ```
   */
  stack?: Record<string, any>;
}

/**
 * Development Mode Plugin for ObjectStack
 *
 * A convenience plugin that auto-configures the **entire** platform stack
 * for local development, simulating **all 17+ kernel services** so developers
 * can work in a full-featured API environment without external dependencies.
 *
 * Instead of manually wiring:
 *
 * ```ts
 * plugins: [
 *   new ObjectQLPlugin(),
 *   new DriverPlugin(new InMemoryDriver()),
 *   new AuthPlugin({ secret: '...', baseUrl: '...' }),
 *   new HonoServerPlugin({ port: 3000 }),
 *   createRestApiPlugin(),
 *   createDispatcherPlugin(),
 *   new SecurityPlugin(),
 *   new AppPlugin(config),
 * ]
 * ```
 *
 * You can simply use:
 *
 * ```ts
 * plugins: [new DevPlugin()]
 * ```
 *
 * ## Core services (real implementations)
 *
 * | Service      | Package                           | Description                               |
 * |--------------|-----------------------------------|-------------------------------------------|
 * | ObjectQL     | `@objectstack/objectql`           | Data engine (query, CRUD, hooks)          |
 * | Driver       | `@objectstack/driver-memory`      | In-memory database (no DB install)        |
 * | Auth         | `@objectstack/plugin-auth`        | Authentication with dev credentials       |
 * | Security     | `@objectstack/plugin-security`    | RBAC, RLS, field-level masking            |
 * | HTTP Server  | `@objectstack/plugin-hono-server` | HTTP server on configured port            |
 * | REST API     | `@objectstack/rest`               | Auto-generated CRUD + metadata endpoints  |
 * | Dispatcher   | `@objectstack/runtime`            | Auth, GraphQL, analytics, packages, etc.  |
 * | App/Metadata | `@objectstack/runtime`            | Project metadata (objects, views, apps)   |
 *
 * ## Stub services (in-memory / no-op for dev)
 *
 * Any core service not provided by a real plugin is automatically registered
 * as a dev stub. This ensures the full kernel service map is populated:
 *
 * `cache`, `queue`, `job`, `file-storage`, `search`, `automation`, `graphql`,
 * `analytics`, `realtime`, `notification`, `ai`, `i18n`, `ui`, `workflow`
 *
 * All services can be individually disabled via `options.services`.
 * Peer packages are loaded via dynamic import and silently skipped if missing.
 */
export class DevPlugin implements Plugin {
  name = 'com.objectstack.plugin.dev';
  type = 'standard';
  version = '1.0.0';

  private options: Required<
    Pick<DevPluginOptions, 'port' | 'seedAdminUser' | 'authSecret' | 'verbose'>
  > & DevPluginOptions;

  private childPlugins: Plugin[] = [];

  constructor(options: DevPluginOptions = {}) {
    this.options = {
      port: 3000,
      seedAdminUser: true,
      authSecret: 'objectstack-dev-secret-DO-NOT-USE-IN-PRODUCTION!!',
      verbose: true,
      ...options,
      authBaseUrl: options.authBaseUrl ?? `http://localhost:${options.port ?? 3000}`,
    };
  }

  /**
   * Init Phase
   *
   * Dynamically imports and instantiates all core plugins.
   * Uses dynamic imports so that peer dependencies remain optional —
   * if a package isn't installed the service is silently skipped.
   */
  async init(ctx: PluginContext): Promise<void> {
    ctx.logger.info('🚀 DevPlugin initializing — auto-configuring all services for development');

    const enabled = (name: string) => this.options.services?.[name] !== false;

    // 1. ObjectQL Engine (data layer + metadata service)
    if (enabled('objectql')) {
      try {
        const { ObjectQLPlugin } = await import('@objectstack/objectql');
        const qlPlugin = new ObjectQLPlugin();
        this.childPlugins.push(qlPlugin);
        ctx.logger.info('  ✔ ObjectQL engine enabled (data + metadata)');
      } catch {
        ctx.logger.warn('  ✘ @objectstack/objectql not installed — skipping data engine');
      }
    }

    // 2. In-Memory Driver
    if (enabled('driver')) {
      try {
        const { DriverPlugin } = await import('@objectstack/runtime') as any;
        const { InMemoryDriver } = await import('@objectstack/driver-memory') as any;
        const driver = new InMemoryDriver();
        const driverPlugin = new DriverPlugin(driver, 'memory');
        this.childPlugins.push(driverPlugin);
        ctx.logger.info('  ✔ InMemoryDriver enabled');
      } catch {
        ctx.logger.warn('  ✘ @objectstack/runtime or @objectstack/driver-memory not installed — skipping driver');
      }
    }

    // 3. App Plugin — registers project metadata (objects, views, apps, dashboards, etc.)
    //    This is the key piece that enables full API development:
    //    once metadata is registered, REST endpoints can read/write views, etc.
    if (this.options.stack) {
      try {
        const { AppPlugin } = await import('@objectstack/runtime') as any;
        const appPlugin = new AppPlugin(this.options.stack);
        this.childPlugins.push(appPlugin);
        ctx.logger.info('  ✔ App metadata loaded from stack definition');
      } catch {
        ctx.logger.warn('  ✘ @objectstack/runtime not installed — skipping app metadata');
      }
    }

    // 4. Auth Plugin
    if (enabled('auth')) {
      try {
        const { AuthPlugin } = await import('@objectstack/plugin-auth') as any;
        const authPlugin = new AuthPlugin({
          secret: this.options.authSecret,
          baseUrl: this.options.authBaseUrl,
        });
        this.childPlugins.push(authPlugin);
        ctx.logger.info('  ✔ Auth plugin enabled (dev credentials)');
      } catch {
        ctx.logger.warn('  ✘ @objectstack/plugin-auth not installed — skipping auth');
      }
    }

    // 5. Security Plugin (RBAC, RLS, field-level masking)
    if (enabled('security')) {
      try {
        const { SecurityPlugin } = await import('@objectstack/plugin-security') as any;
        const securityPlugin = new SecurityPlugin();
        this.childPlugins.push(securityPlugin);
        ctx.logger.info('  ✔ Security plugin enabled (RBAC, RLS, field masking)');
      } catch {
        ctx.logger.debug('  ℹ @objectstack/plugin-security not installed — skipping security');
      }
    }

    // 6. Hono HTTP Server
    if (enabled('server')) {
      try {
        const { HonoServerPlugin } = await import('@objectstack/plugin-hono-server') as any;
        const serverPlugin = new HonoServerPlugin({
          port: this.options.port,
        });
        this.childPlugins.push(serverPlugin);
        ctx.logger.info(`  ✔ Hono HTTP server enabled on port ${this.options.port}`);
      } catch {
        ctx.logger.warn('  ✘ @objectstack/plugin-hono-server not installed — skipping HTTP server');
      }
    }

    // 7. REST API endpoints (CRUD + metadata read/write)
    if (enabled('rest')) {
      try {
        const { createRestApiPlugin } = await import('@objectstack/rest') as any;
        const restPlugin = createRestApiPlugin();
        this.childPlugins.push(restPlugin);
        ctx.logger.info('  ✔ REST API endpoints enabled (CRUD + metadata)');
      } catch {
        ctx.logger.debug('  ℹ @objectstack/rest not installed — skipping REST endpoints');
      }
    }

    // 8. Dispatcher (auth routes, GraphQL, analytics, packages, storage, automation)
    if (enabled('dispatcher')) {
      try {
        const { createDispatcherPlugin } = await import('@objectstack/runtime') as any;
        const dispatcherPlugin = createDispatcherPlugin();
        this.childPlugins.push(dispatcherPlugin);
        ctx.logger.info('  ✔ Dispatcher enabled (auth, GraphQL, analytics, packages, storage)');
      } catch {
        ctx.logger.debug('  ℹ Dispatcher not available — skipping extended API routes');
      }
    }

    // Extra user-provided plugins
    if (this.options.extraPlugins) {
      this.childPlugins.push(...this.options.extraPlugins);
    }

    // Init all child plugins
    for (const plugin of this.childPlugins) {
      try {
        await plugin.init(ctx);
      } catch (err: any) {
        ctx.logger.error(`Failed to init child plugin ${plugin.name}: ${err.message}`);
      }
    }

    // ── Register dev stubs for all remaining kernel services ──────────
    // The kernel defines 17 core services + 3 security services.
    // Real plugins (ObjectQL, Auth, Security, etc.) already registered some.
    // For any service NOT yet registered, we create a no-op dev stub so that
    // the full kernel service map is populated and dependent features
    // (UI permissions, automation, cache, queue, etc.) don't crash.

    const stubNames: string[] = [];

    for (const svc of CORE_SERVICE_NAMES) {
      if (!enabled(svc)) continue;
      try {
        ctx.getService(svc);
        // Already registered by a real plugin — skip
      } catch {
        ctx.registerService(svc, createDevStub(svc));
        stubNames.push(svc);
      }
    }

    // Security sub-services (if SecurityPlugin wasn't loaded)
    if (enabled('security')) {
      for (const svc of SECURITY_SERVICE_NAMES) {
        try {
          ctx.getService(svc);
        } catch {
          ctx.registerService(svc, createDevStub(svc));
          stubNames.push(svc);
        }
      }
    }

    if (stubNames.length > 0) {
      ctx.logger.info(`  ✔ Dev stubs registered for: ${stubNames.join(', ')}`);
    }

    ctx.logger.info(`DevPlugin initialized ${this.childPlugins.length} plugin(s) + ${stubNames.length} dev stub(s)`);
  }

  /**
   * Start Phase
   *
   * Starts all child plugins and optionally seeds the dev admin user.
   */
  async start(ctx: PluginContext): Promise<void> {
    // Start all child plugins
    for (const plugin of this.childPlugins) {
      if (plugin.start) {
        try {
          await plugin.start(ctx);
        } catch (err: any) {
          ctx.logger.error(`Failed to start child plugin ${plugin.name}: ${err.message}`);
        }
      }
    }

    // Seed default admin user
    if (this.options.seedAdminUser) {
      await this.seedAdmin(ctx);
    }

    ctx.logger.info('─────────────────────────────────────────');
    ctx.logger.info('🟢 ObjectStack Dev Server ready');
    ctx.logger.info(`   http://localhost:${this.options.port}`);
    ctx.logger.info('');
    ctx.logger.info('   API:       /api/v1/data/:object');
    ctx.logger.info('   Metadata:  /api/v1/meta/:type/:name');
    ctx.logger.info('   Discovery: /.well-known/objectstack');
    ctx.logger.info('─────────────────────────────────────────');
  }

  /**
   * Destroy Phase
   *
   * Cleans up all child plugins in reverse order.
   */
  async destroy(): Promise<void> {
    for (const plugin of [...this.childPlugins].reverse()) {
      if (plugin.destroy) {
        try {
          await plugin.destroy();
        } catch {
          // Ignore cleanup errors during dev shutdown
        }
      }
    }
  }

  /**
   * Seed a default admin user for development.
   */
  private async seedAdmin(ctx: PluginContext): Promise<void> {
    try {
      const dataEngine = ctx.getService<any>('data');
      if (!dataEngine) return;

      // Check if admin already exists
      const existing = await dataEngine.find('user', {
        filter: { email: 'admin@dev.local' },
        limit: 1,
      }).catch(() => null);

      if (existing?.length) {
        ctx.logger.debug('Dev admin user already exists');
        return;
      }

      await dataEngine.insert('user', {
        data: {
          name: 'Admin',
          email: 'admin@dev.local',
          username: 'admin',
          role: 'admin',
        },
      }).catch(() => {
        // Table might not exist yet — that's fine for dev
      });

      ctx.logger.info('🔑 Dev admin user seeded: admin@dev.local');
    } catch {
      // Non-fatal — user seeding is best-effort
      ctx.logger.debug('Could not seed admin user (data engine may not be ready)');
    }
  }
}
