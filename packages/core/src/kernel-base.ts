import type { Plugin, PluginContext } from './types.js';
import type { Logger } from '@objectstack/spec/contracts';
import type { IServiceRegistry } from '@objectstack/spec/contracts';

/**
 * Kernel state machine
 */
export type KernelState = 'idle' | 'initializing' | 'running' | 'stopping' | 'stopped';

/**
 * ObjectKernelBase - Abstract Base Class for Microkernel
 * 
 * Provides common functionality for ObjectKernel and LiteKernel:
 * - Plugin management (Map storage)
 * - Dependency resolution (topological sort)
 * - Hook/Event system
 * - Context creation
 * - State validation
 * 
 * This eliminates code duplication between the implementations.
 */
export abstract class ObjectKernelBase {
    protected plugins: Map<string, Plugin> = new Map();
    protected services: IServiceRegistry | Map<string, any> = new Map();
    protected hooks: Map<string, Array<(...args: any[]) => void | Promise<void>>> = new Map();
    protected state: KernelState = 'idle';
    protected logger: Logger;
    protected context!: PluginContext;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    /**
     * Validate kernel state
     * @param requiredState - Required state for the operation
     * @throws Error if current state doesn't match
     */
    protected validateState(requiredState: KernelState): void {
        if (this.state !== requiredState) {
            throw new Error(
                `[Kernel] Invalid state: expected '${requiredState}', got '${this.state}'`
            );
        }
    }

    /**
     * Validate kernel is in idle state (for plugin registration)
     */
    protected validateIdle(): void {
        if (this.state !== 'idle') {
            throw new Error('[Kernel] Cannot register plugins after bootstrap has started');
        }
    }

    /**
     * Create the plugin context
     * Subclasses can override to customize context creation
     */
    protected createContext(): PluginContext {
        return {
            registerService: (name, service) => {
                if (this.services instanceof Map) {
                    if (this.services.has(name)) {
                        throw new Error(`[Kernel] Service '${name}' already registered`);
                    }
                    this.services.set(name, service);
                } else {
                    // IServiceRegistry implementation
                    this.services.register(name, service);
                }
                this.logger.info(`Service '${name}' registered`, { service: name });
            },
            getService: <T>(name: string): T => {
                if (this.services instanceof Map) {
                    const service = this.services.get(name);
                    if (!service) {
                        throw new Error(`[Kernel] Service '${name}' not found`);
                    }
                    return service as T;
                } else {
                    // IServiceRegistry implementation
                    return this.services.get<T>(name);
                }
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
            getServices: () => {
                if (this.services instanceof Map) {
                    return new Map(this.services);
                } else {
                    // For IServiceRegistry, we need to return the underlying Map
                    // This is a compatibility method
                    return new Map();
                }
            },
            logger: this.logger,
            getKernel: () => this as any,
        };
    }

    /**
     * Resolve plugin dependencies using topological sort
     * @returns Ordered list of plugins (dependencies first)
     */
    protected resolveDependencies(): Plugin[] {
        const resolved: Plugin[] = [];
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

            // Visit dependencies first
            const deps = plugin.dependencies || [];
            for (const dep of deps) {
                if (!this.plugins.has(dep)) {
                    throw new Error(
                        `[Kernel] Dependency '${dep}' not found for plugin '${pluginName}'`
                    );
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
     * Run plugin init phase
     * @param plugin - Plugin to initialize
     */
    protected async runPluginInit(plugin: Plugin): Promise<void> {
        const pluginName = plugin.name;
        this.logger.info(`Initializing plugin: ${pluginName}`);
        
        try {
            await plugin.init(this.context);
            this.logger.info(`Plugin initialized: ${pluginName}`);
        } catch (error) {
            this.logger.error(`Plugin init failed: ${pluginName}`, error as Error);
            throw error;
        }
    }

    /**
     * Run plugin start phase
     * @param plugin - Plugin to start
     */
    protected async runPluginStart(plugin: Plugin): Promise<void> {
        if (!plugin.start) return;
        
        const pluginName = plugin.name;
        this.logger.info(`Starting plugin: ${pluginName}`);
        
        try {
            await plugin.start(this.context);
            this.logger.info(`Plugin started: ${pluginName}`);
        } catch (error) {
            this.logger.error(`Plugin start failed: ${pluginName}`, error as Error);
            throw error;
        }
    }

    /**
     * Run plugin destroy phase
     * @param plugin - Plugin to destroy
     */
    protected async runPluginDestroy(plugin: Plugin): Promise<void> {
        if (!plugin.destroy) return;
        
        const pluginName = plugin.name;
        this.logger.info(`Destroying plugin: ${pluginName}`);
        
        try {
            await plugin.destroy();
            this.logger.info(`Plugin destroyed: ${pluginName}`);
        } catch (error) {
            this.logger.error(`Plugin destroy failed: ${pluginName}`, error as Error);
            throw error;
        }
    }

    /**
     * Trigger a hook with all registered handlers
     * @param name - Hook name
     * @param args - Arguments to pass to handlers
     */
    protected async triggerHook(name: string, ...args: any[]): Promise<void> {
        const handlers = this.hooks.get(name) || [];
        this.logger.debug(`Triggering hook: ${name}`, { 
            hook: name, 
            handlerCount: handlers.length 
        });
        
        for (const handler of handlers) {
            try {
                await handler(...args);
            } catch (error) {
                this.logger.error(`Hook handler failed: ${name}`, error as Error);
                // Continue with other handlers even if one fails
            }
        }
    }

    /**
     * Get current kernel state
     */
    getState(): KernelState {
        return this.state;
    }

    /**
     * Get all registered plugins
     */
    getPlugins(): Map<string, Plugin> {
        return new Map(this.plugins);
    }

    /**
     * Abstract methods to be implemented by subclasses
     */
    abstract use(plugin: Plugin): this | Promise<this>;
    abstract bootstrap(): Promise<void>;
    abstract destroy(): Promise<void>;
}
