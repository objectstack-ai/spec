import { ObjectKernel, DriverPlugin, AppPlugin } from '@objectstack/runtime';
import { InMemoryDriver } from '@objectstack/driver-memory';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { HonoServerPlugin } from '@objectstack/plugin-hono-server';
import { MetadataPlugin } from '@objectstack/metadata';
import path from 'path';

import CrmApp from '@example/app-crm/objectstack.config';
import TodoApp from '@example/app-todo/objectstack.config';
import BiPluginManifest from '@example/plugin-bi/objectstack.config';

(async () => {
  console.log('🚀 Booting Kernel...');

  // Use MiniKernel architecture
  const kernel = new ObjectKernel();
  
  kernel
      // Register Metadata Plugin (File System Loader)
      // Best Practice: Load metadata early so it's available for other plugins
      .use(new MetadataPlugin({ rootDir: path.resolve(__dirname, '../metadata') }))

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
