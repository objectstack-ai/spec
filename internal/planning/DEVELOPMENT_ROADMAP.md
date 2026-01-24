# ObjectStack Protocol - Development Roadmap

> **Vision**: Build the "Post-SaaS Operating System" — an open-core, local-first ecosystem that virtualizes data and unifies business logic through metadata-driven protocols.

**Last Updated**: 2026-01-20  
**Status**: Active Development  
**Current Version**: v0.1.1

---

## Executive Summary

This roadmap outlines the complete development plan for the ObjectStack Protocol (`@objectstack/spec`), the "Constitution" that powers the ObjectStack ecosystem. The plan considers all future possibilities and ensures the protocol can support enterprise-grade applications while maintaining simplicity and developer experience.

### Progress Overview

| Phase | Focus Area | Completion | Priority |
|-------|------------|------------|----------|
| **P0** | Core Protocols | 80% ✅ | Critical |
| **P1** | Advanced Features | 40% 🔵 | High |
| **P2** | Platform & Extensibility | 20% 🟠 | High |
| **P3** | Enterprise & Governance | 30% 🟡 | Medium |
| **P4** | AI & Intelligence | 10% 🟣 | Medium |
| **P5** | Developer Experience | 25% 🔴 | High |
| **P6** | Cross-Platform Integration | 15% 🟤 | Medium |
| **P7** | Performance & Scale | 5% ⚫ | Low |
| **P8** | Documentation & Standards | 35% 📚 | High |

---

## Phase 0: Foundation & Core Protocols (P0) - Critical

**Goal**: Establish the fundamental "DNA" of ObjectStack that enables all higher-level features.

### ✅ Completed (80%)

#### Data Protocol (ObjectQL)
- ✅ **Field Schema** (`src/data/field.zod.ts`)
  - 35 field types (text, number, lookup, formula, slider, qrcode, etc.)
  - Comprehensive constraints (required, unique, min/max, etc.)
  - Relationship configuration (lookup, master-detail)
  - Formula and summary operations
  
- ✅ **Object Schema** (`src/data/object.zod.ts`)
  - Object capabilities (trackHistory, apiEnabled, etc.)
  - Field definitions as record map
  - Database indexes
  - Datasource configuration
  
- ✅ **Validation Rules** (`src/data/validation.zod.ts`)
  - Rule conditions and error messages
  - Field-level validation
  
- ✅ **Permission & Sharing** (`src/data/permission.zod.ts`, `src/data/sharing.zod.ts`)
  - CRUD permissions
  - Field-level security
  - Sharing rules
  
- ✅ **Workflow & Flow** (`src/data/workflow.zod.ts`, `src/data/flow.zod.ts`)
  - State machine workflows
  - Visual flow orchestration (autolaunched, screen, schedule)
  
- ✅ **Query Protocol** (`src/data/query.zod.ts`)
  - Abstract syntax tree for queries
  - Filter conditions, sorting
  
- ✅ **Dataset & Mapping** (`src/data/dataset.zod.ts`, `src/data/mapping.zod.ts`)
  - Data transformation schemas

#### UI Protocol (ObjectUI)
- ✅ **App & Navigation** (`src/ui/app.zod.ts`)
  - Navigation tree structure
  - Object, Dashboard, Page, URL, Group nav items
  - App branding configuration
  
- ✅ **View Protocol** (`src/ui/view.zod.ts`)
  - ListView types (grid, kanban, calendar, gantt)
  - FormView types (simple, tabbed, wizard)
  - Column definitions, filters
  
- ✅ **Dashboard** (`src/ui/dashboard.zod.ts`)
  - Grid layout system
  - Widget configurations
  
- ✅ **Report** (`src/ui/report.zod.ts`)
  - Report types (tabular, summary, matrix, chart)
  
- ✅ **Action** (`src/ui/action.zod.ts`)
  - Button actions, URL navigation
  - Screen flow triggers
  
- ✅ **Page Layout** (`src/ui/page.zod.ts`)
  - FlexiPage regions and components

#### System Protocol (ObjectOS)
- ✅ **Manifest** (`src/system/manifest.zod.ts`)
  - Package definition (`objectstack.config.ts`)
  - Version, dependencies, metadata
  
