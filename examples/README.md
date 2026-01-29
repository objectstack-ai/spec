# ObjectStack Examples

This directory contains examples demonstrating the ObjectStack Protocol and its ecosystem.

## 📚 Directory Structure

### 🎓 Learning Path

**Start Here:**
1. **[basic/](./basic/)** - Simple protocol examples
   - Stack definition with `defineStack()`
   - Basic Object and Field definitions
   - Capabilities configuration

2. **[todo/](./todo/)** - Minimal task management app
   - Simple object definition
   - Basic configuration

3. **[crm/](./crm/)** - Full-featured CRM application
   - All field types and features
   - Workflows, validations, and permissions
   - UI components, dashboards, and reports

### 🤖 AI & Intelligence

**AI Protocol Examples:**
- **[ai-sales/](./ai-sales/)** - AI-powered sales assistant
- **[ai-analyst/](./ai-analyst/)** - AI data analyst
- **[ai-codegen/](./ai-codegen/)** - AI code generation
- **[ai-support/](./ai-support/)** - AI customer support

### 🔧 Integration & Plugins

**Runtime Integration:**
- **[msw-react-crud/](./msw-react-crud/)** - React CRUD with Mock Service Worker
- **[plugin-bi/](./plugin-bi/)** - Business Intelligence plugin
- **[host/](./host/)** - Plugin host environment

## 🚀 Quick Start

### Prerequisites

Examples require the `@objectstack/spec` package to be built:

```bash
# From monorepo root
pnpm install
pnpm --filter @objectstack/spec build
```

### Run an Example

```bash
# Build a complete example project
pnpm --filter @objectstack/example-todo build

# Run type checking
pnpm --filter @objectstack/example-todo typecheck
```

### Use Basic Examples

The [basic/](./basic/) examples are TypeScript files that demonstrate protocols:

```bash
# Type check a basic example (requires @objectstack/spec built)
npx tsx examples/basic/stack-definition-example.ts
```

### Example Structure

Each example follows this structure:

```
example-name/
├── src/
│   ├── domains/          # Object definitions
│   ├── ui/              # UI configurations (optional)
│   └── server/          # Server setup (optional)
├── objectstack.config.ts # Stack definition
├── package.json
├── README.md
└── tsconfig.json
```

## 📖 Protocol Coverage

### Data Protocol (ObjectQL)
- ✅ **Objects & Fields** - [crm](./crm/), [todo](./todo/)
- ✅ **Validation Rules** - [crm](./crm/)
- ✅ **Workflows** - [crm](./crm/)
- ✅ **Hooks** - [crm](./crm/)

### UI Protocol (ObjectUI)
- ✅ **Apps & Navigation** - [crm](./crm/)
- ✅ **Views** (Grid, Kanban, Calendar, Gantt) - [crm](./crm/)
- ✅ **Dashboards** - [crm](./crm/)
- ✅ **Reports** - [crm](./crm/)
- ✅ **Actions** - [crm](./crm/)

### AI Protocol
- ✅ **Agents** - [ai-sales](./ai-sales/), [ai-analyst](./ai-analyst/)
- ✅ **RAG Pipeline** - [basic/ai-rag-example.ts](./basic/)
- ✅ **Orchestration** - [ai-codegen](./ai-codegen/)

### System Protocol (ObjectOS)
- ✅ **Manifest** - All examples
- ✅ **Capabilities** - [basic/capabilities-example.ts](./basic/)
- ✅ **Stack Definition** - [basic/stack-definition-example.ts](./basic/)

### API Protocol
- ✅ **REST API** - [crm](./crm/)
- ✅ **Discovery** - [basic/api-discovery-example.ts](./basic/)

### Auth Protocol
- ⏳ **Identity & Policy** - Coming soon
- ⏳ **RBAC** - Coming soon

### Automation Protocol
- ✅ **Workflows** - [crm](./crm/)
- ✅ **Flows** - [crm](./crm/)
- ⏳ **Approvals** - Coming soon

### Hub Protocol
- ⏳ **Marketplace** - Coming soon
- ⏳ **Multi-tenancy** - Coming soon

## 🔗 Related Resources

- **Documentation:**
  - [ObjectStack Documentation](../content/docs/)
  - [Protocol Reference](../packages/spec/)
  - [Architecture Overview](../content/docs/introduction/architecture.mdx)

- **Development:**
  - [Contributing Guide](../CONTRIBUTING.md)
  - [Development Setup](../CONTRIBUTING.md#development-setup)

- **Examples Navigation:**
  - Start: [Basic Examples](./basic/) → Learn protocols
  - Next: [Todo Example](./todo/) → Simple application
  - Advanced: [CRM Example](./crm/) → Full-featured app
  - AI: [AI Examples](./ai-sales/) → Intelligent features

## 📝 License

Apache 2.0 © ObjectStack
