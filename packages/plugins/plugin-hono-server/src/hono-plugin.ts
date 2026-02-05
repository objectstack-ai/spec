import { Plugin, PluginContext, IHttpServer, ApiRegistry } from '@objectstack/core';
import { ObjectStackProtocol } from '@objectstack/spec/api';
import { 
    ApiRegistryEntryInput,
    ApiEndpointRegistrationInput,
    RestServerConfig,
} from '@objectstack/spec/api';
import { HonoHttpServer } from './adapter';
import { createHonoApp } from '@objectstack/hono';

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
            ...options
        };
        this.server = new HonoHttpServer(this.options.port, this.options.staticRoot);
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
        ctx.registerService('http-server', this.server);
        ctx.logger.info('HTTP server service registered', { serviceName: 'http-server' });
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
            
            ctx.logger.info('Mounting ObjectStack Runtime App', { prefix: apiPath });
            // Use the mount method we added to HonoHttpServer
            this.server.mount('/', app as any);

        } catch (e: any) {
             ctx.logger.error('Failed to create standard Hono app', e);
        }

        // Start server on kernel:ready hook
        ctx.hook('kernel:ready', async () => {
            const port = this.options.port || 3000;
            ctx.logger.info('Starting HTTP server', { port });
            
            await this.server.listen(port);
            ctx.logger.info('HTTP server started successfully', { 
                port, 
                url: `http://localhost:${port}` 
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
