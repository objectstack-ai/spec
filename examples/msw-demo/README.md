# MSW Demo Example

This example demonstrates how to use the `@objectstack/plugin-msw` package to mock ObjectStack APIs using Mock Service Worker (MSW).

> **中文指南**: 查看 [GUIDE_CN.md](./GUIDE_CN.md) 获取完整的中文使用指南和案例说明。

## Features

- **Browser Mode**: Shows how to use MSW in a browser environment with standalone handlers
- **Server Mode**: Demonstrates MSW plugin integration with ObjectStack Runtime
- **React Components**: Complete examples showing CRUD operations in frontend components
- **Custom Hooks**: Reusable React hooks for data operations with MSW
- **TypeScript Support**: Full type safety with TypeScript

## Files

### Core Setup
- `src/browser.ts` - Browser-based MSW setup
- `src/server.ts` - Server-side MSW plugin integration with Runtime

### React Components
- `src/components/UserManagement.tsx` - Complete user management component with full CRUD operations
- `src/components/UserList.tsx` - Simplified component using custom hooks

### Custom Hooks
- `src/hooks/useObjectData.ts` - Reusable hooks for data operations:
  - `useObjectData` - Fetch data from MSW-mocked endpoints
  - `useCreateData` - Create records
  - `useUpdateData` - Update records
  - `useDeleteData` - Delete records
  - `useMetadata` - Fetch metadata

## Usage

### 1. Browser Mode (Basic Setup)

```typescript
import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';
import { ObjectStackServer } from '@objectstack/plugin-msw';

// Initialize mock server
ObjectStackServer.init(protocol);

// Define handlers
const handlers = [
  http.get('/api/user/:id', async ({ params }) => {
    const result = await ObjectStackServer.getUser(params.id);
    return HttpResponse.json(result.data, { status: result.status });
  })
];

// Start worker
const worker = setupWorker(...handlers);
await worker.start();
```

### 2. React Component with Fetch API

```typescript
import React, { useState, useEffect } from 'react';

export const UserComponent = () => {
  const [users, setUsers] = useState([]);

  // Fetch users - MSW intercepts GET /api/v1/data/user
  const fetchUsers = async () => {
    const response = await fetch('/api/v1/data/user');
    const data = await response.json();
    setUsers(data);
  };

  // Create user - MSW intercepts POST /api/v1/data/user
  const createUser = async (userData) => {
    const response = await fetch('/api/v1/data/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const newUser = await response.json();
    setUsers([...users, newUser]);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return <div>{/* Your UI */}</div>;
};
```

### 3. React Component with Custom Hooks (Recommended)

```typescript
import React from 'react';
import { useObjectData, useCreateData, useDeleteData } from './hooks/useObjectData';

export const UserComponent = () => {
  // Fetch data
  const { data: users, loading, error, refetch } = useObjectData('user');
  
  // Create data
  const { execute: createUser } = useCreateData('user', {
    onSuccess: () => refetch(),
  });
  
  // Delete data
  const { execute: deleteUser } = useDeleteData('user', {
    onSuccess: () => refetch(),
  });

  const handleCreate = async () => {
    await createUser({ name: 'New User', email: 'user@example.com' });
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={handleCreate}>Create User</button>
      {users?.map(user => (
        <div key={user.id}>
          <span>{user.name}</span>
          <button onClick={() => handleDelete(user.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

### 4. Runtime Integration

```typescript
import { ObjectStackKernel } from '@objectstack/runtime';
import { MSWPlugin } from '@objectstack/plugin-msw';

const kernel = new ObjectStackKernel([
  // Your manifests...
  new MSWPlugin({
    baseUrl: '/api/v1',
    logRequests: true
  })
]);

await kernel.start();
```

## Complete Examples

See the following files for complete implementation examples:

1. **UserManagement.tsx** - Full-featured user management component
   - Complete CRUD operations
   - Form validation and error handling
   - Loading state management
   - Edit/cancel functionality
   
2. **UserList.tsx** - Simplified component using custom hooks
   - Shows how to use reusable hooks
   - Cleaner code structure
   - Easy to maintain and test

3. **useObjectData.ts** - Custom hooks for data operations
   - Type-safe data fetching
   - Built-in error handling
   - Loading state management
   - Success/error callbacks

## Running

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run server example
pnpm dev
```

## API Endpoints Mocked

The MSW plugin automatically mocks the following endpoints:

- `GET /api/v1` - Discovery
- `GET /api/v1/meta` - Metadata types
- `GET /api/v1/meta/:type` - Metadata items
- `GET /api/v1/meta/:type/:name` - Specific metadata
- `GET /api/v1/data/:object` - Find records
- `GET /api/v1/data/:object/:id` - Get record
- `POST /api/v1/data/:object` - Create record
- `PATCH /api/v1/data/:object/:id` - Update record
- `DELETE /api/v1/data/:object/:id` - Delete record
- `GET /api/v1/ui/view/:object` - UI view config

## See Also

- **[中文完整指南 (Chinese Guide)](./GUIDE_CN.md)** - 完整的中文案例说明
- [@objectstack/plugin-msw](../../packages/plugin-msw) - MSW Plugin package
- [MSW Documentation](https://mswjs.io/) - Official MSW docs
- [React Hooks Guide](https://react.dev/reference/react) - React Hooks documentation

## Key Benefits

✅ **Zero Backend Dependency** - Work completely offline  
✅ **Fast Development** - No need to wait for backend APIs  
✅ **Easy Testing** - Mock data operations in tests  
✅ **Type Safety** - Full TypeScript support  
✅ **Reusable** - Custom hooks for clean, maintainable code
