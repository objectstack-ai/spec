import { SchemaRegistry } from './kernel/registry';
import { AppSchema, ManifestSchema, App, ObjectStackManifest } from '@objectstack/spec';
import { DataEngine } from './kernel/engine';

// Import from packages
// @ts-ignore
import CrmApp from '@objectstack/example-crm/objectstack.config';
// @ts-ignore
import TodoApp from '@objectstack/example-todo/objectstack.config';
// @ts-ignore
import BiPluginManifest from '@objectstack/plugin-bi/objectstack.config';
import BiPluginRuntime from '@objectstack/plugin-bi';
// @ts-ignore
import DriverMemoryManifest from '@objectstack/plugin-driver-memory/objectstack.config';
import DriverMemoryRuntime from '@objectstack/plugin-driver-memory';

export async function loadPlugins(engine: DataEngine) {
  const packages: any[] = [CrmApp, TodoApp, BiPluginManifest, DriverMemoryManifest];

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
           let runtime: any = null;
           if (manifest.id === 'com.objectstack.bi') runtime = BiPluginRuntime;
           if (manifest.id === 'com.objectstack.driver.memory') runtime = DriverMemoryRuntime;

           if (runtime) {
              const pluginDef = (runtime as any).default || runtime;
              
              if (pluginDef.onEnable) {
                console.log(`[Loader] Executing Plugin Runtime: ${manifest.id}`);
                await pluginDef.onEnable({
                  logger: console,
                  os: {
                    // Mock System API
                    registerService: (id: string, svc: any) => console.log(`[OS] Service Registered: ${id}`),
                    getConfig: () => ({})
                  },
                  // 💡 EXPOSE OBJECTQL ENGINE TO PLUGINS
                  drivers: engine.ql, 
                  app: { router: { get: () => {} } }, // Mock Router
                  storage: { set: () => {} },
                  services: { register: () => {} },
                  i18n: {}
                });
              }
           }
       } catch (err) {
           console.error(`[Loader] Failed to load plugin ${manifest.id}:`, err);
       }
    } 
    // App loading
    else if (pkg.type === 'app' || pkg.type === undefined) {
         try {
             if (pkg.id) { // Simple check
                 console.log(`[Loader] Loading App Manifest: ${pkg.id}`);
                 SchemaRegistry.registerApp(pkg as App);
             }
         } catch (e) {
             console.error('Failed to load app', e);
         }
    }
  }
}

