/**
 * Test Script for IDataEngine Interface Compliance
 * 
 * This script validates:
 * 1. ObjectQL implements IDataEngine interface
 * 2. Data engine service registration works
 * 3. IDataEngine methods are callable
 */

import { ObjectKernel } from './packages/runtime/src/mini-kernel.js';
import { ObjectQLPlugin } from './packages/runtime/src/objectql-plugin.js';
import { DriverPlugin } from './packages/runtime/src/driver-plugin.js';
import { ObjectQL } from './packages/objectql/src/index.js';
import type { IDataEngine } from './packages/spec/src/system/data-engine.zod.js';

// Mock driver for testing
class MockDriver {
  name = 'mock-driver';
  version = '1.0.0';
  
  async connect() {
    console.log('[MockDriver] Connected');
  }
  
  async disconnect() {
    console.log('[MockDriver] Disconnected');
  }
  
  async find(object: string, query: any) {
    console.log(`[MockDriver] find(${object})`);
    return [{ id: '1', name: 'Test Record' }];
  }
  
  async findOne(object: string, query: any) {
    console.log(`[MockDriver] findOne(${object})`);
    return { id: '1', name: 'Test Record' };
  }
  
  async create(object: string, data: any) {
    console.log(`[MockDriver] create(${object})`, data);
    return { id: '123', ...data };
  }
  
  async update(object: string, id: any, data: any) {
    console.log(`[MockDriver] update(${object}, ${id})`, data);
    return { id, ...data };
  }
  
  async delete(object: string, id: any) {
    console.log(`[MockDriver] delete(${object}, ${id})`);
    return { id };
  }
}

async function testDataEngineService() {
  console.log('\n=== Test 1: IDataEngine Service Registration ===');
  
  const kernel = new ObjectKernel();
  kernel.use(new ObjectQLPlugin());
  kernel.use(new DriverPlugin(new MockDriver() as any, 'mock'));
  
  await kernel.bootstrap();
  
  // Verify data-engine service is registered
  try {
    const engine = kernel.getService<IDataEngine>('data-engine');
    console.log('✅ data-engine service registered');
    console.log('Service type:', engine.constructor.name);
  } catch (e: any) {
    throw new Error(`FAILED: data-engine service not found: ${e.message}`);
  }
  
  // Verify objectql service is still available (backward compatibility)
  try {
    const ql = kernel.getService('objectql');
    console.log('✅ objectql service still available (backward compatibility)');
  } catch (e: any) {
    throw new Error(`FAILED: objectql service not found: ${e.message}`);
  }
}

async function testDataEngineInterface() {
  console.log('\n=== Test 2: IDataEngine Interface Methods ===');
  
  const kernel = new ObjectKernel();
  kernel.use(new ObjectQLPlugin());
  kernel.use(new DriverPlugin(new MockDriver() as any, 'mock'));
  
  await kernel.bootstrap();
  
  const engine = kernel.getService<IDataEngine>('data-engine');
  
  // Test insert
  console.log('\nTesting insert...');
  const created = await engine.insert('test_object', { name: 'John Doe', email: 'john@example.com' });
  console.log('✅ insert() returned:', created);
  
  // Test find with QueryOptions
  console.log('\nTesting find with QueryOptions...');
  const results = await engine.find('test_object', {
    filter: { status: 'active' },
    limit: 10,
    sort: { createdAt: -1 }
  });
  console.log('✅ find() returned:', results.length, 'records');
  
  // Test find without query (all records)
  console.log('\nTesting find without query...');
  const allResults = await engine.find('test_object');
  console.log('✅ find() without query returned:', allResults.length, 'records');
  
  // Test update
  console.log('\nTesting update...');
  const updated = await engine.update('test_object', '123', { name: 'Jane Doe' });
  console.log('✅ update() returned:', updated);
  
  // Test delete
  console.log('\nTesting delete...');
  const deleted = await engine.delete('test_object', '123');
  console.log('✅ delete() returned boolean:', deleted === true || deleted === false);
  
  if (typeof deleted !== 'boolean') {
    throw new Error(`FAILED: delete() should return boolean, got ${typeof deleted}`);
  }
}

async function testBackwardCompatibility() {
  console.log('\n=== Test 3: Backward Compatibility ===');
  
  const kernel = new ObjectKernel();
  kernel.use(new ObjectQLPlugin());
  kernel.use(new DriverPlugin(new MockDriver() as any, 'mock'));
  
  await kernel.bootstrap();
  
  // Both services should point to the same instance
  const engine = kernel.getService<IDataEngine>('data-engine');
  const ql = kernel.getService('objectql');
  
  if (engine !== ql) {
    throw new Error('FAILED: data-engine and objectql should be the same instance');
  }
  
  console.log('✅ data-engine and objectql services are the same instance');
}

async function runAllTests() {
  console.log('🧪 Starting IDataEngine Interface Tests...\n');
  
  try {
    await testDataEngineService();
    await testDataEngineInterface();
    await testBackwardCompatibility();
    
    console.log('\n✅ All tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runAllTests();
