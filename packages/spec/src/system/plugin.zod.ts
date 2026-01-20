import { z } from 'zod';

/**
 * Interface schemas for Context Capabilities
 */
export const LoggerSchema = z.object({
  debug: z.any().describe('(message: string, ...meta: any[]) => void'),
  info: z.any().describe('(message: string, ...meta: any[]) => void'),
  warn: z.any().describe('(message: string, ...meta: any[]) => void'),
  error: z.any().describe('(message: string, ...meta: any[]) => void'),
}).describe('Structured Logger');

export const ObjectQLClientSchema = z.object({
  object: z.function().args(z.string()).returns(z.any()).describe('Get query interface for an object'),
  query: z.function().args(z.string()).returns(z.promise(z.any())).describe('Execute arbitrary SOQL-like query'),
}).describe('ObjectQL Data Access Client');

export const RouterSchema = z.object({
  get: z.function().args(z.string(), z.function()).describe('Register GET route'),
  post: z.function().args(z.string(), z.function()).describe('Register POST route'),
  use: z.function().args(z.string().optional(), z.function()).describe('Register Middleware'),
}).describe('HTTP Router Interface');

export const SchedulerSchema = z.object({
    schedule: z.function().args(z.string(), z.string(), z.function()).describe('Schedule a cron job'),
}).describe('Job Scheduler Interface');

export const SystemAPISchema = z.object({
  getCurrentUser: z.function().returns(z.promise(z.any())),
  getConfig: z.function().args(z.string()).returns(z.promise(z.any())),
}).describe('Access to System Core');

export const ScopedStorageSchema = z.object({
  get: z.function().args(z.string()).returns(z.promise(z.any())).describe('Get value by key'),
  set: z.function().args(z.string(), z.any()).returns(z.promise(z.void())).describe('Set value for key'),
  delete: z.function().args(z.string()).returns(z.promise(z.void())).describe('Delete key'),
}).describe('Plugin Scoped Data Storage (KV)');

export const I18nContextSchema = z.object({
  t: z.function().args(z.string(), z.record(z.any()).optional()).returns(z.string()).describe('Translate a key'),
  getLocale: z.function().returns(z.string()).describe('Get current context locale'),
}).describe('Internationalization Helper');

/**
 * Plugin Context Schema
 * 
 * This defines the runtime context available to plugins during their lifecycle.
 * The context provides access to core ObjectStack APIs and services.
 * 
 * @example
 * export default {
 *   onEnable: async (context: PluginContext) => {
 *     const { ql, os, logger } = context;
 *     logger.info('Plugin enabled');
 *     await ql.object('custom_object').find({});
 *   }
 * };
 */
export const PluginContextSchema = z.object({
  /**
   * ObjectQL data access API.
   * Provides methods to query and manipulate business objects.
   * 
   * @example
   * await context.ql.object('account').find({ status: 'active' });
   * await context.ql.object('contact').create({ name: 'John Doe' });
   */
  ql: ObjectQLClientSchema,

  /**
   * ObjectOS system API.
   * Provides access to system-level functionality and configuration.
   * 
   * @example
   * const user = await context.os.getCurrentUser();
   * const config = await context.os.getConfig('plugin.settings');
   */
  os: SystemAPISchema,

  /**
   * Logging interface.
   * Provides structured logging capabilities with different levels.
   * 
   * @example
   * context.logger.info('Operation completed');
   * context.logger.error('Operation failed', { error });
   */
  logger: LoggerSchema,

  /**
   * Scoped Storage.
   * Key-Value store isolated for this plugin.
   * 
   * @example
   * await context.storage.set('last_sync', Date.now());
   */
  storage: ScopedStorageSchema,

  /**
   * I18n Helper.
   * 
   * @example
   * const msg = context.i18n.t('error.invalid_input');
   */
  i18n: I18nContextSchema,

  /**
   * Metadata registry.
   * Provides access to system metadata like object schemas, field definitions, etc.
   * 
   * @example
   * const schema = await context.metadata.getObject('account');
   * const fields = await context.metadata.getFields('account');
   */
  metadata: z.any().describe('Metadata registry'),

  /**
   * Event bus.
   * Provides pub/sub capabilities for system and custom events.
   * 
   * @example
   * context.events.on('record.created', handler);
   * context.events.emit('custom.event', data);
   */
  events: z.any().describe('Event bus'),

  /**
   * Application Runtime Capabilities.
   * Provides mechanisms to extend the running application (Routes, Jobs, etc).
   */
  app: z.object({
    router: RouterSchema,
    scheduler: SchedulerSchema.optional(),
  }).describe('App Runtime Capabilities'),
});

