// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * IServiceRegistry - Service Registry Interface
 * 
 * Abstract interface for managing service registration and lookup.
 * This provides a single source of truth for all services in the system.
 * 
 * Following the Dependency Inversion Principle - both kernel implementations
 * and plugins depend on this interface, not on concrete implementations.
 */

export interface IServiceRegistry {
    /**
     * Register a service with a unique name
     * @param name - Unique service identifier
     * @param service - The service instance to register
     * @throws Error if service name is already registered
     */
    register<T>(name: string, service: T): void;
    
    /**
     * Get a registered service by name (synchronous)
     * @param name - Service identifier
     * @returns The registered service
     * @throws Error if service is not found
     */
    get<T>(name: string): T;
    
    /**
     * Get a registered service by name (asynchronous)
     * Useful for lazy-loaded or async-initialized services
     * @param name - Service identifier
     * @param scopeId - Optional scope identifier for scoped services
     * @returns Promise resolving to the registered service
     * @throws Error if service is not found
     */
    getAsync<T>(name: string, scopeId?: string): Promise<T>;
    
    /**
     * Check if a service is registered
     * @param name - Service identifier
     * @returns True if service is registered, false otherwise
     */
    has(name: string): boolean;
    
    /**
     * Unregister a service
     * @param name - Service identifier
     * @returns True if service was unregistered, false if it wasn't registered
     */
    unregister(name: string): boolean;
    
    /**
     * Get all registered service names
     * @returns Array of service names
     */
    getServiceNames?(): string[];
    
    /**
     * Clear all registered services
     * Useful for cleanup in tests or during shutdown
     */
    clear?(): void;
}

/**
 * BasicServiceRegistry - Simple synchronous implementation
 * Used by ObjectKernel for basic service management
 */
export interface IBasicServiceRegistry extends IServiceRegistry {
    // Simple Map-based implementation
}

/**
 * AdvancedServiceRegistry - Enhanced implementation with additional features
 * Used by ObjectKernel for advanced service management
 */
export interface IAdvancedServiceRegistry extends IServiceRegistry {
    /**
     * Register a factory function that creates services on-demand
     * @param name - Service identifier
     * @param factory - Factory function that creates the service
     * @param singleton - If true, factory is called once and result is cached
     */
    registerFactory?<T>(name: string, factory: () => T | Promise<T>, singleton?: boolean): void;
    
    /**
     * Register a scoped service (per-request, per-session, etc.)
     * @param name - Service identifier
     * @param factory - Factory function that creates the service
     * @param scopeType - Type of scope ('request', 'session', 'transaction', etc.)
     */
    registerScoped?<T>(name: string, factory: (scopeId: string) => T | Promise<T>, scopeType: string): void;
    
    /**
     * Create a new scope for scoped services
     * @param scopeType - Type of scope
     * @returns Scope identifier
     */
    createScope?(scopeType: string): string;
    
    /**
     * Dispose a scope and cleanup scoped services
     * @param scopeId - Scope identifier
     */
    disposeScope?(scopeId: string): Promise<void>;
}
