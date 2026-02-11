// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Discovery Test
 * 
 * This test verifies that the discovery endpoint correctly reflects
 * the availability of the auth service when plugin-auth is registered.
 */

import { ObjectKernel } from '@objectstack/core';
import { ObjectQL } from '@objectstack/objectql';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { InMemoryDriver } from '@objectstack/driver-memory';
import { AuthPlugin } from '@objectstack/plugin-auth';

async function testDiscovery() {
  console.log('🧪 Testing Discovery with Auth Plugin...\n');

  // 1. Create ObjectQL instance with in-memory driver
  const objectql = new ObjectQL();
  await objectql.registerDriver(new InMemoryDriver());

  // 2. Create kernel
  const kernel = new ObjectKernel();

  // 3. Register ObjectQL plugin (which provides protocol service)
  await kernel.use(new ObjectQLPlugin(objectql));
  
  // 4. Get discovery BEFORE auth is registered
  console.log('📋 Discovery BEFORE auth plugin:');
  let protocol = kernel.getService('protocol');
  let discovery = await protocol.getDiscovery();
  console.log('  - Auth service enabled:', discovery.services?.auth?.enabled);
  console.log('  - Auth service status:', discovery.services?.auth?.status);
  console.log('  - Auth route:', discovery.routes?.auth || 'undefined');
  console.log('');
  
  // 5. Register auth plugin
  await kernel.use(new AuthPlugin({
    secret: 'test-secret-min-32-characters-long-for-jwt-signing',
    baseUrl: 'http://localhost:3000',
  }));
  
  // 6. Get discovery AFTER auth is registered
  console.log('📋 Discovery AFTER auth plugin:');
  protocol = kernel.getService('protocol');
  discovery = await protocol.getDiscovery();
  console.log('  - Auth service enabled:', discovery.services?.auth?.enabled);
  console.log('  - Auth service status:', discovery.services?.auth?.status);
  console.log('  - Auth service route:', discovery.services?.auth?.route);
  console.log('  - Auth service provider:', discovery.services?.auth?.provider);
  console.log('  - Auth route:', discovery.routes?.auth);
  console.log('');

  // 7. Verify the results
  if (discovery.services?.auth?.enabled && discovery.services?.auth?.status === 'available') {
    console.log('✅ SUCCESS: Auth service is correctly shown as available!');
    console.log('✅ Discovery endpoint is working correctly!');
  } else {
    console.log('❌ FAILED: Auth service should be available but is not!');
    console.log('   Actual status:', discovery.services?.auth);
    process.exit(1);
  }

  // 8. Clean up
  await kernel.shutdown();
  console.log('\n🎉 All tests passed!');
}

testDiscovery().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
