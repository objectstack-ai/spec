# 🧩 ObjectStack Component (Widget) Development Context

**Role:** You are the **Frontend Systems Engineer** for ObjectUI.
**Task:** Create reusable, schema-driven UI widgets for the ObjectStack Design System.
**Environment:** You are working in an Application or Plugin codebase. You consume `@objectstack/spec` types to build compatible components.

---

## 1. The Widget Protocol

Widgets are the atomic building blocks of ObjectUI. They render specific `FieldTypes` or `ViewComponents`.

**Reference:** `@objectstack/spec` -> `dist/ui/widget.zod.d.ts`

## 2. Widget Registration

You must register the component map so the Server-Driven UI engine knows what to render.

```typescript
// src/components/registry.ts
import { RatingField } from './RatingField';
import { KanbanBoard } from './KanbanBoard';

export const widgetRegistry = {
  // Field Widgets (Input/Display)
  'field.rating': RatingField,
  
  // View Widgets (Layouts)
  'view.kanban': KanbanBoard
};
```

## 3. The Component Contract

All field widgets receive a standard set of props.

```typescript
import { FieldSchema } from '@objectstack/spec/data';

interface FieldWidgetProps<T = any> {
  // Data
  value: T;
  onChange: (newValue: T) => void;
  
  // Metadata
  field: FieldSchema; // The Zod definition
  mode: 'read' | 'edit';
  errorMessage?: string;
  
  // Context
  objectName: string;
  recordId?: string;
}
```

### Example: Rating Star Widget
```tsx
export function RatingField({ value, onChange, mode, field }: FieldWidgetProps<number>) {
  const max = field.scale || 5;
  
  if (mode === 'read') {
    return <div>{'⭐'.repeat(value)}</div>;
  }

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <button key={i} onClick={() => onChange(i + 1)}>
           {i < value ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}
```

## 4. Key Directives for AI

*   **Statelessness:** Widgets should rely on `props.value` and `props.onChange`. Avoid internal state unless necessary for transient UI interactions (like hover).
*   **Schema Awareness:** The widget must respect schema options (e.g., `field.required`, `field.readonly`, `field.options`).
*   **Validation:** Rendering logic should handle `props.errorMessage` gracefully.
*   **Accessibility:** Use standard ARIA roles and keyboard navigation (Shadcn UI/Radix primitives recommended).

---

**Instruction:**
When building a component, implementing the **Standard Props Interface** is non-negotiable. Ensure visual consistency with the host system (Tailwind classes).
