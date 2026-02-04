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
  analytics: z.boolean().default(false).describe('Is the Analytics/BI engine enabled?'),
});

/**
 * API Routes Schema
 * The "Map" for the frontend to know where to send requests.
 * This decouples the frontend from hardcoded URL paths.
 */
export const ApiRoutesSchema = z.object({
  /** Base URL for Object CRUD (Data Protocol) */
  data: z.string().describe('e.g. /api/data'),
  
  /** Base URL for Schema Definitions (Metadata Protocol) */
  metadata: z.string().describe('e.g. /api/meta'),
  
  /** Base URL for Authentication */
  auth: z.string().describe('e.g. /api/auth'),
  
  /** Base URL for Automation (Flows/Scripts) */
  automation: z.string().optional().describe('e.g. /api/automation'),
  
  /** Base URL for File/Storage operations */
  storage: z.string().optional().describe('e.g. /api/storage'),
  
  /** Base URL for Analytics/BI operations */
  analytics: z.string().optional().describe('e.g. /api/analytics'),

  /** GraphQL Endpoint (if enabled) */
  graphql: z.string().optional().describe('e.g. /graphql'),
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
