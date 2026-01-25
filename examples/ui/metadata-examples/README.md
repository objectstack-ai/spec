# UI Protocol Metadata Examples

This package contains TypeScript/JSON metadata examples demonstrating the ObjectStack UI Protocol.

## What's Inside

These are **configuration examples** (not implementations) showing how to define UI components using the ObjectStack metadata format:

- **view.examples.ts** - 17 examples: Grid, Kanban, Calendar, Gantt views with various data providers
- **action.examples.ts** - 22 examples: Modal, Flow, Script, URL, and Batch actions
- **dashboard.examples.ts** - 6 dashboards: Sales, Service, Executive, Marketing, and Team productivity
- **page.examples.ts** - 9 page layouts: Record, Home, App, and Utility pages
- **app.examples.ts** - 7 applications: Simple to comprehensive apps with hierarchical navigation
- **theme.examples.ts** - 7 themes: Light, dark, colorful, minimal, and WCAG AAA compliant

## Usage

These are metadata definitions that describe the UI structure. To actually render them, see:

- `../custom-components/` - React component implementations
- `../react-renderer/` - How to render this metadata with React

## Example

```typescript
import { ListView } from '@objectstack/spec/ui';

// Grid view with custom API data source
const ExternalApiGridView: ListView = {
  type: 'grid',
  data: {
    provider: 'api',
    read: {
      url: 'https://api.example.com/customers',
      headers: { 'Authorization': 'Bearer {token}' },
    },
  },
  columns: ['id', 'company_name', 'email', 'total_orders'],
};
```

## Building

```bash
npm install
npm run build
```

## Related Examples

- `../custom-components/` - Custom React component implementations
- `../react-renderer/` - React renderer for metadata
- `../../crm/` - Complete CRM application example
