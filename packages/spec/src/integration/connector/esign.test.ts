import { describe, it, expect } from 'vitest';
import {
  ESignConnectorSchema,
  ESignProviderSchema,
  ESignEnvelopeStatusSchema,
  ESignSigningMethodSchema,
  ESignWebhookEventSchema,
  ESignObjectTypeSchema,
  ESignTemplateConfigSchema,
  ESignSigningOptionsSchema,
  ESignBrandingConfigSchema,
  docusignConnectorExample,
  adobeSignConnectorExample,
  type ESignConnector,
} from './esign.zod';

describe('ESignProviderSchema', () => {
  it('should accept all valid providers', () => {
    const providers = ['docusign', 'adobe_sign', 'hellosign', 'pandadoc', 'custom'] as const;

    providers.forEach(provider => {
      expect(() => ESignProviderSchema.parse(provider)).not.toThrow();
    });
  });

  it('should reject invalid provider', () => {
    expect(() => ESignProviderSchema.parse('signwell')).toThrow();
  });
});

describe('ESignEnvelopeStatusSchema', () => {
  it('should accept all valid statuses', () => {
    const statuses = ['draft', 'sent', 'delivered', 'signed', 'completed', 'declined', 'voided'] as const;

    statuses.forEach(status => {
      expect(() => ESignEnvelopeStatusSchema.parse(status)).not.toThrow();
    });
  });

  it('should reject invalid status', () => {
    expect(() => ESignEnvelopeStatusSchema.parse('expired')).toThrow();
  });
});

describe('ESignSigningMethodSchema', () => {
  it('should accept all valid signing methods', () => {
    const methods = ['email', 'sms', 'in_person', 'embedded'] as const;

    methods.forEach(method => {
      expect(() => ESignSigningMethodSchema.parse(method)).not.toThrow();
    });
  });

  it('should reject invalid signing method', () => {
    expect(() => ESignSigningMethodSchema.parse('fax')).toThrow();
  });
});

describe('ESignWebhookEventSchema', () => {
  it('should accept all valid webhook events', () => {
    const events = [
      'envelope.sent', 'envelope.delivered', 'envelope.signed', 'envelope.completed',
      'envelope.declined', 'envelope.voided',
      'recipient.signed', 'recipient.declined',
    ] as const;

    events.forEach(event => {
      expect(() => ESignWebhookEventSchema.parse(event)).not.toThrow();
    });
  });

  it('should reject invalid webhook event', () => {
    expect(() => ESignWebhookEventSchema.parse('document.uploaded')).toThrow();
  });
});

describe('ESignObjectTypeSchema', () => {
  it('should accept valid object type with CRUD flags', () => {
    const objectType = {
      name: 'envelopes',
      label: 'Envelopes',
      apiName: 'envelopes',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    };

    expect(() => ESignObjectTypeSchema.parse(objectType)).not.toThrow();
  });

  it('should enforce snake_case for object type name', () => {
    expect(() => ESignObjectTypeSchema.parse({
      name: 'envelopes',
      label: 'Envelopes',
      apiName: 'envelopes',
    })).not.toThrow();

    expect(() => ESignObjectTypeSchema.parse({
      name: 'SignedDocuments',
      label: 'Signed Documents',
      apiName: 'signed_documents',
    })).toThrow();
  });

  it('should apply defaults for CRUD flags', () => {
    const result = ESignObjectTypeSchema.parse({
      name: 'templates',
      label: 'Templates',
      apiName: 'templates',
    });

    expect(result.enabled).toBe(true);
    expect(result.supportsCreate).toBe(true);
    expect(result.supportsUpdate).toBe(true);
    expect(result.supportsDelete).toBe(true);
  });
});

describe('ESignTemplateConfigSchema', () => {
  it('should accept full template config', () => {
    const config = {
      defaultTemplateId: 'tmpl_001',
      templateFolder: '/Production/Contracts',
      autoPopulateFields: true,
    };

    expect(() => ESignTemplateConfigSchema.parse(config)).not.toThrow();
  });

  it('should apply default for autoPopulateFields', () => {
    const result = ESignTemplateConfigSchema.parse({});
    expect(result.autoPopulateFields).toBe(false);
  });
});

