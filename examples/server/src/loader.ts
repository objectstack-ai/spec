import { SchemaRegistry } from './kernel/registry';
import { AppSchema, ManifestSchema } from '@objectstack/spec';

// In a real monorepo scenario, we might use path aliases or require.resolve
// Here we use relative paths to demonstrate loading from the sibling packages
// @ts-ignore
import CrmApp from '../../crm/objectstack.config'; 
// @ts-ignore
import TodoApp from '../../todo/objectstack.config';
// @ts-ignore
import BiPlugin from '../../plugin-bi/objectstack.config';

export function loadPlugins() {
  const packages = [CrmApp, TodoApp, BiPlugin];

  for (const pkg of packages) {
    if (!pkg) continue;
    
    console.log(`[Loader] Loading Package: ${pkg.id || pkg.name} (${pkg.type || 'app'})`);
    
    // Handle Plugins
    if (pkg.type === 'plugin') {
       const parsedPlugin = ManifestSchema.parse(pkg);
       SchemaRegistry.registerPlugin(parsedPlugin);

       if (parsedPlugin.contributes?.kinds) {
          for (const kind of parsedPlugin.contributes.kinds) {
            SchemaRegistry.registerKind(kind);
          }
       }

       // SIMULATION: Simulate the scanner loading a file matching the new Kind
       // In a real system, this would be done by a file watcher detecting **/*.dataset.json
       if (parsedPlugin.id === 'com.objectstack.bi') {
          SchemaRegistry.registerItem('bi.dataset', {
            name: 'quarterly_sales',
            label: 'Quarterly Sales Data',
            source: 'sql_warehouse',
            query: 'SELECT * FROM sales WHERE quarter = "Q4"'
          }, 'name');
          console.log('[Loader] Simulated loading: quarterly_sales (bi.dataset)');
       }

       continue;
    }

    // Handle Apps
    // 0. Register App
    const parsedApp = AppSchema.parse(pkg);
    SchemaRegistry.registerApp(parsedApp);

    // 1. Register Objects
    if (pkg.objects) {
      pkg.objects.forEach((obj: any) => {
         SchemaRegistry.registerObject(obj);
      });
    }
    
    console.log(`[Loader] Loaded ${pkg.objects?.length || 0} objects from ${pkg.name}`);
  }
}
