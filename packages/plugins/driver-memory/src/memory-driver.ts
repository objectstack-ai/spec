// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { QueryAST, QueryInput } from '@objectstack/spec/data';
import { DriverOptions } from '@objectstack/spec/data';
import { DriverInterface, Logger, createLogger } from '@objectstack/core';
import { match, getValueByPath } from './memory-matcher.js';

/**
 * Configuration options for the InMemory driver.
 * Aligned with @objectstack/spec MemoryConfigSchema.
 */
export interface InMemoryDriverConfig {
  /** Optional: Initial data to populate the store */
  initialData?: Record<string, Record<string, unknown>[]>;
  /** Optional: Enable strict mode (throw on missing records) */
  strictMode?: boolean;
  /** Optional: Logger instance */
  logger?: Logger;
}

/**
 * Snapshot for in-memory transactions.
 */
interface MemoryTransaction {
  id: string;
  snapshot: Record<string, any[]>;
}

/**
 * In-Memory Driver for ObjectStack
 * 
 * A production-ready implementation of the ObjectStack Driver Protocol.
 * Stores data in JavaScript objects with support for:
 * - Full CRUD and bulk operations
 * - Filtering, sorting, pagination, aggregation
 * - Snapshot-based transactions (begin/commit/rollback)
 * - Field projection and distinct values
 * - Strict mode and initial data loading
 * 
 * Reference: objectql/packages/drivers/memory
 */
export class InMemoryDriver implements DriverInterface {
  name = 'com.objectstack.driver.memory';
  type = 'driver';
  version = '1.0.0';
  private config: InMemoryDriverConfig;
  private logger: Logger;
  private idCounters: Map<string, number> = new Map();
  private transactions: Map<string, MemoryTransaction> = new Map();

  constructor(config?: InMemoryDriverConfig) {
    this.config = config || {};
    this.logger = config?.logger || createLogger({ level: 'info', format: 'pretty' });
    this.logger.debug('InMemory driver instance created');
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
    transactions: true,          // Snapshot-based transactions
    
    // Query Operations
    queryFilters: true,          // Implemented via memory-matcher
    queryAggregations: true,     // Implemented
    querySorting: true,          // Implemented via JS sort
    queryPagination: true,       // Implemented
    queryWindowFunctions: false, // @planned: Window functions (ROW_NUMBER, RANK, etc.)
    querySubqueries: false,      // @planned: Subquery execution
    joins: false,                // @planned: In-memory join operations
    
    // Advanced Features
    fullTextSearch: false,       // @planned: Text tokenization + matching
    vectorSearch: false,         // @planned: Cosine similarity search
    geoSpatial: false,           // @planned: Distance/within calculations
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
    // Load initial data if provided
    if (this.config.initialData) {
      for (const [objectName, records] of Object.entries(this.config.initialData)) {
        const table = this.getTable(objectName);
        for (const record of records) {
          const id = (record as any).id || this.generateId(objectName);
          table.push({ ...record, id });
        }
      }
      this.logger.info('InMemory Database Connected with initial data', {
        tables: Object.keys(this.config.initialData).length,
      });
    } else {
      this.logger.info('InMemory Database Connected (Virtual)');
    }
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
    let results = table;

    // 1. Filter
    if (query.where) {
        results = results.filter(record => match(record, query.where));
    }

    // 1.5 Aggregation & Grouping
    if (query.groupBy || (query.aggregations && query.aggregations.length > 0)) {
        results = this.performAggregation(results, query);
    }

    // 2. Sort
    if (query.orderBy) {
        // Normalize sort to array
        const sortFields = Array.isArray(query.orderBy) ? query.orderBy : [query.orderBy];
        
        results.sort((a, b) => {
            for (const { field, order } of sortFields) {
                const valA = getValueByPath(a, field);
                const valB = getValueByPath(b, field);
                
                if (valA === valB) continue;
                
                const comparison = valA > valB ? 1 : -1;
                return order === 'desc' ? -comparison : comparison;
            }
            return 0;
        });
    }

    // 3. Pagination (Offset)
    if (query.offset) {
        results = results.slice(query.offset);
    }

    // 4. Pagination (Limit)
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    // 5. Field Projection
    if (query.fields && Array.isArray(query.fields) && query.fields.length > 0) {
      results = results.map(record => this.projectFields(record, query.fields as string[]));
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
    
    const newRecord = {
      id: data.id || this.generateId(object),
      ...data,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
    };

    table.push(newRecord);
    this.logger.debug('Record created', { object, id: newRecord.id, tableSize: table.length });
    return { ...newRecord };
  }

  async update(object: string, id: string | number, data: Record<string, any>, options?: DriverOptions) {
    this.logger.debug('Update operation', { object, id });
    
    const table = this.getTable(object);
    const index = table.findIndex(r => r.id == id);
    
    if (index === -1) {
      if (this.config.strictMode) {
        this.logger.warn('Record not found for update', { object, id });
        throw new Error(`Record with ID ${id} not found in ${object}`);
      }
      return null;
    }

    const updatedRecord = {
      ...table[index],
      ...data,
      id: table[index].id, // Preserve original ID
      created_at: table[index].created_at, // Preserve created_at
      updated_at: new Date().toISOString(),
    };
    
    table[index] = updatedRecord;
    this.logger.debug('Record updated', { object, id });
    return { ...updatedRecord };
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
      if (this.config.strictMode) {
        throw new Error(`Record with ID ${id} not found in ${object}`);
      }
      this.logger.warn('Record not found for deletion', { object, id });
      return false;
    }

    table.splice(index, 1);
    this.logger.debug('Record deleted', { object, id, tableSize: table.length });
    return true;
  }

