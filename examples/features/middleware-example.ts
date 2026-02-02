/**
 * Middleware Manager Usage Example
 * 
 * This example demonstrates how to use the MiddlewareManager to organize
 * and control middleware execution in your HTTP server.
 */

import { MiddlewareManager } from '@objectstack/runtime';
import type { Middleware } from '@objectstack/core';

/**
 * Example: Creating Custom Middleware
 */

// Logging middleware
const loggingMiddleware: Middleware = async (req, res, next) => {
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    
    await next();
    
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${duration}ms`);
};

// Authentication middleware
const authMiddleware: Middleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        res.status(401).json({ error: 'Authorization required' });
        return;
    }
    
    // Validate token (simplified example)
    const token = authHeader.toString().replace('Bearer ', '');
    if (token === 'valid-token') {
        // Add user info to request
        (req as any).user = { id: '123', name: 'John Doe' };
        await next();
    } else {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// CORS middleware
const corsMiddleware: Middleware = async (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).json({});
        return;
    }
    
    await next();
};

// Request validation middleware
const validationMiddleware: Middleware = async (req, res, next) => {
    // Validate request body if present
    if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
        if (!req.body) {
            res.status(400).json({ error: 'Request body required' });
            return;
        }
    }
    
    await next();
};

// Error handling middleware
const errorMiddleware: Middleware = async (req, res, next) => {
    try {
        await next();
    } catch (error: any) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
};

/**
 * Example: Setting up Middleware Manager
 */
function setupMiddlewareManager() {
    const manager = new MiddlewareManager();
    
    // Register middleware with different priorities
    // Lower order values execute first
    
    // 1. Error handling should wrap everything (order: 1)
    manager.register({
        name: 'error_handler',
        type: 'error',
        enabled: true,
        order: 1,
    }, errorMiddleware);
    
    // 2. CORS headers early (order: 10)
    manager.register({
        name: 'cors',
        type: 'custom',
        enabled: true,
        order: 10,
    }, corsMiddleware);
    
    // 3. Logging (order: 20)
    manager.register({
        name: 'logger',
        type: 'logging',
        enabled: true,
        order: 20,
    }, loggingMiddleware);
    
    // 4. Authentication (order: 30)
    // Exclude health and metrics endpoints
    manager.register({
        name: 'auth',
        type: 'authentication',
        enabled: true,
        order: 30,
        paths: {
            exclude: ['/health', '/metrics', '/api/v1'] // Public endpoints
        }
    }, authMiddleware);
    
    // 5. Validation (order: 40)
    manager.register({
        name: 'validation',
        type: 'validation',
        enabled: true,
        order: 40,
    }, validationMiddleware);
    
    return manager;
}

/**
 * Example: Using Middleware Manager with HTTP Server
 */
function applyMiddlewareToServer(server: any, manager: MiddlewareManager) {
    // Get the ordered middleware chain
    const chain = manager.getMiddlewareChain();
    
    // Apply each middleware to the server
    chain.forEach(middleware => {
        server.use(middleware);
    });
    
    console.log(`Applied ${chain.length} middleware to server`);
}

/**
 * Example: Dynamic Middleware Management
 */
function dynamicMiddlewareControl(manager: MiddlewareManager) {
    // Disable authentication temporarily (e.g., for maintenance)
    manager.disable('auth');
    console.log('Authentication disabled');
    
    // Re-enable after maintenance
    manager.enable('auth');
    console.log('Authentication re-enabled');
    
    // Get middleware for specific path
    const middlewareForApiPath = manager.getMiddlewareChainForPath('/api/v1/data/user');
    console.log(`Middleware for /api/v1/data/user: ${middlewareForApiPath.length}`);
    
    const middlewareForHealthPath = manager.getMiddlewareChainForPath('/health');
    console.log(`Middleware for /health: ${middlewareForHealthPath.length}`);
    
    // Get middleware by type
    const authMiddlewares = manager.getByType('authentication');
    console.log(`Authentication middleware count: ${authMiddlewares.length}`);
}

/**
 * Example: Advanced Middleware Patterns
 */

// Rate limiting middleware with configuration
function createRateLimitMiddleware(config: {
    windowMs: number;
    maxRequests: number;
}): Middleware {
    const requests = new Map<string, number[]>();
    
    return async (req, res, next) => {
        const ip = req.headers['x-forwarded-for']?.toString() || 'unknown';
        const now = Date.now();
        const windowStart = now - config.windowMs;
        
        // Get request timestamps for this IP
        const timestamps = requests.get(ip) || [];
        
        // Filter out old requests
        const recentRequests = timestamps.filter(t => t > windowStart);
        
        if (recentRequests.length >= config.maxRequests) {
            res.status(429).json({ 
                error: 'Too many requests',
                retryAfter: Math.ceil((recentRequests[0] + config.windowMs - now) / 1000)
            });
            return;
        }
        
        // Add current request
        recentRequests.push(now);
        requests.set(ip, recentRequests);
        
        await next();
    };
}

// Caching middleware
function createCacheMiddleware(ttl: number): Middleware {
    const cache = new Map<string, { data: any; expiry: number }>();
    
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            await next();
            return;
        }
        
        const cacheKey = `${req.method}:${req.path}`;
        const cached = cache.get(cacheKey);
        
        if (cached && cached.expiry > Date.now()) {
            res.header('X-Cache', 'HIT');
            res.json(cached.data);
            return;
        }
        
        // Store original json method
        const originalJson = res.json.bind(res);
        
        // Override json method to cache response
        res.json = (data: any) => {
            cache.set(cacheKey, {
                data,
                expiry: Date.now() + ttl
            });
            res.header('X-Cache', 'MISS');
            return originalJson(data);
        };
        
        await next();
    };
}

/**
 * Example: Complete Setup with Advanced Middleware
 */
function setupAdvancedMiddleware() {
    const manager = new MiddlewareManager();
    
    // Basic middleware
    manager.register({
        name: 'cors',
        type: 'custom',
        order: 10,
    }, corsMiddleware);
    
    manager.register({
        name: 'logger',
        type: 'logging',
        order: 20,
    }, loggingMiddleware);
    
    // Rate limiting (100 requests per minute)
    manager.register({
        name: 'rate_limit',
        type: 'custom',
        order: 25,
        config: {
            windowMs: 60000,
            maxRequests: 100
        }
    }, createRateLimitMiddleware({
        windowMs: 60000,
        maxRequests: 100
    }));
    
    // Authentication with exclusions
    manager.register({
        name: 'auth',
        type: 'authentication',
        order: 30,
        paths: {
            exclude: ['/health', '/metrics', '/api/v1']
        }
    }, authMiddleware);
    
    // Caching for GET requests (5 minute TTL)
    manager.register({
        name: 'cache',
        type: 'custom',
        order: 35,
        paths: {
            include: ['/api/v1/meta/*']  // Only cache metadata
        }
    }, createCacheMiddleware(300000));
    
    manager.register({
        name: 'validation',
        type: 'validation',
        order: 40,
    }, validationMiddleware);
    
    return manager;
}

/**
 * Example: Inspecting Middleware
 */
function inspectMiddleware(manager: MiddlewareManager) {
    console.log('\n=== Middleware Registry ===');
    
    const all = manager.getAll();
    all.forEach(entry => {
        console.log(`\n${entry.name}:`);
        console.log(`  Type: ${entry.type}`);
        console.log(`  Order: ${entry.order}`);
        console.log(`  Enabled: ${entry.enabled}`);
        if (entry.paths) {
            if (entry.paths.include) {
                console.log(`  Include paths: ${entry.paths.include.join(', ')}`);
            }
            if (entry.paths.exclude) {
                console.log(`  Exclude paths: ${entry.paths.exclude.join(', ')}`);
            }
        }
    });
    
    console.log(`\nTotal middleware: ${manager.count()}`);
}

// Export for use in other modules
export {
    setupMiddlewareManager,
    applyMiddlewareToServer,
    dynamicMiddlewareControl,
    setupAdvancedMiddleware,
    inspectMiddleware,
    loggingMiddleware,
    authMiddleware,
    corsMiddleware,
    validationMiddleware,
    errorMiddleware,
    createRateLimitMiddleware,
    createCacheMiddleware
};
