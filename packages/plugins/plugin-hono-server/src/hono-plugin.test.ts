import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HonoServerPlugin } from './hono-plugin';
import { PluginContext, ApiRegistry } from '@objectstack/core';

describe('HonoServerPlugin', () => {
    let context: any;
    let logger: any;
    let protocol: any;
    let apiRegistry: any;

    beforeEach(() => {
        logger = {
            info: vi.fn(),
            debug: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        };
        
        protocol = {
            getDiscovery: vi.fn().mockResolvedValue({ version: 'v1', apiName: 'ObjectStack' }),
            getMetaTypes: vi.fn().mockResolvedValue({ types: ['object', 'plugin'] }),
            getMetaItems: vi.fn().mockResolvedValue({ type: 'object', items: [] }),
            findData: vi.fn().mockResolvedValue({ object: 'test', records: [] }),
            getData: vi.fn().mockResolvedValue({ object: 'test', id: '1', record: {} }),
            createData: vi.fn().mockResolvedValue({ object: 'test', id: '1', record: {} }),
            updateData: vi.fn().mockResolvedValue({ object: 'test', id: '1', record: {} }),
            deleteData: vi.fn().mockResolvedValue({ object: 'test', id: '1', success: true }),
            batchData: vi.fn().mockResolvedValue({ total: 0, succeeded: 0, failed: 0 }),
            createManyData: vi.fn().mockResolvedValue({ object: 'test', records: [], count: 0 }),
            updateManyData: vi.fn().mockResolvedValue({ total: 0, succeeded: 0, failed: 0 }),
            deleteManyData: vi.fn().mockResolvedValue({ total: 0, succeeded: 0, failed: 0 }),
            getMetaItemCached: vi.fn().mockResolvedValue({ data: {}, notModified: false }),
            getUiView: vi.fn().mockResolvedValue({ object: 'test', type: 'list' })
        };

        apiRegistry = {
            registerApi: vi.fn(),
            getRegistry: vi.fn().mockReturnValue({
                version: '1.0.0',
                conflictResolution: 'error',
                apis: [],
                totalApis: 0,
                totalEndpoints: 0
            })
        };

        context = {
            logger,
            getService: vi.fn((service) => {
                if (service === 'protocol') return protocol;
                if (service === 'api-registry') throw new Error('Not found');
                return null;
            }),
            registerService: vi.fn(),
            hook: vi.fn()
        };
    });

    it('should initialize and register server', async () => {
        const plugin = new HonoServerPlugin();
        await plugin.init(context as PluginContext);
        
        expect(context.registerService).toHaveBeenCalledWith('http-server', expect.anything());
    });

    it('should register hook on start', async () => {
        const plugin = new HonoServerPlugin();
        await plugin.init(context as PluginContext);
        await plugin.start(context as PluginContext);
        
        // Should wait for kernel:ready to start server
        expect(context.hook).toHaveBeenCalledWith('kernel:ready', expect.any(Function));
    });

    it('should register CRUD routes in legacy mode when API Registry not available', async () => {
        const plugin = new HonoServerPlugin();
        await plugin.init(context as PluginContext);
        await plugin.start(context as PluginContext);
        
        expect(context.getService).toHaveBeenCalledWith('protocol');
        expect(context.getService).toHaveBeenCalledWith('api-registry');
        expect(logger.debug).toHaveBeenCalledWith('API Registry not found, using legacy route registration');
    });

    it('should use API Registry when available', async () => {
        context.getService = vi.fn((service) => {
            if (service === 'protocol') return protocol;
            if (service === 'api-registry') return apiRegistry;
            return null;
        });

        const plugin = new HonoServerPlugin();
        await plugin.init(context as PluginContext);
        await plugin.start(context as PluginContext);
        
        expect(context.getService).toHaveBeenCalledWith('api-registry');
        expect(apiRegistry.registerApi).toHaveBeenCalled();
    });

    it('should register standard endpoints to API Registry', async () => {
        context.getService = vi.fn((service) => {
            if (service === 'protocol') return protocol;
            if (service === 'api-registry') return apiRegistry;
            return null;
        });

        const plugin = new HonoServerPlugin();
        await plugin.init(context as PluginContext);
        await plugin.start(context as PluginContext);
        
        expect(apiRegistry.registerApi).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'objectstack_core_api',
                name: 'ObjectStack Core API',
                type: 'rest',
                version: 'v1'
            })
        );
    });

    it('should skip standard endpoint registration when disabled', async () => {
        context.getService = vi.fn((service) => {
            if (service === 'protocol') return protocol;
            if (service === 'api-registry') return apiRegistry;
            return null;
        });

        const plugin = new HonoServerPlugin({ registerStandardEndpoints: false });
        await plugin.init(context as PluginContext);
        await plugin.start(context as PluginContext);
        
        expect(apiRegistry.registerApi).not.toHaveBeenCalled();
    });

    it('should use legacy routes when useApiRegistry is disabled', async () => {
        context.getService = vi.fn((service) => {
            if (service === 'protocol') return protocol;
            if (service === 'api-registry') return apiRegistry;
            return null;
        });

        const plugin = new HonoServerPlugin({ useApiRegistry: false });
        await plugin.init(context as PluginContext);
        await plugin.start(context as PluginContext);
        
        expect(apiRegistry.getRegistry).not.toHaveBeenCalled();
        expect(logger.debug).toHaveBeenCalledWith('Using legacy route registration');
    });

    it('should respect REST server configuration', async () => {
        context.getService = vi.fn((service) => {
            if (service === 'protocol') return protocol;
            if (service === 'api-registry') return apiRegistry;
            return null;
        });

        const plugin = new HonoServerPlugin({
            restConfig: {
                api: {
                    version: 'v2',
                    basePath: '/custom',
                    enableCrud: true,
                    enableMetadata: true,
                    enableBatch: true
                }
            }
        });
        
        await plugin.init(context as PluginContext);
        await plugin.start(context as PluginContext);
        
        expect(apiRegistry.registerApi).toHaveBeenCalledWith(
            expect.objectContaining({
                version: 'v2'
            })
        );
    });

    it('should handle protocol service not found gracefully', async () => {
        context.getService = vi.fn(() => {
            throw new Error('Service not found');
        });

        const plugin = new HonoServerPlugin();
        await plugin.init(context as PluginContext);
        await plugin.start(context as PluginContext);
        
        expect(logger.warn).toHaveBeenCalledWith('Protocol service not found, skipping protocol routes');
    });
});
