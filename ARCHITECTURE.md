# ObjectStack Protocol - Architecture Diagrams

> Visual reference for understanding the complete ObjectStack ecosystem and protocol layers.

---

## 🏗️ Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ObjectUI (View Layer)                     │
│  Server-Driven UI Protocol - Define "How Users Interact"        │
├─────────────────────────────────────────────────────────────────┤
│  • App & Navigation      • Dashboard & Widgets                  │
│  • ListView (Grid/Kanban) • FormView (Simple/Tabbed)            │
│  • Report & Analytics    • Action Buttons                       │
│  • Page Layouts          • Theme Configuration                  │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Render
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      ObjectOS (Control Layer)                    │
│  Runtime Kernel - Define "How System Operates"                  │
├─────────────────────────────────────────────────────────────────┤
│  • Manifest & Packaging  • Identity & Roles (IAM)               │
│  • Plugin Lifecycle      • Event Bus & Jobs                     │
│  • API Gateway (Rest/GQL)• Real-time (Socket/SSE)               │
│  • Multi-tenancy         • Audit & Compliance                   │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Execute
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       ObjectQL (Data Layer)                      │
│  Business Kernel - Define "What Data Exists"                    │
├─────────────────────────────────────────────────────────────────┤
│  • Object & Field Schema • AI Agents & Orchestration            │
│  • Query AST (Filter/Sort) • RAG & Vector Search                │
│  • Validation Rules      • Permission & Sharing                 │
│  • Workflow & Flow       • Driver & Datasource (IO)             │
└─────────────────────────────────────────────────────────────────┘
│  driver-postgres  │  driver-mongodb  │  driver-salesforce       │
│  driver-mysql     │  driver-redis    │  driver-excel            │
│  driver-sqlite    │  driver-s3       │  driver-airtable         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Package Structure & Protocol Flow

```
@objectstack/spec
├── Data Protocol (ObjectQL)
│   ├── field.zod.ts          → Field types, constraints, relationships
│   ├── object.zod.ts         → Object definition, capabilities
│   ├── validation.zod.ts     → Business rules, error messages
│   ├── permission.zod.ts     → CRUD, field-level security
│   ├── sharing.zod.ts        → Sharing rules, ownership
│   ├── workflow.zod.ts       → State machine, transitions
│   ├── flow.zod.ts           → Visual flow automation
│   ├── query.zod.ts          → AST for queries (filter, sort, join)
│   ├── filter.zod.ts         → Query filter conditions
│   ├── dataset.zod.ts        → Virtual datasets
│   ├── mapping.zod.ts        → ETL transformations
│   └── trigger.zod.ts        → Trigger context
│
├── UI Protocol (ObjectUI)
│   ├── app.zod.ts            → App structure, navigation tree
│   ├── view.zod.ts           → List/Form/Calendar views
│   ├── dashboard.zod.ts      → Dashboard layouts, widgets
│   ├── report.zod.ts         → Report types, grouping
│   ├── action.zod.ts         → Button actions, navigation
│   ├── page.zod.ts           → FlexiPage regions, components
│   ├── theme.zod.ts          → Color, typography, spacing
│   └── widget.zod.ts         → Custom field components
│
├── System Protocol (ObjectOS)
│   ├── manifest.zod.ts       → Package definition (objectstack.config.ts)
│   ├── datasource.zod.ts     → External data connections
│   ├── api.zod.ts            → REST/GraphQL contracts
│   ├── identity.zod.ts       → User, session management
│   ├── role.zod.ts           → RBAC definitions
│   ├── policy.zod.ts         → Global policies
│   ├── territory.zod.ts      → Territory hierarchy
│   ├── license.zod.ts        → License types, restrictions
│   ├── webhook.zod.ts        → HTTP callbacks
│   ├── translation.zod.ts    → i18n definitions
│   ├── discovery.zod.ts      → Metadata introspection
│   ├── plugin.zod.ts         → Plugin lifecycle
│   ├── driver.zod.ts         → Database driver interface
│   ├── tenant.zod.ts         → Multi-tenancy
│   ├── events.zod.ts         → Event bus
│   ├── realtime.zod.ts       → WebSocket sync
│   ├── organization.zod.ts   → Organization management
│   ├── audit.zod.ts          → Audit logging
│   └── job.zod.ts            → Background jobs
│
├── Shared Utilities
│   └── identifiers.zod.ts    → Machine identifier validation
│       ├── SystemIdentifierSchema      (snake_case + dots)
│       ├── SnakeCaseIdentifierSchema   (strict snake_case)
│       └── EventNameSchema             (dot notation events)
│
├── AI Protocol
│   ├── agent.zod.ts              → AI agent configuration
│   ├── model-registry.zod.ts     → LLM registry
│   ├── rag-pipeline.zod.ts       → RAG pipeline
│   ├── nlq.zod.ts                → Natural language query
│   ├── conversation.zod.ts       → Conversation management
│   ├── cost.zod.ts               → AI cost tracking
│   ├── predictive.zod.ts         → Predictive analytics
│   └── workflow-automation.zod.ts → AI workflow automation
│
└── API Protocol
    └── contract.zod.ts       → Request/response envelopes
```

