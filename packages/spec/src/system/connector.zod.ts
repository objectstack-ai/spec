import { z } from 'zod';

/**
 * Connector Protocol
 * 
 * Defines the standard connector specification for external system integration.
 * Connectors enable ObjectStack to sync data with SaaS apps, databases, file storage,
 * and message queues through a unified protocol.
 * 
 * This protocol supports multiple authentication strategies, bidirectional sync,
 * field mapping, webhooks, and comprehensive rate limiting.
 */

// ============================================================================
// Authentication Schemas
// ============================================================================

/**
 * API Key Authentication Schema
 */
export const ApiKeyAuthSchema = z.object({
  type: z.literal('api_key').describe('Authentication type'),
  apiKey: z.string().describe('API key (typically from ENV)'),
  headerName: z.string().default('X-API-Key').describe('HTTP header name for API key'),
  paramName: z.string().optional().describe('Query parameter name (alternative to header)'),
});

export type ApiKeyAuth = z.infer<typeof ApiKeyAuthSchema>;

/**
 * OAuth2 Authentication Schema
 */
export const OAuth2AuthSchema = z.object({
  type: z.literal('oauth2').describe('Authentication type'),
  
  clientId: z.string().describe('OAuth2 client ID'),
  clientSecret: z.string().describe('OAuth2 client secret (typically from ENV)'),
  
  authorizationUrl: z.string().url().describe('OAuth2 authorization endpoint'),
  tokenUrl: z.string().url().describe('OAuth2 token endpoint'),
  
  scopes: z.array(z.string()).optional().describe('Requested OAuth2 scopes'),
  
  redirectUri: z.string().url().optional().describe('OAuth2 callback URL'),
  
  grantType: z.enum([
    'authorization_code',
    'client_credentials',
    'password',
    'refresh_token',
  ]).default('authorization_code').describe('OAuth2 grant type'),
  
  refreshToken: z.string().optional().describe('Refresh token for token renewal'),
  
  tokenExpiry: z.number().optional().describe('Token expiry timestamp'),
});

export type OAuth2Auth = z.infer<typeof OAuth2AuthSchema>;

/**
 * JWT Authentication Schema
 */
export const JwtAuthSchema = z.object({
  type: z.literal('jwt').describe('Authentication type'),
  
  token: z.string().optional().describe('Pre-generated JWT token'),
  
  secretKey: z.string().optional().describe('Secret key for JWT signing'),
  
  algorithm: z.enum([
    'HS256', 'HS384', 'HS512',
    'RS256', 'RS384', 'RS512',
    'ES256', 'ES384', 'ES512',
  ]).default('HS256').describe('JWT signing algorithm'),
  
  issuer: z.string().optional().describe('JWT issuer claim'),
  
  audience: z.string().optional().describe('JWT audience claim'),
  
  subject: z.string().optional().describe('JWT subject claim'),
  
  expiresIn: z.number().default(3600).describe('Token expiry in seconds'),
  
  claims: z.record(z.any()).optional().describe('Additional JWT claims'),
});

export type JwtAuth = z.infer<typeof JwtAuthSchema>;

/**
 * SAML Authentication Schema
 */
export const SamlAuthSchema = z.object({
  type: z.literal('saml').describe('Authentication type'),
  
  entryPoint: z.string().url().describe('SAML IdP entry point URL'),
  
  issuer: z.string().describe('SAML service provider issuer'),
  
  certificate: z.string().describe('SAML IdP certificate (X.509)'),
  
  privateKey: z.string().optional().describe('SAML service provider private key'),
  
  callbackUrl: z.string().url().optional().describe('SAML assertion consumer service URL'),
  
  signatureAlgorithm: z.enum([
    'sha1',
    'sha256',
    'sha512',
  ]).default('sha256').describe('SAML signature algorithm'),
  
  wantAssertionsSigned: z.boolean().default(true).describe('Require signed SAML assertions'),
  
  identifierFormat: z.string().optional().describe('SAML NameID format'),
});

export type SamlAuth = z.infer<typeof SamlAuthSchema>;

/**
 * Basic Authentication Schema
 */
export const BasicAuthSchema = z.object({
  type: z.literal('basic').describe('Authentication type'),
  username: z.string().describe('Username'),
  password: z.string().describe('Password (typically from ENV)'),
});

export type BasicAuth = z.infer<typeof BasicAuthSchema>;

/**
 * Bearer Token Authentication Schema
 */
export const BearerTokenAuthSchema = z.object({
  type: z.literal('bearer').describe('Authentication type'),
  token: z.string().describe('Bearer token'),
});

export type BearerTokenAuth = z.infer<typeof BearerTokenAuthSchema>;

