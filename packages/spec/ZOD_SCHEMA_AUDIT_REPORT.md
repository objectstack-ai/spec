# ObjectStack Protocol Architecture & Zod Schema Audit Report

> **Generated:** 2026-02-07  
> **Scope:** `packages/spec/src/**/*.zod.ts` (139 files, 43,746 lines)  
> **Package:** `@objectstack/spec`  
> **Perspective:** Enterprise Management Software Architect + AI Agent Architect

---

## Executive Summary

| Metric | Value |
|---|---|
| Total `.zod.ts` files | **139** |
| Total lines of code | **43,746** |
| Exported schemas (`export const *Schema`) | **1,089** |
| `z.infer` type derivations | **1,011** |
| `.describe()` annotations | **5,026** |
| `z.any()` usages | **397** (across 88 files) |
| `z.unknown()` usages | **8** (across 3 files) |
| Files missing `z.infer` entirely | **5** |

### Overall Assessment

The codebase is **well-structured and professionally documented**, with excellent `.describe()` coverage (~5× per schema on average), consistent naming conventions, and good modular organization. The primary systemic issue is **pervasive `z.any()` usage** (397 instances in 63% of files), which undermines Zod's type-safety guarantees. A secondary concern is inconsistent use of `z.date()` vs `z.string().datetime()` for timestamps.

**Quality Grade: B+** — Excellent architecture and documentation, dragged down by loose typing.

---

## Part I: Protocol Architecture Evaluation

> The following evaluates the design rationality, completeness, and industry competitiveness of the ObjectStack protocol from the dual perspectives of a **top-tier enterprise management software architect** and an **AI Agent architect**.

### 0. Protocol Panorama

```
                         ┌────────────────────────────┐
                         │    ObjectStackDefinition    │  ← stack.zod.ts (Full-Stack Blueprint)
                         │   (Project ≡ Plugin Unified)│
                         └──────────┬─────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
   ┌────▼─────┐             ┌──────▼──────┐             ┌──────▼──────┐
   │  DATA    │             │     UI      │             │     AI      │
   │ Protocol │             │  Protocol   │             │  Protocol   │
   └────┬─────┘             └──────┬──────┘             └──────┬──────┘
        │                          │                           │
   Object ← Field            App ← View               Agent ← Tool
   Query ← Filter            Page ← Action             Orchestration
   Datasource ← Driver       Widget ← Theme            RAG ← Model
   Validation ← Hook         Dashboard ← Chart         Conversation
        │                          │                           │
   ┌────▼─────┐             ┌──────▼──────┐             ┌──────▼──────┐
   │ SECURITY │             │ AUTOMATION  │             │   SYSTEM    │
   │ Protocol │             │  Protocol   │             │  Protocol   │
   └──────────┘             └─────────────┘             └─────────────┘
   Permission ← RLS         Flow ← Workflow             Manifest ← Plugin
   Sharing ← Territory      Trigger ← Webhook           Identity ← SCIM
   Policy                   Approval ← ETL              Translation
```

---

### 1. Data Protocol Evaluation

**Rating: A-** — Federated query capabilities exceed industry standards, but field type modeling has structural deficiencies.

#### 1.1 Architecture Decision Review

| Decision | Analysis | Verdict |
|:---|:---|:---:|
| **Field uses flat z.object() instead of discriminatedUnion** | 46 field types share a single structure; `vectorConfig`/`currencyConfig` etc. are mounted as optional properties. Cannot statically prevent illegal combinations like `type: 'text'` with `vectorConfig` | ⚠️ |
| **Object.fields uses `z.record()` instead of array** | Key is the field name, making `Field.name` redundant. More compact than Salesforce XML, but lookup model is inconsistent with `objects[]` array form in stack definition | ✅ |
| **QuerySchema as database-agnostic AST** | Unifies SQL/NoSQL/SaaS into a single query language with Window Functions and Full-Text Search. SQL-biased but capability-driven pushdown | ✅✅ |
| **Capabilities-driven Query Planning** | Engine uses `DatasourceCapabilities` to decide pushdown vs in-memory computation, similar to Calcite/Trino federated query | ✅✅ |
| **Own/Extend ownership model** | Any package can declare `extend` to inject fields into other packages' objects, with priority system controlling merge | ✅✅ |
| **Filter DSL uses MongoDB-style `$` prefix** | Flexible but `FilterConditionSchema` uses `z.record(z.string(), z.any())`, making runtime validation nearly zero | ⚠️ |

#### 1.2 Gaps vs Industry Leaders

| Missing Concept | Impact | Description |
|:---|:---:|:---|
| **Record Type** | 🔴 High | Core Salesforce concept — same object displays different layouts/validations/picklist values per record type. Foundational for building complex business apps |
| **Polymorphic Lookup** | 🟡 Medium | Salesforce's `WhoId`/`WhatId` can point to multiple objects. Current `reference` only supports a single target |
| **Object Inheritance** | 🟡 Medium | ServiceNow Table Inheritance is a core feature. Current has `abstract` flag but no `extends` inheritance chain |
| **Compound Fields** | 🟡 Medium | Structured composite fields like Name (First+Last), Address are missing |
| **Dependent Picklist** | 🟡 Medium | Cascading picklist dependencies (e.g., "Country" controls "State" options) |
| **CTE / UNION / Subquery** | 🟢 Low | Complex analytical SQL operations missing, but can be supplemented via analytics layer |
| **Governor Limits** | 🟡 Medium | Missing query quota/limit declarations (Salesforce SOQL Limits are a governance foundation) |
| **Field Generic Extension Point** | 🟡 Medium | No `metadata`/`extensions` record for plugins to inject custom field properties |

#### 1.3 Key Strengths

- **Federated Data Architecture**: Multi-datasource + capability-driven query planning, surpasses all traditional low-code platforms
- **Built-in Event Sourcing**: Object-level `versioning: 'event_sourcing'` mode declaration
- **Vector Fields as First-Class Citizens**: `type: 'vector'` + `vectorConfig`, built for AI-native
- **Hook Priority Layering**: 0-99 system-level, 100-999 application-level, 1000+ user-level, aligned with K8s Admission Controller

---

### 2. AI Agent Protocol Evaluation

**Rating: B** — Single-agent capabilities are industry-leading, but multi-agent collaboration and safety guardrails are critical shortcomings.

#### 2.1 Architecture Capability Matrix

