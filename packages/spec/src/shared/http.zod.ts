import { z } from 'zod';

/**
 * Shared HTTP Schemas
 * 
 * Common HTTP-related schemas used across API and System protocols.
 * These schemas ensure consistency across different parts of the stack.
 */

// ==========================================
// Basic HTTP Types
// ==========================================

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

// ==========================================
// CORS Configuration
// ==========================================

/**
 * CORS Configuration Schema
 * Cross-Origin Resource Sharing configuration
 * 
 * Used by:
 * - api/router.zod.ts (RouterConfigSchema)
 * - system/http-server.zod.ts (HttpServerConfigSchema)
 * 
 * @example
 * {
 *   "enabled": true,
 *   "origins": ["http://localhost:3000", "https://app.example.com"],
 *   "methods": ["GET", "POST", "PUT", "DELETE"],
 *   "credentials": true,
 *   "maxAge": 86400
 * }
 */
export const CorsConfigSchema = z.object({
  /**
   * Enable CORS
   */
  enabled: z.boolean().default(true).describe('Enable CORS'),
  
  /**
   * Allowed origins (* for all)
   */
  origins: z.union([
    z.string(),
    z.array(z.string())
  ]).default('*').describe('Allowed origins (* for all)'),
  
  /**
   * Allowed HTTP methods
   */
  methods: z.array(HttpMethod).optional().describe('Allowed HTTP methods'),
  
  /**
   * Allow credentials (cookies, authorization headers)
   */
  credentials: z.boolean().default(false).describe('Allow credentials (cookies, authorization headers)'),
  
  /**
   * Preflight cache duration in seconds
   */
  maxAge: z.number().int().optional().describe('Preflight cache duration in seconds'),
});

export type CorsConfig = z.infer<typeof CorsConfigSchema>;

// ==========================================
// Rate Limiting
// ==========================================

/**
 * Rate Limit Configuration Schema
 * 
 * Used by:
 * - api/endpoint.zod.ts (ApiEndpointSchema)
 * - system/http-server.zod.ts (HttpServerConfigSchema)
 * 
 * @example
 * {
 *   "enabled": true,
 *   "windowMs": 60000,
 *   "maxRequests": 100
 * }
 */
export const RateLimitConfigSchema = z.object({
  /**
   * Enable rate limiting
   */
  enabled: z.boolean().default(false).describe('Enable rate limiting'),
  
  /**
   * Time window in milliseconds
   */
  windowMs: z.number().int().default(60000).describe('Time window in milliseconds'),
  
  /**
   * Max requests per window
   */
  maxRequests: z.number().int().default(100).describe('Max requests per window'),
});

export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;

// ==========================================
// Static File Serving
// ==========================================

/**
 * Static Mount Configuration Schema
 * Configuration for serving static files
 * 
 * Used by:
 * - api/router.zod.ts (RouterConfigSchema)
 * - system/http-server.zod.ts (HttpServerConfigSchema)
 * 
 * @example
 * {
 *   "path": "/static",
 *   "directory": "./public",
 *   "cacheControl": "public, max-age=31536000"
 * }
 */
export const StaticMountSchema = z.object({
  /**
   * URL path to serve from
   */
  path: z.string().describe('URL path to serve from'),
  
  /**
   * Physical directory to serve
   */
  directory: z.string().describe('Physical directory to serve'),
  
  /**
   * Cache-Control header value
   */
  cacheControl: z.string().optional().describe('Cache-Control header value'),
});

export type StaticMount = z.infer<typeof StaticMountSchema>;
