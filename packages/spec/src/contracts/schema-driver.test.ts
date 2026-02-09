import { describe, it, expect } from 'vitest';
import type { ISchemaDriver } from './schema-driver';

describe('Schema Driver Contract', () => {
  describe('ISchemaDriver interface', () => {
    it('should allow a full implementation with all methods', () => {
      const executed: string[] = [];

      const driver: ISchemaDriver = {
        createCollection: async (objectName, _schema) => {
          executed.push(`createCollection:${objectName}`);
        },
        dropCollection: async (objectName) => {
          executed.push(`dropCollection:${objectName}`);
        },
        addColumn: async (objectName, fieldName, _field) => {
          executed.push(`addColumn:${objectName}.${fieldName}`);
        },
        modifyColumn: async (objectName, fieldName, _field) => {
          executed.push(`modifyColumn:${objectName}.${fieldName}`);
        },
        dropColumn: async (objectName, fieldName) => {
          executed.push(`dropColumn:${objectName}.${fieldName}`);
        },
        createIndex: async (objectName, indexName, _fields) => {
          executed.push(`createIndex:${objectName}.${indexName}`);
        },
        dropIndex: async (objectName, indexName) => {
          executed.push(`dropIndex:${objectName}.${indexName}`);
        },
        executeRaw: async (statement) => {
          executed.push(`executeRaw:${statement}`);
          return null;
        },
      };

      expect(typeof driver.createCollection).toBe('function');
      expect(typeof driver.dropCollection).toBe('function');
      expect(typeof driver.addColumn).toBe('function');
      expect(typeof driver.modifyColumn).toBe('function');
      expect(typeof driver.dropColumn).toBe('function');
      expect(typeof driver.createIndex).toBe('function');
      expect(typeof driver.dropIndex).toBe('function');
      expect(typeof driver.executeRaw).toBe('function');
    });

    it('should create and drop collections', async () => {
      const collections = new Set<string>();

      const driver: ISchemaDriver = {
        createCollection: async (objectName) => { collections.add(objectName); },
        dropCollection: async (objectName) => { collections.delete(objectName); },
        addColumn: async () => {},
        modifyColumn: async () => {},
        dropColumn: async () => {},
        createIndex: async () => {},
        dropIndex: async () => {},
        executeRaw: async () => null,
      };

      await driver.createCollection('users');
      await driver.createCollection('orders');
      expect(collections.size).toBe(2);

      await driver.dropCollection('orders');
      expect(collections.size).toBe(1);
      expect(collections.has('users')).toBe(true);
    });

    it('should add, modify, and drop columns', async () => {
      const columns = new Map<string, any>();

      const driver: ISchemaDriver = {
        createCollection: async () => {},
        dropCollection: async () => {},
        addColumn: async (_obj, fieldName, field) => {
          columns.set(fieldName, field);
        },
        modifyColumn: async (_obj, fieldName, field) => {
          columns.set(fieldName, field);
        },
        dropColumn: async (_obj, fieldName) => {
          columns.delete(fieldName);
        },
        createIndex: async () => {},
        dropIndex: async () => {},
        executeRaw: async () => null,
      };

      const textField = { name: 'email', label: 'Email', type: 'text' } as any;
      await driver.addColumn('users', 'email', textField);
      expect(columns.has('email')).toBe(true);

      const updatedField = { ...textField, maxLength: 255 } as any;
      await driver.modifyColumn('users', 'email', updatedField);
      expect(columns.get('email').maxLength).toBe(255);

      await driver.dropColumn('users', 'email');
      expect(columns.has('email')).toBe(false);
    });

    it('should create and drop indexes', async () => {
      const indexes = new Map<string, string[]>();

      const driver: ISchemaDriver = {
        createCollection: async () => {},
        dropCollection: async () => {},
        addColumn: async () => {},
        modifyColumn: async () => {},
        dropColumn: async () => {},
        createIndex: async (_obj, indexName, fields) => {
          indexes.set(indexName, fields);
        },
        dropIndex: async (_obj, indexName) => {
          indexes.delete(indexName);
        },
        executeRaw: async () => null,
      };

      await driver.createIndex('users', 'idx_email', ['email']);
      expect(indexes.get('idx_email')).toEqual(['email']);

      await driver.createIndex('users', 'idx_name_email', ['name', 'email']);
      expect(indexes.get('idx_name_email')).toEqual(['name', 'email']);

      await driver.dropIndex('users', 'idx_email');
      expect(indexes.has('idx_email')).toBe(false);
      expect(indexes.has('idx_name_email')).toBe(true);
    });

    it('should execute raw statements', async () => {
      const driver: ISchemaDriver = {
        createCollection: async () => {},
        dropCollection: async () => {},
        addColumn: async () => {},
        modifyColumn: async () => {},
        dropColumn: async () => {},
        createIndex: async () => {},
        dropIndex: async () => {},
        executeRaw: async (statement) => {
          if (statement === 'SELECT 1') return [{ result: 1 }];
          return null;
        },
      };

      const result = await driver.executeRaw('SELECT 1');
      expect(result).toEqual([{ result: 1 }]);

      const empty = await driver.executeRaw('DROP TABLE IF EXISTS temp');
      expect(empty).toBeNull();
    });
  });
});
