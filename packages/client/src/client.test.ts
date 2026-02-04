import { describe, it, expect, vi } from 'vitest';
import { ObjectStackClient } from './index';

describe('ObjectStackClient', () => {
    it('should initialize with correct configuration', () => {
        const client = new ObjectStackClient({ baseUrl: 'http://localhost:3000' });
        expect(client).toBeDefined();
    });

    it('should normalize base URL', () => {
        const client: any = new ObjectStackClient({ baseUrl: 'http://localhost:3000/' });
        expect(client.baseUrl).toBe('http://localhost:3000');
    });

    it('should make discovery request on connect', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ 
                version: 'v1', 
                apiName: 'ObjectStack',
                capabilities: ['metadata', 'data', 'ui'],
                endpoints: {}
            })
        });

        const client = new ObjectStackClient({ 
            baseUrl: 'http://localhost:3000',
            fetch: fetchMock
        });

        await client.connect();
        expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/v1', expect.any(Object));
    });

    it('should get metadata types', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ 
                types: ['object', 'plugin', 'view']
            })
        });

        const client = new ObjectStackClient({ 
            baseUrl: 'http://localhost:3000',
            fetch: fetchMock
        });

        const result = await client.meta.getTypes();
        expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/v1/metadata', expect.any(Object));
        expect(result.types).toEqual(['object', 'plugin', 'view']);
    });

    it('should get metadata items by type', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ 
                type: 'object',
                items: [{ name: 'customer' }, { name: 'order' }]
            })
        });

        const client = new ObjectStackClient({ 
            baseUrl: 'http://localhost:3000',
            fetch: fetchMock
        });

        const result = await client.meta.getItems('object');
        expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/v1/metadata/object', expect.any(Object));
        expect(result.type).toBe('object');
        expect(result.items).toHaveLength(2);
    });

    it('should get metadata item by type and name', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ 
                name: 'customer',
                fields: []
            })
        });

        const client = new ObjectStackClient({ 
            baseUrl: 'http://localhost:3000',
            fetch: fetchMock
        });

        const result = await client.meta.getItem('object', 'customer');
        expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/v1/metadata/object/customer', expect.any(Object));
        expect(result.name).toBe('customer');
    });
});
