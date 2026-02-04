import { ObjectKernel, Plugin, IHttpServer, ObjectKernelConfig } from '@objectstack/core';
import { HttpServer } from './http-server.js';
import { createApiRegistryPlugin, ApiRegistryConfig } from './api-registry-plugin.js';

export interface RuntimeConfig {
    /**
     * Optional existing server instance (e.g. Hono, Express app)
     * If provided, Runtime will use it as the 'http.server' service.
     * If not provided, Runtime expects a server plugin (like HonoServerPlugin) to be registered manually.
     */
    server?: IHttpServer;
    
    /**
     * API Registry Configuration
     */
    api?: ApiRegistryConfig;

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
 * - API Registry (REST Routes)
 * - Plugin Management
 */
export class Runtime {
    readonly kernel: ObjectKernel;
    
    constructor(config: RuntimeConfig = {}) {
        this.kernel = new ObjectKernel(config.kernel);
        
        // If external server provided, register it immediately
        if (config.server) {
             // If the provided server is not already an HttpServer wrapper, wrap it?
             // Since IHttpServer is the interface, we assume it complies.
             // But HttpServer class in runtime is an adapter.
             // If user passes raw Hono, it won't work unless they wrapped it.
             // We'll assume they pass a compliant IHttpServer.
             this.kernel.registerService('http.server', config.server);
        }
        
        // Register API Registry by default
        // This plugin is passive (wait for services) so it's safe to add early.
        this.kernel.use(createApiRegistryPlugin(config.api));
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
