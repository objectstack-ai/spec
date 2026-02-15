# ObjectStack Studio — Development Roadmap

> **Last Updated:** 2026-02-15  
> **Version:** 2.0.0 → 3.0.0  
> **Goal:** Transform Studio from a metadata inspector into a full-featured visual IDE for the ObjectStack platform.

---

## 📊 Current State Assessment

### What's Built (v2.0.0)

| Category | Feature | Maturity |
|----------|---------|----------|
| **Core Architecture** | MSW in-browser kernel + server mode | ✅ Production |
| **Core Architecture** | Plugin system (VS Code-style) | ✅ Production |
| **Core Architecture** | Package manager (install/enable/disable) | ✅ Production |
| **Core Architecture** | Theme toggle (light/dark/system) | ✅ Production |
| **Core Architecture** | Error boundary + toast notifications | ✅ Production |
| **Data Protocol** | Object schema inspector (field table) | ✅ Production |
| **Data Protocol** | Paginated data table with CRUD | ✅ Production |
| **Data Protocol** | Record create/edit modal (dynamic form) | ✅ Production |
| **Developer Tools** | Interactive REST API console | ✅ Production |
| **Developer Tools** | Generic JSON metadata inspector | ✅ Production |
| **Developer Tools** | Developer overview dashboard | ✅ Production |
| **Navigation** | Protocol-grouped sidebar with search | ✅ Production |
| **Navigation** | Multi-package workspace switcher | ✅ Production |
| **Navigation** | Breadcrumbs + API endpoint badges | ✅ Production |

### Key Technical Debt

| Issue | Impact | Priority |
|-------|--------|----------|
| No URL router — all navigation via `useState` | No deep links, no browser back/forward | 🔴 Critical |
| Broker shim in `createKernel.ts` duplicates runtime logic | Fragile, hard to maintain | 🟡 Medium |
| Response normalization scattered across components | DRY violation, inconsistent error handling | 🟡 Medium |
| Stale `types.ts` (leftover Task types) | Dead code | 🟢 Low |
| Empty `app/dashboard/` directory | Abandoned scaffold | 🟢 Low |
| No component-level tests | Regression risk | 🟡 Medium |
| Data refresh via `setTimeout` hack | Race conditions | 🟡 Medium |
| Sidebar groups hardcoded (not reading from plugins) | Plugin contributions ignored | 🟡 Medium |

### Protocol Coverage Gap

**Spec defines 100+ metadata types. Studio has specialized viewers for only 1 (Object).** All other types fall back to the generic JSON inspector. The plugin system is ready — it just needs content.

**Object Designer Protocol:** The `ObjectDesignerConfigSchema` (in `@objectstack/spec/studio`) now defines the full specification for the visual object design experience, including field editor, relationship mapper, ER diagram, object manager, and object preview configurations. The runtime implementation should consume these schemas.

---

## 🗺️ Roadmap

### Phase 0: Foundation Hardening (v2.1) — 2 weeks

> **Theme:** Fix structural debt before building new features.

| # | Task | Details |
|---|------|---------|
| 0.1 | **Add URL Router** | Integrate TanStack Router or React Router. Map views to URL paths: `/:package/objects/:name`, `/:package/metadata/:type/:name`, `/packages`, `/settings`. Enable browser back/forward and deep linking. |
| 0.2 | **Centralize response normalization** | Create `src/lib/api-utils.ts` with `normalizeRecords()`, `normalizeMetadata()`. Remove inline `.records || .value || .data` from all components. |
| 0.3 | **Wire plugin sidebar groups** | Replace hardcoded `PROTOCOL_GROUPS` in `app-sidebar.tsx` with plugin-contributed `useSidebarGroups()`. |
| 0.4 | **Clean dead code** | Remove stale `types.ts`, empty `app/dashboard/` directory. |
| 0.5 | **Add React Testing Library** | Set up component test infrastructure. Write baseline tests for `ObjectDataTable`, `ObjectDataForm`, `AppSidebar`, Plugin system. Target: 50% component coverage. |
| 0.6 | **Fix data refresh pattern** | Replace `setTimeout` hack in `ObjectExplorer` with proper state invalidation / refetch callback. |

