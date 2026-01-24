/**
 * Multi-Currency Implementation Example
 * 
 * This example demonstrates how to use the multi-currency feature
 * in ObjectStack, following Salesforce-like patterns.
 */

import {
  // System-level imports
  Currency,
  CurrencySettings,
  CurrencySettingsSchema,
  ExchangeRate,
  UserCurrencyPreferences,
  
  // Data-level imports
  CurrencyValue,
  CurrencyValueSchema,
  MultiCurrencyFieldConfig,
  Field,
} from '@objectstack/spec';

// ========================================
// 1. Organization Setup: Enable Multi-Currency
// ========================================

const organizationCurrencySettings: CurrencySettings = {
  // Enable multi-currency for the organization
  enabled: true,
  
  // Set the corporate (base) currency
  corporateCurrency: 'USD',
  
  // Define active currencies
  activeCurrencies: [
    // Corporate currency (USD) with conversion rate of 1.0
    Currency.USD(),
    
    // Other active currencies with conversion rates
    {
      ...Currency.EUR(),
      conversionRate: 0.85, // 1 EUR = 0.85 USD
      conversionRateUpdatedAt: new Date('2024-01-15'),
    },
    {
      ...Currency.GBP(),
      conversionRate: 0.73, // 1 GBP = 0.73 USD
      conversionRateUpdatedAt: new Date('2024-01-15'),
    },
    {
      ...Currency.JPY(),
      conversionRate: 110.25, // 1 JPY = 110.25 USD
      conversionRateUpdatedAt: new Date('2024-01-15'),
    },
    {
      ...Currency.CNY(),
      conversionRate: 6.45, // 1 CNY = 6.45 USD
      conversionRateUpdatedAt: new Date('2024-01-15'),
    },
  ],
  
  // Default formatting options
  defaultFormatting: {
    format: 'symbol', // Display as: $1,234.56
    locale: 'en-US',
    showSymbol: true,
    showCode: false,
  },
  
  // Allow users to select their preferred display currency
  allowUserCurrency: true,
  
  // Enable automatic currency conversion in reports
  enableAutoConversion: true,
  
  // How to handle sorting: convert to corporate currency first
  sortingStrategy: 'convert_to_corporate',
  
  // How to handle aggregations: convert to corporate currency first
  aggregationStrategy: 'convert_to_corporate',
  
  // Enable dated exchange rates for historical accuracy
  enableDatedExchangeRates: false,
};

// Validate the configuration
CurrencySettingsSchema.parse(organizationCurrencySettings);

// ========================================
// 2. User Preferences: Set Display Currency
// ========================================

const userPreferences: UserCurrencyPreferences = {
  // User prefers to see amounts in EUR
  preferredCurrency: 'EUR',
  
  // Custom formatting for this user
  formatting: {
    format: 'symbol_code', // Display as: €1,234.56 EUR
    locale: 'fr-FR',
    decimalSeparator: ',',
    thousandsSeparator: '.',
  },
  
  // Always convert amounts to preferred currency
  alwaysConvert: true,
};

// ========================================
// 3. Field Definition: Currency Field with Multi-Currency
// ========================================

const opportunityAmountField = Field.currency({
  name: 'amount',
  label: 'Opportunity Amount',
  required: true,
  
  // Currency-specific configuration
  currencyCode: 'USD', // Default currency for new records
  allowCurrencyChange: true, // Users can change currency
  restrictedCurrencies: ['USD', 'EUR', 'GBP'], // Restrict to these currencies
  showConversion: true, // Show conversion to corporate/user currency
  roundingMode: 'half_up', // Standard rounding
  
  // Number constraints
  precision: 18,
  scale: 2,
  min: 0,
  max: 999999999999.99,
});

// ========================================
// 4. Storing Currency Values
// ========================================

// Example 1: Simple currency value (EUR)
const opportunityEUR = CurrencyValue.create(50000.00, 'EUR');
console.log('Opportunity in EUR:', opportunityEUR);
// Output: { amount: 50000.00, currency: 'EUR' }

