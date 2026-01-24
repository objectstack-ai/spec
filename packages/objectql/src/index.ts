import { QueryAST, HookContext } from '@objectstack/spec/data';
import { ObjectStackManifest } from '@objectstack/spec/kernel';
import { DriverInterface, DriverOptions } from '@objectstack/spec/driver';
import { SchemaRegistry } from './registry';

// Export Registry for consumers
export { SchemaRegistry } from './registry';

export type HookHandler = (context: HookContext) => Promise<void> | void;

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
  
  // Hooks Registry
  private hooks: Record<string, HookHandler[]> = {
    'beforeFind': [], 'afterFind': [],
    'beforeInsert': [], 'afterInsert': [],
    'beforeUpdate': [], 'afterUpdate': [],
    'beforeDelete': [], 'afterDelete': [],
  };
  
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
   * Register a hook
   * @param event The event name (e.g. 'beforeFind', 'afterInsert')
   * @param handler The handler function
   */
  registerHook(event: string, handler: HookHandler) {
    if (!this.hooks[event]) {
        this.hooks[event] = [];
    }
    this.hooks[event].push(handler);
    console.log(`[ObjectQL] Registered hook for ${event}`);
  }

  private async triggerHooks(event: string, context: HookContext) {
    const handlers = this.hooks[event] || [];
    for (const handler of handlers) {
      // In a real system, we might want to catch errors here or allow them to bubble up
      await handler(context);
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
      ast = { object, ...query } as QueryAST;
    } else {
      ast = { object, where: query } as QueryAST;
    }

    if (ast.limit === undefined) ast.limit = 100;

    // Trigger Before Hook
    const hookContext: HookContext = {
        object,
        event: 'beforeFind',
        input: { ast, options }, // Hooks can modify AST here
        ql: this
    };
    await this.triggerHooks('beforeFind', hookContext);

    try {
        const result = await driver.find(object, hookContext.input.ast, hookContext.input.options);
        
        // Trigger After Hook
        hookContext.event = 'afterFind';
        hookContext.result = result;
        await this.triggerHooks('afterFind', hookContext);
        
        return hookContext.result;
    } catch (e) {
        // hookContext.error = e;
        throw e;
    }
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
    
    // 2. Trigger Before Hook
    const hookContext: HookContext = {
        object,
        event: 'beforeInsert',
        input: { data, options },
        ql: this
    };
    await this.triggerHooks('beforeInsert', hookContext);
    
    // 3. Execute Driver
    const result = await driver.create(object, hookContext.input.data, hookContext.input.options);
    
    // 4. Trigger After Hook
    hookContext.event = 'afterInsert';
    hookContext.result = result;
    await this.triggerHooks('afterInsert', hookContext);

    return hookContext.result;
  }

  async update(object: string, id: string | number, data: Record<string, any>, options?: DriverOptions) {
    const driver = this.getDriver(object);

    const hookContext: HookContext = {
        object,
        event: 'beforeUpdate',
        input: { id, data, options },
        ql: this
    };
    await this.triggerHooks('beforeUpdate', hookContext);

    const result = await driver.update(object, hookContext.input.id, hookContext.input.data, hookContext.input.options);

    hookContext.event = 'afterUpdate';
    hookContext.result = result;
    await this.triggerHooks('afterUpdate', hookContext);
    
    return hookContext.result;
  }

  async delete(object: string, id: string | number, options?: DriverOptions) {
    const driver = this.getDriver(object);

    const hookContext: HookContext = {
        object,
        event: 'beforeDelete',
        input: { id, options },
        ql: this
    };
    await this.triggerHooks('beforeDelete', hookContext);

    const result = await driver.delete(object, hookContext.input.id, hookContext.input.options);

    hookContext.event = 'afterDelete';
    hookContext.result = result;
    await this.triggerHooks('afterDelete', hookContext);

    return hookContext.result;
  }
}
