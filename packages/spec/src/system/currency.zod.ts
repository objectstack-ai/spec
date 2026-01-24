import { z } from 'zod';

/**
 * Currency Schema (Multi-Currency Support)
 * 
 * Implements a Salesforce-like multi-currency system for international business scenarios.
 * Supports multiple currencies within a single organization with automatic conversion,
 * proper formatting, and handling of exchange rates.
 * 
 * Key Features:
 * - Organization can enable multiple currencies
 * - Each user/record can have a default currency
 * - Automatic currency conversion based on exchange rates
 * - Proper sorting and aggregation across currencies
 * - ISO 4217 standard currency codes
 */

/**
 * Currency Code Type
 * ISO 4217 three-letter currency codes
 * 
 * Common examples: USD, EUR, GBP, JPY, CNY, AUD, CAD, CHF, INR, etc.
 * Full list: https://www.iso.org/iso-4217-currency-codes.html
 */
export const CurrencyCodeSchema = z.string()
  .length(3)
  .toUpperCase()
  .regex(/^[A-Z]{3}$/)
  .describe('ISO 4217 currency code (e.g., USD, EUR, GBP)');

export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;

/**
 * Currency Definition Schema
 * Defines properties of a specific currency
 */
export const CurrencySchema = z.object({
  /**
   * ISO 4217 currency code
   */
  code: CurrencyCodeSchema.describe('ISO 4217 currency code'),
  
  /**
   * Human-readable currency name
   */
  name: z.string().describe('Currency name (e.g., US Dollar, Euro)'),
  
  /**
   * Currency symbol
   */
  symbol: z.string().describe('Currency symbol (e.g., $, €, £, ¥)'),
  
  /**
   * Number of decimal places for this currency
   * Most currencies use 2, but some like JPY use 0, and some use 3
   */
  decimalPlaces: z.number().int().min(0).max(4).default(2).describe('Number of decimal places'),
  
  /**
   * Whether this currency is active in the organization
   */
  isActive: z.boolean().default(true).describe('Whether this currency is active'),
  
  /**
   * Whether this is the corporate/base currency
   * Only one currency can be the corporate currency
   */
  isCorporate: z.boolean().default(false).describe('Whether this is the corporate/base currency'),
  
  /**
   * Conversion rate to the corporate currency
   * For the corporate currency itself, this should be 1.0
   * For other currencies, this represents: 1 unit of this currency = X units of corporate currency
   */
  conversionRate: z.number().positive().default(1.0).describe('Conversion rate to corporate currency'),
  
  /**
   * When the conversion rate was last updated
   */
  conversionRateUpdatedAt: z.date().optional().describe('Last conversion rate update timestamp'),
});

export type Currency = z.infer<typeof CurrencySchema>;

/**
 * Exchange Rate Schema
 * Defines conversion rate between two currencies
 * Useful for maintaining dated exchange rates or manual overrides
 */
export const ExchangeRateSchema = z.object({
  /**
   * Source currency code
   */
  fromCurrency: CurrencyCodeSchema.describe('Source currency code'),
  
  /**
   * Target currency code
   */
  toCurrency: CurrencyCodeSchema.describe('Target currency code'),
  
  /**
   * Exchange rate: 1 unit of fromCurrency = rate units of toCurrency
   */
  rate: z.number().positive().describe('Exchange rate'),
  
  /**
   * Date when this exchange rate is effective from
   */
  effectiveDate: z.date().describe('Effective start date for this rate'),
  
  /**
   * Date when this exchange rate expires
   */
  expiryDate: z.date().optional().describe('Expiry date for this rate'),
  
  /**
   * Source of the exchange rate (manual, api, etc.)
   */
  source: z.enum(['manual', 'api', 'system']).default('manual').describe('Exchange rate source'),
});

export type ExchangeRate = z.infer<typeof ExchangeRateSchema>;

/**
 * Currency Formatting Options Schema
 * Defines how currencies should be displayed
 */
export const CurrencyFormattingSchema = z.object({
  /**
   * Display format for currency
   */
  format: z.enum([
    'symbol',      // $1,234.56
    'code',        // USD 1,234.56
    'name',        // 1,234.56 US Dollars
    'symbol_code', // $1,234.56 USD
  ]).default('symbol').describe('Currency display format'),
  
  /**
   * Locale for number formatting
   * Uses Intl.NumberFormat compatible locale strings
   */
  locale: z.string().default('en-US').describe('Locale for number formatting (e.g., en-US, fr-FR, zh-CN)'),
  
  /**
   * Whether to show currency symbol
   */
  showSymbol: z.boolean().default(true).describe('Show currency symbol'),
  
  /**
   * Whether to show currency code
   */
  showCode: z.boolean().default(false).describe('Show currency code'),
  
  /**
   * Decimal separator
   */
  decimalSeparator: z.enum(['.', ',']).default('.').describe('Decimal separator'),
  
  /**
   * Thousands separator
   */
  thousandsSeparator: z.enum([',', '.', ' ', '']).default(',').describe('Thousands separator'),
});

