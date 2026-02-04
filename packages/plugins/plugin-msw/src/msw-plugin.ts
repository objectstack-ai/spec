import { http, HttpResponse, passthrough } from 'msw';
import { setupWorker } from 'msw/browser';
import { 
    Plugin, 
    PluginContext, 
    ObjectKernel,
    IDataEngine
} from '@objectstack/runtime';
// import { ObjectStackProtocolImplementation } from '@objectstack/objectql';
import { ObjectStackProtocol } from '@objectstack/spec/api';
// import { IDataEngine } from '@objectstack/core';

// Helper for parsing query parameters
function parseQueryParams(url: URL): Record<string, any> {
    const params: Record<string, any> = {};
    const keys = Array.from(new Set(url.searchParams.keys()));

    for (const key of keys) {
        const values = url.searchParams.getAll(key);
        // If single value, use it directly. If multiple, keep as array.
        const rawValue = values.length === 1 ? values[0] : values;
        
        // Helper to parse individual value
        const parseValue = (val: string) => {
            if (val === 'true') return true;
            if (val === 'false') return false;
            if (val === 'null') return null;
            if (val === 'undefined') return undefined;
            
            // Try number (integers only or floats)
            // Safety check: Don't convert if it loses information (like leading zeros)
            const num = Number(val);
            if (!isNaN(num) && val.trim() !== '' && String(num) === val) {
                return num;
            }
            
            // Try JSON
            if ((val.startsWith('{') && val.endsWith('}')) || (val.startsWith('[') && val.endsWith(']'))) {
                try {
                    return JSON.parse(val);
                } catch {}
            }
            
            return val;
        };

        if (Array.isArray(rawValue)) {
            params[key] = rawValue.map(parseValue);
        } else {
            params[key] = parseValue(rawValue as string);
        }
    }
    
    return params;
}

// Helper to normalize flat parameters into 'where' clause
function normalizeQuery(params: Record<string, any>): Record<string, any> {
    // If 'where' is already present, trust it
    if (params.where) return params;

    const reserved = ['select', 'order', 'orderBy', 'sort', 'limit', 'skip', 'offset', 'top', 'page', 'pageSize', 'count'];
    const where: Record<string, any> = {};
    let hasWhere = false;

    for (const key in params) {
        if (!reserved.includes(key)) {
            where[key] = params[key];
            hasWhere = true;
        }
    }

    if (hasWhere) {
        // Keep original params but add where. 
        // This allows protocols that look at root properties to still work, 
        // while providing 'where' for strict drivers.
        return { ...params, where };
    }
    
    return params;
}


export interface MSWPluginOptions {
    /**
     * Enable MSW in the browser environment
     */
    enableBrowser?: boolean;
    
    /**
     * Custom handlers to add to MSW
     */
    customHandlers?: Array<any>;
    
    /**
     * Base URL for API endpoints
     */
    baseUrl?: string;
    
    /**
     * Whether to log requests
     */
    logRequests?: boolean;
}

/**
 * ObjectStack Server Mock - Provides mock database functionality
 */
export class ObjectStackServer {
    private static protocol: ObjectStackProtocol | null = null;
    private static logger: any | null = null;

    static init(protocol: ObjectStackProtocol, logger?: any) {
        this.protocol = protocol;
        this.logger = logger || { 
            info: console.log, 
            debug: console.debug, 
            warn: console.warn, 
            error: console.error 
        };
    }

    static async findData(object: string, params?: any) {
        if (!this.protocol) {
            throw new Error('ObjectStackServer not initialized. Call ObjectStackServer.init() first.');
        }
        
        this.logger?.debug?.('MSW: Finding records', { object, params });
        const result = await this.protocol.findData({ object, query: params || {} });
        this.logger?.debug?.('MSW: Find completed', { object, count: result?.records?.length ?? 0 });
        return {
            status: 200,
            data: result
        };
    }

