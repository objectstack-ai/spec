import { createKernel } from './createKernel';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { ObjectStackClient } from '@objectstack/client';
import todoConfig from '@example/app-todo/objectstack.config';

/**
 * Creates a Realistic Browser Simulation
 * 
 * This harness:
 * 1. Boots the actual ObjectStack Kernel (Memory Driver)
 * 2. Sets up the MSW Node Server (Network Layer)
 * 3. Wires the Network Layer directly to the Kernel Broker
 * 4. Returns a ready-to-use Client
 */
export async function simulateBrowser() {
    // 1. Boot Kernel (Headless Mode)
    const appConfig = (todoConfig as any).default || todoConfig;
    const kernel = await createKernel({
        appConfig,
        enableBrowser: false // Disable the built-in browser MSW worker
    });

    console.log('[SimulateBrowser] Kernel booted. Configuring Network Interceptors...');

    // 2. Define Network Handlers (The "Virtual Router")
    // These maps HTTP requests -> Kernel Broker Actions
    const handlers = [
        // Query / Find
        http.get('http://localhost:3000/api/v1/data/:object', async ({ params, request }) => {
            const url = new URL(request.url);
            const filters = {}; // Todo: parse query params if needed
            
            // Extract query params for simple filtering
            url.searchParams.forEach((val, key) => {
                if (key !== 'select' && key !== 'sort' && key !== 'top') {
                    (filters as any)[key] = val;
                }
            });

            console.log(`[VirtualNetwork] GET /data/${params.object}`);
            
            try {
                // Call Kernel
                const result = await (kernel as any).broker.call('data.find', {
                    object: params.object,
                    filters: filters
                });
                
                // Return Buffer/JSON
                return HttpResponse.json({ value: result.data, count: result.count });
            } catch (err: any) {
                return HttpResponse.json({ error: err.message }, { status: 500 });
            }
        }),

        // Create
        http.post('http://localhost:3000/api/v1/data/:object', async ({ params, request }) => {
            const body = await request.json();
            console.log(`[VirtualNetwork] POST /data/${params.object}`);
            
            try {
                const result = await (kernel as any).broker.call('data.create', {
                    object: params.object,
                    data: body
                });
                return HttpResponse.json(result);
            } catch (err: any) {
                return HttpResponse.json({ error: err.message }, { status: 500 });
            }
        }),

        // Update
        http.put('http://localhost:3000/api/v1/data/:object/:id', async ({ params, request }) => {
            const body = await request.json();
            console.log(`[VirtualNetwork] PUT /data/${params.object}/${params.id}`);
            
            try {
                const result = await (kernel as any).broker.call('data.update', {
                    object: params.object,
                    id: params.id,
                    data: body
                });
                return HttpResponse.json(result);
            } catch (err: any) {
                 return HttpResponse.json({ error: err.message }, { status: 500 });
            }
        }),

        // Delete
        http.delete('http://localhost:3000/api/v1/data/:object/:id', async ({ params }) => {
            console.log(`[VirtualNetwork] DELETE /data/${params.object}/${params.id}`);
            try {
                const result = await (kernel as any).broker.call('data.delete', {
                    object: params.object,
                    id: params.id
                });
                return HttpResponse.json(result);
            } catch (err: any) {
                 return HttpResponse.json({ error: err.message }, { status: 500 });
            }
        })
    ];

    // 3. Start Interceptor
    const server = setupServer(...handlers);
    server.listen({ onUnhandledRequest: 'bypass' });

    // 4. Create Client
    const client = new ObjectStackClient({
        baseUrl: 'http://localhost:3000'
    });

    return {
        kernel,
        client,
        server,
        cleanup: () => server.close()
    };
}
