import { SchemaRegistry } from './kernel/registry';
import { AppSchema } from '@objectstack/spec';

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
    
    // 0. Register App
    const parsedApp = AppSchema.parse(app);
    SchemaRegistry.registerApp(parsedApp);

    // 1. Scan and Register All Metadata
    // Known keys to exclude from metadata scanning
    const ignoredKeys = new Set(['name', 'label', 'description', 'version', 'branding', 'active', 'isDefault', 'navigation', 'menus', 'homePageId', 'requiredPermissions', 'icon', 'id']);

    for (const [key, value] of Object.entries(app)) {
      if (ignoredKeys.has(key)) continue;

      if (Array.isArray(value)) {
        // Singularize type name: remove trailing 's' if present
        const type = key.endsWith('s') ? key.slice(0, -1) : key;
        
        value.forEach((item: any) => {
           // Ensure item has a name
           if (item && item.name) {
             SchemaRegistry.registerItem(type, item);
           }
        });
        console.log(`[Loader] Loaded ${value.length} ${type}s from ${app.name}`);
      }
    }
    
    console.log(`[Loader] Loaded ${app.objects?.length || 0} objects from ${app.name}`);
  }
}
