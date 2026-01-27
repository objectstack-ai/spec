# ObjectStack Protocol Reference

> **Complete inventory of all protocol specifications in the ObjectStack ecosystem.**

Last Updated: 2026-01-27

**📖 See also:** 
- [PROTOCOL_INDEX.md](./PROTOCOL_INDEX.md) for quick navigation links to all protocols
- [PROTOCOL_ORGANIZATION.md](./PROTOCOL_ORGANIZATION.md) for visual diagrams and protocol relationships

## Overview

This document provides a comprehensive reference to all 70 protocol specifications that define the ObjectStack platform. Each protocol is implemented as a Zod schema (`.zod.ts` file) providing runtime validation and TypeScript type safety.

## Protocol Statistics

| Module | Protocol Files | Description |
| :--- | :---: | :--- |
| **Data Protocol** | 8 | Core business logic and data modeling |
| **UI Protocol** | 10 | User interface definitions and interactions |
| **System Protocol** | 14 | Runtime environment and platform capabilities |
| **AI Protocol** | 8 | AI/ML integration and agent orchestration |
| **API Protocol** | 6 | Standardized API contracts and communication |
| **Automation Protocol** | 7 | Workflow automation and integration |
| **Auth Protocol** | 6 | Identity, authentication, and authorization |
| **Permission Protocol** | 4 | Access control and security policies |
| **Hub Protocol** | 5 | Marketplace and multi-tenancy |
| **Shared Protocol** | 1 | Common utilities and identifiers |
| **Stack Protocol** | 1 | Root stack definition |
| **Total** | **70** | **Complete protocol suite** |

## Protocol Modules

### 1. Data Protocol (ObjectQL)
**Location:** `packages/spec/src/data/`

Defines the "Shape of Data" and business logic.

| File | Schema | Purpose |
| :--- | :--- | :--- |
| `field.zod.ts` | `FieldSchema` | Field definitions with 44 types (text, number, select, lookup, formula, vector, location, etc.) |
| `object.zod.ts` | `ObjectSchema` | Object/table definitions with fields, indexes, and capabilities |
| `query.zod.ts` | `QuerySchema` | Abstract query AST supporting window functions, HAVING, DISTINCT, subqueries |
| `validation.zod.ts` | `ValidationRuleSchema` | Validation rules for data integrity |
| `filter.zod.ts` | `FilterSchema` | Query filtering and conditions |
| `dataset.zod.ts` | `DatasetSchema` | Dataset definitions for reporting and analytics |
| `mapping.zod.ts` | `FieldMappingSchema` | Field mapping configurations for data transformation |
| `hook.zod.ts` | `HookSchema` | Lifecycle hooks (before/after insert, update, delete) |

**Key Features:**
- 44 field types including AI/ML vectors and GPS locations
- Advanced query capabilities (window functions, HAVING, DISTINCT, subqueries)
- Validation rules and formulas
- Lifecycle hooks for business logic

### 2. UI Protocol (ObjectUI)
**Location:** `packages/spec/src/ui/`

Defines the "Shape of Interaction" for rendering interfaces.

| File | Schema | Purpose |
| :--- | :--- | :--- |
| `view.zod.ts` | `ViewSchema` | List views (grid, kanban, calendar, gantt) and form layouts |
| `page.zod.ts` | `PageSchema` | FlexiPage layouts with regions and components |
| `app.zod.ts` | `AppSchema` | Application structure and navigation menus |
| `dashboard.zod.ts` | `DashboardSchema` | Dashboard layouts with grid-based widgets |
| `report.zod.ts` | `ReportSchema` | Report definitions (tabular, summary, matrix, chart) |
| `action.zod.ts` | `ActionSchema` | UI actions (buttons, scripts, URLs, flows) |
| `component.zod.ts` | `ComponentSchema` | Reusable UI components |
| `block.zod.ts` | `BlockSchema` | UI block definitions |
| `theme.zod.ts` | `ThemeSchema` | Theming (colors, typography, breakpoints, animations) |
| `widget.zod.ts` | `WidgetSchema` | Custom field widgets with lifecycle hooks |

**Key Features:**
- Server-driven UI with multiple view types
- Flexible page layouts with component regions
- Rich dashboard and reporting capabilities
- Comprehensive theming system

