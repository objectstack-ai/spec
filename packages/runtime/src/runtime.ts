import { ObjectKernel, Plugin, IHttpServer, ObjectKernelConfig } from '@objectstack/core';

export interface RuntimeConfig {
    /**
     * Optional existing server instance (e.g. Hono, Express app)
     * If provided, Runtime will use it as the 'http.server' service.
     * If not provided, Runtime expects a server plugin (like HonoServerPlugin) to be registered manually.
     */
    server?: IHttpServer;

    /**
     * Kernel Configuration
     */
    kernel?: ObjectKernelConfig;
}

/**
 * ObjectStack Runtime
 * 
 * High-level entry point for bootstrapping an ObjectStack application.
 * Wraps ObjectKernel and provides standard orchestration for:
 * - HTTP Server binding
 * - Plugin Management
 * 
 * REST API is opt-in — register it explicitly:
 * ```ts
 * import { createRestApiPlugin } from '@objectstack/rest';
 * runtime.use(createRestApiPlugin());
 * ```
 */
export class Runtime {
    readonly kernel: ObjectKernel;
    
    constructor(config: RuntimeConfig = {}) {
        this.kernel = new ObjectKernel(config.kernel);
        
        // If external server provided, register it immediately
        if (config.server) {
             this.kernel.registerService('http.server', config.server);
        }
    }
    
    /**
     * Register a plugin
     */
    use(plugin: Plugin) {
        this.kernel.use(plugin);
        return this;
    }
    
    /**
     * Start the runtime
     * 1. Initializes all plugins (init phase)
     * 2. Starts all plugins (start phase)
     */
    async start() {
        await this.kernel.bootstrap();
        return this;
    }
    
    /**
     * Get the kernel instance
     */
    getKernel() {
        return this.kernel;
    }
}
