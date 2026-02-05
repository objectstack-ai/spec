
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpDispatcher } from './http-dispatcher.js';
import { ObjectKernel } from '@objectstack/core';

describe('HttpDispatcher', () => {
    let kernel: ObjectKernel;
    let dispatcher: HttpDispatcher;
    let mockProtocol: any;
    let mockBroker: any;

    beforeEach(() => {
        // Mock Kernel
        mockProtocol = {
            saveMetaItem: vi.fn().mockResolvedValue({ success: true, message: 'Saved' }),
            getMetaItem: vi.fn().mockResolvedValue({ success: true, item: { foo: 'bar' } })
        };
        
        mockBroker = {
            call: vi.fn(),
        };

        kernel = {
            broker: mockBroker,
            context: {
                getService: (name: string) => {
                    if (name === 'protocol') return mockProtocol;
                    return null;
                }
            }
        } as any;

        dispatcher = new HttpDispatcher(kernel);
    });

    describe('handleMetadata', () => {
        it('should handle PUT /metadata/:type/:name by calling protocol.saveMetaItem', async () => {
            const context = { request: {} };
            const body = { label: 'New Label' };
            const path = '/objects/my_obj';

            const result = await dispatcher.handleMetadata(path, context, 'PUT', body);

            expect(result.handled).toBe(true);
            expect(result.response?.status).toBe(200);
            expect(mockProtocol.saveMetaItem).toHaveBeenCalledWith({
                type: 'objects',
                name: 'my_obj',
                item: body
            });
            expect(result.response?.body).toEqual({
                success: true,
                data: { success: true, message: 'Saved' },
                meta: undefined
            });
        });

        it('should fallback to broker call if protocol is missing saveMetaItem', async () => {
             // Mock protocol without saveMetaItem
            (kernel as any).context.getService = () => ({}); 
            // Mock broker success
            mockBroker.call.mockResolvedValue({ success: true, fromBroker: true });

            const context = { request: {} };
            const body = { label: 'Fallback' };
            const path = '/objects/my_obj';

            const result = await dispatcher.handleMetadata(path, context, 'PUT', body);

            expect(result.handled).toBe(true);
            expect(mockBroker.call).toHaveBeenCalledWith(
                'metadata.saveItem',
                { type: 'objects', name: 'my_obj', item: body },
                { request: context.request }
            );
            expect(result.response?.body?.data).toEqual({ success: true, fromBroker: true });
        });

        it('should return error if save fails', async () => {
            mockProtocol.saveMetaItem.mockRejectedValue(new Error('Save failed'));

            const context = { request: {} };
            const body = {};
            const path = '/objects/bad_obj';

            const result = await dispatcher.handleMetadata(path, context, 'PUT', body);

            expect(result.handled).toBe(true);
            expect(result.response?.status).toBe(400);
            expect(result.response?.body?.error?.message).toBe('Save failed');
        });
        
        it('should handle READ operations as before', async () => {
             mockBroker.call.mockResolvedValue({ name: 'my_obj' });
             
             const context = { request: {} };
             const result = await dispatcher.handleMetadata('/objects/my_obj', context, 'GET');
             
             expect(result.handled).toBe(true);
             expect(mockBroker.call).toHaveBeenCalledWith(
                 'metadata.getObject', 
                 { objectName: 'my_obj' }, 
                 { request: context.request }
             );
        });
    });
});