### 3. System Protocol (ObjectOS)
**Location:** `packages/spec/src/system/`

Defines the "Runtime Environment" and platform capabilities.

| File | Schema | Purpose |
| :--- | :--- | :--- |
| `manifest.zod.ts` | `ManifestSchema` | Application/plugin manifest (`objectstack.config.ts`) with 7 package types: app, plugin, driver, module, objectql, gateway, adapter |
| `datasource.zod.ts` | `DatasourceSchema` | Data source connection configurations |
| `driver.zod.ts` | `DriverSchema` | Database driver definitions and options |
| `driver/postgres.zod.ts` | `PostgresConfigSchema` | PostgreSQL-specific driver configuration |
| `driver/mongo.zod.ts` | `MongoConfigSchema` | MongoDB-specific driver configuration |
| `plugin.zod.ts` | `PluginSchema` | Plugin lifecycle and interface definitions |
| `context.zod.ts` | `KernelContextSchema` | Kernel execution context with user, org, tenant info |
| `events.zod.ts` | `EventSchema` | Event bus and pub/sub patterns |
| `job.zod.ts` | `JobSchema` | Background job scheduling (cron, interval, delayed) |
| `audit.zod.ts` | `AuditEventSchema` | Audit logging for compliance |
| `logger.zod.ts` | `LoggerConfigSchema` | Structured logging configuration |
| `translation.zod.ts` | `TranslationSchema` | i18n/l10n support |
| `feature.zod.ts` | `FeatureFlagSchema` | Feature flag definitions |
| `scoped-storage.zod.ts` | `ScopedStorageSchema` | Scoped key-value storage |

**Key Features:**
- Microkernel architecture with 7 distinct package types for proper separation of concerns
  - **adapter**: Runtime containers (Express, Hono, Fastify, Serverless)
  - **gateway**: API protocols (GraphQL, REST, RPC, OData)
  - **objectql**: Core data engine implementation
  - **driver**: Database/external service adapters (Postgres, MongoDB, S3)
  - **plugin**: General-purpose functionality extensions
  - **app**: Business application packages
  - **module**: Reusable code libraries
- Pluggable architecture with manifest-based configuration
- Multi-driver support (PostgreSQL, MongoDB, and extensible)
- Event-driven architecture with pub/sub
- Comprehensive audit and logging capabilities
- Feature flags and i18n support

### 4. AI Protocol
**Location:** `packages/spec/src/ai/`

Defines AI agent integration capabilities.

| File | Schema | Purpose |
| :--- | :--- | :--- |
| `agent.zod.ts` | `AgentSchema` | AI agent definitions and configurations |
| `model-registry.zod.ts` | `ModelRegistrySchema` | LLM model registry and selection |
| `rag-pipeline.zod.ts` | `RAGPipelineSchema` | Retrieval-augmented generation pipeline |
| `nlq.zod.ts` | `NLQSchema` | Natural language query processing |
| `conversation.zod.ts` | `ConversationSchema` | Conversation management and memory |
| `cost.zod.ts` | `CostTrackingSchema` | AI cost tracking and budgeting |
| `predictive.zod.ts` | `PredictiveModelSchema` | Predictive analytics and ML models |
| `orchestration.zod.ts` | `OrchestrationSchema` | AI workflow orchestration |

**Key Features:**
- Multi-provider LLM support
- RAG pipeline for semantic search
- Natural language to ObjectQL translation
- Conversation history and context management
- Cost tracking and budget controls

### 5. API Protocol
**Location:** `packages/spec/src/api/`

Defines standardized API contracts.

| File | Schema | Purpose |
| :--- | :--- | :--- |
| `contract.zod.ts` | `ApiContractSchema` | API endpoint contracts and specifications |
| `endpoint.zod.ts` | `EndpointSchema` | REST endpoint definitions with rate limiting |
| `router.zod.ts` | `RouterSchema` | API routing configuration |
| `odata.zod.ts` | `ODataQuerySchema` | OData query protocol support |
| `realtime.zod.ts` | `RealtimeSchema` | WebSocket/SSE real-time subscriptions |
| `discovery.zod.ts` | `DiscoverySchema` | API discovery and introspection |

