import { QueryAST, HookContext } from '@objectstack/spec/data';
import { ObjectStackManifest } from '@objectstack/spec/system';
import { DriverOptions } from '@objectstack/spec/system';
import { DriverInterface, IDataEngine, DataEngineQueryOptions, Logger, createLogger } from '@objectstack/core';
import { SchemaRegistry } from './registry';

export type HookHandler = (context: HookContext) => Promise<void> | void;

/**
 * Host Context provided to plugins (Internal ObjectQL Plugin System)
 */
export interface ObjectQLHostContext {
  ql: ObjectQL;
  logger: Logger;
  // Extensible map for host-specific globals (like HTTP Router, etc.)
  [key: string]: any;
}

/**
 * ObjectQL Engine
 * 
 * Implements the IDataEngine interface for data persistence.
 */
export class ObjectQL implements IDataEngine {
  private drivers = new Map<string, DriverInterface>();
  private defaultDriver: string | null = null;
  private logger: Logger;
  
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
    // Use provided logger or create a new one
    this.logger = hostContext.logger || createLogger({ level: 'info', format: 'pretty' });
    this.logger.info('ObjectQL Engine Instance Created');
  }

  /**
   * Load and Register a Plugin
   */
  async use(manifestPart: any, runtimePart?: any) {
    this.logger.debug('Loading plugin', { 
      hasManifest: !!manifestPart, 
      hasRuntime: !!runtimePart 
    });

    // 1. Validate / Register Manifest
    if (manifestPart) {
      this.registerApp(manifestPart);
    }

    // 2. Execute Runtime
    if (runtimePart) {
       const pluginDef = (runtimePart as any).default || runtimePart;
       if (pluginDef.onEnable) {
          this.logger.debug('Executing plugin runtime onEnable');
          
          const context: ObjectQLHostContext = {
            ql: this,
            logger: this.logger,
            // Expose the driver registry helper explicitly if needed
            drivers: {
                register: (driver: DriverInterface) => this.registerDriver(driver)
            },
            ...this.hostContext
          };
          
          await pluginDef.onEnable(context);
          this.logger.debug('Plugin runtime onEnable completed');
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
    this.logger.debug('Registered hook', { event, totalHandlers: this.hooks[event].length });
  }

  public async triggerHooks(event: string, context: HookContext) {
    const handlers = this.hooks[event] || [];
    
    if (handlers.length === 0) {
      this.logger.debug('No hooks registered for event', { event });
      return;
    }

    this.logger.debug('Triggering hooks', { event, handlerCount: handlers.length });
    
    for (let i = 0; i < handlers.length; i++) {
      const handler = handlers[i];
      try {
        this.logger.debug('Executing hook handler', { event, handlerIndex: i });
        await handler(context);
      } catch (error) {
        this.logger.error('Hook handler failed', error as Error, { event, handlerIndex: i });
        // Re-throw to maintain existing behavior
        throw error;
      }
    }
    
    this.logger.debug('All hooks completed', { event });
  }

  registerApp(manifestPart: any) {
      // 1. Handle Module Imports (commonjs/esm interop)
      // If the passed object is a module namespace with a default export, use that.
      const raw = manifestPart.default || manifestPart;
      
      // Support nested manifest property (Stack Definition)
      // We merge the inner manifest metadata (id, version, etc) with the outer container (objects, apps)
      const manifest = raw.manifest ? { ...raw, ...raw.manifest } : raw;

      // In a real scenario, we might strictly parse this using Zod
      // For now, simple ID check
      const id = manifest.id || manifest.name;
      if (!id) {
        this.logger.warn('Plugin manifest missing ID', { manifestKeys: Object.keys(manifest) });
        // Don't return, try to proceed if it looks like an App (Apps might use 'name' instead of 'id')
        // return; 
      }
      
      this.logger.info('Loading App', { id, hasObjects: !!manifest.objects, hasContributes: !!manifest.contributes });
      SchemaRegistry.registerPlugin(manifest as ObjectStackManifest);

      // Register Objects from App/Plugin
      if (manifest.objects) {
        this.logger.debug('Registering objects from manifest', { id, objectCount: manifest.objects.length });
        for (const obj of manifest.objects) {
            // Ensure object name is registered globally
            SchemaRegistry.registerObject(obj);
            this.logger.debug('Registered Object', { objectName: obj.name, from: id });
        }
      }

      // Register contributions
       if (manifest.contributes?.kinds) {
          this.logger.debug('Registering kinds from manifest', { id, kindCount: manifest.contributes.kinds.length });
          for (const kind of manifest.contributes.kinds) {
            SchemaRegistry.registerKind(kind);
            this.logger.debug('Registered Kind', { kind: kind.name || kind.type, from: id });
          }
       }
  }

  /**
   * Register a new storage driver
   */
  registerDriver(driver: DriverInterface, isDefault: boolean = false) {
    if (this.drivers.has(driver.name)) {
      this.logger.warn('Driver already registered, skipping', { driverName: driver.name });
      return;
    }

    this.drivers.set(driver.name, driver);
    this.logger.info('Registered driver', { 
      driverName: driver.name, 
      version: driver.version,
      capabilities: driver.supports || 'none'
    });

    if (isDefault || this.drivers.size === 1) {
      this.defaultDriver = driver.name;
      this.logger.info('Set default driver', { driverName: driver.name });
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
      
      this.logger.debug('Resolving driver for object', { 
        objectName, 
        datasourceName,
        hasObjectDef: true 
      });
      
      // If configured for 'default', try to find the default driver
      if (datasourceName === 'default') {
        if (this.defaultDriver && this.drivers.has(this.defaultDriver)) {
          this.logger.debug('Using default driver', { driverName: this.defaultDriver, objectName });
          return this.drivers.get(this.defaultDriver)!;
        }
        // Fallback: If 'default' not explicitly set, use the first available driver?
        // Better to be strict.
      } else {
        // Specific datasource requested
        if (this.drivers.has(datasourceName)) {
            this.logger.debug('Using specific datasource driver', { driverName: datasourceName, objectName });
            return this.drivers.get(datasourceName)!;
        }
        // If not found, fall back to default? Or error?
        // Standard behavior: Error if specific datasource is missing.
        this.logger.error('Datasource not found for object', undefined, { 
          objectName, 
          datasourceName,
          availableDrivers: Array.from(this.drivers.keys())
        });
        throw new Error(`[ObjectQL] Datasource '${datasourceName}' configured for object '${objectName}' is not registered.`);
      }
    }

    // 2. Fallback for ad-hoc objects or missing definitions
    // If we have a default driver, use it.
    if (this.defaultDriver) {
      if (!object) {
        this.logger.warn('Object not found in registry, using default driver', { objectName });
      }
      return this.drivers.get(this.defaultDriver)!;
    }

    this.logger.error('No driver available for object', undefined, { 
      objectName,
      registeredDrivers: Array.from(this.drivers.keys())
    });
    throw new Error(`[ObjectQL] No driver available for object '${objectName}'`);
  }

  /**
   * Initialize the engine and all registered drivers
   */
  async init() {
    this.logger.info('Initializing ObjectQL engine', { 
      driverCount: this.drivers.size,
      drivers: Array.from(this.drivers.keys())
    });
    
    for (const [name, driver] of this.drivers) {
      try {
        this.logger.debug('Connecting driver', { driverName: name });
        await driver.connect();
        this.logger.info('Driver connected successfully', { driverName: name });
      } catch (e) {
        this.logger.error('Failed to connect driver', e as Error, { driverName: name });
      }
    }
    
    this.logger.info('ObjectQL engine initialization complete');
    // In a real app, we would sync schemas here
  }

  async destroy() {
    this.logger.info('Destroying ObjectQL engine', { driverCount: this.drivers.size });
    
    for (const [name, driver] of this.drivers.entries()) {
      try {
        this.logger.debug('Disconnecting driver', { driverName: name });
        await driver.disconnect();
        this.logger.debug('Driver disconnected', { driverName: name });
      } catch (e) {
        this.logger.error('Error disconnecting driver', e as Error, { driverName: name });
      }
    }
    
    this.logger.info('ObjectQL engine destroyed');
  }

  // ============================================
  // Data Access Methods (IDataEngine Interface)
  // ============================================

  /**
   * Find records matching a query (IDataEngine interface)
   * 
   * @param object - Object name
   * @param query - Query options (IDataEngine format)
   * @returns Promise resolving to array of records
   */
  async find(object: string, query?: DataEngineQueryOptions): Promise<any[]> {
    this.logger.debug('Find operation starting', { object, query });
    
    const driver = this.getDriver(object);
    
    // Convert DataEngineQueryOptions to QueryAST
    let ast: QueryAST = { object };
    
    if (query) {
      // Map DataEngineQueryOptions to QueryAST
      if (query.filter) {
        ast.where = query.filter;
      }
      if (query.select) {
        ast.fields = query.select;
      }
      if (query.sort) {
        // Convert sort Record to orderBy array
        // sort: { createdAt: -1, name: 'asc' } => orderBy: [{ field: 'createdAt', order: 'desc' }, { field: 'name', order: 'asc' }]
        ast.orderBy = Object.entries(query.sort).map(([field, order]) => ({
          field,
          order: (order === -1 || order === 'desc') ? 'desc' : 'asc'
        }));
      }
      // Handle both limit and top (top takes precedence)
      if (query.top !== undefined) {
        ast.limit = query.top;
      } else if (query.limit !== undefined) {
        ast.limit = query.limit;
      }
      if (query.skip !== undefined) {
        ast.offset = query.skip;
      }
    }

    // Set default limit if not specified
    if (ast.limit === undefined) ast.limit = 100;

    this.logger.debug('Converted query to AST', { object, ast });

    // Trigger Before Hook
    const hookContext: HookContext = {
        object,
        event: 'beforeFind',
        input: { ast, options: undefined },
        ql: this
    };
    await this.triggerHooks('beforeFind', hookContext);

    try {
        this.logger.debug('Executing driver.find', { 
          object, 
          driver: driver.name,
          ast: hookContext.input.ast 
        });
        
        const result = await driver.find(object, hookContext.input.ast, hookContext.input.options);
        
        this.logger.debug('Find operation completed', { 
          object, 
          resultCount: result?.length ?? 0 
        });
        
        // Trigger After Hook
        hookContext.event = 'afterFind';
        hookContext.result = result;
        await this.triggerHooks('afterFind', hookContext);
        
        return hookContext.result;
    } catch (e) {
        this.logger.error('Find operation failed', e as Error, { object });
        throw e;
    }
  }

  async findOne(object: string, idOrQuery: string | any, options?: DriverOptions) {
    this.logger.debug('FindOne operation starting', { object, idOrQuery: typeof idOrQuery });
    
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

    this.logger.debug('Executing driver.findOne', { object, driver: driver.name, ast });
    
    try {
      const result = await driver.findOne(object, ast, options);
      this.logger.debug('FindOne operation completed', { object, found: !!result });
      return result;
    } catch (e) {
      this.logger.error('FindOne operation failed', e as Error, { object });
      throw e;
    }
  }

  /**
   * Insert a new record (IDataEngine interface)
   * 
   * @param object - Object name
   * @param data - Data to insert
   * @returns Promise resolving to the created record
   */
  async insert(object: string, data: any): Promise<any> {
    this.logger.debug('Insert operation starting', { object, hasData: !!data });
    
    const driver = this.getDriver(object);
    
    // 1. Get Schema
    const schema = SchemaRegistry.getObject(object);
    
    if (schema) {
       this.logger.debug('Schema found for object', { object });
       // TODO: Validation Logic
       // validate(schema, data);
    } else {
       this.logger.debug('No schema found for object', { object });
    }
    
    // 2. Trigger Before Hook
    const hookContext: HookContext = {
        object,
        event: 'beforeInsert',
        input: { data, options: undefined },
        ql: this
    };
    await this.triggerHooks('beforeInsert', hookContext);
    
    try {
      // 3. Execute Driver
      this.logger.debug('Executing driver.create', { object, driver: driver.name });
      const result = await driver.create(object, hookContext.input.data, hookContext.input.options);
      
      this.logger.debug('Insert operation completed', { object, recordId: result?.id });
      
      // 4. Trigger After Hook
      hookContext.event = 'afterInsert';
      hookContext.result = result;
      await this.triggerHooks('afterInsert', hookContext);

      return hookContext.result;
    } catch (e) {
      this.logger.error('Insert operation failed', e as Error, { object });
      throw e;
    }
  }

  /**
   * Update a record by ID (IDataEngine interface)
   * 
   * @param object - Object name
   * @param id - Record ID
   * @param data - Updated data
   * @returns Promise resolving to the updated record
   */
  async update(object: string, id: any, data: any): Promise<any> {
    this.logger.debug('Update operation starting', { object, id, hasData: !!data });
    
    const driver = this.getDriver(object);

    const hookContext: HookContext = {
        object,
        event: 'beforeUpdate',
        input: { id, data, options: undefined },
        ql: this
    };
    await this.triggerHooks('beforeUpdate', hookContext);

    try {
      this.logger.debug('Executing driver.update', { object, id, driver: driver.name });
      const result = await driver.update(object, hookContext.input.id, hookContext.input.data, hookContext.input.options);

      this.logger.debug('Update operation completed', { object, id });

      hookContext.event = 'afterUpdate';
      hookContext.result = result;
      await this.triggerHooks('afterUpdate', hookContext);
      
      return hookContext.result;
    } catch (e) {
      this.logger.error('Update operation failed', e as Error, { object, id });
      throw e;
    }
  }

  /**
   * Delete a record by ID (IDataEngine interface)
   * 
   * @param object - Object name
   * @param id - Record ID
   * @returns Promise resolving to true if deleted, false otherwise
   */
  async delete(object: string, id: any): Promise<boolean> {
    this.logger.debug('Delete operation starting', { object, id });
    
    const driver = this.getDriver(object);

    const hookContext: HookContext = {
        object,
        event: 'beforeDelete',
        input: { id, options: undefined },
        ql: this
    };
    await this.triggerHooks('beforeDelete', hookContext);

    try {
      this.logger.debug('Executing driver.delete', { object, id, driver: driver.name });
      const result = await driver.delete(object, hookContext.input.id, hookContext.input.options);

      this.logger.debug('Delete operation completed', { object, id, deleted: result });

      hookContext.event = 'afterDelete';
      hookContext.result = result;
      await this.triggerHooks('afterDelete', hookContext);

      // Driver.delete() already returns boolean per DriverInterface spec
      return hookContext.result;
    } catch (e) {
      this.logger.error('Delete operation failed', e as Error, { object, id });
      throw e;
    }
  }
}
