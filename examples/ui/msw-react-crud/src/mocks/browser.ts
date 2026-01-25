/**
 * MSW Browser Worker Setup
 * 
 * This file sets up Mock Service Worker in the browser to intercept
 * API calls and return mock data following ObjectStack API conventions.
 */

import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';

// Mock in-memory database
let taskIdCounter = 3;
const mockTasks = new Map([
  ['1', { id: '1', subject: 'Complete MSW integration example', priority: 1, isCompleted: false, createdAt: new Date().toISOString() }],
  ['2', { id: '2', subject: 'Test CRUD operations with React', priority: 2, isCompleted: false, createdAt: new Date().toISOString() }],
  ['3', { id: '3', subject: 'Write documentation', priority: 3, isCompleted: true, createdAt: new Date().toISOString() }],
]);

// Define MSW handlers matching ObjectStack API endpoints
const handlers = [
  
  // Discovery endpoint
  http.get('/api/v1', () => {
    return HttpResponse.json({
      version: '1.0.0',
      endpoints: {
        discovery: '/api/v1',
        metadata: '/api/v1/meta',
        data: '/api/v1/data',
        ui: '/api/v1/ui'
      }
    });
  }),

  // Get object metadata
  http.get('/api/v1/meta/object/task', () => {
    return HttpResponse.json({
      name: 'task',
      label: 'Task',
      fields: {
        id: { name: 'id', label: 'ID', type: 'text' },
        subject: { name: 'subject', label: 'Subject', type: 'text' },
        priority: { name: 'priority', label: 'Priority', type: 'number' },
        isCompleted: { name: 'isCompleted', label: 'Completed', type: 'boolean' },
        createdAt: { name: 'createdAt', label: 'Created At', type: 'datetime' }
      }
    });
  }),

  // Find/List tasks (GET /api/v1/data/task)
  http.get('/api/v1/data/task', ({ request }) => {
    const url = new URL(request.url);
    const top = parseInt(url.searchParams.get('$top') || '100');
    const skip = parseInt(url.searchParams.get('$skip') || '0');
    
    const tasks = Array.from(mockTasks.values());
    const sortedTasks = tasks.sort((a, b) => a.priority - b.priority);
    const paginatedTasks = sortedTasks.slice(skip, skip + top);
    
    return HttpResponse.json({
      '@odata.context': '/api/v1/data/$metadata#task',
      value: paginatedTasks,
      count: tasks.length
    });
  }),

  // Get single task (GET /api/v1/data/task/:id)
  http.get('/api/v1/data/task/:id', ({ params }) => {
    const { id } = params;
    const task = mockTasks.get(id as string);
    
    if (!task) {
      return HttpResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(task);
  }),

  // Create task (POST /api/v1/data/task)
  http.post('/api/v1/data/task', async ({ request }) => {
    const body = await request.json() as any;
    
    const newTask = {
      id: String(++taskIdCounter),
      subject: body.subject || '',
      priority: body.priority || 5,
      isCompleted: body.isCompleted || false,
      createdAt: new Date().toISOString()
    };
    
    mockTasks.set(newTask.id, newTask);
    
    return HttpResponse.json(newTask, { status: 201 });
  }),

  // Update task (PATCH /api/v1/data/task/:id)
  http.patch('/api/v1/data/task/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json() as any;
    const task = mockTasks.get(id as string);
    
    if (!task) {
      return HttpResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    const updatedTask = { ...task, ...updates };
    mockTasks.set(id as string, updatedTask);
    
    return HttpResponse.json(updatedTask);
  }),

  // Delete task (DELETE /api/v1/data/task/:id)
  http.delete('/api/v1/data/task/:id', ({ params }) => {
    const { id } = params;
    
    if (!mockTasks.has(id as string)) {
      return HttpResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    mockTasks.delete(id as string);
    
    return HttpResponse.json({ success: true }, { status: 204 });
  }),
];

// Create and export the worker
export const worker = setupWorker(...handlers);

// Start the worker (will be called in main.tsx)
export async function startMockServer() {
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
  console.log('[MSW] Mock Service Worker started - API requests will be intercepted');
}
