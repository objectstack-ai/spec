import { SchemaRegistry } from './kernel/registry';

// In a real monorepo scenario, we might use path aliases or require.resolve
// Here we use relative paths to demonstrate loading from the sibling packages
// @ts-ignore
import CrmApp from '../../crm/objectstack.config'; 
// @ts-ignore
import TodoApp from '../../todo/objectstack.config';

export function loadPlugins() {
  const apps = [CrmApp, TodoApp];

  for (const app of apps) {
    if (!app) continue;
    
    console.log(`[Loader] Loading App: ${app.name} (${app.label})`);
    
    // 1. Register Objects
    if (app.objects) {
      app.objects.forEach((obj: any) => {
         SchemaRegistry.register(obj);
      });
    }
    
    console.log(`[Loader] Loaded ${app.objects?.length || 0} objects from ${app.name}`);
  }
}
