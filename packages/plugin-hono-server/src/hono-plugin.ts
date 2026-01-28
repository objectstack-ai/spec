import { Plugin, PluginContext } from '@objectstack/core';
import { IHttpServer, IObjectStackProtocol } from '@objectstack/spec/api';
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
        // Register HTTP server service as IHttpServer
        ctx.registerService('http-server', this.server);
        ctx.logger.log('[HonoServerPlugin] HTTP server service registered');
    }

    /**
     * Start phase - Bind routes and start listening
     */
    async start(ctx: PluginContext) {
        // Get protocol implementation instance
        let protocol: IObjectStackProtocol | null = null;
        
        try {
            protocol = ctx.getService<IObjectStackProtocol>('protocol');
        } catch (e) {
            ctx.logger.log('[HonoServerPlugin] Protocol service not found, skipping protocol routes');
        }

        // Register protocol routes if available
        if (protocol) {
            const p = protocol!;
            this.server.get('/api/v1', (req, res) => res.json(p.getDiscovery()));

            // Meta Protocol
            this.server.get('/api/v1/meta', (req, res) => res.json(p.getMetaTypes()));
            this.server.get('/api/v1/meta/:type', (req, res) => res.json(p.getMetaItems(req.params.type)));
            this.server.get('/api/v1/meta/:type/:name', (req, res) => {
                try {
                    res.json(p.getMetaItem(req.params.type, req.params.name));
                } catch(e:any) {
                    res.status(404).json({error: e.message});
                }
            });
            
            // Data Protocol
            this.server.get('/api/v1/data/:object', async (req, res) => {
                try { res.json(await p.findData(req.params.object, req.query)); } 
                catch(e:any) { res.status(400).json({error:e.message}); }
            });
            this.server.get('/api/v1/data/:object/:id', async (req, res) => {
                try { res.json(await p.getData(req.params.object, req.params.id)); }
                catch(e:any) { res.status(404).json({error:e.message}); }
            });
            this.server.post('/api/v1/data/:object', async (req, res) => {
                try { res.status(201).json(await p.createData(req.params.object, req.body)); }
                catch(e:any) { res.status(400).json({error:e.message}); }
            });
            this.server.patch('/api/v1/data/:object/:id', async (req, res) => {
                try { res.json(await p.updateData(req.params.object, req.params.id, req.body)); }
                catch(e:any) { res.status(400).json({error:e.message}); }
            });
            this.server.delete('/api/v1/data/:object/:id', async (req, res) => {
                try { res.json(await p.deleteData(req.params.object, req.params.id)); }
                catch(e:any) { res.status(400).json({error:e.message}); }
            });

            // UI Protocol
            // @ts-ignore
            this.server.get('/api/v1/ui/view/:object', (req, res) => {
                try { 
                    const viewType = (req.query.type) || 'list';
                    const qt = Array.isArray(viewType) ? viewType[0] : viewType;
                    res.json(p.getUiView(req.params.object, qt as any)); 
                }
                catch(e:any) { res.status(404).json({error:e.message}); }
            });
        }

        // Start server on kernel:ready hook
        ctx.hook('kernel:ready', async () => {
            const port = this.options.port || 3000;
            ctx.logger.log('[HonoServerPlugin] Starting server...');
            
            await this.server.listen(port);
            ctx.logger.log(`✅ Server is running on http://localhost:${port}`);
        });
    }

    /**
     * Destroy phase - Stop server
     */
    async destroy() {
        this.server.close();
        console.log('[HonoServerPlugin] Server stopped');
    }
}