- ✅ **Datasource** (`src/system/datasource.zod.ts`)
  - External data connections (SQL, NoSQL, SaaS)
  
- ✅ **API Contract** (`src/api/contract.zod.ts`)
  - REST/GraphQL endpoint definitions
  - Request/response envelopes
  
- ✅ **Identity & Role** (`src/system/identity.zod.ts`, `src/system/role.zod.ts`)
  - User, session management
  - Role-based access control
  
- ✅ **License** (`src/system/license.zod.ts`)
  - License types and restrictions
  
- ✅ **Webhook** (`src/system/webhook.zod.ts`)
  - External HTTP callbacks
  
- ✅ **Translation** (`src/system/translation.zod.ts`)
  - i18n support
  
- ✅ **Discovery** (`src/system/discovery.zod.ts`)
  - Metadata introspection

#### AI Protocol
- ✅ **Agent Schema** (`src/ai/agent.zod.ts`)
  - AI agent configuration
  - Knowledge base, tools, model config

### 🚧 Missing Critical Components (20%)

#### 1. Field Widget Contract ⚠️ HIGH PRIORITY
**File**: `src/ui/widget.zod.ts`

```typescript
// Define standard interface for custom field components
export const FieldWidgetPropsSchema = z.object({
  value: z.any().describe('Current field value'),
  onChange: z.function().describe('Value change handler'),
  readonly: z.boolean().default(false),
  required: z.boolean().default(false),
  error: z.string().optional().describe('Validation error message'),
  field: FieldSchema.describe('Field metadata'),
  record: z.record(z.any()).optional().describe('Full record context'),
  options: z.record(z.any()).optional().describe('Widget-specific configuration'),
});
```

**Why Critical**: Without this, third-party developers cannot build custom field components (e.g., map picker, color selector) that integrate seamlessly into ObjectUI forms.

**Use Case**: 
- Custom address picker with Google Maps
- Rich text editor with custom toolbar
- Signature pad for legal documents

---

#### 2. Plugin Lifecycle Interface ⚠️ HIGH PRIORITY
**File**: `src/system/plugin.zod.ts`

```typescript
// Define plugin lifecycle hooks
export const PluginLifecycleSchema = z.object({
  onInstall: z.function().optional().describe('Called when plugin is installed'),
  onEnable: z.function().optional().describe('Called when plugin is enabled'),
  onDisable: z.function().optional().describe('Called when plugin is disabled'),
  onUninstall: z.function().optional().describe('Called before plugin removal'),
  onUpgrade: z.function().optional().describe('Called during version upgrade'),
});

export const PluginContextSchema = z.object({
  ql: z.any().describe('ObjectQL data access API'),
  os: z.any().describe('ObjectOS system API'),
  logger: z.any().describe('Logging interface'),
  metadata: z.any().describe('Metadata registry'),
  events: z.any().describe('Event bus'),
});
```

**Why Critical**: This is the contract between ObjectOS and all plugins/extensions. Without it, the plugin ecosystem cannot function.

**Use Case**:
- Analytics plugin runs migration on install
- Email plugin registers custom field types on enable
- Backup plugin schedules jobs on enable

---

#### 3. Driver Interface ⚠️ HIGH PRIORITY
**File**: `src/system/driver.zod.ts`

```typescript
// Standardize database driver implementation
export const DriverInterfaceSchema = z.object({
  name: z.string().describe('Driver name (e.g., "postgres", "mongodb")'),
  version: z.string().describe('Driver version'),
  
  // Core CRUD operations
  find: z.function().describe('Query records'),
  findOne: z.function().describe('Get single record by ID'),
  create: z.function().describe('Insert new record'),
  update: z.function().describe('Update existing record'),
  delete: z.function().describe('Delete record'),
  bulkCreate: z.function().describe('Bulk insert'),
  bulkUpdate: z.function().describe('Bulk update'),
  bulkDelete: z.function().describe('Bulk delete'),
  
  // Schema management (DDL)
  syncSchema: z.function().describe('Create/alter table from Object definition'),
  dropTable: z.function().describe('Drop table'),
  
  // Transaction support
  beginTransaction: z.function().optional(),
  commit: z.function().optional(),
  rollback: z.function().optional(),
  
  // Capabilities
  supports: z.object({
    transactions: z.boolean(),
    joins: z.boolean(),
    fullTextSearch: z.boolean(),
    jsonFields: z.boolean(),
    arrayFields: z.boolean(),
  }),
});
```

