import { describe, it, expect } from 'vitest';
import {
  EmailConnectorSchema,
  EmailProviderSchema,
  EmailSyncDirectionSchema,
  EmailWebhookEventSchema,
  EmailObjectTypeSchema,
  EmailToLeadConfigSchema,
  EmailToCaseConfigSchema,
  EmailTrackingConfigSchema,
  SignatureConfigSchema,
  SignaturePositionSchema,
  EmailSyncScopeSchema,
  gmailConnectorExample,
  outlookConnectorExample,
  type EmailConnector,
} from './email.zod';

describe('EmailProviderSchema', () => {
  it('should accept all valid providers', () => {
    const providers = ['gmail', 'outlook', 'exchange', 'smtp', 'custom'] as const;

    providers.forEach(provider => {
      expect(() => EmailProviderSchema.parse(provider)).not.toThrow();
    });
  });

  it('should reject invalid provider', () => {
    expect(() => EmailProviderSchema.parse('yahoo')).toThrow();
  });
});

describe('EmailSyncDirectionSchema', () => {
  it('should accept all valid sync directions', () => {
    const directions = ['inbound', 'outbound', 'bidirectional'] as const;

    directions.forEach(direction => {
      expect(() => EmailSyncDirectionSchema.parse(direction)).not.toThrow();
    });
  });

  it('should reject invalid sync direction', () => {
    expect(() => EmailSyncDirectionSchema.parse('both')).toThrow();
  });
});

describe('EmailWebhookEventSchema', () => {
  it('should accept all valid webhook events', () => {
    const events = [
      'email.received', 'email.sent', 'email.opened', 'email.clicked',
      'email.bounced', 'email.unsubscribed', 'thread.replied',
    ] as const;

    events.forEach(event => {
      expect(() => EmailWebhookEventSchema.parse(event)).not.toThrow();
    });
  });

  it('should reject invalid webhook event', () => {
    expect(() => EmailWebhookEventSchema.parse('email.archived')).toThrow();
  });
});

describe('EmailObjectTypeSchema', () => {
  it('should accept valid object type with CRUD flags', () => {
    const objectType = {
      name: 'emails',
      label: 'Emails',
      apiName: 'messages',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: false,
      supportsDelete: true,
    };

    expect(() => EmailObjectTypeSchema.parse(objectType)).not.toThrow();
  });

  it('should enforce snake_case for object type name', () => {
    expect(() => EmailObjectTypeSchema.parse({
      name: 'email_threads',
      label: 'Threads',
      apiName: 'threads',
    })).not.toThrow();

    expect(() => EmailObjectTypeSchema.parse({
      name: 'EmailThreads',
      label: 'Email Threads',
      apiName: 'threads',
    })).toThrow();
  });

  it('should apply defaults for CRUD flags', () => {
    const result = EmailObjectTypeSchema.parse({
      name: 'contacts',
      label: 'Contacts',
      apiName: 'contacts',
    });

    expect(result.enabled).toBe(true);
    expect(result.supportsCreate).toBe(true);
    expect(result.supportsUpdate).toBe(true);
    expect(result.supportsDelete).toBe(true);
  });
});

