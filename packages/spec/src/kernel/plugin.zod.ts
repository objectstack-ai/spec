import { z } from 'zod';

// We use z.any() for service methods that are interfaces with function signatures,
// as Zod cannot easily validate function signatures at runtime.
// Generic data fields use z.unknown() for type safety.
export const PluginContextSchema = z.object({
  ql: z.object({
    object: z.any(), // Return any to allow method chaining
    query: z.any(),
  }).passthrough().describe('ObjectQL Engine Interface'),

  os: z.object({
    getCurrentUser: z.any(),
    getConfig: z.any(),
  }).passthrough().describe('ObjectStack Kernel Interface'),

  logger: z.object({
    debug: z.any(),
    info: z.any(),
    warn: z.any(),
    error: z.any(),
  }).passthrough().describe('Logger Interface'),

  storage: z.object({
    get: z.any(),
    set: z.any(),
    delete: z.any(),
  }).passthrough().describe('Storage Interface'),

  i18n: z.object({
    t: z.any(),
    getLocale: z.any(),
  }).passthrough().describe('Internationalization Interface'),

  metadata: z.record(z.string(), z.unknown()),
  events: z.record(z.string(), z.unknown()),
  
  app: z.object({
    router: z.object({
      get: z.any(),
      post: z.any(),
      use: z.any(),
    }).passthrough()
  }).passthrough().describe('App Framework Interface'),

  drivers: z.object({
    register: z.any(),
  }).passthrough().describe('Driver Registry'),
});

export type PluginContextData = z.infer<typeof PluginContextSchema>;
export type PluginContext = PluginContextData;

export const PluginLifecycleSchema = z.object({
  onInstall: z.any().optional(),
  
  onEnable: z.any().optional(),
  
  onDisable: z.any().optional(),
  
  onUninstall: z.any().optional(),
  
  onUpgrade: z.any().optional(),
});

export type PluginLifecycleHooks = z.infer<typeof PluginLifecycleSchema>;

/**
 * Shared Plugin Types
 * These are the specialized plugin types common between Manifest (Package) and Plugin (Runtime).
 */
export const CORE_PLUGIN_TYPES = [
  'ui',         // Frontend: Serves static assets/SPA (e.g. Console, Studio)
  'driver',     // Connectivity: Database or Storage adapters (e.g. SQL, S3)
  'server',     // Protocol: HTTP/RPC Servers (e.g. Hono, GraphQL)
  'app',        // Business: Vertical Solution Bundle (Metadata + Logic)
  'theme',      // Appearance: UI Overrides & CSS Variables
  'agent',      // AI: Autonomous Agent & Tool Definitions
  'objectql'    // Core: ObjectQL Engine Data Provider
] as const;

export const PluginSchema = PluginLifecycleSchema.extend({
  id: z.string().min(1).optional().describe('Unique Plugin ID (e.g. com.example.crm)'),
  type: z.enum([
    'standard',   // Default: General purpose backend logic (Service, Hook, etc.)
    ...CORE_PLUGIN_TYPES
  ]).default('standard').optional().describe('Plugin Type categorization for runtime behavior'),
  
  staticPath: z.string().optional().describe('Absolute path to static assets (Required for type="ui-plugin")'),
  slug: z.string().regex(/^[a-z0-9-_]+$/).optional().describe('URL path segment (Required for type="ui-plugin")'),
  default: z.boolean().optional().describe('Serve at root path (Only one "ui-plugin" can be default)'),
  
  version: z.string().regex(/^\d+\.\d+\.\d+$/).optional().describe('Semantic Version'),
  description: z.string().optional(),
  author: z.string().optional(),
  homepage: z.string().url().optional(),
});

export type PluginDefinition = z.infer<typeof PluginSchema>;

/**
 * Define an ObjectStack Plugin
 * Helper function for creating type-safe plugin definitions
 * @deprecated Move to @objectstack/core. Will be removed from spec in v2.0.0
 */
export function definePlugin(config: PluginDefinition): PluginDefinition {
  return config;
}