**Why Critical**: This enables ObjectQL to work with any database (SQL, NoSQL, Excel, Salesforce) through a unified interface.

**Use Case**:
- `driver-postgres`: PostgreSQL adapter
- `driver-mongodb`: MongoDB adapter
- `driver-excel`: Excel file as database
- `driver-salesforce`: Salesforce as datasource

---

#### 4. Trigger Context Protocol ⚠️ MEDIUM PRIORITY
**File**: `src/data/trigger.zod.ts`

```typescript
// Define context passed to trigger code (beforeInsert, afterUpdate, etc.)
export const TriggerContextSchema = z.object({
  action: z.enum(['insert', 'update', 'delete']).describe('Operation type'),
  timing: z.enum(['before', 'after']).describe('Before or after operation'),
  
  // Record data
  doc: z.record(z.any()).describe('Current record data'),
  previousDoc: z.record(z.any()).optional().describe('Previous values (for update)'),
  
  // User context
  userId: z.string().describe('User performing the operation'),
  user: z.record(z.any()).describe('Full user object'),
  
  // API access
  ql: z.any().describe('ObjectQL API for querying other objects'),
  logger: z.any().describe('Logging interface'),
  
  // Utilities
  addError: z.function().describe('Prevent operation with error message'),
  getOldValue: z.function().describe('Get field value before change'),
});
```

**Why Critical**: Standardizes how business logic code is written, enabling AI and tooling to generate trigger code consistently.

**Use Case**:
```typescript
// Before insert trigger
async function beforeInsertAccount(ctx: TriggerContext) {
  if (!ctx.doc.industry) {
    ctx.addError('industry', 'Industry is required');
  }
  
  // Auto-populate account number
  const count = await ctx.ql.count('account');
  ctx.doc.account_number = `ACC-${count + 1}`;
}
```

---

## Phase 1: Enhancement & Advanced Features (P1) - High Priority

**Goal**: Add sophisticated features that power complex enterprise applications.

### ✅ Completed (40%)

- ✅ Test infrastructure with Vitest
- ✅ JSON Schema generation from Zod
- ✅ Documentation generation scripts
- ✅ 13 test files with good coverage

### 🚧 Planned Features

#### 1. Enhanced Field Types
**File**: `src/data/field.zod.ts` (extend)

```typescript
// Add to FieldType enum
export const FieldType = z.enum([
  // ... existing types
  'location',        // GPS coordinates {lat, lng}
  'address',         // Structured address object
  'richtext',        // Quill/TipTap editor
  'code',            // Code editor (syntax highlighting)
  'json',            // Raw JSON field
  'color',           // Color picker
  'rating',          // Star rating (1-5)
  'slider',          // Numeric slider
  'barcode',         // QR/barcode scanner
  'signature',       // Digital signature
  'duration',        // Time duration (hours:minutes)
]);
```

#### 2. Advanced Validation
**File**: `src/data/validation.zod.ts` (enhance)

- Cross-field validation (e.g., "end_date > start_date")
- Async validation (e.g., check uniqueness across datasources)
- Custom validator functions
- Conditional validation rules

#### 3. Enhanced Query Protocol
**File**: `src/data/query.zod.ts` (enhance)

```typescript
// Add aggregation support
export const AggregationSchema = z.object({
  groupBy: z.array(z.string()).describe('Group by fields'),
  having: FilterSchema.optional().describe('Filter after grouping'),
  aggregates: z.array(z.object({
    function: z.enum(['count', 'sum', 'avg', 'min', 'max']),
    field: z.string(),
    alias: z.string(),
  })),
});

// Add join support
export const JoinSchema = z.object({
  type: z.enum(['inner', 'left', 'right', 'full']),
  object: z.string().describe('Object to join'),
  on: z.string().describe('Join condition'),
  alias: z.string().optional(),
});
```

