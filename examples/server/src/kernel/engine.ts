import { ServiceObject } from '@objectstack/spec';
import { SchemaRegistry, ObjectQL } from '@objectstack/objectql';

// Import Packages/Plugins
// @ts-ignore
import CrmApp from '@objectstack/example-crm/objectstack.config';
// @ts-ignore
import TodoApp from '@objectstack/example-todo/objectstack.config';
// @ts-ignore
import BiPluginManifest from '@objectstack/plugin-bi/objectstack.config';
import BiPluginRuntime from '@objectstack/plugin-bi';
// @ts-ignore
import DriverMemoryManifest from '@objectstack/plugin-driver-memory/objectstack.config';
import DriverMemoryRuntime from '@objectstack/plugin-driver-memory';


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

  constructor() {
    // 1. Initialize Engine with Host Context (Simulated OS services)
    this.ql = new ObjectQL({
        os: { 
          registerService: () => console.log('OS Service Registered'),
          getConfig: async (key: string) => ({}) // Mock Config
        },
        app: { router: { get: () => {} } }, 
        storage: { set: () => {} },
        services: { register: () => {} },
        i18n: {}
    });
  }

  async start() {
    // 2. Load Plugins (Declarative)
    await this.loadPlugins();

    // 3. Start Engine
    await this.ql.init();
    
    // 4. Seed Data
    await this.seed();
  }

  async loadPlugins() {
    // Apps
    await this.ql.use(CrmApp);
    await this.ql.use(TodoApp);
    
    // Plugins (Manifest + Runtime)
    await this.ql.use(BiPluginManifest, BiPluginRuntime);
    
    // Drivers
    await this.ql.use(DriverMemoryManifest, DriverMemoryRuntime);
  }

  async seed() {
    // If no driver registered yet, this might fail or wait. 
    // In real world, we wait for 'ready' event.
    try {
        await this.ql.insert('SystemStatus', { status: 'OK', uptime: 0 });

        // Seed some Todo Tasks if table is empty
        // Use try-catch because find might throw if object not registered (though it should be)
        try {
          const tasks = await this.ql.find('todo_task', { top: 1 });
          if (tasks.length === 0) {
               console.log('[DataEngine] Seeding initial Todo Data...');
               await this.ql.insert('todo_task', { subject: 'Review PR #102', is_completed: true, priority: 3, due_date: new Date() });
               await this.ql.insert('todo_task', { subject: 'Write Documentation', is_completed: false, priority: 2, due_date: new Date(Date.now() + 86400000) });
               await this.ql.insert('todo_task', { subject: 'Fix specific Server bug', is_completed: false, priority: 1 });
          }
        } catch (e) {
          console.warn('[DataEngine] Failed to seed todo_task', e);
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
