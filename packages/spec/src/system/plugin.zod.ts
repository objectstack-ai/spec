import { z } from 'zod';

// We use z.any() for services that are interfaces with methods, 
// as Zod cannot easily validate function signatures at runtime.
export const PluginContextSchema = z.object({
  ql: z.object({
    object: z.function(z.tuple([]), z.any()), // Return any to allow method chaining
    query: z.function(z.tuple([]), z.any()),
  }).passthrough().describe('ObjectQL Engine Interface'),

  os: z.object({
    getCurrentUser: z.function(z.tuple([]), z.any()),
    getConfig: z.function(z.tuple([]), z.any()),
  }).passthrough().describe('ObjectStack Kernel Interface'),

  logger: z.object({
    debug: z.function(z.tuple([]), z.void()),
    info: z.function(z.tuple([]), z.void()),
    warn: z.function(z.tuple([]), z.void()),
    error: z.function(z.tuple([]), z.void()),
  }).passthrough().describe('Logger Interface'),

  storage: z.object({
    get: z.function(z.tuple([]), z.any()),
    set: z.function(z.tuple([]), z.promise(z.void())),
    delete: z.function(z.tuple([]), z.promise(z.void())),
  }).passthrough().describe('Storage Interface'),

  i18n: z.object({
    t: z.function(z.tuple([]), z.string()),
    getLocale: z.function(z.tuple([]), z.string()),
  }).passthrough().describe('Internationalization Interface'),

  metadata: z.record(z.any()),
  events: z.record(z.any()),
  
  app: z.object({
    router: z.object({
      get: z.function(z.tuple([]), z.any()),
      post: z.function(z.tuple([]), z.any()),
      use: z.function(z.tuple([]), z.any()),
    }).passthrough()
  }).passthrough().describe('App Framework Interface'),

  drivers: z.object({
    register: z.function(z.tuple([]), z.void()),
  }).passthrough().describe('Driver Registry'),
});

export type PluginContextData = z.infer<typeof PluginContextSchema>;

export const PluginLifecycleSchema = z.object({
  onInstall: z.function(
    z.tuple([PluginContextSchema]),
    z.promise(z.void())
  ).optional(),
  
  onEnable: z.function(
    z.tuple([PluginContextSchema]),
    z.promise(z.void())
  ).optional(),
  
  onDisable: z.function(
    z.tuple([PluginContextSchema]),
    z.promise(z.void())
  ).optional(),
  
  onUninstall: z.function(
    z.tuple([PluginContextSchema]),
    z.promise(z.void())
  ).optional(),
  
  onUpgrade: z.function(
    z.tuple([PluginContextSchema, z.string(), z.string()]),
    z.promise(z.void())
  ).optional(),
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