#### 4. Page Builder Protocol
**File**: `src/ui/page-builder.zod.ts` (new)

Define drag-drop layout builder schema for custom pages.

#### 5. Component Library Schema
**File**: `src/ui/component.zod.ts` (new)

Standardize reusable UI component definitions (cards, tabs, accordions).

#### 6. Theme Configuration
**File**: `src/ui/theme.zod.ts` (new)

```typescript
export const ThemeSchema = z.object({
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    success: z.string(),
    warning: z.string(),
    error: z.string(),
    background: z.string(),
    surface: z.string(),
    text: z.string(),
  }),
  typography: z.object({
    fontFamily: z.string(),
    fontSize: z.object({
      xs: z.string(),
      sm: z.string(),
      base: z.string(),
      lg: z.string(),
      xl: z.string(),
    }),
  }),
  spacing: z.object({
    unit: z.number().describe('Base spacing unit (e.g., 4px)'),
  }),
  borderRadius: z.string(),
  shadows: z.record(z.string()),
});
```

#### 7. Notification Protocol
**File**: `src/system/notification.zod.ts` (new)

Define in-app, email, SMS, push notification schemas.

#### 8. Attachment Protocol
**File**: `src/data/attachment.zod.ts` (new)

File management, versioning, storage configuration.

#### 9. Comments/Feed Protocol
**File**: `src/data/feed.zod.ts` (new)

Chatter-style collaboration schema (posts, mentions, likes).

#### 10. Enhanced Audit Log
**File**: `src/data/audit.zod.ts` (enhance)

Field-level tracking, retention policies, export formats.

#### 11. Data Migration Schema
**File**: `src/system/migration.zod.ts` (new)

ETL mapping, transformation rules, error handling.

#### 12. Batch Job Protocol
**File**: `src/system/job.zod.ts` (new)

Scheduled tasks, cron expressions, retry logic.

#### 13. Email Template Schema
**File**: `src/ui/email-template.zod.ts` (new)

Email composition, merge fields, attachments.

#### 14. Print Template Schema
**File**: `src/ui/print-template.zod.ts` (new)

PDF generation, layout, headers/footers.

---

## Phase 2: Platform & Extensibility (P2) - High Priority

**Goal**: Enable a thriving plugin ecosystem and multi-tenant SaaS deployments.

### ✅ Completed (20%)

- ✅ Basic manifest structure
- ✅ Discovery protocol

### 🚧 Planned Features

#### 1. Plugin Marketplace Schema
**File**: `src/system/marketplace.zod.ts` (new)

```typescript
export const MarketplaceListingSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['integration', 'analytics', 'productivity', 'industry']),
  pricing: z.object({
    model: z.enum(['free', 'freemium', 'paid', 'enterprise']),
    price: z.number().optional(),
    currency: z.string().optional(),
  }),
  screenshots: z.array(z.string()),
  ratings: z.object({
    average: z.number(),
    count: z.number(),
  }),
  compatibility: z.object({
    minVersion: z.string(),
    maxVersion: z.string().optional(),
  }),
});
```

#### 2. Plugin Dependency Management
**File**: `src/system/manifest.zod.ts` (enhance)

```typescript
dependencies: z.record(z.object({
  version: z.string().describe('Semver range (e.g., "^1.0.0")'),
  optional: z.boolean().default(false),
  peer: z.boolean().default(false).describe('Peer dependency'),
})),
```

#### 3. Plugin Permission Model
**File**: `src/system/plugin-permissions.zod.ts` (new)

OAuth-style scopes for plugin security:
- `object.read:account`
- `object.write:*`
- `api.external:*`
- `user.email`

#### 4. Custom Object Extension
**File**: `src/system/extension.zod.ts` (new)

Allow plugins to add fields to existing objects without modifying core.

#### 5. Hook Registry Protocol
**File**: `src/system/hooks.zod.ts` (new)

Define extension points:
- `beforeObjectCreate`
- `afterRecordSave`
- `onPageRender`
- `onMenuBuild`

#### 6. Runtime Context Protocol
**File**: `src/system/context.zod.ts` (new)

Detailed `ctx` object available to all plugin code.

