import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { SchemaRegistry, DataEngine } from '@objectstack/runtime';
import { ServerPlugin } from './plugin';
import { CoreRestApiPlugin } from './plugins/rest-api';

export * from './plugin';
export { CoreRestApiPlugin };
export { HonoServerPlugin } from './hono-plugin';

export interface ServerConfig {
  port?: number;
  static?: {
    root: string;
    path?: string;
  };
  logger?: boolean;
  /**
   * List of plugins to load.
   * Can include ObjectStack Manifests (Apps) or ServerPlugins (Runtime Logic).
   */
  plugins?: any[];
}

export class ObjectStackServer {
  public app: Hono;
  public engine: DataEngine;
  private config: ServerConfig;
  private runtimePlugins: ServerPlugin[] = [];

  constructor(config: ServerConfig = {}) {
    this.config = {
      port: 3000,
      logger: true,
      plugins: [],
      ...config
    };

    this.app = new Hono();
    
    // Separate Manifests (DataEngine) from Runtime Plugins (Server)
    const manifests: any[] = [];
    
    // Always load Core REST API first (it can be overridden if needed, but it's core)
    this.runtimePlugins.push(CoreRestApiPlugin);

    if (this.config.plugins) {
        this.config.plugins.forEach(p => {
            if (this.isServerPlugin(p)) {
                this.runtimePlugins.push(p);
            } else {
                manifests.push(p);
            }
        });
    }

    // Initialize Engine with Manifests
    this.engine = new DataEngine(manifests);

    this.initializeMiddleware();
    this.initializePlugins();
    this.initializeStatic();
  }

  private isServerPlugin(p: any): p is ServerPlugin {
      return p && typeof p.install === 'function';
  }

  private initializeMiddleware() {
    if (this.config.logger) {
      this.app.use('*', logger());
    }
    this.app.use('*', cors());
  }

  private initializePlugins() {
      console.log(`[Server] Loading ${this.runtimePlugins.length} runtime plugins...`);
      for (const plugin of this.runtimePlugins) {
          console.log(`[Server] Installing plugin: ${plugin.name}`);
          plugin.install(this);
      }
  }

  private initializeStatic() {
    if (this.config.static) {
      const root = this.config.static.root;
      this.app.get('/', serveStatic({ root, path: this.config.static.path || 'index.html' }));
      this.app.get('/*', serveStatic({ root }));
    }
  }

  public async start() {
    console.log('--- Starting ObjectStack Server ---');
    await this.engine.start();
    
    console.log(`Server is running on http://localhost:${this.config.port}`);
    
    serve({
      fetch: this.app.fetch,
      port: this.config.port
    });
  }
}

