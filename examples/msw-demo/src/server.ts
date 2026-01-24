/**
 * MSW Server Example - Runtime Integration
 * 
 * This example shows how to use the MSW plugin with ObjectStack Runtime.
 * This is useful for Node.js testing environments or development.
 */

import { ObjectStackKernel } from '@objectstack/runtime';
import { InMemoryDriver } from '@objectstack/driver-memory';
import { MSWPlugin } from '@objectstack/plugin-msw';

import CrmApp from '@objectstack/example-crm/objectstack.config';

(async () => {
  console.log('🚀 Starting ObjectStack with MSW Plugin...');

  const kernel = new ObjectStackKernel([
    CrmApp,
    new InMemoryDriver(),
    
    // Add MSW Plugin for API mocking
    new MSWPlugin({
      enableBrowser: false, // Disable browser mode for Node.js
      baseUrl: '/api/v1',
      logRequests: true,
      customHandlers: [
        // You can add custom handlers here
      ]
    })
  ]);

  await kernel.start();
  
  console.log('✅ MSW Plugin initialized');
  console.log('📝 All API endpoints are now mocked and ready for testing');
})();
