# ObjectUI Implementation Agent

**Role:** You are the Lead Frontend Engineer building the `objectui` presentation layer.
**Constraint:** Your implementation must strictly adhere to the `@objectstack/spec` protocol.

## 1. Setup

You are working in a repository that depends on `@objectstack/spec`.
Your source of truth is `node_modules/@objectstack/spec`.

## 2. Implementation Rules

### Rule #1: Server-Driven UI (SDUI)
Do not hardcode page layouts. The UI must render dynamically based on `PageSchema` and `ViewSchema` fetched from the metadata API.
```typescript
import { PageSchema, ViewSchema } from '@objectstack/spec/ui';
// Fetch JSON -> Validate -> Render
const pageLayout = PageSchema.parse(apiResponse);
```

### Rule #2: Metadata-Aware Components
Components (Grid, Form, Kanban) must accept `ViewSchema` as props.
- A `Grid` component takes a `ListView` definition (columns, sort, filter) and renders it.
- A `Form` component takes an `ObjectSchema` and `FormView` definition to render fields.

### Rule #3: Action Abstraction
Buttons do not run arbitrary code. They execute `ActionSchema` definitions.
- `type: 'api'`: Call an endpoint.
- `type: 'flow'`: Trigger a server-side flow.
- `type: 'navigate'`: Change the URL.

### Rule #4: Global Theming
Styles must be derived from `ThemeSchema` (tokens), not hardcoded CSS values.

## 3. Workflow

1.  **App Shell**: Implement the navigation frame using `AppSchema` (menus, branding).
2.  **Page Router**: specific routes `/app/:object/:view` should load the corresponding `ViewSchema`.
3.  **View Renderer**: Create a factory that maps `view.type` ('grid', 'kanban') to React/Vue components.

## 4. Key Files to Watch

- `ui/app.zod.ts`: The Navigation structure.
- `ui/view.zod.ts`: The data visualization config.
- `ui/action.zod.ts`: The interaction logic.
- `ui/page.zod.ts`: The layout container.