    static async getData(object: string, id: string) {
        if (!this.protocol) {
            throw new Error('ObjectStackServer not initialized. Call ObjectStackServer.init() first.');
        }
        
        this.logger?.debug?.('MSW: Getting record', { object, id });
        try {
            const result = await this.protocol.getData({ object, id });
            this.logger?.debug?.('MSW: Get completed', { object, id });
            return {
                status: 200,
                data: result
            };
        } catch (error) {
            this.logger?.warn?.('MSW: Get failed - not found', { object, id });
            const message = error instanceof Error ? error.message : 'Unknown error';
            return {
                status: 404,
                data: { error: message }
            };
        }
    }

    static async createData(object: string, data: any) {
        if (!this.protocol) {
            throw new Error('ObjectStackServer not initialized. Call ObjectStackServer.init() first.');
        }
        
        this.logger?.debug?.('MSW: Creating record', { object });
        try {
            const result = await this.protocol.createData({ object, data });
            this.logger?.info?.('MSW: Record created', { object, id: result?.id });
            return {
                status: 201,
                data: result
            };
        } catch (error) {
            this.logger?.error?.('MSW: Create failed', error, { object });
            const message = error instanceof Error ? error.message : 'Unknown error';
            return {
                status: 400,
                data: { error: message }
            };
        }
    }

    static async updateData(object: string, id: string, data: any) {
        if (!this.protocol) {
            throw new Error('ObjectStackServer not initialized. Call ObjectStackServer.init() first.');
        }
        
        this.logger?.debug?.('MSW: Updating record', { object, id });
        try {
            const result = await this.protocol.updateData({ object, id, data });
            this.logger?.info?.('MSW: Record updated', { object, id });
            return {
                status: 200,
                data: result
            };
        } catch (error) {
            this.logger?.error?.('MSW: Update failed', error, { object, id });
            const message = error instanceof Error ? error.message : 'Unknown error';
            return {
                status: 400,
                data: { error: message }
            };
        }
    }

    static async deleteData(object: string, id: string) {
        if (!this.protocol) {
            throw new Error('ObjectStackServer not initialized. Call ObjectStackServer.init() first.');
        }
        
        this.logger?.debug?.('MSW: Deleting record', { object, id });
        try {
            const result = await this.protocol.deleteData({ object, id });
            this.logger?.info?.('MSW: Record deleted', { object, id, success: result?.success });
            return {
                status: 200,
                data: result
            };
        } catch (error) {
            this.logger?.error?.('MSW: Delete failed', error, { object, id });
            const message = error instanceof Error ? error.message : 'Unknown error';
            return {
                status: 400,
                data: { error: message }
            };
        }
    }