| Dimension | Score | Description |
|:---|:---:|:---|
| **Agent Definition** | 9/10 | Declarative Agent + role/instructions/model/tools/knowledge/lifecycle state machine. Surpasses OpenAI Assistants |
| **UI Action Protocol** | 9/10 | 40+ atomic actions covering navigation/form/data/workflow/component operations, industry-leading |
| **RAG Pipeline** | 9/10 | 10 vector stores + 4 chunking strategies + 4 retrieval strategies + reranking, enterprise-ready |
| **Model Registry** | 9/10 | Full model lifecycle + fallback + selection strategies + Prompt Template. Correct enterprise choice |
| **Conversation Memory** | 8/10 | Multimodal + 5 pruning strategies + vector embedding. OpenAI-compatible Tool Call protocol |
| **Tool Binding** | 5/10 | Loosely-coupled name references, **missing `inputSchema`/`outputSchema` parameter declarations**. Agent cannot know tool signatures at compile time |
| **Single-Agent Orchestration** | 6/10 | 10 AI task types + batch execution, but only task-level parallelism, not agent-level |
| **Multi-Agent Collaboration** | 2/10 | **Completely missing**: No AgentTeam, Routing, Handoff, Supervisor patterns |
| **Flow ↔ AI Integration** | 4/10 | Agent → Flow(✅) but Flow → Agent(❌). Flow nodes have no `ai_task`/`agent_call` type |
| **Safety Guardrails** | 5/10 | Has confirmation/confidence/state-machine constraints, but lacks PII detection, Prompt Injection defense, content safety policy |

#### 2.2 Key Architecture Deficiencies

**Deficiency 1: Flow and AI are two parallel systems**

```
Current:  Agent ──→ Flow   (one-way invocation)
          Flow  ──✘ Agent  (Flow cannot invoke AI)

Ideal:    Agent ←──→ Flow  (bidirectional integration)
          Flow nodes: [start, decision, ..., ai_task, agent_call, human_in_loop]
```

None of the Flow's 14 node types include `ai_task` or `agent_call`. This means automation flows cannot invoke AI classification/extraction/generation at intermediate steps — they must use `script` nodes as an escape hatch.

**Deficiency 2: Tool binding lacks parameter declarations**

```typescript
// Current: Agent only knows tool name and description
AIToolSchema = { type, name, description }

// Missing: Tool parameter signatures (aligned with OpenAI function calling)
AIToolSchema = { type, name, description, inputSchema, outputSchema }
```

Without `inputSchema`/`outputSchema`, Agent cannot validate tool call parameters at compile time, and LLMs cannot receive structured parameter constraints.

**Deficiency 3: Agent is unaware of Object Schema**

Agent references data operations via `tools[].name` strings but **does not know which fields the target object has**. Compared to Salesforce Einstein's "Object-Aware" design, Agent needs `objectBindings` to explicitly associate with Object schemas, enabling it to reason about field semantics and data constraints.

**Deficiency 4: Missing enterprise AI safety layer**

| Missing | Description |
|:---|:---|
| PII Detection/Masking | Input/output content filtering |
| Prompt Injection Defense | Injection detection rules |
| Agent Behavior Audit Log | Full operation recording |
| Per-agent Rate Limiting | Only model-level rateLimit exists |
| Content Safety Policy | Harmful content filtering rules |

#### 2.3 Industry Benchmarking

| Dimension | ObjectStack | OpenAI Assistants | LangGraph | AutoGen | Salesforce Einstein | ServiceNow Now Assist |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| Agent Definition | ✅ Declarative | ✅ API | ✅ Code | ✅ Code | ✅ Config | ✅ Config |
| Tool Binding | ⚠️ name ref | ✅ JSON Schema | ✅ Python func | ✅ Python func | ✅ Action+Topic | ✅ Skill |
| Multi-Agent | ❌ | ❌ | ✅✅ | ✅✅✅ | ✅ Topic routing | ⚠️ |
| State Machine | ✅✅ XState | ❌ | ✅ Graph | ❌ | ❌ | ❌ |
| RAG Pipeline | ✅✅✅ | ✅ File Search | ⚠️ DIY | ⚠️ DIY | ✅ Data Cloud | ✅ |
| UI Action | ✅✅✅ 40+ | ❌ | ❌ | ❌ | ✅ Quick Action | ✅ |
| Flow-AI Integration | ⚠️ One-way | ❌ | ✅ Native | ⚠️ | ✅✅ | ✅ |
| Cost Tracking | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Guardrails | ⚠️ Moderate | ⚠️ | ⚠️ | ⚠️ | ✅ Trust Layer | ✅ |

---

### 3. Security Protocol Evaluation

**Rating: A-** — RLS is industry-leading, Permission Set model is mature, but data classification and dynamic masking are missing.

#### 3.1 Security Model: Hybrid RBAC + ABAC + PBAC

ObjectStack fuses four security paradigms:

| Model | Source | Description |
|:---|:---|:---|
| **RBAC** | role.zod.ts | Role hierarchy, managers can see subordinate data |
| **PBAC** | permission.zod.ts | Profile + Permission Set dual-layer (Salesforce pattern) |
| **ABAC** | rls.zod.ts | RLS `using` clause references `current_user.*` context attributes |
| **OWD** | sharing.zod.ts | private / public_read / public_read_write / controlled_by_parent |

#### 3.2 Security Layer Assessment

| Security Layer | Rating | Description |
|:---|:---:|:---|
| Object Permissions (CRUD+) | ★★★★★ | Surpasses Salesforce — `allowPurge` (GDPR hard delete) + `allowRestore` (recycle bin) |
| Field-Level Security (FLS) | ★★★☆☆ | Read/write dual dimensions, but lacks data classification labels and dynamic masking |
| Row-Level Security (RLS) | ★★★★★ | **Industry-leading** — PostgreSQL RLS + Salesforce Sharing fusion, includes audit/cache/factory |
| Sharing Rules | ★★★★☆ | Criteria + Owner Based, but lacks Manual Sharing and Programmatic Sharing |
| Security Policies | ★★★★☆ | Password/Network/Session/Audit four dimensions, but lacks Device Trust and OAuth Scope |
| Territory Management | ★★★★☆ | Full replica of Salesforce ETM 2.0 |
| Identity / SCIM | ★★★★★ | Full RFC 7643/7644, Okta/Azure AD ready |

#### 3.3 Key Security Gaps

