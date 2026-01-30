import { Plugin, PluginContext } from './types.js';
import type { Logger } from './contracts/logger.js';
import { z } from 'zod';

/**
 * Service Lifecycle Types
 * Defines how services are instantiated and managed
 */
export enum ServiceLifecycle {
    /** Single instance shared across all requests */
    SINGLETON = 'singleton',
    /** New instance created for each request */
    TRANSIENT = 'transient',
    /** New instance per scope (e.g., per HTTP request) */
    SCOPED = 'scoped',
}

/**
 * Service Factory
 * Function that creates a service instance
 */
export type ServiceFactory<T = any> = (ctx: PluginContext) => T | Promise<T>;

/**
 * Service Registration Options
 */
export interface ServiceRegistration {
    name: string;
    factory: ServiceFactory;
    lifecycle: ServiceLifecycle;
    dependencies?: string[];
}

/**
 * Plugin Configuration Validator
 * Uses Zod for runtime validation of plugin configurations
 */
export interface PluginConfigValidator {
    schema: z.ZodSchema;
    validate(config: any): any;
}

/**
 * Plugin Metadata with Enhanced Features
 */
export interface PluginMetadata extends Plugin {
    /** Semantic version (e.g., "1.0.0") */
    version: string;
    
    /** Configuration schema for validation */
    configSchema?: z.ZodSchema;
    
    /** Plugin signature for security verification */
    signature?: string;
    
    /** Plugin health check function */
    healthCheck?(): Promise<PluginHealthStatus>;
    
    /** Startup timeout in milliseconds (default: 30000) */
    startupTimeout?: number;
    
    /** Whether plugin supports hot reload */
    hotReloadable?: boolean;
}

/**
 * Plugin Health Status
 */
export interface PluginHealthStatus {
    healthy: boolean;
    message?: string;
    details?: Record<string, any>;
    lastCheck?: Date;
}

/**
 * Plugin Load Result
 */
export interface PluginLoadResult {
    success: boolean;
    plugin?: PluginMetadata;
    error?: Error;
    loadTime?: number;
}

/**
 * Plugin Startup Result
 */
export interface PluginStartupResult {
    success: boolean;
    pluginName: string;
    startTime?: number;
    error?: Error;
    timedOut?: boolean;
}

/**
 * Version Compatibility Result
 */
export interface VersionCompatibility {
    compatible: boolean;
    pluginVersion: string;
    requiredVersion?: string;
    message?: string;
}

/**
 * Enhanced Plugin Loader
 * Provides advanced plugin loading capabilities with validation, security, and lifecycle management
 */
export class PluginLoader {
    private logger: Logger;
    private loadedPlugins: Map<string, PluginMetadata> = new Map();
    private serviceFactories: Map<string, ServiceRegistration> = new Map();
    private serviceInstances: Map<string, any> = new Map();
    private scopedServices: Map<string, Map<string, any>> = new Map();

    constructor(logger: Logger) {
        this.logger = logger;
    }

    /**
     * Load a plugin asynchronously with validation
     */
    async loadPlugin(plugin: Plugin): Promise<PluginLoadResult> {
        const startTime = Date.now();
        
        try {
            this.logger.info(`Loading plugin: ${plugin.name}`);
            
            // Convert to PluginMetadata
            const metadata = this.toPluginMetadata(plugin);
            
            // Validate plugin structure
            this.validatePluginStructure(metadata);
            
            // Check version compatibility
            const versionCheck = this.checkVersionCompatibility(metadata);
            if (!versionCheck.compatible) {
                throw new Error(`Version incompatible: ${versionCheck.message}`);
            }
            
            // Validate configuration if schema is provided
            if (metadata.configSchema) {
                this.validatePluginConfig(metadata);
            }
            
            // Verify signature if provided
            if (metadata.signature) {
                await this.verifyPluginSignature(metadata);
            }
            
            // Store loaded plugin
            this.loadedPlugins.set(metadata.name, metadata);
            
            const loadTime = Date.now() - startTime;
            this.logger.info(`Plugin loaded: ${plugin.name} (${loadTime}ms)`);
            
            return {
                success: true,
                plugin: metadata,
                loadTime,
            };
        } catch (error) {
            this.logger.error(`Failed to load plugin: ${plugin.name}`, error as Error);
            return {
                success: false,
                error: error as Error,
                loadTime: Date.now() - startTime,
            };
        }
    }

