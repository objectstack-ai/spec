# ObjectStack Builder: AI-Driven Development System

> **Status**: Planning & Design Phase  
> **Version**: 1.0.0  
> **Last Updated**: 2026-01-31

## Overview

The **ObjectStack Builder** is an AI-powered development system that automates the creation, iteration, and deployment of ObjectStack applications through intelligent metadata generation. By leveraging strict P0 protocol specifications, the system transforms natural language requirements into validated TypeScript configurations.

## Architecture

```
┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│   Architect  │───▶│   DevOps    │───▶│   Runtime    │
│   Agent      │    │   Runner    │    │   Engine     │
│   (Brain)    │    │(Hands/Feet) │    │   (Body)     │
└──────────────┘    └─────────────┘    └──────────────┘
       │                    │                   │
       ▼                    ▼                   ▼
  Generate             GitHub API         ObjectStack
  Metadata             Vercel API         Framework
```

### Three Core Components

1. **Architect Agent (Brain)**
   - Understands natural language requirements
   - Generates valid metadata configurations
   - Follows P0 specifications strictly
   - Self-validates against Zod schemas

2. **DevOps Runner (Hands/Feet)**
   - Automates Git operations (branches, commits, PRs)
   - Monitors deployment status (Vercel/GitHub Actions)
   - Implements self-healing on errors

3. **Runtime Engine (Body)**
   - Parses and validates metadata
   - Renders UI from configurations
   - Generates APIs automatically
   - Executes business logic

## Key Features

### ✨ Natural Language to Code

Describe what you want in plain English:

```
User: "Create an inventory system with products and warehouses"

AI Builder: Generated 2 objects with lookup relationship ✅
- warehouse.object.ts
- product.object.ts (with warehouse_id lookup)
```

### 🔄 Automated Workflow

- **Branch Creation**: Automatic feature branches
- **Git Commits**: Conventional commit messages
- **Pull Requests**: Comprehensive PR descriptions
- **CI/CD Integration**: Triggers deployment automatically

### 🔧 Self-Healing Deployments

When deployments fail, the system:
1. Reads error logs
2. Categorizes the issue
3. Generates a fix
4. Re-deploys automatically
5. Notifies on persistent failures

### ✅ Protocol Compliance

Strictly follows ObjectStack P0 specifications:
- **Object names**: `snake_case`
- **Field names**: `snake_case`
- **Property keys**: `camelCase`
- **Formula syntax**: Excel-like (not JavaScript)
- **Validation**: Zod schema compliance

## Development Roadmap

### V1: Read-Only Mode (Weeks 1-4)
- Repository analysis
- Documentation Q&A
- Relationship discovery
- **Goal**: Validate AI understands protocols

### V2: Configuration Generator (Weeks 5-8)
- Metadata generation
- Code block output
- Manual copy-paste workflow
- **Goal**: Generate valid code

### V3: Git Integration (Weeks 9-12)
- Automated PR creation
- Branch management
- CI/CD integration
- **Goal**: Automate deployment workflow

### V4: Self-Healing (Weeks 13-16)
- Error detection
- Auto-fix generation
- Retry mechanisms
- **Goal**: Autonomous iteration

## Getting Started

### For Developers

1. **Read the AI Builder Prompt**
   - Location: `.github/prompts/ai-builder.prompt.md`
   - Understand P0 specifications
   - Learn coding patterns

2. **Review Examples**
   - Simple CRUD objects
   - Relationship patterns
   - Validation rules
   - Hook implementations

3. **Understand Protocols**
   - Object Definition: `packages/spec/src/data/object.zod.ts`
   - Field Types: `packages/spec/src/data/field.zod.ts`
   - Validation: `packages/spec/src/data/validation.zod.ts`
   - Hooks: `packages/spec/src/data/hook.zod.ts`

### For AI Agents

The AI Builder Prompt provides comprehensive guidance:

- **P0 Protocol Specifications** - All core rules
- **Field Type Catalog** - 45+ available types
- **Relationship Patterns** - lookup, master-detail, tree
- **Validation Syntax** - Excel-like formulas
- **Common Mistakes** - What to avoid
- **Code Templates** - Standard patterns

