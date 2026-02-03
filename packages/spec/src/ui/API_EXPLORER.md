# API Explorer UI Protocol

**Complete UI schemas for building interactive API exploration, testing, and management interfaces.**

## Overview

The API Explorer UI Protocol provides comprehensive schemas for creating user interfaces that allow developers and users to:

- **Browse and Discover APIs** - Navigate through registered APIs with filtering, grouping, and search
- **View API Documentation** - Display comprehensive API documentation in various styles (Swagger, ReDoc, Slate, etc.)
- **Test API Endpoints** - Interactive testing playground with request/response inspection
- **Monitor API Health** - Real-time health status, performance metrics, and alerts
- **Manage API Configurations** - Admin interfaces for API management

## Architecture Alignment

The API Explorer UI Protocol aligns with industry-leading tools:

| Tool | Inspiration | ObjectStack Component |
|------|-------------|----------------------|
| **Swagger UI** | Interactive documentation + testing | `ApiEndpointViewerComponent` |
| **Postman** | Full-featured API testing | `ApiTestingPlaygroundComponent` |
| **ReDoc** | Beautiful documentation rendering | `ApiDocumentationViewerComponent` |
| **GraphQL Playground** | GraphQL-specific testing | Specialized `ApiTestingPlaygroundComponent` |
| **Kong Manager** | API gateway management | `ApiExplorerPage` with health monitoring |
| **AWS API Gateway** | API management console | Complete admin interface |

## Core Components

### 1. API Browser Component

**Left sidebar for browsing and discovering APIs**

```typescript
const apiBrowser: ApiBrowserComponent = {
  type: 'api-browser',
  groupBy: 'type',              // Group by: type, status, tag, owner, version
  showSearch: true,             // Enable search bar
  showFilters: true,            // Show filter controls
  collapsible: true,            // Allow collapsing groups
  showEndpointCount: true,      // Show endpoint count badges
  defaultExpanded: ['rest', 'graphql']
};
```

**Features:**
- Multiple grouping strategies (type, status, tag, owner, version, custom)
- Search and filtering
- Collapsible groups
- Drag-and-drop reordering (optional)
- Endpoint count badges

### 2. API Endpoint Viewer Component

**Main content area for viewing and testing endpoints**

```typescript
const endpointViewer: ApiEndpointViewerComponent = {
  type: 'api-endpoint-viewer',
  defaultMode: 'combined',      // Modes: documentation, testing, code, schema, combined
  enableTesting: true,          // Enable try-it-out
  showCodeExamples: true,       // Show code examples
  codeLanguages: ['typescript', 'python', 'curl'],
  showSchemas: true,            // Show request/response schemas
  schemaExpandDepth: 1,         // -1 = fully expand
  enableHistory: true,          // Enable request history
  showResponseTime: true        // Show response time
};
```

**Display Modes:**
- **Documentation** - Documentation view (Swagger UI style)
- **Testing** - Testing playground (Postman style)
- **Code** - Code examples and snippets
- **Schema** - Schema/model view
- **Combined** - All-in-one view with tabs

### 3. API Testing Playground Component

**Full-featured testing interface**

```typescript
const testingPlayground: ApiTestingPlaygroundComponent = {
  type: 'api-testing-playground',
  
  requestEditor: {
    syntaxHighlighting: true,
    enableVariables: true,        // Template variables {{var}}
    autoCompleteHeaders: true,
    enablePreRequestScript: true
  },
  
  responseViewer: {
    prettyPrint: true,
    syntaxHighlighting: true,
    enableCopy: true,
    enableDownload: true
  },
  
  enableEnvironments: true,       // Environment management
  enableCollections: true,        // Request collections
  enableHistory: true,            // Request history
  historyLimit: 50,
  enableAuthHelpers: true,        // Auth helpers (OAuth, JWT, etc.)
  defaultTimeout: 30000
};
```

**Features:**
- Request editor with syntax highlighting
- Response viewer with formatting
- Environment variables
- Collections management
- Request history
- Authentication helpers
- Pre-request scripts

### 4. API Documentation Viewer Component

**Documentation rendering component**

```typescript
const docViewer: ApiDocumentationViewerComponent = {
  type: 'api-documentation-viewer',
  style: 'redoc',               // Styles: swagger, redoc, slate, stoplight, custom
  showToc: true,                // Table of contents
  showCodeExamples: true,
  codeLanguages: ['typescript', 'python', 'curl'],
  enableSearch: true,
  showAuthentication: true,
  showErrorCodes: true,
  showChangelog: true,
  enableDeepLinking: true,
  theme: 'light'
};
```

