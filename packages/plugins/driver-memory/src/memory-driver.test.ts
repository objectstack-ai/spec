import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InMemoryDriver } from './memory-driver.js';

describe('InMemoryDriver', () => {
  let driver: InMemoryDriver;
  const testTable = 'test_table';

  beforeEach(async () => {
    driver = new InMemoryDriver();
    await driver.connect();
  });

  describe('Lifecycle', () => {
    it('should connect successfully', async () => {
      expect(driver.checkHealth()).resolves.toBe(true);
    });

    it('should clear data on disconnect', async () => {
      await driver.create(testTable, { id: '1', name: 'test' });
      await driver.disconnect();
      const results = await driver.find(testTable, { fields: ['id'], object: testTable });
      expect(results).toHaveLength(0);
    });
  });

  describe('Plugin Installation', () => {
      it('should register driver with engine', () => {
          const registerDriverFn = vi.fn();
          const mockEngine = {
              ql: {
                  registerDriver: registerDriverFn
              }
          };
          
          driver.install({ engine: mockEngine });
          expect(registerDriverFn).toHaveBeenCalledWith(driver);
      });
      
       it('should handle missing engine gracefully', () => {
          const mockCtx = {}; // No engine
          // Should not throw
          driver.install(mockCtx);
      });
  });

  describe('CRUD Operations', () => {
    it('should create and find records', async () => {
      const data = { id: '1', name: 'Alice', age: 30 };
      const created = await driver.create(testTable, data);
      expect(created.id).toBe('1');

      const results = await driver.find(testTable, { 
          fields: ['id', 'name', 'age'],
          object: testTable
      });
      
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
      expect(results[0].name).toBe('Alice');
    });

    it('should support updating records by ID', async () => {
      await driver.create(testTable, { id: '1', name: 'Bob', active: true });
      
      const updateResult = await driver.update(
          testTable, 
          '1', 
          { active: false }
      );
      
      expect(updateResult.active).toBe(false);
      
      const results = await driver.find(testTable, { fields: ['active'], object: testTable });
      expect(results[0].active).toBe(false);
    });

    it('should support deleting records by ID', async () => {
       await driver.create(testTable, { id: '1', name: 'Charlie' });
       await driver.create(testTable, { id: '2', name: 'David' });
       
       const deleteResult = await driver.delete(testTable, '1');
       expect(deleteResult).toBe(true);
       
       const results = await driver.find(testTable, { fields: ['name'], object: testTable });
       expect(results).toHaveLength(1);
       expect(results[0].name).toBe('David');
    });

    it('should return a copy of created record (immutability)', async () => {
      const created = await driver.create(testTable, { id: '1', name: 'Alice' });
      created.name = 'Modified';
      
      const found = await driver.find(testTable, { object: testTable });
      expect(found[0].name).toBe('Alice');
    });

    it('should preserve created_at on update', async () => {
      const created = await driver.create(testTable, { id: '1', name: 'Alice' });
      const originalCreatedAt = created.created_at;
      
      const updated = await driver.update(testTable, '1', { name: 'Alice Updated' });
      expect(updated.created_at).toBe(originalCreatedAt);
      expect(updated.name).toBe('Alice Updated');
    });
  });
  
  describe('Query Capability', () => {
      it('should filter results', async () => {
          await driver.create(testTable, { id: '1', role: 'admin' });
          await driver.create(testTable, { id: '2', role: 'user' });
          await driver.create(testTable, { id: '3', role: 'user' });
          
          const results = await driver.find(testTable, {
              fields: ['id'],
              object: testTable,
              where: { role: 'user' }
          });
          
          expect(results).toHaveLength(2);
      });

      it('should limit results', async () => {
           await driver.create(testTable, { id: '1' });
           await driver.create(testTable, { id: '2' });
           await driver.create(testTable, { id: '3' });
          
          const results = await driver.find(testTable, {
              fields: ['id'],
              object: testTable,
              limit: 2
          });
          
          expect(results).toHaveLength(2);
      });

      it('should project specific fields', async () => {
        await driver.create(testTable, { id: '1', name: 'Alice', age: 30, role: 'admin' });
        
        const results = await driver.find(testTable, {
          fields: ['name', 'age'],
          object: testTable,
        });
        
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Alice');
        expect(results[0].age).toBe(30);
        expect(results[0].id).toBe('1'); // id always included
        expect(results[0].role).toBeUndefined();
      });
  });

  describe('Initial Data', () => {
    it('should load initial data on connect', async () => {
      const driverWithData = new InMemoryDriver({
        initialData: {
          users: [
            { id: '1', name: 'Alice' },
            { id: '2', name: 'Bob' },
          ],
          posts: [
            { id: '1', title: 'Hello World' },
          ],
        },
      });
      await driverWithData.connect();

      const users = await driverWithData.find('users', { object: 'users' });
      expect(users).toHaveLength(2);
      expect(users[0].name).toBe('Alice');

      const posts = await driverWithData.find('posts', { object: 'posts' });
      expect(posts).toHaveLength(1);
    });

    it('should generate IDs for initial data without IDs', async () => {
      const driverWithData = new InMemoryDriver({
        initialData: {
          items: [{ name: 'Widget' }],
        },
      });
      await driverWithData.connect();

      const items = await driverWithData.find('items', { object: 'items' });
      expect(items).toHaveLength(1);
      expect(items[0].id).toBeDefined();
      expect(typeof items[0].id).toBe('string');
    });
  });

  describe('Strict Mode', () => {
    it('should throw on update of missing record in strict mode', async () => {
      const strictDriver = new InMemoryDriver({ strictMode: true });
      await strictDriver.connect();

      await expect(
        strictDriver.update(testTable, 'non-existent', { name: 'Test' })
      ).rejects.toThrow('Record with ID non-existent not found');
    });

    it('should throw on delete of missing record in strict mode', async () => {
      const strictDriver = new InMemoryDriver({ strictMode: true });
      await strictDriver.connect();

      await expect(
        strictDriver.delete(testTable, 'non-existent')
      ).rejects.toThrow('Record with ID non-existent not found');
    });

    it('should return null on update of missing record in default mode', async () => {
      const result = await driver.update(testTable, 'non-existent', { name: 'Test' });
      expect(result).toBeNull();
    });

    it('should return false on delete of missing record in default mode', async () => {
      const result = await driver.delete(testTable, 'non-existent');
      expect(result).toBe(false);
    });
  });

  describe('Transaction Support', () => {
    it('should begin and commit a transaction', async () => {
      await driver.create(testTable, { id: '1', name: 'Alice' });
      
      const tx = await driver.beginTransaction();
      await driver.create(testTable, { id: '2', name: 'Bob' });
      await driver.commit(tx);

      const results = await driver.find(testTable, { object: testTable });
      expect(results).toHaveLength(2);
    });

    it('should rollback a transaction', async () => {
      await driver.create(testTable, { id: '1', name: 'Alice' });
      
      const tx = await driver.beginTransaction();
      await driver.create(testTable, { id: '2', name: 'Bob' });
      
      // Verify Bob exists before rollback
      let results = await driver.find(testTable, { object: testTable });
      expect(results).toHaveLength(2);

      await driver.rollback(tx);

      // After rollback, Bob should be gone
      results = await driver.find(testTable, { object: testTable });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Alice');
    });

    it('should handle rollback of updates', async () => {
      await driver.create(testTable, { id: '1', name: 'Alice' });
      
      const tx = await driver.beginTransaction();
      await driver.update(testTable, '1', { name: 'Alice Modified' });
      await driver.rollback(tx);

      const results = await driver.find(testTable, { object: testTable });
      expect(results[0].name).toBe('Alice');
    });

    it('should support capabilities.transactions = true', () => {
      expect(driver.supports.transactions).toBe(true);
    });
  });

  describe('Utility Methods', () => {
    it('should clear all data', async () => {
      await driver.create(testTable, { id: '1', name: 'Alice' });
      await driver.create('other_table', { id: '1', name: 'Bob' });
      
      expect(driver.getSize()).toBe(2);
      
      await driver.clear();
      
      expect(driver.getSize()).toBe(0);
    });

    it('should return correct size', async () => {
      expect(driver.getSize()).toBe(0);
      
      await driver.create(testTable, { id: '1' });
      expect(driver.getSize()).toBe(1);
      
      await driver.create(testTable, { id: '2' });
      expect(driver.getSize()).toBe(2);
      
      await driver.create('other', { id: '1' });
      expect(driver.getSize()).toBe(3);
    });

    it('should return distinct values for a field', async () => {
      await driver.create(testTable, { id: '1', role: 'admin' });
      await driver.create(testTable, { id: '2', role: 'user' });
      await driver.create(testTable, { id: '3', role: 'user' });
      await driver.create(testTable, { id: '4', role: 'moderator' });

      const roles = await driver.distinct(testTable, 'role');
      expect(roles).toHaveLength(3);
      expect(roles).toContain('admin');
      expect(roles).toContain('user');
      expect(roles).toContain('moderator');
    });

    it('should return distinct values with filter', async () => {
      await driver.create(testTable, { id: '1', role: 'admin', active: true });
      await driver.create(testTable, { id: '2', role: 'user', active: false });
      await driver.create(testTable, { id: '3', role: 'user', active: true });

      const roles = await driver.distinct(testTable, 'role', {
        object: testTable,
        where: { active: true },
      });
      expect(roles).toHaveLength(2);
      expect(roles).toContain('admin');
      expect(roles).toContain('user');
    });
  });

  describe('Schema Management', () => {
    it('should create table on syncSchema', async () => {
      await driver.syncSchema('new_table', {});
      const results = await driver.find('new_table', { object: 'new_table' });
      expect(results).toHaveLength(0);
    });

    it('should drop table', async () => {
      await driver.create(testTable, { id: '1', name: 'test' });
      await driver.dropTable(testTable);
      const results = await driver.find(testTable, { object: testTable });
      expect(results).toHaveLength(0);
    });
  });

  describe('Bulk Operations', () => {
    it('should bulk create records', async () => {
      const records = [
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' },
      ];
      const results = await driver.bulkCreate(testTable, records);
      expect(results).toHaveLength(3);
      expect(results[0].name).toBe('Alice');
      expect(results[1].name).toBe('Bob');
    });

    it('should count records', async () => {
      await driver.create(testTable, { id: '1', role: 'admin' });
      await driver.create(testTable, { id: '2', role: 'user' });
      await driver.create(testTable, { id: '3', role: 'user' });

      const total = await driver.count(testTable);
      expect(total).toBe(3);

      const userCount = await driver.count(testTable, {
        object: testTable,
        where: { role: 'user' },
      });
      expect(userCount).toBe(2);
    });
  });

  describe('ID Generation', () => {
    it('should generate unique counter-based IDs', async () => {
      const r1 = await driver.create(testTable, { name: 'A' });
      const r2 = await driver.create(testTable, { name: 'B' });
      
      expect(r1.id).toBeDefined();
      expect(r2.id).toBeDefined();
      expect(r1.id).not.toBe(r2.id);
      // Counter-based IDs include the table name
      expect(r1.id).toContain(testTable);
    });
  });

  describe('Version', () => {
    it('should report version 1.0.0', () => {
      expect(driver.version).toBe('1.0.0');
    });
  });
});
