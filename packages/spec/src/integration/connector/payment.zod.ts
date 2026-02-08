import { z } from 'zod';
import {
  ConnectorSchema,
  FieldMappingSchema,
} from '../connector.zod';

/**
 * Payment Gateway Connector Protocol
 * 
 * Specialized connector for payment gateway integration enabling automated
 * payment processing, subscription management, and financial operations.
 * 
 * Use Cases:
 * - Payment processing and capture
 * - Subscription and recurring billing management
 * - Invoice generation and tracking
 * - Refund and dispute handling
 * - Multi-currency support
 * 
 * @example
 * ```typescript
 * import { PaymentConnector } from '@objectstack/spec/integration';
 * 
 * const stripeConnector: PaymentConnector = {
 *   name: 'stripe_production',
 *   label: 'Stripe Production',
 *   type: 'saas',
 *   provider: 'stripe',
 *   baseUrl: 'https://api.stripe.com',
 *   mode: 'live',
 *   supportedCurrencies: ['USD', 'EUR', 'GBP'],
 *   supportedPaymentMethods: ['credit_card', 'debit_card', 'digital_wallet'],
 *   authentication: {
 *     type: 'api-key',
 *     key: '${STRIPE_SECRET_KEY}',
 *     headerName: 'Authorization',
 *   },
 *   objectTypes: [
 *     {
 *       name: 'payments',
 *       label: 'Payments',
 *       apiName: 'payment_intents',
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
 * Payment Provider Types
 */
export const PaymentProviderSchema = z.enum([
  'stripe',
  'paypal',
  'square',
  'braintree',
  'adyen',
  'custom',
]).describe('Payment gateway provider');

export type PaymentProvider = z.infer<typeof PaymentProviderSchema>;

/**
 * Payment Mode (live or sandbox/test)
 */
export const PaymentModeSchema = z.enum([
  'live',
  'test',
]).describe('Payment processing mode (live or test/sandbox)');

export type PaymentMode = z.infer<typeof PaymentModeSchema>;

/**
 * Payment Method Types
 */
export const PaymentMethodSchema = z.enum([
  'credit_card',
  'debit_card',
  'bank_transfer',
  'digital_wallet',
  'buy_now_pay_later',
]).describe('Supported payment method type');

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

/**
 * Payment Webhook Event Types
 */
export const PaymentWebhookEventSchema = z.enum([
  'payment.created',
  'payment.captured',
  'payment.failed',
  'payment.refunded',
  'subscription.created',
  'subscription.cancelled',
  'invoice.created',
  'invoice.paid',
  'dispute.created',
  'dispute.resolved',
]).describe('Payment webhook event type');

export type PaymentWebhookEvent = z.infer<typeof PaymentWebhookEventSchema>;

/**
 * Payment Object Type Schema
 * Represents a syncable entity in the payment system (e.g., Payment, Invoice, Customer)
 */
export const PaymentObjectTypeSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Object type name (snake_case)'),
  label: z.string().describe('Display label'),
  apiName: z.string().describe('API name in external system'),
  enabled: z.boolean().default(true).describe('Enable sync for this object'),
  supportsCreate: z.boolean().default(true).describe('Supports record creation'),
  supportsUpdate: z.boolean().default(true).describe('Supports record updates'),
  supportsDelete: z.boolean().default(true).describe('Supports record deletion'),
  fieldMappings: z.array(FieldMappingSchema).optional().describe('Object-specific field mappings'),
});

export type PaymentObjectType = z.infer<typeof PaymentObjectTypeSchema>;

/**
 * Statement Descriptor Configuration
 * Controls how charges appear on customer bank statements
 */
export const StatementDescriptorSchema = z.object({
  prefix: z.string().optional().describe('Statement descriptor prefix'),
  suffix: z.string().optional().describe('Statement descriptor suffix'),
  maxLength: z.number().int().min(1).optional().describe('Maximum descriptor length'),
});

export type StatementDescriptor = z.infer<typeof StatementDescriptorSchema>;

/**
 * Idempotency Configuration
 * Ensures payment operations are not duplicated
 */
export const IdempotencyConfigSchema = z.object({
  enabled: z.boolean().default(true).describe('Enable idempotency for requests'),
  headerName: z.string().optional().default('Idempotency-Key').describe('Idempotency key header name'),
  ttlSeconds: z.number().int().min(1).optional().describe('Idempotency key time-to-live in seconds'),
});

export type IdempotencyConfig = z.infer<typeof IdempotencyConfigSchema>;

/**
 * Payment Gateway Connector Schema
 * Complete payment gateway integration configuration
 */