| # | Missing | Severity | Benchmark |
|:---|:---|:---:|:---|
| GAP-1 | **Data Classification Labels** (PII/PHI/PCI) | 🔴 High | Salesforce Shield, AWS Macie — Cannot pass HIPAA/PCI-DSS compliance |
| GAP-2 | **Dynamic Data Masking** | 🔴 High | SQL Server DDM, Oracle VPD |
| GAP-3 | **Field-Level Encryption Policy** | 🔴 High | Salesforce Shield Platform Encryption |
| GAP-4 | **Permission Registry** | 🟡 Medium | `manifest.permissions` is a string array with no permission registry enumeration |
| GAP-5 | **OAuth Scope Binding** | 🟡 Medium | Endpoints do not declare required scopes |
| GAP-6 | **Plugin Sandbox** | 🟡 Medium | Plugin context does not trim capabilities per manifest permissions |
| GAP-7 | **Manual/Programmatic Sharing** | 🟡 Medium | Per-record manual sharing and code-driven sharing |
| GAP-8 | **Permission Delegation / Temporary Elevation** | 🟢 Low | AWS STS AssumeRole |

---

### 4. UI Protocol Evaluation

**Rating: A-** — View/Form declarative capabilities surpass Salesforce Lightning, but responsive layout and real-time collaboration are significant gaps.

#### 4.1 Paradigm: Metadata-Driven + Component Composition + Escape Hatch

ObjectStack UI protocol provides three paths:

| Path | Scenario | Coverage |
|:---|:---|:---|
| **Fast Path (View)** | Standard CRUD list/form | ~80% enterprise scenarios |
| **Advanced Path (Page)** | Custom layouts (dashboards, approval pages, AI conversations) | ~15% |
| **Escape Hatch (Widget)** | Fully custom UI (npm/Module Federation/inline) | ~5% |

#### 4.2 Capability Matrix

| Dimension | Rating | Description |
|:---|:---:|:---|
| CRUD List/Form | **A** | 7 list types + 6 form types + 3 data sources + 7 navigation modes |
| Dashboards/Reports | **A** | 30+ chart types + React-Grid-Layout + 4 report types |
| Actions/Workflows | **A-** | Action → Flow/API/Script, with confirmation/parameters/refresh complete chain |
| Page Composition | **B+** | Templates + regions + component tree, but `z.any()` weakens Props safety |
| Theming/Branding | **A** | Full Design Token + dark mode + theme inheritance |
| Custom Components | **A** | npm + Module Federation + inline, 7 lifecycle hooks, DOM events |
| **Mobile Responsiveness** | **C** | Breakpoints exist but View/Page cannot consume them, responsive gap |
| **Real-time Collaboration** | **D** | No Presence/CRDT/Optimistic Update declarations |
| **Internationalization** | **D** | No i18n key reference mechanism in UI layer |

#### 4.3 Industry Benchmark Gaps

| vs Salesforce Lightning | Severity | Description |
|:---|:---:|:---|
| Record Type → Layout mapping | 🔴 High | Same object shows different form layouts per record type |
| Compact Layout | 🟡 Medium | Compact preview for lookup fields |
| Responsive Layout | 🔴 High | Breakpoints defined but no consumption protocol |

| vs Retool/Appsmith | Severity | Description |
|:---|:---:|:---|
| Component-level Query Binding | 🟡 Medium | Page components depend on parent context rather than independent data binding |
| Component-level Responsiveness | 🔴 High | No component-level breakpoint collapsing |

| vs ServiceNow UI Builder | Severity | Description |
|:---|:---:|:---|
| Page-level Data Resources | 🟡 Medium | `variables[]` is only local state, no declarative data fetching |

---

### 5. Cross-Domain Protocol Consistency Evaluation

#### 5.1 Data Structure Consistency

| Issue | Location | Impact |
|:---|:---|:---|
| **Array vs Map inconsistency** | `Object.fields` uses `z.record()`, `StackDefinition.objects/views/roles` uses `z.array()` | Inconsistent lookup semantics |
| **Identifier validation bifurcation** | 4 UI files use `SnakeCaseIdentifierSchema`, 4 use inline regex | Inconsistent constraint strength |
| **Isolation level enum fragmentation** | driver.zod.ts L101 kebab-case vs L570 SQL uppercase | Same concept with two representations |

#### 5.2 AI ↔ Data Connection Gaps

| Gap | Description | Impact |
|:---|:---|:---|
| Agent unaware of Object Schema | Agent only knows tool name, does not know field definitions | AI cannot reason based on data structure |
| RAG index weak references | `knowledge.indexes` is a string array, does not reference `RAGPipelineConfig.name` | Configuration may be invalid |
| Flow lacks AI nodes | None of Flow's 14 node types include `ai_task`/`agent_call` | Automation cannot invoke AI |

#### 5.3 Security ↔ UI Connection Gaps

| Gap | Description | Impact |
|:---|:---|:---|
| View does not reference Permission | ListView/FormView have no `requiredPermission` declaration | Security relies on runtime rather than declarative |
| Action has no permission binding | ActionSchema has `visible` expressions but no permission reference | Action buttons cannot be declaratively permission-gated |

#### 5.4 UI ↔ Data Connection Quality

| Connection | Status | Description |
|:---|:---:|:---|
| View → Object | ✅ 🟢 | `ViewDataSchema` provider='object' + objectName |
| Action → Flow | ✅ 🟢 | `type: 'flow'` + target |
| Dashboard → Filter | ✅ 🟢 | Imports `FilterConditionSchema` |
| **View → Filter** | ❌ 🔴 | `view.filter` uses `z.array(z.any())` instead of `FilterConditionSchema` |
| **Page → Data** | ⚠️ 🟡 | Page has no declarative data fetching, component props are all `z.any()` |

---

### 6. Global Score Summary

| Protocol Domain | Design Maturity | Industry Benchmark | Rating |
|:---|:---|:---|:---:|
| **Data — Object/Field** | Federated query surpasses industry, but Field structure needs discriminatedUnion | Surpasses Salesforce (query), behind (RecordType) | **A-** |
| **Data — Query/Filter** | Window functions/full-text search/cursor pagination, BI-grade | Surpasses low-code, approaches Trino | **A** |
| **AI — Agent/RAG** | 40+ UI Actions industry-leading, RAG enterprise-ready | Surpasses OpenAI, behind LangGraph (multi-agent) | **B** |
| **AI — Orchestration** | Single-agent orchestration, missing multi-agent and bidirectional Flow | Behind LangGraph/AutoGen | **C+** |
| **Security — RLS/Sharing** | PostgreSQL RLS + Salesforce Sharing fusion | On par with Salesforce, partially surpasses | **A** |
| **Security — Compliance** | Missing data classification + dynamic masking + field encryption | Behind Salesforce Shield | **B-** |
| **UI — View/Form** | 7 views + 6 forms + 7 navigation + 3 data sources | Surpasses Salesforce Lightning (80%) | **A-** |
| **UI — Responsive/Collaboration** | Breakpoints defined but not consumed, no real-time protocol | Behind Retool/ServiceNow | **D+** |
| **Automation — Flow** | DAG graph + 14 nodes + 5 triggers | On par with Salesforce Flow | **B+** |
| **Kernel — Plugin** | Manifest + Own/Extend + Priority merge | Surpasses Salesforce Managed Package | **A-** |
| **System — Identity** | SCIM 2.0 + multi-tenant + role hierarchy | On par with industry best | **A** |

