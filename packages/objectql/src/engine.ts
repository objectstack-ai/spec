// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { QueryAST, HookContext } from '@objectstack/spec/data';
import { 
  DataEngineQueryOptions, 
  DataEngineInsertOptions, 
  DataEngineUpdateOptions, 
  DataEngineDeleteOptions,
  DataEngineAggregateOptions,
  DataEngineCountOptions 
} from '@objectstack/spec/data';
import { ExecutionContext, ExecutionContextSchema } from '@objectstack/spec/kernel';
import { DriverInterface, IDataEngine, Logger, createLogger } from '@objectstack/core';
import { CoreServiceName } from '@objectstack/spec/system';
import { SchemaRegistry } from './registry.js';

export type HookHandler = (context: HookContext) => Promise<void> | void;

/**
 * Per-object hook entry with priority support
 */
export interface HookEntry {
  handler: HookHandler;
  object?: string | string[];  // undefined = global hook
  priority: number;
}

/**
 * Operation Context for Middleware Chain
 */
export interface OperationContext {
  object: string;
  operation: 'find' | 'findOne' | 'insert' | 'update' | 'delete' | 'count' | 'aggregate';
  ast?: QueryAST;
  data?: any;
  options?: any;
  context?: ExecutionContext;
  result?: any;
}

/**
 * Engine Middleware (Onion model)
 */
