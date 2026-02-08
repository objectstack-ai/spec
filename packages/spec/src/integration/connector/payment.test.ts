import { describe, it, expect } from 'vitest';
import {
  PaymentConnectorSchema,
  PaymentProviderSchema,
  PaymentModeSchema,
  PaymentMethodSchema,
  PaymentWebhookEventSchema,
  PaymentObjectTypeSchema,
  StatementDescriptorSchema,
  IdempotencyConfigSchema,
  stripeConnectorExample,
  paypalConnectorExample,
  type PaymentConnector,
} from './payment.zod';

describe('PaymentProviderSchema', () => {
  it('should accept all valid providers', () => {
    const providers = ['stripe', 'paypal', 'square', 'braintree', 'adyen', 'custom'] as const;

    providers.forEach(provider => {
      expect(() => PaymentProviderSchema.parse(provider)).not.toThrow();
    });
  });

  it('should reject invalid provider', () => {
    expect(() => PaymentProviderSchema.parse('venmo')).toThrow();
  });
});

describe('PaymentModeSchema', () => {
  it('should accept live and test modes', () => {
    expect(() => PaymentModeSchema.parse('live')).not.toThrow();
    expect(() => PaymentModeSchema.parse('test')).not.toThrow();
  });

  it('should reject invalid mode', () => {
    expect(() => PaymentModeSchema.parse('staging')).toThrow();
  });
});

