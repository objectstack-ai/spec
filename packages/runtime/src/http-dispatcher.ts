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
    result?: any; // For flexible return types or direct response objects (Response/NextResponse)
}

export class HttpDispatcher {
    private kernel: any; // Casting to any to access dynamic props like broker, services, graphql

    constructor(kernel: ObjectKernel) {
        this.kernel = kernel;
    }

    private success(data: any, meta?: any) {
        return {
            status: 200,
            body: { success: true, data, meta }
        };
    }

    private error(message: string, code: number = 500, details?: any) {
        return {
            status: code,
            body: { success: false, error: { message, code, details } }
        };
    }

    private ensureBroker() {
        if (!this.kernel.broker) {
            throw { statusCode: 500, message: 'Kernel Broker not available' };
        }
        return this.kernel.broker;
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
            version: '1.0.0',
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
     * path: sub-path after /auth/
     */
    async handleAuth(path: string, method: string, body: any, context: HttpProtocolContext): Promise<HttpDispatcherResult> {
        // 1. Try generic Auth Service
        const authService = this.getService('auth');
        if (authService && typeof authService.handler === 'function') {
            const response = await authService.handler(context.request, context.response);
            return { handled: true, result: response };
        }

        // 2. Legacy Login
        const normalizedPath = path.replace(/^\/+/, '');
        if (normalizedPath === 'login' && method.toUpperCase() === 'POST') {
             const broker = this.ensureBroker();
             const data = await broker.call('auth.login', body, { request: context.request });
             return { handled: true, response: { status: 200, body: data } };
        }

        return { handled: false };
    }

    /**
     * Handles Metadata requests
     * path: sub-path after /metadata/ (e.g. "contacts" or empty)
     */
    async handleMetadata(path: string, context: HttpProtocolContext): Promise<HttpDispatcherResult> {
        const broker = this.ensureBroker();
        const cleanPath = path.replace(/^\/+/, '');
        
        // GET /metadata
        if (!cleanPath) {
            const data = await broker.call('metadata.objects', {}, { request: context.request });
            return { handled: true, response: this.success(data) };
        }
        
        // GET /metadata/:objectName
        const data = await broker.call('metadata.getObject', { objectName: cleanPath }, { request: context.request });
        return { handled: true, response: this.success(data) };
    }

    /**
     * Handles Data requests
     * path: sub-path after /data/ (e.g. "contacts", "contacts/123", "contacts/query")
     */
    async handleData(path: string, method: string, body: any, query: any, context: HttpProtocolContext): Promise<HttpDispatcherResult> {
        const broker = this.ensureBroker();
        const parts = path.replace(/^\/+/, '').split('/');
        const objectName = parts[0];
        
        if (!objectName) {
            return { handled: true, response: this.error('Object name required', 400) };
        }

        const m = method.toUpperCase();

        // 1. Custom Actions (query, batch)
        if (parts.length > 1) {
            const action = parts[1];
            
            // POST /data/:object/query
            if (action === 'query' && m === 'POST') {
                const result = await broker.call('data.query', { object: objectName, ...body }, { request: context.request });
                return { handled: true, response: this.success(result.data, { count: result.count, limit: body.limit, skip: body.skip }) };
            }

            // POST /data/:object/batch
            if (action === 'batch' && m === 'POST') {
                const result = await broker.call('data.batch', { object: objectName, operations: body.operations }, { request: context.request });
                return { handled: true, response: this.success(result) };
            }

            // GET /data/:object/:id
            if (parts.length === 2 && m === 'GET') {
                const id = parts[1];
                const data = await broker.call('data.get', { object: objectName, id, ...query }, { request: context.request });
                return { handled: true, response: this.success(data) };
            }

            // PATCH /data/:object/:id
            if (parts.length === 2 && m === 'PATCH') {
                const id = parts[1];
                const data = await broker.call('data.update', { object: objectName, id, data: body }, { request: context.request });
                return { handled: true, response: this.success(data) };
            }

            // DELETE /data/:object/:id
            if (parts.length === 2 && m === 'DELETE') {
                const id = parts[1];
                await broker.call('data.delete', { object: objectName, id }, { request: context.request });
                return { handled: true, response: this.success({ id, deleted: true }) };
            }
        } else {
            // GET /data/:object (List)
            if (m === 'GET') {
                const result = await broker.call('data.query', { object: objectName, filters: query }, { request: context.request });
                return { handled: true, response: this.success(result.data, { count: result.count }) };
            }

            // POST /data/:object (Create)
            if (m === 'POST') {
                const data = await broker.call('data.create', { object: objectName, data: body }, { request: context.request });
                // Note: ideally 201
                const res = this.success(data);
                res.status = 201;
                return { handled: true, response: res };
            }
        }
        
        return { handled: false };
    }

    /**
     * Handles Storage requests
     * path: sub-path after /storage/
     */
    async handleStorage(path: string, method: string, file: any, context: HttpProtocolContext): Promise<HttpDispatcherResult> {
        const storageService = this.getService('file-storage') || this.kernel.services?.['file-storage'];
        if (!storageService) {
             return { handled: true, response: this.error('File storage not configured', 501) };
        }
        
        const m = method.toUpperCase();
        const parts = path.replace(/^\/+/, '').split('/');
        
        // POST /storage/upload
        if (parts[0] === 'upload' && m === 'POST') {
            if (!file) {
                 return { handled: true, response: this.error('No file provided', 400) };
            }
            const result = await storageService.upload(file, { request: context.request });
            return { handled: true, response: this.success(result) };
        }
        
        // GET /storage/file/:id
        if (parts[0] === 'file' && parts[1] && m === 'GET') {
            const id = parts[1];
            const result = await storageService.download(id, { request: context.request });
            
            // Result can be URL (redirect), Stream/Blob, or metadata
            if (result.url && result.redirect) {
                // Must be handled by adapter to do actual redirect
                return { handled: true, result: { type: 'redirect', url: result.url } };
            }
            
            if (result.stream) {
                 // Must be handled by adapter to pipe stream
                 return { 
                     handled: true, 
                     result: { 
                         type: 'stream', 
                         stream: result.stream, 
                         headers: {
                             'Content-Type': result.mimeType || 'application/octet-stream',
                             'Content-Length': result.size
                         }
                     } 
                 };
            }
            
            return { handled: true, response: this.success(result) };
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
