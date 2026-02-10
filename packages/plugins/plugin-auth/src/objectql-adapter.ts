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
    create: async <T extends Record<string, any>>({ model, data }: { model: string; data: T; select?: string[] }): Promise<T> => {
      const objectName = toObjectName(model);
      const objectData = convertDataToObjectQL(data);
      
      const result = await dataEngine.insert(objectName, objectData);
      return convertDataFromObjectQL(result) as T;
    },
    
    findOne: async <T>({ model, where, select }: { model: string; where: CleanedWhere[]; select?: string[]; join?: any }): Promise<T | null> => {
      const objectName = toObjectName(model);
      const filter = convertWhere(where);
      
      const result = await dataEngine.findOne(objectName, {
        filter,
        select: select?.map(toFieldName),
      });
      
      return result ? convertDataFromObjectQL(result) as T : null;
    },
    
    findMany: async <T>({ model, where, limit, offset, sortBy }: { model: string; where?: CleanedWhere[]; limit: number; offset?: number; sortBy?: { field: string; direction: 'asc' | 'desc' }; join?: any }): Promise<T[]> => {
      const objectName = toObjectName(model);
      const filter = where ? convertWhere(where) : {};
      
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
      
      // Find the record first to get its ID
      const record = await dataEngine.findOne(objectName, { filter });
      if (!record) {
        return;
      }
      
      await dataEngine.delete(objectName, { filter: { id: record.id } });
    },
    
    deleteMany: async ({ model, where }: { model: string; where: CleanedWhere[] }): Promise<number> => {
      const objectName = toObjectName(model);
      const filter = convertWhere(where);
      
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
