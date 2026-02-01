import { describe, it, expect, vi } from 'vitest';
import { MSWPlugin, ObjectStackServer } from './msw-plugin';

describe('MSWPlugin', () => {
    it('should initialize correctly', () => {
        const plugin = new MSWPlugin({ enableBrowser: false });
        expect(plugin.name).toBe('com.objectstack.plugin.msw');
        expect(plugin.version).toBe('0.9.0');
    });

    it('should handle protocol dynamic loading gracefully', async () => {
        // Mock context 
        const context: any = {
            logger: { info: vi.fn(), debug: vi.fn(), warn: vi.fn() },
            getService: vi.fn().mockReturnValue(null), // No protocol service initially
            registerService: vi.fn()
        };

        const plugin = new MSWPlugin();
        await plugin.init(context);
        // It should try to load ObjectStackProtocolImplementation dynamically
        // Since we are in test environment, the dynamic import might fail or succeed depending on build
        // But we expect it not to crash
    });
});

describe('ObjectStackServer', () => {
    it('should throw if used before init', async () => {
        await expect(ObjectStackServer.findData('test')).rejects.toThrow('ObjectStackServer not initialized');
    });

    it('should delegate to protocol after init', async () => {
        const protocolMock: any = {
            findData: vi.fn().mockResolvedValue({ records: [] })
        };
        ObjectStackServer.init(protocolMock);
        
        await ObjectStackServer.findData('test');
        expect(protocolMock.findData).toHaveBeenCalled();
    });
});
