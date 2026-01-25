# ObjectStack Automation Protocol Examples

This package contains comprehensive examples demonstrating all aspects of the ObjectStack Automation Protocol.

## 📚 What's Included

### Core Examples

1. **flow.examples.ts** - Flow automation examples
   - Auto-launched flows
   - Screen flows
   - Scheduled flows
   - Flow variables and actions

2. **workflow.examples.ts** - Workflow rule examples
   - Record-triggered workflows
   - Field update actions
   - Email alerts
   - Task creation
   - State machine workflows

3. **webhook.examples.ts** - Webhook configuration examples
   - Outbound webhooks
   - Event triggers
   - Payload templates
   - Authentication methods

## 🚀 Usage

```typescript
import {
  SimpleScreenFlow,
  RecordTriggeredWorkflow,
  OutboundWebhook,
} from '@objectstack/example-automation';
```

## 🏗️ Building

```bash
npm run build
```

This compiles all TypeScript examples to JavaScript and generates type declarations.

## 📖 Example Structure

Each example follows this pattern:
- Descriptive constant name (e.g., `SimpleScreenFlow`)
- Comprehensive JSDoc comment explaining the use case
- Complete, valid example using proper schemas
- Realistic, practical scenarios

## 🎯 Use Cases

These examples are designed for:
- **Learning**: Understand ObjectStack Automation Protocol patterns
- **Reference**: Copy-paste starting points for your own metadata
- **Testing**: Validate implementations against standard patterns
- **Documentation**: Illustrate best practices and conventions

## 📝 Naming Conventions

- **Configuration Keys**: camelCase (e.g., `maxLength`, `flowType`)
- **Machine Names**: snake_case (e.g., `approval_flow`, `task_workflow`)
- **Example Constants**: PascalCase (e.g., `ApprovalFlow`, `TaskWorkflow`)

## 🔗 Related

- [ObjectStack Spec](../../../packages/spec) - Core schema definitions
- [Data Examples](../../data/metadata-examples) - Data Protocol examples
