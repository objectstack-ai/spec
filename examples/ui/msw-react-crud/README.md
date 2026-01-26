# MSW + React CRUD Example

This example demonstrates complete CRUD operations in a React application using **Mock Service Worker (MSW)** for API mocking and the **@objectstack/client** package for all data operations.

## 🎯 Features

- ✅ **Complete CRUD Operations**: Create, Read, Update, Delete tasks
- ✅ **ObjectStack Client Integration**: Uses official `@objectstack/client` for all API calls
- ✅ **MSW API Mocking**: All API requests are intercepted and mocked in the browser
- ✅ **React + TypeScript**: Modern React with full TypeScript support
- ✅ **Vite**: Fast development server and build tool
- ✅ **Best Practices**: Follows ObjectStack conventions and patterns

## 📁 Project Structure

```
src/
├── components/
│   ├── TaskForm.tsx      # Create/Update form component
│   ├── TaskItem.tsx      # Single task display component
│   └── TaskList.tsx      # Task list with read operations
├── mocks/
│   └── browser.ts        # MSW handlers and mock database
├── App.tsx               # Main application component
├── App.css               # Application styles
├── main.tsx              # Entry point with MSW initialization
└── types.ts              # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (package manager)

### Installation

```bash
# Install dependencies
pnpm install

# Initialize MSW service worker (required for browser mode)
pnpm dlx msw init public/ --save
```

### Running the Application

```bash
# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
# Build the application
pnpm build

# Preview the production build
pnpm preview
```

## 📖 How It Works

### 1. MSW Setup (`src/mocks/browser.ts`)

MSW intercepts HTTP requests in the browser and returns mock data:

```typescript
import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';

// Define handlers matching ObjectStack API
const handlers = [
  http.get('/api/v1/data/task', () => {
    return HttpResponse.json({ value: tasks, count: tasks.length });
  }),
  
  http.post('/api/v1/data/task', async ({ request }) => {
    const body = await request.json();
    const newTask = { id: generateId(), ...body };
    return HttpResponse.json(newTask, { status: 201 });
  }),
  
  // ... more handlers
];

export const worker = setupWorker(...handlers);
```

### 2. ObjectStack Client Usage

All components use the official `@objectstack/client` package:

```typescript
import { ObjectStackClient } from '@objectstack/client';

// Initialize client
const client = new ObjectStackClient({ baseUrl: '/api/v1' });
await client.connect();

// READ - Find all tasks
const result = await client.data.find('task', {
  top: 100,
  sort: ['priority']
});

// CREATE - Create new task
const newTask = await client.data.create('task', {
  subject: 'New task',
  priority: 1
});

// UPDATE - Update existing task
await client.data.update('task', taskId, {
  isCompleted: true
});

// DELETE - Delete task
await client.data.delete('task', taskId);
```

### 3. React Components

**TaskList Component** (`src/components/TaskList.tsx`)
- Fetches and displays all tasks
- Demonstrates READ operations
- Handles task deletion and status toggling

**TaskForm Component** (`src/components/TaskForm.tsx`)
- Form for creating new tasks
- Form for editing existing tasks
- Demonstrates CREATE and UPDATE operations

**TaskItem Component** (`src/components/TaskItem.tsx`)
- Displays individual task
- Provides edit and delete actions
- Shows task metadata (priority, completion status)

## 🔌 API Endpoints Mocked

The example mocks the following ObjectStack API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1` | Discovery endpoint |
| `GET` | `/api/v1/meta/object/task` | Get task object metadata |
| `GET` | `/api/v1/data/task` | Find/list all tasks |
| `GET` | `/api/v1/data/task/:id` | Get single task by ID |
| `POST` | `/api/v1/data/task` | Create new task |
| `PATCH` | `/api/v1/data/task/:id` | Update existing task |
| `DELETE` | `/api/v1/data/task/:id` | Delete task |

## 🎨 UI Features

- **Priority Indicators**: Color-coded priority levels (1-5)
- **Completion Status**: Checkbox to mark tasks as complete
- **Real-time Updates**: Automatic list refresh after CRUD operations
- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Shows loading indicators during async operations
- **Error Handling**: Displays error messages for failed operations

## 📚 Key Concepts

### MSW (Mock Service Worker)

MSW intercepts requests at the network level, making it ideal for:
- Development without a backend
- Testing components in isolation
- Demos and prototypes
- Offline development

### ObjectStack Client

The `@objectstack/client` provides a type-safe, consistent API for:
- Auto-discovery of server capabilities
- Metadata operations
- Data CRUD operations
- Query operations with filters, sorting, and pagination

### Best Practices Demonstrated

1. **Single Source of Truth**: All API calls go through ObjectStack Client
2. **Type Safety**: Full TypeScript support with proper interfaces
3. **Component Separation**: Clear separation between data fetching and presentation
4. **Error Handling**: Proper error handling and user feedback
5. **Loading States**: Visual feedback during async operations

## 🔧 Customization

### Adding New Fields

1. Update the `Task` interface in `src/types.ts`
2. Update mock handlers in `src/mocks/browser.ts`
3. Update components to display/edit new fields

### Changing Mock Data

Edit the initial data in `src/mocks/browser.ts`:

```typescript
const mockTasks = new Map([
  ['1', { id: '1', subject: 'Your task', priority: 1, ... }],
  // Add more tasks...
]);
```

### Styling

All styles are in `src/App.css`. The design uses CSS custom properties (variables) for easy theming.

## 📦 Dependencies

- **@objectstack/client** - Official ObjectStack client SDK
- **@objectstack/plugin-msw** - MSW integration for ObjectStack
- **react** - UI library
- **msw** - Mock Service Worker for API mocking
- **vite** - Build tool and dev server
- **typescript** - Type safety

## 🤝 Related Examples

- [`/examples/msw-demo`](../../../msw-demo) - MSW plugin integration examples
- [`/examples/todo`](../../../todo) - Todo app with ObjectStack Client
- [`/examples/ui/react-renderer`](../react-renderer) - React metadata renderer

## 📖 Further Reading

- [MSW Documentation](https://mswjs.io/)
- [ObjectStack Client API](../../packages/client)
- [ObjectStack Protocol Specification](../../packages/spec)
- [React Documentation](https://react.dev/)

## 📝 License

Apache-2.0
