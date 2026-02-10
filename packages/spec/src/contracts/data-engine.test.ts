import { describe, it, expect } from 'vitest';
import type { IDataEngine, DriverInterface } from './data-engine';

describe('Data Engine Contract', () => {
  describe('IDataEngine interface', () => {
    it('should allow a minimal implementation with required methods', () => {
      const engine: IDataEngine = {
        find: async (_objectName, _query?) => [],
        findOne: async (_objectName, _query?) => null,
        insert: async (_objectName, data, _options?) => data,
        update: async (_objectName, data, _options?) => data,
        delete: async (_objectName, _options?) => { return { deleted: 1 }; },
        count: async (_objectName, _query?) => 0,
        aggregate: async (_objectName, _query) => [],
      };

      expect(typeof engine.find).toBe('function');
      expect(typeof engine.findOne).toBe('function');
      expect(typeof engine.insert).toBe('function');
      expect(typeof engine.update).toBe('function');
      expect(typeof engine.delete).toBe('function');
      expect(typeof engine.count).toBe('function');
      expect(typeof engine.aggregate).toBe('function');
    });

    it('should perform CRUD operations', async () => {
      const store: any[] = [];

      const engine: IDataEngine = {
        find: async () => [...store],
        findOne: async () => store[0] || null,
        insert: async (_obj, data) => {
          store.push(data);
          return data;
        },
        update: async (_obj, data) => data,
        delete: async () => ({ deleted: 1 }),
        count: async () => store.length,
        aggregate: async () => [],
      };

      await engine.insert('users', { id: 1, name: 'Alice' });
      await engine.insert('users', { id: 2, name: 'Bob' });

      const all = await engine.find('users');
      expect(all).toHaveLength(2);

      const first = await engine.findOne('users');
      expect(first).toEqual({ id: 1, name: 'Alice' });

      const count = await engine.count('users');
      expect(count).toBe(2);
    });

    it('should support optional vectorFind', async () => {
      const engine: IDataEngine = {
        find: async () => [],
        findOne: async () => null,
        insert: async (_obj, data) => data,
        update: async (_obj, data) => data,
        delete: async () => ({}),
        count: async () => 0,
        aggregate: async () => [],
        vectorFind: async (_objectName, _vector, options?) => {
          return [{ id: 1, score: 0.95 }].slice(0, options?.limit ?? 10);
        },
      };

      expect(engine.vectorFind).toBeDefined();
      const results = await engine.vectorFind!('documents', [0.1, 0.2, 0.3], {
        limit: 5,
        threshold: 0.8,
      });
      expect(results).toHaveLength(1);
      expect(results[0].score).toBe(0.95);
    });

    it('should support optional batch operations', async () => {
      const engine: IDataEngine = {
        find: async () => [],
        findOne: async () => null,
        insert: async (_obj, data) => data,
        update: async (_obj, data) => data,
        delete: async () => ({}),
        count: async () => 0,
        aggregate: async () => [],
        batch: async (requests, options?) => {
          return requests.map(() => ({ success: true }));
        },
      };

      expect(engine.batch).toBeDefined();
      const results = await engine.batch!(
        [
          { object: 'users', operation: 'insert', data: { name: 'Alice' } } as any,
          { object: 'users', operation: 'insert', data: { name: 'Bob' } } as any,
        ],
        { transaction: true }
      );
      expect(results).toHaveLength(2);
    });

    it('should support optional execute (escape hatch)', async () => {
      const engine: IDataEngine = {
        find: async () => [],
        findOne: async () => null,
        insert: async (_obj, data) => data,
        update: async (_obj, data) => data,
        delete: async () => ({}),
        count: async () => 0,
        aggregate: async () => [],
        execute: async (command, options?) => {
          return { raw: true, command };
        },
      };

      expect(engine.execute).toBeDefined();
      const result = await engine.execute!('SELECT * FROM users', { timeout: 5000 });
      expect(result.raw).toBe(true);
    });
  });

  describe('DriverInterface', () => {
    it('should allow a minimal implementation with required methods', () => {
      const driver: DriverInterface = {
        name: 'postgres',
        version: '1.0.0',
        connect: async () => {},
        disconnect: async () => {},
        find: async (_object, _query, _options?) => [],
        findOne: async (_object, _query, _options?) => null,
        create: async (_object, data, _options?) => data,
        update: async (_object, _id, data, _options?) => data,
        delete: async (_object, _id, _options?) => ({ deleted: true }),
      };

      expect(driver.name).toBe('postgres');
      expect(driver.version).toBe('1.0.0');
      expect(typeof driver.connect).toBe('function');
      expect(typeof driver.disconnect).toBe('function');
    });

    it('should connect and disconnect', async () => {
      let connected = false;

      const driver: DriverInterface = {
        name: 'mongo',
        version: '2.0.0',
        connect: async () => { connected = true; },
        disconnect: async () => { connected = false; },
        find: async () => [],
        findOne: async () => null,
        create: async (_obj, data) => data,
        update: async (_obj, _id, data) => data,
        delete: async () => ({}),
      };

      await driver.connect();
      expect(connected).toBe(true);

      await driver.disconnect();
      expect(connected).toBe(false);
    });

    it('should support optional bulk operations', async () => {
      const driver: DriverInterface = {
        name: 'postgres',
        version: '1.0.0',
        connect: async () => {},
        disconnect: async () => {},
        find: async () => [],
        findOne: async () => null,
        create: async (_obj, data) => data,
        update: async (_obj, _id, data) => data,
        delete: async () => ({}),
        bulkCreate: async (_obj, data) => data,
        updateMany: async (_obj, _query, _data) => ({ modified: 5 }),
        deleteMany: async (_obj, _query) => ({ deleted: 3 }),
      };

      expect(driver.bulkCreate).toBeDefined();
      expect(driver.updateMany).toBeDefined();
      expect(driver.deleteMany).toBeDefined();

      const bulk = await driver.bulkCreate!('users', [{ name: 'A' }, { name: 'B' }]);
      expect(bulk).toHaveLength(2);
    });

    it('should support optional count and execute', async () => {
      const driver: DriverInterface = {
        name: 'sqlite',
        version: '3.0.0',
        connect: async () => {},
        disconnect: async () => {},
        find: async () => [],
        findOne: async () => null,
        create: async (_obj, data) => data,
        update: async (_obj, _id, data) => data,
        delete: async () => ({}),
        count: async (_obj, _query) => 42,
        execute: async (command, _params?) => ({ rows: [], command }),
      };

      expect(await driver.count!('users', {} as any)).toBe(42);
      const result = await driver.execute!('PRAGMA table_info(users)');
      expect(result.command).toBe('PRAGMA table_info(users)');
    });
  });
});