    /**
     * Register a service with factory function
     */
    registerServiceFactory(registration: ServiceRegistration): void {
        if (this.serviceFactories.has(registration.name)) {
            throw new Error(`Service factory '${registration.name}' already registered`);
        }
        
        this.serviceFactories.set(registration.name, registration);
        this.logger.debug(`Service factory registered: ${registration.name} (${registration.lifecycle})`);
    }

    /**
     * Get or create a service instance based on lifecycle type
     */
    async getService<T>(name: string, scopeId?: string): Promise<T> {
        const registration = this.serviceFactories.get(name);
        
        if (!registration) {
            // Fall back to static service instances
            const instance = this.serviceInstances.get(name);
            if (!instance) {
                throw new Error(`Service '${name}' not found`);
            }
            return instance as T;
        }
        
        switch (registration.lifecycle) {
            case ServiceLifecycle.SINGLETON:
                return await this.getSingletonService<T>(registration);
                
            case ServiceLifecycle.TRANSIENT:
                return await this.createTransientService<T>(registration);
                
            case ServiceLifecycle.SCOPED:
                if (!scopeId) {
                    throw new Error(`Scope ID required for scoped service '${name}'`);
                }
                return await this.getScopedService<T>(registration, scopeId);
                
            default:
                throw new Error(`Unknown service lifecycle: ${registration.lifecycle}`);
        }
    }

    /**
     * Register a static service instance (legacy support)
     */
    registerService(name: string, service: any): void {
        if (this.serviceInstances.has(name)) {
            throw new Error(`Service '${name}' already registered`);
        }
        this.serviceInstances.set(name, service);
    }

    /**
     * Detect circular dependencies in service factories
     * Note: This only detects cycles in service dependencies, not plugin dependencies.
     * Plugin dependency cycles are detected in the kernel's resolveDependencies method.
     */
    detectCircularDependencies(): string[] {
        const cycles: string[] = [];
        const visited = new Set<string>();
        const visiting = new Set<string>();
        
        const visit = (serviceName: string, path: string[] = []) => {
            if (visiting.has(serviceName)) {
                const cycle = [...path, serviceName].join(' -> ');
                cycles.push(cycle);
                return;
            }
            
            if (visited.has(serviceName)) {
                return;
            }
            
            visiting.add(serviceName);
            
            const registration = this.serviceFactories.get(serviceName);
            if (registration?.dependencies) {
                for (const dep of registration.dependencies) {
                    visit(dep, [...path, serviceName]);
                }
            }
            
            visiting.delete(serviceName);
            visited.add(serviceName);
        };
        
        for (const serviceName of this.serviceFactories.keys()) {
            visit(serviceName);
        }
        
        return cycles;
    }

    /**
     * Check plugin health
     */
    async checkPluginHealth(pluginName: string): Promise<PluginHealthStatus> {
        const plugin = this.loadedPlugins.get(pluginName);
        
        if (!plugin) {
            return {
                healthy: false,
                message: 'Plugin not found',
                lastCheck: new Date(),
            };
        }
        
        if (!plugin.healthCheck) {
            return {
                healthy: true,
                message: 'No health check defined',
                lastCheck: new Date(),
            };
        }
        
        try {
            const status = await plugin.healthCheck();
            return {
                ...status,
                lastCheck: new Date(),
            };
        } catch (error) {
            return {
                healthy: false,
                message: `Health check failed: ${(error as Error).message}`,
                lastCheck: new Date(),
            };
        }
    }

