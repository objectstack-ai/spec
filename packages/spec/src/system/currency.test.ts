import { describe, it, expect } from 'vitest';
import {
  CurrencyCodeSchema,
  CurrencySchema,
  ExchangeRateSchema,
  CurrencyFormattingSchema,
  CurrencySettingsSchema,
  UserCurrencyPreferencesSchema,
  Currency,
  type Currency as CurrencyType,
  type ExchangeRate,
  type CurrencySettings,
} from './currency.zod';

describe('CurrencyCodeSchema', () => {
  it('should accept valid ISO 4217 currency codes', () => {
    const validCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'INR'];
    
    validCodes.forEach(code => {
      expect(() => CurrencyCodeSchema.parse(code)).not.toThrow();
    });
  });
  
  it('should convert lowercase to uppercase', () => {
    const result = CurrencyCodeSchema.parse('usd');
    expect(result).toBe('USD');
  });
  
  it('should reject invalid currency codes', () => {
    expect(() => CurrencyCodeSchema.parse('US')).toThrow(); // Too short
    expect(() => CurrencyCodeSchema.parse('USDA')).toThrow(); // Too long
    expect(() => CurrencyCodeSchema.parse('U$D')).toThrow(); // Invalid characters
    expect(() => CurrencyCodeSchema.parse('123')).toThrow(); // Numbers
  });
});

describe('CurrencySchema', () => {
  it('should accept valid currency definition', () => {
    const currency: CurrencyType = {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      decimalPlaces: 2,
      isActive: true,
      isCorporate: false,
      conversionRate: 1.0,
    };
    
    expect(() => CurrencySchema.parse(currency)).not.toThrow();
  });
  
  it('should apply default values', () => {
    const minimal = {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
    };
    
    const result = CurrencySchema.parse(minimal);
    expect(result.decimalPlaces).toBe(2);
    expect(result.isActive).toBe(true);
    expect(result.isCorporate).toBe(false);
    expect(result.conversionRate).toBe(1.0);
  });
  
  it('should support currencies with 0 decimal places (like JPY)', () => {
    const jpy: CurrencyType = {
      code: 'JPY',
      name: 'Japanese Yen',
      symbol: '¥',
      decimalPlaces: 0,
      isActive: true,
      isCorporate: false,
      conversionRate: 110.25,
    };
    
    expect(() => CurrencySchema.parse(jpy)).not.toThrow();
  });
  
  it('should support corporate currency flag', () => {
    const corporate: CurrencyType = {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      isCorporate: true,
      conversionRate: 1.0,
    };
    
    const result = CurrencySchema.parse(corporate);
    expect(result.isCorporate).toBe(true);
    expect(result.conversionRate).toBe(1.0);
  });
  
  it('should include conversion rate metadata', () => {
    const currency: CurrencyType = {
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      conversionRate: 0.73,
      conversionRateUpdatedAt: new Date('2024-01-15'),
    };
    
    const result = CurrencySchema.parse(currency);
    expect(result.conversionRate).toBe(0.73);
    expect(result.conversionRateUpdatedAt).toBeInstanceOf(Date);
  });
});

describe('ExchangeRateSchema', () => {
  it('should accept valid exchange rate', () => {
    const rate: ExchangeRate = {
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      rate: 0.85,
      effectiveDate: new Date('2024-01-01'),
      source: 'api',
    };
    
    expect(() => ExchangeRateSchema.parse(rate)).not.toThrow();
  });
  
  it('should support expiry dates for historical rates', () => {
    const rate: ExchangeRate = {
      fromCurrency: 'USD',
      toCurrency: 'GBP',
      rate: 0.73,
      effectiveDate: new Date('2024-01-01'),
      expiryDate: new Date('2024-01-31'),
      source: 'manual',
    };
    
    const result = ExchangeRateSchema.parse(rate);
    expect(result.expiryDate).toBeInstanceOf(Date);
  });
  
  it('should enforce positive exchange rates', () => {
    const invalidRate = {
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      rate: -0.85,
      effectiveDate: new Date(),
    };
    
    expect(() => ExchangeRateSchema.parse(invalidRate)).toThrow();
  });
  
  it('should support different rate sources', () => {
    const sources = ['manual', 'api', 'system'] as const;
    
    sources.forEach(source => {
      const rate = {
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        rate: 0.85,
        effectiveDate: new Date(),
        source,
      };
      
      expect(() => ExchangeRateSchema.parse(rate)).not.toThrow();
    });
  });
});