**Key Features:**
- RESTful API contracts
- OData query support
- Real-time subscriptions (WebSocket/SSE)
- API rate limiting and throttling
- Auto-discovery and introspection

### 6. Automation Protocol
**Location:** `packages/spec/src/automation/`

Workflow automation and integration.

| File | Schema | Purpose |
| :--- | :--- | :--- |
| `flow.zod.ts` | `FlowSchema` | Visual workflow builder (Screen, Autolaunched, Schedule) |
| `workflow.zod.ts` | `WorkflowSchema` | Declarative workflow rules (field updates, alerts) |
| `approval.zod.ts` | `ApprovalProcessSchema` | Multi-step approval processes |
| `webhook.zod.ts` | `WebhookSchema` | Outbound webhook definitions |
| `etl.zod.ts` | `ETLPipelineSchema` | ETL data pipelines |
| `sync.zod.ts` | `SyncConfigSchema` | Bi-directional data synchronization |
| `connector.zod.ts` | `ConnectorSchema` | External system connectors |

**Key Features:**
- Visual flow builder with drag-and-drop
- Declarative workflow automation
- Multi-step approval processes
- Webhook integrations
- ETL and data sync capabilities

### 7. Auth Protocol
**Location:** `packages/spec/src/auth/`

Identity, authentication, and authorization.

| File | Schema | Purpose |
| :--- | :--- | :--- |
| `identity.zod.ts` | `UserSchema` | User identity and profile |
| `role.zod.ts` | `RoleSchema` | Role definitions and permissions |
| `organization.zod.ts` | `OrganizationSchema` | Multi-org structure |
| `policy.zod.ts` | `PasswordPolicySchema` | Password and session policies |
| `config.zod.ts` | `AuthConfigSchema` | OAuth, SAML, SSO configurations |
| `scim.zod.ts` | `SCIMSchema` | SCIM 2.0 provisioning protocol |

**Key Features:**
- Multi-provider authentication (OAuth, SAML, SSO)
- Role-based access control (RBAC)
- Multi-organization support
- SCIM 2.0 for user provisioning
- Configurable password policies

### 8. Permission Protocol
**Location:** `packages/spec/src/permission/`

Access control and security policies.

| File | Schema | Purpose |
| :--- | :--- | :--- |
| `permission.zod.ts` | `ObjectPermissionSchema` | Object-level CRUD permissions |
| `sharing.zod.ts` | `SharingRuleSchema` | Criteria-based and manual sharing rules |
| `rls.zod.ts` | `RowLevelSecuritySchema` | Row-level security policies |
| `territory.zod.ts` | `TerritorySchema` | Territory management for hierarchical access |

**Key Features:**
- Multi-layered permission model
- Object, field, and record-level security
- Criteria-based sharing rules
- Territory-based access control

### 9. Hub Protocol
**Location:** `packages/spec/src/hub/`

Marketplace and multi-tenancy.

| File | Schema | Purpose |
| :--- | :--- | :--- |
| `marketplace.zod.ts` | `MarketplaceListingSchema` | Plugin marketplace listings |
| `composer.zod.ts` | `PackageComposerSchema` | Package dependency management |
| `license.zod.ts` | `LicenseSchema` | Feature licensing and entitlements |
| `tenant.zod.ts` | `TenantSchema` | Multi-tenant isolation and quotas |
| `space.zod.ts` | `SpaceSchema` | Workspace/space management |

**Key Features:**
- Plugin marketplace with versioning
- Dependency resolution and composition
- Feature-based licensing
- Multi-tenancy with quota enforcement
- Workspace management

### 10. Shared Protocol
**Location:** `packages/spec/src/shared/`

Common utilities and identifiers.

| File | Schema | Purpose |
| :--- | :--- | :--- |
| `identifiers.zod.ts` | `SystemIdentifierSchema` | Standard identifier formats and validation |

**Key Features:**
- Consistent identifier patterns across all protocols
- Validation for machine names (snake_case)
- Support for namespaced identifiers

### 11. Stack Protocol
**Location:** `packages/spec/src/`

Root stack definition.

