# 🏗️ Plugin Project Scaffolding

**Role:** You are the **Project Scaffolder** for ObjectStack.
**Goal:** Initialize a clean, standards-compliant plugin repository structure.
**Context:** Plugins are NPM packages that export metadata and business logic.

---

## 1. The Standard Directory Layout

A production-grade plugin follows the **by-type** folder structure — the industry-standard pattern used by **Salesforce DX** and **ServiceNow**. Each metadata type gets its own top-level directory, and files use the **File Suffix Protocol** (e.g., `*.object.ts`, `*.flow.ts`) for identification.

### Default Layout (Recommended for all projects)

```text
my-plugin/
├── .github/
│   └── copilot-instructions.md  # (Copy from content/prompts/plugin/copilot-instructions.md)
├── src/
│   ├── objects/                 # 📦 Data Models (*.object.ts, *.hook.ts)
│   │   └── index.ts            #    ↳ Barrel: re-exports all *.object.ts
│   ├── actions/                 # ⚡ Buttons & Actions (*.actions.ts)
│   │   └── index.ts            #    ↳ Barrel: re-exports all actions
│   ├── flows/                   # 🔄 Automation Flows (*.flow.ts)
│   │   └── index.ts
│   ├── dashboards/              # 📊 BI Dashboards (*.dashboard.ts)
│   │   └── index.ts
│   ├── reports/                 # 📈 Analytics Reports (*.report.ts)
│   │   └── index.ts
│   ├── apps/                    # 🚀 App Configuration (*.app.ts)
│   │   └── index.ts
│   ├── apis/                    # 🌐 API Endpoints (*.api.ts)
│   ├── agents/                  # 🤖 AI Agents (*.agent.ts)
│   ├── rag/                     # 🧠 RAG Pipelines (*.rag.ts)
│   ├── profiles/                # 🔒 Permission Profiles (*.profile.ts)
│   └── sharing/                 # 🛡️ Sharing Rules (*.sharing.ts)
│
├── objectstack.config.ts        # 🚀 The Manifest (App Definition)
├── package.json
└── tsconfig.json
```

> **Why by-type?**
> - Aligns with **Salesforce DX** (20+ years in production) and **ServiceNow**
> - Maps 1:1 to `objectstack.config.ts` sections (`objects`, `actions`, `flows`, ...)
> - File suffix (`.object.ts`, `.flow.ts`) already carries type information
> - Easiest to discover files: "I need to edit a flow → go to `flows/`"
> - CLI glob patterns work naturally: `src/objects/**/*.object.ts`

### Scaling Guide

| Project Size | Objects | Recommended Layout |
|:---|:---|:---|
| **Small** (Todo, Blog) | 1–5 | by-type (flat). Only create folders you actually use. |
| **Medium** (CRM, ERP) | 5–50 | by-type (flat). All type folders. Files named by entity. |
| **Large** (Enterprise Suite) | 50+ | by-type with optional domain grouping (see Advanced). |

### Advanced: Domain Grouping (Optional, 50+ Objects)

For very large projects, you may add a domain layer **on top of** the by-type structure:

```text
src/
├── sales/
│   ├── objects/       # account.object.ts, opportunity.object.ts
│   ├── actions/       # opportunity.actions.ts
│   ├── flows/         # opportunity-approval.flow.ts
│   └── reports/       # opportunity.report.ts
├── service/
│   ├── objects/       # case.object.ts
│   ├── actions/       # case.actions.ts
│   └── flows/         # case-escalation.flow.ts
├── shared/
│   ├── objects/       # task.object.ts, product.object.ts
│   └── actions/       # global.actions.ts
└── apps/              # Always top-level
```

> ⚠️ **Only use domain grouping when flat by-type becomes hard to navigate (50+ files in a single folder).** For most projects, flat by-type is superior.

---

## 2. Essential Configuration Files

### A. The Manifest (`objectstack.config.ts`)
This is the heart of your plugin. It registers all metadata so the runtime can load it.

**Barrel Pattern (Recommended):** Each type folder has an `index.ts` barrel that re-exports all definitions. The config collects them via `Object.values()` — adding a new file only requires updating the barrel, not the config.

```typescript
import { defineStack } from '@objectstack/spec';

// ─── Barrel Imports (one per metadata type) ─────────────────────────
import * as objects from './src/objects';
import * as actions from './src/actions';
import * as apps from './src/apps';

export default defineStack({
  manifest: {
    id: 'com.example.project',
    version: '1.0.0',
    type: 'app',
    name: 'Project Manager',
    description: 'Project management capabilities for ObjectStack',
  },

  // Auto-collected from barrel index files
  objects: Object.values(objects),
  actions: Object.values(actions),
  apps: Object.values(apps),
});
```

**Barrel File Example** (`src/objects/index.ts`):
```typescript
// Only re-export *.object.ts definitions
// Hooks (*.hook.ts) and state machines (*.state.ts) are auto-associated by convention
export { Project } from './project.object';
export { Task } from './task.object';
```

> **Workflow:** Adding a new object only requires 2 steps:
> 1. Create `src/objects/invoice.object.ts`
> 2. Add `export { Invoice } from './invoice.object'` to `src/objects/index.ts`
> 
> The `objectstack.config.ts` stays unchanged.

### B. Package Definition (`package.json`)
You must depend on `@objectstack/spec` to get the types.

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "main": "./objectstack.config.ts",
  "types": "./objectstack.config.ts",
  "exports": {
    ".": "./objectstack.config.ts",
    "./objectstack.config": "./objectstack.config.ts"
  },
  "scripts": {
    "dev": "objectstack dev",
    "build": "objectstack compile",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@objectstack/spec": "workspace:*"
  },
  "devDependencies": {
    "@objectstack/cli": "workspace:*",
    "typescript": "^5.0.0"
  }
}
```

### C. TypeScript Config (`tsconfig.json`)
Enable `strict` mode and path mapping.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "strict": true,
    "declaration": true,
    "outDir": "./dist",
    "esModuleInterop": true
  },
  "include": ["src/**/*", "objectstack.config.ts"]
}
```

---

## 3. Initialization Steps (Checklist)

1.  **Create Folders:** Run `mkdir -p src/objects src/actions src/apps`.
2.  **Install Instructions:** Copy `content/prompts/plugin/copilot-instructions.md` to `.github/`.
3.  **Init Git:** `git init && echo "node_modules\ndist" > .gitignore`.
4.  **First Object:** Create `src/objects/example.object.ts`.
5.  **Create Barrel:** Create `src/objects/index.ts` with `export { Example } from './example.object'`.
6.  **Register:** Import the barrel in `objectstack.config.ts` via `import * as objects from './src/objects'`.
