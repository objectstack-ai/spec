# ObjectQL Engine

**ObjectQL** is a schema-driven, cross-datasource query engine for the [ObjectStack](https://github.com/steedos/objectstack) ecosystem. It acts as a virtual "Meta-Database" that unifies access to SQL, NoSQL, and API data sources under a single semantic layer.

## Features

- **Protocol Agnostic**: Uses standard `ObjectSchema` and `QueryAST` from `@objectstack/spec`.
- **Cross-Datasource**: Routes queries to the correct driver (Postgres, MongoDB, Redis, etc.) based on Object definition.
- **Unified API**: Single `find`, `insert`, `update`, `delete` API regardless of the underlying storage.
- **Plugin System**: Load objects and logic via standard Manifests.
- **Middleware**: (Planned) Support for Hooks and Validators.

## 🤖 AI Development Context

**Role**: Data Engine / Query Layer
**Usage**:
- Use this package to execute data operations (`find`, `insert`).
- Do NOT bypass this layer to access drivers directly unless building a driver.
- This is the "Backend Brain" for data.

**Key Concepts**:
- `SchemaRegistry`: Holds all object definitions.
- `ObjectQL`: The main facade.
- `Driver`: Interface for storage adapters.

## Usage

### 1. Standalone Usage

```typescript
import { ObjectQL } from '@objectstack/objectql';
import { InMemoryDriver } from '@objectstack/driver-memory'; // Note: Package name might export InMemoryDriver now

async function main() {
  // 1. Initialize Engine
  const ql = new ObjectQL();

  // 2. Register Drivers
  const memDriver = new InMemoryDriver({ name: 'default' });
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

### 2. Using with ObjectKernel (Recommended)

When building full applications, use the `ObjectKernel` to manage plugins and configuration.

```typescript
import { ObjectKernel } from '@objectstack/core';
import { DriverPlugin } from '@objectstack/runtime';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { InMemoryDriver } from '@objectstack/driver-memory';

const kernel = new ObjectKernel();

// Register Engine and Drivers as Kernel Plugins
kernel.use(new ObjectQLPlugin())
      .use(new DriverPlugin(new InMemoryDriver(), 'default'));

await kernel.bootstrap();

// The engine automatically discovers drivers and apps registered in the kernel.
```

## Architecture

- **SchemaRegistry**: Central store for all metadata (Objects, Apps, Config).
- **DriverRegistry**: Manages connections to physical data sources.
- **QueryPlanner**: (Internal) Normalizes simplified queries into `QueryAST`.
- **Executor**: Routes AST to the correct driver.

## Advanced Examples

### Complex Queries

```typescript
// Filtering with multiple conditions
const activeTasks = await ql.find('todo_task', {
  where: {
    $and: [
      { status: 'active' },
      { priority: { $gte: 3 } },
      { due_date: { $lte: new Date() } }
    ]
  },
  orderBy: [
    { field: 'priority', order: 'desc' },
    { field: 'due_date', order: 'asc' }
  ],
  limit: 50
});

// Text search
const searchResults = await ql.find('todo_task', {
  where: {
    $or: [
      { title: { $contains: 'urgent' } },
      { description: { $contains: 'urgent' } }
    ]
  }
});

// Nested conditions
const complexQuery = await ql.find('project', {
  where: {
    $and: [
      { status: { $in: ['active', 'planning'] } },
      {
        $or: [
          { budget: { $gt: 100000 } },
          { priority: { $eq: 1 } }
        ]
      }
    ]
  }
});
```

### Batch Operations

```typescript
// Batch insert
const newTasks = [
  { title: 'Task 1', priority: 1 },
  { title: 'Task 2', priority: 2 },
  { title: 'Task 3', priority: 3 }
];

for (const task of newTasks) {
  await ql.insert('todo_task', task);
}

// Batch update
const tasksToUpdate = await ql.find('todo_task', {
  where: { status: 'pending' }
});

for (const task of tasksToUpdate) {
  await ql.update('todo_task', task.id, {
    status: 'in_progress',
    started_at: new Date()
  });
}
```

### Working with Relationships

```typescript
// One-to-Many: Get project with tasks
const project = await ql.find('project', {
  where: { id: 'proj_123' },
  include: ['tasks'] // Assumes 'tasks' is a relation field
});

// Many-to-One: Get task with project details
const task = await ql.find('todo_task', {
  where: { id: 'task_456' },
  include: ['project']
});

// Manual join (when driver doesn't support relations)
const tasks = await ql.find('todo_task', {
  where: { project_id: 'proj_123' }
});

const project = await ql.find('project', {
  where: { id: 'proj_123' }
});

const projectWithTasks = {
  ...project[0],
  tasks: tasks
};
```

### Aggregations

```typescript
// Count records
const totalTasks = await ql.count('todo_task', {
  where: { status: 'active' }
});

// Sum (if driver supports)
const totalBudget = await ql.aggregate('project', {
  operation: 'sum',
  field: 'budget',
  where: { status: 'active' }
});

// Group by (if driver supports)
const tasksByStatus = await ql.aggregate('todo_task', {
  operation: 'count',
  groupBy: ['status']
});
```

### Multi-Datasource Queries

```typescript
import { PostgresDriver } from '@objectstack/driver-postgres';
import { MongoDBDriver } from '@objectstack/driver-mongodb';
import { RedisDriver } from '@objectstack/driver-redis';

const ql = new ObjectQL();

// Register multiple drivers
const pgDriver = new PostgresDriver({ connectionString: 'postgres://...' });
const mongoDriver = new MongoDBDriver({ url: 'mongodb://...' });
const redisDriver = new RedisDriver({ host: 'localhost' });

ql.registerDriver(pgDriver, false, 'postgres');
ql.registerDriver(mongoDriver, false, 'mongodb');
ql.registerDriver(redisDriver, false, 'redis');

// Configure objects to use different datasources
await ql.use({
  name: 'multi-db-app',
  objects: [
    {
      name: 'user',
      datasource: 'postgres', // Users in PostgreSQL
      fields: { /* ... */ }
    },
    {
      name: 'product',
      datasource: 'mongodb', // Products in MongoDB
      fields: { /* ... */ }
    },
    {
      name: 'session',
      datasource: 'redis', // Sessions in Redis
      fields: { /* ... */ }
    }
  ]
});

await ql.init();

// Query automatically routes to correct datasource
const users = await ql.find('user');      // → PostgreSQL
const products = await ql.find('product'); // → MongoDB
const sessions = await ql.find('session'); // → Redis
```

### Custom Hooks and Middleware

```typescript
// Register hooks for data operations
ql.registerHook('beforeInsert', async (ctx) => {
  console.log(`Creating ${ctx.object}:`, ctx.data);
  
  // Add timestamps
  ctx.data.created_at = new Date();
  ctx.data.updated_at = new Date();
  
  // Validate
  if (ctx.object === 'user' && !ctx.data.email) {
    throw new Error('Email is required');
  }
});

ql.registerHook('afterInsert', async (ctx) => {
  console.log(`Created ${ctx.object}:`, ctx.result);
  
  // Trigger events - get event bus from kernel or context
  // Note: eventBus should be injected or accessed from context
  const eventBus = ctx.getService?.('event-bus');
  if (eventBus) {
    await eventBus.emit('data:created', {
      object: ctx.object,
      id: ctx.result.id
    });
  }
});

ql.registerHook('beforeUpdate', async (ctx) => {
  // Update timestamp
  ctx.data.updated_at = new Date();
});

ql.registerHook('beforeDelete', async (ctx) => {
  // Soft delete
  if (ctx.object === 'user') {
    throw new Error('Cannot delete users, use deactivate instead');
  }
});
```

### Transaction Support

```typescript
// If driver supports transactions
const driver = ql.getDriver('default');

if (driver.supports.transactions) {
  await driver.beginTransaction();
  
  try {
    await ql.insert('order', {
      customer_id: 'cust_123',
      total: 100.00
    });
    
    await ql.update('inventory', 'inv_456', {
      quantity: { $decrement: 1 }
    });
    
    await driver.commitTransaction();
  } catch (error) {
    await driver.rollbackTransaction();
    throw error;
  }
}
```

### Schema Migration

```typescript
// Add new field to existing object
const currentSchema = ql.getSchema('todo_task');

const updatedSchema = {
  ...currentSchema,
  fields: {
    ...currentSchema.fields,
    assignee: {
      type: 'lookup',
      reference: 'user',
      label: 'Assignee'
    }
  }
};

// Re-register schema
ql.registerObject(updatedSchema);

// Driver might need to sync schema
const driver = ql.getDriver('default');
if (driver.syncSchema) {
  await driver.syncSchema('todo_task', updatedSchema);
}
```

## Roadmap

- [x] Basic CRUD
- [x] Driver Routing
- [ ] Cross-Object Joins (Federation)
- [ ] Validation Layer (Zod)
- [ ] Access Control (ACL)
- [ ] Caching Layer
