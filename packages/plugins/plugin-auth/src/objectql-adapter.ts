// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { IDataEngine } from '@objectstack/core';
import { createAdapter, type CleanedWhere, type JoinConfig } from 'better-auth/adapters';

/**
 * ObjectQL Adapter for better-auth
 * 
 * Bridges better-auth's database adapter interface with ObjectQL's IDataEngine.
 * This allows better-auth to use ObjectQL for data persistence instead of
 * third-party ORMs like drizzle-orm.
 * 
 * @param dataEngine - ObjectQL data engine instance
 * @returns better-auth Adapter instance
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

  return createAdapter({
    id: 'objectql',
    
    async create({ model, data, select }) {
      const objectName = toObjectName(model);
      const objectData = convertDataToObjectQL(data);
      
      const result = await dataEngine.insert(objectName, objectData);
      return convertDataFromObjectQL(result);
    },
    
    async findOne({ model, where, select, join }) {
      const objectName = toObjectName(model);
      const filter = convertWhere(where);
      
      const fields = select?.map(toFieldName);
      
      const result = await dataEngine.findOne(objectName, {
        filter,
        fields,
      });
      
      return result ? convertDataFromObjectQL(result) : null;
    },
    
    async findMany({ model, where, limit, offset, sortBy, join }) {
      const objectName = toObjectName(model);
      const filter = where ? convertWhere(where) : {};
      
      const sort = sortBy ? {
        field: toFieldName(sortBy.field),
        direction: sortBy.direction,
      } : undefined;
      
      const results = await dataEngine.find(objectName, {
        filter,
        limit: limit || 100,
        offset,
        sort: sort ? [sort] : undefined,
      });
      
      return results.map(convertDataFromObjectQL);
    },
    
    async count({ model, where }) {
      const objectName = toObjectName(model);
      const filter = where ? convertWhere(where) : {};
      
      return await dataEngine.count(objectName, { filter });
    },
    
    async update({ model, where, update }) {
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
      
      return result ? convertDataFromObjectQL(result) : null;
    },
    
    async updateMany({ model, where, update }) {
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
    
    async delete({ model, where }) {
      const objectName = toObjectName(model);
      const filter = convertWhere(where);
      
      // Find the record first to get its ID
      const record = await dataEngine.findOne(objectName, { filter });
      if (!record) {
        return;
      }
      
      await dataEngine.delete(objectName, { filter: { id: record.id } });
    },
    
    async deleteMany({ model, where }) {
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
  }, {
    // Adapter configuration
    adapterId: 'objectql',
    adapterName: 'ObjectQL',
    supportsNumericIds: false,
    supportsUUIDs: true,
    supportsJSON: true,
    supportsDates: true,
    supportsBooleans: true,
    supportsArrays: false,
    // ObjectQL handles ID generation
    disableIdGeneration: false,
  });
}
