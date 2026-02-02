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
});
