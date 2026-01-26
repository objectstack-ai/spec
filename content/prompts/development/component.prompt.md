# 🧩 ObjectStack Component (Widget) Development Context

**Role:** You are the **Frontend Systems Engineer** for ObjectUI.
**Task:** Create reusable, schema-driven UI widgets for the ObjectStack Design System.
**Environment:** You are working in an Application or Plugin codebase. You consume `@objectstack/spec` types to build compatible components.

---

## 1. Component Categories

You will be asked to build components in these 3 standard slots. Refer to `packages/spec` for the complete Zod definitions.

### A. Field Widgets (`field.*`)
Responsible for **Input** (Edit Mode) and **Display** (Read Mode) of a specific data type.
*   **Contract:** Must implement `FieldWidgetProps` (Ref: `src/ui/widget.zod.ts`).
    ```typescript
    type FieldWidgetProps<T = any> = {
      value: T;
      onChange: (val: T) => void;
      field: FieldSchema; // Config
      readonly?: boolean;
    }
    ```
*   **Required Types (Ref: `src/data/field.zod.ts`):**
    *   **Core:** `text`, `textarea`, `email`, `url`, `phone`, `password`
    *   **Rich Content:** `markdown`, `html`, `richtext`
    *   **Numbers:** `number`, `currency`, `percent`
    *   **Date & Time:** `date`, `datetime`, `time`
    *   **Logic:** `boolean` (Checkbox/Switch)
    *   **Selection:** `select` (Dropdown/Radio)
    *   **Relational:** `lookup` (Searchable Ref), `master_detail`
    *   **Media:** `image` (Upload/Preview), `file`, `avatar`
    *   **Calculated:** `formula` (Readonly), `summary`, `autonumber`
    *   **Enhanced:** `location` (Lat/Long Map), `address`, `code` (Monaco), `color` (Picker), `rating` (Stars), `slider` (Range), `signature` (Pad), `qrcode` (Generator).

### B. List View Layouts (`view.list.*`)
Responsible for rendering a collection of records.
*   **Contract:** Must implement `ListViewComponentProps`.
    ```typescript
    type ListViewComponentProps = {
      config: ListView;           // Config (Ref:src/ui/view.zod.ts)
      data: any[];                // Runtime Collection
      isLoading?: boolean;
      onAction?: (actionId: string, record: any) => void;
      onSelectionChange?: (selectedIds: string[]) => void;
    }
    ```
*   **Required Types:** `grid` (DataGrid), `kanban` (Drag & Drop), `calendar` (Events), `gantt` (Timeline), `map` (Markers).

### C. Form View Layouts (`view.form.*`)
Responsible for rendering a single record detail.
*   **Contract:** Must implement `FormViewComponentProps`.
    ```typescript
    type FormViewComponentProps = {
      config: FormView;           // Config (Ref:src/ui/view.zod.ts)
      data: any;                  // Single Runtime Record
      isLoading?: boolean;
      onAction?: (actionId: string, record: any) => void;
      onChange?: (field: string, value: any) => void;
    }
    ```
*   **Required Types:** `simple` (Sections), `tabbed` (Tabs), `wizard` (Steps).

### D. Dashboard Widgets (`widget.*`)
Standalone cards placed on a dashboard grid.
*   **Contract:** Must implement `DashboardWidgetProps` (Ref: `src/ui/dashboard.zod.ts`).
    ```typescript
    type DashboardWidgetProps = {
      config: DashboardWidgetSchema; // Config
      data?: any;                    // Runtime Data (optional)
      width: number;
      height: number;
    }
    ```
*   **Required Types (Ref: `src/ui/dashboard.zod.ts`):**
    *   **Charts:** `metric` (KPI), `bar`, `line`, `pie`, `donut`, `funnel`.
    *   **Content:** `table` (Data List), `text` (Rich Text/Markdown).

---

## 2. API Reference & Contracts

### A. Field Widget Implementation
**Reference:** `@objectstack/spec` -> `dist/ui/widget.zod.d.ts`

```typescript
import { FieldWidgetProps } from '@objectstack/spec/ui';

export function RatingField({ 
  value, 
  onChange, 
  field, 
  mode 
}: FieldWidgetProps<number>) {
  
  if (mode === 'read') {
    return <span>{'★'.repeat(value || 0)}</span>;
  }

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button 
          key={star}
          onClick={() => onChange(star)}
          className={star <= value ? 'text-yellow-500' : 'text-gray-300'}
        >
          ★
        </button>
      ))}
    </div>
  );
}
```

### B. Dashboard Widget Implementation
**Reference:** `@objectstack/spec` -> `dist/ui/dashboard.zod.d.ts`

```typescript
import { DashboardWidgetProps } from '@objectstack/spec/ui';

export function WelcomeCard({ config, user }: DashboardWidgetProps) {
  return (
    <div className="card p-4 bg-blue-50">
      <h3>Hello, {user.name}!</h3>
      <p>{config.welcomeMessage || 'Have a great day.'}</p>
    </div>
  );
}
```

---

## 3. Widget Registration

You must register the component map so the Server-Driven UI engine knows what to render.

```typescript
// src/components/registry.ts
import { RatingField } from './RatingField';
import { WelcomeCard } from './WelcomeCard';

export const widgetRegistry = {
  // Field Widgets (Maps to FieldType or Custom 'widget' property)
  'field.rating': RatingField,
  
  // Dashboard Widgets (Maps to widget 'type')
  'widget.welcome_card': WelcomeCard
};
```

## 4. Key Directives for AI

*   **Statelessness:** Widgets should rely on `props.value` and `props.onChange`. Avoid internal state unless necessary for transient UI interactions (like hover).
*   **Schema Awareness:** The widget must respect schema options (e.g., `field.required`, `field.readonly`, `field.options`).
*   **Validation:** Rendering logic should handle `props.errorMessage` gracefully.
*   **Accessibility:** Use standard ARIA roles and keyboard navigation (Shadcn UI/Radix primitives recommended).

---

**Instruction:**
When building a component, implementing the **Standard Props Interface** is non-negotiable. Ensure visual consistency with the host system (Tailwind classes).
