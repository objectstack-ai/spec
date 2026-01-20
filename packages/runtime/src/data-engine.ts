import { ServiceObject } from '@objectstack/spec';
import { SchemaRegistry } from './registry';
import { ObjectQL } from './engine';

/**
 * Server Data Engine Wrapper
 * 
 * This class is now a thin wrapper that initializes the ObjectQL Engine 
 * with the appropriate Server-Side configuration (Registry, Drivers).
 * 
 * The core logic has been moved to @objectstack/objectql.
 */
export class DataEngine {
  public ql: ObjectQL;
  private plugins: any[];

  constructor(plugins: any[] = []) {
    // 1. Initialize Engine with Host Context (Simulated OS services)
    this.ql = new ObjectQL({
        env: process.env.NODE_ENV || 'development'
    });
    this.plugins = plugins;
  }

  async start() {
    console.log('[DataEngine] Starting...');
    
    // 0. Register Provided Plugins
    this.plugins.forEach(p => {
        console.log(`[DataEngine] Loading Plugin: ${p.id || p.name}`);
        SchemaRegistry.registerPlugin(p);
        
        // Register Objects from App/Plugin
        if (p.objects) {
            for (const obj of p.objects) {
                SchemaRegistry.registerObject(obj);
                console.log(`[DataEngine] Registered Object: ${obj.name}`);
            }
        }
    });

    // 1. Load Drivers (Default to Memory if none provided in plugins)
    // TODO: Detect driver from plugins. For now, we still hard load memory driver if needed?
    // In strict mode, user should pass driver in plugins array (DriverManifest).
    // check if driver is registered
    
    // For Backwards Compat / Easy Dev, try dynamic import of memory driver if installed
    try {
        // @ts-ignore
        const { InMemoryDriver } = await import('@objectstack/plugin-driver-memory');
        const driver = new InMemoryDriver();
        this.ql.registerDriver(driver);
    } catch (e) {
        // Ignore if not present
    }
    
    // 2. Initialize Engine
    await this.ql.init();


    // 3. Seed Data
    await this.seed();
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
                console.log(`[DataEngine] Seeding data for ${app.name || app.id}...`);
                for (const seed of app.data) {
                     try {
                        // Check if data exists
                        const existing = await this.ql.find(seed.object, { top: 1 });
                        if (existing.length === 0) {
                             console.log(`[DataEngine] Inserting ${seed.records.length} records into ${seed.object}`);
                             for (const record of seed.records) {
                                 await this.ql.insert(seed.object, record);
                             }
                        }
                     } catch (e) {
                         console.warn(`[DataEngine] Failed to seed ${seed.object}`, e);
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
    const results = await this.ql.find(objectName, { top: 100 });
    return { value: results, count: results.length };
  }

  async get(objectName: string, id: string) {
    this.ensureSchema(objectName);
    // Find One
    const results = await this.ql.find(objectName, { top: 1 }); // Mock implementation
    return results[0];
  }

  async create(objectName: string, data: any) {
     this.ensureSchema(objectName);
     return this.ql.insert(objectName, data);
  }

  async update(objectName: string, id: string, data: any) {
    this.ensureSchema(objectName);
    return this.ql.update(objectName, id, data);
  }

  async delete(objectName: string, id: string) {
    this.ensureSchema(objectName);
    return this.ql.delete(objectName, id);
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
