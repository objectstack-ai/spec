/**
 * Auto-generate MSW handlers from ObjectStack configuration
 * 
 * This helper creates all necessary MSW handlers based on your
 * objectstack.config.ts without requiring the full runtime.
 */

import { http, HttpResponse } from 'msw';

// Simple in-memory store
const stores = new Map<string, Map<string, any>>();

let idCounters = new Map<string, number>();

function getStore(objectName: string): Map<string, any> {
  if (!stores.has(objectName)) {
    stores.set(objectName, new Map());
  }
  return stores.get(objectName)!;
}

function getNextId(objectName: string): string {
  const current = idCounters.get(objectName) || 0;
  const next = current + 1;
  idCounters.set(objectName, next);
  return String(next);
}

/**
 * Seed initial data for an object
 */
export function seedData(objectName: string, records: any[]) {
  const store = getStore(objectName);
  records.forEach((record) => {
    const id = record.id || getNextId(objectName);
    store.set(id, { ...record, id });
  });
  
  // Initialize ID counter
  const maxId = Math.max(
    0,
    ...Array.from(store.values()).map(r => parseInt(r.id) || 0)
  );
  idCounters.set(objectName, maxId);
}

/**
 * Create auto-mocked MSW handlers for ObjectStack API
 */
export function createMockHandlers(baseUrl: string = '/api/v1', metadata: any = {}) {
  const discoveryResponse = {
    name: 'ObjectStack Mock Server',
    version: '1.0.0',
    environment: 'development',
    routes: {
      discovery: `${baseUrl}`,
      metadata: `${baseUrl}/meta`,
      data: `${baseUrl}/data`,
      ui: `${baseUrl}/ui`
    },
    capabilities: {
      search: true,
      files: false
    }
  };

  // Generate handlers for both correct paths and doubled paths (client compatibility)
  const paths = [baseUrl, `${baseUrl}/api/v1`];
  
  const handlers = [];
  
  for (const path of paths) {
    handlers.push(
      // Discovery endpoint
      http.get(path, () => {
        return HttpResponse.json(discoveryResponse);
      }),

      // Meta endpoints
      http.get(`${path}/meta`, () => {
        return HttpResponse.json({
          data: [
            { type: 'object', href: `${baseUrl}/meta/objects`, count: Object.keys(metadata.objects || {}).length }
          ]
        });
      }),

      http.get(`${path}/meta/objects`, () => {
        const objects = metadata.objects || {};
        return HttpResponse.json({
          data: Object.values(objects).map((obj: any) => ({
            name: obj.name,
            label: obj.label,
            description: obj.description,
            path: `${baseUrl}/data/${obj.name}`,
            self: `${baseUrl}/meta/object/${obj.name}`
          }))
        });
      }),

      http.get(`${path}/meta/object/:name`, ({ params }) => {
        const objectName = params.name as string;
        const obj = metadata.objects?.[objectName];
        
        if (!obj) {
          return HttpResponse.json({ error: 'Object not found' }, { status: 404 });
        }
        
        return HttpResponse.json(obj);
      }),

      // Data: Find/List
      http.get(`${path}/data/:object`, ({ params, request }) => {
        const objectName = params.object as string;
        const store = getStore(objectName);
        const url = new URL(request.url);
        
        const top = parseInt(url.searchParams.get('top') || '100');
        const skip = parseInt(url.searchParams.get('$skip') || '0');
        
        const records = Array.from(store.values());
        const paginatedRecords = records.slice(skip, skip + top);
        
        return HttpResponse.json({
          '@odata.context': `${baseUrl}/data/$metadata#${objectName}`,
          value: paginatedRecords,
          count: records.length
        });
      }),

      // Data: Get by ID
      http.get(`${path}/data/:object/:id`, ({ params }) => {
        const objectName = params.object as string;
        const id = params.id as string;
        const store = getStore(objectName);
        const record = store.get(id);
        
        if (!record) {
          return HttpResponse.json({ error: 'Record not found' }, { status: 404 });
        }
        
        return HttpResponse.json(record);
      }),

      // Data: Create
      http.post(`${path}/data/:object`, async ({ params, request }) => {
        const objectName = params.object as string;
        const body = await request.json() as any;
        const store = getStore(objectName);
        
        const id = body.id || getNextId(objectName);
        const newRecord = {
          ...body,
          id,
          createdAt: body.createdAt || new Date().toISOString()
        };
        
        store.set(id, newRecord);
        
        return HttpResponse.json(newRecord, { status: 201 });
      }),

      // Data: Update
      http.patch(`${path}/data/:object/:id`, async ({ params, request }) => {
        const objectName = params.object as string;
        const id = params.id as string;
        const updates = await request.json() as any;
        const store = getStore(objectName);
        const record = store.get(id);
        
        if (!record) {
          return HttpResponse.json({ error: 'Record not found' }, { status: 404 });
        }
        
        const updatedRecord = { ...record, ...updates };
        store.set(id, updatedRecord);
        
        return HttpResponse.json(updatedRecord);
      }),

      // Data: Delete
      http.delete(`${path}/data/:object/:id`, ({ params }) => {
        const objectName = params.object as string;
        const id = params.id as string;
        const store = getStore(objectName);
        
        if (!store.has(id)) {
          return HttpResponse.json({ error: 'Record not found' }, { status: 404 });
        }
        
        store.delete(id);
        
        return HttpResponse.json({ success: true }, { status: 204 });
      })
    );
  }
  
  return handlers;
}
