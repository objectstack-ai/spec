import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InMemoryDriver } from './memory-driver.js';

describe('InMemoryDriver', () => {
  let driver: InMemoryDriver;
  const testTable = 'test_table';

  beforeEach(async () => {
    driver = new InMemoryDriver();
    await driver.connect();
    // No explicit clear DB method exposed, but new instance is clean.
  });

  describe('Lifecycle', () => {
    it('should connect successfully', async () => {
      expect(driver.checkHealth()).resolves.toBe(true);
    });

    it('should clear data on disconnect', async () => {
      await driver.create(testTable, { id: '1', name: 'test' });
      await driver.disconnect();
      const results = await driver.find(testTable, { select: ['id'] });
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
          select: ['id', 'name', 'age'] 
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
      
      const results = await driver.find(testTable, { select: ['active'] });
      expect(results[0].active).toBe(false);
    });

    it('should support deleting records by ID', async () => {
       await driver.create(testTable, { id: '1', name: 'Charlie' });
       await driver.create(testTable, { id: '2', name: 'David' });
       
       const deleteResult = await driver.delete(testTable, '1');
       expect(deleteResult).toBe(true);
       
       const results = await driver.find(testTable, { select: ['name'] });
       expect(results).toHaveLength(1);
       expect(results[0].name).toBe('David');
    });
  });
  
  describe('Query Capability', () => {
      it('should filter results', async () => {
          await driver.create(testTable, { id: '1', role: 'admin' });
          await driver.create(testTable, { id: '2', role: 'user' });
          await driver.create(testTable, { id: '3', role: 'user' });
          
          const results = await driver.find(testTable, {
              select: ['id'],
              where: { role: 'user' }
          });
          
          expect(results).toHaveLength(2);
      });

      it('should limit results', async () => {
           await driver.create(testTable, { id: '1' });
           await driver.create(testTable, { id: '2' });
           await driver.create(testTable, { id: '3' });
          
          const results = await driver.find(testTable, {
              select: ['id'],
              limit: 2
          });
          
          expect(results).toHaveLength(2);
      });
  });
});
