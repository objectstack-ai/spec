import { describe, it, expect } from 'vitest';
import {
  CurrencyValueSchema,
  MultiCurrencyFieldConfigSchema,
  CurrencyCalculationResultSchema,
  CurrencyValidationSchema,
  CurrencyValue,
  type CurrencyValue as CurrencyValueType,
  type MultiCurrencyFieldConfig,
  type CurrencyCalculationResult,
  type CurrencyValidation,
} from './currency.zod';

describe('CurrencyValueSchema', () => {
  it('should accept simple currency value', () => {
    const value: CurrencyValueType = {
      amount: 1234.56,
      currency: 'USD',
    };
    
    expect(() => CurrencyValueSchema.parse(value)).not.toThrow();
  });
  
  it('should accept currency value with conversion', () => {
    const value: CurrencyValueType = {
      amount: 1000.00,
      currency: 'EUR',
      convertedAmount: 1176.47,
      convertedCurrency: 'USD',
      exchangeRate: 1.17647,
      conversionDate: new Date('2024-01-15'),
    };
    
    expect(() => CurrencyValueSchema.parse(value)).not.toThrow();
  });
  
  it('should handle negative amounts', () => {
    const value: CurrencyValueType = {
      amount: -500.00,
      currency: 'GBP',
    };
    
    expect(() => CurrencyValueSchema.parse(value)).not.toThrow();
  });
  
  it('should handle zero amounts', () => {
    const value: CurrencyValueType = {
      amount: 0,
      currency: 'JPY',
    };
    
    expect(() => CurrencyValueSchema.parse(value)).not.toThrow();
  });
  
  it('should store exchange rate for audit trail', () => {
    const value: CurrencyValueType = {
      amount: 100.00,
      currency: 'EUR',
      convertedAmount: 85.00,
      convertedCurrency: 'GBP',
      exchangeRate: 0.85,
      conversionDate: new Date(),
    };
    
    const result = CurrencyValueSchema.parse(value);
    expect(result.exchangeRate).toBe(0.85);
    expect(result.conversionDate).toBeInstanceOf(Date);
  });
});

describe('MultiCurrencyFieldConfigSchema', () => {
  it('should accept valid field configuration', () => {
    const config: MultiCurrencyFieldConfig = {
      defaultCurrency: 'USD',
      alwaysStoreConverted: true,
      allowCurrencyChange: false,
      restrictedCurrencies: ['USD', 'EUR', 'GBP'],
      showConversion: true,
      roundingMode: 'half_up',
    };
    
    expect(() => MultiCurrencyFieldConfigSchema.parse(config)).not.toThrow();
  });
  
  it('should apply default values', () => {
    const minimal = {};
    
    const result = MultiCurrencyFieldConfigSchema.parse(minimal);
    expect(result.alwaysStoreConverted).toBe(true);
    expect(result.allowCurrencyChange).toBe(true);
    expect(result.showConversion).toBe(false);
    expect(result.roundingMode).toBe('half_up');
  });
  
  it('should support currency restrictions', () => {
    const config = {
      restrictedCurrencies: ['USD', 'EUR'],
    };
    
    const result = MultiCurrencyFieldConfigSchema.parse(config);
    expect(result.restrictedCurrencies).toEqual(['USD', 'EUR']);
  });
  
  it('should support different rounding modes', () => {
    const modes = ['half_up', 'half_down', 'half_even', 'up', 'down'] as const;
    
    modes.forEach(roundingMode => {
      const config = { roundingMode };
      expect(() => MultiCurrencyFieldConfigSchema.parse(config)).not.toThrow();
    });
  });
  
  it('should allow locking currency after creation', () => {
    const config = {
      allowCurrencyChange: false,
    };
    
    const result = MultiCurrencyFieldConfigSchema.parse(config);
    expect(result.allowCurrencyChange).toBe(false);
  });
});

describe('CurrencyCalculationResultSchema', () => {
  it('should accept calculation result', () => {
    const result: CurrencyCalculationResult = {
      value: {
        amount: 5000.00,
        currency: 'USD',
      },
      crossCurrency: false,
      method: 'sum',
    };
    
    expect(() => CurrencyCalculationResultSchema.parse(result)).not.toThrow();
  });
  
  it('should support cross-currency calculations', () => {
    const result: CurrencyCalculationResult = {
      value: {
        amount: 5000.00,
        currency: 'USD',
        convertedAmount: 5000.00,
        convertedCurrency: 'USD',
      },
      crossCurrency: true,
      sources: [
        { amount: 1000.00, currency: 'USD' },
        { amount: 2000.00, currency: 'EUR', weight: 1.18 },
        { amount: 1500.00, currency: 'GBP', weight: 1.37 },
      ],
      method: 'sum',
    };
    
    expect(() => CurrencyCalculationResultSchema.parse(result)).not.toThrow();
  });
  
  it('should support different calculation methods', () => {
    const methods = ['sum', 'average', 'min', 'max', 'count'] as const;
    
    methods.forEach(method => {
      const result = {
        value: { amount: 100, currency: 'USD' },
        crossCurrency: false,
        method,
      };
      
      expect(() => CurrencyCalculationResultSchema.parse(result)).not.toThrow();
    });
  });
  
  it('should track source values in aggregations', () => {
    const result: CurrencyCalculationResult = {
      value: { amount: 150.00, currency: 'USD' },
      crossCurrency: true,
      sources: [
        { amount: 100.00, currency: 'USD', weight: 1.0 },
        { amount: 50.00, currency: 'EUR', weight: 1.18 },
      ],
      method: 'sum',
    };
    
    const parsed = CurrencyCalculationResultSchema.parse(result);
    expect(parsed.sources).toHaveLength(2);
    expect(parsed.crossCurrency).toBe(true);
  });
});

