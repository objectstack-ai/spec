/**
 * Auto-generate MSW handlers from ObjectStack configuration
 * 
 * This helper creates all necessary MSW handlers based on your
 * objectstack.config.ts using the in-memory driver.
 */

import { http, HttpResponse } from 'msw';
import { InMemoryDriver } from '@objectstack/driver-memory';

// Shared driver instance
const driver = new InMemoryDriver();
driver.connect();

/**
 * Seed initial data for an object
 */
export async function seedData(objectName: string, records: any[]) {
  // Ensure table exists
  await driver.syncSchema(objectName, {});
  
  // Get existing records to determine insert vs update
  const existing = await driver.find(objectName, { object: objectName });
  
  for (const record of records) {
    const id = record.id;
    // Check if record exists by ID
    const found = id ? existing.find((r: any) => r.id === id) : null;
    
    if (found) {
      await driver.update(objectName, id, record);
    } else {
      await driver.create(objectName, record);
    }
  }
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

  // Generate handlers for both correct paths and potential variations
  const paths = [baseUrl];
  if (!baseUrl.endsWith('/api/v1')) {
     paths.push(`${baseUrl}/api/v1`); // fallback compatibility
  }

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
      http.get(`${path}/data/:object`, async ({ params, request }) => {
        const objectName = params.object as string;
        const url = new URL(request.url);
        
        const top = parseInt(url.searchParams.get('top') || '100');
        const skip = parseInt(url.searchParams.get('$skip') || '0');
        
        // Fetch all and slice manually since driver lacks skip/filtering
        await driver.syncSchema(objectName, {}); 
        const allRecords = await driver.find(objectName, { object: objectName });
        
        const paginatedRecords = allRecords.slice(skip, skip + top);
        
        return HttpResponse.json({
          '@odata.context': `${baseUrl}/data/$metadata#${objectName}`,
          value: paginatedRecords,
          count: allRecords.length
        });
      }),

      // Data: Get by ID
      http.get(`${path}/data/:object/:id`, async ({ params }) => {
        const objectName = params.object as string;
        const id = params.id as string;
        
        await driver.syncSchema(objectName, {});
        const allRecords = await driver.find(objectName, { object: objectName });
        const record = allRecords.find((r: any) => r.id === id);
        
        if (!record) {
          return HttpResponse.json({ error: 'Record not found' }, { status: 404 });
        }
        
        return HttpResponse.json(record);
      }),

      // Data: Create
      http.post(`${path}/data/:object`, async ({ params, request }) => {
        const objectName = params.object as string;
        const body = await request.json() as any;
        
        await driver.syncSchema(objectName, {});
        const newRecord = await driver.create(objectName, body);
        
        return HttpResponse.json(newRecord, { status: 201 });
      }),

      // Data: Update
      http.patch(`${path}/data/:object/:id`, async ({ params, request }) => {
        const objectName = params.object as string;
        const id = params.id as string;
        const updates = await request.json() as any;
        
        try {
            await driver.syncSchema(objectName, {});
            const updatedRecord = await driver.update(objectName, id, updates);
            return HttpResponse.json(updatedRecord);
        } catch (e) {
             return HttpResponse.json({ error: 'Record not found' }, { status: 404 });
        }
      }),

      // Data: Delete
      http.delete(`${path}/data/:object/:id`, async ({ params }) => {
        const objectName = params.object as string;
        const id = params.id as string;
        
        await driver.syncSchema(objectName, {});
        const success = await driver.delete(objectName, id);
        
        if (!success) {
          return HttpResponse.json({ error: 'Record not found' }, { status: 404 });
        }
        
        return HttpResponse.json({ success: true }, { status: 204 });
      })
    );
  }
  
  return handlers;
}
