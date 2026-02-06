import { ObjectKernel, DriverPlugin, AppPlugin } from '@objectstack/runtime';
import { ObjectQLPlugin, SchemaRegistry } from '@objectstack/objectql';
import { InMemoryDriver } from '@objectstack/driver-memory';
import { MSWPlugin } from '@objectstack/plugin-msw';

export interface KernelOptions {
    appConfig: any;
    enableBrowser?: boolean; // Default true (for browser usage), set false for tests
}

export async function createKernel(options: KernelOptions) {
    const { appConfig, enableBrowser = true } = options;

    console.log('[KernelFactory] Creating ObjectStack Kernel...');
    console.log('[KernelFactory] App Config:', appConfig);

    const driver = new InMemoryDriver();
    const kernel = new ObjectKernel();

    // Register ObjectQL engine
    await kernel.use(new ObjectQLPlugin());
    
    // Register the driver
    await kernel.use(new DriverPlugin(driver, 'memory'));
    
    // Load app config as a plugin (which handles Seeding)
    await kernel.use(new AppPlugin(appConfig));
    
    // MSW Plugin
    await kernel.use(new MSWPlugin({
        enableBrowser: enableBrowser,
        baseUrl: '/api/v1',
        logRequests: true
    }));

    // --- BROKER SHIM START ---
    // HttpDispatcher requires a broker to function. We inject a shim.
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
                     let all = await ql.find(params.object);
                     if (!all) all = [];
                     const match = all.find((i: any) => i.id === params.id || i._id === params.id);
                     return match || null;
                }
                if (method === 'update') {
                     if (params.id) {
                         // Robust check: Manually find the record in memory since ql.find(obj, id) might not be supported by this specific mock driver setup
                         let all = await ql.find(params.object);
                         
                         if (all && (all as any).value) all = (all as any).value;
                         if (!all) all = [];
                         
                         const existing = all.find((i: any) => i.id === params.id || i._id === params.id);
                         
                         if (!existing) {
                             console.warn(`[BrokerShim] Update failed: Record ${params.id} not found.`);
                             throw new Error('[ObjectStack] Not Found'); 
                         }
                         
                         // Perform update using the ObjectQL Engine signature: update(object, data, options)
                         // where options.filter can be the ID string
                         try {
                              await ql.update(params.object, params.data, { filter: params.id });
                         } catch (err: any) {
                              console.warn(`[BrokerShim] update failed: ${err.message}`);
                              throw err;
                         }
                         
                         return { ...existing, ...params.data }; 
                     }
                     return null;
                }
                if (method === 'delete') {
                    try {
                        // ql.delete(object, options) where options.filter is ID
                        return await ql.delete(params.object, { filter: params.id });
                    } catch (err: any) {
                        console.warn(`[BrokerShim] delete failed: ${err.message}`);
                        throw err;
                    }
                }
                if (method === 'find' || method === 'query') {
                    let all = await ql.find(params.object);
                    
                    // DEBUG SHIM 
                    // console.log(`[BrokerShim debug] Incoming Params:`, JSON.stringify(params, null, 2));
                    // console.log(`[BrokerShim debug] Raw ql.find result type: ${typeof all}, isArray: ${Array.isArray(all)}, value:`, all);
                    
                    // Handle PaginatedResult { value: [...] } vs Array [...]
                    if (!Array.isArray(all) && all && (all as any).value) {
                         console.log('[BrokerShim debug] Detected PaginatedResult wrapper, unwrapping .value');
                         all = (all as any).value;
                    }
                    
                    if (!all) all = [];

                    const filters = params.filters;
                    // Extract standard query options possibly passed via filters (due to MSW plugin mapping)
                    let queryOptions: any = {};
                    if (filters && typeof filters === 'object') {
                         const reserved = ['top', 'skip', 'sort', 'select', 'expand', 'count', 'search'];
                         reserved.forEach(opt => {
                             if (filters[opt] !== undefined) {
                                 queryOptions[opt] = filters[opt];
                             }
                         });
                    }

                    if (filters && typeof filters === 'object' && !Array.isArray(filters)) {
                         // Filter out reserved query parameters that are NOT field names
                         const reserved = ['top', 'skip', 'sort', 'select', 'expand', 'count', 'search'];
                         const keys = Object.keys(filters).filter(k => !reserved.includes(k));

                         if (keys.length > 0) {
                              // console.log('[BrokerShim debug] Applying filters:', keys);
                              all = all.filter((item: any) => {
                                  return keys.every(k => {
                                      // Loose equality check
                                      return String(item[k]) == String(filters[k]);
                                  });
                              });
                         }
                    }

                    // --- Sort ---
                    if (queryOptions.sort) {
                        const sortFields = String(queryOptions.sort).split(',').map(s => s.trim());
                        all.sort((a: any, b: any) => {
                            for (const field of sortFields) {
                                const desc = field.startsWith('-');
                                const key = desc ? field.substring(1) : field;
                                if (a[key] < b[key]) return desc ? 1 : -1;
                                if (a[key] > b[key]) return desc ? -1 : 1;
                            }
                            return 0;
                        });
                    }

                    // --- Select ---
                    if (queryOptions.select) {
                        const selectFields = Array.isArray(queryOptions.select) 
                             ? queryOptions.select 
                             : String(queryOptions.select).split(',').map((s: string) => s.trim());
                        
                        all = all.map((item: any) => {
                            const projected: any = { id: item.id, _id: item._id }; // Always include ID
                            selectFields.forEach((f: string) => {
                                if (item[f] !== undefined) projected[f] = item[f];
                            });
                            return projected;
                        });
                    }

                    // --- Skip/Top ---
                    const skip = parseInt(queryOptions.skip) || 0;
                    const top = parseInt(queryOptions.top); // undefined is fine

                    if (skip > 0) {
                        all = all.slice(skip);
                    }
                    if (!isNaN(top)) {
                        all = all.slice(0, top);
                    }
                    
                    console.log(`[BrokerShim] find/query(${params.object}) -> count: ${all.length}`);
                    return { data: all, count: all.length };
                }
            }
            
            if (service === 'metadata') {
                if (method === 'objects') {
                    let objs = ql && ql.getObjects ? ql.getObjects() : [];
                    if (objs.length === 0) {
                         objs = SchemaRegistry.getAllObjects();
                    }
                    return objs;
                }
                if (method === 'getObject') {
                     return SchemaRegistry.getObject(params.objectName) || (ql ? ql.getObject(params.objectName) : null);
                }
            }
            
            console.warn(`[BrokerShim] Action not implemented: ${action}`);
            return null;
        }
    };
    // --- BROKER SHIM END ---
    
    await kernel.bootstrap();

    // FORCE SYNC SEED: Guarantees data availability for both Browser and Tests
    const ql = kernel.context?.getService<any>('objectql');
    if (ql) {
        // Initial check
        let tasks = await ql.find('todo_task');
        
        // If AppPlugin's async seeding hasn't finished or failed, do it manually now.
        if (!tasks || tasks.length === 0) {
            console.warn('[KernelFactory] Seeding check failed. Executing IMMEDIATE Manual Seeding...');
            
            const manifestData = appConfig.data || (appConfig.manifest && appConfig.manifest.data);
            if (manifestData && Array.isArray(manifestData)) {
                for (const dataset of manifestData) {
                    if (dataset.records) {
                        console.log(`[KernelFactory] Manual Seeding ${dataset.records.length} records for ${dataset.object}`);
                        for (const record of dataset.records) {
                            await ql.insert(dataset.object, record);
                        }
                    }
                }
            }
            // Verify
            tasks = await ql.find('todo_task');
            console.log(`[KernelFactory] Manual Seeding Complete. Count in DB: ${tasks?.length}`);
        } else {
             console.log(`[KernelFactory] Data verified present: ${tasks?.length} records.`);
        }
    }

    // --- PROTOCOL SERVICE MOCK ---
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

    return kernel;
}
