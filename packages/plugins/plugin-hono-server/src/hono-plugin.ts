import { Plugin, PluginContext, IHttpServer, ApiRegistry } from '@objectstack/core';
import { ObjectStackProtocol } from '@objectstack/spec/api';
import { 
    ApiRegistryEntryInput,
    ApiEndpointRegistrationInput,
    RestServerConfig,
} from '@objectstack/spec/api';
import { HonoHttpServer } from './adapter';

export interface HonoPluginOptions {
    port?: number;
    staticRoot?: string;
    /**
     * REST server configuration
     * Controls automatic endpoint generation and API behavior
     */
    restConfig?: RestServerConfig;
    /**
     * Whether to register standard ObjectStack CRUD endpoints
     * @default true
     */
    registerStandardEndpoints?: boolean;
    /**
     * Whether to load endpoints from API Registry
     * @default true
     */
    useApiRegistry?: boolean;
}

/**
 * Hono Server Plugin
 * 
 * Provides HTTP server capabilities using Hono framework.
 * Registers routes for ObjectStack Runtime Protocol.
 */
export class HonoServerPlugin implements Plugin {
    name = 'com.objectstack.server.hono';
    version = '0.9.0';
    
    // Constants
    private static readonly DEFAULT_ENDPOINT_PRIORITY = 100;
    private static readonly CORE_ENDPOINT_PRIORITY = 950;
    private static readonly DISCOVERY_ENDPOINT_PRIORITY = 900;
    
    private options: HonoPluginOptions;
    private server: HonoHttpServer;

    constructor(options: HonoPluginOptions = {}) {
        this.options = { 
            port: 3000,
            registerStandardEndpoints: true,
            useApiRegistry: true,
            ...options
        };
        this.server = new HonoHttpServer(this.options.port, this.options.staticRoot);
    }

    /**
     * Init phase - Setup HTTP server and register as service
     */
    async init(ctx: PluginContext) {
        ctx.logger.debug('Initializing Hono server plugin', { 
            port: this.options.port,
            staticRoot: this.options.staticRoot 
        });
        
        // Register HTTP server service as IHttpServer
        ctx.registerService('http-server', this.server);
        ctx.logger.info('HTTP server service registered', { serviceName: 'http-server' });
    }

    /**
     * Helper to create cache request object from HTTP headers
     */
    private createCacheRequest(headers: any) {
        return {
            ifNoneMatch: headers['if-none-match'] as string,
            ifModifiedSince: headers['if-modified-since'] as string,
        };
    }

    /**
     * Start phase - Bind routes and start listening
     */
    async start(ctx: PluginContext) {
        ctx.logger.debug('Starting Hono server plugin');
        
        // Get protocol implementation instance
        let protocol: ObjectStackProtocol | null = null;
        
        try {
            protocol = ctx.getService<ObjectStackProtocol>('protocol');
            ctx.logger.debug('Protocol service found');
        } catch (e) {
            ctx.logger.warn('Protocol service not found, skipping protocol routes');
        }

        // Try to get API Registry
        let apiRegistry: ApiRegistry | null = null;
        try {
            apiRegistry = ctx.getService<ApiRegistry>('api-registry');
            ctx.logger.debug('API Registry found, will use for endpoint registration');
        } catch (e) {
            ctx.logger.debug('API Registry not found, using legacy route registration');
        }

        // Register standard ObjectStack endpoints
        if (protocol) {
            if (apiRegistry && this.options.registerStandardEndpoints) {
                this.registerStandardEndpointsToRegistry(apiRegistry, ctx);
            }

            // Bind routes from registry or fallback to legacy
            if (apiRegistry && this.options.useApiRegistry) {
                this.bindRoutesFromRegistry(apiRegistry, protocol, ctx);
            } else {
                this.bindLegacyRoutes(protocol, ctx);
            }
        }

        // Start server on kernel:ready hook
        ctx.hook('kernel:ready', async () => {
            const port = this.options.port || 3000;
            ctx.logger.info('Starting HTTP server', { port });
            
            await this.server.listen(port);
            ctx.logger.info('HTTP server started successfully', { 
                port, 
                url: `http://localhost:${port}` 
            });
        });
    }

