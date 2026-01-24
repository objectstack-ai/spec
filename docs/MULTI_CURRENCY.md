# Multi-Currency Support

ObjectStack provides comprehensive multi-currency support following Salesforce best practices for international business scenarios.

## Features

### 🌍 Organization-Level Configuration
- Enable/disable multi-currency at organization level
- Configure corporate (base) currency
- Manage active currencies and exchange rates
- Support for 150+ currencies (ISO 4217 standard)
- Dated exchange rates for historical accuracy

### 💱 Field-Level Control
- Default currency per field
- Restrict currencies for specific fields
- Control currency mutability after record creation
- Configurable rounding modes
- Display conversion information in UI

### 👤 User Preferences
- User-specific preferred display currency
- Custom formatting options per user
- Automatic currency conversion
- Locale-specific number formatting

### 📊 Reporting & Analytics
- Multiple aggregation strategies:
  - Convert to corporate currency
  - Convert to user's preferred currency
  - Group by currency (no conversion)
- Cross-currency calculations with source tracking
- Proper sorting across different currencies

## Quick Start

### 1. Enable Multi-Currency

```typescript
import { Currency, CurrencySettingsSchema } from '@objectstack/spec';

const settings = {
  enabled: true,
  corporateCurrency: 'USD',
  activeCurrencies: [
    Currency.USD(),
    { ...Currency.EUR(), conversionRate: 0.85 },
    { ...Currency.GBP(), conversionRate: 0.73 },
  ],
  aggregationStrategy: 'convert_to_corporate',
  sortingStrategy: 'convert_to_corporate',
};

CurrencySettingsSchema.parse(settings);
```

### 2. Define Currency Fields

```typescript
import { Field } from '@objectstack/spec';

const amountField = Field.currency({
  name: 'amount',
  label: 'Amount',
  currencyCode: 'USD',
  allowCurrencyChange: true,
  restrictedCurrencies: ['USD', 'EUR', 'GBP'],
  showConversion: true,
  roundingMode: 'half_up',
});
```

### 3. Store Currency Values

```typescript
import { CurrencyValue } from '@objectstack/spec';

// Simple value
const value = CurrencyValue.create(1000.00, 'EUR');

// Value with conversion
const valueWithConversion = CurrencyValue.createWithConversion(
  1000.00,  // Amount
  'EUR',    // Currency
  1176.47,  // Converted amount in USD
  'USD',    // Corporate currency
  1.17647   // Exchange rate
);
```

### 4. Display with Intl Formatting

```typescript
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

console.log(formatter.format(1234.56)); // "$1,234.56"
```

## Architecture

### System Layer (`src/system/currency.zod.ts`)

**Core Schemas:**
- `CurrencySchema` - Individual currency definition
- `ExchangeRateSchema` - Exchange rate between currencies
- `CurrencySettingsSchema` - Organization-wide configuration
- `CurrencyFormattingSchema` - Display formatting options
- `UserCurrencyPreferencesSchema` - User-specific preferences

**Helper Functions:**
- `Currency.define()` - Create custom currency
- `Currency.USD()`, `Currency.EUR()`, etc. - Pre-configured currencies

### Data Layer (`src/data/currency.zod.ts`)

**Core Schemas:**
- `CurrencyValueSchema` - Compound value object (amount + currency + conversion)
- `MultiCurrencyFieldConfigSchema` - Field-level configuration
- `CurrencyCalculationResultSchema` - Cross-currency calculation results
- `CurrencyValidationSchema` - Validation rules for currency fields

**Helper Functions:**
- `CurrencyValue.create()` - Create simple currency value
- `CurrencyValue.createWithConversion()` - Create with conversion
- `CurrencyValue.zero()` - Create zero value

## Examples

See [`examples/multi-currency-example.ts`](../examples/multi-currency-example.ts) for comprehensive examples.

## Related Documentation

- [Field Types](../content/docs/specifications/field-types.mdx)
- [Data Protocol](../content/docs/specifications/architecture/data-layer.mdx)
- [System Configuration](../content/docs/specifications/architecture/system-layer.mdx)

## References

- [ISO 4217 Currency Codes](https://www.iso.org/iso-4217-currency-codes.html)
- [Intl.NumberFormat MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [Salesforce Multi-Currency](https://help.salesforce.com/s/articleView?id=sf.admin_enable_multicurrency.htm)
