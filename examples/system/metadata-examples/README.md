# ObjectStack System Protocol Examples

This package contains comprehensive examples demonstrating all aspects of the ObjectStack System Protocol.

## 📚 What's Included

### Core Examples

1. **audit.examples.ts** - Audit trail examples
   - Record changes
   - Field history
   - User actions
   - Compliance tracking
   - Audit reports

2. **events.examples.ts** - Event system examples
   - Platform events
   - Custom events
   - Event subscriptions
   - Event buses
   - Event replay

3. **job.examples.ts** - Background job examples
   - Scheduled jobs
   - Async processing
   - Batch jobs
   - Queue management
   - Job monitoring

4. **translation.examples.ts** - Internationalization examples
   - Multi-language support
   - Custom translations
   - Translation files
   - Language detection
   - RTL support

## 🚀 Usage

```typescript
import {
  AuditTrail,
  PlatformEvent,
  ScheduledJob,
  TranslationSet,
} from '@objectstack/example-system';
```

## 🏗️ Building

```bash
npm run build
```

This compiles all TypeScript examples to JavaScript and generates type declarations.

## 📖 Example Structure

Each example follows this pattern:
- Descriptive constant name (e.g., `AuditTrail`)
- Comprehensive JSDoc comment explaining the use case
- Complete, valid example using proper schemas
- Realistic, practical scenarios

## 🎯 Use Cases

These examples are designed for:
- **Learning**: Understand ObjectStack System Protocol patterns
- **Reference**: Copy-paste starting points for your own metadata
- **Testing**: Validate implementations against standard patterns
- **Documentation**: Illustrate best practices and conventions

## 📝 Naming Conventions

- **Configuration Keys**: camelCase (e.g., `eventType`, `jobSchedule`)
- **Machine Names**: snake_case (e.g., `audit_log`, `data_sync_job`)
- **Example Constants**: PascalCase (e.g., `AuditLog`, `DataSyncJob`)

## 🔗 Related

- [ObjectStack Spec](../../../packages/spec) - Core schema definitions
- [Kernel Examples](../../kernel/metadata-examples) - Kernel Protocol examples
