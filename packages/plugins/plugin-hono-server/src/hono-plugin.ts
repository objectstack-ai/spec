import { Plugin, PluginContext, IHttpServer, ApiRegistry } from '@objectstack/core';
import { ObjectStackProtocol } from '@objectstack/spec/api';
import { 
    ApiRegistryEntryInput,
    ApiEndpointRegistrationInput,
    RestServerConfig,
} from '@objectstack/spec/api';
import { HonoHttpServer } from './adapter';
import { createHonoApp } from '@objectstack/hono';
import { serveStatic } from '@hono/node-server/serve-static';

export interface HonoPluginOptions {
    port?: number;
    staticRoot?: string;
    /**
     * REST server configuration
     * Controls automatic endpoint generation and API behavior
     */
    restConfig?: RestServerConfig;
    /**
     * Whether to register standard ObjectStack CRUD endpoints
     * @default true
     */
    registerStandardEndpoints?: boolean;
    /**
     * Whether to load endpoints from API Registry
     * @default true
     */
    useApiRegistry?: boolean;

    /**
     * Whether to enable SPA fallback
     * If true, returns index.html for non-API 404s
     * @default false
     */
    spaFallback?: boolean;
}

/**
 * Hono Server Plugin
 * 
 * Provides HTTP server capabilities using Hono framework.
 * Registers routes for ObjectStack Runtime Protocol.
 */
export class HonoServerPlugin implements Plugin {
    name = 'com.objectstack.server.hono';
    version = '0.9.0';
    
    // Constants
    private static readonly DEFAULT_ENDPOINT_PRIORITY = 100;
    private static readonly CORE_ENDPOINT_PRIORITY = 950;
    private static readonly DISCOVERY_ENDPOINT_PRIORITY = 900;
    
    private options: HonoPluginOptions;
    private server: HonoHttpServer;

    constructor(options: HonoPluginOptions = {}) {
        this.options = { 
            port: 3000,
            registerStandardEndpoints: true,
            useApiRegistry: true,
            spaFallback: false,
            ...options
        };
        // We handle static root manually in start() to support SPA fallback
        this.server = new HonoHttpServer(this.options.port);
    }

    /**
     * Init phase - Setup HTTP server and register as service
     */
    init = async (ctx: PluginContext) => {
        ctx.logger.debug('Initializing Hono server plugin', { 
            port: this.options.port,
            staticRoot: this.options.staticRoot 
        });
        
        // Register HTTP server service as IHttpServer
        // Register as 'http.server' to match core requirements
        ctx.registerService('http.server', this.server);
        // Alias 'http-server' for backward compatibility
        ctx.registerService('http-server', this.server);
        ctx.logger.debug('HTTP server service registered', { serviceName: 'http.server' });
    }

    /**
     * Start phase - Bind routes and start listening
     */
    start = async (ctx: PluginContext) => {
        ctx.logger.debug('Starting Hono server plugin');
        
        // Use Standard ObjectStack Runtime Hono App
        try {
            const kernel = ctx.getKernel();
            const config = this.options.restConfig || {};
            // Calculate prefix similar to before
            const apiVersion = config.api?.version || 'v1';
            const basePath = config.api?.basePath || '/api';
            const apiPath = config.api?.apiPath || `${basePath}/${apiVersion}`;
            
            const app = createHonoApp({ 
                kernel,
                prefix: apiPath // Use the calculated path
            });
            
            ctx.logger.debug('Mounting ObjectStack Runtime App', { prefix: apiPath });
            // Use the mount method we added to HonoHttpServer
            this.server.mount('/', app as any);

        } catch (e: any) {
             ctx.logger.error('Failed to create standard Hono app', e);
        }

        // Configure Static Files & SPA Fallback
        if (this.options.staticRoot) {
            const rawApp = this.server.getRawApp();
            const staticRoot = this.options.staticRoot;
            
            ctx.logger.debug('Configuring static files', { root: staticRoot, spa: this.options.spaFallback });
            
            // 1. Static Files
            rawApp.get('/*', serveStatic({ root: staticRoot }));
            
            // 2. SPA Fallback
            if (this.options.spaFallback) {
                rawApp.get('*', async (c, next) => {
                    // Skip API paths
                    const config = this.options.restConfig || {};
                    const basePath = config.api?.basePath || '/api';
                    
                    if (c.req.path.startsWith(basePath)) {
                        return next();
                    }
                    
                    // Fallback to index.html
                    return serveStatic({ 
                        root: staticRoot,
                        rewriteRequestPath: () => 'index.html'
                    })(c, next);
                });
            }
        }

        // Start server on kernel:ready hook
        ctx.hook('kernel:ready', async () => {
            const port = this.options.port || 3000;
            ctx.logger.debug('Starting HTTP server', { port });
            
            await this.server.listen(port);
            
            const actualPort = this.server.getPort();
            ctx.logger.info('HTTP server started successfully', { 
                port: actualPort, 
                url: `http://localhost:${actualPort}` 
            });
        });
    }

    /**
     * Destroy phase - Stop server
     */
    async destroy() {
        this.server.close();
        // Note: Can't use ctx.logger here since we're in destroy
        console.log('[HonoServerPlugin] Server stopped');
    }
}
