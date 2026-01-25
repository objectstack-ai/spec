# ObjectStack UI Protocol Examples

This directory contains comprehensive examples demonstrating the **UI Protocol** of ObjectStack - the presentation layer that defines how users interact with data.

## 📚 What's Inside

This package contains three sub-packages demonstrating different aspects of the UI Protocol:

### 1. **Metadata Examples** (`metadata-examples/`)
TypeScript/JSON configurations defining UI structure - the "what" of the UI:
- **view.examples.ts** - Grid, Kanban, Calendar, Gantt views
- **page.examples.ts** - Record, Home, App pages
- **dashboard.examples.ts** - Analytics dashboards with widgets
- **action.examples.ts** - User interactions and workflows
- **app.examples.ts** - Complete application structures
- **theme.examples.ts** - Visual styling and theming

### 2. **Custom Components** (`custom-components/`)
React implementations showing how to build custom UI components:
- CustomButton - Flexible button with variants and theming
- CustomDataGrid - Advanced grid with sorting, filtering, pagination
- Component registration system

### 3. **React Renderer** (`react-renderer/`)
Shows how to render UI metadata using React - the "how" of the UI:
- PageRenderer - Renders Page metadata
- ComponentRenderer - Renders individual components
- Template expression resolver for data binding
- Complete integration examples

## 🎯 Key Concepts

### Data-Driven UI
All UI components in ObjectStack are **metadata-driven** - they are defined as JSON/TypeScript configurations rather than hardcoded implementations. This enables:

- **Zero-Code Customization**: Modify UIs without changing source code
- **Version Control**: Track UI changes like any other code
- **Dynamic Generation**: Build UIs programmatically
- **Multi-tenant Isolation**: Different UIs for different customers

### Separation of Concerns

The UI Protocol is completely decoupled from:
- **Data Protocol**: Business objects and logic
- **System Protocol**: Runtime configuration
- **Implementation**: Can be rendered by any frontend (React, Vue, Angular)

### Best Practices Alignment

ObjectStack UI Protocol draws inspiration from industry leaders:

| Feature | Salesforce | ServiceNow | ObjectStack |
|---------|-----------|-----------|-------------|
| List Views | List Views | Lists | `ListView` (grid, kanban, calendar) |
| Record Pages | Lightning Pages | Forms | `Page` (regions + components) |
| Dashboards | Dashboards | Performance Analytics | `Dashboard` (widgets) |
| Actions | Quick Actions | UI Actions | `Action` (modal, flow, script) |
| Apps | Lightning Apps | Applications | `App` (navigation + branding) |

## 🚀 Usage Examples

### Basic Grid View
```typescript
import { ListView } from '@objectstack/spec/ui';

const taskGridView: ListView = {
  type: 'grid',
  columns: ['subject', 'status', 'priority', 'due_date'],
  filter: [{ field: 'status', operator: '$ne', value: 'completed' }],
  sort: [{ field: 'due_date', order: 'asc' }],
};
```

### Kanban Board
```typescript
const opportunityKanban: ListView = {
  type: 'kanban',
  columns: ['name', 'amount', 'close_date'],
  kanban: {
    groupByField: 'stage',
    summarizeField: 'amount',
    columns: ['name', 'amount', 'account_name'],
  },
};
```

### Interactive Dashboard
```typescript
import { Dashboard } from '@objectstack/spec/ui';

const salesDashboard: Dashboard = {
  name: 'sales_overview',
  label: 'Sales Overview',
  widgets: [
    {
      title: 'Total Revenue',
      type: 'metric',
      object: 'opportunity',
      valueField: 'amount',
      aggregate: 'sum',
      layout: { x: 0, y: 0, w: 3, h: 2 },
    },
    // ... more widgets
  ],
};
```

### Custom Action
```typescript
import { Action } from '@objectstack/spec/ui';

const convertLeadAction: Action = {
  name: 'convert_lead',
  label: 'Convert Lead',
  type: 'flow',
  target: 'lead_conversion_flow',
  locations: ['record_header', 'list_item'],
  visible: 'status = "qualified"',
};
```

## 🔗 Integration with Data Protocol

UI components reference objects and fields defined in the Data Protocol:

```typescript
// Data Protocol defines the object
import { ObjectSchema, Field } from '@objectstack/spec/data';

const Task = ObjectSchema.create({
  name: 'task',
  fields: {
    subject: Field.text({ required: true }),
    status: Field.select({ options: [...] }),
    priority: Field.number({ min: 1, max: 5 }),
  },
});

// UI Protocol defines how to display it
const taskListView: ListView = {
  type: 'grid',
  data: { provider: 'object', object: 'task' },
  columns: ['subject', 'status', 'priority'],
};
```

## 📖 Learning Path

