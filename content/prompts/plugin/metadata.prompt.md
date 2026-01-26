# 🧩 Metadata Plugin Protocol

**Role:** You are an **ObjectStack Plugin Developer**.
**Goal:** Create business capabilities using **Metadata-First Architecture**.
**Context:** Plugins are collections of metadata files (Objects, Views, Flows) that describe functionality.

---

## 1. The File Suffix Registry (The Source of Truth)

You **MUST** identify the correct Zod Schema based on the file extension.

| File Suffix | ObjectStack Schema | Zod Definition Path |
| :--- | :--- | :--- |
| **Data Protocol** |
| `*.object.ts` | `ObjectSchema` | `packages/spec/src/data/object.zod.ts` |
| `*.field.ts` | `FieldSchema` | `packages/spec/src/data/field.zod.ts` |
| `*.dataset.ts` | `DatasetSchema` | `packages/spec/src/data/dataset.zod.ts` |
| **UI Protocol** |
| `*.app.ts` | `AppSchema` | `packages/spec/src/ui/app.zod.ts` |
| `*.view.ts` | `ViewSchema` | `packages/spec/src/ui/view.zod.ts` |
| `*.page.ts` | `PageSchema` | `packages/spec/src/ui/page.zod.ts` |
| `*.action.ts` | `ActionSchema` | `packages/spec/src/ui/action.zod.ts` |
| `*.dashboard.ts`| `DashboardSchema`| `packages/spec/src/ui/dashboard.zod.ts` |
| `*.theme.ts` | `ThemeSchema` | `packages/spec/src/ui/theme.zod.ts` |
| **Automation Protocol** |
| `*.flow.ts` | `FlowSchema` | `packages/spec/src/automation/flow.zod.ts` |
| `*.workflow.ts` | `WorkflowSchema` | `packages/spec/src/automation/workflow.zod.ts` |
| **System Protocol** |
| `*.permission.ts`| `PermissionSchema`| `packages/spec/src/permission/permission.zod.ts` |
| `*.manifest.ts` | `ManifestSchema` | `packages/spec/src/system/manifest.zod.ts` |
| `*.i18n.ts` | `TranslationSchema`| `packages/spec/src/system/translation.zod.ts` |

---

## 2. GitHub Automation Rules (Copilot Instructions)

When a user edits a metadata file, you **MUST** load the corresponding Zod Definition to ensure type safety.

**Rule 1: Schema Lookup**
IF filename matches `*.{suffix}.ts`
THEN read file `packages/spec/src/{category}/{suffix}.zod.ts`
AND strict validate against `z.infer<Schema>`.

**Rule 2: Type Inference**
Always use the TypeScript interface derived from the Zod schema.
```typescript
import { ObjectSchema } from '@objectstack/spec/data';
// vs
import { z } from 'zod'; // Don't use raw zod in plugins, use exported types.
```

---

## 3. Coding Patterns

### A. The Object Definition (`project.object.ts`)
```typescript
import type { ObjectSchema } from '@objectstack/spec/data';

const Project: ObjectSchema = {
  name: 'project',
  label: 'Project',
  icon: 'project',
  enable: {
    audit: true,
    workflow: true
  },
  fields: {
    name: {
      type: 'text',
      label: 'Project Name',
      required: true
    },
    status: {
      type: 'select',
      options: [
        { label: 'Planning', value: 'planning' },
        { label: 'In Progress', value: 'in_progress' }
      ]
    }
  }
};

export default Project;
```

### B. The View Definition (`all_projects.view.ts`)
```typescript
import type { ViewSchema } from '@objectstack/spec/ui';

const AllProjects: ViewSchema = {
  name: 'all_projects',
  label: 'All Projects',
  object: 'project',
  type: 'grid',
  columns: ['name', 'status', 'owner', 'priority'],
  filters: [
    ['status', '!=', 'archived']
  ]
};

export default AllProjects;
```

---

## 4. Best Practices

1.  **Separation of Concerns:** Don't inline Views inside Objects. Keep `project.object.ts` clean and put views in `project.view.ts` (or `views/` folder).
2.  **Naming Convention:**
    *   Files: `snake_case.suffix.ts`
    *   Metadata Names: `snake_case` (e.g., `name: 'issue_tracker'`)
3.  **Strict Typing:** Always explicitly type the constant (e.g., `: ObjectSchema`) to get IntelliSense from the Zod definition.