| File | Schema | Purpose |
| :--- | :--- | :--- |
| `stack.zod.ts` | `ObjectStackDefinitionSchema` | Complete stack configuration combining all protocols |

**Key Features:**
- Unified stack configuration
- Aggregates all protocol modules
- Entry point for complete application definition

## Naming Conventions

All protocols follow strict naming conventions:

| Context | Convention | Example |
| :--- | :--- | :--- |
| **Configuration Keys** | `camelCase` | `maxLength`, `referenceFilters`, `deleteBehavior` |
| **Machine Names** | `snake_case` | `name: 'project_task'`, `object: 'account'` |
| **Schema Names** | `PascalCase` with `Schema` suffix | `FieldSchema`, `ObjectSchema` |
| **Type Names** | `PascalCase` inferred from Zod | `type Field = z.infer<typeof FieldSchema>` |

## Protocol Design Principles

1. **Zod First**: All protocols start with Zod schemas for runtime validation
2. **Type Safety**: TypeScript types are derived from Zod schemas (`z.infer<>`)
3. **JSON Schema**: All Zod schemas generate JSON schemas for IDE support
4. **No Business Logic**: Protocol specs contain only definitions, no implementation
5. **Backward Compatibility**: Breaking changes require major version bumps
6. **Extensibility**: All protocols support custom extensions and plugins

## Usage Examples

### Importing Protocols

```typescript
// Import individual schemas
import { FieldSchema, ObjectSchema } from '@objectstack/spec/data';
import { ViewSchema, AppSchema } from '@objectstack/spec/ui';
import { ManifestSchema } from '@objectstack/spec/system';

// Import types
import type { Field, Object } from '@objectstack/spec/data';
import type { View, App } from '@objectstack/spec/ui';

// Validate at runtime
const field = FieldSchema.parse({
  name: 'account_name',
  type: 'text',
  label: 'Account Name',
  required: true,
  maxLength: 255
});
```

### Building Applications

```typescript
import { ObjectStackDefinitionSchema } from '@objectstack/spec';

const myApp = ObjectStackDefinitionSchema.parse({
  manifest: {
    name: 'my-crm',
    version: '1.0.0',
    description: 'Custom CRM Application'
  },
  objects: [
    {
      name: 'account',
      label: 'Account',
      fields: [
        { name: 'name', type: 'text', label: 'Account Name', required: true },
        { name: 'industry', type: 'select', label: 'Industry' }
      ]
    }
  ],
  views: [
    {
      name: 'account_list',
      object: 'account',
      type: 'grid',
      columns: ['name', 'industry']
    }
  ]
});
```

## Documentation

For detailed documentation on each protocol, see:

- **[ObjectQL (Data Layer)](/content/docs/objectql/)** - Data modeling and queries
- **[ObjectUI (UI Layer)](/content/docs/objectui/)** - User interface definitions
- **[ObjectOS (System Layer)](/content/docs/objectos/)** - Runtime and platform
- **[API Reference](/content/docs/references/)** - Complete API documentation
- **[Examples](/examples/)** - Reference implementations

## Contributing

When adding or modifying protocols:

1. ✅ Define Zod schema first
2. ✅ Add comprehensive JSDoc comments with `@description`
3. ✅ Follow naming conventions (camelCase for config, snake_case for names)
4. ✅ Write unit tests with 80%+ coverage
5. ✅ Generate JSON schema: `pnpm --filter @objectstack/spec build`
6. ✅ Update this reference document
7. ✅ Add examples to documentation

See [CONTRIBUTING.md](/CONTRIBUTING.md) for complete guidelines.

## Version History

| Date | Version | Protocols | Notes |
| :--- | :--- | :---: | :--- |
| 2026-01-27 | 0.4.x | 70 | Complete protocol suite with AI, advanced query features |
| 2026-01-20 | 0.3.x | 68 | Added vector and location field types |
| 2025-12-15 | 0.2.x | 65 | Initial multi-module protocol structure |

## License

Apache 2.0 © ObjectStack

---

**See Also:**
- [Architecture Overview](./ARCHITECTURE.md)
- [Development Roadmap](./internal/planning/DEVELOPMENT_ROADMAP.md)
- [Contributing Guide](./CONTRIBUTING.md)