describe('EmailToLeadConfigSchema', () => {
  it('should accept full email-to-lead config', () => {
    const config = {
      enabled: true,
      matchField: 'email',
      createUnmatched: true,
      defaultOwner: 'sales_queue',
      defaultStatus: 'new',
    };

    expect(() => EmailToLeadConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept minimal email-to-lead config without optional fields', () => {
    const config = {
      enabled: false,
      matchField: 'email',
      createUnmatched: false,
    };

    const result = EmailToLeadConfigSchema.parse(config);
    expect(result.enabled).toBe(false);
    expect(result.defaultOwner).toBeUndefined();
    expect(result.defaultStatus).toBeUndefined();
  });
});

describe('EmailToCaseConfigSchema', () => {
  it('should accept full email-to-case config', () => {
    const config = {
      enabled: true,
      matchField: 'email',
      createUnmatched: true,
      defaultPriority: 'high',
      defaultQueue: 'support_queue',
    };

    expect(() => EmailToCaseConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept minimal email-to-case config without optional fields', () => {
    const config = {
      enabled: true,
      matchField: 'email',
      createUnmatched: false,
    };

    const result = EmailToCaseConfigSchema.parse(config);
    expect(result.defaultPriority).toBeUndefined();
    expect(result.defaultQueue).toBeUndefined();
  });
});

describe('EmailTrackingConfigSchema', () => {
  it('should accept full tracking config', () => {
    const config = {
      trackOpens: true,
      trackClicks: true,
      trackReplies: false,
    };

    const result = EmailTrackingConfigSchema.parse(config);
    expect(result.trackOpens).toBe(true);
    expect(result.trackClicks).toBe(true);
    expect(result.trackReplies).toBe(false);
  });
});

describe('SignatureConfigSchema', () => {
  it('should accept full signature config', () => {
    const config = {
      enabled: true,
      templateId: 'sig_corporate',
      position: 'bottom',
    };

    expect(() => SignatureConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept signature config without optional templateId', () => {
    const config = {
      enabled: false,
      position: 'top',
    };

    const result = SignatureConfigSchema.parse(config);
    expect(result.templateId).toBeUndefined();
  });

  it('should accept both position values', () => {
    expect(() => SignaturePositionSchema.parse('bottom')).not.toThrow();
    expect(() => SignaturePositionSchema.parse('top')).not.toThrow();
    expect(() => SignaturePositionSchema.parse('middle')).toThrow();
  });
});

describe('EmailSyncScopeSchema', () => {
  it('should accept full sync scope config', () => {
    const scope = {
      folders: ['inbox', 'sent', 'drafts'],
      excludeLabels: ['spam', 'trash'],
      maxAgeDays: 90,
    };

    expect(() => EmailSyncScopeSchema.parse(scope)).not.toThrow();
  });

  it('should accept minimal sync scope with only folders', () => {
    const scope = {
      folders: ['inbox'],
    };

    const result = EmailSyncScopeSchema.parse(scope);
    expect(result.excludeLabels).toBeUndefined();
    expect(result.maxAgeDays).toBeUndefined();
  });
});

describe('EmailConnectorSchema', () => {
  describe('Basic Properties', () => {
    it('should accept minimal email connector', () => {
      const connector: EmailConnector = {
        name: 'gmail_test',
        label: 'Gmail Test',
        type: 'saas',
        provider: 'gmail',
        baseUrl: 'https://gmail.googleapis.com',
        authentication: {
          type: 'oauth2',
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          grantType: 'authorization_code',
        },
        objectTypes: [
          {
            name: 'emails',
            label: 'Emails',
            apiName: 'messages',
          },
        ],
      };

      expect(() => EmailConnectorSchema.parse(connector)).not.toThrow();
    });

    it('should enforce snake_case for connector name', () => {
      const validNames = ['gmail_test', 'outlook_production', '_internal'];
      validNames.forEach(name => {
        expect(() => EmailConnectorSchema.parse({
          name,
          label: 'Test',
          type: 'saas',
          provider: 'gmail',
          baseUrl: 'https://gmail.googleapis.com',
          authentication: { type: 'oauth2', clientId: 'x', clientSecret: 'y', authorizationUrl: 'https://x.com', tokenUrl: 'https://y.com', grantType: 'authorization_code' },
          objectTypes: [{ name: 'emails', label: 'Emails', apiName: 'messages' }],
        })).not.toThrow();
      });

      const invalidNames = ['gmailTest', 'Gmail-Test', '123gmail'];
      invalidNames.forEach(name => {
        expect(() => EmailConnectorSchema.parse({
          name,
          label: 'Test',
          type: 'saas',
          provider: 'gmail',
          baseUrl: 'https://gmail.googleapis.com',
          authentication: { type: 'oauth2', clientId: 'x', clientSecret: 'y', authorizationUrl: 'https://x.com', tokenUrl: 'https://y.com', grantType: 'authorization_code' },
          objectTypes: [{ name: 'emails', label: 'Emails', apiName: 'messages' }],
        })).toThrow();
      });
    });
  });

  describe('Complete Configuration', () => {
    it('should accept full email connector with all features', () => {
      const connector: EmailConnector = {
        name: 'gmail_full',
        label: 'Gmail Full Config',
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
          scopes: ['https://www.googleapis.com/auth/gmail.modify'],
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
        ],

        webhookEvents: ['email.received', 'email.sent', 'email.opened'],

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
          templateId: 'sig_corporate',
          position: 'bottom',
        },

        syncScope: {
          folders: ['inbox', 'sent', 'drafts'],
          excludeLabels: ['spam', 'trash'],
          maxAgeDays: 90,
        },

        oauthSettings: {
          scopes: ['https://www.googleapis.com/auth/gmail.modify'],
          refreshTokenUrl: 'https://oauth2.googleapis.com/token',
          autoRefresh: true,
        },

        status: 'active',
        enabled: true,
      };

      expect(() => EmailConnectorSchema.parse(connector)).not.toThrow();
    });
  });

  describe('Example Configurations', () => {
    it('should accept Gmail connector example', () => {
      expect(() => EmailConnectorSchema.parse(gmailConnectorExample)).not.toThrow();
    });

    it('should accept Outlook connector example', () => {
      expect(() => EmailConnectorSchema.parse(outlookConnectorExample)).not.toThrow();
    });
  });
});
