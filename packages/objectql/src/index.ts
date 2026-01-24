import { QueryAST, DriverOptions } from '@objectstack/spec/data';
import { ObjectStackManifest } from '@objectstack/spec/system';
import { SchemaRegistry } from './registry';

// Export Registry for consumers
export { SchemaRegistry } from './registry';

/**
 * Host Context provided to plugins
 */
export interface PluginContext {
  ql: ObjectQL;
  logger: Console;
  // Extensible map for host-specific globals (like HTTP Router, etc.)
  [key: string]: any;
}

/**
 * ObjectQL Engine
 */
export class ObjectQL {
  private drivers = new Map<string, any>();
  private defaultDriver: string | null = null;
  
  // Host provided context additions (e.g. Server router)
  private hostContext: Record<string, any> = {};

  constructor(hostContext: Record<string, any> = {}) {
    this.hostContext = hostContext;
    console.log(`[ObjectQL] Engine Instance Created`);
  }

  /**
   * Load and Register a Plugin
   */
  async use(manifestPart: any, runtimePart?: any) {
    // 1. Validate / Register Manifest
    if (manifestPart) {
      // 1. Handle Module Imports (commonjs/esm interop)
      // If the passed object is a module namespace with a default export, use that.
      const manifest = manifestPart.default || manifestPart;

      // In a real scenario, we might strictly parse this using Zod
      // For now, simple ID check
      const id = manifest.id || manifest.name;
      if (!id) {
        console.warn(`[ObjectQL] Plugin manifest missing ID (keys: ${Object.keys(manifest)})`, manifest);
        // Don't return, try to proceed if it looks like an App (Apps might use 'name' instead of 'id')
        // return; 
      }
      
      console.log(`[ObjectQL] Loading Plugin: ${id}`);
      SchemaRegistry.registerPlugin(manifest as ObjectStackManifest);

      // Register Objects from App/Plugin
      if (manifest.objects) {
        for (const obj of manifest.objects) {
            // Ensure object name is registered globally
            SchemaRegistry.registerObject(obj);
            console.log(`[ObjectQL] Registered Object: ${obj.name}`);
        }
      }

      // Register contributions
       if (manifest.contributes?.kinds) {
          for (const kind of manifest.contributes.kinds) {
            SchemaRegistry.registerKind(kind);
          }
       }

       // Register Data Seeding (Lazy execution or immediate?)
       // We store it in a temporary registry or execute immediately if engine is ready.
       // Since `use` is init time, we might need to store it and run later in `seed()`.
       // For this MVP, let's attach it to the manifest object in registry so Kernel can find it.
    }

    // 2. Execute Runtime
    if (runtimePart) {
       const pluginDef = (runtimePart as any).default || runtimePart;
       if (pluginDef.onEnable) {
          const context: PluginContext = {
            ql: this,
            logger: console,
            // Expose the driver registry helper explicitly if needed
            drivers: {
                register: (driver: any) => this.registerDriver(driver)
            },
            ...this.hostContext
          };
          
          await pluginDef.onEnable(context);
       }
    }
  }

  /**
   * Register a new storage driver
   */
  registerDriver(driver: any, isDefault: boolean = false) {
    if (this.drivers.has(driver.name)) {
      console.warn(`[ObjectQL] Driver ${driver.name} is already registered. Skipping.`);
      return;
    }

    this.drivers.set(driver.name, driver);
    console.log(`[ObjectQL] Registered driver: ${driver.name} v${driver.version}`);

    if (isDefault || this.drivers.size === 1) {
      this.defaultDriver = driver.name;
    }
  }

  /**
   * Helper to get the target driver
   */
  private getDriver(_object: string): any {
    // TODO: Look up Object definition to see if it specifies a specific datasource/driver
    // For now, always return default
    if (!this.defaultDriver) {
      throw new Error('[ObjectQL] No drivers registered!');
    }
    return this.drivers.get(this.defaultDriver)!;
  }

  /**
   * Initialize the engine and all registered drivers
   */
  async init() {
    console.log('[ObjectQL] Initializing drivers...');
    for (const [name, driver] of this.drivers) {
      try {
        await driver.connect();
      } catch (e) {
        console.error(`[ObjectQL] Failed to connect driver ${name}`, e);
      }
    }
    // In a real app, we would sync schemas here
  }

  async destroy() {
    for (const driver of this.drivers.values()) {
      await driver.disconnect();
    }
  }

  // ============================================
  // Data Access Methods
  // ============================================

  async find(object: string, filters: any = {}, options?: DriverOptions) {
    const driver = this.getDriver(object);
    console.log(`[ObjectQL] Finding ${object} on ${driver.name}...`);
    
    // Transform simplified filters to QueryAST
    // This is a simplified "Mock" transform. 
    // Real implementation would parse complex JSON or FilterBuilders.
    const ast: QueryAST = {
       object, // Add missing required field
       // Pass through if it looks like AST, otherwise empty
       // In this demo, we assume the caller passes a simplified object or raw AST
       where: filters.where || undefined,
       limit: filters.limit || 100,
       orderBy: filters.orderBy || []
    };

    return driver.find(object, ast, options);
  }

  async insert(object: string, data: Record<string, any>, options?: DriverOptions) {
    const driver = this.getDriver(object);
    console.log(`[ObjectQL] Creating ${object} on ${driver.name}...`);
    // 1. Validate Schema
    // 2. Run "Before Insert" Triggers
    
    const result = await driver.create(object, data, options);
    
    // 3. Run "After Insert" Triggers
    return result;
  }

  async update(object: string, id: string, data: Record<string, any>, options?: DriverOptions) {
    const driver = this.getDriver(object);
    console.log(`[ObjectQL] Updating ${object} ${id}...`);
    return driver.update(object, id, data, options);
  }

  async delete(object: string, id: string, options?: DriverOptions) {
    const driver = this.getDriver(object);
    console.log(`[ObjectQL] Deleting ${object} ${id}...`);
    return driver.delete(object, id, options);
  }
}
