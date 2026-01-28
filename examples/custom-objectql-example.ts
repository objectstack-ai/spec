/**
 * Example: Custom ObjectQL Instance
 * 
 * This demonstrates how to use a custom ObjectQL instance with the kernel.
 * This is useful when you have a separate ObjectQL implementation or need
 * custom configuration.
 */

import { ObjectKernel, DriverPlugin } from '@objectstack/runtime';
import { ObjectQLPlugin, ObjectQL } from '@objectstack/objectql';
import { InMemoryDriver } from '@objectstack/driver-memory';

(async () => {
  console.log('🚀 Example: Custom ObjectQL Instance...');

  // Create a custom ObjectQL instance with specific configuration
  const customQL = new ObjectQL({
    env: 'development',
    // Add any custom host context here
    customFeature: true,
    debug: true
  });

  // You can also pre-configure the ObjectQL instance
  // For example, register custom hooks
  customQL.registerHook('beforeInsert', async (ctx) => {
    console.log(`[Custom Hook] Before inserting into ${ctx.object}`);
  });

  // Create kernel with the custom ObjectQL instance
  const kernel = new ObjectKernel();
  
  kernel
    // Register your custom ObjectQL instance
    .use(new ObjectQLPlugin(customQL))
    
    // Add your driver
    .use(new DriverPlugin(new InMemoryDriver(), 'memory'));
    
    // Add other plugins and app configs as needed

  await kernel.bootstrap();

  console.log('✅ Kernel started with custom ObjectQL instance');
  
  // Access ObjectQL via service registry
  const objectql = kernel.getService('objectql');
  console.log('ObjectQL instance:', objectql);
})();
