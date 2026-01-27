# ObjectStack Protocol Organization

This document provides a visual map of how the 70 protocol specifications are organized across the ObjectStack ecosystem.

```
objectstack-ai/spec
└── packages/spec/src/
    │
    ├── 📊 DATA PROTOCOL (ObjectQL) - 8 files
    │   ├── field.zod.ts           → 44 field types (text, number, vector, location, etc.)
    │   ├── object.zod.ts          → Object/table definitions with fields and indexes
    │   ├── query.zod.ts           → Query AST (window functions, HAVING, DISTINCT, subqueries)
    │   ├── validation.zod.ts      → Validation rules for data integrity
    │   ├── filter.zod.ts          → Query filters and conditions
    │   ├── dataset.zod.ts         → Dataset definitions for analytics
    │   ├── mapping.zod.ts         → Field mapping for data transformation
    │   └── hook.zod.ts            → Lifecycle hooks (before/after CRUD)
    │
    ├── 🎨 UI PROTOCOL (ObjectUI) - 10 files
    │   ├── view.zod.ts            → List views (grid, kanban, calendar, gantt)
    │   ├── page.zod.ts            → FlexiPage layouts with regions
    │   ├── app.zod.ts             → Application navigation menus
    │   ├── dashboard.zod.ts       → Dashboard layouts with widgets
    │   ├── report.zod.ts          → Report definitions (tabular, summary, matrix, chart)
    │   ├── action.zod.ts          → UI actions (buttons, scripts, flows)
    │   ├── component.zod.ts       → Reusable UI components
    │   ├── block.zod.ts           → UI block definitions
    │   ├── theme.zod.ts           → Theming (colors, typography, animations)
    │   └── widget.zod.ts          → Custom field widgets
    │
    ├── ⚙️ SYSTEM PROTOCOL (ObjectOS) - 14 files
    │   ├── manifest.zod.ts        → Package manifest (objectstack.config.ts)
    │   ├── datasource.zod.ts      → Data source connections
    │   ├── driver.zod.ts          → Database driver definitions
    │   ├── driver/
    │   │   ├── postgres.zod.ts    → PostgreSQL driver config
    │   │   └── mongo.zod.ts       → MongoDB driver config
    │   ├── plugin.zod.ts          → Plugin lifecycle and interface
    │   ├── context.zod.ts         → Kernel execution context
    │   ├── events.zod.ts          → Event bus and pub/sub
    │   ├── job.zod.ts             → Background job scheduling
    │   ├── audit.zod.ts           → Audit logging
    │   ├── logger.zod.ts          → Structured logging
    │   ├── translation.zod.ts     → i18n/l10n support
    │   ├── feature.zod.ts         → Feature flags
    │   └── scoped-storage.zod.ts  → Key-value storage
    │
    ├── 🤖 AI PROTOCOL - 8 files
    │   ├── agent.zod.ts           → AI agent definitions
    │   ├── model-registry.zod.ts  → LLM model registry
    │   ├── rag-pipeline.zod.ts    → Retrieval-augmented generation
    │   ├── nlq.zod.ts             → Natural language query (NL → ObjectQL)
    │   ├── conversation.zod.ts    → Conversation management
    │   ├── cost.zod.ts            → AI cost tracking
    │   ├── predictive.zod.ts      → Predictive analytics/ML models
    │   └── orchestration.zod.ts   → AI workflow orchestration
    │
    ├── 🌐 API PROTOCOL - 6 files
    │   ├── contract.zod.ts        → API contracts and specifications
    │   ├── endpoint.zod.ts        → REST endpoints with rate limiting
    │   ├── router.zod.ts          → API routing
    │   ├── odata.zod.ts           → OData query protocol
    │   ├── realtime.zod.ts        → WebSocket/SSE subscriptions
    │   └── discovery.zod.ts       → API discovery/introspection
    │
    ├── 🔄 AUTOMATION PROTOCOL - 7 files
    │   ├── flow.zod.ts            → Visual workflow builder
    │   ├── workflow.zod.ts        → Declarative workflow rules
    │   ├── approval.zod.ts        → Multi-step approval processes
    │   ├── webhook.zod.ts         → Outbound webhooks
    │   ├── etl.zod.ts             → ETL data pipelines
    │   ├── sync.zod.ts            → Bi-directional data sync
    │   └── connector.zod.ts       → External system connectors
    │
    ├── 🔐 AUTH PROTOCOL - 6 files
    │   ├── identity.zod.ts        → User identity and profiles
    │   ├── role.zod.ts            → Role definitions (RBAC)
    │   ├── organization.zod.ts    → Multi-org structure
    │   ├── policy.zod.ts          → Password and session policies
    │   ├── config.zod.ts          → OAuth/SAML/SSO configs
    │   └── scim.zod.ts            → SCIM 2.0 provisioning
    │
    ├── 🔒 PERMISSION PROTOCOL - 4 files
    │   ├── permission.zod.ts      → Object-level CRUD permissions
    │   ├── sharing.zod.ts         → Sharing rules (criteria & manual)
    │   ├── rls.zod.ts             → Row-level security
    │   └── territory.zod.ts       → Territory management
    │
    ├── 🏪 HUB PROTOCOL - 5 files
    │   ├── marketplace.zod.ts     → Plugin marketplace listings
    │   ├── composer.zod.ts        → Package dependency management
    │   ├── license.zod.ts         → Feature licensing
    │   ├── tenant.zod.ts          → Multi-tenant isolation
    │   └── space.zod.ts           → Workspace/space management
    │
    ├── 🔧 SHARED PROTOCOL - 1 file
    │   └── identifiers.zod.ts     → Standard identifier formats
    │
    └── 📦 STACK PROTOCOL - 1 file
        └── stack.zod.ts           → Root stack definition (combines all protocols)
```

