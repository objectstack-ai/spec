# Contributing to ObjectStack Protocol

Thank you for your interest in contributing to ObjectStack! This guide will help you get started with contributing to the protocol specifications.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Contribution Types](#contribution-types)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Guidelines](#documentation-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **PNPM** >= 8.0.0
- **Git** >= 2.0.0

### Initial Setup

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/spec.git
cd spec

# 3. Add upstream remote
git remote add upstream https://github.com/objectstack-ai/spec.git

# 4. Install dependencies
pnpm install

# 5. Build the project
pnpm build

# 6. Run tests
pnpm test
```

## Development Workflow

### 1. Choose What to Work On

Before starting, review:
- **[PRIORITIES.md](./internal/planning/PRIORITIES.md)** - Current sprint priorities
- **[DEVELOPMENT_ROADMAP.md](./internal/planning/DEVELOPMENT_ROADMAP.md)** - Long-term roadmap
- **[GitHub Issues](https://github.com/objectstack-ai/spec/issues)** - Open issues

### 2. Create a Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Your Changes

Follow the [Coding Standards](#coding-standards) and ensure:
- Changes are minimal and focused
- Code follows existing patterns
- Tests are added/updated
- Documentation is updated

### 4. Test Your Changes

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @objectstack/spec test

# Build to verify schemas
pnpm build
```

### 5. Submit Your Changes

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add new field type for encrypted data"

# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

## Contribution Types

### 🔧 Protocol Definitions

Adding or modifying protocol definitions in `packages/spec/src/`:

1. **Create Zod Schema** - Always start here
2. **Add JSDoc Comments** - Document with `@description`
3. **Write Tests** - Target 80%+ coverage
4. **Generate Schemas** - Run `pnpm build`
5. **Create Documentation** - Add MDX in `content/docs/references/`

Example:
```typescript
/**
 * Represents an encrypted field for storing sensitive data
 * @description Provides end-to-end encryption for sensitive information
 */
export const EncryptedFieldSchema = z.object({
  /** Field type identifier */
  type: z.literal('encrypted'),
  
  /** Encryption algorithm (default: AES-256-GCM) */
  algorithm: z.enum(['aes-256-gcm', 'rsa-4096']).default('aes-256-gcm'),
  
  /** Key management strategy */
  keyManagement: z.enum(['user', 'organization', 'system']).default('organization'),
});
```

### 📚 Documentation

- **Concepts** - High-level explanations in `content/docs/concepts/`
- **Guides** - How-to tutorials in `content/docs/guides/`
- **References** - API documentation in `content/docs/references/`
- **Specifications** - Protocol specs in `content/docs/specifications/`

### 🐛 Bug Fixes

1. Create an issue describing the bug (if not exists)
2. Reference the issue in your PR
3. Add regression tests
4. Update documentation if behavior changes

### ✨ Examples

Add working examples in `examples/`:
- Include `README.md` with setup instructions
- Provide `objectstack.config.ts` configuration
- Add `CHANGELOG.md` for version history

## Coding Standards

### Naming Conventions

**CRITICAL**: Follow these naming conventions strictly to ensure cross-platform compatibility, URL-friendliness, and security.

#### 1. Configuration Keys (TypeScript Properties)
**Always use `camelCase`** for schema property names:
```typescript
{
  maxLength: 100,
  referenceFilters: ['active'],
  defaultValue: 'none',
  isRequired: true,
}
```

#### 2. Machine Identifiers (API Names / Stored Values)
**Always use lowercase `snake_case`** for all machine identifiers. These are values that:
- Get stored in databases
- Are used in API endpoints
- Act as configuration keys
- Are transmitted over networks

**What requires snake_case:**
- Object names (tables/collections): `'crm_account'`, `'project_task'`
- Field names: `'first_name'`, `'annual_revenue'`
- Role names: `'sales_manager'`, `'system_admin'`
- Permission set names: `'read_only'`, `'standard_user'`
- Action/trigger names: `'on_close_deal'`, `'send_welcome_email'`
- App IDs: `'app_crm'`, `'app_finance'`
- Page/menu IDs: `'page_dashboard'`, `'menu_settings'`
- Select option values: `'in_progress'`, `'closed_won'`
- Workflow/webhook names: `'approve_contract'`, `'sync_to_external'`

```typescript
{
  name: 'project_task',      // Object name
  object: 'crm_account',     // Reference
  field: 'first_name',       // Field name
  role: 'sales_manager',     // Role
  value: 'in_progress',      // Select option value
}
```

**Why lowercase snake_case?**
- **Cross-platform compatibility**: Avoids issues with case-insensitive filesystems
- **URL-friendly**: No encoding needed for web addresses
- **Database consistency**: Eliminates collation and case-sensitivity issues
- **Security**: Prevents case-sensitivity bugs in permission checks
- **Standard practice**: Aligns with PostgreSQL, REST API, and Kafka conventions

#### 3. Event Names
**Use `dot.notation`** for event names to provide namespacing:
```typescript
{
  name: 'user.created',          // User creation event
  name: 'order.paid',            // Order payment event
  name: 'user.login_success',    // Login success
  name: 'alarm.high_cpu',        // System alarm
}
```

This follows message queue and event bus conventions (Kafka, RabbitMQ, etc.).

#### 4. Labels (Display Text)
**Use any case** for user-facing labels:
```typescript
{
  name: 'sales_manager',        // Machine identifier (snake_case)
  label: 'Sales Manager',       // Display label (Title Case)
}

{
  value: 'in_progress',         // Machine value (snake_case)
  label: 'In Progress',         // Display label (Title Case)
}
```

#### Complete Naming Convention Reference

| Type | Pattern | Example | Usage |
|------|---------|---------|-------|
| **Schema Properties** | `camelCase` | `maxLength`, `isRequired` | TypeScript interface properties |
| **Machine Identifiers** | `snake_case` | `crm_account`, `first_name` | All API names, stored values |
| **Event Names** | `dot.notation` | `user.created`, `order.paid` | Event keys, message topics |
| **Labels** | `Any Case` | `Sales Manager`, `In Progress` | User-facing display text |
| **Class Names** | `PascalCase` | `AccountService`, `UserComponent` | TypeScript/JavaScript classes |
| **Variables** | `camelCase` | `accountList`, `isValid` | Code variables |

#### Implementation Reference

See these schema files for the implementation:
- `packages/spec/src/shared/identifiers.zod.ts` - Identifier validation schemas
- `SystemIdentifierSchema` - Allows underscores and dots
- `SnakeCaseIdentifierSchema` - Strict snake_case (underscores only)
- `EventNameSchema` - Event names with dot notation

### Schema Definition Pattern

```typescript
import { z } from 'zod';

/**
 * Schema description
 * @description Detailed explanation
 */
export const MySchema = z.object({
  /** Property description */
  propertyName: z.string().describe('Property description'),
  
  /** Another property */
  anotherProperty: z.number().optional().describe('Optional property'),
});

export type MyType = z.infer<typeof MySchema>;
```

### File Organization

```
packages/spec/src/
├── data/           # ObjectQL - Data Protocol
│   ├── field.zod.ts
│   ├── object.zod.ts
│   └── validation.zod.ts
├── ui/             # ObjectUI - UI Protocol
│   ├── app.zod.ts
│   ├── view.zod.ts
│   └── theme.zod.ts
├── system/         # ObjectOS - System Protocol
│   ├── manifest.zod.ts
│   ├── plugin.zod.ts
│   └── driver.zod.ts
├── ai/             # AI Protocol
│   ├── agent.zod.ts
│   └── model.zod.ts
└── api/            # API Protocol
    ├── envelopes.zod.ts
    └── requests.zod.ts
```

## Testing Guidelines

### Test Coverage

- **Target**: 80%+ code coverage
- **Location**: Co-located `*.test.ts` files
- **Framework**: Vitest

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { MySchema } from './my-schema.zod';

describe('MySchema', () => {
  describe('validation', () => {
    it('should accept valid data', () => {
      const result = MySchema.safeParse({
        propertyName: 'valid value',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid data', () => {
      const result = MySchema.safeParse({
        propertyName: 123, // wrong type
      });
      expect(result.success).toBe(false);
    });
  });

  describe('type inference', () => {
    it('should infer correct TypeScript types', () => {
      type MyType = z.infer<typeof MySchema>;
      const data: MyType = {
        propertyName: 'value',
      };
      expect(data.propertyName).toBe('value');
    });
  });
});
```

## Documentation Guidelines

### MDX Documentation

Create documentation in `content/docs/references/` matching the source structure:

```markdown
---
title: MySchema
description: Schema description for SEO and navigation
---

# MySchema

Brief description of what this schema represents.

## Overview

Detailed explanation of the schema's purpose and use cases.

## Schema Definition

\`\`\`typescript
import { MySchema } from '@objectstack/spec';

const config = {
  propertyName: 'value',
};

const validated = MySchema.parse(config);
\`\`\`

## Properties

### propertyName

- **Type**: `string`
- **Required**: Yes
- **Description**: Description of this property

## Examples

### Basic Usage

\`\`\`typescript
const basic = {
  propertyName: 'simple value',
};
\`\`\`

### Advanced Usage

\`\`\`typescript
const advanced = {
  propertyName: 'complex value',
  anotherProperty: 42,
};
\`\`\`

## Related

- [RelatedSchema](./related-schema)
- [AnotherSchema](./another-schema)
```

### Bilingual Support

Provide both English and Chinese versions:
- English: `my-schema.mdx`
- Chinese: `my-schema.cn.mdx`

## Pull Request Process

### Before Submitting

- [ ] All tests pass (`pnpm test`)
- [ ] Code builds successfully (`pnpm build`)
- [ ] Documentation is updated
- [ ] Naming conventions are followed
- [ ] JSDoc comments are complete
- [ ] No unrelated changes included

### PR Checklist

Use this template for your PR description:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Item 1
- Item 2

## Testing
- [ ] Unit tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Documentation
- [ ] JSDoc comments added
- [ ] MDX documentation created/updated
- [ ] Examples provided

## Checklist
- [ ] Zod schema follows naming conventions
- [ ] Comprehensive JSDoc comments with @description
- [ ] Unit tests with 80%+ coverage
- [ ] Documentation with examples
- [ ] JSON schema generated successfully
- [ ] All existing tests pass
```

### Review Process

1. **Automated Checks** - CI/CD runs tests and builds
2. **Code Review** - Maintainers review your code
3. **Feedback** - Address review comments
4. **Approval** - At least one maintainer approval required
5. **Merge** - Maintainers will merge when ready

## Community

### Communication Channels

- **GitHub Discussions** - General questions and discussions
- **GitHub Issues** - Bug reports and feature requests
- **Pull Requests** - Code contributions

### Getting Help

- Review [PLANNING_INDEX.md](./internal/planning/PLANNING_INDEX.md) for documentation navigation
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Read [QUICK_START_IMPLEMENTATION.md](./QUICK_START_IMPLEMENTATION.md) for implementation examples

### Recognition

Contributors will be:
- Listed in release notes
- Mentioned in the CHANGELOG
- Credited in documentation (where applicable)

## License

By contributing, you agree that your contributions will be licensed under the Apache 2.0 License.

---

**Questions?** Open a [GitHub Discussion](https://github.com/objectstack-ai/spec/discussions)

**Need Help?** Check the [documentation](./content/docs/) or ask in discussions

**Thank you for contributing to ObjectStack! 🚀**
