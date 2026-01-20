import { ObjectStackServer } from '@objectstack/server';
import { InMemoryDriver } from '@objectstack/driver-memory';

// Standard Plugins
import CrmApp from '@objectstack/example-crm/objectstack.config';
import TodoApp from '@objectstack/example-todo/objectstack.config';
import BiPluginManifest from '@objectstack/plugin-bi/objectstack.config';

(async () => {
  const server = new ObjectStackServer({
     port: 3004,
     static: {
         root: './public',
         path: 'index.html'
     },
     plugins: [
         CrmApp,
         TodoApp,
         BiPluginManifest
     ]
  });

  // Explicitly register the driver
  const driver = new InMemoryDriver();
  server.engine.ql.registerDriver(driver);

  await server.start();
})();
