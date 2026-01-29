import { Plugin, PluginContext, IHttpServer } from '@objectstack/core';
import { IObjectStackProtocol } from '@objectstack/spec/api';
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
        let protocol: IObjectStackProtocol | null = null;
        
        try {
            protocol = ctx.getService<IObjectStackProtocol>('protocol');
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
            this.server.get('/api/v1/meta/:type/:name', (req, res) => {
                ctx.logger.debug('Meta item request', { type: req.params.type, name: req.params.name });
                try {
                    res.json(p.getMetaItem(req.params.type, req.params.name));
                } catch(e:any) {
                    ctx.logger.warn('Meta item not found', { type: req.params.type, name: req.params.name });
                    res.status(404).json({error: e.message});
                }
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