---

## 🔄 Data Flow: User Request to Database

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│          │      │          │      │          │      │          │      │          │
│  Browser │─────▶│ ObjectUI │─────▶│ ObjectOS │─────▶│ ObjectQL │─────▶│  Driver  │
│          │      │          │      │          │      │          │      │          │
└──────────┘      └──────────┘      └──────────┘      └──────────┘      └──────────┘
    │                 │                 │                 │                 │
    │                 │                 │                 │                 │
    ▼                 ▼                 ▼                 ▼                 ▼
User clicks      Lookup view       Check user        Parse query      Execute SQL
"Show Accounts"  definition from   permissions       to AST           on Postgres
                 app.navigation    (role-based)      (filter/sort)    
                                                                       
                                   Apply field-      Optimize         Return rows
                                   level security    (joins/index)    
                                                                       
                                   Run triggers      Generate SQL     
                                   (beforeFind)      dialect          
```

### Detailed Steps:

1. **User Interaction** (Browser)
   - User clicks "Accounts" in navigation
   - Browser sends: `GET /api/data/account?view=all`

2. **UI Resolution** (ObjectUI)
   - Lookup `app.navigation` → find `ObjectNavItem(objectName: "account")`
   - Lookup `view.zod` → find ListView definition for "all" view
   - Determine columns, filters, sort order

3. **Security Check** (ObjectOS)
   - Validate user session (JWT token)
   - Check `role.zod` → user has "read" permission on "account"?
   - Check `permission.zod` → field-level security (hide SSN field)
   - Apply sharing rules (only show accounts owned by user's team)

4. **Query Translation** (ObjectQL)
   - Parse filters from UI → Query AST
   - Apply validation rules
   - Run triggers: `beforeFind(ctx)`
   - Optimize query (index hints)

5. **Database Execution** (Driver)
   - Driver translates AST → SQL dialect (Postgres, MySQL, etc.)
   - Execute query with connection pooling
   - Return raw rows

6. **Response Formatting** (ObjectOS → ObjectUI)
   - Format response per `api/contract.zod` schema
   - Apply field formatting (currency, date)
   - Return JSON to browser

7. **Rendering** (Browser)
   - React/Vue/Svelte renders ListView component
   - Display grid with pagination

---

## 🧩 Plugin Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       ObjectStack Kernel                         │
│                     (ObjectOS Runtime)                           │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │ Plugin Lifecycle Hooks
                              │ (onInstall, onEnable, onDisable)
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────────┐                       ┌───────────────────┐
│  Plugin: CRM      │                       │  Plugin: BI       │
├───────────────────┤                       ├───────────────────┤
│ • Objects         │                       │ • Objects         │
│   - Account       │                       │   - Report        │
│   - Contact       │                       │   - Dataset       │
│                   │                       │                   │
│ • Views           │                       │ • Views           │
│   - AccountList   │                       │   - ReportBuilder │
│   - ContactForm   │                       │                   │
│                   │                       │ • Actions         │
│ • Dashboards      │                       │   - ExportToExcel │
│   - SalesPipeline │                       │   - ScheduleReport│
│                   │                       │                   │
│ • APIs            │                       │ • Drivers         │
│   - /convert-lead │                       │   - driver-excel  │
│                   │                       │   - driver-bigquery│
└───────────────────┘                       └───────────────────┘

Each plugin:
1. Declares manifest (objectstack.config.ts)
2. Exports objects, views, dashboards, etc.
3. Implements lifecycle hooks (optional)
4. Receives runtime context (ctx.ql, ctx.os, ctx.logger)
5. Can extend existing objects (add fields)
6. Can register custom field widgets
```

---

## 🔐 Security & Permission Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    Permission Evaluation Flow                    │
└─────────────────────────────────────────────────────────────────┘

Request: user.read('account', id=123)
   │
   ├──▶ Step 1: Object-Level Permission (CRUD)
   │    role.zod: Does user's role allow "read" on "account"?
   │    ├── ✅ Yes → Continue
   │    └── ❌ No → Return 403 Forbidden
   │
   ├──▶ Step 2: Sharing Rules
   │    sharing.zod: Is record owned by user or shared with them?
   │    ├── ✅ Yes → Continue
   │    └── ❌ No → Return 404 Not Found (hide existence)
   │
   ├──▶ Step 3: Field-Level Security
   │    permission.zod: Which fields can user read?
   │    Example: Hide "annual_revenue" for non-managers
   │    ├── Filter out restricted fields
   │    └── Continue with allowed fields
   │
   ├──▶ Step 4: Validation Rules
   │    validation.zod: Check conditional visibility
   │    Example: "Show SSN only if country = USA"
   │
   ├──▶ Step 5: Territory Hierarchy
   │    territory.zod: Check geographic access
   │    Example: "APAC sales can only see APAC accounts"
   │
   └──▶ Step 6: Policy Enforcement
        policy.zod: Global data access policies
        Example: "No access to records older than 7 years (GDPR)"
        
   ✅ All checks passed → Return record with allowed fields
