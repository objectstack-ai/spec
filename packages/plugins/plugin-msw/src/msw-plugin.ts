import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import { 
    Plugin, 
    PluginContext, 
    ObjectKernel,
    IDataEngine
} from '@objectstack/runtime';
import { ObjectStackProtocolImplementation } from '@objectstack/objectql';
import { ObjectStackProtocol } from '@objectstack/spec/api';
// import { IDataEngine } from '@objectstack/core';

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
    version = '1.0.0';
    
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
            const dataEngine = ctx.getService<IDataEngine>('objectql');
            this.protocol = new ObjectStackProtocolImplementation(dataEngine);
            ctx.logger.debug('Protocol implementation created');
        } catch (e) {
            ctx.logger.error('Failed to initialize protocol', e as Error);
            throw new Error('[MSWPlugin] Failed to initialize protocol (missing objectql service?)');
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
            throw new Error('[MSWPlugin] Protocol not initialized');
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
            http.get(`${baseUrl}/meta`, async () => {
                return HttpResponse.json(await protocol.getMetaTypes({}));
            }),

            http.get(`${baseUrl}/meta/:type`, async ({ params }) => {
                return HttpResponse.json(await protocol.getMetaItems({ type: params.type as string }));
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
                    const queryParams: Record<string, any> = {};
                    url.searchParams.forEach((value, key) => {
                        queryParams[key] = value;
                    });
                    
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

            // View Storage Operations
            http.post(`${baseUrl}/ui/views`, async ({ request }) => {
                try {
                    const body = await request.json();
                    const result = await protocol.createView(body as any);
                    if (result.success) {
                        return HttpResponse.json(result, { status: 201 });
                    } else {
                        return HttpResponse.json(result, { status: 400 });
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ success: false, error: { code: 'internal_error', message } }, { status: 500 });
                }
            }),

            http.get(`${baseUrl}/ui/views/:id`, async ({ params }) => {
                try {
                    const result = await protocol.getView({ id: params.id as string });
                    if (result.success) {
                        return HttpResponse.json(result);
                    } else {
                        return HttpResponse.json(result, { status: 404 });
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ success: false, error: { code: 'internal_error', message } }, { status: 500 });
                }
            }),

            http.get(`${baseUrl}/ui/views`, async ({ request }) => {
                try {
                    const url = new URL(request.url);
                    const queryRequest: any = {};
                    if (url.searchParams.get('object')) queryRequest.object = url.searchParams.get('object');
                    if (url.searchParams.get('type')) queryRequest.type = url.searchParams.get('type');
                    if (url.searchParams.get('visibility')) queryRequest.visibility = url.searchParams.get('visibility');
                    if (url.searchParams.get('createdBy')) queryRequest.createdBy = url.searchParams.get('createdBy');
                    if (url.searchParams.get('isDefault')) queryRequest.isDefault = url.searchParams.get('isDefault') === 'true';
                    
                    // Parse numeric parameters with validation
                    const limitParam = url.searchParams.get('limit');
                    const offsetParam = url.searchParams.get('offset');
                    if (limitParam) {
                        const limit = parseInt(limitParam, 10);
                        if (!isNaN(limit) && limit > 0) queryRequest.limit = limit;
                    }
                    if (offsetParam) {
                        const offset = parseInt(offsetParam, 10);
                        if (!isNaN(offset) && offset >= 0) queryRequest.offset = offset;
                    }
                    
                    const result = await protocol.listViews(queryRequest);
                    return HttpResponse.json(result);
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ success: false, error: { code: 'internal_error', message } }, { status: 500 });
                }
            }),

            http.patch(`${baseUrl}/ui/views/:id`, async ({ params, request }) => {
                try {
                    const body = await request.json() as any;
                    // Merge body with id parameter, ensuring body is an object
                    const updateData = (typeof body === 'object' && body !== null) 
                        ? { ...body, id: params.id as string } 
                        : { id: params.id as string };
                    
                    const result = await protocol.updateView(updateData as any);
                    if (result.success) {
                        return HttpResponse.json(result);
                    } else {
                        const statusCode = result.error?.code === 'resource_not_found' ? 404 : 400;
                        return HttpResponse.json(result, { status: statusCode });
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ success: false, error: { code: 'internal_error', message } }, { status: 500 });
                }
            }),

            http.delete(`${baseUrl}/ui/views/:id`, async ({ params }) => {
                try {
                    const result = await protocol.deleteView({ id: params.id as string });
                    if (result.success) {
                        return HttpResponse.json(result);
                    } else {
                        return HttpResponse.json(result, { status: 404 });
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ success: false, error: { code: 'internal_error', message } }, { status: 500 });
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
