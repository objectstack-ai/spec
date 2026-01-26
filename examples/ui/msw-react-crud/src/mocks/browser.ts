/**
 * MSW Browser Worker Setup
 * 
 * Simplified setup using auto-generated handlers from objectstack.config.ts
 * No runtime overhead - just pure MSW handlers generated from your config!
 */

import { setupWorker } from 'msw/browser';
import { createMockHandlers, seedData } from './createMockHandlers';
import appConfig from '../../objectstack.config';

/**
 * Start the MSW worker with auto-generated handlers
 * 
 * This function:
 * 1. Seeds initial data
 * 2. Generates MSW handlers automatically from your config
 * 3. Starts the MSW worker
 */
export async function startMockServer() {
  // Seed initial task data
  seedData('task', [
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
  ]);

  // Create metadata from config
  const metadata = {
    objects: (appConfig.objects || []).reduce((acc: any, obj: any) => {
      acc[obj.name] = obj;
      return acc;
    }, {})
  };

  // Create handlers from config
  const handlers = createMockHandlers('/api/v1', metadata);

  // Start MSW worker
  const worker = setupWorker(...handlers);
  await worker.start({
    onUnhandledRequest: 'bypass',
  });

  console.log('[MSW] Auto-mocked API ready! All endpoints generated from objectstack.config.ts');
  console.log('[MSW] Objects:', Object.keys(metadata.objects));
  
  return worker;
}

