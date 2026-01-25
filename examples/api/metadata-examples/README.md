# ObjectStack API Protocol Examples

This package contains comprehensive examples demonstrating all aspects of the ObjectStack API Protocol.

## 📚 What's Included

### Core Examples

1. **contract.examples.ts** - API contract examples
   - REST API contracts
   - GraphQL schemas
   - Request/response definitions
   - Versioning strategies

2. **discovery.examples.ts** - API discovery examples
   - Service discovery
   - Endpoint registration
   - Health checks
   - API catalogs

3. **endpoint.examples.ts** - API endpoint examples
   - RESTful endpoints
   - Custom actions
   - Batch operations
   - File uploads

4. **realtime.examples.ts** - Realtime communication examples
   - WebSocket connections
   - Server-sent events
   - Push notifications
   - Event streaming

5. **router.examples.ts** - API routing examples
   - Route definitions
   - Middleware configuration
   - Request validation
   - Response transformation

## 🚀 Usage

```typescript
import {
  RestApiContract,
  ServiceDiscovery,
  CustomEndpoint,
  WebSocketConnection,
  ApiRouter,
} from '@objectstack/example-api';
```

## 🏗️ Building

```bash
npm run build
```

This compiles all TypeScript examples to JavaScript and generates type declarations.

## 📖 Example Structure

Each example follows this pattern:
- Descriptive constant name (e.g., `RestApiContract`)
- Comprehensive JSDoc comment explaining the use case
- Complete, valid example using proper schemas
- Realistic, practical scenarios

## 🎯 Use Cases

These examples are designed for:
- **Learning**: Understand ObjectStack API Protocol patterns
- **Reference**: Copy-paste starting points for your own metadata
- **Testing**: Validate implementations against standard patterns
- **Documentation**: Illustrate best practices and conventions

## 📝 Naming Conventions

- **Configuration Keys**: camelCase (e.g., `basePath`, `apiVersion`)
- **Machine Names**: snake_case (e.g., `customer_api`, `webhook_endpoint`)
- **Example Constants**: PascalCase (e.g., `CustomerAPI`, `WebhookEndpoint`)

## 🔗 Related

- [ObjectStack Spec](../../../packages/spec) - Core schema definitions
- [Data Examples](../../data/metadata-examples) - Data Protocol examples
