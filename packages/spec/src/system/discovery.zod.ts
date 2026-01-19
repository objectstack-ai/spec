import { z } from 'zod';

/**
 * API Capabilities Schema
 * Defines what features are enabled on this ObjectOS instance.
 */
export const ApiCapabilitiesSchema = z.object({
  graphql: z.boolean().default(false),
  search: z.boolean().default(false),
  websockets: z.boolean().default(false),
  files: z.boolean().default(true),
});

/**
 * API Routes Schema
 * The "Map" for the frontend to know where to send requests.
 * This decouples the frontend from hardcoded URL paths.
 */
export const ApiRoutesSchema = z.object({
  /** Base URL for Object CRUD (Standard Data API) */
  data: z.string().describe('e.g. /api/v1/data'),
  
  /** Base URL for Schema Definitions (Metadata API) */
  metadata: z.string().describe('e.g. /api/v1/meta'),
  
  /** Base URL for Authentication */
  auth: z.string().describe('e.g. /api/v1/auth'),
  
  /** Base URL for Server Actions/Flows */
  actions: z.string().optional().describe('e.g. /api/v1/p'),
  
  /** Base URL for File/Storage operations */
  storage: z.string().optional().describe('e.g. /api/v1/storage'),
  
  /** GraphQL Endpoint (if enabled) */
  graphql: z.string().optional().describe('e.g. /api/v1/graphql'),
});

/**
 * Discovery Response Schema
 * The root object returned by the Metadata Discovery Endpoint.
 */
export const DiscoverySchema = z.object({
  /** System Identity */
  name: z.string(),
  version: z.string(),
  environment: z.enum(['production', 'sandbox', 'development']),
  
  /** Dynamic Routing */
  routes: ApiRoutesSchema,
  
  /** Feature Flags */
  features: ApiCapabilitiesSchema,
  
  /** Localization Info (helping frontend init i18n) */
  locale: z.object({
    default: z.string(),
    supported: z.array(z.string()),
    timezone: z.string(),
  }),
});

export type DiscoveryResponse = z.infer<typeof DiscoverySchema>;
export type ApiRoutes = z.infer<typeof ApiRoutesSchema>;
export type ApiCapabilities = z.infer<typeof ApiCapabilitiesSchema>;
