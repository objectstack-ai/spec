import { z } from 'zod';

/**
 * HTTP Method Enum
 */
export const HttpMethod = z.enum([
  'GET', 
  'POST', 
  'PUT', 
  'DELETE', 
  'PATCH', 
  'HEAD', 
  'OPTIONS'
]);

export type HttpMethod = z.infer<typeof HttpMethod>;

/**
 * Route Category Enum
 * Classifies routes for middleware application and security policies.
 */
export const RouteCategory = z.enum([
  'system',   // Health, Metrics, Info (No Auth usually)
  'api',      // Business Logic API (Auth required)
  'auth',     // Login/Callback endpoints
  'static',   // Asset serving
  'webhook',  // External callbacks
  'plugin'    // Plugin extensions
]);

export type RouteCategory = z.infer<typeof RouteCategory>;

/**
 * Route Definition Schema
 * Describes a single routable endpoint in the Kernel.
 */
export const RouteDefinitionSchema = z.object({
  /**
   * HTTP Method
   */
  method: HttpMethod,
  
  /**
   * URL Path Pattern (supports parameters like /user/:id)
   */
  path: z.string().describe('URL Path pattern'),
  
  /**
   * Route Type/Category
   */
  category: RouteCategory.default('api'),
  
  /**
   * Handler Identifier
   * References an internal function or plugin action ID.
   */
  handler: z.string().describe('Unique handler identifier'),
  
  /**
   * Route specific metadata
   */
  summary: z.string().optional().describe('OpenAPI summary'),
  description: z.string().optional().describe('OpenAPI description'),
  
  /**
   * Security constraints
   */
  public: z.boolean().default(false).describe('Is publicly accessible'),
  permissions: z.array(z.string()).optional().describe('Required permissions'),
  
  /**
   * Performance hints
   */
  timeout: z.number().int().optional().describe('Execution timeout in ms'),
  rateLimit: z.string().optional().describe('Rate limit policy name'),
});

export type RouteDefinition = z.infer<typeof RouteDefinitionSchema>;

/**
 * Router Configuration Schema
 * Global routing table configuration.
 */
export const RouterConfigSchema = z.object({
  /**
   * URL Prefix for all kernel routes
   */
  basePath: z.string().default('/api').describe('Global API prefix'),
  
  /**
   * Cross-Origin Resource Sharing
   */
  cors: z.object({
    enabled: z.boolean().default(true),
    origin: z.union([z.string(), z.array(z.string())]).default('*'),
    methods: z.array(HttpMethod).optional(),
  }).optional(),
  
  /**
   * Static asset mounts
   */
  staticMounts: z.array(z.object({
    path: z.string().describe('URL mount path'),
    dir: z.string().describe('Physical directory path'),
    cacheControl: z.string().optional()
  })).optional(),
});

export type RouterConfig = z.infer<typeof RouterConfigSchema>;