  async count(object: string, query?: QueryInput, options?: DriverOptions) {
    let results = this.getTable(object);
    if (query?.where) {
        results = results.filter(record => match(record, query.where));
    }
    const count = results.length;
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
  
  async updateMany(object: string, query: QueryInput, data: Record<string, any>, options?: DriverOptions) {
      this.logger.debug('UpdateMany operation', { object, query });
      
      const table = this.getTable(object);
      let targetRecords = table;
      
      if (query && query.where) {
          targetRecords = targetRecords.filter(r => match(r, query.where));
      }
      
      const count = targetRecords.length;
      
      // Update each record
      for (const record of targetRecords) {
          // Find index in original table
          const index = table.findIndex(r => r.id === record.id);
          if (index !== -1) {
              const updated = {
                  ...table[index],
                  ...data,
                  updated_at: new Date()
              };
              table[index] = updated;
          }
      }
      
      this.logger.debug('UpdateMany completed', { object, count });
      return { count };
  }

  async deleteMany(object: string, query: QueryInput, options?: DriverOptions) {
      this.logger.debug('DeleteMany operation', { object, query });
      
      const table = this.getTable(object);
      const initialLength = table.length;
      
      // Filter IN PLACE or create new array?
      // Creating new array is safer for now.
      
      const remaining = table.filter(r => {
          if (!query || !query.where) return false; // Delete all? No, standard safety implies explicit empty filter for delete all.
          // Wait, normally deleteMany({}) deletes all.
          // Let's assume if query passed, use it.
          const matches = match(r, query.where);
          return !matches; // Keep if it DOES NOT match
      });
      
      this.db[object] = remaining;
      const count = initialLength - remaining.length;
      
      this.logger.debug('DeleteMany completed', { object, count });
      return { count };
  }

  // Compatibility aliases
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
  // Transaction Management
  // ===================================

  async beginTransaction() {
    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Deep-clone current database state as a snapshot
    const snapshot: Record<string, any[]> = {};
    for (const [table, records] of Object.entries(this.db)) {
      snapshot[table] = records.map(r => ({ ...r }));
    }

    const transaction: MemoryTransaction = { id: txId, snapshot };
    this.transactions.set(txId, transaction);
    this.logger.debug('Transaction started', { txId });
    return { id: txId };
  }

  async commit(txHandle?: unknown) {
    const txId = (txHandle as any)?.id;
    if (!txId || !this.transactions.has(txId)) {
      this.logger.warn('Commit called with unknown transaction');
      return;
    }
    // Data is already in the store; just remove the snapshot
    this.transactions.delete(txId);
    this.logger.debug('Transaction committed', { txId });
  }

  async rollback(txHandle?: unknown) {
    const txId = (txHandle as any)?.id;
    if (!txId || !this.transactions.has(txId)) {
      this.logger.warn('Rollback called with unknown transaction');
      return;
    }
    const tx = this.transactions.get(txId)!;
    // Restore the snapshot
    this.db = tx.snapshot;
    this.transactions.delete(txId);
    this.logger.debug('Transaction rolled back', { txId });
  }

  // ===================================
  // Utility Methods
  // ===================================

  /**
   * Remove all data from the store.
   */
  async clear() {
    this.db = {};
    this.idCounters.clear();
    this.logger.debug('All data cleared');
  }

  /**
   * Get total number of records across all tables.
   */
  getSize(): number {
    return Object.values(this.db).reduce((sum, table) => sum + table.length, 0);
  }

  /**
   * Get distinct values for a field, optionally filtered.
   */
  async distinct(object: string, field: string, query?: QueryInput): Promise<any[]> {
    let records = this.getTable(object);
    if (query?.where) {
      records = records.filter(record => match(record, query.where));
    }
    const values = new Set<any>();
    for (const record of records) {
      const value = getValueByPath(record, field);
      if (value !== undefined && value !== null) {
        values.add(value);
      }
    }
    return Array.from(values);
  }

  // ===================================
  // Aggregation Logic
  // ===================================

  private performAggregation(records: any[], query: QueryInput): any[] {
    const { groupBy, aggregations } = query;
    const groups: Map<string, any[]> = new Map();

    // 1. Group records
    if (groupBy && groupBy.length > 0) {
        for (const record of records) {
            // Create a composite key from group values
            const keyParts = groupBy.map(field => {
                const val = getValueByPath(record, field);
                return val === undefined || val === null ? 'null' : String(val);
            });
            const key = JSON.stringify(keyParts);
            
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(record);
        }
    } else {
        groups.set('all', records);
    }

    // 2. Compute aggregates for each group
    const resultRows: any[] = [];
    
    for (const [_key, groupRecords] of groups.entries()) {
        const row: any = {};
        
        // A. Add Group fields to row (if groupBy exists)
        if (groupBy && groupBy.length > 0) {
             if (groupRecords.length > 0) {
                const firstRecord = groupRecords[0];
                for (const field of groupBy) {
                     this.setValueByPath(row, field, getValueByPath(firstRecord, field));
                }
             }
        }
        
        // B. Compute Aggregations
        if (aggregations) {
            for (const agg of aggregations) {
                 const value = this.computeAggregate(groupRecords, agg);
                 row[agg.alias] = value;
            }
        }
        
        resultRows.push(row);
    }
    
    return resultRows;
  }
  
  private computeAggregate(records: any[], agg: any): any {
      const { function: func, field } = agg;
      
      const values = field ? records.map(r => getValueByPath(r, field)) : [];
      
      switch (func) {
          case 'count':
              if (!field || field === '*') return records.length;
              return values.filter(v => v !== null && v !== undefined).length;
              
          case 'sum':
          case 'avg': {
              const nums = values.filter(v => typeof v === 'number');
              const sum = nums.reduce((a, b) => a + b, 0);
              if (func === 'sum') return sum;
              return nums.length > 0 ? sum / nums.length : null;
          }
              
          case 'min': {
              // Handle comparable values
              const valid = values.filter(v => v !== null && v !== undefined);
              if (valid.length === 0) return null;
              // Works for numbers and strings
              return valid.reduce((min, v) => (v < min ? v : min), valid[0]);
          }

          case 'max': {
              const valid = values.filter(v => v !== null && v !== undefined);
              if (valid.length === 0) return null;
              return valid.reduce((max, v) => (v > max ? v : max), valid[0]);
          }

          default:
              return null;
      }
  }

  private setValueByPath(obj: any, path: string, value: any) {
      const parts = path.split('.');
      let current = obj;
      for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current[part]) current[part] = {};
          current = current[part];
      }
      current[parts[parts.length - 1]] = value;
  }

  // ===================================
  // Schema Management
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

  // ===================================
  // Helpers
  // ===================================

  /**
   * Project specific fields from a record.
   */
  private projectFields(record: any, fields: string[]): any {
    const result: any = {};
    for (const field of fields) {
      const value = getValueByPath(record, field);
      if (value !== undefined) {
        result[field] = value;
      }
    }
    // Always include id if not explicitly listed
    if (!fields.includes('id') && record.id !== undefined) {
      result.id = record.id;
    }
    return result;
  }

  private getTable(name: string) {
    if (!this.db[name]) {
      this.db[name] = [];
    }
    return this.db[name];
  }

  private generateId(objectName?: string) {
    const key = objectName || '_global';
    const counter = (this.idCounters.get(key) || 0) + 1;
    this.idCounters.set(key, counter);
    const timestamp = Date.now();
    return `${key}-${timestamp}-${counter}`;
  }
}