**Documentation Styles:**
- **Swagger** - Swagger UI style
- **ReDoc** - ReDoc style
- **Slate** - Slate style (two-column)
- **Stoplight** - Stoplight Elements style
- **Custom** - Custom template

### 5. API Health Monitor Component

**Health and performance monitoring**

```typescript
const healthMonitor: ApiHealthMonitorComponent = {
  type: 'api-health-monitor',
  displayMode: 'dashboard',     // Modes: status-badge, detailed-list, dashboard, timeline
  refreshInterval: 30,          // Auto-refresh (seconds)
  showMetrics: true,
  showAlerts: true,
  metricsTimeRange: '24h',      // 1h, 6h, 24h, 7d, 30d
  alertThresholds: {
    errorRate: 5,               // 5% threshold
    responseTime: 1000,         // 1000ms threshold
    uptime: 99                  // 99% threshold
  }
};
```

**Features:**
- Real-time health status
- Performance metrics (response time, error rate, uptime)
- Configurable alerts
- Multiple display modes
- Auto-refresh

### 6. API Explorer Page

**Complete page configuration**

```typescript
const apiExplorerPage: ApiExplorerPage = {
  name: 'api_explorer',
  label: 'API Explorer',
  description: 'Explore and test ObjectStack APIs',
  layout: 'sidebar-main',       // Layouts: sidebar-main, three-column, tabbed, etc.
  
  sidebar: {
    type: 'api-browser',
    groupBy: 'type',
    showSearch: true
  },
  
  main: {
    type: 'api-endpoint-viewer',
    enableTesting: true,
    showCodeExamples: true
  },
  
  enableHealthMonitor: true,
  healthMonitor: {
    type: 'api-health-monitor',
    displayMode: 'dashboard'
  },
  
  theme: 'light',
  enableKeyboardShortcuts: true,
  requiredPermissions: ['api.read']
};
```

**Page Layouts:**
- `sidebar-main` - Sidebar + main content (Swagger UI style)
- `three-column` - Browser + content + inspector
- `tabbed` - Tabbed interface
- `split-horizontal` - Horizontal split
- `split-vertical` - Vertical split
- `custom` - Custom layout

## Usage Examples

### Example 1: Swagger UI-Style Page

```typescript
import { ApiExplorer } from '@objectstack/spec/ui';

const swaggerPage = ApiExplorer.createPage({
  name: 'swagger_ui',
  label: 'Swagger UI',
  layout: 'sidebar-main',
  sidebar: {
    type: 'api-browser',
    groupBy: 'tag',
    showSearch: true
  },
  main: {
    type: 'api-endpoint-viewer',
    defaultMode: 'combined',
    enableTesting: true,
    showCodeExamples: true,
    codeLanguages: ['curl', 'javascript', 'python']
  },
  theme: 'light'
});
```

### Example 2: Postman-Style Testing Interface

```typescript
const postmanPage = ApiExplorer.createPage({
  name: 'api_tester',
  label: 'API Tester',
  layout: 'sidebar-main',
  sidebar: {
    type: 'api-browser',
    groupBy: 'none',
    enableDragDrop: true
  },
  main: {
    type: 'api-testing-playground',
    enableEnvironments: true,
    enableCollections: true,
    enableHistory: true,
    requestEditor: {
      enableVariables: true,
      autoCompleteHeaders: true
    },
    responseViewer: {
      prettyPrint: true,
      syntaxHighlighting: true
    }
  },
  theme: 'dark'
});
```

### Example 3: ReDoc-Style Documentation

```typescript
const redocPage = ApiExplorer.createPage({
  name: 'api_reference',
  label: 'API Reference',
  layout: 'three-column',
  sidebar: {
    type: 'api-browser',
    groupBy: 'type'
  },
  main: {
    type: 'api-documentation-viewer',
    style: 'redoc',
    showToc: true,
    showCodeExamples: true,
    enableSearch: true
  },
  theme: 'light'
});
```

### Example 4: API Health Dashboard

```typescript
const healthDashboard = ApiExplorer.createPage({
  name: 'api_health_dashboard',
  label: 'API Health',
  layout: 'sidebar-main',
  sidebar: {
    type: 'api-browser',
    groupBy: 'status'
  },
  enableHealthMonitor: true,
  healthMonitor: {
    type: 'api-health-monitor',
    displayMode: 'dashboard',
    refreshInterval: 30,
    showMetrics: true,
    showAlerts: true,
    alertThresholds: {
      errorRate: 5,
      responseTime: 1000,
      uptime: 99
    }
  },
  theme: 'dark'
});
```

