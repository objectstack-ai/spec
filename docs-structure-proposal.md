# ObjectStack Protocol Docs Structure Proposal

Based on the audit of existing content and the "Metamodel Standards," here is the recommended structure for the official documentation.

## 1. High-Level Goals
- **Eliminate Redundancy**: Merge `concepts`, `core-concepts`, `specifications`, and `protocols` into a unified hierarchy.
- **Align with Architecture**: Structure explicitly around the three pillars: **ObjectQL (Data)**, **ObjectUI (UI)**, and **ObjectOS (System)**.
- **Reference-Driven**: Ensure documentation maps directly to the Zod schemas (`field.zod.ts`, `view.zod.ts`, etc.).

## 2. Proposed Directory Structure

```text
content/docs/
├── index.mdx                     (Landing Page)
├── introduction/                 (Was: concepts, core-concepts)
│   ├── index.mdx
│   ├── manifesto.mdx             (From concepts/manifesto.mdx)
│   ├── architecture.mdx          (From core-concepts/the-stack.mdx)
│   ├── metadata-driven.mdx       (From core-concepts/metadata-driven.mdx)
│   └── terminology.mdx
├── objectql/                     (The Data Protocol)
│   ├── index.mdx                 (Overview)
│   ├── schema/
│   │   ├── object.mdx            (Maps to src/data/object.zod.ts)
│   │   ├── field.mdx             (Maps to src/data/field.zod.ts)
│   │   ├── validation.mdx
│   │   └── relationships.mdx
│   ├── query/
│   │   ├── index.mdx             (Query syntax)
│   │   └── drivers.mdx
│   └── flow/
│       └── logic.mdx             (Maps to src/data/flow.zod.ts)
├── objectui/                     (The UI Protocol)
│   ├── index.mdx
│   ├── app.mdx                   (Maps to src/ui/app.zod.ts)
│   ├── views/
│   │   ├── index.mdx
│   │   ├── list-view.mdx         (Maps to src/ui/view.zod.ts)
│   │   └── form-view.mdx
│   ├── components/               (Widgets, Dashboard)
│   └── actions.mdx               (Maps to src/ui/action.zod.ts)
├── objectos/                     (The System Protocol)
│   ├── index.mdx
│   ├── manifest.mdx              (Maps to src/system/manifest.zod.ts)
│   ├── authentication.mdx
│   ├── api-reference.mdx         (Maps to src/system/api.zod.ts)
│   └── plugins.mdx
└── developers/                   (Guides & Tooling)
    ├── quick-start.mdx
    ├── cli.mdx
    ├── testing.mdx
    └── extensions.mdx
```

## 3. Detailed Actions

### A. Cleanup & Consolidation
1.  **Delete** `content/docs/specifications` folder (content is redundant with `protocols`).
2.  **Delete** `content/docs/core-concepts` folder (move unique content to `introduction`).
3.  **Archive** `content/docs/concepts` folder (it contains a flat list of protocols; move content to specific `object*` folders and then remove).

### B. Rename & Move
1.  Rename `content/docs/protocols` -> Explode this.
    *   Move `content/docs/protocols/objectql` -> `content/docs/objectql`
    *   Move `content/docs/protocols/objectui` -> `content/docs/objectui`
    *   Move `content/docs/protocols/objectos` -> `content/docs/objectos`
    *   *Reason*: These are the top-level products/protocols. They deserve root-level visibility in the docs URI (e.g., `docs/objectql/schema`).

### C. Navigation Update (`meta.json`)
Update `content/docs/meta.json` to reflect the new simplified hierarchy:

```json
{
  "title": "Documentation",
  "pages": [
    "introduction",
    "objectql",
    "objectui",
    "objectos",
    "developers",
    "references"
  ]
}
```

## 4. Content Gaps to Fill
Based on `copilot-instructions.md`, ensure the following specific pages exist and map to their Zod definitions:
- [ ] **ObjectQL**: Ensure `field.mdx` documents all types (text, lookup, formula) defined in `field.zod.ts`.
- [ ] **ObjectUI**: Ensure `layout.mdx` covers the Grid/Kanban options defined in `view.zod.ts`.
- [ ] **ObjectOS**: Ensure `manifest.mdx` clearly documents `objectstack.config.ts`.