describe('CurrencyFormattingSchema', () => {
  it('should accept valid formatting options', () => {
    const formatting = {
      format: 'symbol',
      locale: 'en-US',
      showSymbol: true,
      showCode: false,
      decimalSeparator: '.',
      thousandsSeparator: ',',
    };
    
    expect(() => CurrencyFormattingSchema.parse(formatting)).not.toThrow();
  });
  
  it('should apply default values', () => {
    const result = CurrencyFormattingSchema.parse({});
    
    expect(result.format).toBe('symbol');
    expect(result.locale).toBe('en-US');
    expect(result.showSymbol).toBe(true);
    expect(result.showCode).toBe(false);
    expect(result.decimalSeparator).toBe('.');
    expect(result.thousandsSeparator).toBe(',');
  });
  
  it('should support different display formats', () => {
    const formats = ['symbol', 'code', 'name', 'symbol_code'] as const;
    
    formats.forEach(format => {
      const config = { format };
      expect(() => CurrencyFormattingSchema.parse(config)).not.toThrow();
    });
  });
  
  it('should support different locales', () => {
    const locales = ['en-US', 'fr-FR', 'de-DE', 'zh-CN', 'ja-JP'];
    
    locales.forEach(locale => {
      const config = { locale };
      expect(() => CurrencyFormattingSchema.parse(config)).not.toThrow();
    });
  });
  
  it('should support European number formatting', () => {
    const europeanFormat = {
      decimalSeparator: ',',
      thousandsSeparator: '.',
    };
    
    const result = CurrencyFormattingSchema.parse(europeanFormat);
    expect(result.decimalSeparator).toBe(',');
    expect(result.thousandsSeparator).toBe('.');
  });
});

describe('CurrencySettingsSchema', () => {
  it('should accept valid organization currency settings', () => {
    const settings: CurrencySettings = {
      enabled: true,
      corporateCurrency: 'USD',
      activeCurrencies: [
        {
          code: 'USD',
          name: 'US Dollar',
          symbol: '$',
          decimalPlaces: 2,
          isActive: true,
          isCorporate: true,
          conversionRate: 1.0,
        },
        {
          code: 'EUR',
          name: 'Euro',
          symbol: '€',
          decimalPlaces: 2,
          isActive: true,
          isCorporate: false,
          conversionRate: 0.85,
        },
      ],
      allowUserCurrency: true,
      enableAutoConversion: true,
      aggregationStrategy: 'convert_to_corporate',
      sortingStrategy: 'convert_to_corporate',
    };
    
    expect(() => CurrencySettingsSchema.parse(settings)).not.toThrow();
  });
  
  it('should default to multi-currency disabled', () => {
    const minimal = {
      corporateCurrency: 'USD',
      activeCurrencies: [Currency.USD()],
    };
    
    const result = CurrencySettingsSchema.parse(minimal);
    expect(result.enabled).toBe(false);
  });
  
  it('should support dated exchange rates', () => {
    const settings: CurrencySettings = {
      enabled: true,
      corporateCurrency: 'USD',
      activeCurrencies: [Currency.USD()],
      enableDatedExchangeRates: true,
      exchangeRates: [
        {
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          rate: 0.85,
          effectiveDate: new Date('2024-01-01'),
          source: 'api',
        },
      ],
    };
    
    expect(() => CurrencySettingsSchema.parse(settings)).not.toThrow();
  });
  
  it('should support different aggregation strategies', () => {
    const strategies = ['convert_to_corporate', 'convert_to_user', 'group_by_currency'] as const;
    
    strategies.forEach(aggregationStrategy => {
      const settings = {
        corporateCurrency: 'USD',
        activeCurrencies: [Currency.USD()],
        aggregationStrategy,
      };
      
      expect(() => CurrencySettingsSchema.parse(settings)).not.toThrow();
    });
  });
  
  it('should support different sorting strategies', () => {
    const strategies = ['convert_to_corporate', 'convert_to_user', 'native_value'] as const;
    
    strategies.forEach(sortingStrategy => {
      const settings = {
        corporateCurrency: 'USD',
        activeCurrencies: [Currency.USD()],
        sortingStrategy,
      };
      
      expect(() => CurrencySettingsSchema.parse(settings)).not.toThrow();
    });
  });
});

