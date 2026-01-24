import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import { RuntimePlugin, RuntimeContext, ObjectStackRuntimeProtocol } from '@objectstack/runtime';

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
    private static protocol: ObjectStackRuntimeProtocol | null = null;
    private static logger: ((message: string, ...meta: any[]) => void) | null = null;

    static init(protocol: ObjectStackRuntimeProtocol, logger?: (message: string, ...meta: any[]) => void) {
        this.protocol = protocol;
        this.logger = logger || console.log;
    }

    static async findData(object: string, params?: any) {
        if (!this.protocol) {
            throw new Error('ObjectStackServer not initialized. Call ObjectStackServer.init() first.');
        }
        
        this.logger?.(`[MSW] Finding ${object} records`, params);
        const result = await this.protocol.findData(object, params || {});
        return {
            status: 200,
            data: result
        };
    }

    static async getData(object: string, id: string) {
        if (!this.protocol) {
            throw new Error('ObjectStackServer not initialized. Call ObjectStackServer.init() first.');
        }
        
        this.logger?.(`[MSW] Getting ${object} record:`, id);
        try {
            const result = await this.protocol.getData(object, id);
            return {
                status: 200,
                data: result
            };
        } catch (error) {
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
        
        this.logger?.(`[MSW] Creating ${object} record:`, data);
        try {
            const result = await this.protocol.createData(object, data);
            return {
                status: 201,
                data: result
            };
        } catch (error) {
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
        
        this.logger?.(`[MSW] Updating ${object} record ${id}:`, data);
        try {
            const result = await this.protocol.updateData(object, id, data);
            return {
                status: 200,
                data: result
            };
        } catch (error) {
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
        
        this.logger?.(`[MSW] Deleting ${object} record:`, id);
        try {
            const result = await this.protocol.deleteData(object, id);
            return {
                status: 200,
                data: result
            };
        } catch (error) {
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
 * const runtime = new ObjectStackRuntime({
 *   plugins: [
 *     new MSWPlugin({
 *       enableBrowser: true,
 *       baseUrl: '/api/v1'
 *     })
 *   ]
 * });
 * ```
 */
export class MSWPlugin implements RuntimePlugin {
    name = 'msw';
    private options: MSWPluginOptions;
    private worker: any;
    private handlers: Array<any> = [];

    constructor(options: MSWPluginOptions = {}) {
        this.options = {
            enableBrowser: true,
            baseUrl: '/api/v1',
            logRequests: true,
            ...options
        };
    }

    install(ctx: RuntimeContext) {
        const { engine } = ctx;
        const protocol = new ObjectStackRuntimeProtocol(engine);
        
        // Initialize ObjectStackServer
        ObjectStackServer.init(
            protocol,
            this.options.logRequests ? console.log : undefined
        );

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

        console.log(`[MSWPlugin] Installed ${this.handlers.length} request handlers.`);
    }

    async onStart(ctx: RuntimeContext) {
        if (this.options.enableBrowser && typeof window !== 'undefined') {
            // Browser environment
            this.worker = setupWorker(...this.handlers);
            await this.worker.start({
                onUnhandledRequest: 'bypass',
            });
            console.log(`[MSWPlugin] Started MSW in browser mode.`);
        } else {
            console.log(`[MSWPlugin] Browser mode disabled or not in browser environment.`);
        }
    }

    async onStop() {
        if (this.worker) {
            this.worker.stop();
            console.log(`[MSWPlugin] Stopped MSW worker.`);
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
