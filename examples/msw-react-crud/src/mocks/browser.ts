/**
 * MSW Browser Worker Setup via ObjectStack Service
 * 
 * This creates a complete ObjectStack environment in the browser using the In-Memory Driver
 * and the MSW Plugin which automatically exposes the API.
 */

import { ObjectStackKernel } from '@objectstack/runtime';
import { InMemoryDriver } from '@objectstack/driver-memory';
import { MSWPlugin } from '@objectstack/plugin-msw';
import appConfig from '../../objectstack.config';

let kernel: ObjectStackKernel | null = null;

export async function startMockServer() {
  if (kernel) return;

  console.log('[MSW] Starting ObjectStack Runtime (Browser Mode)...');

  const driver = new InMemoryDriver();

  kernel = new ObjectStackKernel([
    // App Config
    appConfig,
    
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
  
  // Seed Data: Use the driver directly
  if (driver) {
    const tasks = [
      { 
        id: '1',
        subject: 'Complete MSW integration example', 
        priority: 1, 
        isCompleted: false, 
        createdAt: new Date().toISOString() 
      },
      { 
        id: '2',
        subject: 'Test CRUD operations with React', 
        priority: 2, 
        isCompleted: false, 
        createdAt: new Date().toISOString() 
      },
      { 
        id: '3',
        subject: 'Write documentation', 
        priority: 3, 
        isCompleted: true, 
        createdAt: new Date().toISOString() 
      }
    ];

    // Ensure schema exists (Driver internal API)
    if (driver.syncSchema) {
        await driver.syncSchema('task', {});
    }

    // Insert Data
    if (driver.create) {
        for (const task of tasks) {
            try {
               await driver.create('task', task);
            } catch (e) {
                // Ignore key conflict if seeded
            }
        }
        console.log('[MSW] Seeded initial data.');
    }
  }

  return kernel;
}

