/**
 * MSW Browser Worker Setup via ObjectStack Service
 * 
 * This creates a complete ObjectStack environment in the browser using the In-Memory Driver
 * and the MSW Plugin which automatically exposes the API.
 */
import { ObjectKernel } from '@objectstack/runtime';
import todoConfig from '@example/app-todo/objectstack.config';
import { createKernel } from './createKernel';

let kernel: ObjectKernel | null = null;

export async function startMockServer() {
  if (kernel) return;

  console.log('[MSW] Starting ObjectStack Runtime (Browser Mode)...');

  // Handle CommonJS/ESM interop for config loading
  const appConfig = (todoConfig as any).default || todoConfig;
  console.log('[MSW] Loaded Config:', appConfig);
  
  // Use shared factory
  kernel = await createKernel({
    appConfig,
    enableBrowser: true
  });

  return kernel;
}

