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
  hub: z.boolean().default(false).describe('Is Hub management enabled?'),
  ai: z.boolean().default(false).describe('Is the AI engine enabled?'),
  workflow: z.boolean().default(false).describe('Is the Workflow engine enabled?'),
  notifications: z.boolean().default(false).describe('Is the Notification service enabled?'),
  i18n: z.boolean().default(false).describe('Is the i18n service enabled?'),
});

/**
 * API Routes Schema
 * The "Map" for the frontend to know where to send requests.
 * This decouples the frontend from hardcoded URL paths.
 */
export const ApiRoutesSchema = z.object({
  /** Base URL for Object CRUD (Data Protocol) */
  data: z.string().describe('e.g. /api/v1/data'),
  
  /** Base URL for Schema Definitions (Metadata Protocol) */
  metadata: z.string().describe('e.g. /api/v1/meta'),

  /** Base URL for UI Configurations (Views, Menus) */
  ui: z.string().optional().describe('e.g. /api/v1/ui'),
  
  /** Base URL for Authentication */
  auth: z.string().describe('e.g. /api/v1/auth'),
  
  /** Base URL for Automation (Flows/Scripts) */
  automation: z.string().optional().describe('e.g. /api/v1/automation'),
  
  /** Base URL for File/Storage operations */
  storage: z.string().optional().describe('e.g. /api/v1/storage'),
  
  /** Base URL for Analytics/BI operations */
  analytics: z.string().optional().describe('e.g. /api/v1/analytics'),
  
  /** Base URL for Hub Management (Multi-tenant/Marketplace) */
  hub: z.string().optional().describe('e.g. /api/v1/hub'),

  /** GraphQL Endpoint (if enabled) */
  graphql: z.string().optional().describe('e.g. /graphql'),

  /** Base URL for Package Management */
  packages: z.string().optional().describe('e.g. /api/v1/packages'),

  /** Base URL for Workflow Engine */
  workflow: z.string().optional().describe('e.g. /api/v1/workflow'),

  /** Base URL for Realtime (WebSocket/SSE) */
  realtime: z.string().optional().describe('e.g. /api/v1/realtime'),

  /** Base URL for Notification Service */
  notifications: z.string().optional().describe('e.g. /api/v1/notifications'),

  /** Base URL for AI Engine (NLQ, Chat, Suggest) */
  ai: z.string().optional().describe('e.g. /api/v1/ai'),

  /** Base URL for Internationalization */
  i18n: z.string().optional().describe('e.g. /api/v1/i18n'),
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
  
  /**
   * Custom metadata key-value pairs for extensibility
   */
  metadata: z.record(z.string(), z.unknown()).optional().describe('Custom metadata key-value pairs for extensibility'),
});

export type DiscoveryResponse = z.infer<typeof DiscoverySchema>;
export type ApiRoutes = z.infer<typeof ApiRoutesSchema>;
export type ApiCapabilities = z.infer<typeof ApiCapabilitiesSchema>;
