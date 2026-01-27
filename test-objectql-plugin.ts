/**
 * Validation Script for ObjectQL Plugin
 * 
 * This script validates:
 * 1. Plugin-based ObjectQL registration works
 * 2. Backward compatibility (without plugin) works
 * 3. Custom ObjectQL instance works
 */

import { ObjectStackKernel, ObjectQLPlugin, ObjectQL, SchemaRegistry } from '../packages/runtime/src';

async function testPluginBasedRegistration() {
  console.log('\n=== Test 1: Plugin-based ObjectQL Registration ===');
  
  const kernel = new ObjectStackKernel([
    new ObjectQLPlugin()
  ]);
  
  // Verify ObjectQL is set
  if (!kernel.ql) {
    throw new Error('FAILED: ObjectQL not set via plugin');
  }
  
  console.log('✅ ObjectQL registered via plugin');
  console.log('ObjectQL instance:', kernel.ql.constructor.name);
}

async function testBackwardCompatibility() {
  console.log('\n=== Test 2: Backward Compatibility (No Plugin) ===');
  
  const kernel = new ObjectStackKernel([]);
  
  // Verify ObjectQL is auto-initialized
  if (!kernel.ql) {
    throw new Error('FAILED: ObjectQL not auto-initialized');
  }
  
  console.log('✅ ObjectQL auto-initialized for backward compatibility');
  console.log('ObjectQL instance:', kernel.ql.constructor.name);
}

async function testCustomObjectQL() {
  console.log('\n=== Test 3: Custom ObjectQL Instance ===');
  
  const customQL = new ObjectQL({ 
    env: 'test',
    customProperty: 'test-value' 
  });
  
  // Add a marker to identify this instance
  (customQL as any).customMarker = 'custom-instance';
  
  const kernel = new ObjectStackKernel([
    new ObjectQLPlugin(customQL)
  ]);
  
  // Verify the custom instance is used
  if (!kernel.ql) {
    throw new Error('FAILED: ObjectQL not set');
  }
  
  if ((kernel.ql as any).customMarker !== 'custom-instance') {
    throw new Error('FAILED: Custom ObjectQL instance not used');
  }
  
  console.log('✅ Custom ObjectQL instance registered correctly');
  console.log('Custom marker:', (kernel.ql as any).customMarker);
}

async function testMultiplePlugins() {
  console.log('\n=== Test 4: Multiple Plugins with ObjectQL ===');
  
  // Mock driver
  const mockDriver = {
    name: 'mock-driver',
    version: '1.0.0',
    capabilities: {},
    async connect() {},
    async disconnect() {},
    async find() { return []; },
    async findOne() { return null; },
    async create() { return {}; },
    async update() { return {}; },
    async delete() { return {}; }
  };
  
  const kernel = new ObjectStackKernel([
    new ObjectQLPlugin(),
    mockDriver
  ]);
  
  if (!kernel.ql) {
    throw new Error('FAILED: ObjectQL not set');
  }
  
  console.log('✅ Multiple plugins work correctly with ObjectQLPlugin');
}

async function runAllTests() {
  console.log('🧪 Starting ObjectQL Plugin Validation Tests...\n');
  
  try {
    await testPluginBasedRegistration();
    await testBackwardCompatibility();
    await testCustomObjectQL();
    await testMultiplePlugins();
    
    console.log('\n✅ All tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runAllTests();
