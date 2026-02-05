import { Plugin, PluginContext, IHttpServer } from '@objectstack/core';
import { RestServer } from './rest-server.js';
import { ObjectStackProtocol, RestServerConfig } from '@objectstack/spec/api';

export interface ApiRegistryConfig {
    serverServiceName?: string;
    protocolServiceName?: string;
    api?: RestServerConfig;
}

/**
 * ApiRegistryPlugin
 * 
 * Responsibilities:
 * 1. Consumes 'http.server' (or configured service)
 * 2. Consumes 'protocol' (ObjectStackProtocol)
 * 3. Instantiates RestServer to auto-generate routes
 */
export function createApiRegistryPlugin(config: ApiRegistryConfig = {}): Plugin {
    return {
        name: 'com.objectstack.runtime.api-registry',
        version: '1.0.0',
        
        init: async (_ctx: PluginContext) => {
            // No service registration, this is a consumer plugin
        },
        
        start: async (ctx: PluginContext) => {
            const serverService = config.serverServiceName || 'http.server';
            const protocolService = config.protocolServiceName || 'protocol';
            
            const server = ctx.getService<IHttpServer>(serverService);
            const protocol = ctx.getService<ObjectStackProtocol>(protocolService);
            
            if (!server) {
                ctx.logger.warn(`ApiRegistryPlugin: HTTP Server service '${serverService}' not found. REST routes skipped.`);
                return;
            }
            
            if (!protocol) {
                ctx.logger.warn(`ApiRegistryPlugin: Protocol service '${protocolService}' not found. REST routes skipped.`);
                return;
            }
            
            ctx.logger.info('Hydrating REST API from Protocol...');
            
            try {
                const restServer = new RestServer(server, protocol, config.api as any);
                restServer.registerRoutes();
                
                ctx.logger.info('REST API successfully registered');
            } catch (err: any) {
                ctx.logger.error('Failed to register REST API routes', { error: err.message } as any);
                throw err;
            }
        }
    };
}
