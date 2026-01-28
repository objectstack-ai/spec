/**
 * UI Engine Plugin Example
 * 
 * Demonstrates dynamic route mounting:
 * - Depends on HTTP server plugin
 * - Dynamically registers routes for UI rendering
 * - Can serve static assets and SPA routes
 */

import { Plugin, PluginContext } from '@objectstack/runtime';

export class UiEnginePlugin implements Plugin {
    name = 'com.objectstack.engine.ui';
    version = '1.0.0';
    dependencies = ['com.objectstack.server.hono']; // Depends on HTTP server

    async init(ctx: PluginContext) {
        // Register UI Engine service
        const uiEngine = {
            renderPage: (route: string, data: any) => {
                return `
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <title>ObjectStack UI - ${route}</title>
                            <style>
                                body { font-family: Arial, sans-serif; padding: 20px; }
                                .header { background: #1976d2; color: white; padding: 20px; margin: -20px -20px 20px; }
                                .content { max-width: 1200px; margin: 0 auto; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>ObjectStack Application</h1>
                                <p>Current Route: ${route}</p>
                            </div>
                            <div class="content">
                                <div id="root">
                                    <h2>UI Engine Loaded</h2>
                                    <p>This page is dynamically rendered by the UI Engine plugin</p>
                                    <pre>${JSON.stringify(data, null, 2)}</pre>
                                </div>
                            </div>
                        </body>
                    </html>
                `;
            }
        };
        
        ctx.registerService('ui-engine', uiEngine);
        ctx.logger.log('[UI] UI Engine service registered');
    }

    async start(ctx: PluginContext) {
        // Get HTTP server service
        const app = ctx.getService<any>('http-server');
        const uiEngine = ctx.getService<any>('ui-engine');
        
        // Register UI routes
        
        // 1. Main app route
        app.get('/app', (c: any) => {
            const html = uiEngine.renderPage('/app', { message: 'Welcome to ObjectStack' });
            return c.html(html);
        });
        
        // 2. Dynamic app routes (SPA-style)
        app.get('/app/*', (c: any) => {
            const path = c.req.path;
            const html = uiEngine.renderPage(path, { 
                route: path,
                timestamp: new Date().toISOString()
            });
            return c.html(html);
        });
        
        // 3. List view route (example)
        app.get('/ui/list/:object', (c: any) => {
            const objectName = c.req.param('object');
            const html = uiEngine.renderPage(`/ui/list/${objectName}`, {
                object: objectName,
                view: 'list'
            });
            return c.html(html);
        });
        
        // 4. Form view route (example)
        app.get('/ui/form/:object/:id?', (c: any) => {
            const objectName = c.req.param('object');
            const id = c.req.param('id');
            const html = uiEngine.renderPage(`/ui/form/${objectName}/${id || 'new'}`, {
                object: objectName,
                id: id || null,
                view: 'form'
            });
            return c.html(html);
        });

        ctx.logger.log('[UI] ✅ UI Engine routes mounted:');
        ctx.logger.log('[UI]   - /app/* (Main application)');
        ctx.logger.log('[UI]   - /ui/list/:object (List views)');
        ctx.logger.log('[UI]   - /ui/form/:object/:id? (Form views)');
    }

    async destroy() {
        console.log('[UI] UI Engine stopped');
    }
}