## Documentation

- **[Builder Workflow](./content/docs/ai/builder-workflow.mdx)** - Development lifecycle
- **[Technical Specification](./content/docs/ai/technical-specification.mdx)** - Detailed architecture (Coming soon)
- **[AI Builder Prompt](./.github/prompts/ai-builder.prompt.md)** - Agent configuration
- **[Architecture Guide](./ARCHITECTURE.md)** - System overview

## Examples

### Simple Product Catalog

**Input**: "Create a product catalog"

**Output**:
```typescript
export const Product: ServiceObject = {
  name: 'product',
  label: 'Product',
  fields: {
    name: { type: 'text', required: true },
    sku: { type: 'text', unique: true },
    price: { type: 'currency' },
    in_stock: { type: 'boolean', defaultValue: true }
  },
  enable: {
    searchable: true,
    apiEnabled: true
  }
};
```

### Order with Line Items

**Input**: "Order system with customer and line items"

**Output**: Generates 3 objects:
1. `customer.object.ts` - Base customer data
2. `order.object.ts` - Order with customer lookup
3. `order_item.object.ts` - Line items with master-detail

## Protocol Quick Reference

### Object Names
- ✅ `customer_order`
- ✅ `product_category`
- ❌ `CustomerOrder` (PascalCase)
- ❌ `customer-order` (kebab-case)

### Field Names
- ✅ `first_name`
- ✅ `order_total`
- ❌ `firstName` (camelCase)
- ❌ `OrderTotal` (PascalCase)

### Property Keys
- ✅ `maxLength`
- ✅ `defaultValue`
- ❌ `max_length` (snake_case)
- ❌ `MaxLength` (PascalCase)

### Formula Syntax
- ✅ `price > 0`
- ✅ `AND(active == true, end_date > TODAY())`
- ❌ `return price > 0;` (JavaScript)
- ❌ `price > 0 ? true : false` (Ternary operator)

## Best Practices

### For AI Agents

1. **Generate dependencies first** - Create referenced objects before lookups
2. **Use formulas for simple logic** - Reserve hooks for complex operations
3. **Validate rigorously** - Check against all Zod schemas
4. **Follow naming conventions** - snake_case/camelCase strictly
5. **Self-document** - Include clear descriptions and comments

### For Developers

1. **Review AI-generated PRs** - Always require human approval
2. **Test thoroughly** - Validate business logic works correctly
3. **Provide feedback** - Help AI learn from mistakes
4. **Monitor metrics** - Track success rates and error patterns
5. **Update knowledge base** - Add new patterns as learned

## Security Considerations

- **Code Review Required**: Never auto-merge to main
- **Secret Scanning**: Check for hardcoded credentials
- **Branch Protection**: Enforce protection rules
- **API Token Security**: Use GitHub Apps, rotate regularly
- **Webhook Verification**: Validate all webhook signatures

## Contributing

We welcome contributions to improve the ObjectStack Builder:

1. **Enhance Prompts**: Improve AI agent instructions
2. **Add Patterns**: Document new code generation patterns
3. **Fix Errors**: Improve error detection and fixing
4. **Update Docs**: Keep documentation current
5. **Share Learnings**: Document what works well

## Support

- **Documentation**: [https://docs.objectstack.ai](https://docs.objectstack.ai)
- **GitHub Issues**: [Report bugs or request features](https://github.com/objectstack-ai/spec/issues)
- **Discord**: Join our community for discussions

## License

The ObjectStack Builder is part of the ObjectStack Protocol specification.

- **License**: Apache 2.0
- **Copyright**: © 2026 ObjectStack

---

**Next Steps:**

1. Read the [AI Builder Prompt](./.github/prompts/ai-builder.prompt.md)
2. Review the [Builder Workflow](./content/docs/ai/builder-workflow.mdx)
3. Explore [example applications](./examples/)
4. Start with V1 (Read-Only Mode) implementation

---

Built with ❤️ by the ObjectStack Team