// Example 2: Currency value with conversion to corporate currency
const opportunityWithConversion = CurrencyValue.createWithConversion(
  50000.00,     // Amount in EUR
  'EUR',        // Currency
  58823.53,     // Converted amount in USD (50000 / 0.85)
  'USD',        // Corporate currency
  1.176471      // Exchange rate (1 EUR = 1.176471 USD)
);

console.log('Opportunity with conversion:', opportunityWithConversion);
// Output: {
//   amount: 50000.00,
//   currency: 'EUR',
//   convertedAmount: 58823.53,
//   convertedCurrency: 'USD',
//   exchangeRate: 1.176471,
//   conversionDate: Date
// }

// Validate the value
CurrencyValueSchema.parse(opportunityWithConversion);

// ========================================
// 5. Real-World Example: CRM Opportunity
// ========================================

const crmOpportunity = {
  id: 'OPP-001',
  name: 'Enterprise License - Acme Corp',
  
  // Currency field with multi-currency support
  amount: {
    amount: 100000.00,
    currency: 'GBP',
    convertedAmount: 137000.00, // Converted to USD at rate 1.37
    convertedCurrency: 'USD',
    exchangeRate: 1.37,
    conversionDate: new Date('2024-01-15'),
  },
  
  // Other fields
  stage: 'Negotiation',
  probability: 75,
  closeDate: new Date('2024-03-31'),
};

// ========================================
// 6. Reporting & Aggregation
// ========================================

// When reporting on opportunities across multiple currencies:
// - Convert all amounts to corporate currency (USD)
// - Then perform aggregation
const opportunities = [
  { name: 'Deal 1', amount: 50000, currency: 'USD' },
  { name: 'Deal 2', amount: 40000, currency: 'EUR', convertedAmount: 47058.82 },
  { name: 'Deal 3', amount: 30000, currency: 'GBP', convertedAmount: 41100.00 },
];

// Total in corporate currency (USD)
const totalUSD = opportunities.reduce((sum, opp) => {
  const amount = opp.convertedAmount ?? opp.amount;
  return sum + amount;
}, 0);

console.log('Total Pipeline (USD):', totalUSD);
// Output: Total Pipeline (USD): 138158.82

// ========================================
// 7. Dated Exchange Rates (Historical Accuracy)
// ========================================

const historicalExchangeRates: ExchangeRate[] = [
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
];

// When calculating historical reports, use the exchange rate
// that was effective at the time of the transaction

// ========================================
// 8. Display Formatting Examples
// ========================================

function formatCurrency(value: typeof opportunityEUR, locale: string = 'en-US') {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currency,
  });
  
  return formatter.format(value.amount);
}

console.log('USD format:', formatCurrency({ amount: 1234.56, currency: 'USD' }));
// Output: USD format: $1,234.56

console.log('EUR format (France):', formatCurrency({ amount: 1234.56, currency: 'EUR' }, 'fr-FR'));
// Output: EUR format (France): 1 234,56 €

console.log('GBP format (UK):', formatCurrency({ amount: 1234.56, currency: 'GBP' }, 'en-GB'));
// Output: GBP format (UK): £1,234.56

console.log('JPY format (Japan):', formatCurrency({ amount: 150000, currency: 'JPY' }, 'ja-JP'));
// Output: JPY format (Japan): ¥150,000

// ========================================
// Summary
// ========================================

/**
 * Key Takeaways:
 * 
 * 1. **Storage**: Values are stored with both native currency and converted amount
 * 2. **Display**: Use Intl.NumberFormat for locale-specific formatting
 * 3. **Sorting**: Configure strategy (convert_to_corporate, convert_to_user, or native_value)
 * 4. **Aggregation**: Always convert to a common currency before aggregating
 * 5. **Validation**: Use CurrencyValidation schema for business rules
 * 6. **Historical Accuracy**: Use dated exchange rates when needed
 * 7. **Type Safety**: All helper functions use CurrencyCode type for compile-time validation
 * 
 * This implementation follows Salesforce best practices and supports:
 * - International business scenarios
 * - Multiple currencies per organization
 * - User-specific currency preferences
 * - Accurate reporting and analytics
 * - Historical exchange rate tracking
 * - Flexible formatting options
 */
