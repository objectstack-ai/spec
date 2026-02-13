# @objectstack/plugin-security

Security Plugin for ObjectStack — RBAC, Row-Level Security (RLS), and Field-Level Security runtime.

## Features

- **RBAC Permission Evaluator**: Checks object-level CRUD permissions per user role with most-permissive merging across multiple roles.
- **Row-Level Security (RLS)**: Compiles RLS policy expressions into ObjectQL query filters, automatically injected into all read operations.
- **Field-Level Masking**: Strips non-readable fields from query results and identifies non-editable fields.
- **ObjectQL Middleware Integration**: Hooks into the ObjectQL pipeline to enforce security transparently on every operation.
- **System Bypass**: System-level operations skip security checks for internal workflows.

## Usage

```typescript
import { SecurityPlugin } from '@objectstack/plugin-security';
import { ObjectKernel } from '@objectstack/core';

const kernel = new ObjectKernel({
  plugins: [
    new SecurityPlugin(),
  ],
});
```

### Exported Components

```typescript
import {
  SecurityPlugin,
  PermissionEvaluator,
  RLSCompiler,
  FieldMasker,
} from '@objectstack/plugin-security';
```

## Architecture

The plugin registers three core services and executes a 4-step security chain on every data operation:

1. **Resolve Permission Sets** — Match user roles to permission set definitions from metadata.
2. **Check Object Permissions** — Validate CRUD access (`allowRead`, `allowCreate`, `allowEdit`, `allowDelete`).
3. **Inject RLS Filters** — Compile row-level policy expressions and merge them into the query.
4. **Mask Fields** — Remove restricted fields from results based on field-level permissions.

## License

Apache-2.0 © ObjectStack
