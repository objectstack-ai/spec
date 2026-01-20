import { SchemaRegistry } from './kernel/registry';
import { AppSchema, ManifestSchema, App, ObjectStackManifest } from '@objectstack/spec';

// Import from packages
// @ts-ignore
import CrmApp from '@objectstack/example-crm/objectstack.config';
// @ts-ignore
import TodoApp from '@objectstack/example-todo/objectstack.config';
// @ts-ignore
import BiPluginManifest from '@objectstack/plugin-bi/objectstack.config';
import BiPluginRuntime from '@objectstack/plugin-bi';

export async function loadPlugins() {
  const packages: any[] = [CrmApp, TodoApp, BiPluginManifest];

  for (const pkg of packages) {
    if (!pkg) continue;
    
    // Check if it's a Manifest (Plugin/Package)
    if (pkg.type === 'plugin') {
       const manifest = pkg as ObjectStackManifest;
       console.log(`[Loader] Loading Plugin Manifest: ${manifest.id}`);
       
       try {
           const parsedManifest = ManifestSchema.parse(manifest);
           SchemaRegistry.registerPlugin(parsedManifest);
    
           // 1. Register Contributions (Static)
           if (parsedManifest.contributes?.kinds) {
              for (const kind of parsedManifest.contributes.kinds) {
                SchemaRegistry.registerKind(kind);
              }
           }

           // 2. Load Runtime (Dynamic Simulation)
           // In a real engine, this would use `import(manifest.extensions.runtime.entry)`
           if (manifest.id === 'com.objectstack.bi' && BiPluginRuntime) {
              const pluginDef = (BiPluginRuntime as any).default || BiPluginRuntime;
              
              if (pluginDef.onEnable) {
                console.log(`[Loader] Executing Plugin Runtime: ${manifest.id}`);
                await pluginDef.onEnable({
                  logger: console,
                  os: {
                    // Mock System API
                    registerService: (id: string, svc: any) => console.log(`[OS] Service Registered: ${id}`) 
                  },
                  ql: {}, // Mock ObjectQL
                  services: {
                     register: (id: string, svc: any) => console.log(`[Services] Registered ${id}`)
                  }
                });
              }
           }

           // 3. Simulate File Scanning (Mock)
           if (parsedManifest.id === 'com.objectstack.bi') {
              SchemaRegistry.registerItem('bi.dataset', {
                name: 'quarterly_sales',
                label: 'Quarterly Sales Data',
                source: 'sql_warehouse',
                query: 'SELECT * FROM sales WHERE quarter = "Q4"'
              }, 'name');
           }
       } catch (e) {
           console.error(`[Loader] Failed to load plugin ${manifest.id}`, e);
       }

    } else {
       // Assume it's a legacy App definition
       console.log(`[Loader] Loading App: ${pkg.name}`);
       
       try {
         const parsedApp = AppSchema.parse(pkg);
         SchemaRegistry.registerApp(parsedApp); 
         
         // Register Objects
         if (pkg.objects) {
            pkg.objects.forEach((obj: any) => {
                SchemaRegistry.registerObject(obj);
            });
            console.log(`[Loader] Loaded ${pkg.objects.length} objects from ${pkg.name}`);
         }

       } catch (e) {
         console.warn(`[Loader] Failed to validate app ${pkg.name}`, e);
       }
    }
  }
}

