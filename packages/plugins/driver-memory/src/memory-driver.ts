import { QueryAST, QueryInput } from '@objectstack/spec/data';
import { DriverOptions } from '@objectstack/spec/system';
import { DriverInterface, Logger, createLogger } from '@objectstack/core';

/**
 * Example: In-Memory Driver
 * 
 * A minimal reference implementation of the ObjectStack Driver Protocol.
 * This driver stores data in a simple JavaScript object (Heap).
 */
export class InMemoryDriver implements DriverInterface {
  name = 'in-memory-driver';
  version = '0.0.1';
  private config: any;
  private logger: Logger;

  constructor(config?: any) {
    this.config = config || {};
    this.logger = config?.logger || createLogger({ level: 'info', format: 'pretty' });
    this.logger.debug('InMemory driver instance created', { config: this.config });
  }

  // Duck-typed RuntimePlugin hook
  install(ctx: any) {
    this.logger.debug('Installing InMemory driver via plugin hook');
    if (ctx.engine && ctx.engine.ql && typeof ctx.engine.ql.registerDriver === 'function') {
        ctx.engine.ql.registerDriver(this);
        this.logger.info('InMemory driver registered with ObjectQL engine');
    } else {
        this.logger.warn('Could not register driver - ObjectQL engine not found in context');
    }
  }
  
  supports = {
    // Transaction & Connection Management
    transactions: false, 
    
    // Query Operations
    queryFilters: false,         // TODO: Not implemented - basic find() doesn't handle filters
    queryAggregations: false,    // TODO: Not implemented - count() only returns total
    querySorting: false,         // TODO: Not implemented - find() doesn't handle sorting
    queryPagination: true,       // Basic pagination via 'limit' is implemented
    queryWindowFunctions: false, // TODO: Not implemented
    querySubqueries: false,      // TODO: Not implemented
    joins: false,                // TODO: Not implemented
    
    // Advanced Features
    fullTextSearch: false,       // TODO: Not implemented
    vectorSearch: false,         // TODO: Not implemented
    geoSpatial: false,           // TODO: Not implemented
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
    this.logger.info('InMemory Database Connected (Virtual)');
  }

  async disconnect() {
    const tableCount = Object.keys(this.db).length;
    const recordCount = Object.values(this.db).reduce((sum, table) => sum + table.length, 0);
    
    this.db = {};
    this.logger.info('InMemory Database Disconnected & Cleared', { 
      tableCount, 
      recordCount 
    });
  }

  async checkHealth() {
    this.logger.debug('Health check performed', { 
      tableCount: Object.keys(this.db).length,
      status: 'healthy' 
    });
    return true; 
  }

  // ===================================
  // Execution
  // ===================================

  async execute(command: any, params?: any[]) {
    this.logger.warn('Raw execution not supported in InMemory driver', { command });
    return null;
  }

  // ===================================
  // CRUD
  // ===================================

  async find(object: string, query: QueryInput, options?: DriverOptions) {
    this.logger.debug('Find operation', { object, query });
    
    const table = this.getTable(object);
    
    // 💡 Naive Implementation
    let results = [...table];

    // Simple limiting for demonstration
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    this.logger.debug('Find completed', { object, resultCount: results.length });
    return results;
  }

  async *findStream(object: string, query: QueryInput, options?: DriverOptions) {
    this.logger.debug('FindStream operation', { object });
    
    const results = await this.find(object, query, options);
    for (const record of results) {
      yield record;
    }
  }

  async findOne(object: string, query: QueryInput, options?: DriverOptions) {
    this.logger.debug('FindOne operation', { object, query });
    
    const results = await this.find(object, { ...query, limit: 1 }, options);
    const result = results[0] || null;
    
    this.logger.debug('FindOne completed', { object, found: !!result });
    return result;
  }

