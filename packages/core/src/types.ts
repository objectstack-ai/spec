import { ObjectKernel } from './kernel.js';
import type { Logger } from '@objectstack/spec/contracts';

/**
 * PluginContext - Runtime context available to plugins
 * 
 * Provides access to:
 * - Service registry (registerService/getService)
 * - Event/Hook system (hook/trigger)
 * - Logger
 * - Kernel instance (for advanced use cases)
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
     * Get all registered services
     */
    getServices(): Map<string, any>;

    /**
     * Register a hook handler
     * @param name - Hook name (e.g., 'kernel:ready', 'data:beforeInsert')
     * @param handler - Hook handler function
     */
    hook(name: string, handler: (...args: any[]) => void | Promise<void>): void;

    /**
     * Trigger a hook
     * @param name - Hook name
     * @param args - Arguments to pass to hook handlers
     */
    trigger(name: string, ...args: any[]): Promise<void>;

    /**
     * Logger instance
     */
    logger: Logger;
    
    /**
     * Get the kernel instance (for advanced use cases)
     * @returns Kernel instance
     */
    getKernel(): ObjectKernel;
}

/**
 * Plugin Interface
 * 
 * All ObjectStack plugins must implement this interface.
 */
export interface Plugin {
    /**
     * Unique plugin name (e.g., 'com.objectstack.engine.objectql')
     */
    name: string;

    /**
     * Plugin version
     */
    version?: string;

    /**
     * List of other plugin names that this plugin depends on.
     * The kernel ensures these plugins are initialized before this one.
     */
    dependencies?: string[];

    /**
     * Init Phase: Register services
     * Called when kernel is initializing.
     * Use this to register services that other plugins might need.
     */
    init(ctx: PluginContext): Promise<void> | void;

    /**
     * Start Phase: Execute business logic
     * Called after all plugins have been initialized.
     * Use this to start servers, connect to DBs, or execute main logic.
     */
    start?(ctx: PluginContext): Promise<void> | void;

    /**
     * Destroy Phase: Cleanup
     * Called when kernel is shutting down.
     */
    destroy?(): Promise<void> | void;
}