**Deliverable:** Stable, testable, deep-linkable foundation.

---

### Phase 1: Data Protocol Designers (v2.2) — 4 weeks

> **Theme:** First-class visual editors for all Data layer metadata.

| # | Task | Plugin ID | Priority |
|---|------|-----------|----------|
| 1.0 | **Object Designer Protocol** ✅ | `@objectstack/spec` | ✅ Done |
| | Zod schemas for field editor, relationship mapper, ER diagram, object manager, and object preview configs. `ObjectDesignerConfigSchema`, `ERDiagramConfigSchema`, `FieldEditorConfigSchema`, etc. 46 tests passing. | | |
| 1.1 | **Object Designer — Visual Field Editor** | `objectstack.object-designer` | 🔴 P0 |
| | Inline field creation/editing with type-aware property panel (6 sections: basics, constraints, relationship, display, security, advanced). Drag-and-drop field reordering. Field grouping by `field.group`. Batch add/remove operations. Validate field schemas via Zod. Usage statistics (views/formulas referencing each field). Pagination for 50+ field objects. | | |
| 1.1a | **Object Designer — Relationship Mapper** | `objectstack.object-designer` | 🔴 P0 |
| | Visual relationship creation via drag-from-source-to-target. Support lookup, master_detail, and tree relationship types. Show reverse relationships (child → parent). Cascade delete behavior warnings. Configurable line styles and colors per relationship type. | | |
| 1.1b | **Object Designer — ER Diagram** | `objectstack.object-designer` | 🟡 P1 |
| | Interactive entity-relationship diagram with 4 layout algorithms (force-directed, hierarchy, grid, circular). Entity nodes show field list with type badges and required indicators. Minimap for large schemas. Zoom controls (0.1x–3x). Click-to-navigate to object detail. Drag-to-connect for relationship creation. Hover highlighting of connected entities. Export to PNG/SVG/JSON. Auto-fit on initial load. Optional orphan hiding. | | |
| 1.1c | **Object Manager — Unified List** | `objectstack.object-designer` | 🟡 P1 |
| | Object list with table/card/tree display modes. Search across name, label, description. Filter by package, tags, field types, relationships. Sort by name, label, field count, last updated. Quick-preview tooltip with field list on hover. Statistics summary bar (total objects, fields, relationships). Side-by-side object comparison mode. ER diagram toggle from toolbar. | | |
| 1.1d | **Object Preview — Enhanced Tabs** | `objectstack.object-designer` | 🟡 P1 |
| | 8-tab object detail view: Fields, Relationships, Indexes, Validations, Capabilities, Data, API, Code. Configurable tab ordering and enable/disable. Object summary header with namespace, owner package, field count. Breadcrumb navigation. | | |
| 1.2 | **Dataset Editor** | `objectstack.dataset-editor` | 🔴 P0 |
| | Visual seed data editor. Import CSV/JSON. Preview before apply. Environment scoping (dev/test/prod). | | |
| 1.3 | **Datasource Manager** | `objectstack.datasource-manager` | 🟡 P1 |
| | Connection wizard (PostgreSQL, MySQL, MongoDB, SQLite, Redis). Test connection. Health check display. Pool config. | | |
| 1.4 | **Field Type Catalog** | `objectstack.field-catalog` | 🟡 P1 |
| | Interactive reference of all 46+ field types with examples, configuration options, and preview rendering. | | |
| 1.5 | **Validation Rule Builder** | `objectstack.validation-builder` | 🟡 P1 |
| | Visual builder for object validation rules: unique constraints, format checks, cross-field validation, state machine guards. | | |
| 1.6 | **Hook Inspector** | `objectstack.hook-inspector` | 🟢 P2 |
| | List/edit lifecycle hooks per object. Visualize execution order (priority). Test hooks from UI. | | |
| 1.7 | **Analytics Cube Designer** | `objectstack.analytics-designer` | 🟢 P2 |
| | Visual measures/dimensions builder. Join config. Pre-aggregation settings. Test query execution. | | |
| 1.8 | **Mapping Designer** | `objectstack.mapping-designer` | 🟢 P2 |
| | Visual ETL field mapping: source → transform → target. Preview transformation output. | | |

