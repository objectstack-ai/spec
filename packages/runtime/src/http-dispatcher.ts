import { ObjectKernel, getEnv } from '@objectstack/core';
import { CoreServiceName } from '@objectstack/spec/system';

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
        
        const hasGraphQL = !!(services[CoreServiceName.enum.graphql] || this.kernel.graphql);
        const hasSearch = !!services[CoreServiceName.enum.search];
        const hasWebSockets = !!services[CoreServiceName.enum.realtime];
        const hasFiles = !!(services[CoreServiceName.enum['file-storage']] || services['storage']?.supportsFiles);
        const hasAnalytics = !!services[CoreServiceName.enum.analytics];
        const hasHub = !!services[CoreServiceName.enum.hub];

        const routes = {
                data: `${prefix}/data`,
                metadata: `${prefix}/meta`,
                auth: `${prefix}/auth`,
                ui: `${prefix}/ui`,
                graphql: hasGraphQL ? `${prefix}/graphql` : undefined,
                storage: hasFiles ? `${prefix}/storage` : undefined,
                analytics: hasAnalytics ? `${prefix}/analytics` : undefined,
                hub: hasHub ? `${prefix}/hub` : undefined,
                automation: `${prefix}/automation`, 
        };

        return {
            name: 'ObjectOS',
            version: '1.0.0',
            environment: getEnv('NODE_ENV', 'development'),
            routes,
            endpoints: routes, // Alias for backward compatibility with some clients
            features: {
                graphql: hasGraphQL,
                search: hasSearch,
                websockets: hasWebSockets,
                files: hasFiles,
                analytics: hasAnalytics,
                hub: hasHub,
            },
            locale: {
                default: 'en',
                supported: ['en', 'zh-CN'],
                timezone: 'UTC'
            }
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
        const authService = this.getService(CoreServiceName.enum.auth);
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
     * Standard: /metadata/:type/:name
     * Fallback for backward compat: /metadata (all objects), /metadata/:objectName (get object)
     */
    async handleMetadata(path: string, context: HttpProtocolContext, method?: string, body?: any): Promise<HttpDispatcherResult> {
        const broker = this.ensureBroker();
        const parts = path.replace(/^\/+/, '').split('/').filter(Boolean);
        
        // GET /metadata/types
        if (parts[0] === 'types') {
            // Try protocol service for dynamic types
            const protocol = this.kernel?.context?.getService ? this.kernel.context.getService('protocol') : null;
            if (protocol && typeof protocol.getMetaTypes === 'function') {
                const result = await protocol.getMetaTypes({});
                return { handled: true, response: this.success(result) };
            }
            // Fallback: ask broker for registered types
            try {
                const data = await broker.call('metadata.types', {}, { request: context.request });
                return { handled: true, response: this.success(data) };
            } catch {
                // Last resort: hardcoded defaults
                return { handled: true, response: this.success({ types: ['object', 'app', 'plugin'] }) };
            }
        }

        // /metadata/:type/:name
        if (parts.length === 2) {
            const [type, name] = parts;

            // PUT /metadata/:type/:name (Save)
            if (method === 'PUT' && body) {
                // Try to get the protocol service directly
                const protocol = this.kernel?.context?.getService ? this.kernel.context.getService('protocol') : null;
                
                if (protocol && typeof protocol.saveMetaItem === 'function') {
                    try {
                        const result = await protocol.saveMetaItem({ type, name, item: body });
                        return { handled: true, response: this.success(result) };
                    } catch (e: any) {
                        return { handled: true, response: this.error(e.message, 400) };
                    }
                }
                
                // Fallback to broker if protocol not available (legacy)
                try {
                     const data = await broker.call('metadata.saveItem', { type, name, item: body }, { request: context.request });
                     return { handled: true, response: this.success(data) };
                } catch (e: any) {
                     // If broker doesn't support it either
                     return { handled: true, response: this.error(e.message || 'Save not supported', 501) };
                }
            }

            try {
                // Try specific calls based on type
                if (type === 'objects' || type === 'object') {
                    const data = await broker.call('metadata.getObject', { objectName: name }, { request: context.request });
                    return { handled: true, response: this.success(data) };
                }

                // If type is singular (e.g. 'app'), use it directly
                // If plural (e.g. 'apps'), slice it
                const singularType = type.endsWith('s') ? type.slice(0, -1) : type;
                
                // Try Protocol Service First (Preferred)
                const protocol = this.kernel?.context?.getService ? this.kernel.context.getService('protocol') : null;
                if (protocol && typeof protocol.getMetaItem === 'function') {
                     try {
                        const data = await protocol.getMetaItem({ type: singularType, name });
                        return { handled: true, response: this.success(data) };
                     } catch (e: any) {
                        // Protocol might throw if not found or not supported
                        // Fallback to broker?
                     }
                }

                // Generic call for other types if supported via Broker (Legacy)
                const method = `metadata.get${this.capitalize(singularType)}`;
                const data = await broker.call(method, { name }, { request: context.request });
                return { handled: true, response: this.success(data) };
            } catch (e: any) {
                // Fallback: treat first part as object name if only 1 part (handled below)
                // But here we are deep in 2 parts. Must be an error.
                return { handled: true, response: this.error(e.message, 404) };
            }
        }
        
        // GET /metadata/:type (List items of type) OR /metadata/:objectName (Legacy)
        if (parts.length === 1) {
            const typeOrName = parts[0];
            
            // Try protocol service first for any type
            const protocol = this.kernel?.context?.getService ? this.kernel.context.getService('protocol') : null;
            if (protocol && typeof protocol.getMetaItems === 'function') {
                try {
                    const data = await protocol.getMetaItems({ type: typeOrName });
                    if (data && ((data.items && data.items.length > 0) || (Array.isArray(data) && data.length > 0))) {
                        return { handled: true, response: this.success(data) };
                    }
                } catch {
                    // Protocol doesn't know this type, fall through
                }
            }

            // Try broker for the type
            try {
                if (typeOrName === 'objects') {
                    const data = await broker.call('metadata.objects', {}, { request: context.request });
                    return { handled: true, response: this.success(data) };
                }
                const data = await broker.call(`metadata.${typeOrName}`, {}, { request: context.request });
                if (data !== null && data !== undefined) {
                    return { handled: true, response: this.success(data) };
                }
            } catch {
                // Broker doesn't support this action, fall through
            }

            // Legacy: /metadata/:objectName (treat as single object lookup)
            try {
                const data = await broker.call('metadata.getObject', { objectName: typeOrName }, { request: context.request });
                return { handled: true, response: this.success(data) };
            } catch (e: any) {
                return { handled: true, response: this.error(e.message, 404) };
            }
        }

        // GET /metadata — return available metadata types
        if (parts.length === 0) {
            // Try protocol service for dynamic types
            const protocol = this.kernel?.context?.getService ? this.kernel.context.getService('protocol') : null;
            if (protocol && typeof protocol.getMetaTypes === 'function') {
                const result = await protocol.getMetaTypes({});
                return { handled: true, response: this.success(result) };
            }
            // Fallback: ask broker for registered types
            try {
                const data = await broker.call('metadata.types', {}, { request: context.request });
                return { handled: true, response: this.success(data) };
            } catch {
                return { handled: true, response: this.success({ types: ['object', 'app', 'plugin'] }) };
            }
        }
        
        return { handled: false };
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
                // Spec complaint: forward the whole body { operation, records, options }
                // Implementation in Kernel should handle the 'operation' field
                const result = await broker.call('data.batch', { object: objectName, ...body }, { request: context.request });
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
     * Handles Analytics requests
     * path: sub-path after /analytics/
     */
    async handleAnalytics(path: string, method: string, body: any, context: HttpProtocolContext): Promise<HttpDispatcherResult> {
        const analyticsService = this.getService(CoreServiceName.enum.analytics);
        if (!analyticsService) return { handled: false }; // 404 handled by caller if unhandled

        const m = method.toUpperCase();
        const subPath = path.replace(/^\/+/, '');

        // POST /analytics/query
        if (subPath === 'query' && m === 'POST') {
            const result = await analyticsService.query(body, { request: context.request });
            return { handled: true, response: this.success(result) };
        }

        // GET /analytics/meta
        if (subPath === 'meta' && m === 'GET') {
            const result = await analyticsService.getMetadata({ request: context.request });
             return { handled: true, response: this.success(result) };
        }

        // POST /analytics/sql (Dry-run or debug)
        if (subPath === 'sql' && m === 'POST') {
             // Assuming service has generateSql method
             const result = await analyticsService.generateSql(body, { request: context.request });
             return { handled: true, response: this.success(result) };
        }

        return { handled: false };
    }

    /**
     * Handles Hub requests
     * path: sub-path after /hub/
     */
    async handleHub(path: string, method: string, body: any, query: any, context: HttpProtocolContext): Promise<HttpDispatcherResult> {
        const hubService = this.getService(CoreServiceName.enum.hub);
        if (!hubService) return { handled: false };

        const m = method.toUpperCase();
        const parts = path.replace(/^\/+/, '').split('/');
        
        // Resource-based routing: /hub/:resource/:id
        if (parts.length > 0) {
            const resource = parts[0]; // spaces, plugins, etc.
            
            // Allow mapping "spaces" -> "createSpace", "listSpaces" etc.
            // Convention: 
            // GET /spaces -> listSpaces
            // POST /spaces -> createSpace
            // GET /spaces/:id -> getSpace
            // PATCH /spaces/:id -> updateSpace
            // DELETE /spaces/:id -> deleteSpace
            
            const actionBase = resource.endsWith('s') ? resource.slice(0, -1) : resource; // space
            const id = parts[1];

            try {
                if (parts.length === 1) {
                    // Collection Operations
                    if (m === 'GET') {
                        const capitalizedAction = 'list' + this.capitalize(resource); // listSpaces
                        if (typeof hubService[capitalizedAction] === 'function') {
                            const result = await hubService[capitalizedAction](query, { request: context.request });
                            return { handled: true, response: this.success(result) };
                        }
                    }
                    if (m === 'POST') {
                        const capitalizedAction = 'create' + this.capitalize(actionBase); // createSpace
                        if (typeof hubService[capitalizedAction] === 'function') {
                             const result = await hubService[capitalizedAction](body, { request: context.request });
                             return { handled: true, response: this.success(result) };
                        }
                    }
                } else if (parts.length === 2) {
                    // Item Operations
                     if (m === 'GET') {
                        const capitalizedAction = 'get' + this.capitalize(actionBase); // getSpace
                        if (typeof hubService[capitalizedAction] === 'function') {
                             const result = await hubService[capitalizedAction](id, { request: context.request });
                             return { handled: true, response: this.success(result) };
                        }
                    }
                     if (m === 'PATCH' || m === 'PUT') {
                        const capitalizedAction = 'update' + this.capitalize(actionBase); // updateSpace
                        if (typeof hubService[capitalizedAction] === 'function') {
                             const result = await hubService[capitalizedAction](id, body, { request: context.request });
                             return { handled: true, response: this.success(result) };
                        }
                    }
                    if (m === 'DELETE') {
                        const capitalizedAction = 'delete' + this.capitalize(actionBase); // deleteSpace
                        if (typeof hubService[capitalizedAction] === 'function') {
                             const result = await hubService[capitalizedAction](id, { request: context.request });
                             return { handled: true, response: this.success(result) };
                        }
                    }
                }
            } catch(e: any) {
                return { handled: true, response: this.error(e.message, 500) };
            }
        }
        
        return { handled: false };
    }

    /**
     * Handles Storage requests
     * path: sub-path after /storage/
     */
    async handleStorage(path: string, method: string, file: any, context: HttpProtocolContext): Promise<HttpDispatcherResult> {
        const storageService = this.getService(CoreServiceName.enum['file-storage']) || this.kernel.services?.['file-storage'];
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

    /**
     * Handles UI requests
     * path: sub-path after /ui/
     */
    async handleUi(path: string, query: any, _context: HttpProtocolContext): Promise<HttpDispatcherResult> {
        const parts = path.replace(/^\/+/, '').split('/').filter(Boolean);
        
        // GET /ui/view/:object (with optional type param)
        if (parts[0] === 'view' && parts[1]) {
            const objectName = parts[1];
            // Support both path param /view/obj/list AND query param /view/obj?type=list
            const type = parts[2] || query?.type || 'list';

            const protocol = this.kernel?.context?.getService ? this.kernel.context.getService('protocol') : null;
            
            if (protocol && typeof protocol.getUiView === 'function') {
                try {
                    const result = await protocol.getUiView({ object: objectName, type });
                    return { handled: true, response: this.success(result) };
                } catch (e: any) {
                    return { handled: true, response: this.error(e.message, 500) };
                }
            } else {
                 return { handled: true, response: this.error('Protocol service not available', 503) };
            }
        }

        return { handled: false };
    }

    /**
     * Handles Automation requests
     * path: sub-path after /automation/
     */
    async handleAutomation(path: string, method: string, body: any, context: HttpProtocolContext): Promise<HttpDispatcherResult> {
        const automationService = this.getService(CoreServiceName.enum.automation);
        if (!automationService) return { handled: false };

        const m = method.toUpperCase();
        const parts = path.replace(/^\/+/, '').split('/');
        
        // POST /automation/trigger/:name
        if (parts[0] === 'trigger' && parts[1] && m === 'POST') {
             const triggerName = parts[1];
             if (typeof automationService.trigger === 'function') {
                 const result = await automationService.trigger(triggerName, body, { request: context.request });
                 return { handled: true, response: this.success(result) };
             }
        }
        
        return { handled: false };
    }

    private getServicesMap(): Record<string, any> {
        if (this.kernel.services instanceof Map) {
            return Object.fromEntries(this.kernel.services);
        }
        return this.kernel.services || {};
    }

    private getService(name: CoreServiceName) {
        if (typeof this.kernel.getService === 'function') {
            return this.kernel.getService(name);
        }
        const services = this.getServicesMap();
        return services[name];
    }

    private capitalize(s: string) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    /**
     * Main Dispatcher Entry Point
     * Routes the request to the appropriate handler based on path and precedence
     */
    async dispatch(method: string, path: string, body: any, query: any, context: HttpProtocolContext): Promise<HttpDispatcherResult> {
        const cleanPath = path.replace(/\/$/, ''); // Remove trailing slash if present, but strict on clean paths

        // 0. Root Discovery Endpoint (GET /)
        // Handles request to base URL (e.g. /api/v1) which MSW strips to empty string
        if (cleanPath === '' && method === 'GET') {
             // We use '' as prefix since we are internal dispatcher
             const info = this.getDiscoveryInfo('');
             return { 
                 handled: true, 
                 response: this.success(info) 
             };
        }

        // 1. System Protocols (Prefix-based)
        if (cleanPath.startsWith('/auth')) {
            return this.handleAuth(cleanPath.substring(5), method, body, context);
        }
        
        if (cleanPath.startsWith('/meta')) {
             return this.handleMetadata(cleanPath.substring(5), context);
        }

        if (cleanPath.startsWith('/data')) {
            return this.handleData(cleanPath.substring(5), method, body, query, context);
        }
        
        if (cleanPath.startsWith('/graphql')) {
             if (method === 'POST') return this.handleGraphQL(body, context);
             // GraphQL usually GET for Playground is handled by middleware but we can return 405 or handle it
        }

        if (cleanPath.startsWith('/storage')) {
             return this.handleStorage(cleanPath.substring(8), method, body, context); // body here is file/stream for upload
        }
        
        if (cleanPath.startsWith('/ui')) {
             return this.handleUi(cleanPath.substring(3), query, context);
        }

        if (cleanPath.startsWith('/automation')) {
             return this.handleAutomation(cleanPath.substring(11), method, body, context);
        }
        
        if (cleanPath.startsWith('/analytics')) {
             return this.handleAnalytics(cleanPath.substring(10), method, body, context);
        }

        if (cleanPath.startsWith('/hub')) {
             return this.handleHub(cleanPath.substring(4), method, body, query, context);
        }

        // OpenAPI Specification
        if (cleanPath === '/openapi.json' && method === 'GET') {
             const broker = this.ensureBroker();
             try {
                const result = await broker.call('metadata.generateOpenApi', {}, { request: context.request });
                return { handled: true, response: this.success(result) };
             } catch (e) {
                // If not implemented, fall through or return 404
             }
        }

        // 2. Custom API Endpoints (Registry lookup)
        // Check if there is a custom endpoint defined for this path
        const result = await this.handleApiEndpoint(cleanPath, method, body, query, context);
        if (result.handled) return result;

        // 3. Fallback (404)
        return { handled: false };
    }

    /**
     * Handles Custom API Endpoints defined in metadata
     */
    async handleApiEndpoint(path: string, method: string, body: any, query: any, context: HttpProtocolContext): Promise<HttpDispatcherResult> {
        const broker = this.ensureBroker();
        try {
            // Attempt to find a matching endpoint in the registry
            // This assumes a 'metadata.matchEndpoint' action exists in the kernel/registry
            // path should include initial slash e.g. /api/v1/customers
            const endpoint = await broker.call('metadata.matchEndpoint', { path, method });
            
            if (endpoint) {
                // Execute the endpoint target logic
                if (endpoint.type === 'flow') {
                    const result = await broker.call('automation.runFlow', { 
                        flowId: endpoint.target, 
                        inputs: { ...query, ...body, _request: context.request } 
                    });
                     return { handled: true, response: this.success(result) };
                }
                
                if (endpoint.type === 'script') {
                     const result = await broker.call('automation.runScript', { 
                        scriptName: endpoint.target, 
                        context: { ...query, ...body, request: context.request } 
                    }, { request: context.request });
                     return { handled: true, response: this.success(result) };
                }

                if (endpoint.type === 'object_operation') {
                    // e.g. Proxy to an object action
                    if (endpoint.objectParams) {
                        const { object, operation } = endpoint.objectParams;
                        // Map standard CRUD operations
                        if (operation === 'find') {
                             const result = await broker.call('data.query', { object, filters: query }, { request: context.request });
                             return { handled: true, response: this.success(result.data, { count: result.count }) };
                        }
                        if (operation === 'get' && query.id) {
                             const result = await broker.call('data.get', { object, id: query.id }, { request: context.request });
                             return { handled: true, response: this.success(result) };
                        }
                         if (operation === 'create') {
                             const result = await broker.call('data.create', { object, data: body }, { request: context.request });
                             return { handled: true, response: this.success(result) };
                        }
                    }
                }

                if (endpoint.type === 'proxy') {
                     // Simple proxy implementation (requires a network call, which usually is done by a service but here we can stub return)
                     // In real implementation this might fetch(endpoint.target)
                     // For now, return target info
                     return { 
                         handled: true, 
                         response: { 
                             status: 200, 
                             body: { proxy: true, target: endpoint.target, note: 'Proxy execution requires http-client service' } 
                         } 
                     };
                }
            }
        } catch (e) {
            // If matchEndpoint fails (e.g. not found), we just return not handled
            // so we can fallback to 404 or other handlers
        }

        return { handled: false };
    }
}
