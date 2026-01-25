/**
 * MSW Browser Worker Setup
 * 
 * Simplified setup using auto-generated handlers from objectstack.config.ts
 * All API endpoints are automatically mocked based on your data model
 */

import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';
import { ObjectStackKernel } from '@objectstack/runtime';
import { ObjectStackRuntimeProtocol } from '@objectstack/runtime';
import appConfig from '../../objectstack.config';

let runtime: ObjectStackKernel | null = null;
let protocol: ObjectStackRuntimeProtocol | null = null;

/**
 * Initialize the ObjectStack runtime with your app configuration
 */
async function initializeRuntime() {
  runtime = new ObjectStackKernel([appConfig]);
  await runtime.start();
  protocol = new ObjectStackRuntimeProtocol(runtime);
  console.log('[MSW] ObjectStack runtime initialized');
}

/**
 * Generate MSW handlers automatically from the runtime protocol
 */
function createHandlers(baseUrl: string = '/api/v1') {
  if (!protocol) {
    throw new Error('Runtime not initialized. Call initializeRuntime() first.');
  }

  return [
    // Discovery endpoint
    http.get(`${baseUrl}`, () => {
      return HttpResponse.json(protocol!.getDiscovery());
    }),

    // Meta endpoints
    http.get(`${baseUrl}/meta`, () => {
      return HttpResponse.json(protocol!.getMetaTypes());
    }),

    http.get(`${baseUrl}/meta/:type`, ({ params }) => {
      return HttpResponse.json(protocol!.getMetaItems(params.type as string));
    }),

    http.get(`${baseUrl}/meta/:type/:name`, ({ params }) => {
      try {
        return HttpResponse.json(
          protocol!.getMetaItem(params.type as string, params.name as string)
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return HttpResponse.json({ error: message }, { status: 404 });
      }
    }),

    // Data endpoints
    http.get(`${baseUrl}/data/:object`, async ({ params, request }) => {
      try {
        const url = new URL(request.url);
        const queryParams: Record<string, any> = {};
        url.searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });
        
        const result = await protocol!.findData(params.object as string, queryParams);
        return HttpResponse.json(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return HttpResponse.json({ error: message }, { status: 404 });
      }
    }),

    http.get(`${baseUrl}/data/:object/:id`, async ({ params }) => {
      try {
        const result = await protocol!.getData(
          params.object as string,
          params.id as string
        );
        return HttpResponse.json(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return HttpResponse.json({ error: message }, { status: 404 });
      }
    }),

    http.post(`${baseUrl}/data/:object`, async ({ params, request }) => {
      try {
        const body = await request.json();
        const result = await protocol!.createData(params.object as string, body);
        return HttpResponse.json(result, { status: 201 });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return HttpResponse.json({ error: message }, { status: 400 });
      }
    }),

    http.patch(`${baseUrl}/data/:object/:id`, async ({ params, request }) => {
      try {
        const body = await request.json();
        const result = await protocol!.updateData(
          params.object as string,
          params.id as string,
          body
        );
        return HttpResponse.json(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return HttpResponse.json({ error: message }, { status: 400 });
      }
    }),

    http.delete(`${baseUrl}/data/:object/:id`, async ({ params }) => {
      try {
        const result = await protocol!.deleteData(
          params.object as string,
          params.id as string
        );
        return HttpResponse.json(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return HttpResponse.json({ error: message }, { status: 400 });
      }
    }),

    // UI Protocol endpoint
    http.get(`${baseUrl}/ui/view/:object`, ({ params, request }) => {
      try {
        const url = new URL(request.url);
        const viewType = url.searchParams.get('type') || 'list';
        const view = protocol!.getUiView(params.object as string, viewType as 'list' | 'form');
        return HttpResponse.json(view);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return HttpResponse.json({ error: message }, { status: 404 });
      }
    }),
  ];
}

/**
 * Start the MSW worker with auto-generated handlers
 * 
 * This function:
 * 1. Initializes the ObjectStack runtime with your app config
 * 2. Generates MSW handlers automatically
 * 3. Starts the MSW worker
 */
export async function startMockServer() {
  // Initialize runtime
  await initializeRuntime();

  // Create handlers from runtime protocol
  const handlers = createHandlers('/api/v1');

  // Start MSW worker
  const worker = setupWorker(...handlers);
  await worker.start({
    onUnhandledRequest: 'bypass',
  });

  console.log('[MSW] Auto-mocked API ready! All endpoints generated from objectstack.config.ts');
  return worker;
}

/**
 * Get the runtime instance (useful for debugging)
 */
export function getRuntime() {
  return runtime;
}
