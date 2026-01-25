# ObjectStack Kernel Protocol Examples

This package contains comprehensive examples demonstrating all aspects of the ObjectStack Kernel Protocol.

## 📚 What's Included

### Core Examples

1. **context.examples.ts** - Execution context examples
   - Request context
   - User context
   - Tenant context
   - Transaction scope

2. **logger.examples.ts** - Logging configuration examples
   - Log levels
   - Custom appenders
   - Structured logging
   - Log aggregation

3. **manifest.examples.ts** - Application manifest examples
   - Package metadata
   - Dependencies
   - Entry points
   - Configuration schema

4. **plugin.examples.ts** - Plugin system examples
   - Plugin registration
   - Lifecycle hooks
   - Extension points
   - Plugin configuration

5. **scoped-storage.examples.ts** - Scoped storage examples
   - Session storage
   - Request storage
   - Thread-local storage
   - Cache management

## 🚀 Usage

```typescript
import {
  RequestContext,
  StructuredLogger,
  AppManifest,
  CustomPlugin,
  SessionStorage,
} from '@objectstack/example-kernel';
```

## 🏗️ Building

```bash
npm run build
```

This compiles all TypeScript examples to JavaScript and generates type declarations.

## 📖 Example Structure

Each example follows this pattern:
- Descriptive constant name (e.g., `RequestContext`)
- Comprehensive JSDoc comment explaining the use case
- Complete, valid example using proper schemas
- Realistic, practical scenarios

## 🎯 Use Cases

These examples are designed for:
- **Learning**: Understand ObjectStack Kernel Protocol patterns
- **Reference**: Copy-paste starting points for your own metadata
- **Testing**: Validate implementations against standard patterns
- **Documentation**: Illustrate best practices and conventions

## 📝 Naming Conventions

- **Configuration Keys**: camelCase (e.g., `logLevel`, `pluginName`)
- **Machine Names**: snake_case (e.g., `app_logger`, `session_store`)
- **Example Constants**: PascalCase (e.g., `AppLogger`, `SessionStore`)

## 🔗 Related

- [ObjectStack Spec](../../../packages/spec) - Core schema definitions
- [System Examples](../../system/metadata-examples) - System Protocol examples