export const PaymentConnectorSchema = ConnectorSchema.extend({
  type: z.literal('saas'),

  /**
   * Payment gateway provider
   */
  provider: PaymentProviderSchema.describe('Payment gateway provider'),

  /**
   * Payment API base URL
   */
  baseUrl: z.string().url().describe('Payment API base URL'),

  /**
   * Payment processing mode
   */
  mode: PaymentModeSchema.describe('Payment processing mode'),

  /**
   * Supported currencies (ISO 4217 codes)
   */
  supportedCurrencies: z.array(z.string()).describe('Supported ISO 4217 currency codes'),

  /**
   * Supported payment methods
   */
  supportedPaymentMethods: z.array(PaymentMethodSchema).describe('Supported payment method types'),

  /**
   * Webhook events to subscribe to
   */
  webhookEvents: z.array(PaymentWebhookEventSchema).optional().describe('Payment webhook events to subscribe to'),

  /**
   * Syncable payment object types
   */
  objectTypes: z.array(PaymentObjectTypeSchema).describe('Syncable payment object types'),

  /**
   * Statement descriptor configuration
   */
  statementDescriptor: StatementDescriptorSchema.optional().describe('Statement descriptor configuration'),

  /**
   * Idempotency configuration
   */
  idempotencyConfig: IdempotencyConfigSchema.optional().describe('Idempotency configuration'),

  /**
   * OAuth-specific settings
   */
  oauthSettings: z.object({
    scopes: z.array(z.string()).describe('Required OAuth scopes'),
    refreshTokenUrl: z.string().url().optional().describe('Token refresh endpoint'),
    revokeTokenUrl: z.string().url().optional().describe('Token revocation endpoint'),
    autoRefresh: z.boolean().default(true).describe('Automatically refresh expired tokens'),
  }).optional().describe('OAuth-specific configuration'),

  /**
   * Sandbox/test environment settings
   */
  sandboxConfig: z.object({
    enabled: z.boolean().default(false).describe('Use sandbox environment'),
    baseUrl: z.string().url().optional().describe('Sandbox API base URL'),
  }).optional().describe('Sandbox environment configuration'),
});

export type PaymentConnector = z.infer<typeof PaymentConnectorSchema>;

// ============================================================================
// Helper Functions & Examples
// ============================================================================

/**
 * Example: Stripe Connector Configuration
 */
export const stripeConnectorExample = {
  name: 'stripe_production',
  label: 'Stripe Production',
  type: 'saas',
  provider: 'stripe',
  baseUrl: 'https://api.stripe.com',
  mode: 'live',
  supportedCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'CAD'],
  supportedPaymentMethods: ['credit_card', 'debit_card', 'digital_wallet', 'buy_now_pay_later'],

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
      name: 'invoices',
      label: 'Invoices',
      apiName: 'invoices',
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
    {
      name: 'subscriptions',
      label: 'Subscriptions',
      apiName: 'subscriptions',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'refunds',
      label: 'Refunds',
      apiName: 'refunds',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: false,
      supportsDelete: false,
    },
    {
      name: 'disputes',
      label: 'Disputes',
      apiName: 'disputes',
      enabled: true,
      supportsCreate: false,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'products',
      label: 'Products',
      apiName: 'products',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'prices',
      label: 'Prices',
      apiName: 'prices',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
  ],

  webhookEvents: [
    'payment.created',
    'payment.captured',
    'payment.failed',
    'payment.refunded',
    'subscription.created',
    'subscription.cancelled',
    'invoice.created',
    'invoice.paid',
    'dispute.created',
    'dispute.resolved',
  ],

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

  syncConfig: {
    strategy: 'incremental',
    direction: 'bidirectional',
    schedule: '*/15 * * * *',
    realtimeSync: true,
    conflictResolution: 'source_wins',
    batchSize: 100,
    deleteMode: 'soft_delete',
  },

  rateLimitConfig: {
    strategy: 'token_bucket',
    maxRequests: 100,
    windowSeconds: 1,
    respectUpstreamLimits: true,
  },

  retryConfig: {
    strategy: 'exponential_backoff',
    maxAttempts: 3,
    initialDelayMs: 500,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    retryOnNetworkError: true,
    jitter: true,
  },

  status: 'active',
  enabled: true,
};

/**
 * Example: PayPal Connector Configuration
 */
export const paypalConnectorExample = {
  name: 'paypal_sandbox',
  label: 'PayPal Sandbox',
  type: 'saas',
  provider: 'paypal',
  baseUrl: 'https://api-m.sandbox.paypal.com',
  mode: 'test',
  supportedCurrencies: ['USD', 'EUR', 'GBP', 'AUD'],
  supportedPaymentMethods: ['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet'],

  authentication: {
    type: 'oauth2',
    clientId: '${PAYPAL_CLIENT_ID}',
    clientSecret: '${PAYPAL_CLIENT_SECRET}',
    authorizationUrl: 'https://www.sandbox.paypal.com/signin/authorize',
    tokenUrl: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
    grantType: 'client_credentials',
    scopes: ['openid', 'email', 'https://uri.paypal.com/services/payments/payment'],
  },

  objectTypes: [
    {
      name: 'payments',
      label: 'Payments',
      apiName: 'payments',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'invoices',
      label: 'Invoices',
      apiName: 'invoicing',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'customers',
      label: 'Customers',
      apiName: 'customer/partners',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'subscriptions',
      label: 'Subscriptions',
      apiName: 'billing/subscriptions',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'refunds',
      label: 'Refunds',
      apiName: 'payments/captures/refund',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: false,
      supportsDelete: false,
    },
    {
      name: 'disputes',
      label: 'Disputes',
      apiName: 'customer/disputes',
      enabled: true,
      supportsCreate: false,
      supportsUpdate: true,
      supportsDelete: false,
    },
  ],

  webhookEvents: [
    'payment.created',
    'payment.captured',
    'payment.failed',
    'payment.refunded',
    'subscription.created',
    'subscription.cancelled',
    'dispute.created',
    'dispute.resolved',
  ],

  oauthSettings: {
    scopes: ['openid', 'email'],
    refreshTokenUrl: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
    autoRefresh: true,
  },

  sandboxConfig: {
    enabled: true,
    baseUrl: 'https://api-m.sandbox.paypal.com',
  },

  syncConfig: {
    strategy: 'incremental',
    direction: 'import',
    schedule: '0 */2 * * *',
    conflictResolution: 'source_wins',
    batchSize: 50,
  },

  rateLimitConfig: {
    strategy: 'token_bucket',
    maxRequests: 30,
    windowSeconds: 60,
  },

  status: 'active',
  enabled: true,
};
