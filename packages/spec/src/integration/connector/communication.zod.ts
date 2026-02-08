import { z } from 'zod';
import {
  ConnectorSchema,
} from '../connector.zod';

/**
 * Communication Connector Protocol
 * 
 * Specialized connector for team communication platform integration enabling
 * automated deal rooms, support channels, and CRM-driven messaging.
 * 
 * Use Cases:
 * - Automated deal room creation for CRM opportunities
 * - Support channel management tied to cases
 * - Real-time notification routing for business events
 * - Cross-platform messaging with Slack, Teams, Discord
 * - Bot-driven customer engagement workflows
 * 
 * @example
 * ```typescript
 * import { CommunicationConnector } from '@objectstack/spec/integration';
 * 
 * const slackConnector: CommunicationConnector = {
 *   name: 'slack_workspace',
 *   label: 'Slack Workspace',
 *   type: 'saas',
 *   provider: 'slack',
 *   baseUrl: 'https://slack.com/api',
 *   workspaceId: 'T01234567',
 *   authentication: {
 *     type: 'oauth2',
 *     clientId: '${SLACK_CLIENT_ID}',
 *     clientSecret: '${SLACK_CLIENT_SECRET}',
 *     authorizationUrl: 'https://slack.com/oauth/v2/authorize',
 *     tokenUrl: 'https://slack.com/api/oauth.v2.access',
 *     grantType: 'authorization_code',
 *     scopes: ['channels:read', 'chat:write', 'users:read'],
 *   },
 *   objectTypes: [
 *     {
 *       name: 'channels',
 *       label: 'Channels',
 *       apiName: 'conversations',
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
 * Communication Provider Types
 */
export const CommunicationProviderSchema = z.enum([
  'slack',
  'discord',
  'microsoft_teams',
  'custom',
]).describe('Communication platform provider');

export type CommunicationProvider = z.infer<typeof CommunicationProviderSchema>;

/**
 * Channel Type
 */
export const ChannelTypeSchema = z.enum([
  'channel',
  'direct_message',
  'group',
  'thread',
]).describe('Communication channel type');

export type ChannelType = z.infer<typeof ChannelTypeSchema>;

/**
 * Communication Webhook Event Types
 */
export const CommunicationWebhookEventSchema = z.enum([
  'message.received',
  'message.sent',
  'channel.created',
  'channel.archived',
  'member.joined',
  'member.left',
  'reaction.added',
  'mention.received',
]).describe('Communication webhook event type');

export type CommunicationWebhookEvent = z.infer<typeof CommunicationWebhookEventSchema>;

/**
 * Communication Object Type Schema
 * Represents a syncable entity in the communication system (e.g., Channel, Message, User)
 */
export const CommunicationObjectTypeSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Object type name (snake_case)'),
  label: z.string().describe('Display label'),
  apiName: z.string().describe('API name in external system'),
  enabled: z.boolean().default(true).describe('Enable sync for this object'),
  supportsCreate: z.boolean().default(true).describe('Supports record creation'),
  supportsUpdate: z.boolean().default(true).describe('Supports record updates'),
  supportsDelete: z.boolean().default(true).describe('Supports record deletion'),
});

export type CommunicationObjectType = z.infer<typeof CommunicationObjectTypeSchema>;

/**
 * Channel Mapping Schema
 * Maps CRM object types to communication channels for automatic room management
 */
export const ChannelMappingSchema = z.object({
  /**
   * CRM object type that triggers channel creation (e.g., 'deal', 'case')
   */
  objectType: z.string().describe('CRM object type (e.g., deal, case)'),

  /**
   * Prefix for auto-created channel names
   */
  channelPrefix: z.string().describe('Prefix for auto-created channel names'),

  /**
   * Automatically create channels when CRM records are created
   */
  autoCreate: z.boolean().default(true).describe('Auto-create channels for new records'),

  /**
   * Archive channels when the associated CRM record is closed
   */
  archiveOnClose: z.boolean().default(false).describe('Archive channel when record is closed'),
});

