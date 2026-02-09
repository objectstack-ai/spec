// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Middleware, IHttpRequest, IHttpResponse } from '@objectstack/core';
import { MiddlewareConfig, MiddlewareType } from '@objectstack/spec/system';

/**
 * Middleware Entry
 * Internal representation of registered middleware
 */
interface MiddlewareEntry {
    name: string;
    type: MiddlewareType;
    middleware: Middleware;
    order: number;
    enabled: boolean;
    paths?: {
        include?: string[];
        exclude?: string[];
    };
}

/**
 * MiddlewareManager
 * 
 * Manages middleware registration, ordering, and execution.
 * Provides fine-grained control over middleware chains with:
 * - Execution order management
 * - Path-based filtering
 * - Enable/disable individual middleware
 * - Middleware categorization by type
 * 
 * @example
 * const manager = new MiddlewareManager();
 * 
 * // Register middleware with configuration
 * manager.register({
 *   name: 'auth',
 *   type: 'authentication',
 *   order: 10,
 *   paths: { exclude: ['/health', '/metrics'] }
 * }, authMiddleware);
 * 
 * // Get sorted middleware chain
 * const chain = manager.getMiddlewareChain();
 * chain.forEach(mw => server.use(mw));
 */
export class MiddlewareManager {
    private middlewares: Map<string, MiddlewareEntry>;
    
    constructor() {
        this.middlewares = new Map();
    }
    
    /**
     * Register middleware with configuration
     * @param config - Middleware configuration
     * @param middleware - Middleware function
     */
    register(config: MiddlewareConfig, middleware: Middleware): void {
        const entry: MiddlewareEntry = {
            name: config.name,
            type: config.type,
            middleware,
            order: config.order ?? 100,
            enabled: config.enabled ?? true,
            paths: config.paths,
        };
        
        this.middlewares.set(config.name, entry);
    }
    
    /**
     * Unregister middleware by name
     * @param name - Middleware name
     */
    unregister(name: string): void {
        this.middlewares.delete(name);
    }
    
    /**
     * Enable middleware by name
     * @param name - Middleware name
     */
    enable(name: string): void {
        const entry = this.middlewares.get(name);
        if (entry) {
            entry.enabled = true;
        }
    }
    
    /**
     * Disable middleware by name
     * @param name - Middleware name
     */
    disable(name: string): void {
        const entry = this.middlewares.get(name);
        if (entry) {
            entry.enabled = false;
        }
    }
    
    /**
     * Get middleware entry by name
     * @param name - Middleware name
     */
    get(name: string): MiddlewareEntry | undefined {
        return this.middlewares.get(name);
    }
    
    /**
     * Get all middleware entries
     */
    getAll(): MiddlewareEntry[] {
        return Array.from(this.middlewares.values());
    }
    
    /**
     * Get middleware by type
     * @param type - Middleware type
     */
    getByType(type: MiddlewareType): MiddlewareEntry[] {
        return this.getAll().filter(entry => entry.type === type);
    }
    
    /**
     * Get middleware chain sorted by order
     * Returns only enabled middleware
     */
    getMiddlewareChain(): Middleware[] {
        return this.getAll()
            .filter(entry => entry.enabled)
            .sort((a, b) => a.order - b.order)
            .map(entry => entry.middleware);
    }
    
    /**
     * Get middleware chain with path filtering
     * @param path - Request path to match against
     */
    getMiddlewareChainForPath(path: string): Middleware[] {
        return this.getAll()
            .filter(entry => {
                if (!entry.enabled) return false;
                
                // Check path filters
                if (entry.paths) {
                    // Check exclude patterns
                    if (entry.paths.exclude) {
                        const excluded = entry.paths.exclude.some(pattern => 
                            this.matchPath(path, pattern)
                        );
                        if (excluded) return false;
                    }
                    
                    // Check include patterns (if specified)
                    if (entry.paths.include) {
                        const included = entry.paths.include.some(pattern => 
                            this.matchPath(path, pattern)
                        );
                        if (!included) return false;
                    }
                }
                
                return true;
            })
            .sort((a, b) => a.order - b.order)
            .map(entry => entry.middleware);
    }
    
    /**
     * Match path against pattern (simple glob matching)
     * @param path - Request path
     * @param pattern - Pattern to match (supports * wildcard)
     */
    private matchPath(path: string, pattern: string): boolean {
        // Convert glob pattern to regex
        const regexPattern = pattern
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(path);
    }
    
    /**
     * Clear all middleware
     */
    clear(): void {
        this.middlewares.clear();
    }
    
    /**
     * Get middleware count
     */
    count(): number {
        return this.middlewares.size;
    }
    
    /**
     * Create a composite middleware from the chain
     * This can be used to apply all middleware at once
     */
    createCompositeMiddleware(): Middleware {
        const chain = this.getMiddlewareChain();
        
        return async (req: IHttpRequest, res: IHttpResponse, next: () => void | Promise<void>) => {
            let index = 0;
            
            const executeNext = async (): Promise<void> => {
                if (index >= chain.length) {
                    await next();
                    return;
                }
                
                const middleware = chain[index++];
                await middleware(req, res, executeNext);
            };
            
            await executeNext();
        };
    }
}
