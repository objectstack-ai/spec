# ObjectStack UI Protocol Examples

This directory contains comprehensive examples demonstrating the **UI Protocol** of ObjectStack - the presentation layer that defines how users interact with data.

## 📚 What's Inside

This example package demonstrates all major UI components of the ObjectStack Protocol:

### 1. **Views** (`view.examples.ts`)
Different ways to display and interact with data:
- **Grid View**: Traditional table/spreadsheet layout
- **Kanban View**: Card-based workflow boards
- **Calendar View**: Time-based event visualization
- **Gantt View**: Project timeline visualization
- **Custom Data Sources**: Using API providers and static data

### 2. **Pages** (`page.examples.ts`)
Component composition patterns inspired by Salesforce Lightning Pages:
- **Record Pages**: Contextual layouts for viewing/editing records
- **Home Pages**: Dashboard-style landing pages
- **App Pages**: Custom application screens
- **Component Regions**: Flexible layout templates

### 3. **Dashboards** (`dashboard.examples.ts`)
Analytics and metrics visualization:
- **Widget Types**: Metrics, charts (bar, line, pie, donut, funnel), tables
- **Filters**: Dynamic data filtering
- **Layout Grid**: Responsive dashboard layouts
- **Real-time Metrics**: KPIs and business intelligence

### 4. **Actions** (`action.examples.ts`)
User interactions and workflows:
- **Button Actions**: Custom buttons with various triggers
- **Modal Actions**: Forms and dialogs
- **Flow Actions**: Visual workflow execution
- **Script Actions**: Custom JavaScript execution
- **Batch Actions**: Mass operations on records

### 5. **Apps** (`app.examples.ts`)
Complete application structure:
- **Navigation Trees**: Hierarchical menus with groups
- **App Branding**: Custom colors, logos, themes
- **Multi-app Architecture**: Switching between business contexts
- **Permission-based Access**: Role-based app visibility

### 6. **Themes** (`theme.examples.ts`)
Visual styling and customization:
- **Color Palettes**: Primary, secondary, accent colors
- **Typography**: Font families and sizing
- **Component Styles**: Button variants, borders, shadows
- **Dark Mode**: Theme switching

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

## 📝 File Structure

```
examples/ui/
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript configuration
├── README.md              # This file
└── src/
    ├── view.examples.ts      # List, Form, Kanban, Calendar views
    ├── page.examples.ts      # Record, Home, App pages
    ├── dashboard.examples.ts # Widgets and analytics
    ├── action.examples.ts    # Buttons and interactions
    ├── app.examples.ts       # Application structure
    └── theme.examples.ts     # Visual styling
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
