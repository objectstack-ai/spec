import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppPlugin } from './app-plugin';
import { PluginContext } from '@objectstack/core';

describe('AppPlugin', () => {
    let mockContext: PluginContext;

    beforeEach(() => {
        mockContext = {
            logger: { 
                info: vi.fn(), 
                error: vi.fn(),
                warn: vi.fn(),
                debug: vi.fn()
            },
            registerService: vi.fn(),
            getService: vi.fn(),
            getServices: vi.fn()
        } as unknown as PluginContext;
    });

    it('should initialize with manifest info', () => {
        const bundle = {
            id: 'com.test.app',
            name: 'Test App',
            version: '1.0.0'
        };
        const plugin = new AppPlugin(bundle);
        expect(plugin.name).toBe('plugin.app.com.test.app');
        expect(plugin.version).toBe('1.0.0');
    });

    it('should handle nested stack definition manifest', () => {
        const bundle = {
            manifest: {
                id: 'com.test.stack',
                version: '2.0.0'
            },
            objects: []
        };
        const plugin = new AppPlugin(bundle);
        expect(plugin.name).toBe('plugin.app.com.test.stack');
        expect(plugin.version).toBe('2.0.0');
    });

    it('registerService should register raw manifest in init phase', async () => {
        const bundle = {
            id: 'com.test.simple',
            objects: []
        };
        const plugin = new AppPlugin(bundle);
        
        await plugin.init(mockContext);
        
        expect(mockContext.registerService).toHaveBeenCalledWith('app.com.test.simple', bundle);
    });

    it('start should do nothing if no runtime hooks', async () => {
        const bundle = { id: 'com.test.static' };
        const plugin = new AppPlugin(bundle);
        
        vi.mocked(mockContext.getService).mockReturnValue({}); // Mock ObjectQL exists
        
        await plugin.start!(mockContext);
        // Only logs, no errors
        expect(mockContext.logger.debug).toHaveBeenCalled();
    });

    it('start should invoke onEnable if present', async () => {
        const onEnableSpy = vi.fn();
        const bundle = { 
            id: 'com.test.code',
            onEnable: onEnableSpy
        };
        const plugin = new AppPlugin(bundle);
        
        // Mock ObjectQL engine
        const mockQL = { registry: {} };
        vi.mocked(mockContext.getService).mockReturnValue(mockQL);
        
        await plugin.start!(mockContext);
        
        expect(onEnableSpy).toHaveBeenCalled();
        // Check context passed to onEnable
        const callArg = onEnableSpy.mock.calls[0][0];
        expect(callArg.ql).toBe(mockQL);
    });

    it('start should warn if objectql not found', async () => {
        const bundle = { id: 'com.test.warn' };
        const plugin = new AppPlugin(bundle);
        
        vi.mocked(mockContext.getService).mockReturnValue(undefined); // No ObjectQL
        
        await plugin.start!(mockContext);
        
        expect(mockContext.logger.warn).toHaveBeenCalledWith(
            expect.stringContaining('ObjectQL engine service not found'), 
            expect.any(Object)
        );
    });
});
