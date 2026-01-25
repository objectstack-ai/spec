# ObjectStack Permission Protocol Examples

This package contains comprehensive examples demonstrating all aspects of the ObjectStack Permission Protocol.

## 📚 What's Included

### Core Examples

1. **permission.examples.ts** - Permission rule examples
   - Object-level permissions
   - Field-level permissions
   - Record-level permissions
   - Permission sets
   - Profile permissions

2. **sharing.examples.ts** - Sharing rule examples
   - Organization-wide defaults
   - Role-based sharing
   - Criteria-based sharing
   - Manual sharing
   - Team sharing

3. **territory.examples.ts** - Territory management examples
   - Territory hierarchies
   - Territory assignment rules
   - Territory-based access
   - Territory forecasting

## 🚀 Usage

```typescript
import {
  ObjectPermission,
  FieldLevelSecurity,
  SharingRule,
  TerritoryHierarchy,
} from '@objectstack/example-permission';
```

## 🏗️ Building

```bash
npm run build
```

This compiles all TypeScript examples to JavaScript and generates type declarations.

## 📖 Example Structure

Each example follows this pattern:
- Descriptive constant name (e.g., `ObjectPermission`)
- Comprehensive JSDoc comment explaining the use case
- Complete, valid example using proper schemas
- Realistic, practical scenarios

## 🎯 Use Cases

These examples are designed for:
- **Learning**: Understand ObjectStack Permission Protocol patterns
- **Reference**: Copy-paste starting points for your own metadata
- **Testing**: Validate implementations against standard patterns
- **Documentation**: Illustrate best practices and conventions

## 📝 Naming Conventions

- **Configuration Keys**: camelCase (e.g., `allowRead`, `allowWrite`)
- **Machine Names**: snake_case (e.g., `sales_territory`, `account_sharing`)
- **Example Constants**: PascalCase (e.g., `SalesTerritory`, `AccountSharing`)

## 🔗 Related

- [ObjectStack Spec](../../../packages/spec) - Core schema definitions
- [Auth Examples](../../auth/metadata-examples) - Auth Protocol examples
