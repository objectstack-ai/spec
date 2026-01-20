# ObjectStack Todo Example

A minimal example demonstrating the ObjectStack Protocol with a simple Task management application.

## 🎯 Purpose

This example serves as a **quick-start reference** for learning ObjectStack basics. It demonstrates:
- Simple object definition with essential field types
- Basic configuration using `objectstack.config.ts`
- Minimal setup to get started quickly

For a **comprehensive example** with advanced features (workflows, validations, multiple views, dashboards), see the **[CRM Example](../crm/)**.

## 📂 Structure

```
examples/todo/
├── src/
│   ├── domains/
│   │   └── todo/
│   │       └── task.object.ts       # Task object definition
│   └── client-test.ts               # Client SDK usage example
├── objectstack.config.ts            # Application manifest
└── README.md                        # This file
```

## 📋 Features Demonstrated

### Object Definition
- **Task Object** (`todo_task`) with essential and advanced field types

### Field Types Covered
- ✅ **Text** (`subject`) - Task title (required field)
- ✅ **Date** (`due_date`) - Due date tracking
- ✅ **Boolean** (`is_completed`) - Completion status with default value
- ✅ **Rating** (`priority`) - 3-star priority rating system
- ✅ **Color** (`category_color`) - Color picker with HEX format and preset colors
- ✅ **Code** (`code_snippet`) - JavaScript code editor with line numbers
- ✅ **Rich Text** (`notes`) - Formatted text with full editor capabilities

### Configuration Features
- Object capabilities: `apiEnabled`, `trackHistory`
- Custom icon (`check-square`)
- Name field configuration
- Commented action example showing future extensibility

## 💡 Usage

This package is part of the `examples` workspace. To build and verify:

```bash
# Install dependencies (from monorepo root)
pnpm install

# Build the example
pnpm --filter @objectstack/example-todo build

# Run type checking
pnpm --filter @objectstack/example-todo typecheck
```

## 📖 Learning Path

1. **Start Here** - Simple task object, basic configuration
2. **Next Step** - [CRM Example](../crm/) - Advanced features, workflows, validations, UI components
3. **Then** - [Official Documentation](../../content/docs/) - Complete protocol reference

## 🔗 Related Resources

- [Getting Started Guide](../../content/docs/guides/getting-started.mdx)
- [Object Schema Reference](../../packages/spec/src/data/object.zod.ts)
- [Field Types Reference](../../packages/spec/src/data/field.zod.ts)
- [CRM Example](../crm/README.md) - Full-featured reference implementation

## 📝 License

MIT
