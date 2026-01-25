# React Renderer Example

This example demonstrates how to render ObjectStack UI metadata using React.

## Overview

The ObjectStack UI Protocol defines metadata (JSON/TypeScript) that describes the user interface. This example shows how to build a React-based renderer that interprets this metadata and renders the actual UI.

## Architecture

```
┌─────────────────┐
│   UI Metadata   │  (JSON from server or TypeScript)
│  (Pages, Views) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React Renderer │  (Interprets metadata)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ React Components│  (Actual UI)
│  (Buttons, etc) │
└─────────────────┘
```

## Key Concepts

### 1. Metadata-Driven UI

The UI is defined declaratively in metadata:

```typescript
// UI Metadata (from ObjectStack spec)
const pageMetadata: Page = {
  name: 'customer_page',
  type: 'record',
  object: 'customer',
  template: 'header-main',
  regions: [
    {
      name: 'header',
      components: [
        {
          type: 'record-header',
          properties: {
            title: '{name}',
            subtitle: '{email}',
          },
        },
      ],
    },
    {
      name: 'main',
      components: [
        {
          type: 'custom-button',
          properties: {
            label: 'Save',
            variant: 'primary',
          },
        },
      ],
    },
  ],
};
```

### 2. Component Rendering

The renderer maps component types to React components:

```typescript
function renderComponent(componentDef: PageComponent, data: any) {
  const Component = ComponentRegistry[componentDef.type];
  
  if (!Component) {
    return <div>Unknown component: {componentDef.type}</div>;
  }
  
  return (
    <Component
      properties={componentDef.properties}
      data={data}
      onAction={handleAction}
      theme={theme}
    />
  );
}
```

### 3. Data Binding

Components can reference data using template expressions:

```typescript
// Metadata with data binding
{
  type: 'text',
  properties: {
    value: '{customer.name}',  // Binds to customer.name
  }
}

// Renderer resolves the binding
function resolveBinding(template: string, data: any): string {
  return template.replace(/\{([^}]+)\}/g, (_, path) => {
    return getNestedValue(data, path) ?? '';
  });
}
```

## Components Included

### PageRenderer

Renders a complete page from metadata.

```typescript
<PageRenderer
  page={pageMetadata}
  data={customerData}
  registry={ComponentRegistry}
  theme={theme}
/>
```

### ViewRenderer

Renders list views, forms, and other view types.

```typescript
<ViewRenderer
  view={listViewMetadata}
  data={records}
  onAction={handleAction}
/>
```

### ComponentRenderer

Low-level component renderer.

```typescript
<ComponentRenderer
  component={componentMetadata}
  data={data}
  registry={ComponentRegistry}
/>
```

## Usage Examples

### Example 1: Simple Page Rendering

```typescript
import React, { useState, useEffect } from 'react';
import { PageRenderer } from './renderers/PageRenderer';
import { ComponentRegistry } from '../custom-components';

function App() {
  const [pageMetadata, setPageMetadata] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch metadata from server
    fetch('/api/ui/pages/customer_page')
      .then(res => res.json())
      .then(setPageMetadata);
    
    // Fetch data
    fetch('/api/data/customer/123')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!pageMetadata || !data) {
    return <div>Loading...</div>;
  }

  return (
    <PageRenderer
      page={pageMetadata}
      data={data}
      registry={ComponentRegistry}
    />
  );
}
```

### Example 2: List View with Data Grid

```typescript
import React from 'react';
import { ViewRenderer } from './renderers/ViewRenderer';
import type { ListView } from '@objectstack/spec/ui';

const listViewMetadata: ListView = {
  type: 'grid',
  columns: [
    { field: 'name', label: 'Name', sortable: true },
    { field: 'email', label: 'Email', sortable: true },
    { field: 'status', label: 'Status' },
  ],
  pagination: {
    pageSize: 25,
  },
};

function CustomerList() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch('/api/data/customer')
      .then(res => res.json())
      .then(data => setCustomers(data.records));
  }, []);

  return (
    <ViewRenderer
      view={listViewMetadata}
      data={customers}
      onAction={(action, params) => {
        console.log('Action:', action, params);
      }}
    />
  );
}
```

### Example 3: Dashboard with Widgets

```typescript
import React from 'react';
import { DashboardRenderer } from './renderers/DashboardRenderer';
import type { Dashboard } from '@objectstack/spec/ui';

const dashboardMetadata: Dashboard = {
  name: 'sales_dashboard',
  label: 'Sales Dashboard',
  widgets: [
    {
      title: 'Total Revenue',
      type: 'metric',
      object: 'opportunity',
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 0, y: 0, w: 3, h: 2 },
    },
    {
      title: 'Pipeline by Stage',
      type: 'bar',
      object: 'opportunity',
      categoryField: 'stage',
      valueField: 'amount',
      layout: { x: 3, y: 0, w: 9, h: 4 },
    },
  ],
};

function SalesDashboard() {
  return (
    <DashboardRenderer
      dashboard={dashboardMetadata}
      onRefresh={() => console.log('Refresh dashboard')}
    />
  );
}
```

