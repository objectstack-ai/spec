import { z } from 'zod';
import {
  ConnectorSchema,
} from '../connector.zod';

/**
 * Accounting Connector Protocol
 * 
 * Specialized connector for accounting platform integration enabling automated
 * invoice export, financial data sync, and bookkeeping operations.
 * 
 * Use Cases:
 * - Invoice creation and export
 * - Bill and expense tracking
 * - Payment reconciliation
 * - Chart of accounts synchronization
 * - Multi-currency financial operations
 * - Tax calculation and reporting
 * 
 * @example
 * ```typescript
 * import { AccountingConnector } from '@objectstack/spec/integration';
 * 
 * const quickbooksConnector: AccountingConnector = {
 *   name: 'quickbooks_production',
 *   label: 'QuickBooks Production',
 *   type: 'saas',
 *   provider: 'quickbooks',
 *   baseUrl: 'https://quickbooks.api.intuit.com',
 *   companyId: '1234567890',
 *   environment: 'production',
 *   authentication: {
 *     type: 'oauth2',
 *     clientId: '${QB_CLIENT_ID}',
 *     clientSecret: '${QB_CLIENT_SECRET}',
 *     authorizationUrl: 'https://appcenter.intuit.com/connect/oauth2',
 *     tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
 *     grantType: 'authorization_code',
 *     scopes: ['com.intuit.quickbooks.accounting'],
 *   },
 *   objectTypes: [
 *     {
 *       name: 'invoices',
 *       label: 'Invoices',
 *       apiName: 'Invoice',
 *       enabled: true,
 *       supportsCreate: true,
 *       supportsUpdate: true,
 *       supportsDelete: true,
 *     },
 *   ],
 * };
 * ```
 */

/**
 * Accounting Provider Types
 */
export const AccountingProviderSchema = z.enum([
  'quickbooks',
  'xero',
  'netsuite',
  'freshbooks',
  'sage',
  'custom',
]).describe('Accounting platform provider');

export type AccountingProvider = z.infer<typeof AccountingProviderSchema>;

/**
 * Accounting Environment
 */
export const AccountingEnvironmentSchema = z.enum([
  'production',
  'sandbox',
]).describe('Accounting environment (production or sandbox)');

export type AccountingEnvironment = z.infer<typeof AccountingEnvironmentSchema>;

/**
 * Accounting Webhook Event Types
 */
export const AccountingWebhookEventSchema = z.enum([
  'invoice.created',
  'invoice.updated',
  'invoice.paid',
  'invoice.overdue',
  'payment.received',
  'expense.created',
  'bill.created',
  'bill.paid',
  'customer.created',
  'customer.updated',
]).describe('Accounting webhook event type');

export type AccountingWebhookEvent = z.infer<typeof AccountingWebhookEventSchema>;

/**
 * Accounting Object Type Schema
 * Represents a syncable entity in the accounting system (e.g., Invoice, Bill, Payment)
 */
export const AccountingObjectTypeSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Object type name (snake_case)'),
  label: z.string().describe('Display label'),
  apiName: z.string().describe('API name in external system'),
  enabled: z.boolean().default(true).describe('Enable sync for this object'),
  supportsCreate: z.boolean().default(true).describe('Supports record creation'),
  supportsUpdate: z.boolean().default(true).describe('Supports record updates'),
  supportsDelete: z.boolean().default(true).describe('Supports record deletion'),
});

export type AccountingObjectType = z.infer<typeof AccountingObjectTypeSchema>;

/**
 * Invoice Sync Configuration
 * Controls how invoices are created and mapped
 */
export const InvoiceSyncConfigSchema = z.object({
  autoCreateInvoice: z.boolean().default(false).describe('Automatically create invoices on trigger'),
  defaultTermsDays: z.number().int().min(0).default(30).describe('Default payment terms in days'),
  defaultTaxRate: z.string().optional().describe('Default tax rate identifier'),
  lineItemMapping: z.object({
    productField: z.string().describe('Field mapped to product/service'),
    quantityField: z.string().describe('Field mapped to quantity'),
    priceField: z.string().describe('Field mapped to unit price'),
  }).optional().describe('Line item field mapping configuration'),
});

export type InvoiceSyncConfig = z.infer<typeof InvoiceSyncConfigSchema>;

/**
 * Chart of Accounts Configuration
 * Maps ObjectStack categories to accounting ledger accounts
 */
export const ChartOfAccountsConfigSchema = z.object({
  revenueAccount: z.string().optional().describe('Default revenue account identifier'),
  expenseAccount: z.string().optional().describe('Default expense account identifier'),
  receivableAccount: z.string().optional().describe('Default accounts receivable identifier'),
  payableAccount: z.string().optional().describe('Default accounts payable identifier'),
});

