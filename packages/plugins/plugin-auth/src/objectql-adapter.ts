// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { IDataEngine } from '@objectstack/core';
import type { CleanedWhere } from 'better-auth/adapters';

/**
 * ObjectQL Adapter for better-auth
 * 
 * Bridges better-auth's database adapter interface with ObjectQL's IDataEngine.
 * This allows better-auth to use ObjectQL for data persistence instead of
 * third-party ORMs like drizzle-orm.
 * 
 * @param dataEngine - ObjectQL data engine instance
 * @returns better-auth CustomAdapter
 */
export function createObjectQLAdapter(dataEngine: IDataEngine) {
  /**
   * Convert better-auth table names to ObjectQL object names
   * better-auth uses camelCase, ObjectQL uses snake_case
   */
  function toObjectName(tableName: string): string {
    // Map better-auth table names to our object names
    const tableMap: Record<string, string> = {
      'user': 'auth_user',
      'session': 'auth_session',
      'account': 'auth_account',
      'verification': 'auth_verification',
    };
    return tableMap[tableName] || `auth_${tableName}`;
  }

  /**
   * Convert better-auth field names to ObjectQL field names
   * better-auth uses camelCase, ObjectQL uses snake_case
   */
  function toFieldName(fieldName: string): string {
    // Convert camelCase to snake_case
    return fieldName.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  /**
   * Convert ObjectQL field names back to better-auth field names
   * ObjectQL uses snake_case, better-auth uses camelCase
   */
  function fromFieldName(fieldName: string): string {
    // Convert snake_case to camelCase
    return fieldName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Convert better-auth where clause to ObjectQL query format
   */
  function convertWhere(where: CleanedWhere[]): Record<string, any> {
    const filter: Record<string, any> = {};
    
    for (const condition of where) {
      const fieldName = toFieldName(condition.field);
      
      if (condition.operator === 'eq') {
        filter[fieldName] = condition.value;
      } else if (condition.operator === 'ne') {
        filter[fieldName] = { $ne: condition.value };
      } else if (condition.operator === 'in') {
        filter[fieldName] = { $in: condition.value };
      } else if (condition.operator === 'gt') {
        filter[fieldName] = { $gt: condition.value };
      } else if (condition.operator === 'gte') {
        filter[fieldName] = { $gte: condition.value };
      } else if (condition.operator === 'lt') {
        filter[fieldName] = { $lt: condition.value };
      } else if (condition.operator === 'lte') {
        filter[fieldName] = { $lte: condition.value };
      } else if (condition.operator === 'contains') {
        filter[fieldName] = { $regex: condition.value };
      }
    }
    
    return filter;
  }

  /**
   * Convert data from better-auth format to ObjectQL format
   */
  function convertDataToObjectQL(data: Record<string, any>): Record<string, any> {
    const converted: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      converted[toFieldName(key)] = value;
    }
    return converted;
  }

  /**
   * Convert data from ObjectQL format to better-auth format
   */
  function convertDataFromObjectQL(data: Record<string, any>): Record<string, any> {
    const converted: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      converted[fromFieldName(key)] = value;
    }
    return converted;
  }

  return {
    create: async <T extends Record<string, any>>({ model, data, select: _select }: { model: string; data: T; select?: string[] }): Promise<T> => {
      const objectName = toObjectName(model);
      const objectData = convertDataToObjectQL(data);
      
      // Note: select parameter is currently not supported by ObjectQL's insert operation
      // The full record is always returned after insertion
      const result = await dataEngine.insert(objectName, objectData);
      return convertDataFromObjectQL(result) as T;
    },
    
    findOne: async <T>({ model, where, select, join: _join }: { model: string; where: CleanedWhere[]; select?: string[]; join?: any }): Promise<T | null> => {
      const objectName = toObjectName(model);
      const filter = convertWhere(where);
      
      // Note: join parameter is not currently supported by ObjectQL's findOne operation
      // Joins/populate functionality is planned for future ObjectQL releases
      // For now, related data must be fetched separately
      
      const result = await dataEngine.findOne(objectName, {
        filter,
        select: select?.map(toFieldName),
      });
      
      return result ? convertDataFromObjectQL(result) as T : null;
    },
    
    findMany: async <T>({ model, where, limit, offset, sortBy, join: _join }: { model: string; where?: CleanedWhere[]; limit: number; offset?: number; sortBy?: { field: string; direction: 'asc' | 'desc' }; join?: any }): Promise<T[]> => {
      const objectName = toObjectName(model);
      const filter = where ? convertWhere(where) : {};
      
      // Note: join parameter is not currently supported by ObjectQL's find operation
      // Joins/populate functionality is planned for future ObjectQL releases
      
      const sort = sortBy ? [{
        field: toFieldName(sortBy.field),
        order: sortBy.direction as 'asc' | 'desc',
      }] : undefined;
      
      const results = await dataEngine.find(objectName, {
        filter,
        limit: limit || 100,
        skip: offset,
        sort,
      });
      
      return results.map(r => convertDataFromObjectQL(r)) as T[];
    },
    
    count: async ({ model, where }: { model: string; where?: CleanedWhere[] }): Promise<number> => {
      const objectName = toObjectName(model);
      const filter = where ? convertWhere(where) : {};
      
      return await dataEngine.count(objectName, { filter });
    },
    
    update: async <T>({ model, where, update }: { model: string; where: CleanedWhere[]; update: Record<string, any> }): Promise<T | null> => {
      const objectName = toObjectName(model);
      const filter = convertWhere(where);
      const updateData = convertDataToObjectQL(update);
      
      // Find the record first to get its ID
      const record = await dataEngine.findOne(objectName, { filter });
      if (!record) {
        return null;
      }
      
      const result = await dataEngine.update(objectName, {
        ...updateData,
        id: record.id,
      });
      
      return result ? convertDataFromObjectQL(result) as T : null;
    },
    
    updateMany: async ({ model, where, update }: { model: string; where: CleanedWhere[]; update: Record<string, any> }): Promise<number> => {
      const objectName = toObjectName(model);
      const filter = convertWhere(where);
      const updateData = convertDataToObjectQL(update);
      
      // Note: Sequential updates are used here because ObjectQL's IDataEngine interface
      // requires an ID for updates. A future optimization could use a bulk update
      // operation if ObjectQL adds support for filter-based updates without IDs.
      
      // Find all matching records
      const records = await dataEngine.find(objectName, { filter });
      
      // Update each record
      for (const record of records) {
        await dataEngine.update(objectName, {
          ...updateData,
          id: record.id,
        });
      }
      
      return records.length;
    },
    
    delete: async ({ model, where }: { model: string; where: CleanedWhere[] }): Promise<void> => {
      const objectName = toObjectName(model);
      const filter = convertWhere(where);
      
      // Note: We need to find the record first to get its ID because ObjectQL's
      // delete operation requires an ID. Direct filter-based delete would be more
      // efficient if supported by ObjectQL in the future.
      const record = await dataEngine.findOne(objectName, { filter });
      if (!record) {
        return;
      }
      
      await dataEngine.delete(objectName, { filter: { id: record.id } });
    },
    
    deleteMany: async ({ model, where }: { model: string; where: CleanedWhere[] }): Promise<number> => {
      const objectName = toObjectName(model);
      const filter = convertWhere(where);
      
      // Note: Sequential deletes are used here because ObjectQL's delete operation
      // requires an ID in the filter. A future optimization could use a single
      // delete call with the original filter if ObjectQL supports it.
      
      // Find all matching records
      const records = await dataEngine.find(objectName, { filter });
      
      // Delete each record
      for (const record of records) {
        await dataEngine.delete(objectName, { filter: { id: record.id } });
      }
      
      return records.length;
    },
  };
}
