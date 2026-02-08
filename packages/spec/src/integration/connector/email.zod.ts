import { z } from 'zod';
import {
  ConnectorSchema,
} from '../connector.zod';

/**
 * Email Connector Protocol
 * 
 * Specialized connector for deep inbox integration enabling CRM features
 * like email-to-lead, email-to-case, open/click tracking, and thread sync.
 * 
 * Use Cases:
 * - Email-to-Lead: Auto-create leads from inbound emails
 * - Email-to-Case: Auto-create support cases from inbound emails
 * - Open & click tracking for sales engagement
 * - Bidirectional email thread sync with CRM records
 * - Signature management and template injection
 * 
 * @example
 * ```typescript
 * import { EmailConnector } from '@objectstack/spec/integration';
 * 
 * const gmailConnector: EmailConnector = {
 *   name: 'gmail_production',
 *   label: 'Gmail Production',
 *   type: 'saas',
 *   provider: 'gmail',
 *   baseUrl: 'https://gmail.googleapis.com',
 *   authentication: {
 *     type: 'oauth2',
 *     clientId: '${GMAIL_CLIENT_ID}',
 *     clientSecret: '${GMAIL_CLIENT_SECRET}',
 *     authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
 *     tokenUrl: 'https://oauth2.googleapis.com/token',
 *     grantType: 'authorization_code',
 *     scopes: ['https://www.googleapis.com/auth/gmail.modify'],
 *   },
 *   objectTypes: [
 *     {
 *       name: 'emails',
 *       label: 'Emails',
 *       apiName: 'messages',
 *       enabled: true,
 *       supportsCreate: true,
 *       supportsUpdate: false,
 *       supportsDelete: true,
 *     },
 *   ],
 * };
 * ```
 */

/**
 * Email Provider Types
 */
export const EmailProviderSchema = z.enum([
  'gmail',
  'outlook',
  'exchange',
  'smtp',
  'custom',
]).describe('Email provider type');

export type EmailProvider = z.infer<typeof EmailProviderSchema>;

/**
 * Email Sync Direction
 */
export const EmailSyncDirectionSchema = z.enum([
  'inbound',
  'outbound',
  'bidirectional',
]).describe('Email sync direction');

export type EmailSyncDirection = z.infer<typeof EmailSyncDirectionSchema>;

/**
 * Email Webhook Event Types
 */
export const EmailWebhookEventSchema = z.enum([
  'email.received',
  'email.sent',
  'email.opened',
  'email.clicked',
  'email.bounced',
  'email.unsubscribed',
  'thread.replied',
]).describe('Email webhook event type');

export type EmailWebhookEvent = z.infer<typeof EmailWebhookEventSchema>;

/**
 * Email Object Type Schema
 * Represents a syncable entity in the email system (e.g., Email, Thread, Contact)
 */
export const EmailObjectTypeSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Object type name (snake_case)'),
  label: z.string().describe('Display label'),
  apiName: z.string().describe('API name in external system'),
  enabled: z.boolean().default(true).describe('Enable sync for this object'),
  supportsCreate: z.boolean().default(true).describe('Supports record creation'),
  supportsUpdate: z.boolean().default(true).describe('Supports record updates'),
  supportsDelete: z.boolean().default(true).describe('Supports record deletion'),
});

export type EmailObjectType = z.infer<typeof EmailObjectTypeSchema>;

/**
 * Email-to-Lead Configuration
 * Automatically create CRM leads from inbound emails
 */
export const EmailToLeadConfigSchema = z.object({
  enabled: z.boolean().describe('Enable email-to-lead conversion'),
  matchField: z.string().describe('Field to match against existing records (e.g., email)'),
  createUnmatched: z.boolean().describe('Create new lead when no match is found'),
  defaultOwner: z.string().optional().describe('Default lead owner (user or queue)'),
  defaultStatus: z.string().optional().describe('Default lead status on creation'),
});

export type EmailToLeadConfig = z.infer<typeof EmailToLeadConfigSchema>;

/**
 * Email-to-Case Configuration
 * Automatically create support cases from inbound emails
 */