export type ChartOfAccountsConfig = z.infer<typeof ChartOfAccountsConfigSchema>;

/**
 * Multi-Currency Configuration
 * Enables multi-currency support for international transactions
 */
export const MultiCurrencyConfigSchema = z.object({
  enabled: z.boolean().default(false).describe('Enable multi-currency support'),
  baseCurrency: z.string().length(3).describe('Base currency code (ISO 4217)'),
  autoConvert: z.boolean().default(false).describe('Automatically convert between currencies'),
});

export type MultiCurrencyConfig = z.infer<typeof MultiCurrencyConfigSchema>;

/**
 * Tax Configuration
 * Controls tax calculation and reporting behavior
 */
export const TaxConfigSchema = z.object({
  enabled: z.boolean().default(false).describe('Enable tax calculation'),
  defaultTaxCode: z.string().optional().describe('Default tax code identifier'),
  autoCalculate: z.boolean().default(false).describe('Automatically calculate tax amounts'),
});

export type TaxConfig = z.infer<typeof TaxConfigSchema>;

/**
 * Fiscal Year Configuration
 * Defines the fiscal year start for financial reporting
 */
export const FiscalYearConfigSchema = z.object({
  startMonth: z.number().int().min(1).max(12).describe('Fiscal year start month (1-12)'),
  startDay: z.number().int().min(1).max(31).describe('Fiscal year start day (1-31)'),
});

export type FiscalYearConfig = z.infer<typeof FiscalYearConfigSchema>;

/**
 * Accounting Connector Schema
 * Complete accounting platform integration configuration
 */
