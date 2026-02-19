# ObjectStack Protocol — Road Map

> **Last Updated:** 2026-02-18  
> **Current Version:** v3.0.6  
> **Status:** Protocol Specification Complete · Runtime Implementation In Progress

---

## Table of Contents

- [Current State Summary](#current-state-summary)
- [Codebase Metrics](#codebase-metrics)
- [Package Naming Convention](#package-naming-convention)
- [Phase 1: Protocol Specification (✅ Complete)](#phase-1-protocol-specification--complete)
- [Phase 2: Core Runtime (✅ Complete)](#phase-2-core-runtime--complete)
- [Phase 3: Data Layer (🟡 Mostly Complete)](#phase-3-data-layer--mostly-complete)
- [Phase 4: Service Implementations (🔴 In Progress)](#phase-4-service-implementations--in-progress)
- [Phase 5: Framework Adapters (🟡 Mostly Complete)](#phase-5-framework-adapters--mostly-complete)
- [Phase 6: Enterprise Services (🔴 Planned)](#phase-6-enterprise-services--planned)
- [Phase 7: AI & Intelligence (🔴 Planned)](#phase-7-ai--intelligence--planned)
- [Phase 8: Platform & Ecosystem (🔴 Planned)](#phase-8-platform--ecosystem--planned)
- [Contract Implementation Matrix](#contract-implementation-matrix)
- [Package Status Matrix](#package-status-matrix)
- [v4.0 Schema & Toolchain Roadmap](#v40-schema--toolchain-roadmap)
- [Versioning Plan](#versioning-plan)
- [Related Documents](#related-documents)

---

## Current State Summary

ObjectStack v3.0 has achieved **comprehensive protocol specification** with 175 Zod schemas,
25 service contracts, and 7,111 `.describe()` annotations providing machine-readable documentation.
The core kernel, data engine, metadata system, and developer tooling are production-ready.
The primary focus now shifts to implementing the remaining 19 service contracts and hardening
the ecosystem for enterprise workloads.

### What Works Today

| Capability | Status | Package |
|:---|:---:|:---|
| Protocol Specification (Zod Schemas) | ✅ | `@objectstack/spec` |
| Microkernel (ObjectKernel / LiteKernel) | ✅ | `@objectstack/core` |
| Data Engine (ObjectQL) | ✅ | `@objectstack/objectql` |
| In-Memory Driver | ✅ | `@objectstack/driver-memory` |
| Metadata Service | ✅ | `@objectstack/metadata` |
| REST API Server | ✅ | `@objectstack/rest` |
| Client SDK (TypeScript) | ✅ | `@objectstack/client` |
| React Hooks | ✅ | `@objectstack/client-react` |
| Authentication (better-auth) | ✅ | `@objectstack/plugin-auth` |
| RBAC / RLS / FLS Security | ✅ | `@objectstack/plugin-security` |
| CLI (16 commands) | ✅ | `@objectstack/cli` |
| Dev Mode Plugin | ✅ | `@objectstack/plugin-dev` |
| Next.js Adapter | ✅ | `@objectstack/nextjs` |
| NestJS Adapter | ✅ | `@objectstack/nestjs` |
| Hono HTTP Server | ✅ | `@objectstack/plugin-hono-server` |
| MSW Testing Plugin | ✅ | `@objectstack/plugin-msw` |
| VS Code Extension | 🟡 | `objectstack-vscode` |
| Studio IDE | 🟡 | `@objectstack/studio` |
| Hono Adapter | 🔴 | `@objectstack/hono` |

### What Needs Building

10 of 25 service contracts are specification-only (no runtime implementation).
These are the backbone of ObjectStack's enterprise capabilities.

### Minimal Implementation Strategy

ObjectStack follows a **minimal-first** approach to service implementation:

1. **Implement the smallest possible working version first** — Each service starts with the minimal viable implementation that unblocks real-world use cases.

2. **In-memory fallbacks via dev-plugin** — All non-critical services already have working in-memory fallbacks provided by `@objectstack/plugin-dev`, allowing development and testing to proceed while production implementations are built incrementally.

3. **DatabaseLoader is implemented (P0 resolved)** — The `DatabaseLoader` in the metadata service is now available, enabling:
   - Platform-level metadata editing in Studio
   - User overlay persistence across sessions
   - Multi-instance metadata synchronization
   - Production-grade metadata storage via any `IDataDriver`

4. **Independent upgrade path** — Each service can be independently upgraded from:
   - **Stub** (dev-plugin fallback) → **MVP** (minimal working implementation) → **Production** (full-featured with adapters)

This strategy ensures rapid iteration while maintaining a clear path to production readiness.

---

## Codebase Metrics

| Metric | Count |
|:---|---:|
| Packages (total) | 27 |
| Apps | 2 (Studio, Docs) |
| Examples | 4 (Todo, CRM, Host, BI Plugin) |
| Zod Schema Files | 177 |
| Exported Schemas | 1,100+ |
| `.describe()` Annotations | 7,111+ |
| Service Contracts | 25 |
| Contracts Implemented | 13 (52%) |
| Test Files | 199 |
| Tests Passing | 5,468 / 5,468 |
| `@deprecated` Items | 3 |
| Protocol Domains | 15 (Data, UI, AI, API, Automation, Cloud, Contracts, Identity, Integration, Kernel, QA, Security, Shared, Studio, System) |

---

## Package Naming Convention

> **Adopted:** 2026-02-15  
> **Scope:** All new packages from v3.1 onward; existing `plugin-auth` will migrate to `service-auth` in v4.0.

To clearly distinguish **core platform services** from **optional extensions**, all ObjectStack packages
follow a strict naming convention:

| Prefix | Purpose | Characteristics | Examples |
|:---|:---|:---|:---|
| `service-*` | **Core service implementations** | Implements an `I*Service` contract; provides platform infrastructure; typically required for production | `service-auth`, `service-cache`, `service-queue` |
| `plugin-*` | **Optional extensions** | Adds optional functionality; development tools, testing utilities, or domain-specific features; not required for production | `plugin-dev`, `plugin-msw`, `plugin-bi` |
| `driver-*` | **Data drivers** | Implements `IDataDriver` for a specific database | `driver-memory`, `driver-postgres` |
| `adapter / framework name` | **Framework adapters** | Integrates ObjectStack with a web framework | `nextjs`, `nestjs`, `hono`, `express` |

### Migration from `plugin-*` to `service-*`

The following renames are planned for packages that implement core service contracts:

| Current Name (v3.x) | New Name (v4.0) | Reason |
|:---|:---|:---|
| `@objectstack/plugin-auth` | `@objectstack/service-auth` | Implements `IAuthService` contract |
| `@objectstack/plugin-cache` (not yet published) | `@objectstack/service-cache` | Implements `ICacheService` contract |
| `@objectstack/plugin-queue` (not yet published) | `@objectstack/service-queue` | Implements `IQueueService` contract |
| `@objectstack/plugin-dev` | `@objectstack/plugin-dev` | ✅ Keep — optional developer tooling |
| `@objectstack/plugin-msw` | `@objectstack/plugin-msw` | ✅ Keep — optional test mocking |
| `@objectstack/plugin-bi` | `@objectstack/plugin-bi` | ✅ Keep — optional BI extension |
| `@objectstack/plugin-hono-server` | `@objectstack/service-http` | Implements `IHttpServer` contract |
| `@objectstack/plugin-security` | `@objectstack/service-security` | Implements security enforcement |

> **Note:** During v3.x, new service implementations will be published directly under `service-*` naming.
> The existing `plugin-auth` package will be preserved with a deprecation notice and re-export shim
> until v4.0 removes the old name.

---

## Phase 1: Protocol Specification (✅ Complete)

> **Goal:** Define every schema, type, and contract as a Zod-first source of truth.

### Deliverables — All Completed

- [x] **Data Protocol** — Object, Field (35+ types), Query, Filter, Validation, Hook, Datasource, Dataset, Analytics, Document, Storage Name Mapping (`tableName`/`columnName`), Feed & Activity Timeline (FeedItem, Comment, Mention, Reaction, FieldChange), Record Subscription (notification channels)
- [x] **Driver Specifications** — Memory, PostgreSQL, MongoDB driver schemas + SQL/NoSQL abstractions
- [x] **UI Protocol** — View (List/Form/Kanban/Calendar/Gantt), App, Dashboard, Report, Action, Page (16 types), Chart, Widget, Theme, Animation, DnD, Touch, Keyboard, Responsive, Offline, Notification, i18n, Content Elements, Enhanced Activity Timeline (`RecordActivityProps` unified timeline, `RecordChatterProps` sidebar/drawer)
- [x] **System Protocol** — Manifest, Auth Config, Cache, Logging, Metrics, Tracing, Audit, Encryption, Masking, Migration, Tenant, Translation, Search Engine, HTTP Server, Worker, Job, Object Storage, Notification, Message Queue, Registry Config, Collaboration, Compliance, Change Management, Disaster Recovery, License, Security Context, Core Services, SystemObjectName/SystemFieldName Constants, StorageNameMapping Utilities
- [x] **Automation Protocol** — Flow (autolaunched/screen/schedule), Workflow, State Machine, Trigger Registry, Approval, ETL, Sync, Webhook
- [x] **AI Protocol** — Agent, Agent Action, Conversation, Cost, MCP, Model Registry, NLQ, Orchestration, Predictive, RAG Pipeline, Runtime Ops, Feedback Loop, DevOps Agent, Plugin Development
- [x] **API Protocol** — Protocol (104 schemas), Endpoint, Contract, Router, Dispatcher, REST Server, GraphQL, OData, WebSocket, Realtime, Batch, Versioning, HTTP Cache, Documentation, Discovery, Registry, Errors, Auth, Auth Endpoints, Metadata, Analytics, Query Adapter, Storage, Plugin REST API
- [x] **Security Protocol** — Permission, Policy, RLS, Sharing, Territory
- [x] **Identity Protocol** — Identity, Organization, Role, SCIM
- [x] **Kernel Protocol** — Plugin, Plugin Lifecycle, Plugin Loading, Plugin Registry, Plugin Security, Plugin Validator, Plugin Versioning, Service Registry, Startup Orchestrator, Feature Flags, Context, Events, Metadata Plugin, Metadata Loader, Metadata Customization, CLI Extension, Dev Plugin, Package Registry, Package Upgrade, Execution Context
- [x] **Cloud Protocol** — Marketplace, App Store, Developer Portal, Marketplace Admin
- [x] **Integration Protocol** — Connector (Database, SaaS, File Storage, GitHub, Message Queue, Vercel)
- [x] **QA Protocol** — Testing framework schemas
- [x] **Studio Protocol** — Plugin extension schemas
- [x] **Contracts** — 25 service interfaces with full method signatures
- [x] **Stack Definition** — `defineStack()`, `defineView()`, `defineApp()`, `defineFlow()`, `defineAgent()` helpers
- [x] **Stack Composition** — `composeStacks()` for declarative multi-stack merging with conflict resolution (`error`/`override`/`merge`)
- [x] **Error Map** — Custom Zod error messages with `objectStackErrorMap`
- [x] **DX Utilities** — `safeParsePretty()`, `formatZodError()`, `suggestFieldType()`

---

## Phase 2: Core Runtime (✅ Complete)

> **Goal:** Build the microkernel, plugin system, and service infrastructure.

### Deliverables — All Completed

- [x] **ObjectKernel** — Full-featured async kernel with dependency resolution, rollback, health monitoring
- [x] **LiteKernel** — Lightweight sync kernel for serverless/test environments
- [x] **Plugin Lifecycle** — Three-phase lifecycle (init → start → destroy) with timeout/rollback
- [x] **Service Registry** — SINGLETON / TRANSIENT / SCOPED lifecycle, factory pattern, circular detection
- [x] **Logger** — Pino-based structured logging with child loggers and trace context
- [x] **API Registry** — Multi-protocol endpoint registry with conflict resolution
- [x] **Health Monitor** — Plugin health checking and recovery
- [x] **Hot Reload** — Runtime plugin hot-reload capability
- [x] **Dependency Resolver** — Semantic version parsing and constraint matching
- [x] **Security** — Permission manager, plugin permission enforcer, config validator, signature verifier, sandbox runtime, security scanner
- [x] **QA Module** — Testing adapter, HTTP adapter, test runner

---

## Phase 3: Data Layer (🟡 Mostly Complete)

> **Goal:** Deliver a production-ready data engine with multiple driver support.

### Completed

- [x] **ObjectQL Engine** — CRUD, hooks (before/after), middleware chain, action registry
- [x] **Schema Registry** — FQN namespacing, multi-package contribution, priority resolution
- [x] **In-Memory Driver** — Full CRUD, bulk ops, transactions, aggregation pipeline (Mingo), streaming
- [x] **Metadata Service** — CRUD, query, bulk ops, overlay system, dependency tracking, import/export, file watching
- [x] **Serializers** — JSON, YAML, TypeScript format support
- [x] **Loaders** — Memory, Filesystem, Remote (HTTP) loaders
- [x] **REST API** — Auto-generated CRUD/Metadata/Batch/Discovery endpoints
- [x] **Protocol Implementation** — Discovery, ETag caching, batch operations, service status

### Remaining

- [ ] **PostgreSQL Driver** — Real SQL driver implementing `IDataDriver` (schema exists at `data/driver/postgres.zod.ts`)
- [ ] **MongoDB Driver** — Real NoSQL driver implementing `IDataDriver` (schema exists at `data/driver/mongo.zod.ts`)
- [ ] **Schema Migration Executor** — `modify_field` and `rename_object` operations incomplete
- [ ] **Vector Search** — `vectorFind()` on IDataEngine (spec defined, not implemented)
- [ ] **Full-Text Search Integration** — Driver-level FTS with ISearchService bridge
- [ ] **Connection Pooling** — `getPoolStats()` on IDataDriver

---

## Phase 4: Service Implementations (🔴 In Progress)

> **Goal:** Implement the remaining service contracts following the minimal-first strategy.  
> **Naming:** All contract implementations use `service-*` prefix (see [Package Naming Convention](#package-naming-convention)).

### Phase 4a: Metadata Persistence (P0 — ✅ Complete)

**The single critical blocker preventing production deployment — resolved.**

**DatabaseLoader Implementation:**
- [x] **Implement `DatabaseLoader`** in `packages/metadata/src/loaders/database-loader.ts`
  - [x] Implement `MetadataLoader` interface with protocol `datasource:`
  - [x] Accept `IDataDriver` instance via constructor injection
  - [x] Map to `sys_metadata` table CRUD operations
  - [x] Support `scope` filtering (system/platform/user)
  - [x] Auto-create `sys_metadata` table on first use via `syncSchema`
  - [x] Implement upsert semantics for `save()` operations
  - [x] Support optimistic concurrency via `version` field
  - [x] Implement `list()` with type filtering and pagination
  - [x] Declare capabilities: `{ read: true, write: true, watch: false, list: true }`

**Metadata Manager Integration:**
- [x] Auto-configure `DatabaseLoader` when `config.datasource` + `config.driver` is set
- [x] `setDatabaseDriver(driver)` for deferred setup via kernel service registry
- [x] Support multi-tenant isolation via `tenantId` filter
- [ ] Implement fallback strategy per `config.fallback` setting
- [ ] Persist overlay customizations to database (overlay save/remove backed by DatabaseLoader)

**Tests:**
- [x] Unit tests with mock `IDataDriver` (31 tests)
- [x] Integration tests for MetadataManager + DatabaseLoader (9 tests)
- [x] Error handling tests (driver failures → graceful degradation)

**This unblocks:**
- Platform-level metadata editing in Studio
- User overlay persistence across sessions
- Multi-instance metadata synchronization
- Production-grade metadata storage

### Phase 4b: Infrastructure Service Upgrades (P1 — Weeks 3-4)

**Upgrade existing services from in-memory fallbacks to production adapters.**

| Contract | Current Status | Upgrade Path |
|:---|:---|:---|
| `ICacheService` | ✅ Memory adapter + Redis skeleton | Add Redis adapter implementation |
| `IQueueService` | ✅ Memory adapter + BullMQ skeleton | Add BullMQ adapter implementation |
| `IJobService` | ✅ Interval scheduler + cron skeleton | Add cron adapter implementation |
| `IStorageService` | ✅ Local FS + S3 skeleton | Add S3 adapter implementation |

- [ ] `service-cache` — Implement Redis adapter with connection pooling
- [ ] `service-queue` — Implement BullMQ adapter with job persistence
- [ ] `service-job` — Implement cron adapter with distributed coordination
- [ ] `service-storage` — Implement S3 adapter with multipart upload

### Phase 4c: Communication & Search Services (P1 — Weeks 5-6)

**Implement new service contracts with minimal viable implementations.**

| Contract | Priority | Package | Notes |
|:---|:---:|:---|:---|
| `II18nService` | **P1** | `@objectstack/service-i18n` | Map-backed translation with locale resolution |
| `IRealtimeService` | **P1** | `@objectstack/service-realtime` | WebSocket/SSE push (replaces Studio setTimeout hack) |
| `ISearchService` | **P1** | `@objectstack/service-search` | In-memory search first, then Meilisearch driver |
| `INotificationService` | **P2** | `@objectstack/service-notification` | Email adapter (console logger in dev mode) |

- [x] `service-i18n` — Implement `II18nService` with file-based locale loading
- [x] `service-realtime` — Implement `IRealtimeService` with WebSocket + in-memory pub/sub
- [ ] `service-search` — Implement `ISearchService` with in-memory search + Meilisearch adapter
- [ ] `service-notification` — Implement `INotificationService` with email adapter

### Phase 4d: Business Logic Services (P2 — Future)

**Advanced services for workflow automation and business intelligence.**

| Contract | Priority | Package | Notes |
|:---|:---:|:---|:---|
| `IAutomationService` | **P2** | `@objectstack/service-automation` | Flow execution engine |
| `IWorkflowService` | **P2** | `@objectstack/service-workflow` | State machine + approval processes |
| `IGraphQLService` | **P2** | `@objectstack/service-graphql` | Auto-generated GraphQL from objects |
| `IAIService` | **P2** | `@objectstack/service-ai` | LLM integration (OpenAI/Anthropic/local) |
| `IAnalyticsService` | **P3** | `@objectstack/service-analytics` | BI/OLAP queries |

- [ ] `service-automation` — Implement `IAutomationService` with flow execution engine
- [ ] `service-workflow` — Implement `IWorkflowService` with state machine runtime
- [ ] `service-graphql` — Implement `IGraphQLService` with auto-schema generation
- [ ] `service-ai` — Implement `IAIService` with multi-provider LLM routing
- [ ] `service-analytics` — Implement full `IAnalyticsService` beyond memory reference

---

## Phase 5: Framework Adapters (✅ Complete)

> **Goal:** First-class integration with popular web frameworks.

### Completed

- [x] **Next.js Adapter** — App Router, Auth/GraphQL/Meta/Data/Storage handlers (10/10)
- [x] **NestJS Adapter** — Full DI module, Express/Fastify support (10/10)
- [x] **Hono Server Plugin** — Production HTTP server with static file serving
- [x] **Hono Adapter** — Full route dispatchers for Auth/GraphQL/Meta/Data/Storage with createHonoApp
- [x] **Next.js Server Actions** — createServerActions with query/getById/create/update/remove/getMetadata
- [x] **Express Adapter** — Standalone Express v5 router with all ObjectStack routes
- [x] **Fastify Adapter** — Fastify plugin with full route dispatchers
- [x] **SvelteKit Adapter** — Web-standard Request/Response based handler for SvelteKit routes
- [x] **Nuxt Adapter** — h3 router integration for Nuxt server routes

---

## Phase 6: Enterprise Services (🔴 Planned)

> **Goal:** Production hardening for enterprise deployment scenarios.

### 6.1 Database Drivers

- [ ] `driver-postgres` — PostgreSQL driver with connection pooling, prepared statements, migrations
- [ ] `driver-mysql` — MySQL/MariaDB driver
- [ ] `driver-sqlite` — SQLite driver for edge/embedded
- [ ] `driver-mongodb` — MongoDB driver with aggregation pipeline
- [ ] `driver-turso` — Turso/libSQL edge database driver (see [Design Document](docs/design/driver-turso.md))
  - [x] **Phase 0: Protocol Schema** — `TursoConfigSchema`, `TursoSyncConfigSchema`, `TursoDriverSpec` defined in `packages/spec/src/data/driver/turso.zod.ts`
  - [ ] **Phase A: Core Driver** (v3.1) — `IDataDriver` + `ISchemaDriver` implementation, QueryAST→SQL compiler, plugin wrapper
  - [ ] **Phase B: Edge & Sync** (v3.2) — Embedded replica sync, WASM build for Cloudflare/Deno, offline write queue
  - [ ] **Phase C: Multi-Tenancy** (v3.3) — Database-per-tenant router, Turso Platform API integration
  - [ ] **Phase D: Advanced** (v4.0) — Vector search + `IAIService`, FTS5 + `ISearchService`, better-auth adapter
- [ ] Driver benchmark suite comparing performance across all drivers

### 6.2 Multi-Tenancy

- [ ] Tenant isolation strategies (schema-per-tenant, row-level, database-per-tenant)
- [ ] Tenant provisioning and lifecycle management
- [ ] Cross-tenant data sharing policies

### 6.3 Observability

- [ ] OpenTelemetry integration (traces, metrics, logs)
- [ ] Distributed tracing across plugin boundaries
- [ ] Health dashboard and alerting
- [ ] Query performance monitoring and slow-query detection

### 6.4 Compliance & Audit

- [ ] Audit trail for all data mutations
- [ ] Data masking and encryption at rest
- [ ] GDPR/CCPA compliance utilities (right to erasure, data export)
- [ ] Change management and approval workflows for schema changes

---

## Phase 7: AI & Intelligence (🔴 Planned)

> **Goal:** First-class AI/ML capabilities as native platform services.

### 7.1 Core AI Services

- [ ] `service-ai` — Multi-provider LLM service (OpenAI, Anthropic, Gemini, local models)
- [ ] NLQ (Natural Language Query) runtime — translate natural language to ObjectQL
- [ ] Embedding service for vector search and RAG

### 7.2 Agent Framework

- [ ] Agent runtime — execute AI agents defined in spec schemas
- [ ] Tool registry — connect agents to ObjectQL operations, APIs, and workflows
- [ ] Conversation management — persistent chat with context windows

### 7.3 RAG Pipeline

- [ ] Document ingestion and chunking
- [ ] Vector store integration (Pinecone, Qdrant, pgvector)
- [ ] Retrieval-augmented generation with source attribution

### 7.4 Intelligence Layer

- [ ] Predictive analytics on object data
- [ ] Anomaly detection for operational metrics
- [ ] AI-assisted schema design and query optimization

---

## Phase 8: Platform & Ecosystem (🔴 Planned)

> **Goal:** Build the ecosystem for community and enterprise adoption.

### 8.1 UI Protocol Enhancement — Airtable Interface Parity

> See [Airtable Interface Gap Analysis](docs/design/airtable-interface-gap-analysis.md) for the full evaluation.
> **Note:** The `InterfaceSchema` layer has been removed in favor of direct App→Page navigation.
> App now supports unlimited nesting depth and sharing/embed capabilities directly.

#### Phase A: Page Foundation (v3.2) ✅

- [x] `RecordReviewConfigSchema` — Sequential record review/approval page type with navigation and actions
- [x] Content elements — `element:text`, `element:number`, `element:image`, `element:divider` as `PageComponentType` extensions
- [x] Per-element data binding — `dataSource` property on `PageComponentSchema` for multi-object pages
- [x] Element props — `ElementTextPropsSchema`, `ElementNumberPropsSchema`, `ElementImagePropsSchema`

#### Phase B: Element Library & Builder (v3.3) ✅

- [x] Interactive elements — `element:button`, `element:filter`, `element:form`, `element:record_picker`
- [x] `BlankPageLayoutSchema` — Free-form canvas composition with grid-based positioning
- [x] Record picker variable binding — `PageVariableSchema` integration with `element:record_picker`
- [x] `PageBuilderConfigSchema` — Canvas snap, zoom, element palette, layer panel configuration
- [ ] Studio Page Builder — Drag-and-drop element placement UI (runtime)

#### Phase C: Sharing, Embedding & Permissions (v4.0) 🟡

- [x] `SharingConfigSchema` — Public link, password, domain restriction, expiration (`src/ui/sharing.zod.ts`)
- [x] `EmbedConfigSchema` — iframe embedding with origin restrictions and display options
- [x] App-level sharing/embed — `sharing` and `embed` on `AppSchema`
- [x] Public form sharing — `sharing` property on `FormViewSchema`
- [ ] Design-time user impersonation — `previewAs` option for page preview (see [UX Optimization](docs/design/visual-design-ux-optimization.md))
- [ ] Share link generation runtime service
- [ ] Embed code generation runtime service
- [ ] Security audit for shared/embedded access control

#### Phase D: Advanced Page Features (v4.1)

- [ ] Page templates and duplication
- [ ] Page versioning — draft → published → archived lifecycle
- [ ] Real-time collaborative page editing
- [ ] Page analytics — page views, element interactions, user engagement

### 8.2 Dashboard Enhancement — Airtable Dashboard Parity

> See [Airtable Dashboard Gap Analysis](content/docs/guides/airtable-dashboard-analysis.mdx) for the full evaluation and implementation examples.
> **Related Issues:** [#712](https://github.com/objectstack-ai/spec/issues/712), [#713](https://github.com/objectstack-ai/spec/issues/713), [#714](https://github.com/objectstack-ai/spec/issues/714), [objectui#585](https://github.com/objectstack-ai/objectui/issues/585), [objectui#586](https://github.com/objectstack-ai/objectui/issues/586), [objectui#587](https://github.com/objectstack-ai/objectui/issues/587), [objectui#588](https://github.com/objectstack-ai/objectui/issues/588)

#### Phase 1: Foundation (Sprint 1-2) — 2 weeks 🔴

Protocol enhancements and core component implementations for dashboard feature parity.

**Spec Protocol Changes:**
- [x] Add `colorVariant`, `actionUrl`, `description`, `actionType`, `actionIcon` to `DashboardWidgetSchema` ([#713](https://github.com/objectstack-ai/spec/issues/713))
- [x] Enhance `globalFilters` with `options`, `optionsFrom`, `defaultValue`, `scope`, `targetWidgets` ([#712](https://github.com/objectstack-ai/spec/issues/712))
- [x] Add `header` configuration to `DashboardSchema` with `showTitle`, `showDescription`, `actions` ([#714](https://github.com/objectstack-ai/spec/issues/714))
- [x] Add `pivotConfig` and `measures` array to `DashboardWidgetSchema` for multi-measure pivots ([#714](https://github.com/objectstack-ai/spec/issues/714))

**ObjectUI Component Implementations:**
- [ ] Implement `DashboardFilterBar` component for global filters ([objectui#588](https://github.com/objectstack-ai/objectui/issues/588))
- [ ] Add color variants + action button support to `MetricCard` component ([objectui#587](https://github.com/objectstack-ai/objectui/issues/587))
- [ ] Add description + action button to widget headers ([objectui#586](https://github.com/objectstack-ai/objectui/issues/586))

**Total Effort:** ~7.5 days

#### Phase 2: Advanced Widgets (Sprint 3-4) — 2 weeks 🟡

Advanced widget types and chart implementations.

- [ ] Implement `PivotTable` component with row/column totals and multi-measure support ([objectui#585](https://github.com/objectstack-ai/objectui/issues/585))
- [x] Protocol support for `funnel` chart type in `DashboardWidgetSchema` ([#713](https://github.com/objectstack-ai/spec/issues/713))
- [x] Protocol support for `grouped-bar` chart type in `DashboardWidgetSchema` ([#713](https://github.com/objectstack-ai/spec/issues/713))
- [ ] Implement `funnel` chart renderer in `plugin-charts` ([#713](https://github.com/objectstack-ai/spec/issues/713))
- [ ] Implement `grouped-bar` chart renderer in `plugin-charts` ([#713](https://github.com/objectstack-ai/spec/issues/713))
- [ ] Implement `stacked-bar` chart type in `plugin-charts` ([#713](https://github.com/objectstack-ai/spec/issues/713))
- [ ] Implement `horizontal-bar` chart variant in `plugin-charts` ([#713](https://github.com/objectstack-ai/spec/issues/713))

**Total Effort:** ~8.5 days

#### Phase 3: Polish & Enhancement (Sprint 5) — 1 week 🟢

Final polish and advanced features.

- [ ] Implement `DashboardHeader` composite component ([objectui#586](https://github.com/objectstack-ai/objectui/issues/586))
- [ ] Implement `gauge` chart type in `plugin-charts` ([#713](https://github.com/objectstack-ai/spec/issues/713))
- [ ] Add dashboard export (PDF/Image) functionality

**Total Effort:** ~6 days

**Total Project Timeline:** ~22 days (4.5 weeks)

### 8.3 Studio IDE

- [x] Object Designer Protocol — field editor, relationship mapper, ER diagram, object manager schemas defined (`studio/object-designer.zod.ts`)
- [ ] Object Designer Runtime — visual field editor with inline editing, drag-reorder, type-aware property panels
- [ ] Relationship Mapper — visual lookup/master-detail/tree creation with drag-to-connect
- [ ] ER Diagram — interactive entity-relationship diagram with force/hierarchy/grid layouts, minimap, zoom, export (PNG/SVG)
- [ ] Object Manager — unified object list with search, filter, card/table/tree views, quick preview, statistics
- [ ] View Builder — drag-and-drop list/form/dashboard designers
- [ ] Page Builder — drag-and-drop page designer with element palette (see [Gap Analysis](docs/design/airtable-interface-gap-analysis.md))
- [ ] Flow Builder — visual automation flow editor
- [ ] Security Console — permission matrix, RLS policy editor
- [ ] AI Playground — agent testing, NLQ sandbox
- [ ] Code Editor — Monaco-based TypeScript editing with live preview

> See [`apps/studio/ROADMAP.md`](apps/studio/ROADMAP.md) for detailed Studio phases.

### 8.4 Developer Experience

- [ ] VS Code Extension — full IntelliSense, diagnostics, and code actions for `.object.ts`, `.view.ts`
- [ ] `create-objectstack` scaffolding — templates for app, plugin, driver, adapter
- [ ] Documentation site — interactive tutorials, API playground
- [ ] CLI enhancements — `objectstack migrate`, `objectstack deploy`

### 8.5 Marketplace & Cloud

- [ ] Plugin marketplace — publish, discover, install community plugins
- [ ] App store — pre-built applications (CRM, HRM, Project Management)
- [ ] Developer portal — API keys, usage metrics, billing
- [ ] Managed cloud offering — ObjectStack-as-a-Service

### 8.6 Example Applications

- [x] **app-todo** — Beginner reference (objects, actions, flows, dashboards, reports, i18n) ✅
- [x] **app-crm** — Enterprise reference (10 objects, 5 AI agents, 4 RAG pipelines, security profiles) ✅
- [x] **app-host** — Multi-app orchestration pattern ✅
- [ ] **plugin-bi** — Business Intelligence plugin (currently a stub/placeholder)
- [ ] **app-hrm** — Human Resource Management example
- [ ] **app-project** — Project Management example
- [ ] **app-ecommerce** — E-commerce example

---

## Contract Implementation Matrix

| # | Contract | Interface | Implemented | Package | Notes |
|:---:|:---|:---|:---:|:---|:---|
| 1 | Data Engine | `IDataEngine` | ✅ | `@objectstack/objectql` | Full CRUD + hooks + middleware |
| 2 | Data Driver | `IDataDriver` | ✅ | `@objectstack/driver-memory` | In-memory reference driver |
| 3 | Metadata Service | `IMetadataService` | ✅ | `@objectstack/metadata` | Full CRUD + overlays + deps |
| 4 | Auth Service | `IAuthService` | ✅ | `@objectstack/plugin-auth` → `@objectstack/service-auth` in v4.0 | better-auth integration |
| 5 | HTTP Server | `IHttpServer` | ✅ | `@objectstack/plugin-hono-server` → `@objectstack/service-http` in v4.0 | Hono-based server |
| 6 | Logger | `Logger` | ✅ | `@objectstack/core` | Pino-based structured logging |
| 7 | Service Registry | `IServiceRegistry` | ✅ | `@objectstack/core` | Built into ObjectKernel |
| 8 | Analytics Service | `IAnalyticsService` | 🟡 | `@objectstack/driver-memory` | Memory reference only |
| 9 | Plugin Lifecycle | `IPluginLifecycleEvents` | 🟡 | `@objectstack/core` | Partial in kernel |
| 10 | Cache Service | `ICacheService` | ✅ | `@objectstack/service-cache` | Memory + Redis skeleton |
| 11 | Queue Service | `IQueueService` | ✅ | `@objectstack/service-queue` | Memory + BullMQ skeleton |
| 12 | Job Service | `IJobService` | ✅ | `@objectstack/service-job` | Interval + cron skeleton |
| 13 | Storage Service | `IStorageService` | ✅ | `@objectstack/service-storage` | Local FS + S3 skeleton |
| 14 | Realtime Service | `IRealtimeService` | ✅ | `@objectstack/service-realtime` | In-memory pub/sub |
| 15 | Search Service | `ISearchService` | ❌ | `@objectstack/service-search` (planned) | Spec only |
| 16 | Notification Service | `INotificationService` | ❌ | `@objectstack/service-notification` (planned) | Spec only |
| 17 | AI Service | `IAIService` | ❌ | `@objectstack/service-ai` (planned) | Spec only |
| 18 | Automation Service | `IAutomationService` | ❌ | `@objectstack/service-automation` (planned) | Spec only |
| 19 | Workflow Service | `IWorkflowService` | ❌ | `@objectstack/service-workflow` (planned) | Spec only |
| 20 | GraphQL Service | `IGraphQLService` | ❌ | `@objectstack/service-graphql` (planned) | Spec only |
| 21 | i18n Service | `II18nService` | ✅ | `@objectstack/service-i18n` | File-based locale loading |
| 22 | UI Service | `IUIService` | ⚠️ | — | **Deprecated** — merged into `IMetadataService` |
| 23 | Schema Driver | `ISchemaDriver` | ❌ | — | Spec only |
| 24 | Startup Orchestrator | `IStartupOrchestrator` | ❌ | — | Kernel handles basics |
| 25 | Plugin Validator | `IPluginValidator` | ❌ | — | Spec only |

**Summary:** 13 fully implemented · 2 partially implemented · 10 specification only

---

## Package Status Matrix

| Package | Version | Tests | Status | Completeness |
|:---|:---:|:---:|:---:|:---:|
| `@objectstack/spec` | 3.0.2 | 5,269 | ✅ Stable | 10/10 |
| `@objectstack/core` | 3.0.2 | 12 files | ✅ Stable | 10/10 |
| `@objectstack/objectql` | 3.0.2 | ✅ | ✅ Stable | 9/10 |
| `@objectstack/metadata` | 3.0.2 | ✅ | ✅ Stable | 9/10 |
| `@objectstack/rest` | 3.0.2 | ✅ | ✅ Stable | 9/10 |
| `@objectstack/client` | 3.0.2 | ✅ | ✅ Stable | 10/10 |
| `@objectstack/client-react` | 3.0.2 | — | ✅ Stable | 9/10 |
| `@objectstack/runtime` | 3.0.2 | ✅ | ✅ Stable | 9/10 |
| `@objectstack/cli` | 3.0.2 | — | ✅ Stable | 9/10 |
| `@objectstack/driver-memory` | 3.0.2 | ✅ | ✅ Stable | 9/10 |
| `@objectstack/plugin-auth` | 3.0.2 | ✅ | ✅ Stable | 9/10 |
| `@objectstack/plugin-security` | 3.0.2 | — | ✅ Stable | 9/10 |
| `@objectstack/plugin-dev` | 3.0.2 | — | ✅ Stable | 10/10 |
| `@objectstack/plugin-hono-server` | 3.0.2 | — | ✅ Stable | 9/10 |
| `@objectstack/plugin-msw` | 3.0.2 | — | ✅ Stable | 9/10 |
| `@objectstack/service-cache` | 3.0.6 | 13 | ✅ Stable | 7/10 |
| `@objectstack/service-queue` | 3.0.6 | 8 | ✅ Stable | 7/10 |
| `@objectstack/service-job` | 3.0.6 | 11 | ✅ Stable | 7/10 |
| `@objectstack/service-storage` | 3.0.6 | 8 | ✅ Stable | 7/10 |
| `@objectstack/service-i18n` | 3.0.7 | 20 | ✅ Stable | 7/10 |
| `@objectstack/service-realtime` | 3.0.7 | 14 | ✅ Stable | 7/10 |
| `@objectstack/nextjs` | 3.0.2 | ✅ | ✅ Stable | 10/10 |
| `@objectstack/nestjs` | 3.0.2 | ✅ | ✅ Stable | 10/10 |
| `@objectstack/hono` | 3.0.2 | ✅ | ✅ Stable | 10/10 |
| `@objectstack/express` | 3.0.2 | ✅ | ✅ Stable | 9/10 |
| `@objectstack/fastify` | 3.0.2 | ✅ | ✅ Stable | 9/10 |
| `@objectstack/sveltekit` | 3.0.2 | ✅ | ✅ Stable | 9/10 |
| `@objectstack/nuxt` | 3.0.2 | ✅ | ✅ Stable | 9/10 |
| `@objectstack/types` | 3.0.2 | — | 🟡 Minimal | 3/10 |
| `objectstack-vscode` | 0.1.0 | — | 🟡 Early | 4/10 |
| `create-objectstack` | 3.0.0 | — | 🟡 Basic | 5/10 |
| `@objectstack/studio` | 3.0.2 | — | 🟡 In Progress | 5/10 |
| `@objectstack/docs` | 3.0.2 | — | 🟡 In Progress | 6/10 |

---

## v4.0 Schema & Toolchain Roadmap

> **Target:** Q1 2027  
> **Theme:** Schema infrastructure upgrade, cross-ecosystem interoperability

| Priority | Action | Reason |
|:---:|:---|:---|
| **P0** | Complete Zod v4 migration | 2-7x performance improvement + built-in JSON Schema |
| **P0** | Rename `plugin-auth` → `service-auth`, `plugin-hono-server` → `service-http`, `plugin-security` → `service-security` | Align existing packages with `service-*` / `plugin-*` naming convention |
| **P1** | Add JSON Schema output layer | Provide protocol descriptions for non-TS ecosystems (Python/Go clients) |
| **P2** | Consider OpenAPI Spec generation | Auto-generate OpenAPI from Zod Schema, connecting the full API toolchain |
| **P3** | Evaluate Effect Schema | If Zod v4 performance is still insufficient, as a long-term candidate |

---

## Versioning Plan

| Version | Target | Focus |
|:---|:---|:---|
| **v3.0** | ✅ Shipped | Protocol specification complete, core runtime stable |
| **v3.1** | Q2 2026 | Essential services (`service-cache`, `service-queue`, `service-job`, `service-storage`), PostgreSQL driver, Turso/libSQL core driver ([design](docs/design/driver-turso.md)) |
| **v3.2** | Q3 2026 | Communication services (`service-realtime`, `service-graphql`, `service-i18n`, `service-notification`), Turso embedded replica & edge sync, UI Protocol Enhancement Phase A (`RecordReviewConfig`, content elements) — see [gap analysis](docs/design/airtable-interface-gap-analysis.md) |
| **v3.3** | Q4 2026 | Business logic services (`service-automation`, `service-workflow`, `service-search`), Turso multi-tenancy (database-per-tenant), UI Protocol Enhancement Phase B spec ✅ complete (interactive elements, blank page layout), Studio Page Builder runtime, Visual Design UX optimization ([plan](docs/design/visual-design-ux-optimization.md)) |
| **v4.0** | Q1 2027 | Zod v4 migration, `plugin-auth` → `service-auth` rename, JSON Schema output, OpenAPI generation, AI services, multi-tenancy, Turso vector search & FTS5 integration, UI Protocol Enhancement Phase C spec 🟡 mostly complete (sharing, embedding), `previewAs` design-time preview, Data Studio protocol, runtime share/embed services |
| **v4.1** | Q2 2027 | Studio IDE general availability, marketplace launch, UI Protocol Enhancement Phase D (templates, versioning, collaborative editing), Page Builder enhancements (selection model, clipboard, alignment) |
| **v5.0** | 2027+ | Managed cloud, app store, global ecosystem |

---

## Related Documents

| Document | Description |
|:---|:---|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Microkernel design, package structure, three-layer protocol stack |
| [`docs/design/driver-turso.md`](docs/design/driver-turso.md) | Turso/libSQL driver design document — architecture impact, capabilities, implementation phases |
| [`docs/design/airtable-interface-gap-analysis.md`](docs/design/airtable-interface-gap-analysis.md) | Airtable Interface gap analysis — UI protocol comparison, schema proposals, implementation roadmap |
| [`content/docs/guides/airtable-dashboard-analysis.mdx`](content/docs/guides/airtable-dashboard-analysis.mdx) | Airtable Dashboard gap analysis — Dashboard protocol & component enhancements, pivot tables, global filters, implementation roadmap |
| [`docs/design/visual-design-ux-optimization.md`](docs/design/visual-design-ux-optimization.md) | Visual Design UX optimization plan — Airtable benchmark, spec coverage audit, Studio builder alignment |
| [`apps/studio/ROADMAP.md`](apps/studio/ROADMAP.md) | Studio IDE development phases (v2.1 → v3.0) |
| [`docs/DX_ROADMAP.md`](docs/DX_ROADMAP.md) | Developer experience improvements |
| [`RELEASE_NOTES.md`](RELEASE_NOTES.md) | Version history and changelog |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Contribution guidelines |