/**
 * No Authentication Schema
 */
export const NoAuthSchema = z.object({
  type: z.literal('none').describe('No authentication required'),
});

export type NoAuth = z.infer<typeof NoAuthSchema>;

/**
 * Unified Authentication Configuration
 * Discriminated union of all authentication methods
 */
export const AuthenticationSchema = z.discriminatedUnion('type', [
  ApiKeyAuthSchema,
  OAuth2AuthSchema,
  JwtAuthSchema,
  SamlAuthSchema,
  BasicAuthSchema,
  BearerTokenAuthSchema,
  NoAuthSchema,
]);

export type Authentication = z.infer<typeof AuthenticationSchema>;

// ============================================================================
// Field Mapping Schema
// ============================================================================

/**
 * Field Transformation Function
 */
export const FieldTransformSchema = z.object({
  type: z.enum([
    'uppercase',
    'lowercase',
    'trim',
    'date_format',
    'number_format',
    'custom',
  ]).describe('Transformation type'),
  
  params: z.record(z.any()).optional().describe('Transformation parameters'),
  
  function: z.string().optional().describe('Custom JavaScript function for transformation'),
});

export type FieldTransform = z.infer<typeof FieldTransformSchema>;

/**
 * Field Mapping Configuration
 * Maps fields between ObjectStack and external system
 */
export const FieldMappingSchema = z.object({
  /**
   * Source field name (in external system)
   */
  sourceField: z.string().describe('Field name in external system'),
  
  /**
   * Target field name (in ObjectStack)
   */
  targetField: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Field name in ObjectStack (snake_case)'),
  
  /**
   * Data type mapping
   */
  dataType: z.enum([
    'string',
    'number',
    'boolean',
    'date',
    'datetime',
    'json',
    'array',
  ]).optional().describe('Target data type'),
  
  /**
   * Is this field required?
   */
  required: z.boolean().default(false).describe('Field is required'),
  
  /**
   * Default value if source is empty
   */
  defaultValue: z.any().optional().describe('Default value'),
  
  /**
   * Field transformation rules
   */
  transform: FieldTransformSchema.optional().describe('Field transformation'),
  
  /**
   * Bidirectional sync mode
   */
  syncMode: z.enum([
    'read_only',      // Only sync from external to ObjectStack
    'write_only',     // Only sync from ObjectStack to external
    'bidirectional',  // Sync both ways
  ]).default('bidirectional').describe('Sync mode'),
});

export type FieldMapping = z.infer<typeof FieldMappingSchema>;

// ============================================================================
// Data Synchronization Configuration
// ============================================================================

/**
 * Sync Strategy Schema
 */
export const SyncStrategySchema = z.enum([
  'full',           // Full refresh (delete all and re-import)
  'incremental',    // Only sync changes since last sync
  'upsert',         // Insert new, update existing
  'append_only',    // Only insert new records
]).describe('Synchronization strategy');

export type SyncStrategy = z.infer<typeof SyncStrategySchema>;

/**
 * Conflict Resolution Strategy
 */
export const ConflictResolutionSchema = z.enum([
  'source_wins',    // External system data takes precedence
  'target_wins',    // ObjectStack data takes precedence
  'latest_wins',    // Most recently modified wins
  'manual',         // Flag for manual resolution
]).describe('Conflict resolution strategy');

export type ConflictResolution = z.infer<typeof ConflictResolutionSchema>;

/**
 * Data Synchronization Configuration
 */
export const DataSyncConfigSchema = z.object({
  /**
   * Sync strategy
   */
  strategy: SyncStrategySchema.default('incremental'),
  
  /**
   * Sync direction
   */
  direction: z.enum([
    'import',         // External → ObjectStack
    'export',         // ObjectStack → External
    'bidirectional',  // Both ways
  ]).default('import').describe('Sync direction'),
  
  /**
   * Sync frequency (cron expression)
   */
  schedule: z.string().optional().describe('Cron expression for scheduled sync'),
  
  /**
   * Enable real-time sync via webhooks
   */
  realtimeSync: z.boolean().default(false).describe('Enable real-time sync'),
  
  /**
   * Field to track last sync timestamp
   */
  timestampField: z.string().optional().describe('Field to track last modification time'),
  
  /**
   * Conflict resolution strategy
   */
  conflictResolution: ConflictResolutionSchema.default('latest_wins'),
  
  /**
   * Batch size for bulk operations
   */
  batchSize: z.number().min(1).max(10000).default(1000).describe('Records per batch'),
  
  /**
   * Delete handling
   */
  deleteMode: z.enum([
    'hard_delete',    // Permanently delete
    'soft_delete',    // Mark as deleted
    'ignore',         // Don't sync deletions
  ]).default('soft_delete').describe('Delete handling mode'),
  
  /**
   * Filter criteria for selective sync
   */
  filters: z.record(z.any()).optional().describe('Filter criteria for selective sync'),
});