### Example 5: GraphQL Playground

```typescript
const graphqlPlayground = ApiExplorer.createPage({
  name: 'graphql_playground',
  label: 'GraphQL Playground',
  layout: 'split-vertical',
  sidebar: {
    type: 'api-browser',
    groupBy: 'type',
    defaultFilters: {
      types: ['graphql']
    }
  },
  main: {
    type: 'api-testing-playground',
    requestEditor: {
      syntaxHighlighting: true,
      enableVariables: true
    },
    responseViewer: {
      prettyPrint: true,
      syntaxHighlighting: true
    }
  },
  theme: 'dark'
});
```

## Integration with API Registry

The API Explorer UI components integrate seamlessly with the API Registry:

```typescript
import { ApiRegistry } from '@objectstack/spec/api';
import { ApiExplorer } from '@objectstack/spec/ui';

// API Registry provides the data
const registry: ApiRegistry = {
  version: '1.0.0',
  apis: [
    {
      id: 'customer_api',
      name: 'Customer API',
      type: 'rest',
      endpoints: [...]
    }
  ]
};

// API Explorer provides the UI
const explorerPage = ApiExplorer.createPage({
  name: 'api_explorer',
  label: 'API Explorer',
  // ... configuration
});
```

## Factory Helpers

The API Explorer provides factory helpers for type-safe creation:

```typescript
import { ApiExplorer } from '@objectstack/spec/ui';

// Create a page
const page = ApiExplorer.createPage({ ... });

// Create a browser component
const browser = ApiExplorer.createBrowser({ ... });

// Create an endpoint viewer
const viewer = ApiExplorer.createEndpointViewer({ ... });

// Create a testing playground
const playground = ApiExplorer.createTestingPlayground({ ... });

// Create a documentation viewer
const docViewer = ApiExplorer.createDocViewer({ ... });

// Create a health monitor
const monitor = ApiExplorer.createHealthMonitor({ ... });
```

## Naming Conventions

**IMPORTANT:** Follow ObjectStack naming conventions:

- **Page Names:** `snake_case` (e.g., `api_explorer`, `api_docs`)
- **Component IDs:** `snake_case` (e.g., `main_browser`, `sidebar_nav`)
- **Display Labels:** `Proper Case` (e.g., `API Explorer`, `API Documentation`)

## Permissions

Control access to API Explorer pages with permissions:

```typescript
const adminExplorer = ApiExplorer.createPage({
  name: 'admin_api_explorer',
  label: 'Admin API Explorer',
  requiredPermissions: ['api.read', 'api.execute', 'admin']
});
```

## Keyboard Shortcuts

Enable keyboard shortcuts for power users:

```typescript
const page = ApiExplorer.createPage({
  name: 'api_explorer',
  label: 'API Explorer',
  enableKeyboardShortcuts: true
});
```

**Common Shortcuts:**
- `Ctrl+K` / `Cmd+K` - Focus search
- `Ctrl+/` / `Cmd+/` - Show shortcuts help
- `Esc` - Close modals/panels
- Arrow keys - Navigate items

## Theme Support

All components support light, dark, and auto themes:

```typescript
const page = ApiExplorer.createPage({
  name: 'api_explorer',
  label: 'API Explorer',
  theme: 'auto' // 'light', 'dark', or 'auto'
});
```

## Testing

Run the comprehensive test suite:

```bash
pnpm --filter @objectstack/spec test src/ui/api-explorer.test.ts
```

**Test Coverage:**
- 49 unit tests
- All components validated
- Factory helpers tested
- Integration scenarios covered
- Naming conventions enforced

## Related Documentation

- [API Registry Schema](../api/registry.zod.ts) - Backend API registry
- [API Documentation Schema](../api/documentation.zod.ts) - Documentation generation
- [UI Protocol Overview](./README.md) - Overall UI protocol
- [Page Schema](./page.zod.ts) - Generic page configuration
- [Component Schema](./component.zod.ts) - UI components

## Examples

See [api-explorer.example.ts](./api-explorer.example.ts) for 10 complete examples:

1. Swagger UI-style Explorer
2. Postman-style Testing Interface
3. ReDoc-style Documentation
4. GraphQL Playground
5. API Health Dashboard
6. Internal Admin Explorer
7. Public API Documentation
8. WebSocket API Explorer
9. Minimal API Browser
10. Standalone Component Configurations

## License

MIT