    /**
     * Register standard ObjectStack API endpoints to the API Registry
     */
    private registerStandardEndpointsToRegistry(registry: ApiRegistry, ctx: PluginContext) {
        const config = this.options.restConfig || {};
        const apiVersion = config.api?.version || 'v1';
        const basePath = config.api?.basePath || '/api';
        const apiPath = config.api?.apiPath || `${basePath}/${apiVersion}`;

        const endpoints: ApiEndpointRegistrationInput[] = [];

        // Discovery endpoint
        if (config.api?.enableDiscovery !== false) {
            endpoints.push({
                id: 'get_discovery',
                method: 'GET',
                path: apiPath,
                summary: 'API Discovery',
                description: 'Get API version and capabilities',
                responses: [{
                    statusCode: 200,
                    description: 'API discovery information'
                }],
                priority: HonoServerPlugin.DISCOVERY_ENDPOINT_PRIORITY
            });
        }

        // Metadata endpoints
        if (config.api?.enableMetadata !== false) {
            const metaPrefix = config.metadata?.prefix || '/meta';
            
            endpoints.push(
                {
                    id: 'get_meta_types',
                    method: 'GET',
                    path: `${apiPath}${metaPrefix}`,
                    summary: 'Get Metadata Types',
                    description: 'List all available metadata types',
                    responses: [{
                        statusCode: 200,
                        description: 'List of metadata types'
                    }],
                    priority: HonoServerPlugin.DISCOVERY_ENDPOINT_PRIORITY
                },
                {
                    id: 'get_meta_items',
                    method: 'GET',
                    path: `${apiPath}${metaPrefix}/:type`,
                    summary: 'Get Metadata Items',
                    description: 'Get all items of a metadata type',
                    parameters: [{
                        name: 'type',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }],
                    responses: [{
                        statusCode: 200,
                        description: 'List of metadata items'
                    }],
                    priority: HonoServerPlugin.DISCOVERY_ENDPOINT_PRIORITY
                },
                {
                    id: 'get_meta_item_cached',
                    method: 'GET',
                    path: `${apiPath}${metaPrefix}/:type/:name`,
                    summary: 'Get Metadata Item with Cache',
                    description: 'Get a specific metadata item with ETag support',
                    parameters: [
                        {
                            name: 'type',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' }
                        },
                        {
                            name: 'name',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    responses: [
                        {
                            statusCode: 200,
                            description: 'Metadata item',
                            headers: {
                                'ETag': { description: 'Entity tag for caching', schema: { type: 'string' } },
                                'Last-Modified': { description: 'Last modification time', schema: { type: 'string' } },
                                'Cache-Control': { description: 'Cache directives', schema: { type: 'string' } }
                            }
                        },
                        {
                            statusCode: 304,
                            description: 'Not Modified'
                        }
                    ],
                    priority: HonoServerPlugin.DISCOVERY_ENDPOINT_PRIORITY
                }
            );
        }

        // CRUD endpoints
        if (config.api?.enableCrud !== false) {
            const dataPrefix = config.crud?.dataPrefix || '/data';
            
            endpoints.push(
                // List/Query
                {
                    id: 'find_data',
                    method: 'GET',
                    path: `${apiPath}${dataPrefix}/:object`,
                    summary: 'Find Records',
                    description: 'Query records from an object',
                    parameters: [{
                        name: 'object',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }],
                    responses: [{
                        statusCode: 200,
                        description: 'List of records'
                    }],
                    priority: HonoServerPlugin.CORE_ENDPOINT_PRIORITY
                },
                // Get by ID
                {
                    id: 'get_data',
                    method: 'GET',
                    path: `${apiPath}${dataPrefix}/:object/:id`,
                    summary: 'Get Record by ID',
                    description: 'Retrieve a single record by its ID',
                    parameters: [
                        {
                            name: 'object',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' }
                        },
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    responses: [
                        {
                            statusCode: 200,
                            description: 'Record found'
                        },
                        {
                            statusCode: 404,
                            description: 'Record not found'
                        }
                    ],
                    priority: HonoServerPlugin.CORE_ENDPOINT_PRIORITY
                },
                // Create
                {
                    id: 'create_data',
                    method: 'POST',
                    path: `${apiPath}${dataPrefix}/:object`,
                    summary: 'Create Record',
                    description: 'Create a new record',
                    parameters: [{
                        name: 'object',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }],
                    requestBody: {
                        required: true,
                        description: 'Record data'
                    },
                    responses: [{
                        statusCode: 201,
                        description: 'Record created'
                    }],
                    priority: HonoServerPlugin.CORE_ENDPOINT_PRIORITY
                },
                // Update
                {
                    id: 'update_data',
                    method: 'PATCH',
                    path: `${apiPath}${dataPrefix}/:object/:id`,
                    summary: 'Update Record',
                    description: 'Update an existing record',
                    parameters: [
                        {
                            name: 'object',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' }
                        },
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    requestBody: {
                        required: true,
                        description: 'Fields to update'
                    },
                    responses: [{
                        statusCode: 200,
                        description: 'Record updated'
                    }],
                    priority: HonoServerPlugin.CORE_ENDPOINT_PRIORITY
                },
                // Delete
                {
                    id: 'delete_data',
                    method: 'DELETE',
                    path: `${apiPath}${dataPrefix}/:object/:id`,
                    summary: 'Delete Record',
                    description: 'Delete a record by ID',
                    parameters: [
                        {
                            name: 'object',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' }
                        },
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    responses: [{
                        statusCode: 200,
                        description: 'Record deleted'
                    }],
                    priority: HonoServerPlugin.CORE_ENDPOINT_PRIORITY
                }
            );
        }

        // Batch endpoints
        if (config.api?.enableBatch !== false) {
            const dataPrefix = config.crud?.dataPrefix || '/data';
            
            endpoints.push(
                {
                    id: 'batch_data',
                    method: 'POST',
                    path: `${apiPath}${dataPrefix}/:object/batch`,
                    summary: 'Batch Operations',
                    description: 'Perform batch create/update/delete operations',
                    parameters: [{
                        name: 'object',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }],
                    requestBody: {
                        required: true,
                        description: 'Batch operation request'
                    },
                    responses: [{
                        statusCode: 200,
                        description: 'Batch operation completed'
                    }],
                    priority: HonoServerPlugin.DISCOVERY_ENDPOINT_PRIORITY
                },
                {
                    id: 'create_many_data',
                    method: 'POST',
                    path: `${apiPath}${dataPrefix}/:object/createMany`,
                    summary: 'Create Multiple Records',
                    description: 'Create multiple records in one request',
                    parameters: [{
                        name: 'object',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }],
                    requestBody: {
                        required: true,
                        description: 'Array of records to create'
                    },
                    responses: [{
                        statusCode: 201,
                        description: 'Records created'
                    }],
                    priority: HonoServerPlugin.DISCOVERY_ENDPOINT_PRIORITY
                },
                {
                    id: 'update_many_data',
                    method: 'POST',
                    path: `${apiPath}${dataPrefix}/:object/updateMany`,
                    summary: 'Update Multiple Records',
                    description: 'Update multiple records in one request',
                    parameters: [{
                        name: 'object',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }],
                    requestBody: {
                        required: true,
                        description: 'Array of records to update'
                    },
                    responses: [{
                        statusCode: 200,
                        description: 'Records updated'
                    }],
                    priority: HonoServerPlugin.DISCOVERY_ENDPOINT_PRIORITY
                },
                {
                    id: 'delete_many_data',
                    method: 'POST',
                    path: `${apiPath}${dataPrefix}/:object/deleteMany`,
                    summary: 'Delete Multiple Records',
                    description: 'Delete multiple records in one request',
                    parameters: [{
                        name: 'object',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }],
                    requestBody: {
                        required: true,
                        description: 'Array of record IDs to delete'
                    },
                    responses: [{
                        statusCode: 200,
                        description: 'Records deleted'
                    }],
                    priority: HonoServerPlugin.DISCOVERY_ENDPOINT_PRIORITY
                }
            );
        }

        // UI endpoints
        endpoints.push({
            id: 'get_ui_view',
            method: 'GET',
            path: `${apiPath}/ui/view/:object`,
            summary: 'Get UI View',
            description: 'Get UI view definition for an object',
            parameters: [
                {
                    name: 'object',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' }
                },
                {
                    name: 'type',
                    in: 'query',
                    schema: { 
                        type: 'string',
                        enum: ['list', 'form'],
                        default: 'list'
                    }
                }
            ],
            responses: [
                {
                    statusCode: 200,
                    description: 'UI view definition'
                },
                {
                    statusCode: 404,
                    description: 'View not found'
                }
            ],
            priority: HonoServerPlugin.DISCOVERY_ENDPOINT_PRIORITY
        });

        // Register the API in the registry
        const apiEntry: ApiRegistryEntryInput = {
            id: 'objectstack_core_api',
            name: 'ObjectStack Core API',
            type: 'rest',
            version: apiVersion,
            basePath: apiPath,
            description: 'Standard ObjectStack CRUD and metadata API',
            endpoints,
            metadata: {
                owner: 'objectstack',
                status: 'active',
                tags: ['core', 'crud', 'metadata']
            }
        };

        try {
            registry.registerApi(apiEntry);
            ctx.logger.info('Standard ObjectStack endpoints registered to API Registry', {
                endpointCount: endpoints.length
            });
        } catch (error: any) {
            ctx.logger.error('Failed to register standard endpoints', error);
        }
    }

    /**
     * Bind HTTP routes from API Registry
     */
    private bindRoutesFromRegistry(registry: ApiRegistry, protocol: ObjectStackProtocol, ctx: PluginContext) {
        const apiRegistry = registry.getRegistry();
        
        ctx.logger.debug('Binding routes from API Registry', {
            totalApis: apiRegistry.totalApis,
            totalEndpoints: apiRegistry.totalEndpoints
        });

        // Get all endpoints sorted by priority (highest first)
        const allEndpoints: Array<{
            api: string;
            endpoint: any;
        }> = [];

        for (const api of apiRegistry.apis) {
            for (const endpoint of api.endpoints) {
                allEndpoints.push({ api: api.id, endpoint });
            }
        }

        // Sort by priority (highest first)
        allEndpoints.sort((a, b) => 
            (b.endpoint.priority || HonoServerPlugin.DEFAULT_ENDPOINT_PRIORITY) - 
            (a.endpoint.priority || HonoServerPlugin.DEFAULT_ENDPOINT_PRIORITY)
        );

        // Bind routes
        for (const { api: apiId, endpoint } of allEndpoints) {
            this.bindEndpoint(endpoint, protocol, ctx);
        }

        ctx.logger.info('Routes bound from API Registry', {
            totalRoutes: allEndpoints.length
        });
    }

    /**
     * Bind a single endpoint to the HTTP server
     */
    private bindEndpoint(endpoint: any, protocol: ObjectStackProtocol, ctx: PluginContext) {
        const method = endpoint.method || 'GET';
        const path = endpoint.path;
        const id = endpoint.id;

        // Map endpoint ID to protocol method
        const handler = this.createHandlerForEndpoint(id, protocol, ctx);
        
        if (!handler) {
            ctx.logger.warn('No handler found for endpoint', { id, method, path });
            return;
        }

        // Register route based on method
        switch (method.toUpperCase()) {
            case 'GET':
                this.server.get(path, handler);
                break;
            case 'POST':
                this.server.post(path, handler);
                break;
            case 'PATCH':
                this.server.patch(path, handler);
                break;
            case 'PUT':
                this.server.put(path, handler);
                break;
            case 'DELETE':
                this.server.delete(path, handler);
                break;
            default:
                ctx.logger.warn('Unsupported HTTP method', { method, path });
        }

        ctx.logger.debug('Route bound', { method, path, endpoint: id });
    }

    /**
     * Create a route handler for an endpoint
     */
    private createHandlerForEndpoint(endpointId: string, protocol: ObjectStackProtocol, ctx: PluginContext) {
        const p = protocol;

        // Map endpoint IDs to protocol methods
        const handlerMap: Record<string, any> = {
            'get_discovery': async (req: any, res: any) => {
                ctx.logger.debug('API discovery request');
                res.json(await p.getDiscovery({}));
            },
            'get_meta_types': async (req: any, res: any) => {
                ctx.logger.debug('Meta types request');
                res.json(await p.getMetaTypes({}));
            },
            'get_meta_items': async (req: any, res: any) => {
                ctx.logger.debug('Meta items request', { type: req.params.type });
                res.json(await p.getMetaItems({ type: req.params.type }));
            },
            'get_meta_item_cached': async (req: any, res: any) => {
                ctx.logger.debug('Meta item cached request', { 
                    type: req.params.type, 
                    name: req.params.name 
                });
                try {
                    const result = await p.getMetaItemCached({ 
                        type: req.params.type, 
                        name: req.params.name,
                        cacheRequest: this.createCacheRequest(req.headers)
                    });
                    
                    if (result.notModified) {
                        res.status(304).json({});
                    } else {
                        // Set cache headers
                        if (result.etag) {
                            const etagValue = result.etag.weak ? `W/"${result.etag.value}"` : `"${result.etag.value}"`;
                            res.header('ETag', etagValue);
                        }
                        if (result.lastModified) {
                            res.header('Last-Modified', new Date(result.lastModified).toUTCString());
                        }
                        if (result.cacheControl) {
                            const directives = result.cacheControl.directives.join(', ');
                            const maxAge = result.cacheControl.maxAge ? `, max-age=${result.cacheControl.maxAge}` : '';
                            res.header('Cache-Control', directives + maxAge);
                        }
                        res.json(result.data);
                    }
                } catch (e: any) {
                    ctx.logger.warn('Meta item not found', { type: req.params.type, name: req.params.name });
                    res.status(404).json({ error: e.message });
                }
            },
            'find_data': async (req: any, res: any) => {
                ctx.logger.debug('Data find request', { object: req.params.object });
                try {
                    const result = await p.findData({ object: req.params.object, query: req.query as any });
                    ctx.logger.debug('Data find completed', { object: req.params.object, count: result?.records?.length ?? 0 });
                    res.json(result);
                } catch (e: any) {
                    ctx.logger.error('Data find failed', e, { object: req.params.object });
                    res.status(400).json({ error: e.message });
                }
            },
            'get_data': async (req: any, res: any) => {
                ctx.logger.debug('Data get request', { object: req.params.object, id: req.params.id });
                try {
                    const result = await p.getData({ object: req.params.object, id: req.params.id });
                    res.json(result);
                } catch (e: any) {
                    ctx.logger.warn('Data get failed', { object: req.params.object, id: req.params.id });
                    res.status(404).json({ error: e.message });
                }
            },
            'create_data': async (req: any, res: any) => {
                ctx.logger.debug('Data create request', { object: req.params.object });
                try {
                    const result = await p.createData({ object: req.params.object, data: req.body });
                    ctx.logger.info('Data created', { object: req.params.object, id: result?.id });
                    res.status(201).json(result);
                } catch (e: any) {
                    ctx.logger.error('Data create failed', e, { object: req.params.object });
                    res.status(400).json({ error: e.message });
                }
            },
            'update_data': async (req: any, res: any) => {
                ctx.logger.debug('Data update request', { object: req.params.object, id: req.params.id });
                try {
                    const result = await p.updateData({ object: req.params.object, id: req.params.id, data: req.body });
                    ctx.logger.info('Data updated', { object: req.params.object, id: req.params.id });
                    res.json(result);
                } catch (e: any) {
                    ctx.logger.error('Data update failed', e, { object: req.params.object, id: req.params.id });
                    res.status(400).json({ error: e.message });
                }
            },
            'delete_data': async (req: any, res: any) => {
                ctx.logger.debug('Data delete request', { object: req.params.object, id: req.params.id });
                try {
                    const result = await p.deleteData({ object: req.params.object, id: req.params.id });
                    ctx.logger.info('Data deleted', { object: req.params.object, id: req.params.id });
                    res.json(result);
                } catch (e: any) {
                    ctx.logger.error('Data delete failed', e, { object: req.params.object, id: req.params.id });
                    res.status(400).json({ error: e.message });
                }
            },
            'batch_data': async (req: any, res: any) => {
                ctx.logger.info('Batch operation request', { object: req.params.object });
                try {
                    const result = await p.batchData({ object: req.params.object, request: req.body });
                    ctx.logger.info('Batch operation completed', { 
                        object: req.params.object,
                        total: result.total,
                        succeeded: result.succeeded,
                        failed: result.failed
                    });
                    res.json(result);
                } catch (e: any) {
                    ctx.logger.error('Batch operation failed', e, { object: req.params.object });
                    res.status(400).json({ error: e.message });
                }
            },
            'create_many_data': async (req: any, res: any) => {
                ctx.logger.debug('Create many request', { object: req.params.object });
                try {
                    const result = await p.createManyData({ object: req.params.object, records: req.body || [] });
                    ctx.logger.info('Create many completed', { object: req.params.object, count: result.records?.length ?? 0 });
                    res.status(201).json(result);
                } catch (e: any) {
                    ctx.logger.error('Create many failed', e, { object: req.params.object });
                    res.status(400).json({ error: e.message });
                }
            },
            'update_many_data': async (req: any, res: any) => {
                ctx.logger.debug('Update many request', { object: req.params.object });
                try {
                    const result = await p.updateManyData({ 
                        object: req.params.object, 
                        records: req.body?.records, 
                        options: req.body?.options 
                    });
                    ctx.logger.info('Update many completed', { 
                        object: req.params.object,
                        total: result.total,
                        succeeded: result.succeeded,
                        failed: result.failed
                    });
                    res.json(result);
                } catch (e: any) {
                    ctx.logger.error('Update many failed', e, { object: req.params.object });
                    res.status(400).json({ error: e.message });
                }
            },
            'delete_many_data': async (req: any, res: any) => {
                ctx.logger.debug('Delete many request', { object: req.params.object });
                try {
                    const result = await p.deleteManyData({ 
                        object: req.params.object, 
                        ids: req.body?.ids, 
                        options: req.body?.options 
                    });
                    ctx.logger.info('Delete many completed', { 
                        object: req.params.object,
                        total: result.total,
                        succeeded: result.succeeded,
                        failed: result.failed
                    });
                    res.json(result);
                } catch (e: any) {
                    ctx.logger.error('Delete many failed', e, { object: req.params.object });
                    res.status(400).json({ error: e.message });
                }
            },
            'get_ui_view': async (req: any, res: any) => {
                const viewType = (req.query.type as 'list' | 'form') || 'list';
                ctx.logger.debug('UI view request', { object: req.params.object, viewType });
                try {
                    const view = await p.getUiView({ object: req.params.object, type: viewType });
                    res.json(view);
                } catch (e: any) {
                    ctx.logger.warn('UI view not found', { object: req.params.object });
                    res.status(404).json({ error: e.message });
                }
            }
        };

        return handlerMap[endpointId];
    }

    /**
     * Legacy route registration (fallback when API Registry is not available)
     */
    private bindLegacyRoutes(protocol: ObjectStackProtocol, ctx: PluginContext) {
        const p = protocol;
        
        ctx.logger.debug('Using legacy route registration');
            
        ctx.logger.debug('Registering API routes');
            
        this.server.get('/api/v1', async (req, res) => {
            ctx.logger.debug('API discovery request');
            res.json(await p.getDiscovery({}));
        });

        // Meta Protocol
        this.server.get('/api/v1/meta', async (req, res) => {
            ctx.logger.debug('Meta types request');
            res.json(await p.getMetaTypes({}));
        });
        this.server.get('/api/v1/meta/:type', async (req, res) => {
            ctx.logger.debug('Meta items request', { type: req.params.type });
            res.json(await p.getMetaItems({ type: req.params.type }));
        });
        
        // Data Protocol
        this.server.get('/api/v1/data/:object', async (req, res) => {
            ctx.logger.debug('Data find request', { object: req.params.object, query: req.query });
            try { 
                const result = await p.findData({ object: req.params.object, query: req.query as any });
                ctx.logger.debug('Data find completed', { object: req.params.object, count: result?.records?.length ?? 0 });
                res.json(result);
            } 
            catch(e:any) { 
                ctx.logger.error('Data find failed', e, { object: req.params.object });
                res.status(400).json({error:e.message}); 
            }
        });
        this.server.get('/api/v1/data/:object/:id', async (req, res) => {
            ctx.logger.debug('Data get request', { object: req.params.object, id: req.params.id });
            try { 
                const result = await p.getData({ object: req.params.object, id: req.params.id });
                ctx.logger.debug('Data get completed', { object: req.params.object, id: req.params.id });
                res.json(result);
            }
            catch(e:any) { 
                ctx.logger.warn('Data get failed - not found', { object: req.params.object, id: req.params.id });
                res.status(404).json({error:e.message}); 
            }
        });
        this.server.post('/api/v1/data/:object', async (req, res) => {
            ctx.logger.debug('Data create request', { object: req.params.object });
            try { 
                const result = await p.createData({ object: req.params.object, data: req.body });
                ctx.logger.info('Data created', { object: req.params.object, id: result?.id });
                res.status(201).json(result);
            }
            catch(e:any) { 
                ctx.logger.error('Data create failed', e, { object: req.params.object });
                res.status(400).json({error:e.message}); 
            }
        });
        this.server.patch('/api/v1/data/:object/:id', async (req, res) => {
            ctx.logger.debug('Data update request', { object: req.params.object, id: req.params.id });
            try { 
                const result = await p.updateData({ object: req.params.object, id: req.params.id, data: req.body });
                ctx.logger.info('Data updated', { object: req.params.object, id: req.params.id });
                res.json(result);
            }
            catch(e:any) { 
                ctx.logger.error('Data update failed', e, { object: req.params.object, id: req.params.id });
                res.status(400).json({error:e.message}); 
            }
        });
        this.server.delete('/api/v1/data/:object/:id', async (req, res) => {
            ctx.logger.debug('Data delete request', { object: req.params.object, id: req.params.id });
            try { 
                const result = await p.deleteData({ object: req.params.object, id: req.params.id });
                ctx.logger.info('Data deleted', { object: req.params.object, id: req.params.id, success: result?.success });
                res.json(result);
            }
            catch(e:any) { 
                ctx.logger.error('Data delete failed', e, { object: req.params.object, id: req.params.id });
                res.status(400).json({error:e.message}); 
            }
        });

        // UI Protocol
        this.server.get('/api/v1/ui/view/:object', async (req, res) => {
            const viewType = (req.query.type) || 'list';
            const qt = Array.isArray(viewType) ? viewType[0] : viewType;
            ctx.logger.debug('UI view request', { object: req.params.object, viewType: qt });
            try { 
                res.json(await p.getUiView({ object: req.params.object, type: qt as any })); 
            }
            catch(e:any) { 
                ctx.logger.warn('UI view not found', { object: req.params.object, viewType: qt });
                res.status(404).json({error:e.message}); 
            }
        });

        // Batch Operations
        this.server.post('/api/v1/data/:object/batch', async (req, res) => {
            ctx.logger.info('Batch operation request', { 
                object: req.params.object, 
                operation: req.body?.operation,
                hasBody: !!req.body,
                bodyType: typeof req.body,
                bodyKeys: req.body ? Object.keys(req.body) : []
            });
            try {
                const result = await p.batchData({ object: req.params.object, request: req.body });
                ctx.logger.info('Batch operation completed', { 
                    object: req.params.object, 
                    operation: req.body?.operation,
                    total: result.total,
                    succeeded: result.succeeded,
                    failed: result.failed
                });
                res.json(result);
            } catch (e: any) {
                ctx.logger.error('Batch operation failed', e, { object: req.params.object });
                res.status(400).json({ error: e.message });
            }
        });

        this.server.post('/api/v1/data/:object/createMany', async (req, res) => {
            ctx.logger.debug('Create many request', { object: req.params.object, count: req.body?.length });
            try {
                const result = await p.createManyData({ object: req.params.object, records: req.body || [] });
                ctx.logger.info('Create many completed', { object: req.params.object, count: result.records?.length ?? 0 });
                res.status(201).json(result);
            } catch (e: any) {
                ctx.logger.error('Create many failed', e, { object: req.params.object });
                res.status(400).json({ error: e.message });
            }
        });

        this.server.post('/api/v1/data/:object/updateMany', async (req, res) => {
            ctx.logger.debug('Update many request', { object: req.params.object, count: req.body?.records?.length });
            try {
                const result = await p.updateManyData({ object: req.params.object, records: req.body?.records, options: req.body?.options });
                ctx.logger.info('Update many completed', { 
                    object: req.params.object,
                    total: result.total,
                    succeeded: result.succeeded,
                    failed: result.failed
                });
                res.json(result);
            } catch (e: any) {
                ctx.logger.error('Update many failed', e, { object: req.params.object });
                res.status(400).json({ error: e.message });
            }
        });

        this.server.post('/api/v1/data/:object/deleteMany', async (req, res) => {
            ctx.logger.debug('Delete many request', { object: req.params.object, count: req.body?.ids?.length });
            try {
                const result = await p.deleteManyData({ object: req.params.object, ids: req.body?.ids, options: req.body?.options });
                ctx.logger.info('Delete many completed', { 
                    object: req.params.object,
                    total: result.total,
                    succeeded: result.succeeded,
                    failed: result.failed
                });
                res.json(result);
            } catch (e: any) {
                ctx.logger.error('Delete many failed', e, { object: req.params.object });
                res.status(400).json({ error: e.message });
            }
        });

        // Enhanced Metadata Route with ETag Support
        this.server.get('/api/v1/meta/:type/:name', async (req, res) => {
            ctx.logger.debug('Meta item request with cache support', { 
                type: req.params.type, 
                name: req.params.name,
                ifNoneMatch: req.headers['if-none-match']
            });
            try {
                const cacheRequest = this.createCacheRequest(req.headers);
                
                const result = await p.getMetaItemCached({ 
                    type: req.params.type, 
                    name: req.params.name, 
                    cacheRequest 
                });
                
                if (result.notModified) {
                    ctx.logger.debug('Meta item not modified (304)', { type: req.params.type, name: req.params.name });
                    res.status(304).json({});
                } else {
                    // Set cache headers
                    if (result.etag) {
                        const etagValue = result.etag.weak ? `W/"${result.etag.value}"` : `"${result.etag.value}"`;
                        res.header('ETag', etagValue);
                    }
                    if (result.lastModified) {
                        res.header('Last-Modified', new Date(result.lastModified).toUTCString());
                    }
                    if (result.cacheControl) {
                        const directives = result.cacheControl.directives.join(', ');
                        const maxAge = result.cacheControl.maxAge ? `, max-age=${result.cacheControl.maxAge}` : '';
                        res.header('Cache-Control', directives + maxAge);
                    }
                    
                    ctx.logger.debug('Meta item returned with cache headers', { 
                        type: req.params.type, 
                        name: req.params.name,
                        etag: result.etag?.value
                    });
                    res.json(result.data);
                }
            } catch (e: any) {
                ctx.logger.warn('Meta item not found', { type: req.params.type, name: req.params.name });
                res.status(404).json({ error: e.message });
            }
        });
        
        ctx.logger.info('All legacy API routes registered');
    }

    /**
     * Destroy phase - Stop server
     */
    async destroy() {
        this.server.close();
        // Note: Can't use ctx.logger here since we're in destroy
        console.log('[HonoServerPlugin] Server stopped');
    }
}
