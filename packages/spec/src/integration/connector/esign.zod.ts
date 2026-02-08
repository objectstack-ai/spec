import { z } from 'zod';
import {
  ConnectorSchema,
  FieldMappingSchema,
} from '../connector.zod';

/**
 * E-Signature Connector Protocol
 * 
 * Specialized connector for e-signature platform integration enabling automated
 * document signing workflows, envelope management, and template operations.
 * 
 * Use Cases:
 * - Automated document sending and signing
 * - Envelope and template management
 * - Recipient tracking and notifications
 * - Embedded signing experiences
 * - Signing workflow orchestration
 * 
 * @example
 * ```typescript
 * import { ESignConnector } from '@objectstack/spec/integration';
 * 
 * const docusignConnector: ESignConnector = {
 *   name: 'docusign_production',
 *   label: 'DocuSign Production',
 *   type: 'saas',
 *   provider: 'docusign',
 *   baseUrl: 'https://na4.docusign.net/restapi',
 *   accountId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
 *   environment: 'production',
 *   authentication: {
 *     type: 'oauth2',
 *     clientId: '${DOCUSIGN_CLIENT_ID}',
 *     clientSecret: '${DOCUSIGN_CLIENT_SECRET}',
 *     authorizationUrl: 'https://account.docusign.com/oauth/auth',
 *     tokenUrl: 'https://account.docusign.com/oauth/token',
 *     grantType: 'authorization_code',
 *     scopes: ['signature', 'impersonation'],
 *   },
 *   objectTypes: [
 *     {
 *       name: 'envelopes',
 *       label: 'Envelopes',
 *       apiName: 'envelopes',
 *       enabled: true,
 *       supportsCreate: true,
 *       supportsUpdate: true,
 *       supportsDelete: false,
 *     },
 *   ],
 * };
 * ```
 */

/**
 * E-Signature Provider Types
 */
export const ESignProviderSchema = z.enum([
  'docusign',
  'adobe_sign',
  'hellosign',
  'pandadoc',
  'custom',
]).describe('E-signature provider type');

export type ESignProvider = z.infer<typeof ESignProviderSchema>;

/**
 * Envelope/Document Status
 */
export const ESignEnvelopeStatusSchema = z.enum([
  'draft',
  'sent',
  'delivered',
  'signed',
  'completed',
  'declined',
  'voided',
]).describe('Envelope or document signing status');

export type ESignEnvelopeStatus = z.infer<typeof ESignEnvelopeStatusSchema>;

/**
 * Signing Method Types
 */
export const ESignSigningMethodSchema = z.enum([
  'email',
  'sms',
  'in_person',
  'embedded',
]).describe('Method used to deliver signing requests');

export type ESignSigningMethod = z.infer<typeof ESignSigningMethodSchema>;

/**
 * E-Signature Webhook Event Types
 */
export const ESignWebhookEventSchema = z.enum([
  'envelope.sent',
  'envelope.delivered',
  'envelope.signed',
  'envelope.completed',
  'envelope.declined',
  'envelope.voided',
  'recipient.signed',
  'recipient.declined',
]).describe('E-signature webhook event type');

export type ESignWebhookEvent = z.infer<typeof ESignWebhookEventSchema>;

/**
 * E-Signature Object Type Schema
 * Represents a syncable entity in the e-signature system (e.g., Envelope, Template, Recipient)
 */
export const ESignObjectTypeSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Object type name (snake_case)'),
  label: z.string().describe('Display label'),
  apiName: z.string().describe('API name in external system'),
  enabled: z.boolean().default(true).describe('Enable sync for this object'),
  supportsCreate: z.boolean().default(true).describe('Supports record creation'),
  supportsUpdate: z.boolean().default(true).describe('Supports record updates'),
  supportsDelete: z.boolean().default(true).describe('Supports record deletion'),
  fieldMappings: z.array(FieldMappingSchema).optional().describe('Object-specific field mappings'),
});

export type ESignObjectType = z.infer<typeof ESignObjectTypeSchema>;

/**
 * Template Configuration
 * Controls default template behavior for e-signature workflows
 */
export const ESignTemplateConfigSchema = z.object({
  defaultTemplateId: z.string().optional().describe('Default template ID for new envelopes'),
  templateFolder: z.string().optional().describe('Default folder path for templates'),
  autoPopulateFields: z.boolean().default(false).describe('Automatically populate template fields from record data'),
});

