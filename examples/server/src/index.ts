import { ObjectStackKernel } from '@objectstack/runtime';
import { InMemoryDriver } from '@objectstack/driver-memory';
import { HonoServerPlugin } from '@objectstack/plugin-hono-server';

import CrmApp from '@objectstack/example-crm/objectstack.config';
import TodoApp from '@objectstack/example-todo/objectstack.config';
import BiPluginManifest from '@objectstack/plugin-bi/objectstack.config';

(async () => {
  console.log('🚀 Booting Kernel...');

  const kernel = new ObjectStackKernel([
      CrmApp, 
      TodoApp, 
      BiPluginManifest,
      new InMemoryDriver(),
      
      // Load the Hono Server Plugin
      new HonoServerPlugin({ 
        port: 3004, 
        staticRoot: './public' 
      }) 
  ]);

  await kernel.start();
})();
