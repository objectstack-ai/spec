/**
 * MSW Browser Worker Setup via ObjectStack Service
 * 
 * This creates a complete ObjectStack environment in the browser using the In-Memory Driver
 * and the MSW Plugin which automatically exposes the API.
 */

import { ObjectStackKernel, ObjectQLPlugin } from '@objectstack/runtime';
import { InMemoryDriver } from '@objectstack/driver-memory';
import { MSWPlugin } from '@objectstack/plugin-msw';
// import appConfig from '../../objectstack.config';
import todoConfig from '@objectstack/example-todo/objectstack.config';

let kernel: ObjectStackKernel | null = null;

export async function startMockServer() {
  if (kernel) return;

  console.log('[MSW] Starting ObjectStack Runtime (Browser Mode)...');

  const driver = new InMemoryDriver();

  // Define Seed Data using the Dataset Protocol
  // We use the data defined in the Todo App config
  
  kernel = new ObjectStackKernel([
    // Register ObjectQL engine explicitly
    new ObjectQLPlugin(),
    
    // Todo App Config (contains objects and data)
    todoConfig,
    
    // In-Memory Database (runs in browser)
    driver,
    
    // MSW Plugin (intercepts network requests)
    new MSWPlugin({
      enableBrowser: true,
      baseUrl: '/api/v1',
      logRequests: true
    })
  ]);

  await kernel.start();
  
  return kernel;
}

