import { DataEngine } from '@objectstack/runtime';
import { InMemoryDriver } from '@objectstack/driver-memory';
import { DevServerPlugin } from '@objectstack/dev-server';

import CrmApp from '@objectstack/example-crm/objectstack.config';
import TodoApp from '@objectstack/example-todo/objectstack.config';
import BiPluginManifest from '@objectstack/plugin-bi/objectstack.config';

(async () => {
  console.log('🚀 Booting Kernel...');

  const kernel = new DataEngine([
      CrmApp, 
      TodoApp, 
      BiPluginManifest,
      new InMemoryDriver(),
      
      // Load the Dev Server Plugin
      new DevServerPlugin({ port: 3004 }) 
  ]);

  await kernel.start();
})();
