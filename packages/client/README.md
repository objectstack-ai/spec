# @objectstack/client

The official TypeScript client for ObjectStack.

## Features

- **Auto-Discovery**: Connects to your ObjectStack server and automatically configures API endpoints.
- **Typed Metadata**: Retrieve Object and View definitions with full type support.
- **Unified Data Access**: Simple CRUD operations for any object in your schema.

## Installation

```bash
pnpm add @objectstack/client
```

## Usage

```typescript
import { ObjectStackClient } from '@objectstack/client';

// 1. Initialize
const client = new ObjectStackClient({
  baseUrl: 'http://localhost:3004', // Your ObjectStack Server URL
  token: 'optional-auth-token'
});

async function main() {
  // 2. Connect (Fetches system capabilities)
  await client.connect();

  // 3. Metadata Access
  const todoSchema = await client.meta.getObject('todo_task');
  console.log('Fields:', todoSchema.fields);

  // 4. Advanced Query
  const tasks = await client.data.find<{ subject: string; priority: number }>('todo_task', {
    select: ['subject', 'priority'], // Field Selection
    filters: ['priority', '>=', 2],  // ObjectStack Filter AST
    sort: ['-priority'],             // Sorting
    top: 10
  });
  
  // 5. Create Data
  const newTask = await client.data.create('todo_task', {
    subject: 'New Task',
    priority: 1
  });

  // 6. Batch Operations
  await client.data.deleteMany('todo_task', ['id1', 'id2']);
}
```

## API Reference

### `client.connect()`
Initializes the client by fetching the system discovery manifest from `/api/v1`.

### `client.meta`
- `getObject(name: string)`: Get object schema.
- `getView(name: string)`: Get view configuration.

### `client.data`
- `find<T>(object, options)`: Advanced query with filtering, sorting, selection.
- `get<T>(object, id)`: Get single record by ID.
- `query<T>(object, ast)`: Execute complex query using full AST.
- `create<T>(object, data)`: Create record.
- `createMany<T>(object, data[])`: Batch create records.
- `update<T>(object, id, data)`: Update record.
- `updateMany<T>(object, ids[], data)`: Batch update records.
- `delete(object, id)`: Delete record.
- `deleteMany(object, ids[])`: Batch delete records.

### Query Options
The `find` method accepts an options object:
- `select`: Array of field names to retrieve.
- `filters`: Simple key-value map OR Filter AST `['field', 'op', 'value']`.
- `sort`: Sort string (`'name'`) or array `['-created_at', 'name']`.
- `top`: Limit number of records.
- `skip`: Offset for pagination.

