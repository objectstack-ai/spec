import { QueryAST, HookContext } from '@objectstack/spec/data';
import { 
  DataEngineQueryOptions, 
  DataEngineInsertOptions, 
  DataEngineUpdateOptions, 
  DataEngineDeleteOptions,
  DataEngineAggregateOptions,
  DataEngineCountOptions 
} from '@objectstack/spec/data';
import { DriverInterface, IDataEngine, Logger, createLogger } from '@objectstack/core';
import { CoreServiceName } from '@objectstack/spec/system';
import { SchemaRegistry } from './registry.js';

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
 * Acts as the reference implementation for:
 * - CoreServiceName.data (CRUD)
 * - CoreServiceName.metadata (Schema Registry)
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
   * Service Status Report
   * Used by Kernel to verify health and capabilities.
   */
  getStatus() {
      return {
          name: CoreServiceName.enum.data,
          status: 'running',
          version: '0.9.0',
          features: ['crud', 'query', 'aggregate', 'transactions', 'metadata']
      };
  }

  /**
   * Expose the SchemaRegistry for plugins to register metadata
   */
  get registry() {
    return SchemaRegistry;
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

    this.logger.debug('Triggering hooks', { event, count: handlers.length });
    
    for (const handler of handlers) {
      await handler(context);
    }
  }

  /**
   * Register contribution (Manifest)
   */
  registerApp(manifest: any) {
      const id = manifest.id || manifest.name;
      this.logger.debug('Registering app manifest', { id });

      // Register the App Definition itself
      if (manifest.name) {
          SchemaRegistry.registerApp(manifest);
          this.logger.debug('Registered App Definition', { app: manifest.name });
      }

      // Register objects
      if (manifest.objects) {
          if (Array.isArray(manifest.objects)) {
             this.logger.debug('Registering objects from manifest (Array)', { id, objectCount: manifest.objects.length });
             for (const objDef of manifest.objects) {
                SchemaRegistry.registerObject(objDef);
                this.logger.debug('Registered Object', { object: objDef.name, from: id });
             }
          } else {
             this.logger.debug('Registering objects from manifest (Map)', { id, objectCount: Object.keys(manifest.objects).length });
             for (const [name, objDef] of Object.entries(manifest.objects)) {
                // Ensure name in definition matches key
                (objDef as any).name = name;
                SchemaRegistry.registerObject(objDef as any);
                this.logger.debug('Registered Object', { object: name, from: id });
             }
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
      version: driver.version
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
      
      // If configured for 'default', try to find the default driver
      if (datasourceName === 'default') {
        if (this.defaultDriver && this.drivers.has(this.defaultDriver)) {
          return this.drivers.get(this.defaultDriver)!;
        }
      } else {
        // Specific datasource requested
        if (this.drivers.has(datasourceName)) {
            return this.drivers.get(datasourceName)!;
        }
        throw new Error(`[ObjectQL] Datasource '${datasourceName}' configured for object '${objectName}' is not registered.`);
      }
    }

    // 2. Fallback for ad-hoc objects or missing definitions
    if (this.defaultDriver) {
      return this.drivers.get(this.defaultDriver)!;
    }

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
        await driver.connect();
        this.logger.info('Driver connected successfully', { driverName: name });
      } catch (e) {
        this.logger.error('Failed to connect driver', e as Error, { driverName: name });
      }
    }
    
    this.logger.info('ObjectQL engine initialization complete');
  }

  async destroy() {
    this.logger.info('Destroying ObjectQL engine', { driverCount: this.drivers.size });
    
    for (const [name, driver] of this.drivers.entries()) {
      try {
        await driver.disconnect();
      } catch (e) {
        this.logger.error('Error disconnecting driver', e as Error, { driverName: name });
      }
    }
    
    this.logger.info('ObjectQL engine destroyed');
  }

  // ============================================
  // Helper: Query Conversion
  // ============================================

  private toQueryAST(object: string, options?: DataEngineQueryOptions): QueryAST {
    const ast: QueryAST = { object };
    if (!options) return ast;

    if (options.filter) {
      ast.where = options.filter;
    }
    if (options.select) {
      ast.fields = options.select;
    }
    if (options.sort) {
       // Support DataEngineSortSchema variant
       if (Array.isArray(options.sort)) {
           // [{ field: 'a', order: 'asc' }]
           ast.orderBy = options.sort; 
       } else {
           // Record<string, 'asc' | 'desc' | 1 | -1>
           ast.orderBy = Object.entries(options.sort).map(([field, order]) => ({
             field,
             order: (order === -1 || order === 'desc') ? 'desc' : 'asc'
           }));
       }
    }
    
    if (options.top !== undefined) ast.limit = options.top;
    else if (options.limit !== undefined) ast.limit = options.limit;
    
    if (options.skip !== undefined) ast.offset = options.skip;

    // TODO: Handle populate/joins mapping if Driver supports it in QueryAST
    return ast;
  }

  // ============================================
  // Data Access Methods (IDataEngine Interface)
  // ============================================

  async find(object: string, query?: DataEngineQueryOptions): Promise<any[]> {
    this.logger.debug('Find operation starting', { object, query });
    const driver = this.getDriver(object);
    const ast = this.toQueryAST(object, query);

    const hookContext: HookContext = {
        object,
        event: 'beforeFind',
        input: { ast, options: undefined }, // Should map options?
        ql: this
    };
    await this.triggerHooks('beforeFind', hookContext);

    try {
        const result = await driver.find(object, hookContext.input.ast, hookContext.input.options);
        
        hookContext.event = 'afterFind';
        hookContext.result = result;
        await this.triggerHooks('afterFind', hookContext);
        
        return hookContext.result;
    } catch (e) {
        this.logger.error('Find operation failed', e as Error, { object });
        throw e;
    }
  }

  async findOne(objectName: string, query?: DataEngineQueryOptions): Promise<any> {
    this.logger.debug('FindOne operation', { objectName });
    const driver = this.getDriver(objectName);
    const ast = this.toQueryAST(objectName, query);
    ast.limit = 1;

    // Reuse find logic or call generic driver.findOne if available
    // Assuming driver has findOne
    return driver.findOne(objectName, ast);
  }

  async insert(object: string, data: any | any[], options?: DataEngineInsertOptions): Promise<any> {
    this.logger.debug('Insert operation starting', { object, isBatch: Array.isArray(data) });
    const driver = this.getDriver(object);

    const hookContext: HookContext = {
        object,
        event: 'beforeInsert',
        input: { data, options },
        ql: this
    };
    await this.triggerHooks('beforeInsert', hookContext);

    try {
      let result;
      if (Array.isArray(hookContext.input.data)) {
        // Bulk Create
        if (driver.bulkCreate) {
             result = await driver.bulkCreate(object, hookContext.input.data, hookContext.input.options);
        } else {
             // Fallback loop
             result = await Promise.all(hookContext.input.data.map((item: any) => driver.create(object, item, hookContext.input.options)));
        }
      } else {
        result = await driver.create(object, hookContext.input.data, hookContext.input.options);
      }

      hookContext.event = 'afterInsert';
      hookContext.result = result;
      await this.triggerHooks('afterInsert', hookContext);

      return hookContext.result;
    } catch (e) {
      this.logger.error('Insert operation failed', e as Error, { object });
      throw e;
    }
  }

  async update(object: string, data: any, options?: DataEngineUpdateOptions): Promise<any> {
     // NOTE: This signature is tricky because Driver expects (obj, id, data) usually.
     // DataEngine protocol puts filter in options.
     this.logger.debug('Update operation starting', { object });
     const driver = this.getDriver(object);
     
     // 1. Extract ID from data or filter if it's a single update by ID
     // This is a simplification. Real implementation needs robust filter handling.
     let id = data.id || data._id;
     if (!id && options?.filter) {
         // Optimization: If filter is simple ID check, extract it
         if (typeof options.filter === 'string') id = options.filter;
         else if (options.filter._id) id = options.filter._id;
         else if (options.filter.id) id = options.filter.id;
     }

     const hookContext: HookContext = {
        object,
        event: 'beforeUpdate',
        input: { id, data, options },
        ql: this
    };
    await this.triggerHooks('beforeUpdate', hookContext);

     try {
         let result;
         if (hookContext.input.id) {
             // Single update by ID
             result = await driver.update(object, hookContext.input.id, hookContext.input.data, hookContext.input.options);
         } else if (options?.multi && driver.updateMany) {
             // Bulk update by Query
             const ast = this.toQueryAST(object, { filter: options.filter });
             result = await driver.updateMany(object, ast, hookContext.input.data, hookContext.input.options);
         } else {
             throw new Error('Update requires an ID or options.multi=true');
         }

         hookContext.event = 'afterUpdate';
         hookContext.result = result;
         await this.triggerHooks('afterUpdate', hookContext);
         return hookContext.result;
     } catch (e) {
        this.logger.error('Update operation failed', e as Error, { object });
        throw e;
     }
  }

  async delete(object: string, options?: DataEngineDeleteOptions): Promise<any> {
    this.logger.debug('Delete operation starting', { object });
    const driver = this.getDriver(object);

    // Extract ID logic similar to update
    let id: any = undefined;
    if (options?.filter) {
         if (typeof options.filter === 'string') id = options.filter;
         else if (options.filter._id) id = options.filter._id;
         else if (options.filter.id) id = options.filter.id;
    }

    const hookContext: HookContext = {
        object,
        event: 'beforeDelete',
        input: { id, options },
        ql: this
    };
    await this.triggerHooks('beforeDelete', hookContext);

    try {
        let result;
        if (hookContext.input.id) {
            result = await driver.delete(object, hookContext.input.id, hookContext.input.options);
        } else if (options?.multi && driver.deleteMany) {
             const ast = this.toQueryAST(object, { filter: options.filter });
             result = await driver.deleteMany(object, ast, hookContext.input.options);
        } else {
             throw new Error('Delete requires an ID or options.multi=true');
        }

        hookContext.event = 'afterDelete';
        hookContext.result = result;
        await this.triggerHooks('afterDelete', hookContext);
        return hookContext.result;
    } catch (e) {
        this.logger.error('Delete operation failed', e as Error, { object });
        throw e;
    }
  }

  async count(object: string, query?: DataEngineCountOptions): Promise<number> {
     const driver = this.getDriver(object);
     if (driver.count) {
         const ast = this.toQueryAST(object, { filter: query?.filter });
         return driver.count(object, ast);
     }
     // Fallback to find().length
     const res = await this.find(object, { filter: query?.filter, select: ['_id'] });
     return res.length;
  }

  async aggregate(object: string, query: DataEngineAggregateOptions): Promise<any[]> {
      const driver = this.getDriver(object);
      this.logger.debug(`Aggregate on ${object} using ${driver.name}`, query);
      // Driver needs support for raw aggregation or mapped aggregation
      // For now, if driver supports 'execute', we might pass it down, or we need to add 'aggregate' to DriverInterface
      // In this version, we'll assume driver might handle it via special 'find' or throw not implemented
      throw new Error('Aggregate not yet fully implemented in ObjectQL->Driver mapping');
  }
  
  async execute(command: any, options?: Record<string, any>): Promise<any> {
      // Direct pass-through implies we know which driver to use?
      // Usually execute is tied to a specific object context OR we need a way to select driver.
      // If command has 'object', we use that.
      if (options?.object) {
          const driver = this.getDriver(options.object);
          if (driver.execute) {
              return driver.execute(command, undefined, options);
          }
      }
      throw new Error('Execute requires options.object to select driver');
  }
}
