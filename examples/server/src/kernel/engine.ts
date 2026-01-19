import { ServiceObject } from '@objectstack/spec';
import { SchemaRegistry } from './registry';

// Simple in-memory storage for demonstration
const MEMORY_DB: Record<string, any[]> = {};

export class DataEngine {
  
  async find(objectName: string, query: any) {
    this.ensureSchema(objectName);
    const records = MEMORY_DB[objectName] || [];
    // In real world: Implement parsing of `query` (filter, sort, page)
    return {
      value: records,
      count: records.length
    };
  }

  async get(objectName: string, id: string) {
    this.ensureSchema(objectName);
    const records = MEMORY_DB[objectName] || [];
    const record = records.find(r => r._id === id);
    if (!record) throw new Error(`Record not found: ${id}`);
    return record;
  }

  async create(objectName: string, payload: any) {
    const schema = this.ensureSchema(objectName);
    
    // Auto-generate ID and Timestamps
    const record = {
      _id: Math.random().toString(36).substring(7),
      created_at: new Date().toISOString(),
      ...payload
    };

    // TODO: Validate against schema.fields
    
    if (!MEMORY_DB[objectName]) MEMORY_DB[objectName] = [];
    MEMORY_DB[objectName].push(record);
    
    return record;
  }

  async update(objectName: string, id: string, payload: any) {
    this.ensureSchema(objectName);
    const records = MEMORY_DB[objectName] || [];
    const index = records.findIndex(r => r._id === id);
    
    if (index === -1) throw new Error(`Record not found: ${id}`);
    
    records[index] = { ...records[index], ...payload, updated_at: new Date().toISOString() };
    return records[index];
  }

  async delete(objectName: string, id: string) {
    this.ensureSchema(objectName);
    const records = MEMORY_DB[objectName] || [];
    const index = records.findIndex(r => r._id === id);
    
    if (index === -1) throw new Error(`Record not found: ${id}`);
    
    records.splice(index, 1);
    return { success: true };
  }

  private ensureSchema(name: string): ServiceObject {
    const schema = SchemaRegistry.getObject(name);
    if (!schema) throw new Error(`Unknown object: ${name}`);
    return schema;
  }
}