export type ESignTemplateConfig = z.infer<typeof ESignTemplateConfigSchema>;

/**
 * Signing Options Configuration
 * Controls signing workflow behavior
 */
export const ESignSigningOptionsSchema = z.object({
  sequentialSigning: z.boolean().default(false).describe('Require recipients to sign in order'),
  reminders: z.object({
    enabled: z.boolean().default(false).describe('Enable signing reminders'),
    delayDays: z.number().int().min(1).default(3).describe('Days before first reminder'),
    repeatDays: z.number().int().min(1).default(5).describe('Days between subsequent reminders'),
  }).optional().describe('Reminder configuration for pending signatures'),
  expiration: z.object({
    enabled: z.boolean().default(false).describe('Enable envelope expiration'),
    expireDays: z.number().int().min(1).default(120).describe('Days until envelope expires'),
    warnDays: z.number().int().min(1).default(7).describe('Days before expiry to warn recipients'),
  }).optional().describe('Expiration configuration for envelopes'),
});

export type ESignSigningOptions = z.infer<typeof ESignSigningOptionsSchema>;

/**
 * Branding Configuration
 * Controls visual branding for signing experiences
 */
export const ESignBrandingConfigSchema = z.object({
  logoUrl: z.string().url().optional().describe('URL to company logo for signing pages'),
  brandColor: z.string().optional().describe('Primary brand color (hex code)'),
  companyName: z.string().optional().describe('Company name displayed in signing UI'),
});

export type ESignBrandingConfig = z.infer<typeof ESignBrandingConfigSchema>;

/**
 * E-Signature Connector Schema
 * Complete e-signature platform integration configuration
 */
export const ESignConnectorSchema = ConnectorSchema.extend({
  type: z.literal('saas'),

  /**
   * E-signature provider
   */
  provider: ESignProviderSchema.describe('E-signature provider'),

  /**
   * E-signature API base URL
   */
  baseUrl: z.string().url().describe('E-signature API base URL'),

  /**
   * Account ID for the e-signature platform
   */
  accountId: z.string().describe('Platform account identifier'),

  /**
   * Environment (production or sandbox)
   */
  environment: z.enum(['production', 'sandbox']).describe('Deployment environment'),

  /**
   * Syncable e-signature object types
   */
  objectTypes: z.array(ESignObjectTypeSchema).describe('Syncable e-signature object types'),

  /**
   * Webhook events to subscribe to
   */
  webhookEvents: z.array(ESignWebhookEventSchema).optional().describe('E-signature webhook events to subscribe to'),

  /**
   * Template configuration
   */
  templateConfig: ESignTemplateConfigSchema.optional().describe('Template configuration'),

  /**
   * Signing options
   */
  signingOptions: ESignSigningOptionsSchema.optional().describe('Signing workflow options'),

  /**
   * Branding configuration
   */
  brandingConfig: ESignBrandingConfigSchema.optional().describe('Visual branding configuration'),

  /**
   * OAuth-specific settings
   */
  oauthSettings: z.object({
    scopes: z.array(z.string()).describe('Required OAuth scopes'),
    refreshTokenUrl: z.string().url().optional().describe('Token refresh endpoint'),
    revokeTokenUrl: z.string().url().optional().describe('Token revocation endpoint'),
    autoRefresh: z.boolean().default(true).describe('Automatically refresh expired tokens'),
  }).optional().describe('OAuth-specific configuration'),
});

export type ESignConnector = z.infer<typeof ESignConnectorSchema>;

// ============================================================================
// Helper Functions & Examples
// ============================================================================

/**
 * Example: DocuSign Connector Configuration
 */
