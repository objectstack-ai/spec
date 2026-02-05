import { Plugin, PluginContext, IHttpServer, ApiRegistry } from '@objectstack/core';
import { ObjectStackProtocol } from '@objectstack/spec/api';
import { 
    ApiRegistryEntryInput,
    ApiEndpointRegistrationInput,
    RestServerConfig,
} from '@objectstack/spec/api';
import { HonoHttpServer } from './adapter';
import { createHonoApp } from '@objectstack/hono';
import { serveStatic } from '@hono/node-server/serve-static';
import * as fs from 'fs';
import * as path from 'path';

export interface StaticMount {
    root: string;
    path?: string;
    rewrite?: boolean;
    spa?: boolean;
}

export interface HonoPluginOptions {
    port?: number;
    staticRoot?: string;
    /**
     * Multiple static resource mounts
     */
    staticMounts?: StaticMount[];
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

    /**
     * Whether to enable SPA fallback
     * If true, returns index.html for non-API 404s
     * @default false
     */
    spaFallback?: boolean;
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
            spaFallback: false,
            ...options
        };
        // We handle static root manually in start() to support SPA fallback
        this.server = new HonoHttpServer(this.options.port);
    }

    /**
     * Init phase - Setup HTTP server and register as service
     */
    init = async (ctx: PluginContext) => {
        ctx.logger.debug('Initializing Hono server plugin', { 
            port: this.options.port,
            staticRoot: this.options.staticRoot 
        });
        
        // Register HTTP server service as IHttpServer
        // Register as 'http.server' to match core requirements
        ctx.registerService('http.server', this.server);
        // Alias 'http-server' for backward compatibility
        ctx.registerService('http-server', this.server);
        ctx.logger.debug('HTTP server service registered', { serviceName: 'http.server' });
    }

    /**
     * Start phase - Bind routes and start listening
     */
    start = async (ctx: PluginContext) => {
        ctx.logger.debug('Starting Hono server plugin');
        
        // Use Standard ObjectStack Runtime Hono App
        try {
            const kernel = ctx.getKernel();
            const config = this.options.restConfig || {};
            // Calculate prefix similar to before
            const apiVersion = config.api?.version || 'v1';
            const basePath = config.api?.basePath || '/api';
            const apiPath = config.api?.apiPath || `${basePath}/${apiVersion}`;
            
            const app = createHonoApp({ 
                kernel,
                prefix: apiPath // Use the calculated path
            });
            
            ctx.logger.debug('Mounting ObjectStack Runtime App', { prefix: apiPath });
            // Use the mount method we added to HonoHttpServer
            this.server.mount('/', app as any);

        } catch (e: any) {
             ctx.logger.error('Failed to create standard Hono app', e);
        }

        // Configure Static Files & SPA Fallback
        const mounts: StaticMount[] = this.options.staticMounts || [];

        // Auto-discover UI Plugins
        try {
            const rawKernel = ctx.getKernel() as any;
            if (rawKernel.plugins) {
                const loadedPlugins = rawKernel.plugins instanceof Map 
                    ? Array.from(rawKernel.plugins.values()) 
                    : Array.isArray(rawKernel.plugins) ? rawKernel.plugins : Object.values(rawKernel.plugins);

                for (const plugin of (loadedPlugins as any[])) {
                    // Check for UI Plugin signature
                    if (plugin.type === 'ui-plugin' && plugin.staticPath) {
                        // Derive base route from name: @org/console -> console
                        const slug = plugin.slug || plugin.name.split('/').pop();
                        const baseRoute = `/${slug}`;
                        
                        ctx.logger.debug(`Auto-mounting UI Plugin: ${plugin.name}`, { 
                            path: baseRoute, 
                            root: plugin.staticPath 
                        });

                        mounts.push({
                            root: plugin.staticPath,
                            path: baseRoute,
                            rewrite: true, // Strip prefix: /console/assets/x -> /assets/x
                            spa: true
                        });

                        // Handle Default Plugin Redirect
                        if (plugin.default || plugin.isDefault) {
                             const rawApp = this.server.getRawApp();
                             rawApp.get('/', (c) => c.redirect(baseRoute));
                             ctx.logger.debug(`Set default UI redirect: / -> ${baseRoute}`);
                        }
                    }
                }
            }
        } catch (err) {
            ctx.logger.warn('Failed to auto-discover UI plugins', err);
        }

        // Backward compatibility for staticRoot
        if (this.options.staticRoot) {
            mounts.push({
                root: this.options.staticRoot,
                path: '/',
                rewrite: false,
                spa: this.options.spaFallback
            });
        }

        if (mounts.length > 0) {
            const rawApp = this.server.getRawApp();
            
            for (const mount of mounts) {
                const mountRoot = path.resolve(process.cwd(), mount.root);

                if (!fs.existsSync(mountRoot)) {
                    ctx.logger.warn(`Static mount root not found: ${mountRoot}. Skipping.`);
                    continue;
                }

                const mountPath = mount.path || '/';
                const normalizedPath = mountPath.startsWith('/') ? mountPath : `/${mountPath}`;
                const routePattern = normalizedPath === '/' ? '/*' : `${normalizedPath.replace(/\/$/, '')}/*`;
                
                // Routes to register: both /mount and /mount/*
                const routes = normalizedPath === '/' ? [routePattern] : [normalizedPath, routePattern];

                ctx.logger.debug('Mounting static files', { 
                    to: routes, 
                    from: mountRoot, 
                    rewrite: mount.rewrite, 
                    spa: mount.spa 
                });

                routes.forEach(route => {
                    // 1. Serve Static Files
                    rawApp.get(
                        route, 
                        serveStatic({ 
                            root: mount.root,
                            rewriteRequestPath: (reqPath) => {
                                if (mount.rewrite && normalizedPath !== '/') {
                                    // /console/assets/style.css -> /assets/style.css
                                    if (reqPath.startsWith(normalizedPath)) {
                                        return reqPath.substring(normalizedPath.length) || '/';
                                    }
                                }
                                return reqPath;
                            }
                        })
                    );

                    // 2. SPA Fallback (Scoped)
                    if (mount.spa) {
                        rawApp.get(route, async (c, next) => {
                            // Skip if API path check
                            const config = this.options.restConfig || {};
                            const basePath = config.api?.basePath || '/api';
                            
                            if (c.req.path.startsWith(basePath)) {
                                return next();
                            }

                            return serveStatic({ 
                                root: mount.root,
                                rewriteRequestPath: () => 'index.html'
                            })(c, next);
                        });
                    }
                });
            }
        }

        // Start server on kernel:ready hook
        ctx.hook('kernel:ready', async () => {
            const port = this.options.port || 3000;
            ctx.logger.debug('Starting HTTP server', { port });
            
            await this.server.listen(port);
            
            const actualPort = this.server.getPort();
            ctx.logger.info('HTTP server started successfully', { 
                port: actualPort, 
                url: `http://localhost:${actualPort}` 
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
