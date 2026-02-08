import { describe, it, expect } from 'vitest';
import {
  CommunicationConnectorSchema,
  CommunicationProviderSchema,
  ChannelTypeSchema,
  CommunicationWebhookEventSchema,
  CommunicationObjectTypeSchema,
  ChannelMappingSchema,
  NotificationRuleSchema,
  BotConfigSchema,
  MessageFormatSchema,
  slackConnectorExample,
  teamsConnectorExample,
  type CommunicationConnector,
} from './communication.zod';

describe('CommunicationProviderSchema', () => {
  it('should accept all valid providers', () => {
    const providers = ['slack', 'discord', 'microsoft_teams', 'custom'] as const;

    providers.forEach(provider => {
      expect(() => CommunicationProviderSchema.parse(provider)).not.toThrow();
    });
  });

  it('should reject invalid provider', () => {
    expect(() => CommunicationProviderSchema.parse('telegram')).toThrow();
  });
});

describe('ChannelTypeSchema', () => {
  it('should accept all valid channel types', () => {
    const types = ['channel', 'direct_message', 'group', 'thread'] as const;

    types.forEach(type => {
      expect(() => ChannelTypeSchema.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid channel type', () => {
    expect(() => ChannelTypeSchema.parse('broadcast')).toThrow();
  });
});

describe('CommunicationWebhookEventSchema', () => {
  it('should accept all valid webhook events', () => {
    const events = [
      'message.received', 'message.sent',
      'channel.created', 'channel.archived',
      'member.joined', 'member.left',
      'reaction.added', 'mention.received',
    ] as const;

    events.forEach(event => {
      expect(() => CommunicationWebhookEventSchema.parse(event)).not.toThrow();
    });
  });

  it('should reject invalid webhook event', () => {
    expect(() => CommunicationWebhookEventSchema.parse('file.uploaded')).toThrow();
  });
});

describe('CommunicationObjectTypeSchema', () => {
  it('should accept valid object type with CRUD flags', () => {
    const objectType = {
      name: 'channels',
      label: 'Channels',
      apiName: 'conversations',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    };

    expect(() => CommunicationObjectTypeSchema.parse(objectType)).not.toThrow();
  });

  it('should enforce snake_case for object type name', () => {
    expect(() => CommunicationObjectTypeSchema.parse({
      name: 'channels',
      label: 'Channels',
      apiName: 'conversations',
    })).not.toThrow();

    expect(() => CommunicationObjectTypeSchema.parse({
      name: 'DirectMessages',
      label: 'Direct Messages',
      apiName: 'dm',
    })).toThrow();
  });

  it('should apply defaults for CRUD flags', () => {
    const result = CommunicationObjectTypeSchema.parse({
      name: 'messages',
      label: 'Messages',
      apiName: 'chat',
    });

    expect(result.enabled).toBe(true);
    expect(result.supportsCreate).toBe(true);
    expect(result.supportsUpdate).toBe(true);
    expect(result.supportsDelete).toBe(true);
  });
});

describe('ChannelMappingSchema', () => {
  it('should accept full channel mapping', () => {
    const mapping = {
      objectType: 'deal',
      channelPrefix: 'deal-',
      autoCreate: true,
      archiveOnClose: true,
    };

    expect(() => ChannelMappingSchema.parse(mapping)).not.toThrow();
  });

  it('should apply defaults for autoCreate and archiveOnClose', () => {
    const result = ChannelMappingSchema.parse({
      objectType: 'case',
      channelPrefix: 'support-',
    });

    expect(result.autoCreate).toBe(true);
    expect(result.archiveOnClose).toBe(false);
  });
});

describe('NotificationRuleSchema', () => {
  it('should accept notification rule with template', () => {
    const rule = {
      events: ['deal_won', 'deal_lost'],
      targetChannel: '#sales-updates',
      mentionRoles: ['sales-team'],
      templateMessage: '🎉 Deal {{deal_name}} was {{event}}!',
    };

    expect(() => NotificationRuleSchema.parse(rule)).not.toThrow();
  });

  it('should accept notification rule without template', () => {
    const rule = {
      events: ['case_created'],
      targetChannel: '#support-alerts',
      mentionRoles: ['support-leads'],
    };

    expect(() => NotificationRuleSchema.parse(rule)).not.toThrow();
  });
});

describe('BotConfigSchema', () => {
  it('should accept full bot config', () => {
    const config = {
      botName: 'ObjectStack Bot',
      botAvatar: 'https://cdn.objectstack.ai/bot-avatar.png',
      defaultChannel: '#general',
    };

    expect(() => BotConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept minimal bot config', () => {
    const config = {
      botName: 'Bot',
    };

    expect(() => BotConfigSchema.parse(config)).not.toThrow();
  });

  it('should reject invalid avatar URL', () => {
    expect(() => BotConfigSchema.parse({
      botName: 'Bot',
      botAvatar: 'not-a-url',
    })).toThrow();
  });
});

describe('MessageFormatSchema', () => {
  it('should accept all valid formats', () => {
    const formats = ['plain_text', 'markdown', 'rich_text'] as const;

    formats.forEach(format => {
      expect(() => MessageFormatSchema.parse(format)).not.toThrow();
    });
  });

  it('should reject invalid format', () => {
    expect(() => MessageFormatSchema.parse('html')).toThrow();
  });
});

describe('CommunicationConnectorSchema', () => {
  describe('Basic Properties', () => {
    it('should accept minimal communication connector', () => {
      const connector: CommunicationConnector = {
        name: 'slack_test',
        label: 'Slack Test',
        type: 'saas',
        provider: 'slack',
        baseUrl: 'https://slack.com/api',
        workspaceId: 'T01234567',
        authentication: {
          type: 'oauth2',
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          authorizationUrl: 'https://slack.com/oauth/v2/authorize',
          tokenUrl: 'https://slack.com/api/oauth.v2.access',
          grantType: 'authorization_code',
        },
        objectTypes: [
          {
            name: 'channels',
            label: 'Channels',
            apiName: 'conversations',
          },
        ],
      };

      expect(() => CommunicationConnectorSchema.parse(connector)).not.toThrow();
    });

    it('should enforce snake_case for connector name', () => {
      const validNames = ['slack_test', 'teams_production', '_internal'];
      validNames.forEach(name => {
        expect(() => CommunicationConnectorSchema.parse({
          name,
          label: 'Test',
          type: 'saas',
          provider: 'slack',
          baseUrl: 'https://slack.com/api',
          workspaceId: 'T01234567',
          authentication: { type: 'oauth2', clientId: 'x', clientSecret: 'y', authorizationUrl: 'https://x.com', tokenUrl: 'https://y.com', grantType: 'authorization_code' },
          objectTypes: [{ name: 'channels', label: 'Channels', apiName: 'conversations' }],
        })).not.toThrow();
      });

      const invalidNames = ['slackTest', 'Slack-Test', '123slack'];
      invalidNames.forEach(name => {
        expect(() => CommunicationConnectorSchema.parse({
          name,
          label: 'Test',
          type: 'saas',
          provider: 'slack',
          baseUrl: 'https://slack.com/api',
          workspaceId: 'T01234567',
          authentication: { type: 'oauth2', clientId: 'x', clientSecret: 'y', authorizationUrl: 'https://x.com', tokenUrl: 'https://y.com', grantType: 'authorization_code' },
          objectTypes: [{ name: 'channels', label: 'Channels', apiName: 'conversations' }],
        })).toThrow();
      });
    });
  });

  describe('Complete Configuration', () => {
    it('should accept full communication connector with all features', () => {
      const connector: CommunicationConnector = {
        name: 'slack_full',
        label: 'Slack Full Config',
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
          scopes: ['channels:read', 'chat:write'],
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
        ],

        webhookEvents: ['message.received', 'channel.created', 'member.joined'],

        channelMappings: [
          {
            objectType: 'deal',
            channelPrefix: 'deal-',
            autoCreate: true,
            archiveOnClose: true,
          },
        ],

        notificationRules: [
          {
            events: ['deal_won'],
            targetChannel: '#sales-updates',
            mentionRoles: ['sales-team'],
            templateMessage: '🎉 Deal {{deal_name}} won!',
          },
        ],

        botConfig: {
          botName: 'ObjectStack Bot',
          botAvatar: 'https://cdn.objectstack.ai/bot-avatar.png',
          defaultChannel: '#general',
        },

        messageFormat: 'markdown',

        oauthSettings: {
          scopes: ['channels:read', 'chat:write'],
          refreshTokenUrl: 'https://slack.com/api/oauth.v2.access',
          autoRefresh: true,
        },

        status: 'active',
        enabled: true,
      };

      expect(() => CommunicationConnectorSchema.parse(connector)).not.toThrow();
    });
  });

  describe('Example Configurations', () => {
    it('should accept Slack connector example', () => {
      expect(() => CommunicationConnectorSchema.parse(slackConnectorExample)).not.toThrow();
    });

    it('should accept Teams connector example', () => {
      expect(() => CommunicationConnectorSchema.parse(teamsConnectorExample)).not.toThrow();
    });
  });
});
