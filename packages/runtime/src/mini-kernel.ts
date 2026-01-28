import { Plugin, PluginContext, RuntimePlugin, RuntimeContext } from './types.js';
import { SchemaRegistry, ObjectQL } from '@objectstack/objectql';

/**
 * ObjectKernel - MiniKernel Architecture
 * 
 * A highly modular, plugin-based microkernel that:
 * - Manages plugin lifecycle (init, start, destroy)
 * - Provides dependency injection via service registry
 * - Implements event/hook system for inter-plugin communication
 * - Handles dependency resolution (topological sort)
 * 
 * Core philosophy:
 * - Business logic is completely separated into plugins
 * - Kernel only manages lifecycle, DI, and hooks
 * - Plugins are loaded as equal building blocks
 */
export class ObjectKernel {
    private plugins: Map<string, Plugin | RuntimePlugin> = new Map();
    private services: Map<string, any> = new Map();
    private hooks: Map<string, Array<(...args: any[]) => void | Promise<void>>> = new Map();
    private state: 'idle' | 'initializing' | 'running' | 'stopped' = 'idle';

    /**
     * Plugin context - shared across all plugins
     */
    private context: PluginContext = {
        registerService: (name, service) => {
            if (this.services.has(name)) {
                throw new Error(`[Kernel] Service '${name}' already registered`);
            }
            this.services.set(name, service);
            this.context.logger.log(`[Kernel] Service '${name}' registered`);
        },
        getService: <T>(name: string) => {
            const service = this.services.get(name);
            if (!service) {
                throw new Error(`[Kernel] Service '${name}' not found`);
            }
            return service as T;
        },
        hook: (name, handler) => {
            if (!this.hooks.has(name)) {
                this.hooks.set(name, []);
            }
            this.hooks.get(name)!.push(handler);
        },
        trigger: async (name, ...args) => {
            const handlers = this.hooks.get(name) || [];
            for (const handler of handlers) {
                await handler(...args);
            }
        },
        logger: console,
        getKernel: () => this,
    };

    /**
     * Register a plugin
     * @param plugin - Plugin instance
     */
    use(plugin: Plugin | RuntimePlugin) {
        if (this.state !== 'idle') {
            throw new Error('[Kernel] Cannot register plugins after bootstrap has started');
        }

        const pluginName = plugin.name;
        if (this.plugins.has(pluginName)) {
            throw new Error(`[Kernel] Plugin '${pluginName}' already registered`);
        }

        this.plugins.set(pluginName, plugin);
        return this;
    }

    /**
     * Resolve plugin dependencies using topological sort
     * @returns Ordered list of plugins
     */
    private resolveDependencies(): (Plugin | RuntimePlugin)[] {
        const resolved: (Plugin | RuntimePlugin)[] = [];
        const visited = new Set<string>();
        const visiting = new Set<string>();

        const visit = (pluginName: string) => {
            if (visited.has(pluginName)) return;
            
            if (visiting.has(pluginName)) {
                throw new Error(`[Kernel] Circular dependency detected: ${pluginName}`);
            }

            const plugin = this.plugins.get(pluginName);
            if (!plugin) {
                throw new Error(`[Kernel] Plugin '${pluginName}' not found`);
            }

            visiting.add(pluginName);

            // Visit dependencies first (for new Plugin interface)
            const deps = this.isNewPlugin(plugin) ? plugin.dependencies || [] : [];
            for (const dep of deps) {
                if (!this.plugins.has(dep)) {
                    throw new Error(`[Kernel] Dependency '${dep}' not found for plugin '${pluginName}'`);
                }
                visit(dep);
            }

            visiting.delete(pluginName);
            visited.add(pluginName);
            resolved.push(plugin);
        };

        // Visit all plugins
        for (const pluginName of this.plugins.keys()) {
            visit(pluginName);
        }

        return resolved;
    }

    /**
     * Type guard to check if plugin uses new interface
     */
    private isNewPlugin(plugin: Plugin | RuntimePlugin): plugin is Plugin {
        return 'init' in plugin;
    }

    /**
     * Bootstrap the kernel
     * 1. Resolve dependencies (topological sort)
     * 2. Init phase - plugins register services
     * 3. Start phase - plugins execute business logic
     * 4. Trigger 'kernel:ready' hook
     */
    async bootstrap() {
        if (this.state !== 'idle') {
            throw new Error('[Kernel] Kernel already bootstrapped');
        }

        this.state = 'initializing';
        this.context.logger.log('[Kernel] Bootstrap started...');

        // Resolve dependencies
        const orderedPlugins = this.resolveDependencies();

        // Phase 1: Init - Plugins register services
        this.context.logger.log('[Kernel] Phase 1: Init plugins...');
        for (const plugin of orderedPlugins) {
            if (this.isNewPlugin(plugin)) {
                this.context.logger.log(`[Kernel] Init: ${plugin.name}`);
                await plugin.init(this.context);
            } else {
                // Legacy RuntimePlugin support
                this.context.logger.log(`[Kernel] Init (legacy): ${plugin.name}`);
                if (plugin.install) {
                    await plugin.install({ engine: this as any });
                }
                // Also handle old manifest-style plugins
                if ('objects' in plugin) {
                    SchemaRegistry.registerPlugin(plugin as any);
                    const objects = (plugin as any).objects;
                    if (objects) {
                        for (const obj of objects) {
                            SchemaRegistry.registerObject(obj);
                            this.context.logger.log(`[Kernel] Registered Object: ${obj.name}`);
                        }
                    }
                }
            }
        }

        // Phase 2: Start - Plugins execute business logic
        this.context.logger.log('[Kernel] Phase 2: Start plugins...');
        this.state = 'running';
        for (const plugin of orderedPlugins) {
            if (this.isNewPlugin(plugin)) {
                if (plugin.start) {
                    this.context.logger.log(`[Kernel] Start: ${plugin.name}`);
                    await plugin.start(this.context);
                }
            } else {
                // Legacy RuntimePlugin support
                if (plugin.onStart) {
                    this.context.logger.log(`[Kernel] Start (legacy): ${plugin.name}`);
                    await plugin.onStart({ engine: this as any });
                }
            }
        }

        // Phase 3: Trigger kernel:ready hook
        this.context.logger.log('[Kernel] Triggering kernel:ready hook...');
        await this.context.trigger('kernel:ready');

        this.context.logger.log('[Kernel] ✅ Bootstrap complete');
    }

    /**
     * Shutdown the kernel
     * Calls destroy on all plugins in reverse order
     */
    async shutdown() {
        if (this.state !== 'running') {
            throw new Error('[Kernel] Kernel not running');
        }

        this.context.logger.log('[Kernel] Shutdown started...');
        this.state = 'stopped';

        const orderedPlugins = Array.from(this.plugins.values()).reverse();
        for (const plugin of orderedPlugins) {
            if (this.isNewPlugin(plugin) && plugin.destroy) {
                this.context.logger.log(`[Kernel] Destroy: ${plugin.name}`);
                await plugin.destroy();
            }
        }

        this.context.logger.log('[Kernel] ✅ Shutdown complete');
    }

    /**
     * Get a service from the registry
     * Convenience method for external access
     */
    getService<T>(name: string): T {
        return this.context.getService<T>(name);
    }

    /**
     * Check if kernel is running
     */
    isRunning(): boolean {
        return this.state === 'running';
    }

    /**
     * Get kernel state
     */
    getState(): string {
        return this.state;
    }
}
