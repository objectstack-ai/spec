import { ObjectStackKernel } from './kernel.js';

/**
 * Legacy RuntimeContext (Backward Compatibility)
 * @deprecated Use PluginContext instead
 */
export interface RuntimeContext {
    engine: ObjectStackKernel;
}

/**
 * Legacy RuntimePlugin (Backward Compatibility)
 * @deprecated Use Plugin interface instead
 */
export interface RuntimePlugin {
    name: string;
    install?: (ctx: RuntimeContext) => void | Promise<void>;
    onStart?: (ctx: RuntimeContext) => void | Promise<void>;
}

/**
 * PluginContext - Runtime context available to plugins
 * 
 * Provides access to:
 * - Service registry (registerService/getService)
 * - Event/Hook system (hook/trigger)
 * - Logger
 */
export interface PluginContext {
    /**
     * Register a service that can be consumed by other plugins
     * @param name - Service name (e.g., 'db', 'http-server', 'objectql')
     * @param service - Service instance
     */
    registerService(name: string, service: any): void;

    /**
     * Get a service registered by another plugin
     * @param name - Service name
     * @returns Service instance
     * @throws Error if service not found
     */
    getService<T>(name: string): T;

    /**
     * Register a hook handler
     * @param name - Hook name (e.g., 'kernel:ready', 'data:beforeInsert')
     * @param handler - Hook handler function
     */
    hook(name: string, handler: Function): void;

    /**
     * Trigger a hook
     * @param name - Hook name
     * @param args - Arguments to pass to hook handlers
     */
    trigger(name: string, ...args: any[]): Promise<void>;

    /**
     * Logger instance
     */
    logger: Console;
}

/**
 * Plugin - Standard plugin interface
 * 
 * Plugins are independent modules with standard lifecycle hooks.
 * They can declare dependencies on other plugins and register services.
 */
export interface Plugin {
    /**
     * Plugin name (unique identifier)
     */
    name: string;

    /**
     * Plugin version (optional)
     */
    version?: string;

    /**
     * Plugin type (optional, for special plugins like 'objectql')
     */
    type?: string;

    /**
     * Dependencies - list of plugin names this plugin depends on
     * Kernel will ensure dependencies are initialized first
     */
    dependencies?: string[];

    /**
     * Init phase - Register services and prepare plugin
     * Called during kernel bootstrap, before start phase
     * 
     * @param ctx - Plugin context
     */
    init(ctx: PluginContext): Promise<void>;

    /**
     * Start phase - Execute business logic, start servers, connect to databases
     * Called after all plugins have been initialized
     * 
     * @param ctx - Plugin context
     */
    start?(ctx: PluginContext): Promise<void>;

    /**
     * Destroy phase - Cleanup resources, close connections
     * Called during kernel shutdown
     */
    destroy?(): Promise<void>;
}