describe('PaymentMethodSchema', () => {
  it('should accept all valid payment methods', () => {
    const methods = ['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'buy_now_pay_later'] as const;

    methods.forEach(method => {
      expect(() => PaymentMethodSchema.parse(method)).not.toThrow();
    });
  });

  it('should reject invalid payment method', () => {
    expect(() => PaymentMethodSchema.parse('crypto')).toThrow();
  });
});

describe('PaymentWebhookEventSchema', () => {
  it('should accept all valid webhook events', () => {
    const events = [
      'payment.created', 'payment.captured', 'payment.failed', 'payment.refunded',
      'subscription.created', 'subscription.cancelled',
      'invoice.created', 'invoice.paid',
      'dispute.created', 'dispute.resolved',
    ] as const;

    events.forEach(event => {
      expect(() => PaymentWebhookEventSchema.parse(event)).not.toThrow();
    });
  });

  it('should reject invalid webhook event', () => {
    expect(() => PaymentWebhookEventSchema.parse('order.shipped')).toThrow();
  });
});

describe('PaymentObjectTypeSchema', () => {
  it('should accept valid object type with CRUD flags', () => {
    const objectType = {
      name: 'payments',
      label: 'Payments',
      apiName: 'payment_intents',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    };

    expect(() => PaymentObjectTypeSchema.parse(objectType)).not.toThrow();
  });

  it('should enforce snake_case for object type name', () => {
    expect(() => PaymentObjectTypeSchema.parse({
      name: 'payments',
      label: 'Payments',
      apiName: 'payments',
    })).not.toThrow();

    expect(() => PaymentObjectTypeSchema.parse({
      name: 'PaymentIntents',
      label: 'Payment Intents',
      apiName: 'payment_intents',
    })).toThrow();
  });

  it('should apply defaults for CRUD flags', () => {
    const result = PaymentObjectTypeSchema.parse({
      name: 'invoices',
      label: 'Invoices',
      apiName: 'invoices',
    });

    expect(result.enabled).toBe(true);
    expect(result.supportsCreate).toBe(true);
    expect(result.supportsUpdate).toBe(true);
    expect(result.supportsDelete).toBe(true);
  });
});

describe('StatementDescriptorSchema', () => {
  it('should accept full statement descriptor', () => {
    const descriptor = {
      prefix: 'ACME',
      suffix: 'Order',
      maxLength: 22,
    };

    expect(() => StatementDescriptorSchema.parse(descriptor)).not.toThrow();
  });

  it('should accept empty statement descriptor', () => {
    expect(() => StatementDescriptorSchema.parse({})).not.toThrow();
  });
});

describe('IdempotencyConfigSchema', () => {
  it('should accept full idempotency config', () => {
    const config = {
      enabled: true,
      headerName: 'Idempotency-Key',
      ttlSeconds: 86400,
    };

    const result = IdempotencyConfigSchema.parse(config);
    expect(result.enabled).toBe(true);
    expect(result.headerName).toBe('Idempotency-Key');
    expect(result.ttlSeconds).toBe(86400);
  });

  it('should apply defaults', () => {
    const result = IdempotencyConfigSchema.parse({});
    expect(result.enabled).toBe(true);
    expect(result.headerName).toBe('Idempotency-Key');
  });
});

describe('PaymentConnectorSchema', () => {
  describe('Basic Properties', () => {
    it('should accept minimal payment connector', () => {
      const connector: PaymentConnector = {
        name: 'stripe_test',
        label: 'Stripe Test',
        type: 'saas',
        provider: 'stripe',
        baseUrl: 'https://api.stripe.com',
        mode: 'test',
        supportedCurrencies: ['USD'],
        supportedPaymentMethods: ['credit_card'],
        authentication: {
          type: 'api-key',
          key: 'sk_test_123',
          headerName: 'Authorization',
        },
        objectTypes: [
          {
            name: 'payments',
            label: 'Payments',
            apiName: 'payment_intents',
          },
        ],
      };

      expect(() => PaymentConnectorSchema.parse(connector)).not.toThrow();
    });

    it('should enforce snake_case for connector name', () => {
      const validNames = ['stripe_test', 'paypal_production', '_internal'];
      validNames.forEach(name => {
        expect(() => PaymentConnectorSchema.parse({
          name,
          label: 'Test',
          type: 'saas',
          provider: 'stripe',
          baseUrl: 'https://api.stripe.com',
          mode: 'test',
          supportedCurrencies: ['USD'],
          supportedPaymentMethods: ['credit_card'],
          authentication: { type: 'api-key', key: 'key', headerName: 'Authorization' },
          objectTypes: [{ name: 'payments', label: 'Payments', apiName: 'payments' }],
        })).not.toThrow();
      });

      const invalidNames = ['stripeTest', 'Stripe-Test', '123stripe'];
      invalidNames.forEach(name => {
        expect(() => PaymentConnectorSchema.parse({
          name,
          label: 'Test',
          type: 'saas',
          provider: 'stripe',
          baseUrl: 'https://api.stripe.com',
          mode: 'test',
          supportedCurrencies: ['USD'],
          supportedPaymentMethods: ['credit_card'],
          authentication: { type: 'api-key', key: 'key', headerName: 'Authorization' },
          objectTypes: [{ name: 'payments', label: 'Payments', apiName: 'payments' }],
        })).toThrow();
      });
    });
  });

  describe('Complete Configuration', () => {
    it('should accept full payment connector with all features', () => {
      const connector: PaymentConnector = {
        name: 'stripe_full',
        label: 'Stripe Full Config',
        type: 'saas',
        provider: 'stripe',
        baseUrl: 'https://api.stripe.com',
        mode: 'live',
        supportedCurrencies: ['USD', 'EUR', 'GBP'],
        supportedPaymentMethods: ['credit_card', 'debit_card', 'digital_wallet'],

        authentication: {
          type: 'api-key',
          key: '${STRIPE_SECRET_KEY}',
          headerName: 'Authorization',
        },

        objectTypes: [
          {
            name: 'payments',
            label: 'Payments',
            apiName: 'payment_intents',
            enabled: true,
            supportsCreate: true,
            supportsUpdate: true,
            supportsDelete: false,
          },
          {
            name: 'customers',
            label: 'Customers',
            apiName: 'customers',
            enabled: true,
            supportsCreate: true,
            supportsUpdate: true,
            supportsDelete: true,
          },
        ],

        webhookEvents: ['payment.created', 'payment.captured', 'payment.failed'],

        statementDescriptor: {
          prefix: 'ACME',
          suffix: 'Order',
          maxLength: 22,
        },

        idempotencyConfig: {
          enabled: true,
          headerName: 'Idempotency-Key',
          ttlSeconds: 86400,
        },

        oauthSettings: {
          scopes: ['read_write'],
          refreshTokenUrl: 'https://connect.stripe.com/oauth/token',
          autoRefresh: true,
        },

        sandboxConfig: {
          enabled: false,
        },

        status: 'active',
        enabled: true,
      };

      expect(() => PaymentConnectorSchema.parse(connector)).not.toThrow();
    });
  });

  describe('Example Configurations', () => {
    it('should accept Stripe connector example', () => {
      expect(() => PaymentConnectorSchema.parse(stripeConnectorExample)).not.toThrow();
    });

    it('should accept PayPal connector example', () => {
      expect(() => PaymentConnectorSchema.parse(paypalConnectorExample)).not.toThrow();
    });
  });
});