**Deliverable:** All Data Protocol types have dedicated visual editors.

---

### Phase 2: UI Protocol Designers (v2.3) — 6 weeks

> **Theme:** Visual builders for every UI metadata type — the "App Builder" experience.

| # | Task | Plugin ID | Priority |
|---|------|-----------|----------|
| 2.1 | **ListView Designer** | `objectstack.view-designer` | 🔴 P0 |
| | Visual column configurator for Grid views. Drag-and-drop column reorder. Column width/alignment. Filter & sort presets. Preview with live data. | | |
| 2.2 | **ListView — Kanban / Calendar / Gantt** | `objectstack.view-designer` | 🟡 P1 |
| | Mode-specific config panels: Kanban (status field, swimlanes), Calendar (date fields, duration), Gantt (dependencies, milestones). | | |
| 2.3 | **FormView Designer** | `objectstack.form-designer` | 🔴 P0 |
| | Section/column layout editor. Field placement with drag-and-drop. Conditional visibility (`visibleOn`). Widget selection per field. Preview mode. | | |
| 2.4 | **Page Builder** | `objectstack.page-builder` | 🟡 P1 |
| | Component composition canvas. Drag regions and components (header, details, related list, AI chat, custom). Property panel for each component. Preview with live data context. | | |
| 2.5 | **App Builder** | `objectstack.app-builder` | 🟡 P1 |
| | Navigation tree editor (drag-and-drop reorder). Add object/dashboard/page/URL items. Branding panel (colors, logo). Home page selector. | | |
| 2.6 | **Dashboard Designer** | `objectstack.dashboard-designer` | 🟡 P1 |
| | Grid layout editor (React-Grid-Layout). Widget palette: charts, KPIs, lists, embedded views. Data source binding per widget. Auto-refresh config. | | |
| 2.7 | **Report Builder** | `objectstack.report-builder` | 🟢 P2 |
| | Tabular/Summary/Matrix report config. Column picker, grouping, aggregation. Embedded chart toggle. Filter builder. Export options. | | |
| 2.8 | **Chart Editor** | `objectstack.chart-editor` | 🟢 P2 |
| | Visual chart type selector (40+ types). Axis/series configuration. Preview with sample data. Annotation support. | | |
| 2.9 | **Action Editor** | `objectstack.action-editor` | 🟢 P2 |
| | Configure action type (script/URL/modal/flow/API). Location picker. Confirm/success text. Keyboard shortcut. Visibility conditions. | | |
| 2.10 | **Theme Editor** | `objectstack.theme-editor` | 🟢 P2 |
| | Visual color palette picker. Typography controls. Spacing/radius scale. Live preview. Export to theme metadata. | | |

**Deliverable:** Full "App Builder" experience — design complete applications visually.

---

### Phase 3: Automation Protocol (v2.4) — 4 weeks

> **Theme:** Visual Flow Designer and process automation tools.