  async create(object: string, data: Record<string, any>, options?: DriverOptions) {
    this.logger.debug('Create operation', { object, hasData: !!data });
    
    const table = this.getTable(object);
    
    // COMPATIBILITY: Driver must return 'id' as string
    const newRecord = {
      id: data.id || this.generateId(),
      ...data,
      created_at: data.created_at || new Date(),
      updated_at: data.updated_at || new Date(),
    };

    table.push(newRecord);
    this.logger.debug('Record created', { object, id: newRecord.id, tableSize: table.length });
    return newRecord;
  }

  async update(object: string, id: string | number, data: Record<string, any>, options?: DriverOptions) {
    this.logger.debug('Update operation', { object, id });
    
    const table = this.getTable(object);
    const index = table.findIndex(r => r.id == id);
    
    if (index === -1) {
      this.logger.warn('Record not found for update', { object, id });
      throw new Error(`Record with ID ${id} not found in ${object}`);
    }

    const updatedRecord = {
      ...table[index],
      ...data,
      updated_at: new Date()
    };
    
    table[index] = updatedRecord;
    this.logger.debug('Record updated', { object, id });
    return updatedRecord;
  }

  async upsert(object: string, data: Record<string, any>, conflictKeys?: string[], options?: DriverOptions) {
    this.logger.debug('Upsert operation', { object, conflictKeys });
    
    const table = this.getTable(object);
    let existingRecord: any = null;

    if (data.id) {
        existingRecord = table.find(r => r.id === data.id);
    } else if (conflictKeys && conflictKeys.length > 0) {
        existingRecord = table.find(r => conflictKeys.every(key => r[key] === data[key]));
    }

    if (existingRecord) {
        this.logger.debug('Record exists, updating', { object, id: existingRecord.id });
        return this.update(object, existingRecord.id, data, options);
    } else {
        this.logger.debug('Record does not exist, creating', { object });
        return this.create(object, data, options);
    }
  }

  async delete(object: string, id: string | number, options?: DriverOptions) {
    this.logger.debug('Delete operation', { object, id });
    
    const table = this.getTable(object);
    const index = table.findIndex(r => r.id == id);
    
    if (index === -1) {
      this.logger.warn('Record not found for deletion', { object, id });
      return false;
    }

    table.splice(index, 1);
    this.logger.debug('Record deleted', { object, id, tableSize: table.length });
    return true;
  }

  async count(object: string, query?: QueryInput, options?: DriverOptions) {
    const count = this.getTable(object).length;
    this.logger.debug('Count operation', { object, count });
    return count;
  }

  // ===================================
  // Bulk Operations
  // ===================================

  async bulkCreate(object: string, dataArray: Record<string, any>[], options?: DriverOptions) {
    this.logger.debug('BulkCreate operation', { object, count: dataArray.length });
    const results = await Promise.all(dataArray.map(data => this.create(object, data, options)));
    this.logger.debug('BulkCreate completed', { object, count: results.length });
    return results;
  }

  async bulkUpdate(object: string, updates: { id: string | number, data: Record<string, any> }[], options?: DriverOptions) {
    this.logger.debug('BulkUpdate operation', { object, count: updates.length });
    const results = await Promise.all(updates.map(u => this.update(object, u.id, u.data, options)));
    this.logger.debug('BulkUpdate completed', { object, count: results.length });
    return results;
  }

  async bulkDelete(object: string, ids: (string | number)[], options?: DriverOptions) {
    this.logger.debug('BulkDelete operation', { object, count: ids.length });
    await Promise.all(ids.map(id => this.delete(object, id, options)));
    this.logger.debug('BulkDelete completed', { object, count: ids.length });
  }

  // ===================================
  // Schema & Transactions
  // ===================================

  async syncSchema(object: string, schema: any, options?: DriverOptions) {
    if (!this.db[object]) {
      this.db[object] = [];
      this.logger.info('Created in-memory table', { object });
    }
  }

  async dropTable(object: string, options?: DriverOptions) {
    if (this.db[object]) {
      const recordCount = this.db[object].length;
      delete this.db[object];
      this.logger.info('Dropped in-memory table', { object, recordCount });
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
