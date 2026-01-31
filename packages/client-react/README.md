# @objectstack/client-react

React hooks for ObjectStack Client SDK - Type-safe data fetching and mutations for React applications.

## Installation

```bash
npm install @objectstack/client-react
# or
pnpm add @objectstack/client-react
# or
yarn add @objectstack/client-react
```

## Quick Start

### 1. Setup Provider

Wrap your app with `ObjectStackProvider`:

```tsx
import { ObjectStackClient } from '@objectstack/client';
import { ObjectStackProvider } from '@objectstack/client-react';

const client = new ObjectStackClient({
  baseUrl: 'http://localhost:3000'
});

function App() {
  return (
    <ObjectStackProvider client={client}>
      <YourApp />
    </ObjectStackProvider>
  );
}
```

### 2. Use Data Hooks

#### Query Data

```tsx
import { useQuery } from '@objectstack/client-react';

function TaskList() {
  const { data, isLoading, error, refetch } = useQuery('todo_task', {
    select: ['id', 'subject', 'priority'],
    sort: ['-created_at'],
    top: 20
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.value.map(task => (
        <div key={task.id}>{task.subject}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

#### Mutate Data

```tsx
import { useMutation } from '@objectstack/client-react';

function CreateTaskForm() {
  const { mutate, isLoading, error } = useMutation('todo_task', 'create', {
    onSuccess: (data) => {
      console.log('Task created:', data);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({
      subject: 'New Task',
      priority: 3
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Task'}
      </button>
      {error && <div className="error">{error.message}</div>}
    </form>
  );
}
```

#### Pagination

```tsx
import { usePagination } from '@objectstack/client-react';

function PaginatedTaskList() {
  const {
    data,
    isLoading,
    page,
    totalPages,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage
  } = usePagination('todo_task', {
    pageSize: 10,
    sort: ['-created_at']
  });

  return (
    <div>
      {data?.value.map(task => (
        <div key={task.id}>{task.subject}</div>
      ))}
      <div className="pagination">
        <button onClick={previousPage} disabled={!hasPreviousPage}>
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={nextPage} disabled={!hasNextPage}>
          Next
        </button>
      </div>
    </div>
  );
}
```

#### Infinite Scrolling

```tsx
import { useInfiniteQuery } from '@objectstack/client-react';

function InfiniteTaskList() {
  const {
    flatData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery('todo_task', {
    pageSize: 20,
    sort: ['-created_at']
  });

  return (
    <div>
      {flatData.map(task => (
        <div key={task.id}>{task.subject}</div>
      ))}
      {hasNextPage && (
        <button onClick={fetchNextPage} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

### 3. Use Metadata Hooks

#### Object Schema

```tsx
import { useObject } from '@objectstack/client-react';

function ObjectSchemaViewer({ objectName }) {
  const { data: schema, isLoading } = useObject(objectName);

  if (isLoading) return <div>Loading schema...</div>;

  return (
    <div>
      <h2>{schema.label}</h2>
      <p>Fields: {Object.keys(schema.fields).length}</p>
    </div>
  );
}
```

#### View Configuration

```tsx
import { useView } from '@objectstack/client-react';

function ViewConfiguration({ objectName }) {
  const { data: view, isLoading } = useView(objectName, 'list');

  if (isLoading) return <div>Loading view...</div>;

  return (
    <div>
      <h3>List View for {objectName}</h3>
      <p>Columns: {view?.columns?.length}</p>
    </div>
  );
}
```

#### Fields List

```tsx
import { useFields } from '@objectstack/client-react';

function FieldList({ objectName }) {
  const { data: fields, isLoading } = useFields(objectName);

  if (isLoading) return <div>Loading fields...</div>;

  return (
    <ul>
      {fields?.map(field => (
        <li key={field.name}>
          {field.label} ({field.type})
        </li>
      ))}
    </ul>
  );
}
```

## API Reference

### Data Hooks

- **`useQuery(object, options)`** - Query data with auto-refetch
- **`useMutation(object, operation, options)`** - Create, update, or delete data
- **`usePagination(object, options)`** - Paginated data queries
- **`useInfiniteQuery(object, options)`** - Infinite scrolling

### Metadata Hooks

- **`useObject(objectName, options)`** - Fetch object schema
- **`useView(objectName, viewType, options)`** - Fetch view configuration
- **`useFields(objectName, options)`** - Get fields list
- **`useMetadata(fetcher, options)`** - Custom metadata queries

### Context

- **`ObjectStackProvider`** - Context provider component
- **`useClient()`** - Access ObjectStackClient instance

## Type Safety

All hooks support TypeScript generics for type-safe data:

```tsx
interface Task {
  id: string;
  subject: string;
  priority: number;
  is_completed: boolean;
}

const { data } = useQuery<Task>('todo_task');
// data.value is typed as Task[]

const { mutate } = useMutation<Task, Partial<Task>>('todo_task', 'create');
// mutate expects Partial<Task>
```

## License

Apache-2.0
