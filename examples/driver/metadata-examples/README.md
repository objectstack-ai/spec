# ObjectStack Driver Protocol Examples

This package contains comprehensive examples demonstrating all aspects of the ObjectStack Driver Protocol.

## 📚 What's Included

### Core Examples

1. **datasource.examples.ts** - Data source configuration examples
   - Database connections
   - External APIs
   - File systems
   - Cloud storage

2. **driver.examples.ts** - Driver implementation examples
   - SQL drivers
   - NoSQL drivers
   - REST API drivers
   - Custom drivers
   - Driver capabilities

3. **mongo.examples.ts** - MongoDB-specific examples
   - Connection strings
   - Collection mapping
   - Index definitions
   - Aggregation pipelines

4. **postgres.examples.ts** - PostgreSQL-specific examples
   - Connection pooling
   - Schema mapping
   - Constraint definitions
   - Query optimization

## 🚀 Usage

```typescript
import {
  PostgresDataSource,
  MongoDataSource,
  SqlDriver,
  MongoDriver,
} from '@objectstack/example-driver';
```

## 🏗️ Building

```bash
npm run build
```

This compiles all TypeScript examples to JavaScript and generates type declarations.

## 📖 Example Structure

Each example follows this pattern:
- Descriptive constant name (e.g., `PostgresDataSource`)
- Comprehensive JSDoc comment explaining the use case
- Complete, valid example using proper schemas
- Realistic, practical scenarios

## 🎯 Use Cases

These examples are designed for:
- **Learning**: Understand ObjectStack Driver Protocol patterns
- **Reference**: Copy-paste starting points for your own metadata
- **Testing**: Validate implementations against standard patterns
- **Documentation**: Illustrate best practices and conventions

## 📝 Naming Conventions

- **Configuration Keys**: camelCase (e.g., `connectionString`, `poolSize`)
- **Machine Names**: snake_case (e.g., `postgres_main`, `mongo_cache`)
- **Example Constants**: PascalCase (e.g., `PostgresMain`, `MongoCache`)

## 🔗 Related

- [ObjectStack Spec](../../../packages/spec) - Core schema definitions
- [Data Examples](../../data/metadata-examples) - Data Protocol examples