| # | Task | Plugin ID | Priority |
|---|------|-----------|----------|
| 3.1 | **Flow Designer** | `objectstack.flow-designer` | 🔴 P0 |
| | Canvas-based node graph editor (ReactFlow or similar). 16 node types from spec. Edge conditions. Variable panel. Test execution with trace. Version history. | | |
| 3.2 | **Workflow Rule Builder** | `objectstack.workflow-builder` | 🔴 P0 |
| | Trigger config (on create/update/delete/schedule). Action builder (field update, email, HTTP, task). Time-dependent trigger scheduling. | | |
| 3.3 | **Approval Process Designer** | `objectstack.approval-designer` | 🟡 P1 |
| | Multi-step approval chain visualizer. Approver type selector. Behavior config (first response / unanimous). Action bindings. | | |
| 3.4 | **State Machine Visualizer** | `objectstack.statemachine-viewer` | 🟡 P1 |
| | XState-style state diagram rendering. Transition table. Guard conditions. Entry/exit actions. Interactive state simulation. | | |
| 3.5 | **Webhook Manager** | `objectstack.webhook-manager` | 🟡 P1 |
| | Outbound webhook config (event triggers, auth, retry policy). Inbound webhook receiver (path routing, verification). Delivery log. | | |
| 3.6 | **ETL Pipeline Designer** | `objectstack.etl-designer` | 🟢 P2 |
| | Visual ETL canvas: sources → transformations → destinations. 10 transform types. Schedule config. Incremental sync. Error handling. | | |
| 3.7 | **Data Sync Manager** | `objectstack.sync-manager` | 🟢 P2 |
| | Bi-directional sync config. Conflict resolution strategy. Field mapping. Run history. | | |

**Deliverable:** Complete low-code automation suite — build business logic without code.

---

### Phase 4: Security & Identity (v2.5) — 3 weeks

> **Theme:** Enterprise-grade access control management.

| # | Task | Plugin ID | Priority |
|---|------|-----------|----------|
| 4.1 | **Permission Set Editor** | `objectstack.permission-editor` | 🔴 P0 |
| | Object permission matrix (CRUD + viewAll/modifyAll). Field-level security toggle per field. System permission checkboxes. | | |
| 4.2 | **Role Hierarchy Viewer** | `objectstack.role-viewer` | 🟡 P1 |
| | Tree/org-chart visualization. Drag-and-drop role restructuring. Data visibility rollup preview. | | |
| 4.3 | **Sharing Rule Builder** | `objectstack.sharing-builder` | 🟡 P1 |
| | OWD (org-wide default) config per object. Criteria-based sharing rule wizard. Owner-based sharing. | | |
| 4.4 | **RLS Policy Editor** | `objectstack.rls-editor` | 🟡 P1 |
| | PostgreSQL-style row-level security. USING/CHECK clause builder. Operation scope selector. Preview effective access. | | |
| 4.5 | **Identity & User Management** | `objectstack.identity-manager` | 🟢 P2 |
| | User list, account linking (OAuth/SAML/LDAP), session management. SCIM provisioning config. | | |
| 4.6 | **Audit Trail Viewer** | `objectstack.audit-viewer` | 🟢 P2 |
| | Searchable audit log. Filter by user/object/action/date. Field change diff view. Export. | | |

**Deliverable:** Enterprise security management — profiles, permissions, sharing, audit.

---

### Phase 5: AI & Intelligence (v2.6) — 4 weeks

> **Theme:** AI-native platform capabilities — agents, RAG, NLQ.

| # | Task | Plugin ID | Priority |
|---|------|-----------|----------|
| 5.1 | **Agent Designer** | `objectstack.agent-designer` | 🔴 P0 |
| | Persona editor (role, instructions). Model selector (provider/model/temperature). Tool binding (actions, flows, queries). Knowledge base config. Test chat interface. | | |
| 5.2 | **RAG Pipeline Builder** | `objectstack.rag-builder` | 🔴 P0 |
| | Vector store selector. Embedding model config. Chunking strategy (fixed/semantic/recursive/markdown). Retrieval strategy (similarity/MMR/hybrid). Document loader config. Test retrieval. | | |
| 5.3 | **Model Registry** | `objectstack.model-registry` | 🟡 P1 |
| | Provider/model catalog. Pricing display. Capability comparison. Prompt template editor with variable binding. Fallback chain config. Health monitoring. | | |
| 5.4 | **MCP Server Config** | `objectstack.mcp-config` | 🟡 P1 |
| | Transport config (stdio/HTTP/WebSocket). Resource definitions. Tool registration. Prompt management. Server capabilities. | | |
| 5.5 | **NLQ Playground** | `objectstack.nlq-playground` | 🟡 P1 |
| | Natural language → ObjectQL query tester. Intent detection preview. Entity recognition display. Generated query inspector. Training example management. | | |
| 5.6 | **AI Orchestration Designer** | `objectstack.ai-orchestration` | 🟢 P2 |
| | Multi-task AI workflow canvas. Task types (classify/extract/summarize/generate/predict). Trigger binding. Post-processing actions. Execution mode (sequential/parallel). | | |
| 5.7 | **AI Cost Dashboard** | `objectstack.ai-cost-dashboard` | 🟢 P2 |
| | Token usage tracking. Cost per model/agent/pipeline. Budget alerts. Usage trend charts. | | |