describe('CurrencyValidationSchema', () => {
  it('should accept validation rules', () => {
    const validation: CurrencyValidation = {
      minAmount: 0,
      maxAmount: 1000000,
      minConvertedAmount: 0,
      maxConvertedAmount: 1000000,
      allowedCurrencies: ['USD', 'EUR', 'GBP'],
      positiveOnly: true,
      nonZero: false,
    };
    
    expect(() => CurrencyValidationSchema.parse(validation)).not.toThrow();
  });
  
  it('should support min/max amount validation', () => {
    const validation = {
      minAmount: 100,
      maxAmount: 10000,
    };
    
    const result = CurrencyValidationSchema.parse(validation);
    expect(result.minAmount).toBe(100);
    expect(result.maxAmount).toBe(10000);
  });
  
  it('should support corporate currency limits', () => {
    const validation = {
      minConvertedAmount: 1000,
      maxConvertedAmount: 50000,
    };
    
    const result = CurrencyValidationSchema.parse(validation);
    expect(result.minConvertedAmount).toBe(1000);
    expect(result.maxConvertedAmount).toBe(50000);
  });
  
  it('should support currency restrictions', () => {
    const validation = {
      allowedCurrencies: ['USD', 'CAD'],
    };
    
    const result = CurrencyValidationSchema.parse(validation);
    expect(result.allowedCurrencies).toEqual(['USD', 'CAD']);
  });
  
  it('should support positive-only constraint', () => {
    const validation = {
      positiveOnly: true,
    };
    
    const result = CurrencyValidationSchema.parse(validation);
    expect(result.positiveOnly).toBe(true);
  });
  
  it('should support non-zero constraint', () => {
    const validation = {
      nonZero: true,
    };
    
    const result = CurrencyValidationSchema.parse(validation);
    expect(result.nonZero).toBe(true);
  });
});

describe('CurrencyValue Helper', () => {
  it('should create simple currency value', () => {
    const value = CurrencyValue.create(1234.56, 'USD');
    
    expect(value.amount).toBe(1234.56);
    expect(value.currency).toBe('USD');
    expect(value.convertedAmount).toBeUndefined();
  });
  
  it('should create currency value with conversion', () => {
    const value = CurrencyValue.createWithConversion(
      1000.00,
      'EUR',
      1176.47,
      'USD',
      1.17647
    );
    
    expect(value.amount).toBe(1000.00);
    expect(value.currency).toBe('EUR');
    expect(value.convertedAmount).toBe(1176.47);
    expect(value.convertedCurrency).toBe('USD');
    expect(value.exchangeRate).toBe(1.17647);
    expect(value.conversionDate).toBeInstanceOf(Date);
  });
  
  it('should create zero value', () => {
    const usdZero = CurrencyValue.zero('USD');
    const defaultZero = CurrencyValue.zero();
    
    expect(usdZero.amount).toBe(0);
    expect(usdZero.currency).toBe('USD');
    
    expect(defaultZero.amount).toBe(0);
    expect(defaultZero.currency).toBe('USD');
  });
});

describe('Multi-Currency Data Layer Scenarios', () => {
  it('should support storing opportunity amount in EUR', () => {
    const opportunityAmount = CurrencyValue.createWithConversion(
      50000.00,
      'EUR',
      58823.53,
      'USD',
      1.176471
    );
    
    expect(() => CurrencyValueSchema.parse(opportunityAmount)).not.toThrow();
  });
  
  it('should support field with restricted currencies', () => {
    const fieldConfig: MultiCurrencyFieldConfig = {
      defaultCurrency: 'USD',
      restrictedCurrencies: ['USD', 'CAD'],
      allowCurrencyChange: false,
      showConversion: true,
    };
    
    expect(() => MultiCurrencyFieldConfigSchema.parse(fieldConfig)).not.toThrow();
  });
  
  it('should support cross-currency sum calculation', () => {
    const sumResult: CurrencyCalculationResult = {
      value: {
        amount: 10000.00,
        currency: 'USD',
      },
      crossCurrency: true,
      sources: [
        { amount: 5000.00, currency: 'USD' },
        { amount: 3000.00, currency: 'EUR', weight: 1.18 },
        { amount: 2000.00, currency: 'GBP', weight: 1.37 },
      ],
      method: 'sum',
    };
    
    expect(() => CurrencyCalculationResultSchema.parse(sumResult)).not.toThrow();
  });
  
  it('should enforce minimum deal size in corporate currency', () => {
    const validation: CurrencyValidation = {
      minConvertedAmount: 10000, // $10,000 USD minimum
      positiveOnly: true,
      nonZero: true,
    };
    
    expect(() => CurrencyValidationSchema.parse(validation)).not.toThrow();
  });
  
  it('should support Japanese Yen with zero decimal places', () => {
    const jpyValue = CurrencyValue.create(150000, 'JPY');
    
    expect(() => CurrencyValueSchema.parse(jpyValue)).not.toThrow();
    expect(jpyValue.amount).toBe(150000);
    expect(jpyValue.currency).toBe('JPY');
  });
  
  it('should support historical conversion rates', () => {
    const historicalValue: CurrencyValueType = {
      amount: 1000.00,
      currency: 'EUR',
      convertedAmount: 1100.00,
      convertedCurrency: 'USD',
      exchangeRate: 1.10,
      conversionDate: new Date('2023-01-15'),
    };
    
    expect(() => CurrencyValueSchema.parse(historicalValue)).not.toThrow();
  });
});