export const AccountingConnectorSchema = ConnectorSchema.extend({
  type: z.literal('saas'),

  /**
   * Accounting platform provider
   */
  provider: AccountingProviderSchema.describe('Accounting platform provider'),

  /**
   * Accounting API base URL
   */
  baseUrl: z.string().url().describe('Accounting API base URL'),

  /**
   * Company or organization ID in the accounting platform
   */
  companyId: z.string().describe('Company/organization ID in the accounting platform'),

  /**
   * Accounting environment
   */
  environment: AccountingEnvironmentSchema.describe('Accounting environment'),

  /**
   * Syncable accounting object types
   */
  objectTypes: z.array(AccountingObjectTypeSchema).describe('Syncable accounting object types'),

  /**
   * Webhook events to subscribe to
   */
  webhookEvents: z.array(AccountingWebhookEventSchema).optional().describe('Accounting webhook events to subscribe to'),

  /**
   * Invoice sync configuration
   */
  invoiceSyncConfig: InvoiceSyncConfigSchema.optional().describe('Invoice sync configuration'),

  /**
   * Chart of accounts configuration
   */
  chartOfAccountsConfig: ChartOfAccountsConfigSchema.optional().describe('Chart of accounts configuration'),

  /**
   * Multi-currency configuration
   */
  multiCurrencyConfig: MultiCurrencyConfigSchema.optional().describe('Multi-currency configuration'),

  /**
   * Tax configuration
   */
  taxConfig: TaxConfigSchema.optional().describe('Tax configuration'),

  /**
   * Fiscal year configuration
   */
  fiscalYearConfig: FiscalYearConfigSchema.optional().describe('Fiscal year configuration'),

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

export type AccountingConnector = z.infer<typeof AccountingConnectorSchema>;

// ============================================================================
// Helper Functions & Examples
// ============================================================================

/**
 * Example: QuickBooks Connector Configuration
 */
export const quickbooksConnectorExample = {
  name: 'quickbooks_production',
  label: 'QuickBooks Production',
  type: 'saas',
  provider: 'quickbooks',
  baseUrl: 'https://quickbooks.api.intuit.com',
  companyId: '1234567890',
  environment: 'production',

  authentication: {
    type: 'oauth2',
    clientId: '${QB_CLIENT_ID}',
    clientSecret: '${QB_CLIENT_SECRET}',
    authorizationUrl: 'https://appcenter.intuit.com/connect/oauth2',
    tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    grantType: 'authorization_code',
    scopes: ['com.intuit.quickbooks.accounting'],
  },

  objectTypes: [
    {
      name: 'invoices',
      label: 'Invoices',
      apiName: 'Invoice',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'bills',
      label: 'Bills',
      apiName: 'Bill',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'payments',
      label: 'Payments',
      apiName: 'Payment',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'expenses',
      label: 'Expenses',
      apiName: 'Purchase',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'customers',
      label: 'Customers',
      apiName: 'Customer',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'vendors',
      label: 'Vendors',
      apiName: 'Vendor',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'accounts',
      label: 'Chart of Accounts',
      apiName: 'Account',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'tax_rates',
      label: 'Tax Rates',
      apiName: 'TaxRate',
      enabled: true,
      supportsCreate: false,
      supportsUpdate: false,
      supportsDelete: false,
    },
    {
      name: 'items',
      label: 'Products & Services',
      apiName: 'Item',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'journal_entries',
      label: 'Journal Entries',
      apiName: 'JournalEntry',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
  ],

  webhookEvents: [
    'invoice.created',
    'invoice.updated',
    'invoice.paid',
    'invoice.overdue',
    'payment.received',
    'expense.created',
    'bill.created',
    'bill.paid',
    'customer.created',
    'customer.updated',
  ],

  invoiceSyncConfig: {
    autoCreateInvoice: true,
    defaultTermsDays: 30,
    defaultTaxRate: 'TAX_RATE_01',
    lineItemMapping: {
      productField: 'product_name',
      quantityField: 'quantity',
      priceField: 'unit_price',
    },
  },

  chartOfAccountsConfig: {
    revenueAccount: '4000-Sales',
    expenseAccount: '5000-COGS',
    receivableAccount: '1100-AR',
    payableAccount: '2000-AP',
  },

  multiCurrencyConfig: {
    enabled: true,
    baseCurrency: 'USD',
    autoConvert: true,
  },

  taxConfig: {
    enabled: true,
    defaultTaxCode: 'TAX',
    autoCalculate: true,
  },

  fiscalYearConfig: {
    startMonth: 1,
    startDay: 1,
  },

  oauthSettings: {
    scopes: ['com.intuit.quickbooks.accounting'],
    refreshTokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    revokeTokenUrl: 'https://developer.api.intuit.com/v2/oauth2/tokens/revoke',
    autoRefresh: true,
  },

  syncConfig: {
    strategy: 'incremental',
    direction: 'bidirectional',
    schedule: '0 */4 * * *',
    conflictResolution: 'source_wins',
    batchSize: 200,
  },

  rateLimitConfig: {
    strategy: 'token_bucket',
    maxRequests: 500,
    windowSeconds: 60,
    respectUpstreamLimits: true,
  },

  retryConfig: {
    strategy: 'exponential_backoff',
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    retryOnNetworkError: true,
    jitter: true,
  },

  status: 'active',
  enabled: true,
};

/**
 * Example: Xero Connector Configuration
 */
export const xeroConnectorExample = {
  name: 'xero_sandbox',
  label: 'Xero Sandbox',
  type: 'saas',
  provider: 'xero',
  baseUrl: 'https://api.xero.com/api.xro/2.0',
  companyId: 'tenant-uuid-abc-123',
  environment: 'sandbox',

  authentication: {
    type: 'oauth2',
    clientId: '${XERO_CLIENT_ID}',
    clientSecret: '${XERO_CLIENT_SECRET}',
    authorizationUrl: 'https://login.xero.com/identity/connect/authorize',
    tokenUrl: 'https://identity.xero.com/connect/token',
    grantType: 'authorization_code',
    scopes: ['openid', 'profile', 'email', 'accounting.transactions', 'accounting.contacts'],
  },

  objectTypes: [
    {
      name: 'invoices',
      label: 'Invoices',
      apiName: 'Invoices',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'bills',
      label: 'Bills',
      apiName: 'Invoices',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'payments',
      label: 'Payments',
      apiName: 'Payments',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: false,
      supportsDelete: false,
    },
    {
      name: 'customers',
      label: 'Contacts',
      apiName: 'Contacts',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'accounts',
      label: 'Chart of Accounts',
      apiName: 'Accounts',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'items',
      label: 'Items',
      apiName: 'Items',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
  ],

  webhookEvents: [
    'invoice.created',
    'invoice.updated',
    'invoice.paid',
    'payment.received',
    'customer.created',
    'customer.updated',
  ],

  invoiceSyncConfig: {
    autoCreateInvoice: false,
    defaultTermsDays: 14,
  },

  chartOfAccountsConfig: {
    revenueAccount: '200-Revenue',
    expenseAccount: '400-Expenses',
    receivableAccount: '610-AR',
    payableAccount: '800-AP',
  },

  multiCurrencyConfig: {
    enabled: true,
    baseCurrency: 'NZD',
    autoConvert: false,
  },

  taxConfig: {
    enabled: true,
    defaultTaxCode: 'OUTPUT2',
    autoCalculate: true,
  },

  fiscalYearConfig: {
    startMonth: 4,
    startDay: 1,
  },

  oauthSettings: {
    scopes: ['openid', 'profile', 'accounting.transactions', 'accounting.contacts'],
    refreshTokenUrl: 'https://identity.xero.com/connect/token',
    revokeTokenUrl: 'https://identity.xero.com/connect/revocation',
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
    strategy: 'sliding_window',
    maxRequests: 60,
    windowSeconds: 60,
  },

  status: 'active',
  enabled: true,
};
