import { ObjectKernel, DriverPlugin, AppPlugin } from '@objectstack/runtime';
import { InMemoryDriver } from '@objectstack/driver-memory';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { HonoServerPlugin } from '@objectstack/plugin-hono-server';

import CrmApp from '@objectstack/example-crm/objectstack.config';
import TodoApp from '@objectstack/example-todo/objectstack.config';
import BiPluginManifest from '@objectstack/plugin-bi/objectstack.config';

(async () => {
  console.log('🚀 Booting Kernel...');

  // Use MiniKernel architecture
  const kernel = new ObjectKernel();
  
  kernel
      // Register ObjectQL engine
      .use(new ObjectQLPlugin())
      
      // Database driver
      .use(new DriverPlugin(new InMemoryDriver(), 'memory'))
      
      // App manifests
      .use(new AppPlugin(CrmApp))
      .use(new AppPlugin(TodoApp))
      .use(new AppPlugin(BiPluginManifest))
      
      // Load the Hono Server Plugin
      .use(new HonoServerPlugin({ 
        port: 3004, 
        staticRoot: './public' 
      }));

  await kernel.bootstrap();
})();