1. **Start Simple**: Review `view.examples.ts` for basic list and form views
2. **Add Interactivity**: Explore `action.examples.ts` for user interactions
3. **Build Analytics**: Study `dashboard.examples.ts` for reporting
4. **Compose Layouts**: Check `page.examples.ts` for advanced layouts
5. **Complete Apps**: See `app.examples.ts` for full application structure

## 🎨 Visual Customization

### Theme Variables
```typescript
const customTheme = {
  colors: {
    primary: '#4169E1',
    secondary: '#9370DB',
    success: '#00AA00',
    danger: '#FF0000',
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Roboto, sans-serif',
  },
};
```

### App Branding
```typescript
const salesApp = {
  name: 'sales_crm',
  branding: {
    primaryColor: '#4169E1',
    logo: '/assets/sales-logo.png',
    favicon: '/assets/sales-favicon.ico',
  },
};
```

## 🔍 Advanced Features

### Dynamic Data Sources
```typescript
// Use custom API instead of ObjectStack metadata
const customListView: ListView = {
  type: 'grid',
  data: {
    provider: 'api',
    read: {
      url: '/api/external/data',
      method: 'GET',
      headers: { 'X-API-Key': '{api_key}' },
    },
  },
  columns: ['id', 'name', 'value'],
};
```

### Conditional Visibility
```typescript
const adminAction: Action = {
  name: 'delete_all',
  label: 'Delete All',
  type: 'script',
  visible: 'user.role = "admin" AND user.department = "engineering"',
  locations: ['list_toolbar'],
};
```

### Multi-level Navigation
```typescript
navigation: [
  {
    id: 'sales',
    type: 'group',
    label: 'Sales',
    children: [
      { id: 'leads', type: 'object', objectName: 'lead' },
      { id: 'accounts', type: 'object', objectName: 'account' },
      {
        id: 'reports',
        type: 'group',
        label: 'Reports',
        children: [
          { id: 'sales_report', type: 'dashboard', dashboardName: 'sales_dashboard' },
        ],
      },
    ],
  },
]
```

## 📝 Directory Structure

```
examples/ui/
├── README.md                 # This file
├── metadata-examples/        # UI metadata configurations
│   ├── README.md
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── view.examples.ts      # List, Form, Kanban, Calendar views
│       ├── page.examples.ts      # Record, Home, App pages
│       ├── dashboard.examples.ts # Widgets and analytics
│       ├── action.examples.ts    # Buttons and interactions
│       ├── app.examples.ts       # Application structure
│       └── theme.examples.ts     # Visual styling
├── custom-components/        # React component implementations
│   ├── README.md
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── components/
│       │   ├── CustomButton.tsx
│       │   └── CustomDataGrid.tsx
│       └── registry.ts       # Component registration
└── react-renderer/          # React renderer for metadata
    ├── README.md
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── renderers/
        │   ├── PageRenderer.tsx
        │   └── ComponentRenderer.tsx
        ├── utils/
        │   └── templateResolver.ts
        └── examples/
            └── SimpleApp.tsx
```

## 🚀 Quick Start

### 1. View Metadata Examples

Explore the TypeScript metadata configurations:

```bash
cd metadata-examples
npm install
npm run build
# View the examples in src/
```

### 2. Custom Components

See how to implement custom React components:

```bash
cd custom-components
npm install
npm run dev
```

### 3. React Renderer

See how to render metadata with React:

```bash
cd react-renderer
npm install
npm run dev
```


## 🤝 Related Examples

- **`examples/crm`**: Full CRM application using these UI patterns
- **`examples/todo`**: Simple Todo app demonstrating basic UI
- **`examples/modern-fields`**: Modern field types and validation

## 📚 References

- [UI Protocol Specification](../../packages/spec/src/ui/)
- [Data Protocol Specification](../../packages/spec/src/data/)
- [ObjectStack Architecture](../../ARCHITECTURE.md)
- [Salesforce Lightning Design System](https://www.lightningdesignsystem.com/)
- [ServiceNow UI Builder](https://docs.servicenow.com/bundle/washington-application-development/page/administer/ui-builder/concept/ui-builder.html)

## 🛠️ Building Examples

```bash
# Install dependencies
pnpm install

# Build this example
cd examples/ui
pnpm build

# Build all examples
pnpm -r build
```

## 💡 Contributing

These examples are designed to be comprehensive learning resources. When adding new examples:

1. **Follow naming conventions**: Use `camelCase` for configuration properties
2. **Add comments**: Explain WHY, not just WHAT
3. **Show variations**: Demonstrate multiple approaches
4. **Keep it real**: Use realistic business scenarios
5. **Reference standards**: Link to Salesforce/ServiceNow equivalents when applicable
