# @objectstack/client

The official TypeScript client for ObjectStack.

## Features

- **Auto-Discovery**: Connects to your ObjectStack server and automatically configures API endpoints.
- **Typed Metadata**: Retrieve Object and View definitions with full type support.
- **Metadata Caching**: ETag-based conditional requests for efficient metadata caching.
- **Unified Data Access**: Simple CRUD operations for any object in your schema.
- **Batch Operations**: Efficient bulk create/update/delete with transaction support.
- **View Storage**: Save, load, and share custom UI view configurations.
- **Standardized Errors**: Machine-readable error codes with retry guidance.

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

  // 6. Batch Operations (New!)
  const batchResult = await client.data.batch('todo_task', {
    operation: 'update',
    records: [
      { id: '1', data: { status: 'active' } },
      { id: '2', data: { status: 'active' } }
    ],
    options: {
      atomic: true,        // Rollback on any failure
      returnRecords: true  // Include full records in response
    }
  });
  console.log(`Updated ${batchResult.succeeded} records`);

  // 7. Metadata Caching (New!)
  const cachedObject = await client.meta.getCached('todo_task', {
    ifNoneMatch: '"686897696a7c876b7e"'  // ETag from previous request
  });
  if (cachedObject.notModified) {
    console.log('Using cached metadata');
  }

  // 8. View Storage (New!)
  const view = await client.views.create({
    name: 'active_tasks',
    label: 'Active Tasks',
    object: 'todo_task',
    type: 'list',
    visibility: 'public',
    query: {
      object: 'todo_task',
      where: { status: 'active' },
      orderBy: [{ field: 'priority', order: 'desc' }],
      limit: 50
    },
    layout: {
      columns: [
        { field: 'subject', label: 'Task', width: 200 },
        { field: 'priority', label: 'Priority', width: 100 }
      ]
    }
  });
}
```

## API Reference

### `client.connect()`
Initializes the client by fetching the system discovery manifest from `/api/v1`.

### `client.meta`
- `getObject(name: string)`: Get object schema.
- `getCached(name: string, options?)`: Get object schema with ETag-based caching.
- `getView(name: string)`: Get view configuration.

### `client.data`
- `find<T>(object, options)`: Advanced query with filtering, sorting, selection.
- `get<T>(object, id)`: Get single record by ID.
- `query<T>(object, ast)`: Execute complex query using full AST.
- `create<T>(object, data)`: Create record.
- `batch(object, request)`: **Recommended** - Execute batch operations (create/update/upsert/delete) with full control.
- `createMany<T>(object, data[])`: Batch create records (convenience method).
- `update<T>(object, id, data)`: Update record.
- `updateMany<T>(object, records[], options?)`: Batch update records (convenience method).
- `delete(object, id)`: Delete record.
- `deleteMany(object, ids[], options?)`: Batch delete records (convenience method).

### `client.views` (New!)
- `create(request)`: Create a new saved view.
- `get(id)`: Get a saved view by ID.
- `list(request?)`: List saved views with optional filters.
- `update(request)`: Update an existing view.
- `delete(id)`: Delete a saved view.
- `share(id, userIds[])`: Share a view with users/teams.
- `setDefault(id, object)`: Set a view as default for an object.

### Query Options
The `find` method accepts an options object:
- `select`: Array of field names to retrieve.
- `filters`: Simple key-value map OR Filter AST `['field', 'op', 'value']`.
- `sort`: Sort string (`'name'`) or array `['-created_at', 'name']`.
- `top`: Limit number of records.
- `skip`: Offset for pagination.

### Batch Options
Batch operations support the following options:
- `atomic`: If true, rollback entire batch on any failure (default: true).
- `returnRecords`: If true, return full record data in response (default: false).
- `continueOnError`: If true (and atomic=false), continue processing remaining records after errors.
- `validateOnly`: If true, validate records without persisting changes (dry-run mode).

### Error Handling
The client provides standardized error handling with machine-readable error codes:

```typescript
try {
  await client.data.create('todo_task', { subject: '' });
} catch (error) {
  console.error('Error code:', error.code);        // e.g., 'validation_error'
  console.error('Category:', error.category);      // e.g., 'validation'
  console.error('HTTP status:', error.httpStatus); // e.g., 400
  console.error('Retryable:', error.retryable);    // e.g., false
  console.error('Details:', error.details);        // Additional error info
}
```

Common error codes:
- `validation_error`: Input validation failed
- `unauthenticated`: Authentication required
- `permission_denied`: Insufficient permissions
- `resource_not_found`: Resource does not exist
- `rate_limit_exceeded`: Too many requests