**Overall Architecture Rating: B+/A-** — A protocol system with clear vision and professional execution, 3 key additions away from an enterprise SaaS productivity platform.

---

### 7. Priority Roadmap: From B+ to A

#### Tier 1 — Architectural Additions (Must-have, impacts market competitiveness)

| # | Action | New Files/Fields | Benchmark |
|:---|:---|:---|:---|
| **T1-1** | **Add AI nodes to Flow** — `ai_task`, `agent_call`, `human_in_loop` | `automation/flow.zod.ts` add 3 node types | LangGraph, Salesforce Einstein |
| **T1-2** | **Add parameter declarations to AITool** — `inputSchema`, `outputSchema` (JSON Schema) | `ai/agent.zod.ts` AIToolSchema | OpenAI function calling |
| **T1-3** | **Create multi-agent protocol** — AgentTeam, Routing, Handoff, Supervisor | New file `ai/multi-agent.zod.ts` | AutoGen, LangGraph |
| **T1-4** | **Create AI safety guardrails** — PII filter, prompt injection, content safety, audit | New file `ai/guardrails.zod.ts` | Salesforce Trust Layer |
| **T1-5** | **Data classification + dynamic masking protocol** | `security/classification.zod.ts` + `security/masking.zod.ts` | Salesforce Shield, AWS Macie |

#### Tier 2 — Capability Additions (Important, impacts enterprise customer readiness)

| # | Action | Affected Domain |
|:---|:---|:---|
| **T2-1** | **Record Type protocol** — same object with multiple layouts/validations/picklist values | data + ui |
| **T2-2** | **Field discriminatedUnion** — type-specific field properties | data/field.zod.ts |
| **T2-3** | **Responsive layout consumption** — View/Page references breakpoints, component-level responsive declarations | ui |
| **T2-4** | **Page-level Data Fetching** — declarative data fetching (similar to Remix loader) | ui/page.zod.ts |
| **T2-5** | **Agent objectBindings** — Agent explicitly associates with Object Schema | ai/agent.zod.ts |
| **T2-6** | **Governor Limits protocol** — query quota/limit declarations (SOQL Limits equivalent) | data/query.zod.ts |
| **T2-7** | **Field-level encryption policy + Permission Registry** | security |

#### Tier 3 — Refinement (Continuous improvement)

| # | Action |
|:---|:---|
| T3-1 | Field generic extension point (`extensions: z.record()`) |
| T3-2 | Polymorphic Lookup / Dependent Picklist / Compound Fields |
| T3-3 | Manual/Programmatic Sharing |
| T3-4 | UI internationalization key reference mechanism |
| T3-5 | Real-time collaboration protocol (Presence/CRDT) |
| T3-6 | Geospatial query operators (`$near`/`$within`) |

---

## Part II: Zod Schema Code Quality Audit

> The following presents the code-level audit results for all 139 `.zod.ts` files.

## Per-Directory Statistics

