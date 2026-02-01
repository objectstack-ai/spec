import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HonoServerPlugin } from './hono-plugin';
import { PluginContext } from '@objectstack/core';

describe('HonoServerPlugin', () => {
    let context: any;
    let logger: any;
    let protocol: any;

    beforeEach(() => {
        logger = {
            info: vi.fn(),
            debug: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        };
        
        protocol = {
            findData: vi.fn(),
            createData: vi.fn()
        };

        context = {
            logger,
            getService: vi.fn((service) => {
                if (service === 'protocol') return protocol;
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

    it('should register CRUD routes', async () => {
        const plugin = new HonoServerPlugin();
        await plugin.init(context as PluginContext);
        await plugin.start(context as PluginContext);
        
        expect(context.getService).toHaveBeenCalledWith('protocol');
    });
});
