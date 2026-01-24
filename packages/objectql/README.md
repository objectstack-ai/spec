# ObjectQL Engine

**ObjectQL** is a schema-driven, cross-datasource query engine for the [ObjectStack](https://github.com/steedos/objectstack) ecosystem. It acts as a virtual "Meta-Database" that unifies access to SQL, NoSQL, and API data sources under a single semantic layer.

## Features

- **Protocol Agnostic**: Uses standard `ObjectSchema` and `QueryAST` from `@objectstack/spec`.
- **Cross-Datasource**: Routes queries to the correct driver (Postgres, MongoDB, Redis, etc.) based on Object definition.
- **Unified API**: Single `find`, `insert`, `update`, `delete` API regardless of the underlying storage.
- **Plugin System**: Load objects and logic via standard Manifests.
- **Middleware**: (Planned) Support for Hooks and Validators.

## Usage

```typescript
import { ObjectQL } from '@objectstack/objectql';
import { MemoryDriver } from '@objectstack/driver-memory'; // Example driver

async function main() {
  // 1. Initialize Engine
  const ql = new ObjectQL();

  // 2. Register Drivers
  const memDriver = new MemoryDriver({ name: 'default' });
  ql.registerDriver(memDriver, true);

  // 3. Load Schema (via Plugin/Manifest)
  await ql.use({
    name: 'my-app',
    objects: [
      {
        name: 'todo',
        fields: {
          title: { type: 'text' },
          completed: { type: 'boolean' }
        },
        datasource: 'default'
      }
    ]
  });

  await ql.init();

  // 4. Execute Queries
  // Insert
  await ql.insert('todo', { title: 'Buy Milk', completed: false });

  // Find (Simple)
  const todos = await ql.find('todo', { completed: false });

  // Find (Advanced AST)
  const results = await ql.find('todo', {
    where: { 
      title: { $contains: 'Milk' } 
    },
    limit: 10,
    orderBy: [{ field: 'title', order: 'desc' }]
  });

  console.log(results);
}
```

## Architecture

- **SchemaRegistry**: Central store for all metadata (Objects, Apps, Config).
- **DriverRegistry**: Manages connections to physical data sources.
- **QueryPlanner**: (Internal) Normalizes simplified queries into `QueryAST`.
- **Executor**: Routes AST to the correct driver.

## Roadmap

- [x] Basic CRUD
- [x] Driver Routing
- [ ] Cross-Object Joins (Federation)
- [ ] Validation Layer (Zod)
- [ ] Access Control (ACL)
- [ ] Caching Layer
