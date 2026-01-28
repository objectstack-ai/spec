/**
 * MSW Browser Worker Setup via ObjectStack Service
 * 
 * This creates a complete ObjectStack environment in the browser using the In-Memory Driver
 * and the MSW Plugin which automatically exposes the API.
 */

import { ObjectKernel, ObjectQLPlugin, DriverPlugin, AppManifestPlugin } from '@objectstack/runtime';
import { InMemoryDriver } from '@objectstack/driver-memory';
import { MSWPlugin } from '@objectstack/plugin-msw';
// import appConfig from '../../objectstack.config';
import todoConfig from '@objectstack/example-todo/objectstack.config';

let kernel: ObjectKernel | null = null;

export async function startMockServer() {
  if (kernel) return;

  console.log('[MSW] Starting ObjectStack Runtime (Browser Mode)...');

  const driver = new InMemoryDriver();

  // Create kernel with MiniKernel architecture
  kernel = new ObjectKernel();
  
  kernel
    // Register ObjectQL engine
    .use(new ObjectQLPlugin())
    
    // Register the driver
    .use(new DriverPlugin(driver, 'memory'))
    
    // Load todo app config as a plugin
    .use(new AppManifestPlugin(todoConfig))
    
    // MSW Plugin (intercepts network requests)
    .use(new MSWPlugin({
      enableBrowser: true,
      baseUrl: '/api/v1',
      logRequests: true
    }));
  
  await kernel.bootstrap();
  
  return kernel;
}

