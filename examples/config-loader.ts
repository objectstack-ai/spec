/**
 * Configuration-Driven Plugin Loader
 * 
 * Demonstrates metadata-driven plugin loading:
 * - Loads plugins from JSON configuration
 * - Supports enable/disable flags
 * - Supports plugin-specific options
 * - Makes the platform truly low-code
 */

import { ObjectKernel, Plugin } from '@objectstack/runtime';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Plugin configuration schema
 */
export interface PluginConfig {
    name: string;
    enabled: boolean;
    module?: string;  // Module path for dynamic loading
    options?: Record<string, any>;
}

/**
 * Kernel configuration schema
 */
export interface KernelConfig {
    version: string;
    plugins: PluginConfig[];
}

/**
 * Plugin registry - maps plugin names to plugin classes/factories
 */
export class PluginRegistry {
    private static registry: Map<string, () => Plugin> = new Map();

    /**
     * Register a plugin factory
     */
    static register(name: string, factory: () => Plugin) {
        this.registry.set(name, factory);
    }

    /**
     * Get a plugin factory by name
     */
    static get(name: string): (() => Plugin) | undefined {
        return this.registry.get(name);
    }

    /**
     * Check if a plugin is registered
     */
    static has(name: string): boolean {
        return this.registry.has(name);
    }
}

/**
 * Load kernel configuration from JSON file
 */
export function loadKernelConfig(configPath: string): KernelConfig {
    const absolutePath = resolve(configPath);
    const content = readFileSync(absolutePath, 'utf-8');
    return JSON.parse(content) as KernelConfig;
}

/**
 * Create kernel from configuration file
 */
export async function createKernelFromConfig(configPath: string): Promise<ObjectKernel> {
    const config = loadKernelConfig(configPath);
    const kernel = new ObjectKernel();

    console.log(`[Config] Loading ObjectStack v${config.version}`);
    console.log(`[Config] Found ${config.plugins.length} plugin(s) in configuration`);

    for (const pluginConfig of config.plugins) {
        if (!pluginConfig.enabled) {
            console.log(`[Config] ⏭️  Skipping disabled plugin: ${pluginConfig.name}`);
            continue;
        }

        // Get plugin factory from registry
        const factory = PluginRegistry.get(pluginConfig.name);
        
        if (!factory) {
            console.warn(`[Config] ⚠️  Plugin not found in registry: ${pluginConfig.name}`);
            continue;
        }

        // Create plugin instance
        const plugin = factory();
        
        // Apply options if provided (this would need plugin-specific handling)
        if (pluginConfig.options) {
            console.log(`[Config] 🔧 Applying options to ${pluginConfig.name}:`, pluginConfig.options);
            // In a real implementation, pass options to plugin constructor
        }

        kernel.use(plugin);
        console.log(`[Config] ✅ Loaded plugin: ${pluginConfig.name}`);
    }

    return kernel;
}

/**
 * Example usage:
 * 
 * // 1. Register plugins
 * PluginRegistry.register('objectstack-data', () => new DataEnginePlugin());
 * PluginRegistry.register('objectstack-flow', () => new FlowEnginePlugin());
 * PluginRegistry.register('objectstack-ui', () => new UiEnginePlugin());
 * 
 * // 2. Create kernel from config
 * const kernel = await createKernelFromConfig('./objectstack.config.json');
 * 
 * // 3. Bootstrap
 * await kernel.bootstrap();
 */
