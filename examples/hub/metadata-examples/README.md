# ObjectStack Hub Protocol Examples

This package contains comprehensive examples demonstrating all aspects of the ObjectStack Hub Protocol.

## 📚 What's Included

### Core Examples

1. **composer.examples.ts** - Package composition examples
   - Package definitions
   - Dependency management
   - Version constraints
   - Bundle configurations

2. **license.examples.ts** - License management examples
   - License types
   - Feature flags
   - Usage limits
   - Subscription tiers

3. **marketplace.examples.ts** - Marketplace examples
   - App listings
   - Package publishing
   - Ratings and reviews
   - Installation workflows

4. **space.examples.ts** - Workspace/space examples
   - Workspace isolation
   - Resource quotas
   - Collaboration settings
   - Environment configuration

5. **tenant.examples.ts** - Multi-tenant configuration examples
   - Tenant isolation
   - Data partitioning
   - Custom domains
   - Tenant-specific settings

## 🚀 Usage

```typescript
import {
  PackageComposition,
  EnterpriseLicense,
  MarketplaceApp,
  DevelopmentSpace,
  TenantConfiguration,
} from '@objectstack/example-hub';
```

## 🏗️ Building

```bash
npm run build
```

This compiles all TypeScript examples to JavaScript and generates type declarations.

## 📖 Example Structure

Each example follows this pattern:
- Descriptive constant name (e.g., `EnterpriseLicense`)
- Comprehensive JSDoc comment explaining the use case
- Complete, valid example using proper schemas
- Realistic, practical scenarios

## 🎯 Use Cases

These examples are designed for:
- **Learning**: Understand ObjectStack Hub Protocol patterns
- **Reference**: Copy-paste starting points for your own metadata
- **Testing**: Validate implementations against standard patterns
- **Documentation**: Illustrate best practices and conventions

## 📝 Naming Conventions

- **Configuration Keys**: camelCase (e.g., `packageName`, `maxUsers`)
- **Machine Names**: snake_case (e.g., `enterprise_license`, `dev_space`)
- **Example Constants**: PascalCase (e.g., `EnterpriseLicense`, `DevSpace`)

## 🔗 Related

- [ObjectStack Spec](../../../packages/spec) - Core schema definitions
- [Kernel Examples](../../kernel/metadata-examples) - Kernel Protocol examples
