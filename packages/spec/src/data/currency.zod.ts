import { z } from 'zod';
import { CurrencyCodeSchema, type CurrencyCode } from '../system/currency.zod';

/**
 * Currency Value Schema (Data Layer)
 * 
 * Defines how currency values are stored in the data layer.
 * This is a compound value object that stores both the amount and currency code.
 * 
 * Similar to Salesforce's approach, we store:
 * - The numeric value
 * - The currency ISO code
 * - Optionally, the converted value in corporate currency
 * 
 * Storage Format Examples:
 * - Simple: { amount: 1234.56, currency: 'USD' }
 * - With conversion: { amount: 1234.56, currency: 'EUR', convertedAmount: 1450.88, convertedCurrency: 'USD' }
 */

/**
 * Currency Value Schema
 * Value object for currency field type
 */
export const CurrencyValueSchema = z.object({
  /**
   * The numeric amount
   */
  amount: z.number().describe('Numeric amount'),
  
  /**
   * Currency code for this value
   */
  currency: CurrencyCodeSchema.describe('Currency code (ISO 4217)'),
  
  /**
   * Converted amount in corporate/base currency
   * Automatically calculated based on exchange rates
   */
  convertedAmount: z.number().optional().describe('Converted amount in corporate currency'),
  
  /**
   * Corporate currency code
   * The currency that convertedAmount is expressed in
   */
  convertedCurrency: CurrencyCodeSchema.optional().describe('Corporate currency code'),
  
  /**
   * Exchange rate used for conversion
   * Stored for audit trail and historical accuracy
   */
  exchangeRate: z.number().positive().optional().describe('Exchange rate used for conversion'),
  
  /**
   * When the conversion was performed
   * Important for dated exchange rates
   */
  conversionDate: z.date().optional().describe('When the conversion was performed'),
});

export type CurrencyValue = z.infer<typeof CurrencyValueSchema>;

/**
 * Multi-Currency Field Configuration Schema
 * Additional configuration for currency fields when multi-currency is enabled
 */
export const MultiCurrencyFieldConfigSchema = z.object({
  /**
   * Default currency code for new records
   * If not specified, uses user's preferred currency or organization's corporate currency
   */
  defaultCurrency: CurrencyCodeSchema.optional().describe('Default currency for new records'),
  
  /**
   * Whether to always store converted values
   * If true, convertedAmount is always calculated and stored
   * If false, conversion is done on-demand
   */
  alwaysStoreConverted: z.boolean().default(true).describe('Always store converted values'),
  
  /**
   * Whether users can change the currency on existing records
   * If false, currency is locked after record creation
   */
  allowCurrencyChange: z.boolean().default(true).describe('Allow changing currency after creation'),
  
  /**
   * Restricted currencies for this field
   * If specified, only these currencies can be used
   * If empty/undefined, all active organization currencies are allowed
   */
  restrictedCurrencies: z.array(CurrencyCodeSchema).optional().describe('Restrict to specific currencies'),
  
  /**
   * Whether to show conversion information in the UI
   */
  showConversion: z.boolean().default(false).describe('Show conversion information in UI'),
  
  /**
   * Rounding mode for calculations
   */
  roundingMode: z.enum([
    'half_up',      // Round half away from zero (default)
    'half_down',    // Round half toward zero
    'half_even',    // Round half to nearest even (banker's rounding)
    'up',           // Always round away from zero
    'down',         // Always round toward zero (truncate)
  ]).default('half_up').describe('Rounding mode for calculations'),
});

export type MultiCurrencyFieldConfig = z.infer<typeof MultiCurrencyFieldConfigSchema>;

/**
 * Currency Calculation Result Schema
 * Result of currency calculations (for formulas, rollups, etc.)
 */
export const CurrencyCalculationResultSchema = z.object({
  /**
   * Calculated value
   */
  value: CurrencyValueSchema.describe('Calculated currency value'),
  
  /**
   * Whether this result involved cross-currency calculations
   */
  crossCurrency: z.boolean().describe('Whether cross-currency calculation was performed'),
  
  /**
   * Source values that contributed to this calculation
   */
  sources: z.array(z.object({
    amount: z.number(),
    currency: CurrencyCodeSchema,
    weight: z.number().optional().describe('Weight/contribution to final result'),
  })).optional().describe('Source values'),
  
  /**
   * Calculation method used
   */
  method: z.enum([
    'sum',
    'average',
    'min',
    'max',
    'count',
  ]).optional().describe('Calculation method'),
});

export type CurrencyCalculationResult = z.infer<typeof CurrencyCalculationResultSchema>;

/**
 * Currency Field Validation Rules
 * Additional validation rules specific to currency fields
 */
export const CurrencyValidationSchema = z.object({
  /**
   * Minimum amount (in any currency)
   */
  minAmount: z.number().optional().describe('Minimum amount'),
  
  /**
   * Maximum amount (in any currency)
   */
  maxAmount: z.number().optional().describe('Maximum amount'),
  
  /**
   * Minimum amount in corporate currency
   * Useful for cross-currency validation (e.g., all deals must be > $10,000 USD equivalent)
   */
  minConvertedAmount: z.number().optional().describe('Minimum amount in corporate currency'),
  
  /**
   * Maximum amount in corporate currency
   */
  maxConvertedAmount: z.number().optional().describe('Maximum amount in corporate currency'),
  
  /**
   * Allowed currencies
   * Validates that the currency code is in this list
   */
  allowedCurrencies: z.array(CurrencyCodeSchema).optional().describe('Allowed currency codes'),
  
  /**
   * Require positive amounts only
   */
  positiveOnly: z.boolean().default(false).describe('Require positive amounts only'),
  
  /**
   * Require non-zero amounts
   */
  nonZero: z.boolean().default(false).describe('Require non-zero amounts'),
});

export type CurrencyValidation = z.infer<typeof CurrencyValidationSchema>;

/**
 * Currency Helper Functions
 */
export const CurrencyValue = {
  /**
   * Create a simple currency value
   */
  create: (amount: number, currency: CurrencyCode): CurrencyValue => ({
    amount,
    currency,
  }),
  
  /**
   * Create a currency value with conversion
   */
  createWithConversion: (
    amount: number,
    currency: CurrencyCode,
    convertedAmount: number,
    convertedCurrency: CurrencyCode,
    exchangeRate: number,
  ): CurrencyValue => ({
    amount,
    currency,
    convertedAmount,
    convertedCurrency,
    exchangeRate,
    conversionDate: new Date(),
  }),
  
  /**
   * Zero value in specified currency
   */
  zero: (currency: CurrencyCode = 'USD'): CurrencyValue => ({
    amount: 0,
    currency,
  }),
};
