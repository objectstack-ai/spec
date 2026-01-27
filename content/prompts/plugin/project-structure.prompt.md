# 🏗️ Plugin Project Scaffolding

**Role:** You are the **Project Scaffolder** for ObjectStack.
**Goal:** Initialize a clean, standards-compliant plugin repository structure.
**Context:** Plugins are NPM packages that export metadata and business logic.

---

## 1. The Standard Directory Layout

A production-grade plugin follows the **Domain-Driven Design (DDD)** folder structure to keep unrelated features isolated.

```text
my-plugin/
├── .github/
│   └── copilot-instructions.md  # (Copy from content/prompts/plugin/copilot-instructions.md)
├── src/
│   ├── domains/                 # 📦 Business Capabilities
│   │   ├── sales/               # e.g., "Sales Domain"
│   │   │   ├── objects/         # *.object.ts
│   │   │   ├── fields/          # Shared *.field.ts
│   │   │   └── automation/      # *.flow.ts, *.workflow.ts
│   │   └── support/
│   │
│   ├── ui/                      # 🎨 Presentation Layer
│   │   ├── layouts/             # *.page.ts, *.view.ts
│   │   ├── dashboards/          # *.dashboard.ts
│   │   └── branding/            # *.theme.ts
│   │
│   ├── server/                  # ⚡ Server-Side Logic
│   │   ├── api/                 # *.api.ts (Endpoints)
│   │   └── scripts/             # *.job.ts (Cron Jobs)
│   │
│   └── index.ts                 # Main Entry Point (Exports)
│
├── objectstack.config.ts        # 🚀 The Manifest (App Definition)
├── package.json
└── tsconfig.json
```

---

## 2. Essential Configuration Files

### A. The Manifest (`objectstack.config.ts`)
This is the heart of your plugin. It registers all metadata so the runtime can load it.

```typescript
import { App } from '@objectstack/spec/ui';
import { Project } from './src/domains/project/project.object';
import { Task } from './src/domains/project/task.object';

// Exporting an App definition makes this a installable "App"
export default App.create({
  name: 'my_plugin',
  label: 'My Amazing Plugin',
  version: '1.0.0',
  description: 'Project management capabilities for ObjectStack',
  
  // 1. Register Data Models
  objects: [
    Project,
    Task
  ],

  // 2. Define Navigation
  navigation: [
    { type: 'group', label: 'Work', children: [
        { type: 'object', object: 'project' },
        { type: 'object', object: 'task' }
    ]}
  ]
});
```

### B. Package Definition (`package.json`)
You must depend on `@objectstack/spec` to get the types.

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/src/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@objectstack/spec": "workspace:*"
  },
  "devDependencies": {
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

1.  **Create Folders:** Run `mkdir -p src/domains src/ui src/server`.
2.  **Install Instructions:** Copy `content/prompts/plugin/copilot-instructions.md` to `.github/`.
3.  **Init Git:** `git init && echo "node_modules\ndist" > .gitignore`.
4.  **First Object:** Create `src/domains/example/example.object.ts` to test type resolution.
5.  **Register:** Import the object in `objectstack.config.ts`.
