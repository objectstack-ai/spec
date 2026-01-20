import { ServiceObject } from '@objectstack/spec';
import { SchemaRegistry } from './registry';
import { ObjectQL } from '@objectstack/objectql';

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
    this.ql = new ObjectQL();

    // Driver is now registered via Plugin System (see context.drivers.register) in loader.ts
    // We just wait for init
    
    // 2. Start Engine
    this.ql.init().catch(console.error);
    
    // Seed after a short delay (mocking async startup)
    setTimeout(() => this.seed(), 500);
  }

  async seed() {
    // If no driver registered yet, this might fail or wait. 
    // In real world, we wait for 'ready' event.
    try {
        await this.ql.insert('SystemStatus', { status: 'OK', uptime: 0 });
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

  private ensureSchema(name: string): ServiceObject {
    const schema = SchemaRegistry.getObject(name);
    if (!schema) throw new Error(`Unknown object: ${name}`);
    return schema;
  }
}
