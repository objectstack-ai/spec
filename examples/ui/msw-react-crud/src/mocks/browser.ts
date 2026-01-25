/**
 * MSW Browser Worker Setup
 * 
 * Simplified setup using ObjectStack plugin-msw.
 * All API endpoints are automatically mocked based on objectstack.config.ts
 */

import { ObjectStackKernel } from '@objectstack/runtime';
import { MSWPlugin } from '@objectstack/plugin-msw';
import appConfig from '../../objectstack.config';

let runtime: ObjectStackKernel | null = null;
let mswPlugin: MSWPlugin | null = null;

/**
 * Initialize and start the ObjectStack runtime with MSW plugin
 * 
 * This function:
 * 1. Creates an ObjectStack runtime with your app configuration
 * 2. Installs the MSW plugin to automatically mock all API endpoints
 * 3. Starts the runtime (which initializes data and starts MSW)
 */
export async function startMockServer() {
  // Create MSW Plugin
  mswPlugin = new MSWPlugin({
    enableBrowser: true,
    baseUrl: '/api/v1',
    logRequests: true
  });

  // Create runtime with app config and MSW plugin
  runtime = new ObjectStackKernel([
    appConfig,  // Your app configuration with objects and seed data
    mswPlugin   // MSW plugin to auto-mock all endpoints
  ]);

  // Start the runtime (this will initialize everything)
  await runtime.start();

  console.log('[MSW] ObjectStack runtime started with auto-mocked API endpoints');
}

/**
 * Get the runtime instance (useful for debugging)
 */
export function getRuntime() {
  return runtime;
}

/**
 * Get the MSW worker (useful for advanced use cases)
 */
export function getWorker() {
  return mswPlugin?.getWorker();
}
