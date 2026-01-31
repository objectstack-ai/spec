import { Plugin, PluginContext, IHttpServer } from '@objectstack/core';
import { ObjectStackProtocol } from '@objectstack/spec/api';
import { HonoHttpServer } from './adapter';

export interface HonoPluginOptions {
    port?: number;
    staticRoot?: string;
}

/**
 * Hono Server Plugin
 * 
 * Provides HTTP server capabilities using Hono framework.
 * Registers routes for ObjectStack Runtime Protocol.
 */
export class HonoServerPlugin implements Plugin {
    name = 'com.objectstack.server.hono';
    version = '1.0.0';
    
    private options: HonoPluginOptions;
    private server: HonoHttpServer;

    constructor(options: HonoPluginOptions = {}) {
        this.options = { 
            port: 3000,
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
     * Start phase - Bind routes and start listening
     */
    async start(ctx: PluginContext) {
        ctx.logger.debug('Starting Hono server plugin');
        
        // Get protocol implementation instance
        let protocol: ObjectStackProtocol | null = null;
        
        try {
            protocol = ctx.getService<ObjectStackProtocol>('protocol');
            ctx.logger.debug('Protocol service found, registering protocol routes');
        } catch (e) {
            ctx.logger.warn('Protocol service not found, skipping protocol routes');
        }

        // Register protocol routes if available
        if (protocol) {
            const p = protocol!;
            
            ctx.logger.debug('Registering API routes');
            
            this.server.get('/api/v1', (req, res) => {
                ctx.logger.debug('API discovery request');
                res.json(p.getDiscovery());
            });

            // Meta Protocol
            this.server.get('/api/v1/meta', (req, res) => {
                ctx.logger.debug('Meta types request');
                res.json(p.getMetaTypes());
            });
            this.server.get('/api/v1/meta/:type', (req, res) => {
                ctx.logger.debug('Meta items request', { type: req.params.type });
                res.json(p.getMetaItems(req.params.type));
            });
            
            // Data Protocol
            this.server.get('/api/v1/data/:object', async (req, res) => {
                ctx.logger.debug('Data find request', { object: req.params.object, query: req.query });
                try { 
                    const result = await p.findData(req.params.object, req.query);
                    ctx.logger.debug('Data find completed', { object: req.params.object, count: result?.length ?? 0 });
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
                    const result = await p.getData(req.params.object, req.params.id);
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
                    const result = await p.createData(req.params.object, req.body);
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
                    const result = await p.updateData(req.params.object, req.params.id, req.body);
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
                    const result = await p.deleteData(req.params.object, req.params.id);
                    ctx.logger.info('Data deleted', { object: req.params.object, id: req.params.id, success: result });
                    res.json(result);
                }
                catch(e:any) { 
                    ctx.logger.error('Data delete failed', e, { object: req.params.object, id: req.params.id });
                    res.status(400).json({error:e.message}); 
                }
            });

            // UI Protocol
            // @ts-ignore
            this.server.get('/api/v1/ui/view/:object', (req, res) => {
                const viewType = (req.query.type) || 'list';
                const qt = Array.isArray(viewType) ? viewType[0] : viewType;
                ctx.logger.debug('UI view request', { object: req.params.object, viewType: qt });
                try { 
                    res.json(p.getUiView(req.params.object, qt as any)); 
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
                    const result = await p.batchData(req.params.object, req.body);
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
                    const result = await p.createManyData(req.params.object, req.body || []);
                    ctx.logger.info('Create many completed', { object: req.params.object, count: result.length });
                    res.status(201).json(result);
                } catch (e: any) {
                    ctx.logger.error('Create many failed', e, { object: req.params.object });
                    res.status(400).json({ error: e.message });
                }
            });

            this.server.post('/api/v1/data/:object/updateMany', async (req, res) => {
                ctx.logger.debug('Update many request', { object: req.params.object, count: req.body?.records?.length });
                try {
                    const result = await p.updateManyData(req.params.object, req.body);
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
                    const result = await p.deleteManyData(req.params.object, req.body);
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
                    const cacheRequest = {
                        ifNoneMatch: req.headers['if-none-match'] as string,
                        ifModifiedSince: req.headers['if-modified-since'] as string,
                    };
                    
                    const result = await p.getMetaItemCached(req.params.type, req.params.name, cacheRequest);
                    
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

            // View Storage Routes
            this.server.post('/api/v1/ui/views', async (req, res) => {
                ctx.logger.debug('Create view request', { name: req.body?.name, object: req.body?.object });
                try {
                    const result = await p.createView(req.body);
                    if (result.success) {
                        ctx.logger.info('View created', { id: result.data?.id, name: result.data?.name });
                        res.status(201).json(result);
                    } else {
                        ctx.logger.warn('View creation failed', { error: result.error });
                        res.status(400).json(result);
                    }
                } catch (e: any) {
                    ctx.logger.error('View creation error', e);
                    res.status(500).json({ success: false, error: { code: 'internal_error', message: e.message } });
                }
            });

            this.server.get('/api/v1/ui/views/:id', async (req, res) => {
                ctx.logger.debug('Get view request', { id: req.params.id });
                try {
                    const result = await p.getView(req.params.id);
                    if (result.success) {
                        ctx.logger.debug('View retrieved', { id: req.params.id });
                        res.json(result);
                    } else {
                        ctx.logger.warn('View not found', { id: req.params.id });
                        res.status(404).json(result);
                    }
                } catch (e: any) {
                    ctx.logger.error('Get view error', e, { id: req.params.id });
                    res.status(500).json({ success: false, error: { code: 'internal_error', message: e.message } });
                }
            });

            this.server.get('/api/v1/ui/views', async (req, res) => {
                ctx.logger.debug('List views request', { query: req.query });
                try {
                    const request: any = {};
                    if (req.query.object) request.object = req.query.object as string;
                    if (req.query.type) request.type = req.query.type;
                    if (req.query.visibility) request.visibility = req.query.visibility;
                    if (req.query.createdBy) request.createdBy = req.query.createdBy as string;
                    if (req.query.isDefault !== undefined) request.isDefault = req.query.isDefault === 'true';
                    if (req.query.limit) request.limit = parseInt(req.query.limit as string);
                    if (req.query.offset) request.offset = parseInt(req.query.offset as string);
                    
                    const result = await p.listViews(request);
                    ctx.logger.debug('Views listed', { count: result.data?.length, total: result.pagination?.total });
                    res.json(result);
                } catch (e: any) {
                    ctx.logger.error('List views error', e);
                    res.status(500).json({ success: false, error: { code: 'internal_error', message: e.message } });
                }
            });

            this.server.patch('/api/v1/ui/views/:id', async (req, res) => {
                ctx.logger.debug('Update view request', { id: req.params.id });
                try {
                    const result = await p.updateView({ ...req.body, id: req.params.id });
                    if (result.success) {
                        ctx.logger.info('View updated', { id: req.params.id });
                        res.json(result);
                    } else {
                        ctx.logger.warn('View update failed', { id: req.params.id, error: result.error });
                        res.status(result.error?.code === 'resource_not_found' ? 404 : 400).json(result);
                    }
                } catch (e: any) {
                    ctx.logger.error('Update view error', e, { id: req.params.id });
                    res.status(500).json({ success: false, error: { code: 'internal_error', message: e.message } });
                }
            });

            this.server.delete('/api/v1/ui/views/:id', async (req, res) => {
                ctx.logger.debug('Delete view request', { id: req.params.id });
                try {
                    const result = await p.deleteView(req.params.id);
                    if (result.success) {
                        ctx.logger.info('View deleted', { id: req.params.id });
                        res.json(result);
                    } else {
                        ctx.logger.warn('View deletion failed', { id: req.params.id });
                        res.status(404).json(result);
                    }
                } catch (e: any) {
                    ctx.logger.error('Delete view error', e, { id: req.params.id });
                    res.status(500).json({ success: false, error: { code: 'internal_error', message: e.message } });
                }
            });
            
            ctx.logger.info('All API routes registered');
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
     * Destroy phase - Stop server
     */
    async destroy() {
        this.server.close();
        // Note: Can't use ctx.logger here since we're in destroy
        console.log('[HonoServerPlugin] Server stopped');
    }
}