describe('UserCurrencyPreferencesSchema', () => {
  it('should accept valid user preferences', () => {
    const preferences = {
      preferredCurrency: 'EUR',
      alwaysConvert: true,
      formatting: {
        format: 'symbol_code',
        locale: 'fr-FR',
      },
    };
    
    expect(() => UserCurrencyPreferencesSchema.parse(preferences)).not.toThrow();
  });
  
  it('should default alwaysConvert to false', () => {
    const minimal = {
      preferredCurrency: 'USD',
    };
    
    const result = UserCurrencyPreferencesSchema.parse(minimal);
    expect(result.alwaysConvert).toBe(false);
  });
});

describe('Currency Helper', () => {
  it('should create currency definitions with helper', () => {
    const usd = Currency.USD();
    
    expect(usd.code).toBe('USD');
    expect(usd.name).toBe('US Dollar');
    expect(usd.symbol).toBe('$');
    expect(usd.isCorporate).toBe(true);
    expect(usd.decimalPlaces).toBe(2);
  });
  
  it('should provide common currency helpers', () => {
    const currencies = [
      Currency.USD(),
      Currency.EUR(),
      Currency.GBP(),
      Currency.JPY(),
      Currency.CNY(),
      Currency.AUD(),
      Currency.CAD(),
      Currency.CHF(),
      Currency.INR(),
      Currency.BRL(),
    ];
    
    currencies.forEach(currency => {
      expect(currency.code).toBeTruthy();
      expect(currency.name).toBeTruthy();
      expect(currency.symbol).toBeTruthy();
      expect(() => CurrencySchema.parse(currency)).not.toThrow();
    });
  });
  
  it('should support custom currency with options', () => {
    const custom = Currency.define('XYZ', 'Custom Currency', 'X', {
      decimalPlaces: 3,
      isActive: false,
      conversionRate: 1.5,
    });
    
    expect(custom.code).toBe('XYZ');
    expect(custom.decimalPlaces).toBe(3);
    expect(custom.isActive).toBe(false);
    expect(custom.conversionRate).toBe(1.5);
  });
  
  it('should handle JPY with 0 decimal places', () => {
    const jpy = Currency.JPY();
    
    expect(jpy.decimalPlaces).toBe(0);
    expect(() => CurrencySchema.parse(jpy)).not.toThrow();
  });
});

describe('Multi-Currency Integration Scenarios', () => {
  it('should support a complete multi-currency setup', () => {
    const settings: CurrencySettings = {
      enabled: true,
      corporateCurrency: 'USD',
      activeCurrencies: [
        Currency.USD(),
        { ...Currency.EUR(), conversionRate: 0.85 },
        { ...Currency.GBP(), conversionRate: 0.73 },
        { ...Currency.JPY(), conversionRate: 110.25 },
      ],
      defaultFormatting: {
        format: 'symbol',
        locale: 'en-US',
      },
      allowUserCurrency: true,
      enableAutoConversion: true,
      enableDatedExchangeRates: false,
      aggregationStrategy: 'convert_to_corporate',
      sortingStrategy: 'convert_to_corporate',
    };
    
    expect(() => CurrencySettingsSchema.parse(settings)).not.toThrow();
  });
  
  it('should support dated exchange rates for historical reporting', () => {
    const settings: CurrencySettings = {
      enabled: true,
      corporateCurrency: 'USD',
      activeCurrencies: [Currency.USD(), Currency.EUR()],
      enableDatedExchangeRates: true,
      exchangeRates: [
        {
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          rate: 0.85,
          effectiveDate: new Date('2024-01-01'),
          expiryDate: new Date('2024-01-31'),
          source: 'api',
        },
        {
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          rate: 0.87,
          effectiveDate: new Date('2024-02-01'),
          source: 'api',
        },
      ],
    };
    
    expect(() => CurrencySettingsSchema.parse(settings)).not.toThrow();
  });
  
  it('should support per-user currency preferences', () => {
    const orgSettings: CurrencySettings = {
      enabled: true,
      corporateCurrency: 'USD',
      activeCurrencies: [
        Currency.USD(),
        Currency.EUR(),
        Currency.GBP(),
      ],
      allowUserCurrency: true,
    };
    
    const userPreferences = {
      preferredCurrency: 'EUR',
      alwaysConvert: true,
      formatting: {
        format: 'symbol_code',
        locale: 'fr-FR',
        decimalSeparator: ',',
        thousandsSeparator: '.',
      },
    };
    
    expect(() => CurrencySettingsSchema.parse(orgSettings)).not.toThrow();
    expect(() => UserCurrencyPreferencesSchema.parse(userPreferences)).not.toThrow();
  });
});
