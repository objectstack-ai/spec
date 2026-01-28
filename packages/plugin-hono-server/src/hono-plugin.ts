import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { 
    Plugin, 
    PluginContext, 
    ObjectStackRuntimeProtocol 
} from '@objectstack/runtime';

export interface HonoPluginOptions {
    port?: number;
    staticRoot?: string;
}

/**
 * Hono Server Plugin
 * 
 * Provides HTTP server capabilities using Hono framework.
 * Registers routes for ObjectStack Runtime Protocol.
 * 
 * Dependencies: None (can work standalone)
 * Services: 
 * - 'http-server': Hono app instance
 * 
 * @example
 * const server = new HonoServerPlugin({ port: 3000 });
 * kernel.use(server);
 */
export class HonoServerPlugin implements Plugin {
    name = 'com.objectstack.server.hono';
    version = '1.0.0';
    
    private options: HonoPluginOptions;
    private app: Hono;
    private server: any;

    constructor(options: HonoPluginOptions = {}) {
        this.options = { 
            port: 3000,
            ...options
        };
        this.app = new Hono();
    }

    /**
     * Init phase - Setup HTTP server and register as service
     */
    async init(ctx: PluginContext) {
        // Middleware
        this.app.use('*', logger());
        this.app.use('*', cors());

        // Register HTTP server service
        ctx.registerService('http-server', this.app);
        ctx.logger.log('[HonoServerPlugin] HTTP server service registered');
    }

    /**
     * Start phase - Bind routes and start listening
     */
    async start(ctx: PluginContext) {
        // Get ObjectQL directly from services
        let protocol: ObjectStackRuntimeProtocol | null = null;
        
        try {
            const objectql = ctx.getService<any>('objectql');
            // For now, we create a minimal protocol wrapper
            // In future, we'd refactor protocol to work with services directly
            protocol = {
                getDiscovery: () => ({
                    name: 'ObjectOS Server',
                    version: '1.0.0',
                    environment: process.env.NODE_ENV || 'development',
                }),
            } as any;
        } catch (e) {
            ctx.logger.log('[HonoServerPlugin] ObjectQL service not found, skipping protocol routes');
        }

        // Register protocol routes if available
        if (protocol) {
            this.app.get('/api/v1', (c) => c.json(protocol!.getDiscovery()));
        }

        // Static files
        if (this.options.staticRoot) {
            this.app.get('/', serveStatic({ root: this.options.staticRoot, path: 'index.html' }));
            this.app.get('/*', serveStatic({ root: this.options.staticRoot }));
        }

        // Start server on kernel:ready hook
        ctx.hook('kernel:ready', () => {
            const port = this.options.port;
            ctx.logger.log('[HonoServerPlugin] Starting server...');
            ctx.logger.log(`✅ Server is running on http://localhost:${port}`);
            
            this.server = serve({
                fetch: this.app.fetch,
                port
            });
        });
    }

    /**
     * Destroy phase - Stop server
     */
    async destroy() {
        // Note: Hono's serve function may not return a server with close method
        // This is a best-effort cleanup
        if (this.server && typeof this.server.close === 'function') {
            this.server.close();
            console.log('[HonoServerPlugin] Server stopped');
        }
    }
}
