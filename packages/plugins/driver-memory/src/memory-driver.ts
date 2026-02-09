// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { QueryAST, QueryInput } from '@objectstack/spec/data';
import { DriverOptions } from '@objectstack/spec/data';
import { DriverInterface, Logger, createLogger } from '@objectstack/core';
import { match, getValueByPath } from './memory-matcher.js';

/**
 * Example: In-Memory Driver
 * 
 * A minimal reference implementation of the ObjectStack Driver Protocol.
 * This driver stores data in a simple JavaScript object (Heap).
 */
export class InMemoryDriver implements DriverInterface {
  name = 'com.objectstack.driver.memory';
  type = 'driver';
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
    queryFilters: true,          // Implemented via memory-matcher
    queryAggregations: true,    // Implemented
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
        // No grouping -> Single group containing all records
        // If aggregation is requested without group by, it runs on whole set (even if empty)
        if (aggregations && aggregations.length > 0) {
             groups.set('all', records);
        } else {
             // Should not be here if performAggregation called correctly
             groups.set('all', records);
        }
    }

    // 2. Compute aggregates for each group
    const resultRows: any[] = [];
    
    for (const [key, groupRecords] of groups.entries()) {
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