## Advanced Features

### 1. Template Expression Resolution

```typescript
/**
 * Resolves template expressions like {field.nested.value}
 */
function resolveTemplate(template: string, data: any): any {
  if (typeof template !== 'string') return template;
  
  return template.replace(/\{([^}]+)\}/g, (match, path) => {
    const value = getNestedValue(data, path);
    return value !== undefined ? value : match;
  });
}

/**
 * Gets nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current?.[key];
  }, obj);
}
```

### 2. Action Handling

```typescript
/**
 * Central action handler
 */
function handleAction(action: string, params?: any) {
  switch (action) {
    case 'save':
      return saveRecord(params);
    case 'delete':
      return deleteRecord(params);
    case 'navigate':
      return navigate(params.url);
    default:
      console.warn('Unknown action:', action);
  }
}
```

### 3. Theme Integration

```typescript
/**
 * Theme context provider
 */
const ThemeContext = React.createContext<Theme | null>(null);

export function ThemeProvider({ theme, children }) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return React.useContext(ThemeContext);
}
```

### 4. Error Boundaries

```typescript
class ComponentErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h3>Component Error</h3>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Best Practices

### 1. Lazy Loading

Load components on demand:

```typescript
const ComponentRegistry = {
  'heavy-chart': React.lazy(() => import('./components/HeavyChart')),
};

function renderComponent(def: PageComponent) {
  const Component = ComponentRegistry[def.type];
  
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Component {...def.properties} />
    </React.Suspense>
  );
}
```

### 2. Memoization

Prevent unnecessary re-renders:

```typescript
const MemoizedComponent = React.memo(({ properties, data }) => {
  return <CustomComponent properties={properties} data={data} />;
}, (prevProps, nextProps) => {
  return (
    JSON.stringify(prevProps.properties) === JSON.stringify(nextProps.properties) &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  );
});
```

### 3. Performance Monitoring

Track rendering performance:

```typescript
function ComponentRenderer({ component, ...props }) {
  const startTime = performance.now();
  
  useEffect(() => {
    const renderTime = performance.now() - startTime;
    if (renderTime > 100) {
      console.warn(`Slow render: ${component.type} took ${renderTime}ms`);
    }
  });
  
  // Render component...
}
```

## File Structure

```
react-renderer/
├── README.md
├── package.json
├── tsconfig.json
├── src/
│   ├── renderers/
│   │   ├── PageRenderer.tsx        # Renders Page metadata
│   │   ├── ViewRenderer.tsx        # Renders View metadata
│   │   ├── DashboardRenderer.tsx   # Renders Dashboard metadata
│   │   └── ComponentRenderer.tsx   # Base component renderer
│   ├── utils/
│   │   ├── templateResolver.ts     # Template expression resolution
│   │   ├── dataBinding.ts          # Data binding utilities
│   │   └── actionHandler.ts        # Action handling
│   ├── contexts/
│   │   └── ThemeContext.tsx        # Theme context provider
│   ├── hooks/
│   │   ├── useMetadata.ts          # Fetch metadata hook
│   │   └── useData.ts              # Fetch data hook
│   └── index.ts
└── examples/
    ├── SimpleApp.tsx               # Basic example
    ├── DataGridApp.tsx             # List view example
    └── DashboardApp.tsx            # Dashboard example
```

## Installation

```bash
cd examples/ui/react-renderer
npm install
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Integration

### With Server

```typescript
// Server provides metadata API
app.get('/api/ui/pages/:pageName', (req, res) => {
  const page = getPageMetadata(req.params.pageName);
  res.json(page);
});

// Client fetches and renders
function PageView({ pageName }) {
  const { data: page, loading } = useMetadata(`/api/ui/pages/${pageName}`);
  
  if (loading) return <Spinner />;
  
  return <PageRenderer page={page} />;
}
```

### With State Management

```typescript
// Redux/Zustand integration
function PageRendererWithStore({ page }) {
  const dispatch = useDispatch();
  
  const handleAction = (action, params) => {
    dispatch({ type: action, payload: params });
  };
  
  return (
    <PageRenderer
      page={page}
      onAction={handleAction}
    />
  );
}
```

## Related Examples

- `../custom-components` - Custom component implementations
- `../src/*.examples.ts` - UI metadata examples

## Resources

- [ObjectStack UI Protocol](../../packages/spec/src/ui/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
