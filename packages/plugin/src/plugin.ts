/**
 * Runtime interfaces for ObjectStack plugins.
 * These define the contract that every plugin must implement to be loaded by ObjectOS.
 */

/**
 * Logger interface provided to plugins for structured logging.
 */
export interface PluginLogger {
  /** Log an informational message */
  info(message: string, meta?: Record<string, any>): void;
  /** Log a warning message */
  warn(message: string, meta?: Record<string, any>): void;
  /** Log an error message */
  error(message: string, error?: Error, meta?: Record<string, any>): void;
  /** Log a debug message */
  debug(message: string, meta?: Record<string, any>): void;
}

/**
 * ObjectQL Client interface for database operations.
 * Provides a GraphQL-like query interface to the ObjectStack data layer.
 */
export interface ObjectQLClient {
  /**
   * Execute a query against the ObjectQL engine.
   * @param query - The ObjectQL query string
   * @param variables - Optional variables for the query
   * @returns Promise resolving to query results
   */
  query<T = any>(query: string, variables?: Record<string, any>): Promise<T>;
  
  /**
   * Execute a mutation against the ObjectQL engine.
   * @param mutation - The ObjectQL mutation string
   * @param variables - Optional variables for the mutation
   * @returns Promise resolving to mutation results
   */
  mutate<T = any>(mutation: string, variables?: Record<string, any>): Promise<T>;
}

/**
 * ObjectOS Kernel interface.
 * Provides access to core operating system services.
 */
export interface ObjectOSKernel {
  /**
   * Get a reference to another installed plugin by its ID.
   * @param pluginId - The unique identifier of the plugin
   * @returns The plugin instance or null if not found
   */
  getPlugin(pluginId: string): any | null;
  
  /**
   * Emit an event to the system event bus.
   * @param event - The event name
   * @param data - The event payload
   */
  emit(event: string, data?: any): void;
  
  /**
   * Subscribe to system events.
   * @param event - The event name to listen for
   * @param handler - Callback function to handle the event
   * @returns Unsubscribe function
   */
  on(event: string, handler: (data: any) => void): () => void;
}

/**
 * Plugin Context provided to plugin lifecycle methods.
 * This context gives plugins access to the ObjectStack runtime environment.
 */
export interface PluginContext {
  /**
   * ObjectQL client for database operations.
   * Use this to query and mutate data in the ObjectStack data layer.
   */
  ql: ObjectQLClient;
  
  /**
   * ObjectOS kernel for system-level operations.
   * Use this to interact with other plugins and system services.
   */
  os: ObjectOSKernel;
  
  /**
   * Logger instance for structured logging.
   * All logs are automatically tagged with the plugin ID.
   */
  logger: PluginLogger;
  
  /**
   * The unique identifier of this plugin.
   */
  pluginId: string;
  
  /**
   * Plugin configuration values (from manifest or runtime config).
   */
  config: Record<string, any>;
}

/**
 * ObjectStackPlugin interface.
 * Every plugin must implement this interface to be loaded by ObjectOS.
 * 
 * Lifecycle:
 * 1. onInstall - Called once when the plugin is first installed
 * 2. onEnable - Called when the plugin is enabled (on every startup if auto-enabled)
 * 3. onDisable - Called when the plugin is disabled or before uninstall
 */
export interface ObjectStackPlugin {
  /**
   * Called once when the plugin is first installed.
   * Use this to set up initial data, create tables, register schemas, etc.
   * 
   * @param ctx - Plugin context with access to ql, os, and logger
   * @returns Promise that resolves when installation is complete
   */
  onInstall(ctx: PluginContext): Promise<void>;
  
  /**
   * Called when the plugin is enabled.
   * This is called on every system startup if the plugin is set to auto-enable.
   * Use this to register event handlers, start background tasks, etc.
   * 
   * @param ctx - Plugin context with access to ql, os, and logger
   * @returns Promise that resolves when plugin is ready
   */
  onEnable(ctx: PluginContext): Promise<void>;
  
  /**
   * Called when the plugin is disabled.
   * Use this to clean up resources, unregister handlers, stop background tasks, etc.
   * Should gracefully handle being called multiple times.
   * 
   * @param ctx - Plugin context with access to ql, os, and logger
   * @returns Promise that resolves when cleanup is complete
   */
  onDisable(ctx: PluginContext): Promise<void>;
}

/**
 * Plugin factory function type.
 * A plugin module should export a default function that creates a plugin instance.
 */
export type PluginFactory = () => ObjectStackPlugin;
