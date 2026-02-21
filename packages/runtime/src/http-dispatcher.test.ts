
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

    describe('handleAutomation', () => {
        let mockAutomationService: any;

        beforeEach(() => {
            mockAutomationService = {
                listFlows: vi.fn().mockResolvedValue(['flow_a', 'flow_b']),
                getFlow: vi.fn().mockResolvedValue({ name: 'flow_a', label: 'Flow A' }),
                registerFlow: vi.fn(),
                unregisterFlow: vi.fn(),
                execute: vi.fn().mockResolvedValue({ success: true, output: {} }),
                toggleFlow: vi.fn().mockResolvedValue(undefined),
                listRuns: vi.fn().mockResolvedValue([{ id: 'run_1', status: 'completed' }]),
                getRun: vi.fn().mockResolvedValue({ id: 'run_1', status: 'completed' }),
                trigger: vi.fn().mockResolvedValue({ success: true }),
            };

            // Set up kernel services to include automation
            (kernel as any).services = new Map([
                ['automation', mockAutomationService],
            ]);
        });

        it('should list flows via GET /', async () => {
            const result = await dispatcher.handleAutomation('', 'GET', {}, { request: {} });
            expect(result.handled).toBe(true);
            expect(result.response?.body?.data?.flows).toEqual(['flow_a', 'flow_b']);
        });

        it('should get a flow via GET /:name', async () => {
            const result = await dispatcher.handleAutomation('flow_a', 'GET', {}, { request: {} });
            expect(result.handled).toBe(true);
            expect(result.response?.body?.data?.name).toBe('flow_a');
        });

        it('should return 404 for non-existent flow via GET /:name', async () => {
            mockAutomationService.getFlow.mockResolvedValue(null);
            const result = await dispatcher.handleAutomation('missing', 'GET', {}, { request: {} });
            expect(result.handled).toBe(true);
            expect(result.response?.status).toBe(404);
        });

        it('should create a flow via POST /', async () => {
            const body = { name: 'new_flow', label: 'New Flow' };
            const result = await dispatcher.handleAutomation('', 'POST', body, { request: {} });
            expect(result.handled).toBe(true);
            expect(mockAutomationService.registerFlow).toHaveBeenCalledWith('new_flow', body);
        });

        it('should update a flow via PUT /:name', async () => {
            const body = { definition: { label: 'Updated' } };
            const result = await dispatcher.handleAutomation('flow_a', 'PUT', body, { request: {} });
            expect(result.handled).toBe(true);
            expect(mockAutomationService.registerFlow).toHaveBeenCalledWith('flow_a', { label: 'Updated' });
        });

        it('should delete a flow via DELETE /:name', async () => {
            const result = await dispatcher.handleAutomation('flow_a', 'DELETE', {}, { request: {} });
            expect(result.handled).toBe(true);
            expect(mockAutomationService.unregisterFlow).toHaveBeenCalledWith('flow_a');
            expect(result.response?.body?.data?.deleted).toBe(true);
        });

        it('should trigger a flow via POST /:name/trigger', async () => {
            const result = await dispatcher.handleAutomation('flow_a/trigger', 'POST', { key: 'val' }, { request: {} });
            expect(result.handled).toBe(true);
            expect(mockAutomationService.execute).toHaveBeenCalledWith('flow_a', { key: 'val' });
        });

        it('should toggle a flow via POST /:name/toggle', async () => {
            const result = await dispatcher.handleAutomation('flow_a/toggle', 'POST', { enabled: false }, { request: {} });
            expect(result.handled).toBe(true);
            expect(mockAutomationService.toggleFlow).toHaveBeenCalledWith('flow_a', false);
        });

        it('should list runs via GET /:name/runs', async () => {
            const result = await dispatcher.handleAutomation('flow_a/runs', 'GET', {}, { request: {} });
            expect(result.handled).toBe(true);
            expect(result.response?.body?.data?.runs).toHaveLength(1);
        });

        it('should get a run via GET /:name/runs/:runId', async () => {
            const result = await dispatcher.handleAutomation('flow_a/runs/run_1', 'GET', {}, { request: {} });
            expect(result.handled).toBe(true);
            expect(result.response?.body?.data?.id).toBe('run_1');
        });

        it('should return 404 for non-existent run', async () => {
            mockAutomationService.getRun.mockResolvedValue(null);
            const result = await dispatcher.handleAutomation('flow_a/runs/missing', 'GET', {}, { request: {} });
            expect(result.handled).toBe(true);
            expect(result.response?.status).toBe(404);
        });

        it('should handle legacy trigger path POST /trigger/:name', async () => {
            const result = await dispatcher.handleAutomation('trigger/flow_a', 'POST', { data: 1 }, { request: {} });
            expect(result.handled).toBe(true);
            expect(mockAutomationService.trigger).toHaveBeenCalledWith('flow_a', { data: 1 }, { request: {} });
        });
    });
});