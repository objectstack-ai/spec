/**
 * Validation Script for ObjectQL Plugin
 * 
 * This script validates:
 * 1. Plugin-based ObjectQL registration works
 * 2. Custom ObjectQL instance works
 * 3. Multiple plugins with ObjectQL work
 */

import { ObjectKernel, ObjectQLPlugin, ObjectQL, SchemaRegistry } from '../packages/runtime/src';

async function testPluginBasedRegistration() {
  console.log('\n=== Test 1: Plugin-based ObjectQL Registration ===');
  
  const kernel = new ObjectKernel();
  kernel.use(new ObjectQLPlugin());
  
  await kernel.bootstrap();
  
  // Verify ObjectQL is available as a service
  try {
    const ql = kernel.getService<ObjectQL>('objectql');
    console.log('✅ ObjectQL registered via plugin');
    console.log('ObjectQL instance:', ql.constructor.name);
  } catch (e) {
    throw new Error('FAILED: ObjectQL service not found');
  }
}

async function testMissingObjectQL() {
  console.log('\n=== Test 2: Missing ObjectQL Service ===');
  
  const kernel = new ObjectKernel();
  
  await kernel.bootstrap();
  
  // Verify ObjectQL throws error when not registered
  try {
    kernel.getService('objectql');
    throw new Error('FAILED: Should have thrown error for missing ObjectQL');
  } catch (e: any) {
    if (e.message.includes('Service not found')) {
      console.log('✅ Correctly throws error when ObjectQL service is not registered');
    } else {
      throw e;
    }
  }
}

async function testCustomObjectQL() {
  console.log('\n=== Test 3: Custom ObjectQL Instance ===');
  
  // Create a WeakMap to track custom instances in a type-safe way
  const customInstances = new WeakMap<ObjectQL, string>();
  
  const customQL = new ObjectQL({ 
    env: 'test',
    customProperty: 'test-value' 
  });
  
  // Mark this as a custom instance
  customInstances.set(customQL, 'custom-instance');
  
  const kernel = new ObjectKernel();
  kernel.use(new ObjectQLPlugin(customQL));
  
  await kernel.bootstrap();
  
  // Verify the custom instance is used
  const ql = kernel.getService<ObjectQL>('objectql');
  
  if (!customInstances.has(ql)) {
    throw new Error('FAILED: Custom ObjectQL instance not used');
  }
  
  const marker = customInstances.get(ql);
  if (marker !== 'custom-instance') {
    throw new Error('FAILED: Custom ObjectQL instance marker mismatch');
  }
  
  console.log('✅ Custom ObjectQL instance registered correctly');
  console.log('Custom marker:', marker);
}

async function testMultiplePlugins() {
  console.log('\n=== Test 4: Multiple Plugins with ObjectQL ===');
  
  // Mock plugin
  const mockPlugin = {
    name: 'mock-plugin',
    async init(ctx: any) {
      console.log('  Mock plugin initialized');
    }
  };
  
  const kernel = new ObjectKernel();
  kernel
    .use(new ObjectQLPlugin())
    .use(mockPlugin);
  
  await kernel.bootstrap();
  
  const ql = kernel.getService<ObjectQL>('objectql');
  if (!ql) {
    throw new Error('FAILED: ObjectQL not set');
  }
  
  console.log('✅ Multiple plugins work correctly with ObjectQLPlugin');
}

async function runAllTests() {
  console.log('🧪 Starting ObjectQL Plugin Validation Tests...\n');
  
  try {
    await testPluginBasedRegistration();
    await testMissingObjectQL();
    await testCustomObjectQL();
    await testMultiplePlugins();
    
    console.log('\n✅ All tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runAllTests();
