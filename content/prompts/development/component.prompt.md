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
    *   **Textual:** `text` (Input), `textarea` (Multi-line), `password`, `email`, `url`, `phone`.
    *   **Rich Content:** `markdown` (Editor), `html` (WYSIWYG), `code` (Monaco/Ace).
    *   **Numeric:** `number` (Int/Float), `currency` (Money), `percent` (Progress), `slider` (Range).
    *   **Selection:** 
        *   `boolean` (Switch/Toggle), `checkboxes` (Group).
        *   `select` (Dropdown), `multiselect` (Tags), `radio` (Cards).
    *   **Date & Time:** `date` (Picker), `datetime`, `time`, `duration`.
    *   **Relational:** `lookup` (Modal/Combobox), `master_detail` (Inline), `tree` (Hierarchy).
    *   **Media:** `image` (Upload/Gallery), `file` (Drag&Drop), `video` (Player), `audio`, `avatar`.
    *   **Visual:** `color` (Picker), `rating` (Star), `signature` (Canvas), `qrcode`, `progress`.
    *   **Structure:** `json` (Object Editor), `address` (Street/City/State), `location` (Map Pin).

### B. View Layouts (`view.*`)
Responsible for rendering records. The specific `type` determines the Props contract.

#### 1. List Views (Collection)
*   **Keys:** `view.grid`, `view.kanban`, `view.map`, `view.calendar`, `view.gantt`, etc.
*   **Contract:** Must implement `ListViewComponentProps`.
    ```typescript
    type ListViewComponentProps = {
      config: ListView;           // Config (e.g. { type: 'grid', columns: [...] })
      data: any[];                // Runtime Collection
      isLoading?: boolean;
      onAction?: (actionId: string, record: any) => void;
      onSelectionChange?: (selectedIds: string[]) => void;
    }
    ```
*   **Required Types (Ref: `src/ui/view.zod.ts`):** `grid`, `spreadsheet`, `kanban`, `gallery`, `calendar`, `timeline`, `gantt`, `map`.

#### 2. Form Views (Detail)
*   **Keys:** `view.simple`, `view.wizard`, `view.tabbed`, `view.drawer`, etc.
*   **Contract:** Must implement `FormViewComponentProps`.
    ```typescript
    type FormViewComponentProps = {
      config: FormView;           // Config (e.g. { type: 'simple', sections: [...] })
      data: any;                  // Single Runtime Record
      isLoading?: boolean;
      onAction?: (actionId: string, record: any) => void;
      onChange?: (field: string, value: any) => void;
    }
    ```
*   **Required Types (Ref: `src/ui/view.zod.ts`):** `simple`, `tabbed`, `wizard`, `split`, `drawer`, `modal`.

### D. Page Components (`page.*`)
Reusable UI blocks for the Drag-and-Drop Page Builder.
*   **Contract:** Must implement `PageComponentProps`.
    ```typescript
    type PageComponentProps = {
      id: string;                 // Instance ID
      type: string;               // Component Type Name
      properties: Record<string, any>; // User Config
      context?: {                 // Runtime Context
        objectName?: string;
        recordId?: string;
      };
    }
    ```
*   **Standard Components Library:**
    *   **Structure:** `page.header`, `page.footer`, `page.sidebar`, `page.tabs`, `page.accordion`, `page.card`.
    *   **Record Context:** 
        *   `record.details` (The form), `record.highlights` (Key fields header).
        *   `record.related_list` (Sub-grid), `record.activity` (Timeline).
        *   `record.chatter` (Feed), `record.path` (Status Steps).
    *   **Navigation:** `app.launcher`, `nav.menu`, `nav.breadcrumb`.
    *   **Utility:** `global.search`, `global.notifications`, `user.profile`.

### E. Dashboard Widgets (`widget.*`)
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
    *   **KPI:** `metric` (Big Number with Trend).
    *   **Charts:** `bar`, `line`, `pie`, `funnel`, `radar`, `scatter`, `heatmap`.
    *   **Analysis:** `pivot` (Cross-Tab Table).
    *   **Content:** `table` (List), `text` (Note), `image`, `frame` (Embed).

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