export type EngineMiddleware = (
  ctx: OperationContext,
  next: () => Promise<void>
) => Promise<void>;

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
  
  // Per-object hooks with priority support
  private hooks: Map<string, HookEntry[]> = new Map([
    ['beforeFind', []], ['afterFind', []],
    ['beforeInsert', []], ['afterInsert', []],
    ['beforeUpdate', []], ['afterUpdate', []],
    ['beforeDelete', []], ['afterDelete', []],
  ]);

  // Middleware chain (onion model)
  private middlewares: Array<{
    fn: EngineMiddleware;
    object?: string;
  }> = [];
  
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
   * @param options Optional: target object(s) and priority
   */
  registerHook(event: string, handler: HookHandler, options?: {
    object?: string | string[];
    priority?: number;
  }) {
    if (!this.hooks.has(event)) {
        this.hooks.set(event, []);
    }
    const entries = this.hooks.get(event)!;
    entries.push({
      handler,
      object: options?.object,
      priority: options?.priority ?? 100,
    });
    // Sort by priority (lower runs first)
    entries.sort((a, b) => a.priority - b.priority);
    this.logger.debug('Registered hook', { event, object: options?.object, priority: options?.priority ?? 100, totalHandlers: entries.length });
  }

  public async triggerHooks(event: string, context: HookContext) {
    const entries = this.hooks.get(event) || [];
    
    if (entries.length === 0) {
      this.logger.debug('No hooks registered for event', { event });
      return;
    }

    this.logger.debug('Triggering hooks', { event, count: entries.length });
    
    for (const entry of entries) {
      // Per-object matching
      if (entry.object) {
        const targets = Array.isArray(entry.object) ? entry.object : [entry.object];
        if (!targets.includes('*') && !targets.includes(context.object)) {
          continue; // Skip non-matching hooks
        }
      }
      await entry.handler(context);
    }
  }

  /**
   * Register a middleware function
   * Middlewares execute in onion model around every data operation.
   * @param fn The middleware function
   * @param options Optional: target object filter
   */
  registerMiddleware(fn: EngineMiddleware, options?: { object?: string }): void {
    this.middlewares.push({ fn, object: options?.object });
    this.logger.debug('Registered middleware', { object: options?.object, total: this.middlewares.length });
  }

  /**
   * Execute an operation through the middleware chain
   */
  private async executeWithMiddleware(ctx: OperationContext, executor: () => Promise<any>): Promise<any> {
    const applicable = this.middlewares.filter(m =>
      !m.object || m.object === '*' || m.object === ctx.object
    );

    let index = 0;
    const next = async (): Promise<void> => {
      if (index < applicable.length) {
        const mw = applicable[index++];
        await mw.fn(ctx, next);
      } else {
        ctx.result = await executor();
      }
    };

    await next();
    return ctx.result;
  }

  /**
   * Build a HookContext.session from ExecutionContext
   */
  private buildSession(execCtx?: ExecutionContext): HookContext['session'] {
    if (!execCtx) return undefined;
    return {
      userId: execCtx.userId,
      tenantId: execCtx.tenantId,
      roles: execCtx.roles,
      accessToken: execCtx.accessToken,
    };
  }

  /**
   * Register contribution (Manifest)
   * 
   * Installs the manifest as a Package (the unit of installation),
   * then decomposes it into individual metadata items (objects, apps, actions, etc.)
   * and registers each into the SchemaRegistry.
   * 
   * Key: Package ≠ App. The manifest is the package. The apps[] array inside
   * the manifest contains UI navigation definitions (AppSchema).
   */
  registerApp(manifest: any) {
      const id = manifest.id || manifest.name;
      const namespace = manifest.namespace as string | undefined;
      this.logger.debug('Registering package manifest', { id, namespace });

      // 1. Register the Package (manifest + lifecycle state)
      SchemaRegistry.installPackage(manifest);
      this.logger.debug('Installed Package', { id: manifest.id, name: manifest.name, namespace });

      // 2. Register owned objects
      if (manifest.objects) {
          if (Array.isArray(manifest.objects)) {
             this.logger.debug('Registering objects from manifest (Array)', { id, objectCount: manifest.objects.length });
             for (const objDef of manifest.objects) {
                const fqn = SchemaRegistry.registerObject(objDef, id, namespace, 'own');
                this.logger.debug('Registered Object', { fqn, from: id });
             }
          } else {
             this.logger.debug('Registering objects from manifest (Map)', { id, objectCount: Object.keys(manifest.objects).length });
             for (const [name, objDef] of Object.entries(manifest.objects)) {
                // Ensure name in definition matches key
                (objDef as any).name = name;
                const fqn = SchemaRegistry.registerObject(objDef as any, id, namespace, 'own');
                this.logger.debug('Registered Object', { fqn, from: id });
             }
          }
      }

      // 2b. Register object extensions (fields added to objects owned by other packages)
      if (Array.isArray(manifest.objectExtensions) && manifest.objectExtensions.length > 0) {
          this.logger.debug('Registering object extensions', { id, count: manifest.objectExtensions.length });
          for (const ext of manifest.objectExtensions) {
              const targetFqn = ext.extend;
              const priority = ext.priority ?? 200;
              // Create a partial object definition for the extension
              const extDef = {
                  name: targetFqn, // Use the target FQN as name
                  fields: ext.fields,
                  label: ext.label,
                  pluralLabel: ext.pluralLabel,
                  description: ext.description,
                  validations: ext.validations,
                  indexes: ext.indexes,
              };
              // Register as extension (namespace is undefined since we're targeting by FQN)
              SchemaRegistry.registerObject(extDef as any, id, undefined, 'extend', priority);
              this.logger.debug('Registered Object Extension', { target: targetFqn, priority, from: id });
          }
      }

      // 3. Register apps (UI navigation definitions) as their own metadata type
      if (Array.isArray(manifest.apps) && manifest.apps.length > 0) {
          this.logger.debug('Registering apps from manifest', { id, count: manifest.apps.length });
          for (const app of manifest.apps) {
              const appName = app.name || app.id;
              if (appName) {
                  SchemaRegistry.registerApp(app, id);
                  this.logger.debug('Registered App', { app: appName, from: id });
              }
          }
      }

      // 4. If manifest itself looks like an App (has navigation), also register as app
      //    This handles the case where the manifest IS the app definition (legacy/simple packages)
      if (manifest.name && manifest.navigation && !manifest.apps?.length) {
          SchemaRegistry.registerApp(manifest, id);
          this.logger.debug('Registered manifest-as-app', { app: manifest.name, from: id });
      }

      // 5. Register all other metadata types generically
      const metadataArrayKeys = [
        // UI Protocol
        'actions', 'views', 'pages', 'dashboards', 'reports', 'themes',
        // Automation Protocol
        'flows', 'workflows', 'approvals', 'webhooks',
        // Security Protocol
        'roles', 'permissions', 'profiles', 'sharingRules', 'policies',
        // AI Protocol
        'agents', 'ragPipelines',
        // API Protocol
        'apis',
        // Data Extensions
        'hooks', 'mappings', 'analyticsCubes',
        // Integration Protocol
        'connectors',
      ];
      for (const key of metadataArrayKeys) {
          const items = (manifest as any)[key];
          if (Array.isArray(items) && items.length > 0) {
              this.logger.debug(`Registering ${key} from manifest`, { id, count: items.length });
              for (const item of items) {
                  const itemName = item.name || item.id;
                  if (itemName) {
                      SchemaRegistry.registerItem(key, item, 'name' as any, id);
                  }
              }
          }
      }

      // 6. Register seed data as metadata (keyed by target object name)
      const seedData = (manifest as any).data;
      if (Array.isArray(seedData) && seedData.length > 0) {
          this.logger.debug('Registering seed data datasets', { id, count: seedData.length });
          for (const dataset of seedData) {
              if (dataset.object) {
                  SchemaRegistry.registerItem('data', dataset, 'object' as any, id);
              }
          }
      }

      // 6. Register contributions
       if (manifest.contributes?.kinds) {
          this.logger.debug('Registering kinds from manifest', { id, kindCount: manifest.contributes.kinds.length });
          for (const kind of manifest.contributes.kinds) {
            SchemaRegistry.registerKind(kind);
            this.logger.debug('Registered Kind', { kind: kind.name || kind.type, from: id });
          }
       }

      // 7. Recursively register nested plugins
      if (Array.isArray(manifest.plugins) && manifest.plugins.length > 0) {
          this.logger.debug('Processing nested plugins', { id, count: manifest.plugins.length });
          for (const plugin of manifest.plugins) {
              if (plugin && typeof plugin === 'object') {
                  const pluginName = plugin.name || plugin.id || 'unnamed-plugin';
                  this.logger.debug('Registering nested plugin', { pluginName, parentId: id });
                  this.registerPlugin(plugin, id, namespace);
              }
          }
      }
  }

  /**
   * Register a nested plugin's metadata (objects, actions, views, etc.)
   *
   * Unlike registerApp(), this does NOT call SchemaRegistry.installPackage()
   * because plugins are not formal manifests — they are lightweight config
   * bundles with objects, actions, triggers, and navigation.
   *
   * @param plugin - The plugin config object
   * @param parentId - The parent package ID (for ownership tracking)
   * @param parentNamespace - The parent package's namespace (for FQN resolution)
   */
  private registerPlugin(plugin: any, parentId: string, parentNamespace?: string) {
      const pluginName = plugin.name || plugin.id || 'unnamed';
      const pluginNamespace = plugin.namespace || parentNamespace;

      // Use parentId as the owning package for namespace consistency.
      // The parent package already claimed the namespace — nested plugins
      // contribute objects UNDER the parent's ownership.
      const ownerId = parentId;

      // Register objects (supports both Array and Map formats)
      if (plugin.objects) {
          try {
              if (Array.isArray(plugin.objects)) {
                  this.logger.debug('Registering plugin objects (Array)', { pluginName, count: plugin.objects.length });
                  for (const objDef of plugin.objects) {
                      const fqn = SchemaRegistry.registerObject(objDef, ownerId, pluginNamespace, 'own');
                      this.logger.debug('Registered Object', { fqn, from: pluginName });
                  }
              } else {
                  const entries = Object.entries(plugin.objects);
                  this.logger.debug('Registering plugin objects (Map)', { pluginName, count: entries.length });
                  for (const [name, objDef] of entries) {
                      (objDef as any).name = name;
                      const fqn = SchemaRegistry.registerObject(objDef as any, ownerId, pluginNamespace, 'own');
                      this.logger.debug('Registered Object', { fqn, from: pluginName });
                  }
              }
          } catch (err: any) {
              this.logger.warn('Failed to register plugin objects', { pluginName, error: err.message });
          }
      }

      // Register plugin as app if it has navigation (for sidebar display)
      if (plugin.name && plugin.navigation) {
          try {
              SchemaRegistry.registerApp(plugin, ownerId);
              this.logger.debug('Registered plugin-as-app', { app: plugin.name, from: pluginName });
          } catch (err: any) {
              this.logger.warn('Failed to register plugin as app', { pluginName, error: err.message });
          }
      }

      // Register metadata arrays (actions, views, triggers, etc.)
      const metadataArrayKeys = [
          'actions', 'views', 'pages', 'dashboards', 'reports', 'themes',
          'flows', 'workflows', 'approvals', 'webhooks',
          'roles', 'permissions', 'profiles', 'sharingRules', 'policies',
          'agents', 'ragPipelines', 'apis',
          'hooks', 'mappings', 'analyticsCubes', 'connectors',
      ];
      for (const key of metadataArrayKeys) {
          const items = (plugin as any)[key];
          if (Array.isArray(items) && items.length > 0) {
              for (const item of items) {
                  const itemName = item.name || item.id;
                  if (itemName) {
                      SchemaRegistry.registerItem(key, item, 'name' as any, ownerId);
                  }
              }
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
   * Resolve an object name to its Fully Qualified Name (FQN).
   * 
   * Short names like 'task' are resolved to FQN like 'todo__task'
   * via SchemaRegistry lookup. If no match is found, the name is
   * returned as-is (for ad-hoc / unregistered objects).
   * 
   * This ensures that all driver operations use a consistent key
   * regardless of whether the caller uses the short name or FQN.
   */
  private resolveObjectName(name: string): string {
    const schema = SchemaRegistry.getObject(name);
    if (schema) {
      return schema.name; // FQN from registry (e.g., 'todo__task')
    }
    return name; // Ad-hoc object, keep as-is
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

    // Map populate (relationship field names) to QueryAST expand entries
    if (options.populate && options.populate.length > 0) {
      ast.expand = {};
      for (const rel of options.populate) {
        ast.expand[rel] = { object: rel };
      }
    }

    return ast;
  }

  // ============================================
  // Data Access Methods (IDataEngine Interface)
  // ============================================

  async find(object: string, query?: DataEngineQueryOptions): Promise<any[]> {
    object = this.resolveObjectName(object);
    this.logger.debug('Find operation starting', { object, query });
    const driver = this.getDriver(object);
    const ast = this.toQueryAST(object, query);

    const opCtx: OperationContext = {
      object,
      operation: 'find',
      ast,
      options: query,
      context: query?.context,
    };

    await this.executeWithMiddleware(opCtx, async () => {
      const hookContext: HookContext = {
          object,
          event: 'beforeFind',
          input: { ast: opCtx.ast, options: opCtx.options },
          session: this.buildSession(opCtx.context),
          transaction: opCtx.context?.transaction,
          ql: this
      };
      await this.triggerHooks('beforeFind', hookContext);

      try {
          const result = await driver.find(object, hookContext.input.ast as QueryAST, hookContext.input.options as any);
          
          hookContext.event = 'afterFind';
          hookContext.result = result;
          await this.triggerHooks('afterFind', hookContext);
          
          return hookContext.result;
      } catch (e) {
          this.logger.error('Find operation failed', e as Error, { object });
          throw e;
      }
    });

    return opCtx.result as any[];
  }

  async findOne(objectName: string, query?: DataEngineQueryOptions): Promise<any> {
    objectName = this.resolveObjectName(objectName);
    this.logger.debug('FindOne operation', { objectName });
    const driver = this.getDriver(objectName);
    const ast = this.toQueryAST(objectName, query);
    ast.limit = 1;

    const opCtx: OperationContext = {
      object: objectName,
      operation: 'findOne',
      ast,
      options: query,
      context: query?.context,
    };

    await this.executeWithMiddleware(opCtx, async () => {
      return driver.findOne(objectName, opCtx.ast as QueryAST);
    });

    return opCtx.result;
  }

  async insert(object: string, data: any | any[], options?: DataEngineInsertOptions): Promise<any> {
    object = this.resolveObjectName(object);
    this.logger.debug('Insert operation starting', { object, isBatch: Array.isArray(data) });
    const driver = this.getDriver(object);

    const opCtx: OperationContext = {
      object,
      operation: 'insert',
      data,
      options,
      context: options?.context,
    };

    await this.executeWithMiddleware(opCtx, async () => {
      const hookContext: HookContext = {
          object,
          event: 'beforeInsert',
          input: { data: opCtx.data, options: opCtx.options },
          session: this.buildSession(opCtx.context),
          transaction: opCtx.context?.transaction,
          ql: this
      };
      await this.triggerHooks('beforeInsert', hookContext);

      try {
        let result;
        if (Array.isArray(hookContext.input.data)) {
          // Bulk Create
          if (driver.bulkCreate) {
               result = await driver.bulkCreate(object, hookContext.input.data as any[], hookContext.input.options as any);
          } else {
               // Fallback loop
               result = await Promise.all((hookContext.input.data as any[]).map((item: any) => driver.create(object, item, hookContext.input.options as any)));
          }
        } else {
          result = await driver.create(object, hookContext.input.data, hookContext.input.options as any);
        }

        hookContext.event = 'afterInsert';
        hookContext.result = result;
        await this.triggerHooks('afterInsert', hookContext);

        return hookContext.result;
      } catch (e) {
        this.logger.error('Insert operation failed', e as Error, { object });
        throw e;
      }
    });

    return opCtx.result;
  }

  async update(object: string, data: any, options?: DataEngineUpdateOptions): Promise<any> {
     object = this.resolveObjectName(object);
     this.logger.debug('Update operation starting', { object });
     const driver = this.getDriver(object);
     
     // 1. Extract ID from data or filter if it's a single update by ID
     let id = data.id || data._id;
     if (!id && options?.filter) {
         if (typeof options.filter === 'string') id = options.filter;
         else if (options.filter._id) id = options.filter._id;
         else if (options.filter.id) id = options.filter.id;
     }

     const opCtx: OperationContext = {
       object,
       operation: 'update',
       data,
       options,
       context: options?.context,
     };

     await this.executeWithMiddleware(opCtx, async () => {
       const hookContext: HookContext = {
          object,
          event: 'beforeUpdate',
          input: { id, data: opCtx.data, options: opCtx.options },
          session: this.buildSession(opCtx.context),
          transaction: opCtx.context?.transaction,
          ql: this
       };
       await this.triggerHooks('beforeUpdate', hookContext);

       try {
           let result;
           if (hookContext.input.id) {
               result = await driver.update(object, hookContext.input.id as string, hookContext.input.data, hookContext.input.options as any);
           } else if (options?.multi && driver.updateMany) {
               const ast = this.toQueryAST(object, { filter: options.filter });
               result = await driver.updateMany(object, ast, hookContext.input.data, hookContext.input.options as any);
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
     });

     return opCtx.result;
  }

  async delete(object: string, options?: DataEngineDeleteOptions): Promise<any> {
    object = this.resolveObjectName(object);
    this.logger.debug('Delete operation starting', { object });
    const driver = this.getDriver(object);

    // Extract ID logic similar to update
    let id: any = undefined;
    if (options?.filter) {
         if (typeof options.filter === 'string') id = options.filter;
         else if (options.filter._id) id = options.filter._id;
         else if (options.filter.id) id = options.filter.id;
    }

    const opCtx: OperationContext = {
      object,
      operation: 'delete',
      options,
      context: options?.context,
    };

    await this.executeWithMiddleware(opCtx, async () => {
      const hookContext: HookContext = {
          object,
          event: 'beforeDelete',
          input: { id, options: opCtx.options },
          session: this.buildSession(opCtx.context),
          transaction: opCtx.context?.transaction,
          ql: this
      };
      await this.triggerHooks('beforeDelete', hookContext);

      try {
          let result;
          if (hookContext.input.id) {
              result = await driver.delete(object, hookContext.input.id as string, hookContext.input.options as any);
          } else if (options?.multi && driver.deleteMany) {
               const ast = this.toQueryAST(object, { filter: options.filter });
               result = await driver.deleteMany(object, ast, hookContext.input.options as any);
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
    });

    return opCtx.result;
  }

  async count(object: string, query?: DataEngineCountOptions): Promise<number> {
     object = this.resolveObjectName(object);
     const driver = this.getDriver(object);

     const opCtx: OperationContext = {
       object,
       operation: 'count',
       options: query,
       context: query?.context,
     };

     await this.executeWithMiddleware(opCtx, async () => {
       if (driver.count) {
           const ast = this.toQueryAST(object, { filter: query?.filter });
           return driver.count(object, ast);
       }
       // Fallback to find().length
       const res = await this.find(object, { filter: query?.filter, select: ['_id'] });
       return res.length;
     });

     return opCtx.result as number;
  }

  async aggregate(object: string, query: DataEngineAggregateOptions): Promise<any[]> {
      object = this.resolveObjectName(object);
      const driver = this.getDriver(object);
      this.logger.debug(`Aggregate on ${object} using ${driver.name}`, query);

      const opCtx: OperationContext = {
        object,
        operation: 'aggregate',
        options: query,
        context: query?.context,
      };

      await this.executeWithMiddleware(opCtx, async () => {
        const ast: QueryAST = {
            object,
            where: query.filter,
            groupBy: query.groupBy,
            aggregations: query.aggregations?.map(agg => ({
                function: agg.method,
                field: agg.field,
                alias: agg.alias || `${agg.method}_${agg.field || 'all'}`,
            })),
        };

        return driver.find(object, ast);
      });

      return opCtx.result as any[];
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

  /**
   * Create a scoped execution context bound to this engine.
   * 
   * Usage:
   *   const ctx = engine.createContext({ userId: '...', tenantId: '...' });
   *   const users = ctx.object('user');
   *   await users.find({ filter: { status: 'active' } });
   */
  createContext(ctx: Partial<ExecutionContext>): ScopedContext {
    return new ScopedContext(
      ExecutionContextSchema.parse(ctx),
      this
    );
  }
}

/**
 * Repository scoped to a single object, bound to an execution context.
 */
export class ObjectRepository {
  constructor(
    private objectName: string,
    private context: ExecutionContext,
    private engine: IDataEngine
  ) {}

  async find(query: any = {}): Promise<any[]> {
    return this.engine.find(this.objectName, {
      ...query,
      context: this.context,
    });
  }

  async findOne(query: any = {}): Promise<any> {
    return this.engine.findOne(this.objectName, {
      ...query,
      context: this.context,
    });
  }

  async insert(data: any): Promise<any> {
    return this.engine.insert(this.objectName, data, {
      context: this.context,
    });
  }

  async update(data: any, options: any = {}): Promise<any> {
    return this.engine.update(this.objectName, data, {
      ...options,
      context: this.context,
    });
  }

  async delete(options: any = {}): Promise<any> {
    return this.engine.delete(this.objectName, {
      ...options,
      context: this.context,
    });
  }

  async count(query: any = {}): Promise<number> {
    return this.engine.count(this.objectName, {
      ...query,
      context: this.context,
    });
  }
}

/**
 * Scoped execution context with object() accessor.
 */
export class ScopedContext {
  constructor(
    private executionContext: ExecutionContext,
    private engine: IDataEngine
  ) {}

  /** Get a repository scoped to this context */
  object(name: string): ObjectRepository {
    return new ObjectRepository(name, this.executionContext, this.engine);
  }

  /** Create an elevated (system) context */
  sudo(): ScopedContext {
    return new ScopedContext(
      { ...this.executionContext, isSystem: true },
      this.engine
    );
  }

  get userId() { return this.executionContext.userId; }
  get tenantId() { return this.executionContext.tenantId; }
  get roles() { return this.executionContext.roles; }
}