export type DataSyncConfig = z.infer<typeof DataSyncConfigSchema>;

// ============================================================================
// Webhook Configuration
// ============================================================================

/**
 * Webhook Event Schema
 */
export const WebhookEventSchema = z.enum([
  'record.created',
  'record.updated',
  'record.deleted',
  'sync.started',
  'sync.completed',
  'sync.failed',
  'auth.expired',
  'rate_limit.exceeded',
]).describe('Webhook event type');

export type WebhookEvent = z.infer<typeof WebhookEventSchema>;

/**
 * Webhook Signature Algorithm
 */
export const WebhookSignatureAlgorithmSchema = z.enum([
  'hmac_sha256',
  'hmac_sha512',
  'none',
]).describe('Webhook signature algorithm');

export type WebhookSignatureAlgorithm = z.infer<typeof WebhookSignatureAlgorithmSchema>;

/**
 * Webhook Configuration Schema
 */
export const WebhookConfigSchema = z.object({
  /**
   * Webhook endpoint URL
   */
  url: z.string().url().describe('Webhook endpoint URL'),
  
  /**
   * Events to listen for
   */
  events: z.array(WebhookEventSchema).describe('Events to subscribe to'),
  
  /**
   * Webhook secret for signature verification
   */
  secret: z.string().optional().describe('Secret for HMAC signature'),
  
  /**
   * Signature algorithm
   */
  signatureAlgorithm: WebhookSignatureAlgorithmSchema.default('hmac_sha256'),
  
  /**
   * Custom headers to include in webhook requests
   */
  headers: z.record(z.string()).optional().describe('Custom HTTP headers'),
  
  /**
   * Retry configuration for failed webhook deliveries
   */
  retryConfig: z.object({
    maxAttempts: z.number().min(0).max(10).default(3).describe('Maximum retry attempts'),
    backoffMultiplier: z.number().min(1).default(2).describe('Exponential backoff multiplier'),
    initialDelayMs: z.number().min(100).default(1000).describe('Initial retry delay in ms'),
  }).optional().describe('Retry configuration'),
  
  /**
   * Timeout for webhook requests
   */
  timeoutMs: z.number().min(1000).max(60000).default(30000).describe('Request timeout in ms'),
  
  /**
   * Enable webhook
   */
  enabled: z.boolean().default(true).describe('Enable webhook'),
});

export type WebhookConfig = z.infer<typeof WebhookConfigSchema>;

// ============================================================================
// Rate Limiting and Retry Configuration
// ============================================================================

/**
 * Rate Limiting Strategy
 */
export const RateLimitStrategySchema = z.enum([
  'fixed_window',       // Fixed time window
  'sliding_window',     // Sliding time window
  'token_bucket',       // Token bucket algorithm
  'leaky_bucket',       // Leaky bucket algorithm
]).describe('Rate limiting strategy');

export type RateLimitStrategy = z.infer<typeof RateLimitStrategySchema>;

/**
 * Rate Limiting Configuration
 */
export const RateLimitConfigSchema = z.object({
  /**
   * Rate limiting strategy
   */
  strategy: RateLimitStrategySchema.default('token_bucket'),
  
  /**
   * Maximum requests per window
   */
  maxRequests: z.number().min(1).describe('Maximum requests per window'),
  
  /**
   * Time window in seconds
   */
  windowSeconds: z.number().min(1).describe('Time window in seconds'),
  
  /**
   * Burst capacity (for token bucket)
   */
  burstCapacity: z.number().min(1).optional().describe('Burst capacity'),
  
  /**
   * Respect external system rate limits
   */
  respectUpstreamLimits: z.boolean().default(true).describe('Respect external rate limit headers'),
  
  /**
   * Custom rate limit headers to check
   */
  rateLimitHeaders: z.object({
    remaining: z.string().default('X-RateLimit-Remaining').describe('Header for remaining requests'),
    limit: z.string().default('X-RateLimit-Limit').describe('Header for rate limit'),
    reset: z.string().default('X-RateLimit-Reset').describe('Header for reset time'),
  }).optional().describe('Custom rate limit headers'),
});

export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;

/**
 * Retry Strategy
 */
export const RetryStrategySchema = z.enum([
  'exponential_backoff',
  'linear_backoff',
  'fixed_delay',
  'no_retry',
]).describe('Retry strategy');

export type RetryStrategy = z.infer<typeof RetryStrategySchema>;