export type CurrencyFormatting = z.infer<typeof CurrencyFormattingSchema>;

/**
 * Organization Currency Settings Schema
 * Organization-wide multi-currency configuration
 */
export const CurrencySettingsSchema = z.object({
  /**
   * Whether multi-currency is enabled for the organization
   */
  enabled: z.boolean().default(false).describe('Enable multi-currency support'),
  
  /**
   * Corporate/base currency code
   * All conversions are relative to this currency
   */
  corporateCurrency: CurrencyCodeSchema.describe('Corporate/base currency code'),
  
  /**
   * List of active currencies in the organization
   */
  activeCurrencies: z.array(CurrencySchema).describe('Active currencies'),
  
  /**
   * Default formatting options
   */
  defaultFormatting: CurrencyFormattingSchema.optional().describe('Default currency formatting'),
  
  /**
   * Whether to allow users to select their preferred currency
   */
  allowUserCurrency: z.boolean().default(true).describe('Allow users to select preferred currency'),
  
  /**
   * Whether to enable automatic currency conversion in reports/dashboards
   */
  enableAutoConversion: z.boolean().default(true).describe('Enable automatic currency conversion'),
  
  /**
   * Whether to enable dated exchange rates
   * If false, only current exchange rates are used
   * If true, historical exchange rates are maintained
   */
  enableDatedExchangeRates: z.boolean().default(false).describe('Enable dated exchange rates'),
  
  /**
   * Historical exchange rates
   * Only used when enableDatedExchangeRates is true
   */
  exchangeRates: z.array(ExchangeRateSchema).optional().describe('Historical exchange rates'),
  
  /**
   * How to handle currency conversion in aggregations
   */
  aggregationStrategy: z.enum([
    'convert_to_corporate', // Convert all values to corporate currency before aggregating
    'convert_to_user',      // Convert all values to user's currency before aggregating
    'group_by_currency',    // Group results by currency (no conversion)
  ]).default('convert_to_corporate').describe('Currency conversion strategy for aggregations'),
  
  /**
   * How to handle currency in sorting
   */
  sortingStrategy: z.enum([
    'convert_to_corporate', // Convert to corporate currency for sorting
    'convert_to_user',      // Convert to user's currency for sorting
    'native_value',         // Sort by raw value (ignore currency)
  ]).default('convert_to_corporate').describe('Currency conversion strategy for sorting'),
});

export type CurrencySettings = z.infer<typeof CurrencySettingsSchema>;

/**
 * User Currency Preferences Schema
 * User-specific currency settings
 */
export const UserCurrencyPreferencesSchema = z.object({
  /**
   * User's preferred display currency
   */
  preferredCurrency: CurrencyCodeSchema.describe('Preferred display currency'),
  
  /**
   * Formatting preferences
   */
  formatting: CurrencyFormattingSchema.optional().describe('User-specific formatting preferences'),
  
  /**
   * Whether to always show values in preferred currency
   * If false, values are shown in their native currency
   */
  alwaysConvert: z.boolean().default(false).describe('Always convert to preferred currency'),
});

export type UserCurrencyPreferences = z.infer<typeof UserCurrencyPreferencesSchema>;

/**
 * Currency Helper - Factory Functions
 * 
 * Helper functions to create common currency configurations
 */
export const Currency = {
  /**
   * Create a currency definition
   */
  define: (code: CurrencyCode, name: string, symbol: string, options?: {
    decimalPlaces?: number;
    isActive?: boolean;
    isCorporate?: boolean;
    conversionRate?: number;
  }): Currency => ({
    code,
    name,
    symbol,
    decimalPlaces: options?.decimalPlaces ?? 2,
    isActive: options?.isActive ?? true,
    isCorporate: options?.isCorporate ?? false,
    conversionRate: options?.conversionRate ?? 1.0,
  }),
  
  /**
   * Common currency definitions
   */
  USD: (): Currency => Currency.define('USD' as CurrencyCode, 'US Dollar', '$', { isCorporate: true }),
  EUR: (): Currency => Currency.define('EUR' as CurrencyCode, 'Euro', '€'),
  GBP: (): Currency => Currency.define('GBP' as CurrencyCode, 'British Pound', '£'),
  JPY: (): Currency => Currency.define('JPY' as CurrencyCode, 'Japanese Yen', '¥', { decimalPlaces: 0 }),
  CNY: (): Currency => Currency.define('CNY' as CurrencyCode, 'Chinese Yuan', '¥'),
  AUD: (): Currency => Currency.define('AUD' as CurrencyCode, 'Australian Dollar', 'A$'),
  CAD: (): Currency => Currency.define('CAD' as CurrencyCode, 'Canadian Dollar', 'C$'),
  CHF: (): Currency => Currency.define('CHF' as CurrencyCode, 'Swiss Franc', 'CHF'),
  INR: (): Currency => Currency.define('INR' as CurrencyCode, 'Indian Rupee', '₹'),
  BRL: (): Currency => Currency.define('BRL' as CurrencyCode, 'Brazilian Real', 'R$'),
};
