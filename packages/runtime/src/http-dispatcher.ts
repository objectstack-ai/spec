import { ObjectKernel } from '@objectstack/core';

export interface HttpProtocolContext {
    request: any;
    response?: any;
}

export interface HttpDispatcherResult {
    handled: boolean;
    response?: {
        status: number;
        body?: any;
        headers?: Record<string, string>;
    };
    result?: any; // For flexible return types
}

export class HttpDispatcher {
    private kernel: any; // Casting to any to access dynamic props like broker, services, graphql

    constructor(kernel: ObjectKernel) {
        this.kernel = kernel;
    }

    /**
     * Generates the discovery JSON response for the API root
     */
    getDiscoveryInfo(prefix: string) {
        const services = this.getServicesMap();
        
        const hasGraphQL = !!(services['graphql'] || this.kernel.graphql);
        const hasSearch = !!services['search'];
        const hasWebSockets = !!services['realtime'];
        const hasFiles = !!(services['file-storage'] || services['storage']?.supportsFiles);

        return {
            name: 'ObjectOS',
            version: '1.0.0', // Could be injected or retrieved from manifest
            environment: process.env.NODE_ENV || 'development',
            routes: {
                data: `${prefix}/data`,
                metadata: `${prefix}/metadata`,
                auth: `${prefix}/auth`,
                graphql: hasGraphQL ? `${prefix}/graphql` : undefined,
                storage: hasFiles ? `${prefix}/storage` : undefined,
            },
            features: {
                graphql: hasGraphQL,
                search: hasSearch,
                websockets: hasWebSockets,
                files: hasFiles,
            },
        };
    }

    /**
     * Handles GraphQL requests
     */
    async handleGraphQL(body: { query: string; variables?: any }, context: HttpProtocolContext) {
        if (!body || !body.query) {
             throw { statusCode: 400, message: 'Missing query in request body' };
        }
        
        if (typeof this.kernel.graphql !== 'function') {
            throw { statusCode: 501, message: 'GraphQL service not available' };
        }

        return this.kernel.graphql(body.query, body.variables, { 
            request: context.request 
        });
    }

    /**
     * Handles Auth requests
     * path argument should be the sub-path after /auth/, e.g. "login"
     */
    async handleAuth(path: string, method: string, body: any, context: HttpProtocolContext): Promise<HttpDispatcherResult> {
        // 1. Try to use generic Auth Service if available via handler
        const authService = this.getService('auth');
        if (authService && typeof authService.handler === 'function') {
            const response = await authService.handler(context.request, context.response);
            return { handled: true, result: response };
        }

        // 2. Fallback to Legacy generic login
        // Check if path matches 'login' (ignoring leading slashes)
        const normalizedPath = path.replace(/^\/+/, '');
        
        if (normalizedPath === 'login' && method.toUpperCase() === 'POST') {
             if (!this.kernel.broker) {
                 throw { statusCode: 500, message: 'Kernel broker not available' };
             }
             const data = await this.kernel.broker.call('auth.login', body, { request: context.request });
             return { 
                 handled: true, 
                 response: {
                     status: 200,
                     body: data
                 }
             };
        }

        return { handled: false };
    }

    private getServicesMap(): Record<string, any> {
        if (this.kernel.services instanceof Map) {
            return Object.fromEntries(this.kernel.services);
        }
        return this.kernel.services || {};
    }

    private getService(name: string) {
        if (typeof this.kernel.getService === 'function') {
            return this.kernel.getService(name);
        }
        const services = this.getServicesMap();
        return services[name];
    }
}