#### 7. Multi-tenancy Protocol
**File**: `src/system/tenant.zod.ts` (new)

Tenant isolation, shared vs isolated data models.

#### 8. Workspace/Namespace Schema
**File**: `src/system/workspace.zod.ts` (new)

Environment separation (dev/staging/prod), metadata versioning.

#### 9. API Gateway Configuration
**File**: `src/system/gateway.zod.ts` (new)

Rate limiting, throttling, caching, CORS.

#### 10. Service Mesh Protocol
**File**: `src/system/service-mesh.zod.ts` (new)

Microservice communication patterns, service discovery.

#### 11. Event Bus Schema
**File**: `src/system/events.zod.ts` (new)

Pub/sub event definitions, event routing.

#### 12. Real-time Sync Protocol
**File**: `src/system/realtime.zod.ts` (new)

WebSocket/SSE event streaming, presence detection.

---

## Phase 3: Enterprise & Governance (P3) - Medium Priority

**Goal**: Meet enterprise compliance, security, and operational requirements.

### ✅ Completed (30%)

- ✅ Basic policy schema
- ✅ Territory management
- ✅ Role-based access control

### 🚧 Planned Features

1. **Advanced Security** - Field-level encryption, PII masking
2. **Compliance Framework** - GDPR, HIPAA, SOC2 configuration
3. **Data Retention Policy** - Archival rules, purge schedules
4. **Sandbox/Clone Protocol** - Environment cloning
5. **Change Management** - Deployment pipeline, change sets
6. **Version Control Integration** - Git-based metadata tracking
7. **Dependency Analysis** - Impact analysis for schema changes
8. **Performance Monitoring** - APM, metrics, logging
9. **SLA/Quota Management** - Resource limits, throttling
10. **Disaster Recovery** - Backup, restore, failover
11. **Cross-org Data Sharing** - B2B data exchange

---

## Phase 4: AI & Intelligence (P4) - Medium Priority

**Goal**: Make ObjectStack the most AI-friendly platform for software generation.

### ✅ Completed (10%)

- ✅ Basic agent schema

### 🚧 Planned Features

1. **AI Model Registry** - LLM configuration, prompt templates
2. **RAG Pipeline Schema** - Vector DB, embedding configuration
3. **AI Training Data Protocol** - Dataset management
4. **Recommendation Engine** - Collaborative filtering
5. **Predictive Analytics** - ML model deployment
6. **Natural Language Query** - NLQ to AST transformation
7. **AI Workflow Automation** - Intelligent process suggestions
8. **Anomaly Detection** - Pattern recognition
9. **Sentiment Analysis** - Text analysis pipeline
10. **AI Governance** - Model versioning, A/B testing

---

## Phase 5: Developer Experience (P5) - High Priority

**Goal**: Make ObjectStack a joy to use for developers.

### ✅ Completed (25%)

- ✅ TypeScript type inference from Zod
- ✅ Basic documentation site
- ✅ Example CRM application
- ✅ Example TODO application

### 🚧 Planned Features

1. **CLI Tool Specification** - Command schemas for `objectstack-cli`
2. **IDE Extension Protocol** - LSP, autocomplete, validation
3. **Test Framework** - Unit test, integration test helpers
4. **Mock Data Generator** - Faker integration
5. **Performance Benchmarks** - Schema validation benchmarks
6. **Migration Assistant** - Schema diff, upgrade paths
7. **VS Code Extension** - Syntax highlighting, snippets
8. **GraphQL Schema Generation** - Auto-generate from Object definitions
9. **OpenAPI/Swagger Generation** - REST API documentation
10. **SDK Generation** - Multi-language clients (Python, Go, Java)
11. **Debugging Protocol** - Trace, inspect metadata execution

---

## Phase 6: Cross-Platform & Integration (P6) - Medium Priority

**Goal**: Enable ObjectStack to integrate with existing enterprise systems.

### ✅ Completed (15%)

- ✅ Basic datasource schema

### 🚧 Planned Features

