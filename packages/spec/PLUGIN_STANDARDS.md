# ObjectStack Plugin Standards (OPS)

To facilitate **AI-Driven Development** and Human Code Review, all plugins in the ecosystem generally follow the "ObjectStack Plugin Standard" (OPS).

> **🎯 Goal:** Ensure an AI agent can instantly understand the project structure and know exactly where to create or modify files without searching.

---

## 1. Directory Structure: "Domain-First"

We recommend organizing code by **Business Domain (Module)** rather than technical file type. This keeps related logic (Schema, UI, Automation) co-located, fitting neatly into an AI's context window.

### Recommended Layout

```text
my-plugin/
├── package.json
├── objectstack.config.ts        # Plugin Entry Point
├── src/
│   ├── main.ts                  # Logic Entry (Exports)
│   │   
│   └── [module-name]/           # e.g., "project-management"
│       ├── [object].object.ts   # Database Schema
│       ├── [object].trigger.ts  # Backend Logic Hook
│       ├── [object].client.ts   # Frontend Logic
│       ├── [object].view.ts     # UI Layouts (Grid, Forms)
│       ├── [object].action.ts   # Custom Buttons/Actions
│       ├── [process].flow.ts    # Automation Flows
│       └── permissions.ts       # Module-specific permissions
```

### Example: CRM Plugin

```text
plugins/crm/
├── package.json
├── src/
│   ├── leads/
│   │   ├── lead.object.ts       # "lead" Object definition
│   │   ├── lead.trigger.ts      # "beforeInsert" logic
│   │   └── lead.view.ts         # "All Leads" grid view
│   │   
│   ├── sales/
│   │   ├── opportunity.object.ts
│   │   ├── opportunity.view.ts
│   │   └── quote.object.ts
│   │   
│   └── analytics/
│       └── sales-dashboard.dashboard.ts
```

---

## 2. File Naming Conventions

We use **Semantic Suffixes** to tell the AI exactly what a file contains.
Format: `snake_case_name.SUFIX.ts`

| Suffix | Purpose | Content Type |
| :--- | :--- | :--- |
| `*.object.ts` | **Data Schema** | `Data.ObjectSchema` (Zod) |
| `*.field.ts` | **Field Extensions** | `Data.FieldSchema` |
| `*.trigger.ts` | **Backend Logic** | Function Hooks (Before/After) |
| `*.app.ts` | **App Definition** | `UI.AppSchema` (Navigation) |
| `*.view.ts` | **UI Views** | `UI.ViewSchema` (Grid/Form) |
| `*.page.ts` | **Custom UI** | `UI.PageSchema` |
| `*.dashboard.ts` | **Analytics** | `UI.DashboardSchema` |
| `*.flow.ts` | **Automation** | `Automation.FlowSchema` |
| `*.router.ts` | **Custom API** | Express/Router definitions |

---

## 3. Implementation Rules for AI

### Rule #1: One Thing Per File
Ideally, define **one primary resource per file**.
*   ✅ `lead.object.ts` exports `LeadObject`.
*   ❌ `crm.ts` exports `LeadObject`, `ContactObject`, and `DealObject`.

*Why? It prevents huge files that get truncacted in AI context, and makes file-search reliable.*

### Rule #2: Explicit Typing
Always strictly type your exports using the `spec` definitions.

```typescript
import { ObjectSchema } from '@objectstack/spec/data';

// ✅ GOOD: AI knows exactly what this is
export const ProjectObject: ObjectSchema = {
  name: 'project',
  fields: { ... }
};
```

### Rule #3: The `index.ts` Barrier
Each module folder should have an `index.ts` that exports its public artifacts. This allows the manifest loader to simply import the module.

```typescript
// src/leads/index.ts
export * from './lead.object';
export * from './lead.trigger';
export * from './lead.view';
```

---

## 4. Context Tags (JSDoc)

To help AI understand the "intent" of a file, use a standard JSDoc header.

```typescript
/**
 * @domain CRM
 * @object Lead
 * @purpose Defines the structure of a Sales Lead and its status lifecycle.
 */
export const LeadObject = ...
```