**Deliverable:** Full AI-native studio — design agents, configure RAG, test NLQ.

---

### Phase 6: API & Integration (v2.7) — 3 weeks

> **Theme:** API management and enterprise connectivity.

| # | Task | Plugin ID | Priority |
|---|------|-----------|----------|
| 6.1 | **API Endpoint Designer** | `objectstack.api-designer` | 🟡 P1 |
| | Custom REST/GraphQL endpoint config. Request/response schema. Auth requirements. Rate limiting. | | |
| 6.2 | **Connector Builder** | `objectstack.connector-builder` | 🟡 P1 |
| | Enterprise integration wizard. Auth config (OAuth2/SAML/API key). Field mapping (bi-directional). Sync strategy. Conflict resolution. Test connection. | | |
| 6.3 | **GraphQL Explorer** | `objectstack.graphql-explorer` | 🟢 P2 |
| | Schema browser. Interactive query builder (like GraphiQL). Type relationships. Real-time testing. | | |
| 6.4 | **WebSocket / Realtime Config** | `objectstack.realtime-config` | 🟢 P2 |
| | Channel definitions. Event subscriptions. Authorization. Connection management. Live event monitor. | | |
| 6.5 | **API Documentation Generator** | `objectstack.api-docs` | 🟢 P2 |
| | Auto-generated OpenAPI/Swagger from metadata. Interactive docs. Endpoint testing. Client SDK generation. | | |

**Deliverable:** Full API lifecycle management from Studio.

---

### Phase 7: System & DevOps (v2.8) — 3 weeks

> **Theme:** Operational tooling for production readiness.

| # | Task | Plugin ID | Priority |
|---|------|-----------|----------|
| 7.1 | **Translation Manager** | `objectstack.translation-manager` | 🟡 P1 |
| | Side-by-side locale editor. Missing translation tracker. Bulk import/export. Auto-translate integration. | | |
| 7.2 | **Feature Flag Manager** | `objectstack.feature-flags` | 🟡 P1 |
| | Toggle feature flags. Percentage rollout. User/role targeting. A/B test config. | | |
| 7.3 | **Job Scheduler** | `objectstack.job-scheduler` | 🟡 P1 |
| | Background job list. Cron schedule editor. Execution history. Retry config. | | |
| 7.4 | **Migration Manager** | `objectstack.migration-manager` | 🟡 P1 |
| | Schema migration timeline. Pending/applied status. Rollback support. Diff preview. | | |
| 7.5 | **Observability Dashboard** | `objectstack.observability` | 🟢 P2 |
| | Metrics/tracing/logging aggregation. Request latency. Error rates. Resource usage. | | |
| 7.6 | **Change Management** | `objectstack.change-management` | 🟢 P2 |
| | Change sets. Sandbox comparison. Deployment tracking. Rollback. | | |
| 7.7 | **Notification Config** | `objectstack.notifications` | 🟢 P2 |
| | Email/push/in-app notification templates. Channel config. Delivery tracking. | | |

**Deliverable:** Production-ready operational tooling.

---

### Phase 8: Studio Platform Evolution (v3.0) — Ongoing

> **Theme:** Studio becomes a full IDE ecosystem.

