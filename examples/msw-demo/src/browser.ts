/**
 * MSW Browser Example - Standalone Usage
 * 
 * This example shows how to use MSW with ObjectStack in a browser environment.
 * It matches the example from the problem statement.
 */

import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';
import { ObjectStackServer } from '@objectstack/plugin-msw';

// Mock protocol - in real usage, this would come from runtime
// For this example, we'll simulate it
const mockProtocol = {
  getData: async (object: string, id: string) => {
    return { id, object, name: `Mock ${object}`, status: 'active' };
  },
  createData: async (object: string, data: any) => {
    return { id: 'new-id', ...data };
  },
  // Add other methods as needed
} as any;

// 1. Initialize the mock server (equivalent to ObjectStackServer.init())
ObjectStackServer.init(mockProtocol);

// 2. Define request handlers (similar to Express/Koa routes, but in Service Worker)
const handlers = [
  
  // Intercept GET /api/user/:id
  http.get('/api/user/:id', async ({ params }) => {
    const { id } = params;
    
    // Call local logic
    const result = await ObjectStackServer.getUser(id as string);

    // Return constructed Response
    return HttpResponse.json(result.data, { status: result.status });
  }),

  // Intercept POST /api/user
  http.post('/api/user', async ({ request }) => {
    const body = await request.json();
    
    // Call local logic
    const result = await ObjectStackServer.createUser(body);

    return HttpResponse.json(result.data, { status: result.status });
  }),
];

// 3. Create Worker instance
export const worker = setupWorker(...handlers);

// Start the worker (typically called in your app entry point)
if (typeof window !== 'undefined') {
  worker.start({
    onUnhandledRequest: 'bypass',
  }).then(() => {
    console.log('[MSW] Mock Service Worker started');
  });
}
