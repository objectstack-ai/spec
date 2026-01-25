# ObjectStack Data Protocol Examples

This package contains comprehensive examples demonstrating all aspects of the ObjectStack Data Protocol.

## 📚 What's Included

### Core Examples

1. **field.examples.ts** - 36 field type examples
   - All field types from FieldType enum
   - Text, numbers, dates, boolean, select, relationships
   - Media fields (image, file, avatar)
   - Calculated fields (formula, summary, autonumber)
   - Enhanced fields (location, address, code, color, rating, etc.)

2. **object.examples.ts** - 10 complete object definitions
   - Simple and complex objects
   - Objects with capabilities, indexes, search configuration
   - Real-world CRM, e-commerce, and project management examples

3. **query.examples.ts** - 25 query examples
   - Simple and complex queries
   - Filtering, sorting, pagination
   - Aggregations and joins
   - Window functions
   - Real-world business queries

4. **filter.examples.ts** - 27 filter condition examples
   - All filter operators (eq, ne, gt, lt, in, etc.)
   - Logical operators (AND, OR, NOT)
   - String matching (contains, startsWith, endsWith)
   - Complex nested conditions
   - Real-world filtering scenarios

5. **validation.examples.ts** - 20 validation rule examples
   - Script validation
   - Uniqueness constraints
   - State machine validation
   - Format validation
   - Cross-field validation
   - Async validation
   - Conditional validation
   - Custom validation

6. **hook.examples.ts** - 20 lifecycle hook examples
   - Before/after insert, update, delete
   - Read hooks (beforeFind, afterFind)
   - Data enrichment and transformation
   - External system integration
   - Audit trail and notifications

7. **mapping.examples.ts** - 10 ETL mapping examples
   - CSV and JSON imports
   - Data transformations (constant, lookup, map, split, join)
   - Export configurations
   - Complex multi-lookup scenarios
   - Migration use cases

8. **dataset.examples.ts** - 10 seed data examples
   - Reference data (countries, currencies)
   - System configuration
   - Demo and test data
   - Environment-specific datasets

## 🚀 Usage

```typescript
import {
  SimpleTextField,
  SimpleObject,
  SimpleSelectQuery,
  EqualityFilter,
  RequiredFieldValidation,
  SendNotificationHook,
  SimpleCsvImportMapping,
  CountryDataset,
} from '@objectstack/example-data';
```

## 🏗️ Building

```bash
npm run build
```

This compiles all TypeScript examples to JavaScript and generates type declarations.

## 📖 Example Structure

Each example follows this pattern:
- Descriptive constant name (e.g., `SimpleSalesCrmApp`)
- Comprehensive JSDoc comment explaining the use case
- Complete, valid example using proper schemas
- Realistic, practical scenarios (CRM, e-commerce, project management)

## 🎯 Use Cases

These examples are designed for:
- **Learning**: Understand ObjectStack Data Protocol patterns
- **Reference**: Copy-paste starting points for your own metadata
- **Testing**: Validate implementations against standard patterns
- **Documentation**: Illustrate best practices and conventions

## 📝 Naming Conventions

- **Configuration Keys**: camelCase (e.g., `maxLength`, `referenceFilters`)
- **Machine Names**: snake_case (e.g., `first_name`, `project_task`)
- **Example Constants**: PascalCase (e.g., `EmailField`, `ContactObject`)

## 🔗 Related

- [ObjectStack Spec](../../../packages/spec) - Core schema definitions
- [UI Examples](../../ui/metadata-examples) - UI Protocol examples