export type ChannelMapping = z.infer<typeof ChannelMappingSchema>;

/**
 * Notification Rule Schema
 * Routes business events to specific channels with mention and template support
 */
export const NotificationRuleSchema = z.object({
  /**
   * Business events that trigger notifications
   */
  events: z.array(z.string()).describe('Business events that trigger notifications (e.g., deal_won, case_escalated)'),

  /**
   * Target channel for notifications
   */
  targetChannel: z.string().describe('Target channel name or ID'),

  /**
   * Roles or groups to mention in notifications
   */
  mentionRoles: z.array(z.string()).describe('Roles or groups to mention'),

  /**
   * Optional message template with placeholders
   */
  templateMessage: z.string().optional().describe('Notification message template'),
});

export type NotificationRule = z.infer<typeof NotificationRuleSchema>;

/**
 * Bot Configuration Schema
 * Configures the bot identity used for automated messages
 */
export const BotConfigSchema = z.object({
  /**
   * Display name for the bot
   */
  botName: z.string().describe('Bot display name'),

  /**
   * Avatar URL for the bot
   */
  botAvatar: z.string().url().optional().describe('Bot avatar image URL'),

  /**
   * Default channel for bot messages
   */
  defaultChannel: z.string().optional().describe('Default channel for bot messages'),
});

export type BotConfig = z.infer<typeof BotConfigSchema>;

/**
 * Message Format Schema
 * Controls how messages are rendered in the communication platform
 */
export const MessageFormatSchema = z.enum([
  'plain_text',
  'markdown',
  'rich_text',
]).describe('Message formatting style');

export type MessageFormat = z.infer<typeof MessageFormatSchema>;

/**
 * Communication Connector Schema
 * Complete communication platform integration configuration
 */