```

---

## 🤖 AI Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      AI-Powered Features                         │
└─────────────────────────────────────────────────────────────────┘

1. Natural Language Query (NLQ)
   User: "Show me all accounts in California with revenue > $1M"
     │
     ├──▶ AI Model (GPT-4, Claude)
     │    Prompt: "Convert to ObjectQL AST"
     │    
     └──▶ Generated AST:
          {
            object: "account",
            filters: [
              { field: "state", operator: "=", value: "CA" },
              { field: "annual_revenue", operator: ">", value: 1000000 }
            ]
          }

2. Auto-Schema Generation
   User: "Create a project management app"
     │
     ├──▶ AI Agent (agent.zod.ts)
     │    Context: ObjectStack protocol documentation
     │    
     └──▶ Generated Schemas:
          - object/project.ts (name, status, due_date)
          - object/task.ts (title, assigned_to, project_id)
          - view/project_kanban.ts
          - dashboard/project_stats.ts

3. Intelligent Suggestions
   User: Creating a "Contact" object
     │
     ├──▶ RAG Pipeline (rag.zod.ts)
     │    Query similar objects in knowledge base
     │    
     └──▶ Suggestions:
          - "Add 'phone' field (used in 95% of contact objects)"
          - "Add lookup to 'account' (common pattern)"
          - "Enable field history tracking?"

4. Code Generation
   User: "Add validation: email must be unique"
     │
     ├──▶ AI Model + Protocol Knowledge
     │    
     └──▶ Generated validation.zod.ts:
          {
            name: "unique_email",
            condition: "!DUPLICATE(email)",
            errorMessage: "Email already exists",
            active: true
          }
```

---

## 🚀 Deployment Topologies

### Topology 1: Monolith (Single Server)
```
┌─────────────────────────────────────┐
│         Single VM/Container         │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │   ObjectStack Kernel        │   │
│  │   (ObjectOS + All Plugins)  │   │
│  └─────────────────────────────┘   │
│                │                    │
│                ▼                    │
│  ┌─────────────────────────────┐   │
│  │   PostgreSQL Database       │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘

Use Case: Small teams, prototyping, local development
```

### Topology 2: Multi-Tenant SaaS
```
┌──────────────────────────────────────────────────────────┐
│                   Load Balancer (NGINX)                   │
└──────────────────────────────────────────────────────────┘
        │               │               │
        ▼               ▼               ▼
   ┌────────┐     ┌────────┐     ┌────────┐
   │ Kernel │     │ Kernel │     │ Kernel │  ◀── Stateless
   │   #1   │     │   #2   │     │   #3   │
   └────────┘     └────────┘     └────────┘
        │               │               │
        └───────────────┴───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   PostgreSQL (Multi-tenant)   │
        │   • tenant_id on every table  │
        │   • Row-level security (RLS)  │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Redis (Session, Cache)      │
        └───────────────────────────────┘

Use Case: SaaS providers, high availability
```

### Topology 3: Microservices (Enterprise)
```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (Kong)                        │
│              Rate Limiting, Auth, Routing                    │
└─────────────────────────────────────────────────────────────┘
        │               │               │               │
        ▼               ▼               ▼               ▼
   ┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐
   │ Data   │     │  Auth  │     │  Flow  │     │Workflow│
   │Service │     │Service │     │ Engine │     │ Engine │
   └────────┘     └────────┘     └────────┘     └────────┘
        │               │               │               │
        └───────────────┴───────────────┴───────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Event Bus (Kafka)   │
                    └───────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   ┌────────┐             ┌────────┐             ┌────────┐
   │Postgres│             │ Redis  │             │  S3    │
   │ (Data) │             │(Cache) │             │(Files) │
   └────────┘             └────────┘             └────────┘

Use Case: Large enterprises, high scale, service isolation
```

---

## 📊 Protocol Dependency Graph

