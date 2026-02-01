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
    version = '0.9.0';
    
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
                    const cacheRequest = {
                        ifNoneMatch: req.headers['if-none-match'] as string,
                        ifModifiedSince: req.headers['if-modified-since'] as string,
                    };
                    
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

            // UI Protocol endpoint
            this.server.get('/api/v1/ui/view/:object', async (req, res) => {
                ctx.logger.debug('Get UI view request', { object: req.params.object, type: req.query.type });
                try {
                    const viewType = (req.query.type as 'list' | 'form') || 'list';
                    const view = await p.getUiView({ object: req.params.object, type: viewType });
                    res.json(view);
                } catch (e: any) {
                    ctx.logger.warn('UI view not found', { object: req.params.object, error: e.message });
                    res.status(404).json({ error: e.message });
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
