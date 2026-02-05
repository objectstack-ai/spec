import { defineStack } from '@objectstack/spec';
import { AppPlugin } from '@objectstack/runtime';
import { ObjectQLPlugin } from '@objectstack/objectql';
import CrmApp from '../app-crm/objectstack.config';
import TodoApp from '../app-todo/objectstack.config';
import BiPluginManifest from '../plugin-bi/objectstack.config';

// App Host Example
// This project acts as a "Platform Server" that loads multiple apps and plugins.
// It effectively replaces the manual composition in `src/index.ts`.

export default defineStack({
  manifest: {
    id: 'app-host',
    name: 'app_host',
    version: '1.0.0',
    description: 'Host application aggregating CRM, Todo and BI plugins',
    type: 'app',
  },
  
  // Explicitly Load Plugins and Apps
  // The Runtime CLI will iterate this list and call kernel.use()
  plugins: [
    new ObjectQLPlugin(),
    // Wrap Manifests/Stacks in AppPlugin adapter
    new AppPlugin(CrmApp),
    new AppPlugin(TodoApp),
    new AppPlugin(BiPluginManifest)
  ]
});
