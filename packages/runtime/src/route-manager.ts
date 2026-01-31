import { RouteHandler, IHttpServer } from '@objectstack/core';
import { System, Shared } from '@objectstack/spec';

type RouteHandlerMetadata = System.RouteHandlerMetadata;
type HttpMethod = Shared.HttpMethod;

/**
 * Route Entry
 * Internal representation of registered routes
 */
export interface RouteEntry {
    method: HttpMethod;
    path: string;
    handler: RouteHandler;
    metadata?: RouteHandlerMetadata['metadata'];
    security?: RouteHandlerMetadata['security'];
}

/**
 * RouteManager
 * 
 * Manages route registration and organization for HTTP servers.
 * Provides:
 * - Route registration with metadata
 * - Route lookup and querying
 * - Bulk route registration
 * - Route grouping by prefix
 * 
 * @example
 * const manager = new RouteManager(server);
 * 
 * // Register individual route
 * manager.register({
 *   method: 'GET',
 *   path: '/api/users/:id',
 *   handler: getUserHandler,
 *   metadata: {
 *     summary: 'Get user by ID',
 *     tags: ['users']
 *   }
 * });
 * 
 * // Register route group
 * manager.group('/api/users', (group) => {
 *   group.get('/', listUsersHandler);
 *   group.post('/', createUserHandler);
 *   group.get('/:id', getUserHandler);
 * });
 */
export class RouteManager {
    private server: IHttpServer;
    private routes: Map<string, RouteEntry>;
    
    constructor(server: IHttpServer) {
        this.server = server;
        this.routes = new Map();
    }
    
    /**
     * Register a route
     * @param entry - Route entry with method, path, handler, and metadata
     */
    register(entry: Omit<RouteEntry, 'handler'> & { handler: RouteHandler | string }): void {
        // Validate handler type - string handlers not yet supported
        if (typeof entry.handler === 'string') {
            throw new Error(
                `String-based route handlers are not supported yet. ` +
                `Received handler identifier "${entry.handler}". ` +
                `Please provide a RouteHandler function instead.`
            );
        }
        
        const handler: RouteHandler = entry.handler;
        
        const routeEntry: RouteEntry = {
            method: entry.method,
            path: entry.path,
            handler,
            metadata: entry.metadata,
            security: entry.security,
        };
        
        const key = this.getRouteKey(entry.method, entry.path);
        this.routes.set(key, routeEntry);
        
        // Register with underlying server
        this.registerWithServer(routeEntry);
    }
    
    /**
     * Register multiple routes
     * @param entries - Array of route entries
     */
    registerMany(entries: Array<Omit<RouteEntry, 'handler'> & { handler: RouteHandler | string }>): void {
        entries.forEach(entry => this.register(entry));
    }
    
    /**
     * Unregister a route
     * @param method - HTTP method
     * @param path - Route path
     */
    unregister(method: HttpMethod, path: string): void {
        const key = this.getRouteKey(method, path);
        this.routes.delete(key);
        // Note: Most server frameworks don't support unregistering routes at runtime
        // This just removes it from our registry
    }
    
    /**
     * Get route by method and path
     * @param method - HTTP method
     * @param path - Route path
     */
    get(method: HttpMethod, path: string): RouteEntry | undefined {
        const key = this.getRouteKey(method, path);
        return this.routes.get(key);
    }
    
    /**
     * Get all routes
     */
    getAll(): RouteEntry[] {
        return Array.from(this.routes.values());
    }
    
    /**
     * Get routes by method
     * @param method - HTTP method
     */
    getByMethod(method: HttpMethod): RouteEntry[] {
        return this.getAll().filter(route => route.method === method);
    }
    
    /**
     * Get routes by path prefix
     * @param prefix - Path prefix
     */
    getByPrefix(prefix: string): RouteEntry[] {
        return this.getAll().filter(route => route.path.startsWith(prefix));
    }
    
    /**
     * Get routes by tag
     * @param tag - Tag name
     */
    getByTag(tag: string): RouteEntry[] {
        return this.getAll().filter(route => 
            route.metadata?.tags?.includes(tag)
        );
    }
    
    /**
     * Create a route group with common prefix
     * @param prefix - Common path prefix
     * @param configure - Function to configure routes in the group
     */
    group(prefix: string, configure: (group: RouteGroupBuilder) => void): void {
        const builder = new RouteGroupBuilder(this, prefix);
        configure(builder);
    }
    
    /**
     * Get route count
     */
    count(): number {
        return this.routes.size;
    }
    
    /**
     * Clear all routes
     */
    clear(): void {
        this.routes.clear();
    }
    
    /**
     * Get route key for storage
     */
    private getRouteKey(method: HttpMethod, path: string): string {
        return `${method}:${path}`;
    }
    
    /**
     * Register route with underlying server
     */
    private registerWithServer(entry: RouteEntry): void {
        const { method, path, handler } = entry;
        
        switch (method) {
            case 'GET':
                this.server.get(path, handler);
                break;
            case 'POST':
                this.server.post(path, handler);
                break;
            case 'PUT':
                this.server.put(path, handler);
                break;
            case 'DELETE':
                this.server.delete(path, handler);
                break;
            case 'PATCH':
                this.server.patch(path, handler);
                break;
            default:
                throw new Error(`Unsupported HTTP method: ${method}`);
        }
    }
}

/**
 * RouteGroupBuilder
 * 
 * Builder for creating route groups with common prefix
 */
export class RouteGroupBuilder {
    private manager: RouteManager;
    private prefix: string;
    
    constructor(manager: RouteManager, prefix: string) {
        this.manager = manager;
        this.prefix = prefix;
    }
    
    /**
     * Register GET route in group
     */
    get(path: string, handler: RouteHandler, metadata?: RouteHandlerMetadata['metadata']): this {
        this.manager.register({
            method: 'GET',
            path: this.resolvePath(path),
            handler,
            metadata,
        });
        return this;
    }
    
    /**
     * Register POST route in group
     */
    post(path: string, handler: RouteHandler, metadata?: RouteHandlerMetadata['metadata']): this {
        this.manager.register({
            method: 'POST',
            path: this.resolvePath(path),
            handler,
            metadata,
        });
        return this;
    }
    
    /**
     * Register PUT route in group
     */
    put(path: string, handler: RouteHandler, metadata?: RouteHandlerMetadata['metadata']): this {
        this.manager.register({
            method: 'PUT',
            path: this.resolvePath(path),
            handler,
            metadata,
        });
        return this;
    }
    
    /**
     * Register PATCH route in group
     */
    patch(path: string, handler: RouteHandler, metadata?: RouteHandlerMetadata['metadata']): this {
        this.manager.register({
            method: 'PATCH',
            path: this.resolvePath(path),
            handler,
            metadata,
        });
        return this;
    }
    
    /**
     * Register DELETE route in group
     */
    delete(path: string, handler: RouteHandler, metadata?: RouteHandlerMetadata['metadata']): this {
        this.manager.register({
            method: 'DELETE',
            path: this.resolvePath(path),
            handler,
            metadata,
        });
        return this;
    }
    
    /**
     * Resolve full path with prefix
     */
    private resolvePath(path: string): string {
        // Normalize slashes
        const normalizedPrefix = this.prefix.endsWith('/') 
            ? this.prefix.slice(0, -1) 
            : this.prefix;
        const normalizedPath = path.startsWith('/') 
            ? path 
            : '/' + path;
        
        return normalizedPrefix + normalizedPath;
    }
}
