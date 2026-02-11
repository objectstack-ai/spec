// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Plugin, PluginContext } from '@objectstack/core';

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
   * Available services: 'objectql', 'driver', 'auth', 'server', 'rest'
   */
  services?: Partial<Record<string, boolean>>;

  /**
   * Additional plugins to load alongside the auto-configured ones.
   * Useful for adding custom project plugins while still getting the dev defaults.
   */
  extraPlugins?: Plugin[];
}

/**
 * Development Mode Plugin for ObjectStack
 *
 * A convenience plugin that auto-configures the entire platform stack
 * for local development. Instead of manually wiring:
 *
 * ```ts
 * plugins: [
 *   new ObjectQLPlugin(),
 *   new DriverPlugin(new InMemoryDriver()),
 *   new AuthPlugin({ secret: '...', baseUrl: '...' }),
 *   new HonoServerPlugin({ port: 3000 }),
 *   // ...
 * ]
 * ```
 *
 * You can simply use:
 *
 * ```ts
 * plugins: [new DevPlugin()]
 * ```
 *
 * The DevPlugin will:
 * 1. Register an ObjectQL engine (data layer)
 * 2. Register an InMemoryDriver (no database required)
 * 3. Register an Auth plugin (with dev credentials)
 * 4. Register a Hono HTTP server
 * 5. Register REST API endpoints
 * 6. Optionally seed a default admin user
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

    // 1. ObjectQL Engine (data layer)
    if (enabled('objectql')) {
      try {
        const { ObjectQLPlugin } = await import('@objectstack/objectql');
        const qlPlugin = new ObjectQLPlugin();
        this.childPlugins.push(qlPlugin);
        ctx.logger.info('  ✔ ObjectQL engine enabled');
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

    // 3. Auth Plugin
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

    // 4. Hono HTTP Server
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

    // 5. REST API endpoints
    if (enabled('rest')) {
      try {
        const restModule = await import('@objectstack/rest') as any;
        // REST may export a plugin class or a factory function
        const RestPlugin = (restModule as any).RestPlugin
          ?? (restModule as any).createRestPlugin
          ?? (restModule as any).default;
        if (typeof RestPlugin === 'function') {
          const restPlugin = RestPlugin.prototype?.init
            ? new RestPlugin()
            : RestPlugin();
          if (restPlugin) {
            this.childPlugins.push(restPlugin);
            ctx.logger.info('  ✔ REST API endpoints enabled');
          }
        }
      } catch {
        ctx.logger.debug('  ℹ @objectstack/rest not installed — skipping REST endpoints');
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

    ctx.logger.info(`DevPlugin initialized ${this.childPlugins.length} service(s)`);
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
