/**
 * MSW Browser Worker Setup via ObjectStack Service
 * 
 * This creates a complete ObjectStack environment in the browser using the In-Memory Driver
 * and the MSW Plugin which automatically exposes the API.
 */

import { ObjectKernel, DriverPlugin, AppPlugin } from '@objectstack/runtime';
import { ObjectQLPlugin, SchemaRegistry } from '@objectstack/objectql';
import { InMemoryDriver } from '@objectstack/driver-memory';
import { MSWPlugin } from '@objectstack/plugin-msw';
// import appConfig from '../../objectstack.config';
import todoConfig from '@example/app-todo/objectstack.config';

let kernel: ObjectKernel | null = null;

export async function startMockServer() {
  if (kernel) return;

  console.log('[MSW] Starting ObjectStack Runtime (Browser Mode)...');

  // Handle CommonJS/ESM interop for config loading
  const appConfig = (todoConfig as any).default || todoConfig;

  const driver = new InMemoryDriver();

  // Create kernel with MiniKernel architecture
  kernel = new ObjectKernel();

  // Register ObjectQL engine
  await kernel.use(new ObjectQLPlugin());
  
  // Register the driver
  await kernel.use(new DriverPlugin(driver, 'memory'));
  
  // Load todo app config as a plugin
  await kernel.use(new AppPlugin(appConfig));
  
  // MSW Plugin (intercepts network requests)
  await kernel.use(new MSWPlugin({
    enableBrowser: true,
    baseUrl: '/api/v1',
    logRequests: true
  }));

  // --- BROKER SHIM START ---
  // HttpDispatcher requires a broker to function. We inject a simple shim.
  (kernel as any).broker = {
      call: async (action: string, params: any, opts: any) => {
          const parts = action.split('.');
          const service = parts[0];
          const method = parts[1];
          
          // Get Engines
          const ql = kernel!.context?.getService<any>('objectql');
          
          if (service === 'data') {
              if (method === 'create') {
                   const res = await ql.insert(params.object, params.data);
                   return { ...params.data, ...res };
              }
              if (method === 'get') {
                   // Manual filtering workaround for test/browser environment
                   let all = await ql.find(params.object);
                   if (!all) all = [];
                   const match = all.find((i: any) => i.id === params.id || i._id === params.id);
                   return match || null;
              }
              if (method === 'update') {
                  // ql.update(obj, data, options) - inject ID into data
                  return ql.update(params.object, { ...params.data, id: params.id });
              }
              if (method === 'delete') {
                  // ql.delete(obj, options) - pass ID as filter
                  return ql.delete(params.object, { filter: params.id });
              }
              if (method === 'find' || method === 'query') {
                  // Manual filtering workaround
                  let all = await ql.find(params.object);
                  if (!all) all = [];

                  const filters = params.filters;
                  if (filters && typeof filters === 'object' && !Array.isArray(filters)) {
                       const keys = Object.keys(filters);
                       if (keys.length > 0) {
                            all = all.filter((item: any) => {
                                return keys.every(k => item[k] === filters[k]);
                            });
                       }
                  }
                  
                  // HttpDispatcher expects { data, count } for query/list
                  return { data: all, count: all.length };
              }
          }
          
          if (service === 'metadata') {
              if (method === 'objects') {
                  // Try engine first
                  let objs = ql && ql.getObjects ? ql.getObjects() : [];
                  // Fallback to Registry if engine returns empty (likely delayed sync)
                  if (objs.length === 0) {
                       objs = SchemaRegistry.getAllObjects();
                  }
                  return objs;
              }
              if (method === 'getObject') {
                   // Try Registry first for speed/correctness
                   return SchemaRegistry.getObject(params.objectName) || (ql ? ql.getObject(params.objectName) : null);
              }
          }
          
          console.warn(`[BrokerShim] Action not implemented: ${action}`);
          return null;
      }
  };
  // --- BROKER SHIM END ---
  
  await kernel.bootstrap();

  // --- PROTOCOL SERVICE MOCK ---
  // Overwrite protocol service because the default one might be empty/broken in this env
  if (kernel.services instanceof Map) {
       kernel.services.set('protocol', {
           getUiView: async ({ object, type }: any) => {
               return {
                   type: type || 'list',
                   name: 'default',
                   object: object,
                   title: object,
                   body: []
               };
           }
       });
  }

  // Initialize default data from manifest if available
  const manifest = appConfig.manifest;
  if (manifest && Array.isArray(manifest.data)) {
    console.log('[MSW] Loading initial data...');
    for (const dataset of manifest.data) {
      if (dataset.object && Array.isArray(dataset.records)) {
        for (const record of dataset.records) {
          // Check if record already exists to avoid duplicates on hot reload?
          // Since it's in-memory and we create new kernel/driver on refresh...
          // But 'kernel' variable is module-scoped singleton.
          // On HMR replacement, this module might re-execute.
          // If 'kernel' is not null, we return early (line 18).
          // So data loading happens only once per session. Good.
          await driver.create(dataset.object, record);
        }
        console.log(`[MSW] Loaded ${dataset.records.length} records for ${dataset.object}`);
      }
    }
  }
  
  return kernel;
}

