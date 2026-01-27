import { ServiceObject } from '@objectstack/spec/data';
import { SchemaRegistry, ObjectQL } from '@objectstack/objectql';
import { OBJECTQL_PLUGIN_MARKER } from './objectql-plugin';

/**
 * ObjectStack Kernel (Microkernel)
 * 
 * The central container orchestrating the application lifecycle,
 * plugins, and the core ObjectQL engine.
 */
export class ObjectStackKernel {
  public ql?: ObjectQL; // Will be set by ObjectQLPlugin or fallback initialization
  private plugins: any[];

  constructor(plugins: any[] = []) {
    this.plugins = plugins;
    
    // Check if any plugin provides ObjectQL via the plugin marker
    // This is more robust than string matching on name
    const hasObjectQLPlugin = plugins.some(p => 
      p && typeof p === 'object' && OBJECTQL_PLUGIN_MARKER in p
    );
    
    if (!hasObjectQLPlugin) {
      // Backward compatibility: Initialize ObjectQL directly if no plugin provides it
      console.warn('[Kernel] No ObjectQL plugin detected. Using default initialization. Consider using ObjectQLPlugin for explicit registration.');
      this.ql = new ObjectQL({
        env: process.env.NODE_ENV || 'development'
      });
    }
  }

  /**
   * Ensure ObjectQL engine is initialized
   * @throws Error if ObjectQL is not available
   */
  private ensureObjectQL(): ObjectQL {
    if (!this.ql) {
      throw new Error('[Kernel] ObjectQL engine not initialized. Ensure ObjectQLPlugin is registered or kernel is properly initialized.');
    }
    return this.ql;
  }

  async start() {
    console.log('[Kernel] Starting...');
    
    // 0. Register Provided Plugins
    for (const p of this.plugins) {
        // Check if it is a Runtime Plugin (System Capability)
        if ('onStart' in p || 'install' in p) {
             console.log(`[Kernel] Loading Runtime Plugin: ${p.name}`);
             if (p.install) await p.install({ engine: this });
             continue;
        }
        
        // Otherwise treat as App Manifest
        console.log(`[Kernel] Loading App Manifest: ${p.id || p.name}`);
        SchemaRegistry.registerPlugin(p);
        
        // Register Objects from App/Plugin
        if (p.objects) {
            for (const obj of p.objects) {
                SchemaRegistry.registerObject(obj);
                console.log(`[Kernel] Registered Object: ${obj.name}`);
            }
        }
    }

    // 1. Load Drivers (Default to Memory if none provided in plugins)
    // TODO: Detect driver from plugins. For now, we still hard load memory driver if needed?
    // In strict mode, user should pass driver in plugins array (DriverManifest).
    // check if driver is registered
    
    // For Backwards Compat / Easy Dev, try dynamic import of memory driver if installed
    try {
        // @ts-ignore
        const { InMemoryDriver } = await import('@objectstack/driver-memory');
        const driver = new InMemoryDriver();
        this.ensureObjectQL().registerDriver(driver);
    } catch (e) {
        // Ignore if not present
    }
    
    // 2. Initialize Engine
    await this.ensureObjectQL().init();


    // 3. Seed Data
    await this.seed();

    // 4. Start Runtime Plugins
    for (const p of this.plugins) {
        if (('onStart' in p) && typeof p.onStart === 'function') {
            console.log(`[Kernel] Starting Plugin: ${p.name}`);
            await p.onStart({ engine: this });
        }
    }
  }

  async seed() {
    // If no driver registered yet, this might fail or wait. 
    // In real world, we wait for 'ready' event.
    try {
        // Mock System Table
        try {
             // We don't have SystemStatus defined in schema usually, skipping for general engine
             // await this.ql.insert('SystemStatus', { status: 'OK', uptime: 0 });
        } catch {}

        // Iterate over all registered plugins/apps and check for 'data' property in manifest

        const plugins = SchemaRegistry.getRegisteredTypes(); // This returns types like 'plugin', 'app'
        
        // This is a bit hacky because we don't have a direct "getAllManifests" API exposed easily
        // We will iterate known apps for now, or improve Registry API later.
        // Actually, SchemaRegistry.listItems('app') returns the manifests!
        
        const apps = [...SchemaRegistry.listItems('app'), ...SchemaRegistry.listItems('plugin')];
        
        for (const appItem of apps) {
            const app = appItem as any; // Cast to access data prop safely
            if (app.data && Array.isArray(app.data)) {
                console.log(`[Kernel] Seeding data for ${app.name || app.id}...`);
                for (const seed of app.data) {
                     try {
                        // Check if data exists
                        const existing = await this.ensureObjectQL().find(seed.object, { top: 1 });
                        if (existing.length === 0) {
                             console.log(`[Kernel] Inserting ${seed.records.length} records into ${seed.object}`);
                             for (const record of seed.records) {
                                 await this.ensureObjectQL().insert(seed.object, record);
                             }
                        }
                     } catch (e) {
                         console.warn(`[Kernel] Failed to seed ${seed.object}`, e);
                     }
                }
            }
        }

    } catch(e) {
        console.warn('Seed failed (driver might not be ready):', e);
    }
  }
  
  // Forward methods to ObjectQL
  async find(objectName: string, query: any) {
    this.ensureSchema(objectName);
    const results = await this.ensureObjectQL().find(objectName, { top: 100 });
    return { value: results, count: results.length };
  }

  async get(objectName: string, id: string) {
    this.ensureSchema(objectName);
    // Find One
    const results = await this.ensureObjectQL().find(objectName, { top: 1 }); // Mock implementation
    return results[0];
  }

  async create(objectName: string, data: any) {
     this.ensureSchema(objectName);
     return this.ensureObjectQL().insert(objectName, data);
  }

  async update(objectName: string, id: string, data: any) {
    this.ensureSchema(objectName);
    return this.ensureObjectQL().update(objectName, id, data);
  }

  async delete(objectName: string, id: string) {
    this.ensureSchema(objectName);
    return this.ensureObjectQL().delete(objectName, id);
  }

  // [New Methods for ObjectUI]
  getMetadata(objectName: string) {
    return this.ensureSchema(objectName);
  }
  
  getView(objectName: string, viewType: 'list' | 'form' = 'list') {
    const schema = this.ensureSchema(objectName);

    // Auto-Scaffold Default View
    if (viewType === 'list') {
      return {
        type: 'datagrid',
        title: `${schema.label || objectName} List`,
        columns: Object.keys(schema.fields || {}).map(key => ({
            field: key,
            label: schema.fields?.[key]?.label || key,
            width: 150
        })),
        actions: ['create', 'edit', 'delete']
      };
    }
    return null;
  }

  private ensureSchema(name: string): ServiceObject {
    const schema = SchemaRegistry.getObject(name);
    if (!schema) throw new Error(`Unknown object: ${name}`);
    return schema;
  }
}
