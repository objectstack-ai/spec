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
        const result = await this.protocol.findData(object, params || {});
        this.logger?.debug?.('MSW: Find completed', { object, count: result?.length ?? 0 });
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
            const result = await this.protocol.getData(object, id);
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
            const result = await this.protocol.createData(object, data);
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
            const result = await this.protocol.updateData(object, id, data);
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
            const result = await this.protocol.deleteData(object, id);
            this.logger?.info?.('MSW: Record deleted', { object, id, success: result });
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
            http.get(`${baseUrl}`, () => {
                return HttpResponse.json(protocol.getDiscovery());
            }),

            // Meta endpoints
            http.get(`${baseUrl}/meta`, () => {
                return HttpResponse.json(protocol.getMetaTypes());
            }),

            http.get(`${baseUrl}/meta/:type`, ({ params }) => {
                return HttpResponse.json(protocol.getMetaItems(params.type as string));
            }),

            http.get(`${baseUrl}/meta/:type/:name`, ({ params }) => {
                try {
                    return HttpResponse.json(
                        protocol.getMetaItem(params.type as string, params.name as string)
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
                    return HttpResponse.json(result.data, { status: result.status });
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
                    return HttpResponse.json(result.data, { status: result.status });
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

            // UI Protocol endpoint
            http.get(`${baseUrl}/ui/view/:object`, ({ params, request }) => {
                try {
                    const url = new URL(request.url);
                    const viewType = url.searchParams.get('type') || 'list';
                    const view = protocol.getUiView(params.object as string, viewType as 'list' | 'form');
                    return HttpResponse.json(view);
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    return HttpResponse.json({ error: message }, { status: 404 });
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