## Protocol Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    STACK PROTOCOL (1)                       │
│              Unified Stack Configuration                    │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  AUTOMATION │  │     HUB     │  │     AI      │        │
│  │  (7 specs)  │  │  (5 specs)  │  │  (8 specs)  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              UI PROTOCOL (10 specs)                 │   │
│  │    Views, Pages, Apps, Dashboards, Reports, etc.    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      BUSINESS LAYER                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              DATA PROTOCOL (8 specs)                │   │
│  │   Objects, Fields, Queries, Validations, Hooks      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  SYSTEM  │  │   API    │  │   AUTH   │  │PERMISSION│   │
│  │(14 specs)│  │(6 specs) │  │(6 specs) │  │(4 specs) │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           SHARED PROTOCOL (1 spec)                  │   │
│  │          Common Utilities & Identifiers             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Protocol Dependencies

```
         Stack Protocol
              ▼
    ┌─────────┴─────────┐
    ▼                   ▼
Data Protocol      UI Protocol
    │                   │
    ├─── Fields ────────┤
    ├─── Objects ───────┤
    └─── Queries        │
                        │
    ┌───────────────────┘
    ▼
Automation Protocol
    │
    ├─── Flows ─────────┐
    ├─── Workflows      │
    └─── Approvals      │
                        ▼
               System Protocol
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
Auth Protocol  API Protocol  Permission Protocol
                                    │
                              ┌─────┴─────┐
                              ▼           ▼
                          Sharing       RLS
```

## Module Relationships

| Consumer Module | Depends On | Relationship |
| :--- | :--- | :--- |
| **Stack** | All modules | Aggregates entire system |
| **UI** | Data, System, Auth | Renders data with security context |
| **Automation** | Data, System, AI | Orchestrates business logic |
| **AI** | Data, System | Enhances data with intelligence |
| **API** | Data, Auth, Permission | Exposes data with security |
| **Permission** | Data, Auth | Controls data access |
| **Hub** | System, Auth | Multi-tenant packaging |
| **Auth** | System | Identity foundation |
| **Data** | Shared | Core business model |
| **System** | Shared | Platform foundation |

## File Naming Conventions

All protocol files follow this pattern:

```
<module>/<feature>.zod.ts
```

Examples:
- `data/field.zod.ts` → Field protocol
- `ui/view.zod.ts` → View protocol  
- `system/manifest.zod.ts` → Manifest protocol
- `ai/agent.zod.ts` → AI agent protocol

## Schema Naming Conventions

Within each `.zod.ts` file:

```typescript
// Primary schema (PascalCase + "Schema" suffix)
export const FieldSchema = z.object({ ... });

// Derived TypeScript type (inferred from Zod)
export type Field = z.infer<typeof FieldSchema>;

// Supporting schemas
export const SelectOptionSchema = z.object({ ... });
export const VectorConfigSchema = z.object({ ... });
```

## Quick Navigation

| Need | File | Location |
| :--- | :--- | :--- |
| Define an object/table | `object.zod.ts` | `packages/spec/src/data/` |
| Define a field | `field.zod.ts` | `packages/spec/src/data/` |
| Create a view | `view.zod.ts` | `packages/spec/src/ui/` |
| Configure a dashboard | `dashboard.zod.ts` | `packages/spec/src/ui/` |
| Build a workflow | `flow.zod.ts` | `packages/spec/src/automation/` |
| Set up permissions | `permission.zod.ts` | `packages/spec/src/permission/` |
| Add authentication | `identity.zod.ts` | `packages/spec/src/auth/` |
| Create an AI agent | `agent.zod.ts` | `packages/spec/src/ai/` |
| Configure a plugin | `manifest.zod.ts` | `packages/spec/src/system/` |
| Define an API endpoint | `endpoint.zod.ts` | `packages/spec/src/api/` |

## See Also

- **[PROTOCOL_REFERENCE.md](./PROTOCOL_REFERENCE.md)** - Complete protocol inventory with detailed descriptions
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture overview
- **[README.md](./README.md)** - Project overview and getting started
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contributing guidelines
