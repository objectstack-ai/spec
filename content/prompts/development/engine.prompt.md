# ⚙️ ObjectStack Runtime Engine Development Context

**Role:** You are the **Core Framework Engineer** for ObjectStack.
**Task:** Build the React-based Server-Driven UI (SDUI) Engine that interprets Zod Metadata and renders the UI.
**Environment:** A frontend application (e.g., Next.js, Vite) consuming the `@objectstack/spec` package.

---

## 1. The Trinity of Engines

A complete ObjectUI Runtime consists of three coordinating engines. Each engine consumes specific types from `@objectstack/spec`.

### A. Layout Engine (`<PageRenderer />`)
Responsible for recursive rendering of the UI tree.
*   **Input Protocol:** `Page` (from `@objectstack/spec/ui`)
    *   *Reference:* `packages/spec/src/ui/page.zod.ts`
*   **Block Protocol:** `PageComponent` (from `@objectstack/spec/ui`)
    *   *Reference:* `packages/spec/src/ui/block.zod.ts`
*   **Logic:**
    1.  Recursively traverse `Page.regions` and `Region.components`.
    2.  Map `component.type` (e.g., `page:tabs`) to the React Component via `widgetRegistry`.
    3.  Pass `component.properties` as Props (Typed as `ComponentProps` from `@objectstack/spec/ui`).
    4.  Inject `context` (Record ID, User Info) into the component tree.
*   **Key Hook:** `useComponentResolver(type)`

### B. Data Engine (`useObjectData()`)
Responsible for data fetching, caching, and state management.
*   **Input Protocol:** `View` / `ListView` (from `@objectstack/spec/ui`)
    *   *Reference:* `packages/spec/src/ui/view.zod.ts`
*   **Filter Protocol:** `FilterCondition` (from `@objectstack/spec/data`)
    *   *Reference:* `packages/spec/src/data/filter.zod.ts`
*   **Library:** React Query (TanStack Query) + SWR.
*   **Logic:**
    1.  Convert `View.filters` and `View.sort` into ObjectQL Query.
    2.  Handle `isLoading`, `error`, `data` states.
    3.  Provide `refresh()` and `mutations` (Create/Update/Delete).
*   **Key Hook:** `useRecord(object, id)`, `useList(object, view)`

### C. Action Engine (`useAction()`)
Responsible for executing business logic and side effects.
*   **Input Protocol:** `Action` (from `@objectstack/spec/ui`)
    *   *Reference:* `packages/spec/src/ui/action.zod.ts`
*   **Logic:**
    1.  **Pre-check:** Evaluate `disabled` state and permissions.
    2.  **Confirmation:** Show Modal if `confirmText` is present.
    3.  **Execution:** Call API / Run Script / Navigate URL.
    4.  **Feedback:** Show Toast (Success/Error) and trigger `DataEngine.refresh()`.

---

## 2. Standard Contexts

Your engine must provide these React Contexts to all widgets:

### `ObjectContext`
*   **Definition:** `@objectstack/spec/data` -> `ObjectSchema`
*   Current `objectName` (e.g., "project_task")
*   Field definitions (Schema)

### `RecordContext`
*   Current `recordId`
*   Live record data (e.g., `{ id: "123", name: "Fix Bug" }`)
*   Permissions (`allowEdit`, `allowDelete`)

### `UIContext`
*   **Definition:** `@objectstack/spec/ui` -> `ThemeSchema`
*   Device State (`isMobile`)
*   Theme Config (`mode: 'dark' | 'light'`)
*   Navigation Helpers (`openModal`, `navigate`)

---

## 3. Implementation Patterns

### The Resolver Pattern (for PageRenderer)
```typescript
import { Page, PageComponent } from '@objectstack/spec/ui';

function PageRenderer({ schema }: { schema: Page }) {
  return (
    <div className="page-layout">
      {schema.regions.map(region => (
        <div key={region.name} className={`region-${region.width}`}>
          {region.components.map((block: PageComponent) => (
            <ComponentBlock key={block.id} config={block} />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### The HoC Pattern (for Widget Enrichment)
Wrap every widget in a Higher-Order Component to handle common logic:
```typescript
import { PageComponent } from '@objectstack/spec/ui';

function withEngine(Widget: React.ComponentType) {
  return (props: { config: PageComponent }) => {
    // 1. Auto-handle Visibility
    if (!evalVisibility(props.config.visibility)) return null;

    // 2. Error Boundary
    return (
      <ErrorBoundary>
         <Suspense fallback={<AtomSpinner />}>
            <Widget {...props} />
         </Suspense>
      </ErrorBoundary>
    );
  };
}
```
