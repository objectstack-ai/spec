# Modern Field Types Examples

This directory contains examples demonstrating the modern field types and cross-field validation capabilities in ObjectStack.

## New Field Types

### 1. Slider Field (`slider`)
A numeric slider control for visual range selection with configurable steps and custom marks.

**Use Cases:**
- Volume/brightness controls
- Stock level indicators
- Rating scales with visual feedback
- Priority levels

**Configuration:**
```typescript
Field.slider({
  label: 'Stock Level',
  min: 0,
  max: 100,
  step: 1,
  defaultValue: 50,
  showValue: true,
  marks: {
    '0': 'Empty',
    '50': 'Medium',
    '100': 'Full',
  },
})
```

### 2. QR Code / Barcode Field (`qrcode`)
Generate and scan QR codes and various barcode formats for product identification and tracking.

**Supported Formats:**
- `qr` - QR Code
- `ean13` - EAN-13 (European Article Number)
- `ean8` - EAN-8
- `code128` - Code 128
- `code39` - Code 39
- `upca` - UPC-A
- `upce` - UPC-E

**Configuration:**
```typescript
// Product barcode
Field.qrcode({
  label: 'Product Barcode',
  barcodeFormat: 'ean13',
  displayValue: true,
  allowScanning: true,
  unique: true,
})

// QR code for URLs
Field.qrcode({
  label: 'Product QR Code',
  barcodeFormat: 'qr',
  qrErrorCorrection: 'M',  // L, M, Q, or H
  displayValue: false,
})
```

### 3. Geolocation Field (`geolocation`)
GPS coordinates for location tracking with optional map display and geocoding.

**Configuration:**
```typescript
Field.geolocation({
  label: 'Warehouse Location',
  displayMap: true,
  allowGeocoding: true,  // Convert addresses to coordinates
})
```

## Cross-Field Validation

Cross-field validation allows you to validate relationships between multiple fields, ensuring data integrity across your business logic.

### Basic Cross-Field Validation

```typescript
{
  type: 'cross_field',
  name: 'end_after_start',
  condition: 'end_date > start_date',
  fields: ['start_date', 'end_date'],
  message: 'End date must be after start date',
  severity: 'error',
}
```

### Complex Cross-Field Validation

```typescript
{
  type: 'cross_field',
  name: 'discount_limit',
  condition: 'discount_amount <= (ticket_price * 0.40)',
  fields: ['discount_amount', 'ticket_price'],
  message: 'Discount cannot exceed 40% of ticket price',
  severity: 'error',
}
```

### Conditional Validation

Apply validation rules only when certain conditions are met:

```typescript
{
  type: 'conditional',
  name: 'published_requires_location',
  when: 'status = "published"',
  then: {
    type: 'script',
    name: 'venue_location_required',
    condition: 'venue_location = null',
    message: 'Venue location is required for published events',
  },
}
```

## Examples

### Product Object (`product.object.ts`)
Demonstrates all new field types:
- Slider for stock levels
- QR codes for product identification
- Geolocation for warehouse tracking
- Color, rating, and address fields

### Event Object (`event.object.ts`)
Demonstrates comprehensive cross-field validation:
- Date range validation (end > start)
- Capacity validation (attendees <= capacity)
- Price validation (discount < price)
- Conditional validation based on status
- Warning thresholds

## Running Examples

To use these examples in your ObjectStack project:

1. Install dependencies:
```bash
pnpm install @objectstack/spec
```

2. Import and use the objects:
```typescript
import { Product } from './src/product.object';
import { Event } from './src/event.object';

// Use in your ObjectStack configuration
export default {
  objects: [Product, Event],
};
```

## Salesforce Comparison

ObjectStack's cross-field validation is inspired by Salesforce validation rules but provides a more composable and type-safe approach:

**Salesforce:**
```
// Validation Rule: Close_Date_Must_Be_Future
Error Condition Formula: CloseDate < TODAY()
Error Message: Close Date must be in the future
```

**ObjectStack:**
```typescript
{
  type: 'cross_field',
  name: 'close_date_future',
  condition: 'close_date > TODAY()',
  fields: ['close_date'],
  message: 'Close Date must be in the future',
}
```

## Additional Resources

- [ObjectStack Field Types Documentation](../../packages/spec/src/data/field.zod.ts)
- [Validation Rules Documentation](../../packages/spec/src/data/validation.zod.ts)
- [ObjectStack Protocol Guide](../../ARCHITECTURE.md)