describe('ESignSigningOptionsSchema', () => {
  it('should accept signing options with reminders and expiration', () => {
    const options = {
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
    };

    expect(() => ESignSigningOptionsSchema.parse(options)).not.toThrow();
  });

  it('should apply default for sequentialSigning', () => {
    const result = ESignSigningOptionsSchema.parse({});
    expect(result.sequentialSigning).toBe(false);
  });
});

describe('ESignBrandingConfigSchema', () => {
  it('should accept full branding config', () => {
    const config = {
      logoUrl: 'https://cdn.example.com/logo.png',
      brandColor: '#1A73E8',
      companyName: 'Acme Corp',
    };

    expect(() => ESignBrandingConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept empty branding config', () => {
    expect(() => ESignBrandingConfigSchema.parse({})).not.toThrow();
  });
});

describe('ESignConnectorSchema', () => {
  describe('Basic Properties', () => {
    it('should accept minimal e-sign connector', () => {
      const connector: ESignConnector = {
        name: 'docusign_test',
        label: 'DocuSign Test',
        type: 'saas',
        provider: 'docusign',
        baseUrl: 'https://demo.docusign.net/restapi',
        accountId: 'test-account-id',
        environment: 'sandbox',
        authentication: {
          type: 'oauth2',
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          authorizationUrl: 'https://account-d.docusign.com/oauth/auth',
          tokenUrl: 'https://account-d.docusign.com/oauth/token',
          grantType: 'authorization_code',
        },
        objectTypes: [
          {
            name: 'envelopes',
            label: 'Envelopes',
            apiName: 'envelopes',
          },
        ],
      };

      expect(() => ESignConnectorSchema.parse(connector)).not.toThrow();
    });

    it('should enforce snake_case for connector name', () => {
      const validNames = ['docusign_test', 'adobe_sign_production', '_internal'];
      validNames.forEach(name => {
        expect(() => ESignConnectorSchema.parse({
          name,
          label: 'Test',
          type: 'saas',
          provider: 'docusign',
          baseUrl: 'https://demo.docusign.net/restapi',
          accountId: 'test-id',
          environment: 'sandbox',
          authentication: { type: 'oauth2', clientId: 'x', clientSecret: 'y', authorizationUrl: 'https://x.com', tokenUrl: 'https://y.com', grantType: 'authorization_code' },
          objectTypes: [{ name: 'envelopes', label: 'Envelopes', apiName: 'envelopes' }],
        })).not.toThrow();
      });

      const invalidNames = ['docuSignTest', 'DocuSign-Test', '123docusign'];
      invalidNames.forEach(name => {
        expect(() => ESignConnectorSchema.parse({
          name,
          label: 'Test',
          type: 'saas',
          provider: 'docusign',
          baseUrl: 'https://demo.docusign.net/restapi',
          accountId: 'test-id',
          environment: 'sandbox',
          authentication: { type: 'oauth2', clientId: 'x', clientSecret: 'y', authorizationUrl: 'https://x.com', tokenUrl: 'https://y.com', grantType: 'authorization_code' },
          objectTypes: [{ name: 'envelopes', label: 'Envelopes', apiName: 'envelopes' }],
        })).toThrow();
      });
    });
  });

  describe('Complete Configuration', () => {
    it('should accept full e-sign connector with all features', () => {
      const connector: ESignConnector = {
        name: 'docusign_full',
        label: 'DocuSign Full Config',
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
        ],

        webhookEvents: ['envelope.sent', 'envelope.completed', 'recipient.signed'],

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

        status: 'active',
        enabled: true,
      };

      expect(() => ESignConnectorSchema.parse(connector)).not.toThrow();
    });
  });

  describe('Example Configurations', () => {
    it('should accept DocuSign connector example', () => {
      expect(() => ESignConnectorSchema.parse(docusignConnectorExample)).not.toThrow();
    });

    it('should accept Adobe Sign connector example', () => {
      expect(() => ESignConnectorSchema.parse(adobeSignConnectorExample)).not.toThrow();
    });
  });
});