export const docusignConnectorExample = {
  name: 'docusign_production',
  label: 'DocuSign Production',
  type: 'saas',
  provider: 'docusign',
  baseUrl: 'https://na4.docusign.net/restapi',
  accountId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  environment: 'production',

  authentication: {
    type: 'oauth2',
    clientId: '${DOCUSIGN_CLIENT_ID}',
    clientSecret: '${DOCUSIGN_CLIENT_SECRET}',
    authorizationUrl: 'https://account.docusign.com/oauth/auth',
    tokenUrl: 'https://account.docusign.com/oauth/token',
    grantType: 'authorization_code',
    scopes: ['signature', 'impersonation'],
  },

  objectTypes: [
    {
      name: 'envelopes',
      label: 'Envelopes',
      apiName: 'envelopes',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'templates',
      label: 'Templates',
      apiName: 'templates',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'recipients',
      label: 'Recipients',
      apiName: 'recipients',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'documents',
      label: 'Documents',
      apiName: 'documents',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: false,
      supportsDelete: true,
    },
  ],

  webhookEvents: [
    'envelope.sent',
    'envelope.delivered',
    'envelope.signed',
    'envelope.completed',
    'envelope.declined',
    'envelope.voided',
    'recipient.signed',
    'recipient.declined',
  ],

  templateConfig: {
    defaultTemplateId: 'tmpl_001',
    templateFolder: '/Production/Contracts',
    autoPopulateFields: true,
  },

  signingOptions: {
    sequentialSigning: true,
    reminders: {
      enabled: true,
      delayDays: 2,
      repeatDays: 3,
    },
    expiration: {
      enabled: true,
      expireDays: 90,
      warnDays: 7,
    },
  },

  brandingConfig: {
    logoUrl: 'https://cdn.example.com/logo.png',
    brandColor: '#1A73E8',
    companyName: 'Acme Corp',
  },

  oauthSettings: {
    scopes: ['signature', 'impersonation'],
    refreshTokenUrl: 'https://account.docusign.com/oauth/token',
    autoRefresh: true,
  },

  syncConfig: {
    strategy: 'incremental',
    direction: 'bidirectional',
    schedule: '*/30 * * * *',
    realtimeSync: true,
    conflictResolution: 'source_wins',
    batchSize: 50,
    deleteMode: 'soft_delete',
  },

  rateLimitConfig: {
    strategy: 'token_bucket',
    maxRequests: 1000,
    windowSeconds: 3600,
    respectUpstreamLimits: true,
  },

  retryConfig: {
    strategy: 'exponential_backoff',
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 15000,
    backoffMultiplier: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    retryOnNetworkError: true,
    jitter: true,
  },

  status: 'active',
  enabled: true,
};

/**
 * Example: Adobe Sign Connector Configuration
 */
export const adobeSignConnectorExample = {
  name: 'adobe_sign_sandbox',
  label: 'Adobe Sign Sandbox',
  type: 'saas',
  provider: 'adobe_sign',
  baseUrl: 'https://api.na4.adobesign.com/api/rest/v6',
  accountId: 'CBJCHBCAABAAxxxxxxxxxx',
  environment: 'sandbox',

  authentication: {
    type: 'oauth2',
    clientId: '${ADOBE_SIGN_CLIENT_ID}',
    clientSecret: '${ADOBE_SIGN_CLIENT_SECRET}',
    authorizationUrl: 'https://secure.na4.adobesign.com/public/oauth/v2',
    tokenUrl: 'https://api.na4.adobesign.com/oauth/v2/token',
    grantType: 'authorization_code',
    scopes: ['agreement_read', 'agreement_write', 'agreement_send'],
  },

  objectTypes: [
    {
      name: 'envelopes',
      label: 'Agreements',
      apiName: 'agreements',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'templates',
      label: 'Library Documents',
      apiName: 'libraryDocuments',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'recipients',
      label: 'Participants',
      apiName: 'members/participantSets',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: false,
      supportsDelete: false,
    },
    {
      name: 'documents',
      label: 'Documents',
      apiName: 'documents',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: false,
      supportsDelete: false,
    },
  ],

  webhookEvents: [
    'envelope.sent',
    'envelope.delivered',
    'envelope.signed',
    'envelope.completed',
    'envelope.declined',
    'recipient.signed',
    'recipient.declined',
  ],

  templateConfig: {
    templateFolder: '/Sandbox/Templates',
    autoPopulateFields: false,
  },

  signingOptions: {
    sequentialSigning: false,
    reminders: {
      enabled: true,
      delayDays: 3,
      repeatDays: 5,
    },
  },

  oauthSettings: {
    scopes: ['agreement_read', 'agreement_write', 'agreement_send'],
    refreshTokenUrl: 'https://api.na4.adobesign.com/oauth/v2/refresh',
    autoRefresh: true,
  },

  syncConfig: {
    strategy: 'incremental',
    direction: 'import',
    schedule: '0 */4 * * *',
    conflictResolution: 'source_wins',
    batchSize: 100,
  },

  rateLimitConfig: {
    strategy: 'token_bucket',
    maxRequests: 50,
    windowSeconds: 60,
  },

  status: 'active',
  enabled: true,
};