export const EmailToCaseConfigSchema = z.object({
  enabled: z.boolean().describe('Enable email-to-case conversion'),
  matchField: z.string().describe('Field to match against existing records (e.g., email)'),
  createUnmatched: z.boolean().describe('Create new case when no match is found'),
  defaultPriority: z.string().optional().describe('Default case priority on creation'),
  defaultQueue: z.string().optional().describe('Default case queue for routing'),
});

export type EmailToCaseConfig = z.infer<typeof EmailToCaseConfigSchema>;

/**
 * Email Tracking Configuration
 * Controls open, click, and reply tracking for outbound emails
 */
export const EmailTrackingConfigSchema = z.object({
  trackOpens: z.boolean().describe('Track email open events'),
  trackClicks: z.boolean().describe('Track link click events'),
  trackReplies: z.boolean().describe('Track reply events'),
});

export type EmailTrackingConfig = z.infer<typeof EmailTrackingConfigSchema>;

/**
 * Signature Position
 */
export const SignaturePositionSchema = z.enum([
  'bottom',
  'top',
]).describe('Signature insertion position');

export type SignaturePosition = z.infer<typeof SignaturePositionSchema>;

/**
 * Signature Configuration
 * Controls email signature injection
 */
export const SignatureConfigSchema = z.object({
  enabled: z.boolean().describe('Enable automatic signature injection'),
  templateId: z.string().optional().describe('Signature template identifier'),
  position: SignaturePositionSchema.describe('Signature position in email body'),
});

export type SignatureConfig = z.infer<typeof SignatureConfigSchema>;

/**
 * Email Sync Scope Configuration
 * Controls which folders and labels are synced
 */
export const EmailSyncScopeSchema = z.object({
  folders: z.array(z.string()).describe('Folders to sync (e.g., inbox, sent, drafts)'),
  excludeLabels: z.array(z.string()).optional().describe('Labels to exclude from sync'),
  maxAgeDays: z.number().int().min(1).optional().describe('Maximum email age in days to sync'),
});

export type EmailSyncScope = z.infer<typeof EmailSyncScopeSchema>;

/**
 * Email Connector Schema
 * Complete email integration configuration for CRM inbox sync
 */
