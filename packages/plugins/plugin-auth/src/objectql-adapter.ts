// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { IDataEngine } from '@objectstack/core';
import type { CleanedWhere } from 'better-auth/adapters';
import { SystemObjectName } from '@objectstack/spec/system';

/**
 * Mapping from better-auth model names to ObjectStack protocol object names.
 *
 * better-auth uses hardcoded model names ('user', 'session', 'account', 'verification')
 * while ObjectStack's protocol layer uses `sys_` prefixed names. This map bridges the two.
 */
export const AUTH_MODEL_TO_PROTOCOL: Record<string, string> = {
  user: SystemObjectName.USER,
  session: SystemObjectName.SESSION,
  account: SystemObjectName.ACCOUNT,
  verification: SystemObjectName.VERIFICATION,
};

/**
 * Resolve a better-auth model name to the ObjectStack protocol object name.
 * Falls back to the original model name for custom / non-core models.
 */
export function resolveProtocolName(model: string): string {
  return AUTH_MODEL_TO_PROTOCOL[model] ?? model;
}

/**
 * ObjectQL Adapter for better-auth
 * 
 * Bridges better-auth's database adapter interface with ObjectQL's IDataEngine.
 * This allows better-auth to use ObjectQL for data persistence instead of
 * third-party ORMs like drizzle-orm.
 * 
 * Model names from better-auth (e.g. 'user') are automatically mapped to
 * ObjectStack protocol names (e.g. 'sys_user') via {@link AUTH_MODEL_TO_PROTOCOL}.
 * 
 * @param dataEngine - ObjectQL data engine instance
 * @returns better-auth CustomAdapter
 */
export function createObjectQLAdapter(dataEngine: IDataEngine) {
  /**
   * Convert better-auth where clause to ObjectQL query format
   */
  function convertWhere(where: CleanedWhere[]): Record<string, any> {
    const filter: Record<string, any> = {};
    
    for (const condition of where) {
      // Use field names as-is (no conversion needed)
      const fieldName = condition.field;
      
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

  return {
    create: async <T extends Record<string, any>>({ model, data, select: _select }: { model: string; data: T; select?: string[] }): Promise<T> => {
      const objectName = resolveProtocolName(model);
      
      // Note: select parameter is currently not supported by ObjectQL's insert operation
      // The full record is always returned after insertion
      const result = await dataEngine.insert(objectName, data);
      return result as T;
    },
    
    findOne: async <T>({ model, where, select, join: _join }: { model: string; where: CleanedWhere[]; select?: string[]; join?: any }): Promise<T | null> => {
      const objectName = resolveProtocolName(model);
      const filter = convertWhere(where);
      
      // Note: join parameter is not currently supported by ObjectQL's findOne operation
      // Joins/populate functionality is planned for future ObjectQL releases
      // For now, related data must be fetched separately
      
      const result = await dataEngine.findOne(objectName, {
        filter,
        select,
      });
      
      return result ? result as T : null;
    },
    
    findMany: async <T>({ model, where, limit, offset, sortBy, join: _join }: { model: string; where?: CleanedWhere[]; limit: number; offset?: number; sortBy?: { field: string; direction: 'asc' | 'desc' }; join?: any }): Promise<T[]> => {
      const objectName = resolveProtocolName(model);
      const filter = where ? convertWhere(where) : {};
      
      // Note: join parameter is not currently supported by ObjectQL's find operation
      // Joins/populate functionality is planned for future ObjectQL releases
      
      const sort = sortBy ? [{
        field: sortBy.field,
        order: sortBy.direction as 'asc' | 'desc',
      }] : undefined;
      
      const results = await dataEngine.find(objectName, {
        filter,
        limit: limit || 100,
        skip: offset,
        sort,
      });
      
      return results as T[];
    },
    
    count: async ({ model, where }: { model: string; where?: CleanedWhere[] }): Promise<number> => {
      const objectName = resolveProtocolName(model);
      const filter = where ? convertWhere(where) : {};
      
      return await dataEngine.count(objectName, { filter });
    },
    
    update: async <T>({ model, where, update }: { model: string; where: CleanedWhere[]; update: Record<string, any> }): Promise<T | null> => {
      const objectName = resolveProtocolName(model);
      const filter = convertWhere(where);
      
      // Find the record first to get its ID
      const record = await dataEngine.findOne(objectName, { filter });
      if (!record) {
        return null;
      }
      
      const result = await dataEngine.update(objectName, {
        ...update,
        id: record.id,
      });
      
      return result ? result as T : null;
    },
    
    updateMany: async ({ model, where, update }: { model: string; where: CleanedWhere[]; update: Record<string, any> }): Promise<number> => {
      const objectName = resolveProtocolName(model);
      const filter = convertWhere(where);
      
      // Note: Sequential updates are used here because ObjectQL's IDataEngine interface
      // requires an ID for updates. A future optimization could use a bulk update
      // operation if ObjectQL adds support for filter-based updates without IDs.
      
      // Find all matching records
      const records = await dataEngine.find(objectName, { filter });
      
      // Update each record
      for (const record of records) {
        await dataEngine.update(objectName, {
          ...update,
          id: record.id,
        });
      }
      
      return records.length;
    },
    
    delete: async ({ model, where }: { model: string; where: CleanedWhere[] }): Promise<void> => {
      const objectName = resolveProtocolName(model);
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
      const objectName = resolveProtocolName(model);
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