    /**
     * Clear scoped services for a scope
     */
    clearScope(scopeId: string): void {
        this.scopedServices.delete(scopeId);
        this.logger.debug(`Cleared scope: ${scopeId}`);
    }

    /**
     * Get all loaded plugins
     */
    getLoadedPlugins(): Map<string, PluginMetadata> {
        return new Map(this.loadedPlugins);
    }

    // Private helper methods

    private toPluginMetadata(plugin: Plugin): PluginMetadata {
        return {
            ...plugin,
            version: plugin.version || '0.0.0',
        } as PluginMetadata;
    }

    private validatePluginStructure(plugin: PluginMetadata): void {
        if (!plugin.name) {
            throw new Error('Plugin name is required');
        }
        
        if (!plugin.init) {
            throw new Error('Plugin init function is required');
        }
        
        if (!this.isValidSemanticVersion(plugin.version)) {
            throw new Error(`Invalid semantic version: ${plugin.version}`);
        }
    }

    private checkVersionCompatibility(plugin: PluginMetadata): VersionCompatibility {
        // Basic semantic version compatibility check
        // In a real implementation, this would check against kernel version
        const version = plugin.version;
        
        if (!this.isValidSemanticVersion(version)) {
            return {
                compatible: false,
                pluginVersion: version,
                message: 'Invalid semantic version format',
            };
        }
        
        return {
            compatible: true,
            pluginVersion: version,
        };
    }

    private isValidSemanticVersion(version: string): boolean {
        const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
        return semverRegex.test(version);
    }

    private validatePluginConfig(plugin: PluginMetadata): void {
        if (!plugin.configSchema) {
            return;
        }
        
        // TODO: Configuration validation implementation
        // This requires plugin config to be passed during loading
        // For now, just validate that the schema exists
        this.logger.debug(`Plugin ${plugin.name} has configuration schema (validation not yet implemented)`);
    }

    private async verifyPluginSignature(plugin: PluginMetadata): Promise<void> {
        if (!plugin.signature) {
            return;
        }
        
        // TODO: Plugin signature verification implementation
        // In a real implementation:
        // 1. Extract public key from trusted source
        // 2. Verify signature against plugin code hash
        // 3. Throw error if verification fails
        this.logger.debug(`Plugin ${plugin.name} signature verification (not yet implemented)`);
    }

    private async getSingletonService<T>(registration: ServiceRegistration): Promise<T> {
        let instance = this.serviceInstances.get(registration.name);
        
        if (!instance) {
            // Create instance (would need context)
            instance = await this.createServiceInstance(registration);
            this.serviceInstances.set(registration.name, instance);
            this.logger.debug(`Singleton service created: ${registration.name}`);
        }
        
        return instance as T;
    }

    private async createTransientService<T>(registration: ServiceRegistration): Promise<T> {
        const instance = await this.createServiceInstance(registration);
        this.logger.debug(`Transient service created: ${registration.name}`);
        return instance as T;
    }

    private async getScopedService<T>(registration: ServiceRegistration, scopeId: string): Promise<T> {
        if (!this.scopedServices.has(scopeId)) {
            this.scopedServices.set(scopeId, new Map());
        }
        
        const scope = this.scopedServices.get(scopeId)!;
        let instance = scope.get(registration.name);
        
        if (!instance) {
            instance = await this.createServiceInstance(registration);
            scope.set(registration.name, instance);
            this.logger.debug(`Scoped service created: ${registration.name} (scope: ${scopeId})`);
        }
        
        return instance as T;
    }

    private async createServiceInstance(registration: ServiceRegistration): Promise<any> {
        // This is a simplified version - in real implementation,
        // we would need to pass proper context with resolved dependencies
        const mockContext = {} as PluginContext;
        return await registration.factory(mockContext);
    }
}