/**
 * Plugin Lifecycle Schema
 * 
 * This defines the lifecycle hooks available to plugins.
 * Plugins can implement any or all of these hooks to respond to lifecycle events.
 * 
 * All hooks receive PluginContext as their first parameter.
 * All hooks are optional and asynchronous.
 * 
 * @example
 * export default {
 *   onInstall: async (context) => {
 *     // Initialize database tables
 *     await context.ql.object('plugin_data').syncSchema();
 *   },
 *   
 *   onEnable: async (context) => {
 *     // Start background services
 *     await startScheduler(context);
 *   },
 *   
 *   onDisable: async (context) => {
 *     // Stop background services
 *     await stopScheduler();
 *   }
 * };
 */
export const PluginLifecycleSchema = z.object({
  /**
   * Called when the plugin is first installed.
   * Use this to set up initial data, create database tables, or register resources.
   * 
   * @param context - Plugin runtime context
   */
  onInstall: z.function()
    .args(PluginContextSchema)
    .returns(z.promise(z.void()))
    .optional()
    .describe('Hook called on plugin installation'),

  /**
   * Called when the plugin is enabled.
   * Use this to start services, register event handlers, or initialize runtime state.
   * 
   * @param context - Plugin runtime context
   */
  onEnable: z.function()
    .args(PluginContextSchema)
    .returns(z.promise(z.void()))
    .optional()
    .describe('Hook called when plugin is enabled'),

  /**
   * Called when the plugin is disabled.
   * Use this to stop services, unregister handlers, or clean up runtime state.
   * 
   * @param context - Plugin runtime context
   */
  onDisable: z.function()
    .args(PluginContextSchema)
    .returns(z.promise(z.void()))
    .optional()
    .describe('Hook called when plugin is disabled'),

  /**
   * Called when the plugin is uninstalled.
   * Use this to clean up data, remove database tables, or unregister resources.
   * 
   * @param context - Plugin runtime context
   */
  onUninstall: z.function()
    .args(PluginContextSchema)
    .returns(z.promise(z.void()))
    .optional()
    .describe('Hook called on plugin uninstallation'),

  /**
   * Called when the plugin is upgraded to a new version.
   * Use this to migrate data, update schemas, or handle breaking changes.
   * 
   * @param context - Plugin runtime context
   * @param fromVersion - Previous version string
   * @param toVersion - New version string
   */
  onUpgrade: z.function()
    .args(PluginContextSchema, z.string(), z.string())
    .returns(z.promise(z.void()))
    .optional()
    .describe('Hook called on plugin upgrade'),
});

/**
 * Complete Plugin Definition Schema
 * 
 * Combines lifecycle hooks with plugin metadata.
 */
export const PluginSchema = PluginLifecycleSchema.extend({
  /**
   * Plugin metadata identifier.
   * Should match the id in the manifest.
   */
  id: z.string().optional().describe('Plugin identifier'),

  /**
   * Plugin version.
   * Should match the version in the manifest.
   */
  version: z.string().optional().describe('Plugin version'),
});

/**
 * TypeScript types
 */
export type PluginContextData = z.infer<typeof PluginContextSchema>;
export type PluginLifecycleHooks = z.infer<typeof PluginLifecycleSchema>;
export type PluginDefinition = z.infer<typeof PluginSchema>;