export const CommunicationConnectorSchema = ConnectorSchema.extend({
  type: z.literal('saas'),

  /**
   * Communication platform provider
   */
  provider: CommunicationProviderSchema.describe('Communication platform provider'),

  /**
   * Communication API base URL
   */
  baseUrl: z.string().url().describe('Communication API base URL'),

  /**
   * Workspace or tenant identifier
   */
  workspaceId: z.string().describe('Workspace or tenant identifier (e.g., Slack workspace ID, Teams tenant ID)'),

  /**
   * Syncable communication object types
   */
  objectTypes: z.array(CommunicationObjectTypeSchema).describe('Syncable communication object types'),

  /**
   * Webhook events to subscribe to
   */
  webhookEvents: z.array(CommunicationWebhookEventSchema).optional().describe('Communication webhook events to subscribe to'),

  /**
   * Channel mappings for CRM object types
   */
  channelMappings: z.array(ChannelMappingSchema).optional().describe('CRM object-to-channel mappings'),

  /**
   * Notification routing rules
   */
  notificationRules: z.array(NotificationRuleSchema).optional().describe('Business event notification rules'),

  /**
   * Bot configuration
   */
  botConfig: BotConfigSchema.optional().describe('Bot identity configuration'),

  /**
   * Default message format
   */
  messageFormat: MessageFormatSchema.optional().describe('Default message formatting style'),

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

export type CommunicationConnector = z.infer<typeof CommunicationConnectorSchema>;

// ============================================================================
// Helper Functions & Examples
// ============================================================================

/**
 * Example: Slack Connector Configuration
 */
export const slackConnectorExample = {
  name: 'slack_workspace',
  label: 'Slack Workspace',
  type: 'saas',
  provider: 'slack',
  baseUrl: 'https://slack.com/api',
  workspaceId: 'T01234567',

  authentication: {
    type: 'oauth2',
    clientId: '${SLACK_CLIENT_ID}',
    clientSecret: '${SLACK_CLIENT_SECRET}',
    authorizationUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    grantType: 'authorization_code',
    scopes: ['channels:read', 'channels:write', 'chat:write', 'users:read', 'reactions:read'],
  },

  objectTypes: [
    {
      name: 'channels',
      label: 'Channels',
      apiName: 'conversations',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'messages',
      label: 'Messages',
      apiName: 'chat',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'users',
      label: 'Users',
      apiName: 'users',
      enabled: true,
      supportsCreate: false,
      supportsUpdate: false,
      supportsDelete: false,
    },
    {
      name: 'reactions',
      label: 'Reactions',
      apiName: 'reactions',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: false,
      supportsDelete: true,
    },
  ],

  webhookEvents: [
    'message.received',
    'message.sent',
    'channel.created',
    'channel.archived',
    'member.joined',
    'member.left',
    'reaction.added',
    'mention.received',
  ],

  channelMappings: [
    {
      objectType: 'deal',
      channelPrefix: 'deal-',
      autoCreate: true,
      archiveOnClose: true,
    },
    {
      objectType: 'case',
      channelPrefix: 'support-',
      autoCreate: true,
      archiveOnClose: false,
    },
  ],

  notificationRules: [
    {
      events: ['deal_won', 'deal_lost'],
      targetChannel: '#sales-updates',
      mentionRoles: ['sales-team'],
      templateMessage: '🎉 Deal {{deal_name}} was {{event}}!',
    },
    {
      events: ['case_created', 'case_escalated'],
      targetChannel: '#support-alerts',
      mentionRoles: ['support-leads', 'on-call'],
      templateMessage: '🚨 Case {{case_number}}: {{case_subject}} - {{event}}',
    },
  ],

  botConfig: {
    botName: 'ObjectStack Bot',
    botAvatar: 'https://cdn.objectstack.ai/bot-avatar.png',
    defaultChannel: '#general',
  },

  messageFormat: 'markdown',

  oauthSettings: {
    scopes: ['channels:read', 'chat:write', 'users:read'],
    refreshTokenUrl: 'https://slack.com/api/oauth.v2.access',
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
    maxRequests: 50,
    windowSeconds: 60,
    respectUpstreamLimits: true,
  },

  status: 'active',
  enabled: true,
};

/**
 * Example: Microsoft Teams Connector Configuration
 */
export const teamsConnectorExample = {
  name: 'teams_tenant',
  label: 'Microsoft Teams',
  type: 'saas',
  provider: 'microsoft_teams',
  baseUrl: 'https://graph.microsoft.com/v1.0',
  workspaceId: 'tenant-uuid-1234-5678',

  authentication: {
    type: 'oauth2',
    clientId: '${TEAMS_CLIENT_ID}',
    clientSecret: '${TEAMS_CLIENT_SECRET}',
    authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    grantType: 'authorization_code',
    scopes: ['ChannelMessage.Send', 'Channel.ReadBasic.All', 'Team.ReadBasic.All'],
  },

  objectTypes: [
    {
      name: 'channels',
      label: 'Channels',
      apiName: 'channels',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'messages',
      label: 'Messages',
      apiName: 'chatMessages',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'users',
      label: 'Users',
      apiName: 'members',
      enabled: true,
      supportsCreate: false,
      supportsUpdate: false,
      supportsDelete: false,
    },
  ],

  webhookEvents: [
    'message.received',
    'channel.created',
    'member.joined',
    'member.left',
  ],

  channelMappings: [
    {
      objectType: 'deal',
      channelPrefix: 'Deal-',
      autoCreate: true,
      archiveOnClose: true,
    },
  ],

  notificationRules: [
    {
      events: ['deal_won'],
      targetChannel: 'Sales Wins',
      mentionRoles: ['sales-managers'],
    },
  ],

  botConfig: {
    botName: 'ObjectStack',
  },

  messageFormat: 'rich_text',

  oauthSettings: {
    scopes: ['ChannelMessage.Send', 'Channel.ReadBasic.All'],
    refreshTokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    revokeTokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/logout',
    autoRefresh: true,
  },

  status: 'active',
  enabled: true,
};
