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
  console.log('[MSW] Loaded Config:', appConfig);
  
  // DEBUG: Verify Data Existence
  const manifestData = appConfig.data || (appConfig.manifest && appConfig.manifest.data);
  if (manifestData && Array.isArray(manifestData)) {
       console.log(`[MSW] DATA DETECTED: Found ${manifestData.length} datasets in config.`);
       manifestData.forEach((d: any) => console.log(`[MSW] Dataset: object=${d.object}, records=${d.records?.length}`));
  } else {
       console.error('[MSW] CRITICAL: No initial data found in loaded config!', appConfig);
  }

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
                  console.log(`[BrokerShim] find/query(${params.object}) -> count: ${all.length}`, all);
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

  // DEBUG: Verify Seeding Result
  const ql = kernel.context?.getService<any>('objectql');
  if (ql) {
      setTimeout(async () => {
          try {
              const tasks = await ql.find('todo_task');
              console.log(`[MSW] POST-BOOTSTRAP VERIFICATION: Found ${tasks?.length} tasks in DB.`, tasks);
          } catch(e) {
              console.error('[MSW] Verification failed', e);
          }
      }, 500); // Small delay to ensure async seeding is definitely done (though bootstrap should cover it)
  }

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
  // Data seeding is handled by AppPlugin automatically
  const manifest = appConfig.manifest;
  console.log('[MSW] Checking manifest for data...', manifest);
  
  return kernel;
}