1. **Mobile App Protocol** - React Native component mapping
2. **Desktop App Protocol** - Electron/Tauri configuration
3. **Web Components** - Framework-agnostic UI components
4. **Salesforce Adapter** - SOQL to AST mapping
5. **ServiceNow Adapter** - GlideRecord compatibility
6. **SAP Integration** - RFC/BAPI connector schema
7. **Microsoft Dynamics** - CRM entity mapping
8. **Slack/Teams Integration** - Bot command schemas
9. **Excel/Google Sheets** - Spreadsheet sync protocol
10. **Email Provider** - SendGrid, AWS SES configuration
11. **Payment Gateway** - Stripe, PayPal integration
12. **IoT Device Protocol** - MQTT, sensor data ingestion

---

## Phase 7: Performance & Scale (P7) - Low Priority

**Goal**: Ensure ObjectStack can handle billions of records and thousands of concurrent users.

### 🚧 Planned Features (5% Complete)

1. **Caching Strategy** - Redis, CDN configuration
2. **Database Sharding** - Horizontal partitioning
3. **Read Replica** - Load balancing
4. **Connection Pooling** - Database connection management
5. **Lazy Loading Protocol** - On-demand field resolution
6. **Pagination Standards** - Cursor vs offset pagination
7. **Bulk Operation Optimization** - Batch size, parallelism
8. **Index Strategy** - Composite index recommendations
9. **Query Optimization** - Cost-based query planning
10. **Asset CDN Protocol** - Static file serving

---

## Phase 8: Documentation & Standards (P8) - High Priority

**Goal**: Provide world-class documentation that makes ObjectStack accessible to all.

### ✅ Completed (35%)

- ✅ Basic concept docs (manifesto, architecture, terminology)
- ✅ API reference generation
- ✅ Getting started guide
- ✅ Project structure guide

### 🚧 Planned Features

1. **Complete Specification Docs** - Deep dive for each protocol layer
2. **Migration Guides** - Version upgrade documentation
3. **Best Practice Guides** - Enterprise patterns, anti-patterns
4. **Video Tutorials** - Recorded walkthroughs
5. **Interactive Playground** - Browser-based schema editor
6. **Case Studies** - Real-world implementations
7. **Performance Guidelines** - Optimization recommendations
8. **Security Checklist** - Hardening guidelines
9. **Accessibility Standards** - WCAG compliance guide
10. **Internationalization Guide** - Multi-language setup

---

## Immediate Next Steps (Q1 2026)

### Sprint 1-2: Complete P0 Foundation
- [ ] Implement Field Widget Contract (`src/ui/widget.zod.ts`)
- [ ] Implement Plugin Lifecycle Interface (`src/system/plugin.zod.ts`)
- [ ] Implement Driver Interface (`src/system/driver.zod.ts`)
- [ ] Implement Trigger Context Protocol (`src/data/trigger.zod.ts`)
- [ ] Add tests for all new protocols
- [ ] Update documentation

### Sprint 3-4: Enhanced Query & Validation
- [ ] Add aggregation support to Query Protocol
- [ ] Add join support to Query Protocol
- [ ] Implement cross-field validation
- [ ] Implement async validation framework
- [ ] Add enhanced field types (location, richtext, code)

### Sprint 5-6: Developer Experience
- [ ] Generate complete OpenAPI/GraphQL schemas
- [ ] Build interactive documentation playground
- [ ] Create comprehensive code examples
- [ ] Add mock data generator for testing
- [ ] Improve test coverage to 80%+

---

## Success Metrics

1. **Protocol Completeness**: All critical P0-P2 protocols defined (Target: 100% by Q2 2026)
2. **Test Coverage**: All schemas have comprehensive tests (Target: 80%+)
3. **Documentation Quality**: Every schema has examples and use cases
4. **Community Adoption**: 10+ external plugins built on the protocol (Target: Q3 2026)
5. **Performance**: Schema validation < 1ms for typical objects
6. **Enterprise Readiness**: Support for 1000+ objects, 10M+ records per table

---

## Contributing to the Roadmap

This roadmap is a living document. Contributions are welcome:

1. **Propose New Protocols**: Open an issue with the `protocol-proposal` label
2. **Prioritization Input**: Comment on existing roadmap items
3. **Implementation**: Pick an item and submit a PR

**Contact**: ObjectStack Core Team  
**Repository**: https://github.com/objectstack-ai/spec