export const EmailConnectorSchema = ConnectorSchema.extend({
  type: z.literal('saas'),

  /**
   * Email provider type
   */
  provider: EmailProviderSchema.describe('Email provider'),

  /**
   * Email API base URL
   */
  baseUrl: z.string().url().describe('Email API base URL'),

  /**
   * Syncable email object types
   */
  objectTypes: z.array(EmailObjectTypeSchema).describe('Syncable email object types'),

  /**
   * Webhook events to subscribe to
   */
  webhookEvents: z.array(EmailWebhookEventSchema).optional().describe('Email webhook events to subscribe to'),

  /**
   * Email-to-Lead configuration
   */
  emailToLead: EmailToLeadConfigSchema.optional().describe('Email-to-Lead conversion configuration'),

  /**
   * Email-to-Case configuration
   */
  emailToCase: EmailToCaseConfigSchema.optional().describe('Email-to-Case conversion configuration'),

  /**
   * Email tracking configuration
   */
  trackingConfig: EmailTrackingConfigSchema.optional().describe('Email open/click/reply tracking configuration'),

  /**
   * Signature configuration
   */
  signatureConfig: SignatureConfigSchema.optional().describe('Email signature injection configuration'),

  /**
   * Sync scope configuration
   */
  syncScope: EmailSyncScopeSchema.optional().describe('Folders and labels to include in sync'),

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

export type EmailConnector = z.infer<typeof EmailConnectorSchema>;

// ============================================================================
// Helper Functions & Examples
// ============================================================================

/**
 * Example: Gmail Connector Configuration
 */
export const gmailConnectorExample = {
  name: 'gmail_production',
  label: 'Gmail Production',
  type: 'saas',
  provider: 'gmail',
  baseUrl: 'https://gmail.googleapis.com',

  authentication: {
    type: 'oauth2',
    clientId: '${GMAIL_CLIENT_ID}',
    clientSecret: '${GMAIL_CLIENT_SECRET}',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    grantType: 'authorization_code',
    scopes: [
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.send',
    ],
  },

  objectTypes: [
    {
      name: 'emails',
      label: 'Emails',
      apiName: 'messages',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: false,
      supportsDelete: true,
    },
    {
      name: 'threads',
      label: 'Threads',
      apiName: 'threads',
      enabled: true,
      supportsCreate: false,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'contacts',
      label: 'Contacts',
      apiName: 'people',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'labels',
      label: 'Labels',
      apiName: 'labels',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'attachments',
      label: 'Attachments',
      apiName: 'attachments',
      enabled: true,
      supportsCreate: false,
      supportsUpdate: false,
      supportsDelete: false,
    },
  ],

  webhookEvents: [
    'email.received',
    'email.sent',
    'email.opened',
    'email.clicked',
    'email.bounced',
    'thread.replied',
  ],

  emailToLead: {
    enabled: true,
    matchField: 'email',
    createUnmatched: true,
    defaultOwner: 'sales_queue',
    defaultStatus: 'new',
  },

  emailToCase: {
    enabled: true,
    matchField: 'email',
    createUnmatched: true,
    defaultPriority: 'medium',
    defaultQueue: 'support_queue',
  },

  trackingConfig: {
    trackOpens: true,
    trackClicks: true,
    trackReplies: true,
  },

  signatureConfig: {
    enabled: true,
    templateId: 'sig_corporate_default',
    position: 'bottom',
  },

  syncScope: {
    folders: ['inbox', 'sent', 'drafts'],
    excludeLabels: ['spam', 'trash'],
    maxAgeDays: 90,
  },

  oauthSettings: {
    scopes: [
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.send',
    ],
    refreshTokenUrl: 'https://oauth2.googleapis.com/token',
    autoRefresh: true,
  },

  syncConfig: {
    strategy: 'incremental',
    direction: 'bidirectional',
    schedule: '*/5 * * * *',
    realtimeSync: true,
    conflictResolution: 'source_wins',
    batchSize: 50,
  },

  rateLimitConfig: {
    strategy: 'token_bucket',
    maxRequests: 250,
    windowSeconds: 1,
    respectUpstreamLimits: true,
  },

  status: 'active',
  enabled: true,
};

/**
 * Example: Outlook Connector Configuration
 */
export const outlookConnectorExample = {
  name: 'outlook_enterprise',
  label: 'Outlook Enterprise',
  type: 'saas',
  provider: 'outlook',
  baseUrl: 'https://graph.microsoft.com/v1.0',

  authentication: {
    type: 'oauth2',
    clientId: '${OUTLOOK_CLIENT_ID}',
    clientSecret: '${OUTLOOK_CLIENT_SECRET}',
    authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    grantType: 'authorization_code',
    scopes: ['Mail.ReadWrite', 'Mail.Send', 'Contacts.ReadWrite'],
  },

  objectTypes: [
    {
      name: 'emails',
      label: 'Emails',
      apiName: 'messages',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'threads',
      label: 'Conversations',
      apiName: 'conversations',
      enabled: true,
      supportsCreate: false,
      supportsUpdate: false,
      supportsDelete: true,
    },
    {
      name: 'contacts',
      label: 'Contacts',
      apiName: 'contacts',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'attachments',
      label: 'Attachments',
      apiName: 'attachments',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: false,
      supportsDelete: true,
    },
  ],

  webhookEvents: [
    'email.received',
    'email.sent',
    'email.opened',
    'email.bounced',
    'thread.replied',
  ],

  emailToLead: {
    enabled: true,
    matchField: 'email',
    createUnmatched: false,
    defaultOwner: 'enterprise_sales',
  },

  trackingConfig: {
    trackOpens: true,
    trackClicks: false,
    trackReplies: true,
  },

  signatureConfig: {
    enabled: true,
    templateId: 'sig_enterprise',
    position: 'bottom',
  },

  syncScope: {
    folders: ['inbox', 'sent'],
    maxAgeDays: 180,
  },

  oauthSettings: {
    scopes: ['Mail.ReadWrite', 'Mail.Send', 'Contacts.ReadWrite'],
    refreshTokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    revokeTokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/logout',
    autoRefresh: true,
  },

  syncConfig: {
    strategy: 'incremental',
    direction: 'import',
    schedule: '0 */2 * * *',
    conflictResolution: 'source_wins',
    batchSize: 100,
  },

  rateLimitConfig: {
    strategy: 'token_bucket',
    maxRequests: 10000,
    windowSeconds: 600,
  },

  status: 'active',
  enabled: true,
};
