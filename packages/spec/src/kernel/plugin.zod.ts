import { z } from 'zod';

// We use z.any() for services that are interfaces with methods, 
// as Zod cannot easily validate function signatures at runtime.
export const PluginContextSchema = z.object({
  ql: z.object({
    object: z.function().returns(z.any()), // Return any to allow method chaining
    query: z.function().returns(z.any()),
  }).passthrough().describe('ObjectQL Engine Interface'),

  os: z.object({
    getCurrentUser: z.function().returns(z.any()),
    getConfig: z.function().returns(z.any()),
  }).passthrough().describe('ObjectStack Kernel Interface'),

  logger: z.object({
    debug: z.function().returns(z.void()),
    info: z.function().returns(z.void()),
    warn: z.function().returns(z.void()),
    error: z.function().returns(z.void()),
  }).passthrough().describe('Logger Interface'),

  storage: z.object({
    get: z.function().returns(z.any()),
    set: z.function().returns(z.promise(z.void())),
    delete: z.function().returns(z.promise(z.void())),
  }).passthrough().describe('Storage Interface'),

  i18n: z.object({
    t: z.function().returns(z.string()),
    getLocale: z.function().returns(z.string()),
  }).passthrough().describe('Internationalization Interface'),

  metadata: z.record(z.string(), z.any()),
  events: z.record(z.string(), z.any()),
  
  app: z.object({
    router: z.object({
      get: z.function().returns(z.any()),
      post: z.function().returns(z.any()),
      use: z.function().returns(z.any()),
    }).passthrough()
  }).passthrough().describe('App Framework Interface'),

  drivers: z.object({
    register: z.function().returns(z.void()),
  }).passthrough().describe('Driver Registry'),
});

export type PluginContextData = z.infer<typeof PluginContextSchema>;
export type PluginContext = PluginContextData;

export const PluginLifecycleSchema = z.object({
  onInstall: z.function()
    .args(PluginContextSchema)
    .returns(z.promise(z.void()))
    .optional(),
  
  onEnable: z.function()
    .args(PluginContextSchema)
    .returns(z.promise(z.void()))
    .optional(),
  
  onDisable: z.function()
    .args(PluginContextSchema)
    .returns(z.promise(z.void()))
    .optional(),
  
  onUninstall: z.function()
    .args(PluginContextSchema)
    .returns(z.promise(z.void()))
    .optional(),
  
  onUpgrade: z.function()
    .args(PluginContextSchema, z.string(), z.string())
    .returns(z.promise(z.void()))
    .optional(),
});

export type PluginLifecycleHooks = z.infer<typeof PluginLifecycleSchema>;

export const PluginSchema = PluginLifecycleSchema.extend({
  id: z.string().min(1).optional().describe('Unique Plugin ID (e.g. com.example.crm)'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).optional().describe('Semantic Version'),
  description: z.string().optional(),
  author: z.string().optional(),
  homepage: z.string().url().optional(),
});

export type PluginDefinition = z.infer<typeof PluginSchema>;

/**
 * Define an ObjectStack Plugin
 * Helper function for creating type-safe plugin definitions
 */
export function definePlugin(config: PluginDefinition): PluginDefinition {
  return config;
}
