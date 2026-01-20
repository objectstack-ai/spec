# @objectstack/client-sdk

The official TypeScript client for ObjectStack.

## Features

- **Auto-Discovery**: Connects to your ObjectStack server and automatically configures API endpoints.
- **Typed Metadata**: Retrieve Object and View definitions with full type support.
- **Unified Data Access**: Simple CRUD operations for any object in your schema.

## Installation

```bash
pnpm add @objectstack/client-sdk
```

## Usage

```typescript
import { ObjectStackClient } from '@objectstack/client-sdk';

// 1. Initialize
const client = new ObjectStackClient({
  baseUrl: 'http://localhost:3004' // Your ObjectStack Server URL
});

async function main() {
  // 2. Connect (Fetches system capabilities)
  await client.connect();

  // 3. Metadata Access
  const todoSchema = await client.meta.getObject('todo_task');
  console.log('Fields:', todoSchema.fields);

  // 4. Data Access
  const tasks = await client.data.find('todo_task', {
    status: 'pending' // Simple filtering
  });
  
  // 5. Create Data
  await client.data.create('todo_task', {
    title: 'New Task',
    status: 'todo'
  });
}
```

## API Reference

### `client.connect()`
Initializes the client by fetching the system discovery manifest from `/api/v1`.

### `client.meta`
- `getObject(name: string)`: Get object schema.
- `getView(name: string)`: Get view configuration.

### `client.data`
- `find(object: string, query?: Record<string, any>)`: List records.
- `get(object: string, id: string)`: Get single record.
- `create(object: string, data: any)`: Create record.
- `update(object: string, id: string, data: any)`: Update record.
- `delete(object: string, id: string)`: Delete record.