```
                    ┌──────────────┐
                    │   manifest   │ (Root - defines app)
                    └──────────────┘
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
         ┌──────────┐ ┌──────────┐ ┌──────────┐
         │  object  │ │   app    │ │ datasource│
         └──────────┘ └──────────┘ └──────────┘
              │            │             │
      ┌───────┼────┐       │             └──▶ driver
      ▼       ▼    ▼       │
   ┌─────┐ ┌────┐ ┌────┐  │
   │field│ │perm│ │flow│  │
   └─────┘ └────┘ └────┘  │
      │       │      │     │
      ▼       ▼      ▼     ▼
   ┌─────────────────────────┐
   │  validation, workflow   │
   └─────────────────────────┘
              │
              ▼
        ┌──────────┐
        │  query   │ (AST - universal query language)
        └──────────┘

Dependencies (imports):
• object.zod.ts     imports  field.zod.ts
• validation.zod.ts imports  field.zod.ts
• permission.zod.ts imports  object.zod.ts
• app.zod.ts        imports  object.zod.ts, dashboard.zod.ts
• manifest.zod.ts   imports  object.zod.ts, app.zod.ts, datasource.zod.ts
```

---

## 📝 Naming Conventions & Identifiers

ObjectStack enforces strict naming conventions to ensure cross-platform compatibility, security, and consistency.

### Machine Identifiers vs. Labels

| Concept | Pattern | Example | Usage |
|---------|---------|---------|-------|
| **Machine Identifier** | `snake_case` | `crm_account`, `first_name`, `sales_manager` | Stored values, API names, internal identifiers |
| **Event Name** | `dot.notation` | `user.created`, `order.paid` | Event keys, message topics |
| **Label** | `Any Case` | `Sales Manager`, `In Progress` | User-facing display text |
| **Schema Property** | `camelCase` | `maxLength`, `isRequired` | TypeScript interface properties |

### Identifier Schemas

Three validation schemas enforce naming consistency:

```typescript
// 1. SystemIdentifierSchema - Most flexible (allows dots)
//    Used for: General identifiers, events
//    Pattern: /^[a-z][a-z0-9_.]*$/
'crm_account'      // ✅
'user.created'     // ✅ (dots allowed)

// 2. SnakeCaseIdentifierSchema - Strict (no dots)
//    Used for: Database entities (objects, fields)
//    Pattern: /^[a-z][a-z0-9_]*$/
'project_task'     // ✅
'annual_revenue'   // ✅
'user.created'     // ❌ (no dots)

// 3. EventNameSchema - Event naming (encourages dots)
//    Used for: Events, webhooks, message queues
//    Pattern: /^[a-z][a-z0-9_.]*$/
'user.created'     // ✅
'order.paid'       // ✅
'user_created'     // ⚠️ Valid but discouraged
```

### Why Lowercase Snake_case?

1. **Cross-platform compatibility**: Case-insensitive filesystems don't cause conflicts
2. **URL-friendly**: No encoding needed in web addresses
3. **Database consistency**: Eliminates collation issues
4. **Security**: Prevents case-sensitivity bugs in permission checks
5. **Standards alignment**: Matches PostgreSQL, Kafka, REST API conventions

### Example: Object Definition

```typescript
{
  // Machine identifiers (snake_case)
  name: 'crm_account',
  fields: {
    first_name: { type: 'text' },
    annual_revenue: { type: 'currency' }
  },
  
  // Labels (any case)
  label: 'Customer Account',
  
  // Schema properties (camelCase)
  enable: {
    trackHistory: true,
    apiEnabled: true
  }
}
```

**For implementation details, see:**
- [System Identifier Schema](/docs/references/shared/identifiers/SystemIdentifier)
- [Snake Case Identifier Schema](/docs/references/shared/identifiers/SnakeCaseIdentifier)
- [Event Name Schema](/docs/references/shared/identifiers/EventName)

---

## 🌐 Cross-Platform Rendering

```
                 ┌──────────────────────┐
                 │  ObjectUI Protocol   │
                 │  (Platform Agnostic) │
                 └──────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
     ┌───────────┐  ┌───────────┐  ┌───────────┐
     │   Web     │  │  Mobile   │  │  Desktop  │
     │ Renderer  │  │ Renderer  │  │ Renderer  │
     └───────────┘  └───────────┘  └───────────┘
            │              │              │
            ▼              ▼              ▼
     ┌───────────┐  ┌───────────┐  ┌───────────┐
     │  React    │  │   React   │  │  Electron │
     │  +Tailwind│  │   Native  │  │  +React   │
     └───────────┘  └───────────┘  └───────────┘

Same Protocol → Different Renderers:
• view.zod → React grid component (Web)
• view.zod → FlatList component (Mobile)
• view.zod → Electron table widget (Desktop)
```

---

**For more details, see:**
- [DEVELOPMENT_ROADMAP.md](./internal/planning/DEVELOPMENT_ROADMAP.md) - Complete development plan
- [PRIORITIES.md](./internal/planning/PRIORITIES.md) - What to work on next
- [packages/spec/README.md](./packages/spec/README.md) - Technical documentation