| Directory | Files | Lines | Schemas | `z.infer` | `.describe()` | `z.any()` | Quality |
|---|---|---|---|---|---|---|---|
| **ai/** | 13 | 5,023 | ~85 | 138 | 630 | 57 | ⭐⭐⭐⭐ |
| **api/** | 20 | 7,133 | ~120 | 205 | 906 | 99 | ⭐⭐⭐ |
| **automation/** | 8 | 2,403 | ~45 | 41 | 327 | 30 | ⭐⭐⭐⭐ |
| **data/** | 18 | 5,525 | ~90 | 97 | 574 | 71 | ⭐⭐⭐ |
| **hub/** | 9 | 2,929 | ~50 | 49 | 145 | 4 | ⭐⭐⭐⭐ |
| **identity/** | 4 | 1,383 | ~20 | 23 | 150 | 3 | ⭐⭐⭐ |
| **integration/** | 7 | 3,197 | ~40 | 63 | 365 | 7 | ⭐⭐⭐⭐⭐ |
| **kernel/** | 17 | 5,689 | ~100 | 126 | 559 | 57 | ⭐⭐⭐ |
| **qa/** | 1 | 84 | 6 | 5 | 9 | 0 | ⭐⭐⭐⭐ |
| **security/** | 5 | 1,054 | ~15 | 14 | 76 | 2 | ⭐⭐⭐⭐ |
| **shared/** | 4 | 449 | ~10 | 10 | 44 | 3 | ⭐⭐⭐⭐⭐ |
| **system/** | 22 | 6,606 | ~100 | 184 | 810 | 45 | ⭐⭐⭐⭐ |
| **ui/** | 10 | 1,932 | ~30 | 51 | 347 | 18 | ⭐⭐⭐⭐ |
| **root** | 1 | 340 | 6 | 5 | ~30 | 1 | ⭐⭐⭐⭐⭐ |

---

## 1. Detailed Directory Analysis

### 1.1 `ai/` — AI Protocol (13 files, 5,023 LOC)

**Strengths:**
- Excellent cross-module architecture — `cost.zod.ts` exports `TokenUsageSchema` consumed by 5+ siblings
- Rich JSDoc with live examples (especially `devops-agent.zod.ts` at 891 lines)
- Good use of `z.discriminatedUnion()` in `rag-pipeline.zod.ts` (chunking strategies, retrieval strategies)
- `predictive.zod.ts` uses `.superRefine()` for data-split ratio validation — exemplary

**Key Files:**

| File | Exported Schemas | `z.any()` | `z.infer` types | Notes |
|---|---|---|---|---|
| `agent.zod.ts` | AgentSchema, AIModelConfigSchema, AIToolSchema, AIKnowledgeSchema | 0 | 2 | ✅ Clean |
| `agent-action.zod.ts` | ~20 schemas (NavigationAction, ViewAction, FormAction, etc.) | 6 | 16 | TypedAgentActionSchema union is impressive |
| `model-registry.zod.ts` | 10 schemas | 3 | 10 | ✅ Excellent describe coverage |
| `rag-pipeline.zod.ts` | 16 schemas | 3 | 0 | ⚠️ **Missing z.infer exports** |
| `orchestration.zod.ts` | 9 schemas | ~10 | 9 | z.any() heavy in I/O schemas |
| `conversation.zod.ts` | 18 schemas | 5 | 14 | Good TypedContent discriminated union |
| `cost.zod.ts` | 16 schemas | 5 | 16 | ✅ Core shared module |
| `predictive.zod.ts` | 9 schemas | 5 | ~4 | superRefine validation is excellent |
| `feedback-loop.zod.ts` | 3 schemas | 0 | 3 | ✅ Uses z.unknown() correctly |
| `devops-agent.zod.ts` | ~14 schemas | 2 | 12 | Largest AI file, has example object |
| `nlq.zod.ts` | 13 schemas | 6 | ~4 | ⚠️ Partial z.infer exports |
| `plugin-development.zod.ts` | 8 schemas | 3 | 8 | ✅ Well-structured |
| `runtime-ops.zod.ts` | 8 schemas | 4 | 8 | Imports from kernel/ |

**Issues:**
- `rag-pipeline.zod.ts` exports 16 schemas but **zero** `z.infer` type exports
- `nlq.zod.ts` only exports 4 of ~13 types
- `z.any()` used 57 times — primarily for metadata records, config objects, and AST structures

---

### 1.2 `api/` — API Protocol (20 files, 7,133 LOC)

**Strengths:**
- Largest protocol directory with comprehensive coverage (REST, GraphQL, OData, WebSocket, Realtime)
- `discovery.zod.ts` is cleanly designed with zero `z.any()`
- `errors.zod.ts` provides `ErrorHttpStatusMap` constant + runtime helpers (`createErrorResponse()`)
- `batch.zod.ts` well-documented with examples

**Key Files:**

| File | Exported Schemas | `z.any()` | Notes |
|---|---|---|---|
| `contract.zod.ts` | ~12 | 3 | `RecordDataSchema = z.record(z.string(), z.any())` — foundational |
| `protocol.zod.ts` | ~20 | 10+ | Heaviest z.any() user; metadata payloads inherently dynamic |
| `graphql.zod.ts` | ~15 | 3 | 911 lines, only 300 audited |
| `registry.zod.ts` | ~20 | 15+ | JSON Schema interop requires z.any() |
| `documentation.zod.ts` | ~10 | 12 | OpenAPI spec components are dynamic |
| `discovery.zod.ts` | 3 | 0 | ✅ Cleanest API file |
| `router.zod.ts` | 3 | 0 | ✅ Clean |
| `errors.zod.ts` | ~12 | 3 | ⚠️ Contains runtime helper functions |
| `realtime.zod.ts` | ~9 | 3 | ⚠️ Duplicates Presence schemas from websocket.zod.ts |
| `websocket.zod.ts` | ~15 | 6 | Rich collaborative editing schemas |
| `auth.zod.ts` | ~9 | 0 | ⚠️ Uses `z.date()` instead of iso strings |

**Issues:**
- **99 `z.any()` usages** — highest of any directory. Mostly justified (OpenAPI, JSON Schema, dynamic payloads) but some could be tightened
- `errors.zod.ts` exports **runtime functions** (`createErrorResponse()`, `getHttpStatusForCategory()`) — violates "no business logic" principle
- `contract.zod.ts` and `analytics.zod.ts` have **no `z.infer` type exports**
- `auth.zod.ts` uses `z.date()` for `createdAt`, `updatedAt`, `expiresAt` — inconsistent with ISO string patterns used elsewhere
- Presence schema duplication: `realtime.zod.ts` PresenceStatus/PresenceSchema overlaps with `websocket.zod.ts` WebSocketPresenceStatus/PresenceStateSchema

---

### 1.3 `automation/` — Automation Protocol (8 files, 2,403 LOC)

**Strengths:**
- Clean 3-layer architecture: sync (L1) → ETL (L2) → connector (L3), well-documented
- `state-machine.zod.ts` handles recursive types with `z.lazy()` properly
- `approval.zod.ts` exports factory method `ApprovalProcess.create()`
- All files use `SnakeCaseIdentifierSchema` from `shared/identifiers.zod.ts`

**Key Files:**

| File | Exported Schemas | `z.any()` | Notes |
|---|---|---|---|
| `flow.zod.ts` | 5 | 2 | ✅ Clean by design |
| `workflow.zod.ts` | ~10 | 6 | Good discriminatedUnion, uses shared identifiers |
| `trigger-registry.zod.ts` | ~10 | 5 | Has its own ConnectorSchema (different from integration/connector) |
| `approval.zod.ts` | 3 | 1 | ✅ Has factory method |
| `state-machine.zod.ts` | 6 | 4 | Uses z.lazy() for recursive StateNodeSchema |
| `webhook.zod.ts` | 3 | 1 | ✅ Simple and clean |
| `sync.zod.ts` | ~10 | 2 | Good 3-layer documentation |
| `etl.zod.ts` | ~10 | 5 | Well-positioned in architecture |

**Issues:**
- `trigger-registry.zod.ts` defines its own `ConnectorSchema` which overlaps with `integration/connector.zod.ts` — **intentional by design** (lightweight vs enterprise, documented with comments) but could cause confusion
- `approval.zod.ts` factory breaks "no business logic" rule (minor)

---

### 1.4 `data/` — Data Protocol (18 files, 5,525 LOC)

**Strengths:**
- Core protocol layer with comprehensive field types, validation, and driver interfaces
- `field.zod.ts` is the most important schema — well-structured with 70+ field-related types
- `filter.zod.ts` implements MongoDB-style query operators with proper recursive types
- `driver.zod.ts` uses `z.function()` for interface contracts — advanced pattern

**Key Files:**

| File | Exported Schemas | `z.any()` | Notes |
|---|---|---|---|
| `field.zod.ts` | ~15 | 1 | Only `defaultValue: z.any()` — appropriate |
| `object.zod.ts` | ~5 | 0 | ✅ Core object definition |
| `validation.zod.ts` | ~12 | 3 | Uses `z.lazy()` for recursive ValidationRuleSchema |
| `filter.zod.ts` | ~10 | 8 | `$eq: z.any()` etc. — inherent to filter operators |
| `driver.zod.ts` | 5 | 25+ | Heaviest z.any() user — `z.function()` args/returns |
| `data-engine.zod.ts` | ~8 | 20+ | Same pattern as driver — function interfaces |
| `datasource.zod.ts` | 2 | 3 | Config records are inherently dynamic |
| `document.zod.ts` | ~4 | 1 | ✅ Clean document management |
| `query.zod.ts` | ? | ? | Query DSL |
| `analytics.zod.ts` | ~5 | 0 | ✅ Cube/metrics schema |

**Issues:**
- `driver.zod.ts` and `data-engine.zod.ts` together have ~45 `z.any()` usages — necessary for `z.function()` interface contracts but defeats type-safety
- `validation.zod.ts` has `ValidationRuleSchema: z.ZodType<any>` — loses type info in recursive schema
- `filter.zod.ts` uses `z.date()` in comparison operators — the only appropriate use of z.date() (for runtime filter comparisons)

---

### 1.5 `hub/` — Hub/Marketplace Protocol (9 files, 2,929 LOC)

**Strengths:**
- Only **4 `z.any()` usages** across 9 files — cleanest large directory
- Comprehensive multi-tenancy support (`tenant.zod.ts` at 594 types with 3 isolation strategies)
- `plugin-security.zod.ts` is extensive (SBOM, provenance, trust scores)
- `hub-federation.zod.ts` models geo-distributed hub topology

**Key Files:**

| File | Exported Schemas | `z.any()` | Notes |
|---|---|---|---|
| `tenant.zod.ts` | ~10 | 1 | ✅ Excellent discriminatedUnion for isolation strategies |
| `plugin-registry.zod.ts` | ~6 | 1 | ✅ Well-designed |
| `plugin-security.zod.ts` | ~14 | 0 | ✅ Exemplary — no z.any() in 741 lines |
| `hub-federation.zod.ts` | ~7 | 0 | ✅ Clean geo-distribution model |
| `space.zod.ts` | ~4 | 0 | ✅ Clean |
| `marketplace.zod.ts` | 2 | 0 | ✅ Clean |
| `license.zod.ts` | 3 | 0 | ✅ Clean |
| `composer.zod.ts` | 3 | 1 | Minimal z.any() |
| `registry-config.zod.ts` | 3 | 1 | Credentials record |

**Issues:**
- Minor: `hub-federation.zod.ts` has duplicate type patterns with `kernel/plugin-versioning.zod.ts` (DependencyConflict)
- Otherwise excellent quality

---

### 1.6 `identity/` — Identity Protocol (4 files, 1,383 LOC)

**Key Files:**

| File | Exported Schemas | `z.any()` | Notes |
|---|---|---|---|
| `identity.zod.ts` | UserSchema, AccountSchema, SessionSchema, VerificationTokenSchema | 0 | ⚠️ Uses `z.date()` |
| `role.zod.ts` | RoleSchema | 0 | ✅ Clean, uses SnakeCaseIdentifierSchema |
| `organization.zod.ts` | OrganizationSchema, MemberSchema, InvitationSchema | 1 | ⚠️ Uses `z.date()` |
| `scim.zod.ts` | ~20+ SCIM schemas | 0 | ✅ Uses `z.string().datetime()` correctly |

**Issues:**
- **`z.date()` vs `z.string().datetime()` inconsistency:**
  - `identity.zod.ts` and `organization.zod.ts` use `z.date()` for `createdAt`, `updatedAt`
  - `scim.zod.ts` correctly uses `z.string().datetime()` for timestamps
  - `z.date()` is problematic for JSON serialization — Date objects don't survive JSON.parse/stringify
  - **Recommendation:** Standardize on `z.string().datetime()` for all serializable timestamps

---

### 1.7 `integration/` — Integration Protocol (7 files, 3,197 LOC)

**Strengths:**
- **Best-documented directory** — every connector has 50+ line JSDoc blocks with positioning, use-cases, and examples
- Clean layered architecture consistently documented (L1/L2/L3)
- Re-uses `ConnectorAuthConfigSchema` from `shared/connector-auth.zod.ts` — good DRY
- Each specialized connector (GitHub, Vercel, Database, FileStorage, SaaS, MessageQueue) extends base `ConnectorSchema`

**Key Files:**

| File | Notes |
|---|---|
| `connector.zod.ts` | Base connector — imports shared auth, mapping. Only 7 z.any() |
| `connector/github.zod.ts` | GitHub-specific: repos, PRs, Actions, releases |
| `connector/database.zod.ts` | Database-specific: CDC, pooling, SSL |
| `connector/file-storage.zod.ts` | S3/Azure/GCS: multipart, versioning, encryption |
| `connector/saas.zod.ts` | SaaS-specific: OAuth, pagination, sandboxing |
| `connector/vercel.zod.ts` | Vercel-specific: deployments, edge functions, domains |
| `connector/message-queue.zod.ts` | Kafka/RabbitMQ: consumer groups, DLQ, SASL |

**Issues:**
- `connector.zod.ts` has `AuthenticationSchema` as deprecated alias — should be removed
- `connector.zod.ts` has deprecated `FieldTransformSchema` — should be removed
- `message-queue.zod.ts` has `z.any()` in message filter attributes

---

### 1.8 `kernel/` — Kernel Protocol (17 files, 5,689 LOC)

**Key Files:**

| File | `z.any()` | Notes |
|---|---|---|
| `plugin.zod.ts` | **20+** | Most z.any()-heavy file — service interfaces use z.any() for methods |
| `events.zod.ts` | 10 | Event handlers, filters, transforms are functions |
| `manifest.zod.ts` | 5 | Config defaults, I/O schemas |
| `metadata-loader.zod.ts` | 4 | Data payloads inherently dynamic |
| `plugin-lifecycle-advanced.zod.ts` | 3 | State snapshots |
| `plugin-security-advanced.zod.ts` | 0 | ✅ 700 lines, zero z.any() |
| `plugin-versioning.zod.ts` | 0 | ✅ Clean |
| `plugin-loading.zod.ts` | 1 | ✅ Minimal |
| `plugin-capability.zod.ts` | 1 | ✅ Clean |
| `startup-orchestrator.zod.ts` | 2 | Minimal |

**Issues:**
- `plugin.zod.ts` uses `z.any()` 20+ times for service method signatures — Zod can't express function interfaces well, but a comment explains this justification
- `plugin-structure.zod.ts` has **no `z.infer` exports** despite exporting 3 schemas
- `events.zod.ts` uses `z.any()` for handler/filter/transform functions — same limitation as plugin.zod.ts

---

### 1.9 `security/` — Security Protocol (5 files, 1,054 LOC)

**Strengths:**
- Very clean directory with only **2 `z.any()` usages**
- Excellent documentation with Salesforce/Microsoft/Kubernetes comparisons
- `rls.zod.ts` at 661 lines is comprehensive with PostgreSQL RLS examples

**Key Files:**

| File | Notes |
|---|---|
| `permission.zod.ts` | ObjectPermission, FieldPermission, PermissionSet — 1 z.any() |
| `sharing.zod.ts` | Sharing rules with discriminatedUnion — **SharingRuleSchema typed as `z.ZodType<any>`** |
| `policy.zod.ts` | Password, Network, Session, Audit policies — 0 z.any() |
| `rls.zod.ts` | Row-level security — 1 z.any() |
| `territory.zod.ts` | Territory model — 0 z.any() |

**Issues:**
- `sharing.zod.ts` types `SharingRuleSchema` as `z.ZodType<any>` — **significant type-safety loss**
- Limited `z.infer` coverage (14 exports, but proportional to 15 schemas)

---

### 1.10 `shared/` — Shared Utilities (4 files, 449 LOC)

**Strengths:**
- Perfect foundational layer — small, focused, widely imported
- `identifiers.zod.ts` is the naming convention enforcer (SystemIdentifierSchema, SnakeCaseIdentifierSchema, EventNameSchema)
- `connector-auth.zod.ts` uses `z.discriminatedUnion` perfectly (5 auth types)

**Key Files:**

| File | Notes |
|---|---|
| `identifiers.zod.ts` | ✅ **Exemplary** — regex-enforced naming, exceptional documentation |
| `http.zod.ts` | ✅ HttpMethod, CorsConfig, RateLimitConfig, StaticMount — clean |
| `mapping.zod.ts` | FieldMappingSchema with discriminatedUnion TransformType — 2 z.any() (constant value, default) |
| `connector-auth.zod.ts` | ✅ 5-type auth discriminated union — clean, zero z.any() |

**Issues:**
- `mapping.zod.ts` has `value: z.any()` for constant transforms and `defaultValue: z.any()` — hard to avoid

---

### 1.11 `system/` — System Protocol (22 files, 6,606 LOC)

Largest directory by file count. Contains runtime configuration schemas for logging, tracing, metrics, audit, compliance, collaboration, caching, jobs, search, http-server, migration, notification, etc.

**Highlights:**
- 184 `z.infer` types — excellent type export coverage
- 810 `.describe()` annotations
- 45 `z.any()` usages spread across 22 files (moderate)

**Notable Issues:**
- `metadata-persistence.zod.ts` uses `z.date()` (line 80) — same inconsistency as identity/
- `migration.zod.ts` uses `z.unknown()` for `changes` field — correct usage
- `auth-config.zod.ts` has **no `z.infer` exports**

---

### 1.12 `ui/` — UI Protocol (10 files, 1,932 LOC)

**Highlights:**
- `view.zod.ts` uses `z.unknown()` in 3 places (params, body, items) — **correct and exemplary**
- 347 `.describe()` annotations
- 18 `z.any()` usages — moderate

---

### 1.13 `qa/` — QA Protocol (1 file, 84 LOC)

**File:** `testing.zod.ts`

**Strengths:**
- Uses `z.unknown()` consistently instead of `z.any()` — **best practice exemplar**
- Zero `z.any()` — the only directory with this distinction
- Clean test structure: Suite → Scenario → Step → Action → Assertion

**Issues:**
- Very small — minimal `.describe()` coverage (9 annotations for 6 schemas)
- Could benefit from more examples in JSDoc

---

### 1.14 Root Files

**`stack.zod.ts`** (340 lines):
- Central aggregator — `ObjectStackDefinitionSchema` and `ObjectStackCapabilitiesSchema`
- 1 `z.any()` usage: `plugins: z.array(z.any())` — runtime plugin instances can't be statically typed
- Well-structured 3-layer capabilities (ObjectQL, ObjectUI, ObjectOS)
- All type exports present

**`index.ts`** (77 lines):
- Clean namespace exports (`Data`, `UI`, `System`, `AI`, `API`, etc.)
- Prevents naming conflicts via namespace pattern
- Re-exports `defineStack`, `definePlugin` from kernel

---

## 2. Cross-Cutting Issues

### 2.1 `z.any()` — Pervasive Loose Typing (397 instances, 88 files)

**Categories of `z.any()` usage:**

| Pattern | Count (est.) | Justified? |
|---|---|---|
| `metadata: z.record(z.string(), z.any())` | ~80 | Partially — could use `z.unknown()` |
| `config/options: z.record(z.string(), z.any())` | ~60 | Partially |
| `z.function().args(z.any())` / `.returns(z.any())` | ~50 | Yes — Zod limitation |
| `defaultValue: z.any()` | ~30 | Mostly — values are polymorphic |
| `value: z.any()` in filter/comparison operators | ~20 | Yes — runtime comparison |
| `payload/data: z.any()` | ~30 | Partially |
| `schema: z.any()` (JSON Schema interop) | ~15 | Yes — JSON Schema is dynamic |
| Service method stubs (`z.any()`) | ~20 | Yes — Zod limitation |
| Other | ~92 | Mixed |

**Recommendation:** Replace `z.any()` with `z.unknown()` wherever the value is not immediately destructured. `z.unknown()` forces runtime narrowing, which is safer. Priority targets:
- All `metadata: z.record(z.string(), z.any())` → `z.record(z.string(), z.unknown())`
- All `config: z.record(z.string(), z.any())` → `z.record(z.string(), z.unknown())`
- `qa/testing.zod.ts` and `ai/feedback-loop.zod.ts` already demonstrate the correct pattern

### 2.2 `z.unknown()` — Severely Underused (8 instances, 3 files)

Only **3 files** use `z.unknown()`:
- `qa/testing.zod.ts` (3 usages) — consistent throughout
- `ai/feedback-loop.zod.ts` (1 usage) — `context: z.record(z.string(), z.unknown())`
- `ui/view.zod.ts` (3 usages) — params, body, items
- `system/migration.zod.ts` (1 usage) — `changes: z.record(z.string(), z.unknown())`

**Gap:** 88 files use `z.any()` while only 3 use `z.unknown()`. This is a 29:1 ratio that should be inverted for most cases.

### 2.3 `z.date()` vs `z.string().datetime()` Inconsistency

**Files using `z.date()`:**

| File | Fields | Problem |
|---|---|---|
| `identity/identity.zod.ts` | createdAt, updatedAt, emailVerified | Date objects don't survive JSON serialization |
| `identity/organization.zod.ts` | createdAt, updatedAt | Same issue |
| `api/auth.zod.ts` | createdAt, updatedAt, expiresAt | Same issue |
| `kernel/metadata-loader.zod.ts` | modifiedAt, timestamp, lastModified | Same issue |
| `data/filter.zod.ts` | $gt/$gte/$lt/$lte comparisons | ✅ Appropriate for runtime comparison |
| `system/object-storage.zod.ts` | lastModified | Same issue |
| `system/metadata-persistence.zod.ts` | created_at | Same issue + uses snake_case for property key |

**Files correctly using `z.string().datetime()`:**
- `identity/scim.zod.ts` — uses `z.string().datetime()` for all SCIM timestamps

**Recommendation:** Standardize on `z.string().datetime()` for all serializable schemas. `z.date()` is only appropriate for in-memory runtime objects (like filter comparisons).

### 2.4 Naming Convention Violations

The codebase is **generally consistent**, with only minor violations:

| Location | Issue |
|---|---|
| `system/metadata-persistence.zod.ts` | Property `created_at` uses snake_case — should be `createdAt` per spec rules |
| `api/auth.zod.ts:35-36` | Some properties missing `.describe()` but keys are correct camelCase |

All machine identifiers (object names, field names, role names) consistently use snake_case regex validation via `SnakeCaseIdentifierSchema`. Configuration keys consistently use camelCase. **Well-enforced.**

### 2.5 Cross-Module Duplication

| Duplication | Files | Severity |
|---|---|---|
| Presence schemas | `api/realtime.zod.ts` PresenceStatus/PresenceSchema vs `api/websocket.zod.ts` WebSocketPresenceStatus/PresenceStateSchema | **Medium** — should share a base |
| ConnectorSchema | `automation/trigger-registry.zod.ts` vs `integration/connector.zod.ts` | **Low** — intentionally differentiated (L1 vs L3), well-documented |
| DependencyConflict | `hub/plugin-security.zod.ts` vs `kernel/plugin-versioning.zod.ts` | **Medium** — identical concept in different domains |
| SecurityVulnerability | `hub/plugin-security.zod.ts` vs `kernel/plugin-security-advanced.zod.ts` | **Medium** — similar schemas with slight structural differences |
| PermissionSetSchema | `security/permission.zod.ts` vs `kernel/plugin-security-advanced.zod.ts` | **Low** — different contexts (data permissions vs plugin sandbox permissions) |

### 2.6 Files Missing `z.infer` Type Exports

| File | Schemas Exported | Impact |
|---|---|---|
| `system/auth-config.zod.ts` | auth configuration | Consumers must manually derive types |
| `api/contract.zod.ts` | RecordDataSchema, BaseResponseSchema, etc. | Core foundational schemas without types |
| `api/analytics.zod.ts` | AnalyticsQueryRequest, etc. | Minor impact |
| `api/metadata.zod.ts` | ObjectDefinitionResponse, etc. | Minor impact |
| `kernel/plugin-structure.zod.ts` | OpsPluginStructureSchema, etc. | Consumers must extract types manually |

### 2.7 Runtime Logic in Schema-Only Repository

Per the prime directive "No Business Logic — this repository contains ONLY definitions", these violations were found:

| File | Function/Logic |
|---|---|
| `api/errors.zod.ts` | `createErrorResponse()`, `getHttpStatusForCategory()` — runtime helper functions |
| `automation/approval.zod.ts` | `ApprovalProcess.create()` — factory method |

---

## 3. `.describe()` Annotation Coverage Assessment

With **5,026 `.describe()` calls across 1,089 exported schemas**, the average is ~4.6 descriptions per schema — **excellent coverage**.

**Best coverage:**
- `api/` (906 describes for ~120 schemas)
- `system/` (810 describes for ~100 schemas)
- `ai/` (630 describes for ~85 schemas)
- `integration/` (365 describes for ~40 schemas — highest ratio)

**Weakest coverage:**
- `qa/testing.zod.ts` (9 describes for 6 schemas — functional but minimal)
- `security/` (76 describes for ~15 schemas — some inline fields undescribed)

---

## 4. Recommendations

### P0 — Critical (Type Safety)
1. **Replace `z.any()` with `z.unknown()` for metadata/config records** — ~140 occurrences across `metadata:`, `config:`, `options:` fields. Pattern: `z.record(z.string(), z.any())` → `z.record(z.string(), z.unknown())`
2. **Fix `z.date()` inconsistency** — Standardize on `z.string().datetime()` for all serializable schemas; keep `z.date()` only for in-memory filter comparisons
3. **Add missing `z.infer` exports** — 5 files have zero type exports

### P1 — Important (Consistency)
4. **Extract shared Presence schemas** — Create `shared/presence.zod.ts` and import from both `api/realtime.zod.ts` and `api/websocket.zod.ts`
5. **Fix `SharingRuleSchema` typing** — Currently `z.ZodType<any>`, losing all type safety
6. **Add `z.infer` exports to `rag-pipeline.zod.ts`** — 16 schemas with 0 type exports
7. **Fix `created_at` property key** in `system/metadata-persistence.zod.ts` → `createdAt`

### P2 — Quality (Architecture)
8. **Move runtime functions out of spec** — `api/errors.zod.ts` helpers and `approval.zod.ts` factory belong in `@objectstack/core`
9. **Remove deprecated re-exports** in `integration/connector.zod.ts` (`AuthenticationSchema`, `FieldTransformSchema`)
10. **Consolidate DependencyConflict schemas** — Choose canonical location between `hub/` and `kernel/`
11. **Add more `.describe()` to `qa/testing.zod.ts`** — Currently the weakest annotated file

---

## 5. Quality Scorecard by Category

| Category | Score | Notes |
|---|---|---|
| **Architecture** | A | Clean domain separation, thoughtful layering (L1/L2/L3) |
| **Documentation** | A | 5,026 `.describe()` calls, extensive JSDoc, example objects |
| **Naming Convention** | A- | Consistent snake_case/camelCase split, 1 violation (`created_at`) |
| **Type Safety** | C+ | 397 `z.any()` usages overwhelm the otherwise clean typing |
| **Type Exports** | B+ | 1,011 `z.infer` vs 1,089 schemas (93% coverage), 5 files missing |
| **DRY Principle** | B | 3-4 duplication clusters identified, most documented as intentional |
| **Compliance** | B | 2 runtime logic violations in schema-only repo |
| **Overall** | **B+** | Professional, production-quality spec with fixable type-safety gaps |
