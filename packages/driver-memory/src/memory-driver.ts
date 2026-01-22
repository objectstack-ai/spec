import { QueryAST, QueryInput } from '@objectstack/spec/data';
import { DriverInterface, DriverOptions } from '@objectstack/spec/system';

/**
 * Example: In-Memory Driver
 * 
 * A minimal reference implementation of the ObjectStack Driver Protocol.
 * This driver stores data in a simple JavaScript object (Heap).
 */
export class InMemoryDriver implements DriverInterface {
  name = 'in-memory-driver';
  version = '0.0.1';

  // Duck-typed RuntimePlugin hook
  install(ctx: any) {
    if (ctx.engine && ctx.engine.ql && typeof ctx.engine.ql.registerDriver === 'function') {
        ctx.engine.ql.registerDriver(this);
    }
  }
  
  supports = {
    // Transaction & Connection Management
    transactions: false, 
    
    // Query Operations
    queryFilters: false,         // TODO: Not implemented - basic find() doesn't handle filters
    queryAggregations: false,    // TODO: Not implemented - count() only returns total
    querySorting: false,         // TODO: Not implemented - find() doesn't handle sorting
    queryPagination: true,       // Basic pagination via 'top' is implemented
    queryWindowFunctions: false, // TODO: Not implemented
    querySubqueries: false,      // TODO: Not implemented
    joins: false,                // TODO: Not implemented
    
    // Advanced Features
    fullTextSearch: false,       // TODO: Not implemented
    jsonFields: true,            // Native JS object support
    arrayFields: true,           // Native JS array support
  };

  /**
   * The "Database": A map of TableName -> Array of Records
   */
  private db: Record<string, any[]> = {};

  // ===================================
  // Lifecycle
  // ===================================

  async connect() {
    console.log('🔌 [InMemory] Database Connected (Virtual)');
  }

  async disconnect() {
    this.db = {};
    console.log('🔌 [InMemory] Database Disconnected & Cleared');
  }

  async checkHealth() {
    return true; 
  }

  // ===================================
  // Execution
  // ===================================

  async execute(command: any, params?: any[]) {
    console.log('⚠️ [InMemory] Raw execution not supported, received:', command);
    return null;
  }

  // ===================================
  // CRUD
  // ===================================

  async find(object: string, query: QueryInput, options?: DriverOptions) {
    const table = this.getTable(object);
    
    // 💡 Naive Implementation
    let results = [...table];

    // Simple limiting for demonstration
    if (query.top) {
      results = results.slice(0, query.top);
    }

    return results;
  }

  async findOne(object: string, query: QueryInput, options?: DriverOptions) {
    const results = await this.find(object, { ...query, top: 1 }, options);
    return results[0] || null;
  }

  async create(object: string, data: Record<string, any>, options?: DriverOptions) {
    const table = this.getTable(object);
    
    // COMPATIBILITY: Driver must return 'id' as string
    const newRecord = {
      id: this.generateId(),
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    };

    table.push(newRecord);
    return newRecord;
  }

  async update(object: string, id: string | number, data: Record<string, any>, options?: DriverOptions) {
    const table = this.getTable(object);
    const index = table.findIndex(r => r.id == id);
    
    if (index === -1) {
      throw new Error(`Record with ID ${id} not found in ${object}`);
    }

    const updatedRecord = {
      ...table[index],
      ...data,
      updated_at: new Date()
    };
    
    table[index] = updatedRecord;
    return updatedRecord;
  }

  async delete(object: string, id: string | number, options?: DriverOptions) {
    const table = this.getTable(object);
    const index = table.findIndex(r => r.id == id);
    
    if (index === -1) return false;

    table.splice(index, 1);
    return true;
  }

  async count(object: string, query?: QueryInput, options?: DriverOptions) {
    return this.getTable(object).length;
  }

  // ===================================
  // Bulk Operations
  // ===================================

  async bulkCreate(object: string, dataArray: Record<string, any>[], options?: DriverOptions) {
    return Promise.all(dataArray.map(data => this.create(object, data, options)));
  }

  async bulkUpdate(object: string, updates: { id: string | number, data: Record<string, any> }[], options?: DriverOptions) {
    return Promise.all(updates.map(u => this.update(object, u.id, u.data, options)));
  }

  async bulkDelete(object: string, ids: (string | number)[], options?: DriverOptions) {
    await Promise.all(ids.map(id => this.delete(object, id, options)));
  }

  // ===================================
  // Schema & Transactions
  // ===================================

  async syncSchema(object: string, schema: any, options?: DriverOptions) {
    if (!this.db[object]) {
      this.db[object] = [];
      console.log(`✨ [InMemory] Created table: ${object}`);
    }
  }

  async dropTable(object: string, options?: DriverOptions) {
    if (this.db[object]) {
      delete this.db[object];
    }
  }

  async beginTransaction() {
    throw new Error('Transactions not supported in InMemoryDriver');
  }

  async commit() { /* No-op */ }
  async rollback() { /* No-op */ }

  // ===================================
  // Helpers
  // ===================================

  private getTable(name: string) {
    if (!this.db[name]) {
      this.db[name] = [];
    }
    return this.db[name];
  }

  private generateId() {
    return Math.random().toString(36).substring(2, 15);
  }
}
