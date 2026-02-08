import { describe, it, expect } from 'vitest';
import {
  AccountingConnectorSchema,
  AccountingProviderSchema,
  AccountingEnvironmentSchema,
  AccountingWebhookEventSchema,
  AccountingObjectTypeSchema,
  InvoiceSyncConfigSchema,
  ChartOfAccountsConfigSchema,
  MultiCurrencyConfigSchema,
  TaxConfigSchema,
  FiscalYearConfigSchema,
  quickbooksConnectorExample,
  xeroConnectorExample,
  type AccountingConnector,
} from './accounting.zod';

describe('AccountingProviderSchema', () => {
  it('should accept all valid providers', () => {
    const providers = ['quickbooks', 'xero', 'netsuite', 'freshbooks', 'sage', 'custom'] as const;

    providers.forEach(provider => {
      expect(() => AccountingProviderSchema.parse(provider)).not.toThrow();
    });
  });

  it('should reject invalid provider', () => {
    expect(() => AccountingProviderSchema.parse('wave')).toThrow();
  });
});

describe('AccountingEnvironmentSchema', () => {
  it('should accept production and sandbox environments', () => {
    expect(() => AccountingEnvironmentSchema.parse('production')).not.toThrow();
    expect(() => AccountingEnvironmentSchema.parse('sandbox')).not.toThrow();
  });

  it('should reject invalid environment', () => {
    expect(() => AccountingEnvironmentSchema.parse('staging')).toThrow();
  });
});

describe('AccountingWebhookEventSchema', () => {
  it('should accept all valid webhook events', () => {
    const events = [
      'invoice.created', 'invoice.updated', 'invoice.paid', 'invoice.overdue',
      'payment.received', 'expense.created',
      'bill.created', 'bill.paid',
      'customer.created', 'customer.updated',
    ] as const;

    events.forEach(event => {
      expect(() => AccountingWebhookEventSchema.parse(event)).not.toThrow();
    });
  });

  it('should reject invalid webhook event', () => {
    expect(() => AccountingWebhookEventSchema.parse('order.shipped')).toThrow();
  });
});

describe('AccountingObjectTypeSchema', () => {
  it('should accept valid object type with CRUD flags', () => {
    const objectType = {
      name: 'invoices',
      label: 'Invoices',
      apiName: 'Invoice',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    };

    expect(() => AccountingObjectTypeSchema.parse(objectType)).not.toThrow();
  });

  it('should enforce snake_case for object type name', () => {
    expect(() => AccountingObjectTypeSchema.parse({
      name: 'journal_entries',
      label: 'Journal Entries',
      apiName: 'JournalEntry',
    })).not.toThrow();

    expect(() => AccountingObjectTypeSchema.parse({
      name: 'JournalEntries',
      label: 'Journal Entries',
      apiName: 'JournalEntry',
    })).toThrow();
  });

  it('should apply defaults for CRUD flags', () => {
    const result = AccountingObjectTypeSchema.parse({
      name: 'invoices',
      label: 'Invoices',
      apiName: 'Invoice',
    });

    expect(result.enabled).toBe(true);
    expect(result.supportsCreate).toBe(true);
    expect(result.supportsUpdate).toBe(true);
    expect(result.supportsDelete).toBe(true);
  });
});

describe('InvoiceSyncConfigSchema', () => {
  it('should accept full invoice sync config', () => {
    const config = {
      autoCreateInvoice: true,
      defaultTermsDays: 30,
      defaultTaxRate: 'TAX_RATE_01',
      lineItemMapping: {
        productField: 'product_name',
        quantityField: 'quantity',
        priceField: 'unit_price',
      },
    };

    expect(() => InvoiceSyncConfigSchema.parse(config)).not.toThrow();
  });

  it('should apply defaults', () => {
    const result = InvoiceSyncConfigSchema.parse({});
    expect(result.autoCreateInvoice).toBe(false);
    expect(result.defaultTermsDays).toBe(30);
  });
});

