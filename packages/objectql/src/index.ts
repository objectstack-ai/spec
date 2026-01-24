import { QueryAST } from '@objectstack/spec/data';
import { ObjectStackManifest } from '@objectstack/spec/system';
import { DriverInterface, DriverOptions } from '@objectstack/spec/driver';
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
  private drivers = new Map<string, DriverInterface>();
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
                register: (driver: DriverInterface) => this.registerDriver(driver)
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
  registerDriver(driver: DriverInterface, isDefault: boolean = false) {
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
   * Helper to get object definition
   */
  getSchema(objectName: string) {
    return SchemaRegistry.getObject(objectName);
  }

  /**
   * Helper to get the target driver
   */
  private getDriver(objectName: string): DriverInterface {
    const object = SchemaRegistry.getObject(objectName);
    
    // 1. If object definition exists, check for explicit datasource
    if (object) {
      const datasourceName = object.datasource || 'default';
      
      // If configured for 'default', try to find the default driver
      if (datasourceName === 'default') {
        if (this.defaultDriver && this.drivers.has(this.defaultDriver)) {
          return this.drivers.get(this.defaultDriver)!;
        }
        // Fallback: If 'default' not explicitly set, use the first available driver?
        // Better to be strict.
      } else {
        // Specific datasource requested
        if (this.drivers.has(datasourceName)) {
            return this.drivers.get(datasourceName)!;
        }
        // If not found, fall back to default? Or error?
        // Standard behavior: Error if specific datasource is missing.
        throw new Error(`[ObjectQL] Datasource '${datasourceName}' configured for object '${objectName}' is not registered.`);
      }
    }

    // 2. Fallback for ad-hoc objects or missing definitions
    // If we have a default driver, use it.
    if (this.defaultDriver) {
      if (!object) {
        console.warn(`[ObjectQL] Object '${objectName}' not found in registry. Using default driver.`);
      }
      return this.drivers.get(this.defaultDriver)!;
    }

    throw new Error(`[ObjectQL] No driver available for object '${objectName}'`);
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

  async find(object: string, query: any = {}, options?: DriverOptions) {
    const driver = this.getDriver(object);
    
    // Normalize QueryAST
    let ast: QueryAST;
    if (query.where || query.fields || query.orderBy || query.limit) {
      // It's likely a QueryAST or partial QueryAST
      // Ensure 'object' is set correctly
      ast = {
        object, // Force object name to match the call
        ...query
      } as QueryAST;
    } else {
      // It's a direct filter object (Simplified syntax)
      // e.g. find('account', { name: 'Acme' })
      ast = {
        object,
        where: query 
      } as QueryAST;
    }

    // Default limit protection
    if (ast.limit === undefined) {
       ast.limit = 100;
    }

    return driver.find(object, ast, options);
  }

  async findOne(object: string, idOrQuery: string | any, options?: DriverOptions) {
    const driver = this.getDriver(object);
    
    let ast: QueryAST;
    if (typeof idOrQuery === 'string') {
        ast = {
            object,
            where: { _id: idOrQuery }
        };
    } else {
        // Assume query object
        // reuse logic from find() or just wrap it
        if (idOrQuery.where || idOrQuery.fields) {
            ast = { object, ...idOrQuery };
        } else {
            ast = { object, where: idOrQuery };
        }
    }
    // Limit 1 for findOne
    ast.limit = 1;

    return driver.findOne(object, ast, options);
  }

  async insert(object: string, data: Record<string, any>, options?: DriverOptions) {
    const driver = this.getDriver(object);
    
    // 1. Get Schema
    const schema = SchemaRegistry.getObject(object);
    
    if (schema) {
       // TODO: Validation Logic
       // validate(schema, data);
    }
    
    // 2. Run "Before Insert" Triggers
    
    const result = await driver.create(object, data, options);
    
    // 3. Run "After Insert" Triggers
    return result;
  }

  async update(object: string, id: string | number, data: Record<string, any>, options?: DriverOptions) {
    const driver = this.getDriver(object);
    return driver.update(object, id, data, options);
  }

  async delete(object: string, id: string | number, options?: DriverOptions) {
    const driver = this.getDriver(object);
    return driver.delete(object, id, options);
  }
}