/**
 * Retry Configuration
 */
export const RetryConfigSchema = z.object({
  /**
   * Retry strategy
   */
  strategy: RetryStrategySchema.default('exponential_backoff'),
  
  /**
   * Maximum retry attempts
   */
  maxAttempts: z.number().min(0).max(10).default(3).describe('Maximum retry attempts'),
  
  /**
   * Initial delay in milliseconds
   */
  initialDelayMs: z.number().min(100).default(1000).describe('Initial retry delay in ms'),
  
  /**
   * Maximum delay in milliseconds
   */
  maxDelayMs: z.number().min(1000).default(60000).describe('Maximum retry delay in ms'),
  
  /**
   * Backoff multiplier (for exponential backoff)
   */
  backoffMultiplier: z.number().min(1).default(2).describe('Exponential backoff multiplier'),
  
  /**
   * HTTP status codes to retry
   */
  retryableStatusCodes: z.array(z.number()).default([408, 429, 500, 502, 503, 504]).describe('HTTP status codes to retry'),
  
  /**
   * Retry on network errors
   */
  retryOnNetworkError: z.boolean().default(true).describe('Retry on network errors'),
  
  /**
   * Jitter to add randomness to retry delays
   */
  jitter: z.boolean().default(true).describe('Add jitter to retry delays'),
});

export type RetryConfig = z.infer<typeof RetryConfigSchema>;

// ============================================================================
// Base Connector Schema
// ============================================================================

/**
 * Connector Type
 */
export const ConnectorTypeSchema = z.enum([
  'saas',           // SaaS application connector
  'database',       // Database connector
  'file_storage',   // File storage connector
  'message_queue',  // Message queue connector
  'api',            // Generic REST/GraphQL API
  'custom',         // Custom connector
]).describe('Connector type');

export type ConnectorType = z.infer<typeof ConnectorTypeSchema>;

/**
 * Connector Status
 */
export const ConnectorStatusSchema = z.enum([
  'active',         // Connector is active and syncing
  'inactive',       // Connector is configured but disabled
  'error',          // Connector has errors
  'configuring',    // Connector is being set up
]).describe('Connector status');

export type ConnectorStatus = z.infer<typeof ConnectorStatusSchema>;

/**
 * Base Connector Schema
 * Core connector configuration shared across all connector types
 */
export const ConnectorSchema = z.object({
  /**
   * Machine name (snake_case)
   */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Unique connector identifier'),
  
  /**
   * Human-readable label
   */
  label: z.string().describe('Display label'),
  
  /**
   * Connector type
   */
  type: ConnectorTypeSchema.describe('Connector type'),
  
  /**
   * Description
   */
  description: z.string().optional().describe('Connector description'),
  
  /**
   * Icon identifier
   */
  icon: z.string().optional().describe('Icon identifier'),
  
  /**
   * Authentication configuration
   */
  authentication: AuthenticationSchema.describe('Authentication configuration'),
  
  /**
   * Data synchronization configuration
   */
  syncConfig: DataSyncConfigSchema.optional().describe('Data sync configuration'),
  
  /**
   * Field mappings
   */
  fieldMappings: z.array(FieldMappingSchema).optional().describe('Field mapping rules'),
  
  /**
   * Webhook configuration
   */
  webhooks: z.array(WebhookConfigSchema).optional().describe('Webhook configurations'),
  
  /**
   * Rate limiting configuration
   */
  rateLimitConfig: RateLimitConfigSchema.optional().describe('Rate limiting configuration'),
  
  /**
   * Retry configuration
   */
  retryConfig: RetryConfigSchema.optional().describe('Retry configuration'),
  
  /**
   * Connection timeout in milliseconds
   */
  connectionTimeoutMs: z.number().min(1000).max(300000).default(30000).describe('Connection timeout in ms'),
  
  /**
   * Request timeout in milliseconds
   */
  requestTimeoutMs: z.number().min(1000).max(300000).default(30000).describe('Request timeout in ms'),
  
  /**
   * Connector status
   */
  status: ConnectorStatusSchema.default('inactive').describe('Connector status'),
  
  /**
   * Enable connector
   */
  enabled: z.boolean().default(true).describe('Enable connector'),
  
  /**
   * Custom metadata
   */
  metadata: z.record(z.any()).optional().describe('Custom connector metadata'),
});

export type Connector = z.infer<typeof ConnectorSchema>;

// ============================================================================
// TypeScript Exports
// ============================================================================

export type {
  SyncStrategy,
  ConflictResolution,
  WebhookEvent,
  WebhookSignatureAlgorithm,
  RateLimitStrategy,
  RetryStrategy,
};
