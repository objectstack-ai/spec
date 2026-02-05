import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HonoServerPlugin } from './hono-plugin';
import { PluginContext } from '@objectstack/core';
import { createHonoApp } from '@objectstack/hono';
import { HonoHttpServer } from './adapter';

// Mock dependencies
vi.mock('@objectstack/hono', () => ({
    createHonoApp: vi.fn(),
}));

vi.mock('@hono/node-server/serve-static', () => ({
    serveStatic: vi.fn(() => (c: any, next: any) => next())
}));

vi.mock('./adapter', () => ({
    HonoHttpServer: vi.fn(function() {
        return {
            mount: vi.fn(),
            start: vi.fn(),
            stop: vi.fn(),
            getApp: vi.fn(),
            listen: vi.fn(),
            getPort: vi.fn().mockReturnValue(3000),
            close: vi.fn(),
            getRawApp: vi.fn().mockReturnValue({
                get: vi.fn(),
            })
        };
    })
}));

describe('HonoServerPlugin', () => {
    let context: any;
    let logger: any;
    let kernel: any;

    beforeEach(() => {
        vi.clearAllMocks();

        logger = {
            info: vi.fn(),
            debug: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        };

        kernel = {
            getService: vi.fn(),
        };

        context = {
            logger,
            getKernel: vi.fn().mockReturnValue(kernel),
            registerService: vi.fn(),
            hook: vi.fn(),
            getService: vi.fn()
        };

        (createHonoApp as any).mockReturnValue({
            // Mock Hono App structure if needed
        });
    });

    it('should initialize and register server', async () => {
        const plugin = new HonoServerPlugin();
        await plugin.init(context as PluginContext);
        
        expect(context.registerService).toHaveBeenCalledWith('http-server', expect.any(Object));
        expect(HonoHttpServer).toHaveBeenCalled();
    });

    it('should create and mount Hono app on start', async () => {
        const plugin = new HonoServerPlugin();
        await plugin.init(context as PluginContext);
        await plugin.start(context as PluginContext);
        
        expect(createHonoApp).toHaveBeenCalledWith(expect.objectContaining({
            kernel: kernel,
            prefix: '/api/v1'
        }));
        
        // Access the mocked server instance
        const serverInstance = (HonoHttpServer as any).mock.instances[0];
        expect(serverInstance.mount).toHaveBeenCalledWith('/', expect.anything());
    });

    it('should respect REST server configuration for prefix', async () => {
        const plugin = new HonoServerPlugin({
            restConfig: {
                api: {
                    version: 'v2',
                    basePath: '/custom'
                }
            }
        });
        
        await plugin.init(context as PluginContext);
        await plugin.start(context as PluginContext);
        
        expect(createHonoApp).toHaveBeenCalledWith(expect.objectContaining({
            prefix: '/custom/v2'
        }));
    });

    it('should handle errors during app creation', async () => {
        (createHonoApp as any).mockImplementation(() => {
            throw new Error('Creation failed');
        });

        const plugin = new HonoServerPlugin();
        await plugin.init(context as PluginContext);
        await plugin.start(context as PluginContext);
        
        expect(logger.error).toHaveBeenCalledWith('Failed to create standard Hono app', expect.any(Error));
    });

    it('should configure static files and SPA fallback when enabled', async () => {
        const plugin = new HonoServerPlugin({
            staticRoot: './public',
            spaFallback: true
        });

        await plugin.init(context as PluginContext);
        await plugin.start(context as PluginContext);

        const serverInstance = (HonoHttpServer as any).mock.instances[0];
        const rawApp = serverInstance.getRawApp();
        
        expect(serverInstance.getRawApp).toHaveBeenCalled();
        // Should register static files middleware
        expect(rawApp.get).toHaveBeenCalledWith('/*', expect.anything());
        // Should register SPA fallback middleware
        expect(rawApp.get).toHaveBeenCalledWith('*', expect.anything());
    });
});
