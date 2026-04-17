# @objectstack/plugin-security

> Security plugin for ObjectStack — RBAC, Row-Level Security (RLS), and Field-Level Masking enforced transparently through the ObjectQL middleware chain.

[![npm](https://img.shields.io/npm/v/@objectstack/plugin-security.svg)](https://www.npmjs.com/package/@objectstack/plugin-security)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

`plugin-security` hooks into the ObjectQL pipeline and applies authorization on every read and write:

1. **Resolve permission sets** — match user roles against `SysPermissionSet` metadata.
2. **Check object CRUD** — `allowRead`, `allowCreate`, `allowEdit`, `allowDelete`.
3. **Inject RLS** — compile row-level policy expressions into query filters.
4. **Mask fields** — remove non-readable fields from results; flag non-editable fields on writes.

System-context operations bypass checks so internal jobs, migrations, and seed scripts work unobstructed.

## Installation

```bash
pnpm add @objectstack/plugin-security
```

## Quick Start

```typescript
import { ObjectKernel } from '@objectstack/core';
import { SecurityPlugin } from '@objectstack/plugin-security';

const kernel = new ObjectKernel();
kernel.use(new SecurityPlugin());
await kernel.bootstrap();
```

## Key Exports

| Export | Kind | Description |
|:---|:---|:---|
| `SecurityPlugin` | class | Kernel plugin that installs the four-step security chain. |
| `PermissionEvaluator` | class | Evaluates object-level CRUD permissions across roles (most-permissive merge). |
| `RLSCompiler` | class | Compiles RLS expressions into ObjectQL filter AST. |
| `FieldMasker` | class | Strips non-readable fields and identifies non-editable ones. |
| `SysRole`, `SysPermissionSet` | objects | Metadata objects registered by the plugin. |

## System objects

The plugin contributes these system objects to the kernel:

| Object | Purpose |
|:---|:---|
| `sys_role` | User role definitions. |
| `sys_permission_set` | Bundles object and field permissions; can include RLS expressions. |

Assignment tables (role ↔ user, role ↔ permission_set) are provided by [`@objectstack/plugin-auth`](../plugin-auth) when used together.

## RLS expression language

RLS policies are authored in the same expression language as object validations. Example:

```json
{
  "object": "project_task",
  "read": "owner_id = $user.id OR team_id in $user.team_ids"
}
```

Compilation output is a filter AST merged into every query's `where` clause, so drivers see it as a normal filter.

## When to use

- ✅ Any multi-user deployment.
- ✅ Enforcing tenant isolation (combine with [`@objectstack/service-tenant`](../../services/service-tenant)).

## When not to use

- ❌ Trusted single-user CLI scripts — disable per-request via the system context.

## Related Packages

- [`@objectstack/plugin-auth`](../plugin-auth) — authentication and user resolution.
- [`@objectstack/plugin-audit`](../plugin-audit) — pairs with security for full compliance trails.
- [`@objectstack/objectql`](../../objectql) — query engine.

## Links

- 📖 Docs: <https://objectstack.ai/docs>
- 📚 API Reference: <https://objectstack.ai/docs/references/security>

## License

Apache-2.0 © ObjectStack