describe('ChartOfAccountsConfigSchema', () => {
  it('should accept full chart of accounts config', () => {
    const config = {
      revenueAccount: '4000-Sales',
      expenseAccount: '5000-COGS',
      receivableAccount: '1100-AR',
      payableAccount: '2000-AP',
    };

    expect(() => ChartOfAccountsConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept empty config', () => {
    expect(() => ChartOfAccountsConfigSchema.parse({})).not.toThrow();
  });
});

describe('MultiCurrencyConfigSchema', () => {
  it('should accept full multi-currency config', () => {
    const config = {
      enabled: true,
      baseCurrency: 'USD',
      autoConvert: true,
    };

    const result = MultiCurrencyConfigSchema.parse(config);
    expect(result.enabled).toBe(true);
    expect(result.baseCurrency).toBe('USD');
    expect(result.autoConvert).toBe(true);
  });

  it('should reject invalid ISO 4217 currency length', () => {
    expect(() => MultiCurrencyConfigSchema.parse({
      enabled: true,
      baseCurrency: 'US',
      autoConvert: false,
    })).toThrow();
  });
});

describe('TaxConfigSchema', () => {
  it('should accept full tax config', () => {
    const config = {
      enabled: true,
      defaultTaxCode: 'TAX',
      autoCalculate: true,
    };

    expect(() => TaxConfigSchema.parse(config)).not.toThrow();
  });

  it('should apply defaults', () => {
    const result = TaxConfigSchema.parse({});
    expect(result.enabled).toBe(false);
    expect(result.autoCalculate).toBe(false);
  });
});

describe('FiscalYearConfigSchema', () => {
  it('should accept valid fiscal year config', () => {
    const config = {
      startMonth: 4,
      startDay: 1,
    };

    const result = FiscalYearConfigSchema.parse(config);
    expect(result.startMonth).toBe(4);
    expect(result.startDay).toBe(1);
  });

  it('should reject out of range month', () => {
    expect(() => FiscalYearConfigSchema.parse({
      startMonth: 13,
      startDay: 1,
    })).toThrow();

    expect(() => FiscalYearConfigSchema.parse({
      startMonth: 0,
      startDay: 1,
    })).toThrow();
  });
});

describe('AccountingConnectorSchema', () => {
  describe('Basic Properties', () => {
    it('should accept minimal accounting connector', () => {
      const connector: AccountingConnector = {
        name: 'quickbooks_test',
        label: 'QuickBooks Test',
        type: 'saas',
        provider: 'quickbooks',
        baseUrl: 'https://quickbooks.api.intuit.com',
        companyId: '1234567890',
        environment: 'sandbox',
        authentication: {
          type: 'oauth2',
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          authorizationUrl: 'https://appcenter.intuit.com/connect/oauth2',
          tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
          grantType: 'authorization_code',
        },
        objectTypes: [
          {
            name: 'invoices',
            label: 'Invoices',
            apiName: 'Invoice',
          },
        ],
      };

      expect(() => AccountingConnectorSchema.parse(connector)).not.toThrow();
    });

    it('should enforce snake_case for connector name', () => {
      const validNames = ['quickbooks_test', 'xero_production', '_internal'];
      validNames.forEach(name => {
        expect(() => AccountingConnectorSchema.parse({
          name,
          label: 'Test',
          type: 'saas',
          provider: 'quickbooks',
          baseUrl: 'https://quickbooks.api.intuit.com',
          companyId: '123',
          environment: 'sandbox',
          authentication: { type: 'oauth2', clientId: 'x', clientSecret: 'y', authorizationUrl: 'https://x.com', tokenUrl: 'https://y.com', grantType: 'authorization_code' },
          objectTypes: [{ name: 'invoices', label: 'Invoices', apiName: 'Invoice' }],
        })).not.toThrow();
      });

      const invalidNames = ['quickbooksTest', 'QuickBooks-Test', '123quickbooks'];
      invalidNames.forEach(name => {
        expect(() => AccountingConnectorSchema.parse({
          name,
          label: 'Test',
          type: 'saas',
          provider: 'quickbooks',
          baseUrl: 'https://quickbooks.api.intuit.com',
          companyId: '123',
          environment: 'sandbox',
          authentication: { type: 'oauth2', clientId: 'x', clientSecret: 'y', authorizationUrl: 'https://x.com', tokenUrl: 'https://y.com', grantType: 'authorization_code' },
          objectTypes: [{ name: 'invoices', label: 'Invoices', apiName: 'Invoice' }],
        })).toThrow();
      });
    });
  });

  describe('Complete Configuration', () => {
    it('should accept full accounting connector with all features', () => {
      const connector: AccountingConnector = {
        name: 'quickbooks_full',
        label: 'QuickBooks Full Config',
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
            name: 'customers',
            label: 'Customers',
            apiName: 'Customer',
            enabled: true,
            supportsCreate: true,
            supportsUpdate: true,
            supportsDelete: false,
          },
        ],

        webhookEvents: ['invoice.created', 'invoice.paid', 'payment.received'],

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

        status: 'active',
        enabled: true,
      };

      expect(() => AccountingConnectorSchema.parse(connector)).not.toThrow();
    });
  });

  describe('Example Configurations', () => {
    it('should accept QuickBooks connector example', () => {
      expect(() => AccountingConnectorSchema.parse(quickbooksConnectorExample)).not.toThrow();
    });

    it('should accept Xero connector example', () => {
      expect(() => AccountingConnectorSchema.parse(xeroConnectorExample)).not.toThrow();
    });
  });
});