| # | Task | Priority |
|---|------|----------|
| 8.1 | **Command Palette** (Ctrl+K) | 🔴 P0 |
| | Global command search. Keyboard-first navigation. Plugin-contributed commands. Quick actions. |
| 8.2 | **Multi-Tab Interface** | 🔴 P0 |
| | Open multiple metadata items simultaneously. Tab management (close/drag/split). Unsaved indicator. |
| 8.3 | **Code Editor Integration** | 🟡 P1 |
| | Monaco Editor for raw metadata YAML/JSON/TypeScript editing. Schema-aware autocomplete. Inline Zod validation. |
| 8.4 | **Version Control UI** | 🟡 P1 |
| | Git diff viewer for metadata changes. Commit from Studio. Branch switching. Conflict resolution. |
| 8.5 | **External Plugin Marketplace** | 🟡 P1 |
| | Browse/install community Studio plugins. Plugin manifest validation. Sandboxed execution. |
| 8.6 | **Collaborative Editing** | 🟢 P2 |
| | Real-time multi-user editing (CRDT). Presence indicators. Change attribution. |
| 8.7 | **Responsive / Mobile Mode** | 🟢 P2 |
| | Mobile preview mode. Responsive layout testing. Touch-friendly interactions. |
| 8.8 | **Embedded AI Copilot** | 🟡 P1 |
| | In-Studio AI assistant. Generate metadata from natural language. Explain configuration. Suggest best practices. |

---

## 📅 Timeline Summary

```
2026 Q1  ──┬── Phase 0: Foundation (v2.1)      [2 weeks]
            └── Phase 1: Data Designers (v2.2)  [4 weeks]

2026 Q2  ──┬── Phase 2: UI Designers (v2.3)    [6 weeks]
            └── Phase 3: Automation (v2.4)      [4 weeks]

2026 Q3  ──┬── Phase 4: Security (v2.5)        [3 weeks]
            ├── Phase 5: AI Studio (v2.6)       [4 weeks]
            └── Phase 6: API & Integration (v2.7) [3 weeks]

2026 Q4  ──┬── Phase 7: System & DevOps (v2.8) [3 weeks]
            └── Phase 8: Platform v3.0          [ongoing]
```

---

## 📐 Architecture Guidelines for New Plugins

Every new Studio plugin MUST follow these patterns:

### 1. File Structure
```
src/plugins/built-in/
  {name}-plugin.ts       # Plugin manifest + activate()
  {name}/
    {Name}Designer.tsx   # Main viewer component (design mode)
    {Name}Preview.tsx    # Preview mode component
    {Name}Code.tsx       # Raw code/YAML mode
    index.ts             # Barrel export
```

### 2. Plugin Registration
```typescript
export const myPlugin: StudioPlugin = {
  id: 'objectstack.{name}-designer',
  name: '{Name} Designer',
  version: '1.0.0',
  metadataViewers: [{
    id: 'objectstack.{name}-designer.viewer',
    metadataTypes: ['{type}'],
    modes: ['preview', 'design', 'code'],
    priority: 100,
  }],
  activate(api: StudioPluginAPI) {
    api.registerViewer('objectstack.{name}-designer.viewer', {Name}Designer);
  },
};
```

### 3. Data Access
- Use `useClient()` hook from `@objectstack/client-react`
- All API calls through the client — never bypass to fetch directly
- Handle loading/error/empty states consistently

### 4. Testing
- Component tests with React Testing Library
- Integration tests via `simulateBrowser()` harness
- Plugin registration/activation tests

---

## 🎯 Success Metrics

| Metric | Current | Phase 2 Target | v3.0 Target |
|--------|---------|----------------|-------------|
| Metadata types with dedicated viewer | 1 / 30+ | 15 / 30+ | 30+ / 30+ |
| Object Designer protocol schemas | 16 schemas | — | — |
| Object Designer protocol tests | 46 tests | — | — |
| Component test coverage | 0% | 50% | 80% |
| Deep-linkable views | 0 | All | All |
| Plugin count (built-in) | 7 | 20 | 35+ |
| Time to build a complete app (from scratch) | N/A (manual JSON) | 30 min | 10 min |
