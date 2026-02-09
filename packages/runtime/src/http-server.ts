// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { IHttpServer, RouteHandler, Middleware } from '@objectstack/core';

/**
 * HttpServer - Unified HTTP Server Abstraction
 * 
 * Provides a framework-agnostic HTTP server interface that wraps
 * underlying server implementations (Hono, Express, Fastify, etc.)
 * 
 * This class serves as an adapter between the IHttpServer interface
 * and concrete server implementations, allowing plugins to register
 * routes and middleware without depending on specific frameworks.
 * 
 * Features:
 * - Unified route registration API
 * - Middleware management with ordering
 * - Request/response lifecycle hooks
 * - Framework-agnostic abstractions
 */
export class HttpServer implements IHttpServer {
    protected server: IHttpServer;
    protected routes: Map<string, RouteHandler>;
    protected middlewares: Middleware[];
    
    /**
     * Create an HTTP server wrapper
     * @param server - The underlying server implementation (Hono, Express, etc.)
     */
    constructor(server: IHttpServer) {
        this.server = server;
        this.routes = new Map();
        this.middlewares = [];
    }
    
    /**
     * Register a GET route handler
     * @param path - Route path (e.g., '/api/users/:id')
     * @param handler - Route handler function
     */
    get(path: string, handler: RouteHandler): void {
        const key = `GET:${path}`;
        this.routes.set(key, handler);
        this.server.get(path, handler);
    }
    
    /**
     * Register a POST route handler
     * @param path - Route path
     * @param handler - Route handler function
     */
    post(path: string, handler: RouteHandler): void {
        const key = `POST:${path}`;
        this.routes.set(key, handler);
        this.server.post(path, handler);
    }
    
    /**
     * Register a PUT route handler
     * @param path - Route path
     * @param handler - Route handler function
     */
    put(path: string, handler: RouteHandler): void {
        const key = `PUT:${path}`;
        this.routes.set(key, handler);
        this.server.put(path, handler);
    }
    
    /**
     * Register a DELETE route handler
     * @param path - Route path
     * @param handler - Route handler function
     */
    delete(path: string, handler: RouteHandler): void {
        const key = `DELETE:${path}`;
        this.routes.set(key, handler);
        this.server.delete(path, handler);
    }
    
    /**
     * Register a PATCH route handler
     * @param path - Route path
     * @param handler - Route handler function
     */
    patch(path: string, handler: RouteHandler): void {
        const key = `PATCH:${path}`;
        this.routes.set(key, handler);
        this.server.patch(path, handler);
    }
    
    /**
     * Register middleware
     * @param path - Optional path to apply middleware to (if omitted, applies globally)
     * @param handler - Middleware function
     */
    use(path: string | Middleware, handler?: Middleware): void {
        if (typeof path === 'function') {
            // Global middleware
            this.middlewares.push(path);
            this.server.use(path);
        } else if (handler) {
            // Path-specific middleware
            this.middlewares.push(handler);
            this.server.use(path, handler);
        }
    }
    
    /**
     * Start the HTTP server
     * @param port - Port number to listen on
     * @returns Promise that resolves when server is ready
     */
    async listen(port: number): Promise<void> {
        await this.server.listen(port);
    }
    
    /**
     * Stop the HTTP server
     * @returns Promise that resolves when server is stopped
     */
    async close(): Promise<void> {
        if (this.server.close) {
            await this.server.close();
        }
    }
    
    /**
     * Get registered routes
     * @returns Map of route keys to handlers
     */
    getRoutes(): Map<string, RouteHandler> {
        return new Map(this.routes);
    }
    
    /**
     * Get registered middlewares
     * @returns Array of middleware functions
     */
    getMiddlewares(): Middleware[] {
        return [...this.middlewares];
    }
}