    static async analyticsQuery(request: any) {
        if (!this.protocol) {
            throw new Error('ObjectStackServer not initialized. Call ObjectStackServer.init() first.');
        }

        this.logger?.debug?.('MSW: Executing analytics query', { request });
        try {
            const result = await this.protocol.analyticsQuery(request);
            this.logger?.debug?.('MSW: Analytics query completed', { result });
            return {
                status: 200,
                data: result
            };
        } catch (error) {
            this.logger?.error?.('MSW: Analytics query failed', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            return {
                status: 400,
                data: { error: message }
            };
        }
    }

    static async getAnalyticsMeta(request: any) {
        if (!this.protocol) {
            throw new Error('ObjectStackServer not initialized. Call ObjectStackServer.init() first.');
        }

        this.logger?.debug?.('MSW: Getting analytics metadata', { request });
        try {
            const result = await this.protocol.getAnalyticsMeta(request);
            this.logger?.debug?.('MSW: Analytics metadata retrieved', { result });
            return {
                status: 200,
                data: result
            };
        } catch (error) {
            this.logger?.error?.('MSW: Analytics metadata failed', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            return {
                status: 400,
                data: { error: message }
            };
        }
    }

    static async triggerAutomation(request: any) {
        if (!this.protocol) {
            throw new Error('ObjectStackServer not initialized. Call ObjectStackServer.init() first.');
        }

        this.logger?.debug?.('MSW: Triggering automation', { request });
        try {
            const result = await this.protocol.triggerAutomation(request);
            this.logger?.info?.('MSW: Automation triggered', { result });
            return {
                status: 200,
                data: result
            };
        } catch (error) {
            this.logger?.error?.('MSW: Automation trigger failed', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            return {
                status: 400,
                data: { error: message }
            };
        }
    }

    // Legacy method names for compatibility
    static async getUser(id: string) {
        return this.getData('user', id);
    }

    static async createUser(data: any) {
        return this.createData('user', data);
    }
}

/**
 * MSW Plugin for ObjectStack
 * 
 * This plugin enables Mock Service Worker integration for testing and development.
 * It automatically mocks API endpoints using the ObjectStack runtime protocol.
 * 
 * @example
 * ```typescript
 * import { MSWPlugin } from '@objectstack/plugin-msw';
 * 
 * // With ObjectKernel
 * const kernel = new ObjectKernel();
 * kernel.use(new MSWPlugin({
 *   enableBrowser: true,
 *   baseUrl: '/api/v1'
 * }));
 * ```
 */
export class MSWPlugin implements Plugin {
    name = 'com.objectstack.plugin.msw';
    version = '0.9.0';
    
    private options: MSWPluginOptions;
    private worker: any;
    private handlers: Array<any> = [];
    private protocol?: ObjectStackProtocol;

    constructor(options: MSWPluginOptions = {}) {
        this.options = {
            enableBrowser: true,
            baseUrl: '/api/v1',
            logRequests: true,
            ...options
        };
    }

    /**
     * Init phase
     */
    async init(ctx: PluginContext) {
        ctx.logger.debug('Initializing MSW plugin', { 
            enableBrowser: this.options.enableBrowser,
            baseUrl: this.options.baseUrl,
            logRequests: this.options.logRequests
        });
        // Protocol will be created in start phase
        ctx.logger.info('MSW plugin initialized');
    }

    /**
     * Start phase
     */
    async start(ctx: PluginContext) {
        ctx.logger.debug('Starting MSW plugin');
        
        try {
            // 1. Try to get existing protocol service
            try {
                this.protocol = ctx.getService<ObjectStackProtocol>('protocol');
                ctx.logger.debug('Protocol service found from context');
            } catch (e) {
                // Ignore, will try to create default implementation
            }

            // 2. If not found, try to instantiate default implementation dynamically
            if (!this.protocol) {
                try {
                    const dataEngine = ctx.getService<IDataEngine>('objectql');
                    // Dynamically import ObjectStackProtocolImplementation to avoid hard dependency
                    const { ObjectStackProtocolImplementation } = await import('@objectstack/objectql');
                    this.protocol = new ObjectStackProtocolImplementation(dataEngine);
                    ctx.logger.debug('Protocol implementation created dynamically');
                } catch (e: any) {
                    if (e.code === 'ERR_MODULE_NOT_FOUND') {
                         ctx.logger.warn('Module @objectstack/objectql not found. Protocol not initialized.');
                    } else {
                         throw e;
                    }
                }
            }
        
            if (!this.protocol) {
                // Without a protocol, MSW can't serve data APIs
                ctx.logger.warn('No ObjectStackProtocol service available. MSW will only serve static/custom handlers if configured.');
            }

        } catch (e) {
            ctx.logger.error('Failed to initialize protocol', e as Error);
            throw new Error('[MSWPlugin] Failed to initialize protocol');
        }
        
        this.setupHandlers(ctx);
        await this.startWorker(ctx);
    }

    /**
     * Destroy phase
     */
    async destroy() {
        await this.stopWorker();
    }

    /**
     * Setup MSW handlers
     */
    private setupHandlers(ctx: PluginContext) {
        if (!this.protocol) {
            ctx.logger.warn('[MSWPlugin] Protocol not initialized. Skipping default API handlers.');
            this.handlers = [
                ...(this.options.customHandlers || [])
            ];
            return;
        }

        const protocol = this.protocol;
        
        // Initialize ObjectStackServer with structured logger
        ObjectStackServer.init(
            protocol,
            this.options.logRequests ? ctx.logger : undefined
        );

        ctx.logger.debug('Initialized ObjectStackServer', { logRequests: this.options.logRequests });

        const baseUrl = this.options.baseUrl || '/api/v1';

        // Define standard ObjectStack API handlers
        this.handlers = [
            // Discovery endpoint
            http.get(`${baseUrl}`, async () => {
                const discovery = await protocol.getDiscovery({});
                return HttpResponse.json({
                    ...discovery,
                    routes: {
                        data: `${baseUrl}/data`,
                        metadata: `${baseUrl}/meta`,
                        ui: `${baseUrl}/ui`,
                        auth: `${baseUrl}/auth`
                    }
                });
            }),

            // Meta endpoints
            http.get(`${baseUrl}/meta`, async ({ request }) => {
                const url = new URL(request.url);
                const query = parseQueryParams(url);
                return HttpResponse.json(await protocol.getMetaTypes({ query }));
            }),

            http.get(`${baseUrl}/meta/:type`, async ({ params, request }) => {
                const url = new URL(request.url);
                const query = parseQueryParams(url);
                return HttpResponse.json(await protocol.getMetaItems({ type: params.type as string, query }));
            }),

            http.get(`${baseUrl}/meta/:type/:name`, async ({ params }) => {
                try {
                    return HttpResponse.json(
                        await protocol.getMetaItem({ type: params.type as string, name: params.name as string })
                    );
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ error: message }, { status: 404 });
                }
            }),

            // Data endpoints
            http.get(`${baseUrl}/data/:object`, async ({ params, request }) => {
                try {
                    const url = new URL(request.url);
                    
                    // Use helper to parse properly (handle multiple values, JSON strings, numbers)
                    const rawParams = parseQueryParams(url);
                    
                    // Normalize to standard query object (move flats to 'where')
                    const queryParams = normalizeQuery(rawParams);
                    
                    const result = await ObjectStackServer.findData(
                        params.object as string,
                        queryParams
                    );
                    return HttpResponse.json(result.data, { 
                        status: result.status,
                        headers: { 'Cache-Control': 'no-store' }
                    });
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ error: message }, { status: 404 });
                }
            }),

            http.get(`${baseUrl}/data/:object/:id`, async ({ params }) => {
                try {
                    const result = await ObjectStackServer.getData(
                        params.object as string,
                        params.id as string
                    );
                    return HttpResponse.json(result.data, { 
                        status: result.status,
                        headers: { 'Cache-Control': 'no-store' }
                    });
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ error: message }, { status: 404 });
                }
            }),

            http.post(`${baseUrl}/data/:object`, async ({ params, request }) => {
                try {
                    const body = await request.json();
                    const result = await ObjectStackServer.createData(
                        params.object as string,
                        body
                    );
                    return HttpResponse.json(result.data, { status: result.status });
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ error: message }, { status: 400 });
                }
            }),

            http.patch(`${baseUrl}/data/:object/:id`, async ({ params, request }) => {
                try {
                    const body = await request.json();
                    const result = await ObjectStackServer.updateData(
                        params.object as string,
                        params.id as string,
                        body
                    );
                    return HttpResponse.json(result.data, { status: result.status });
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ error: message }, { status: 400 });
                }
            }),

            http.delete(`${baseUrl}/data/:object/:id`, async ({ params }) => {
                try {
                    const result = await ObjectStackServer.deleteData(
                        params.object as string,
                        params.id as string
                    );
                    return HttpResponse.json(result.data, { status: result.status });
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ error: message }, { status: 400 });
                }
            }),

            // Batch Operations
            http.post(`${baseUrl}/data/:object/batch`, async ({ params, request }) => {
                try {
                    const body = await request.json();
                    const result = await protocol.batchData({ object: params.object as string, request: body as any });
                    return HttpResponse.json(result);
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ error: message }, { status: 400 });
                }
            }),

            http.post(`${baseUrl}/data/:object/createMany`, async ({ params, request }) => {
                try {
                    const body = await request.json();
                    const records = Array.isArray(body) ? body : [];
                    const result = await protocol.createManyData({ object: params.object as string, records });
                    return HttpResponse.json(result, { status: 201 });
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ error: message }, { status: 400 });
                }
            }),

            http.post(`${baseUrl}/data/:object/updateMany`, async ({ params, request }) => {
                try {
                    const body = await request.json() as any;
                    const result = await protocol.updateManyData({ 
                        object: params.object as string, 
                        records: body?.records || [], 
                        options: body?.options 
                    });
                    return HttpResponse.json(result);
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ error: message }, { status: 400 });
                }
            }),

            http.post(`${baseUrl}/data/:object/deleteMany`, async ({ params, request }) => {
                try {
                    const body = await request.json() as any;
                    const result = await protocol.deleteManyData({ 
                        object: params.object as string, 
                        ids: body?.ids || [], 
                        options: body?.options 
                    });
                    return HttpResponse.json(result);
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ error: message }, { status: 400 });
                }
            }),

            // Enhanced Metadata with Cache Support
            http.get(`${baseUrl}/meta/:type/:name`, async ({ params, request }) => {
                try {
                    const cacheRequest = {
                        ifNoneMatch: request.headers.get('if-none-match') || undefined,
                        ifModifiedSince: request.headers.get('if-modified-since') || undefined,
                    };
                    
                    const result = await protocol.getMetaItemCached({ 
                        type: params.type as string, 
                        name: params.name as string, 
                        cacheRequest 
                    });
                    
                    if (result.notModified) {
                        return new HttpResponse(null, { status: 304 });
                    }
                    
                    // Build response headers
                    const headers: Record<string, string> = {};
                    if (result.etag) {
                        const etagValue = result.etag.weak ? `W/"${result.etag.value}"` : `"${result.etag.value}"`;
                        headers['ETag'] = etagValue;
                    }
                    if (result.lastModified) {
                        headers['Last-Modified'] = new Date(result.lastModified).toUTCString();
                    }
                    if (result.cacheControl) {
                        const directives = result.cacheControl.directives.join(', ');
                        const maxAge = result.cacheControl.maxAge ? `, max-age=${result.cacheControl.maxAge}` : '';
                        headers['Cache-Control'] = directives + maxAge;
                    }
                    
                    return HttpResponse.json(result.data, { headers });
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ error: message }, { status: 404 });
                }
            }),

            // UI Protocol endpoint
            http.get(`${baseUrl}/ui/view/:object`, async ({ params, request }) => {
                try {
                    const url = new URL(request.url);
                    const viewType = url.searchParams.get('type') || 'list';
                    const view = await protocol.getUiView({ object: params.object as string, type: viewType as 'list' | 'form' });
                    return HttpResponse.json(view);
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ error: message }, { status: 404 });
                }
            }),

            // Analytics Operations
            http.post(`${baseUrl}/analytics/query`, async ({ request }) => {
                try {
                    const body = await request.json();
                    const result = await ObjectStackServer.analyticsQuery(body);
                    return HttpResponse.json(result.data, { status: result.status });
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ error: message }, { status: 400 });
                }
            }),

            http.get(`${baseUrl}/analytics/meta`, async ({ request }) => {
                try {
                    const url = new URL(request.url);
                    const query = parseQueryParams(url);
                    const result = await ObjectStackServer.getAnalyticsMeta(query);
                    return HttpResponse.json(result.data, { status: result.status });
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ error: message }, { status: 400 });
                }
            }),

            // Automation Operations
            http.post(`${baseUrl}/automation/trigger`, async ({ request }) => {
                try {
                    const body = await request.json();
                    const result = await ObjectStackServer.triggerAutomation(body);
                    return HttpResponse.json(result.data, { status: result.status });
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ error: message }, { status: 400 });
                }
            }),

            // Add custom handlers
            ...(this.options.customHandlers || [])
        ];

        ctx.logger.info('MSW request handlers installed', { count: this.handlers.length, baseUrl });
    }

    /**
     * Start the MSW worker
     */
    private async startWorker(ctx: PluginContext) {
        if (this.options.enableBrowser && typeof window !== 'undefined') {
            // Browser environment
            ctx.logger.debug('Starting MSW in browser mode');
            this.worker = setupWorker(...this.handlers);
            await this.worker.start({
                onUnhandledRequest: 'bypass',
            });
            ctx.logger.info('MSW started in browser mode');
        } else {
            ctx.logger.debug('MSW browser mode disabled or not in browser environment');
        }
    }

    /**
     * Stop the MSW worker
     */
    private async stopWorker() {
        if (this.worker) {
            this.worker.stop();
            console.log('[MSWPlugin] Stopped MSW worker');
        }
    }

    /**
     * Get the MSW worker instance for advanced use cases
     */
    getWorker() {
        return this.worker;
    }

    /**
     * Get registered handlers
     */
    getHandlers() {
        return this.handlers;
    }
}
