import { ObjectStackKernel, ObjectQLPlugin, ObjectQL } from '@objectstack/runtime';
import { InMemoryDriver } from '@objectstack/driver-memory';
import { HonoServerPlugin } from '@objectstack/plugin-hono-server';

import CrmApp from '@objectstack/example-crm/objectstack.config';
import TodoApp from '@objectstack/example-todo/objectstack.config';
import BiPluginManifest from '@objectstack/plugin-bi/objectstack.config';

(async () => {
  console.log('🚀 Booting Kernel...');

  // Option 1: Use default ObjectQL via plugin (recommended)
  const kernel = new ObjectStackKernel([
      // Register ObjectQL engine explicitly via plugin
      new ObjectQLPlugin(),
      
      // App manifests
      CrmApp, 
      TodoApp, 
      BiPluginManifest,
      
      // Database driver
      new InMemoryDriver(),
      
      // Load the Hono Server Plugin
      new HonoServerPlugin({ 
        port: 3004, 
        staticRoot: './public' 
      }) 
  ]);

  // Option 2: Use custom ObjectQL instance
  // const customQL = new ObjectQL({ env: 'production', customConfig: true });
  // const kernel = new ObjectStackKernel([
  //     new ObjectQLPlugin(customQL),
  //     ...other plugins
  // ]);

  await kernel.start();
})();
