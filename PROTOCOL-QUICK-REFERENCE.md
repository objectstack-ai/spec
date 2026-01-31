# ObjectStack Protocol Quick Reference

> **Fast lookup guide for developers** - organized by protocol category

## 📖 How to Use This Guide

- **Find by Category**: Browse protocols by domain (Data, UI, System, etc.)
- **Find by Example**: Every protocol links to practical examples
- **Find by Feature**: Use the index to jump to specific features

---

## 🗂️ Protocol Index

### Data Protocol (ObjectQL)

| Protocol | Description | Example | Status |
|----------|-------------|---------|--------|
| **Object** | Object definition with fields and relationships | [CRM Objects](./examples/crm/src/domains/crm/), [Todo](./examples/todo/) | ✅ |
| **Field** | 28 field types (text, number, lookup, formula, etc.) | [CRM Account](./examples/crm/src/domains/crm/account.object.ts) | ✅ |
| **Validation** | Validation rules (required, unique, format, script) | [CRM Examples](./examples/crm/), [Basic](./examples/basic/stack-definition-example.ts) | ✅ |
| **Query** | Query language (filter, sort, pagination) | [Basic](./examples/basic/) | ✅ |
| **Filter** | Filter expressions and operators | [Basic](./examples/basic/) | ✅ |
| **Hook** | Before/after CRUD hooks | [CRM Hooks](./examples/crm/src/domains/crm/account.hook.ts) | ✅ |
| **Driver** | Database driver abstraction | [Basic](./examples/basic/) | ✅ |
| **External Lookup** | Lookup fields from external systems | [Plugin BI](./examples/plugin-bi/) | 🟡 |
| **Document** | Document storage (NoSQL) | _Planned_ | 🔴 |
| **Dataset** | Virtual datasets and views | [Basic](./examples/basic/) | 🟡 |
| **Mapping** | Field mapping and transformation | [Basic](./examples/basic/) | 🟡 |

### UI Protocol (ObjectUI)

| Protocol | Description | Example | Status |
|----------|-------------|---------|--------|
| **View** | List and form views (grid, kanban, calendar, gantt) | [CRM](./examples/crm/) | ✅ |
| **App** | Application definition and navigation | [CRM](./examples/crm/objectstack.config.ts), [Basic](./examples/basic/stack-definition-example.ts) | ✅ |
| **Action** | Custom actions (script, URL, modal, flow) | [CRM Actions](./examples/crm/src/ui/actions.ts) | ✅ |
| **Dashboard** | Dashboard with widgets | [CRM Dashboards](./examples/crm/src/ui/dashboards.ts) | ✅ |
| **Report** | Reports (tabular, summary, matrix, chart) | [CRM Reports](./examples/crm/src/ui/reports.ts) | ✅ |
| **Chart** | Chart types (bar, line, pie, donut, funnel) | [CRM](./examples/crm/), [Plugin BI](./examples/plugin-bi/) | ✅ |
| **Widget** | Dashboard widgets | [CRM Dashboards](./examples/crm/src/ui/dashboards.ts) | ✅ |
| **Theme** | Visual theming and branding | [Basic](./examples/basic/) | 🟡 |
| **Page** | Custom pages | [Basic](./examples/basic/) | 🟡 |
| **Component** | Reusable UI components | _Planned_ | 🔴 |

### System Protocol (ObjectOS)

| Protocol | Description | Example | Status |
|----------|-------------|---------|--------|
| **Manifest** | Package/plugin manifest | All `objectstack.config.ts` files | ✅ |
| **Plugin** | Plugin system | [Plugin Advanced CRM](./examples/plugin-advanced-crm/), [Host](./examples/host/) | ✅ |
| **Capabilities** | Runtime capability declaration | [Basic Capabilities](./examples/basic/capabilities-example.ts) | ✅ |
| **Logging** | Structured logging | [Basic Logger](./examples/basic/logger-example.ts) | ✅ |
| **Events** | Event bus and pub/sub | [Middleware](./examples/middleware-example.ts) | ✅ |
| **Service Registry** | Service discovery and registration | [Plugin Advanced CRM](./examples/plugin-advanced-crm/) | ✅ |
| **Job** | Background job scheduling | [System Protocols](./examples/basic/system-protocols-example.ts) | ✅ |
| **Metrics** | Metrics and monitoring (Prometheus, StatsD) | [System Protocols](./examples/basic/system-protocols-example.ts) | ✅ |
| **Tracing** | Distributed tracing (OpenTelemetry, Jaeger) | [System Protocols](./examples/basic/system-protocols-example.ts) | ✅ |
| **Cache** | Multi-level caching (Memory, Redis) | [System Protocols](./examples/basic/system-protocols-example.ts) | ✅ |
| **Audit** | Audit logging | [System Protocols](./examples/basic/system-protocols-example.ts) | ✅ |
| **Compliance** | Compliance controls (GDPR, HIPAA, SOC 2) | [System Protocols](./examples/basic/system-protocols-example.ts) | ✅ |
| **Encryption** | Encryption at rest and in transit | [System Protocols](./examples/basic/system-protocols-example.ts) | ✅ |
| **Datasource** | External datasource configuration | [Basic](./examples/basic/) | 🟡 |
| **Translation** | Internationalization (i18n) | [Basic](./examples/basic/) | 🟡 |
| **Notification** | Notification system | _Planned_ | 🔴 |
| **Object Storage** | File/object storage | _Planned_ | 🔴 |
| **Search Engine** | Full-text search | _Planned_ | 🔴 |
| **Message Queue** | Message queue integration | _Planned_ | 🔴 |

### AI Protocol

| Protocol | Description | Example | Status |
|----------|-------------|---------|--------|
| **Agent** | AI agent definition | [AI Sales](./examples/ai-sales/), [AI Support](./examples/ai-support/) | ✅ |
| **RAG Pipeline** | Retrieval-Augmented Generation | [AI Support](./examples/ai-support/), [Basic RAG](./examples/basic/ai-rag-example.ts) | ✅ |
| **Model Registry** | LLM configuration and routing | [AI Support](./examples/ai-support/) | ✅ |
| **NLQ** | Natural Language Query | [AI Analyst](./examples/ai-analyst/) | ✅ |
| **Conversation** | Conversation management | [AI Sales](./examples/ai-sales/) | ✅ |
| **Orchestration** | AI workflow orchestration | [AI Codegen](./examples/ai-codegen/) | ✅ |
| **Cost** | Cost tracking and budgeting | [AI Examples](./examples/ai-support/) | 🟡 |
| **Predictive** | Predictive analytics | _Planned_ | 🔴 |
| **Agent Action** | Agent tool calling | [AI Examples](./examples/) | ✅ |

### Automation Protocol

| Protocol | Description | Example | Status |
|----------|-------------|---------|--------|
| **Workflow** | Workflow rules and automation | [CRM](./examples/crm/), [Basic Automation](./examples/basic/automation-example.ts) | ✅ |
| **Flow** | Visual flow builder (Screen flows) | [Basic Automation](./examples/basic/automation-example.ts) | ✅ |
| **Approval** | Multi-step approval processes | [Basic Automation](./examples/basic/automation-example.ts) | ✅ |
| **ETL** | ETL pipelines | [Basic Automation](./examples/basic/automation-example.ts) | ✅ |
| **Trigger** | Event triggers | [CRM](./examples/crm/) | ✅ |
| **Webhook** | Webhook configuration | [Basic](./examples/basic/) | 🟡 |
| **Sync** | Data synchronization | _Planned_ | 🔴 |

### Auth & Permissions

| Protocol | Description | Example | Status |
|----------|-------------|---------|--------|
| **Identity** | User identity and sessions | [Basic Auth](./examples/basic/auth-permission-example.ts) | ✅ |
| **Role** | Role-based access control (RBAC) | [Basic Auth](./examples/basic/auth-permission-example.ts) | ✅ |
| **Permission** | Object and field-level permissions | [Basic Auth](./examples/basic/auth-permission-example.ts), [CRM](./examples/crm/) | ✅ |
| **RLS** | Row-level security | [Basic Auth](./examples/basic/auth-permission-example.ts) | ✅ |
| **Sharing** | Sharing rules | [Basic Auth](./examples/basic/auth-permission-example.ts) | ✅ |
| **Territory** | Territory management | [Basic Auth](./examples/basic/auth-permission-example.ts) | ✅ |
| **Config** | Auth provider configuration (OAuth, SAML) | [Plugin Advanced CRM](./examples/plugin-advanced-crm/) | 🟡 |
| **SCIM** | SCIM provisioning | _Planned_ | 🔴 |
| **Organization** | Organization management | _Planned_ | 🔴 |
| **Policy** | Security policies | [Basic Auth](./examples/basic/auth-permission-example.ts) | ✅ |

### API Protocol

| Protocol | Description | Example | Status |
|----------|-------------|---------|--------|
| **REST Server** | REST API server | [REST Server](./examples/rest-server-example.ts), [Host](./examples/host/) | ✅ |
| **GraphQL** | GraphQL API | [API Protocols](./examples/basic/api-protocols-example.ts) | ✅ |
| **OData** | OData API | [API Protocols](./examples/basic/api-protocols-example.ts) | ✅ |
| **WebSocket** | WebSocket/Real-time API | [API Protocols](./examples/basic/api-protocols-example.ts) | ✅ |
| **Realtime** | Real-time subscriptions and live queries | [API Protocols](./examples/basic/api-protocols-example.ts) | ✅ |
| **Batch** | Batch operations | [API Protocols](./examples/basic/api-protocols-example.ts) | ✅ |
| **Discovery** | API discovery and introspection | [Basic Discovery](./examples/basic/api-discovery-example.ts) | ✅ |
| **Contract** | API contracts | [Basic](./examples/basic/) | 🟡 |
| **Endpoint** | Endpoint definition | [Basic](./examples/basic/) | 🟡 |
| **Router** | API routing | [Basic](./examples/basic/) | 🟡 |
| **Errors** | Error handling | [REST Server](./examples/rest-server-example.ts) | 🟡 |
| **HTTP Cache** | HTTP caching | _Planned_ | 🔴 |

### Integration Protocol

| Protocol | Description | Example | Status |
|----------|-------------|---------|--------|
| **Connector** | External system connectors | [Integration Connectors](./examples/basic/integration-connectors-example.ts) | ✅ |
| **Database** | Database connectors (Postgres, MySQL, MongoDB) | [Integration Connectors](./examples/basic/integration-connectors-example.ts) | ✅ |
| **File Storage** | File storage connectors (S3, Azure Blob) | [Integration Connectors](./examples/basic/integration-connectors-example.ts) | ✅ |
| **Message Queue** | Message queue connectors (RabbitMQ, Kafka, Redis) | [Integration Connectors](./examples/basic/integration-connectors-example.ts) | ✅ |
| **SaaS** | SaaS connectors (Salesforce, HubSpot, Stripe) | [Integration Connectors](./examples/basic/integration-connectors-example.ts) | ✅ |

### Hub & Marketplace

| Protocol | Description | Example | Status |
|----------|-------------|---------|--------|
| **Plugin Registry** | Plugin publishing and discovery | [Hub & Marketplace](./examples/basic/hub-marketplace-example.ts) | ✅ |
| **Marketplace** | Commercial plugin distribution | [Hub & Marketplace](./examples/basic/hub-marketplace-example.ts) | ✅ |
| **License** | License management | [Hub & Marketplace](./examples/basic/hub-marketplace-example.ts) | ✅ |
| **Tenant** | Multi-tenancy and isolation | [Hub & Marketplace](./examples/basic/hub-marketplace-example.ts) | ✅ |
| **Space** | Team workspaces | [Hub & Marketplace](./examples/basic/hub-marketplace-example.ts) | ✅ |
| **Composer** | Visual app builder (no-code/low-code) | [Hub & Marketplace](./examples/basic/hub-marketplace-example.ts) | ✅ |

---

## 🎯 Common Patterns

### Basic CRUD Object
```typescript
import { defineStack } from '@objectstack/spec';

const stack = defineStack({
  manifest: { id: 'my-app', type: 'app', name: 'my-app', version: '1.0.0' },
  objects: [{
    name: 'task',
    label: 'Task',
    fields: {
      subject: { type: 'text', label: 'Subject', required: true },
      status: { 
        type: 'select', 
        label: 'Status',
        options: [
          { value: 'todo', label: 'To Do' },
          { value: 'done', label: 'Done' }
        ]
      }
    }
  }]
});
```

### Relationships
```typescript
// Master-Detail (Cascade delete)
{
  type: 'lookup',
  label: 'Account',
  reference: { object: 'account' },
  relationshipType: 'master_detail',
}

// Lookup (Regular reference)
{
  type: 'lookup',
  label: 'Owner',
  reference: { object: 'user' },
  relationshipType: 'lookup',
}
```

### Formulas
```typescript
{
  type: 'formula',
  label: 'Full Name',
  returnType: 'text',
  formula: 'CONCATENATE(first_name, " ", last_name)',
}
```

### Validation Rules
```typescript
validation: {
  rules: [
    {
      name: 'positive_revenue',
      errorMessage: 'Revenue must be positive',
      formula: 'annual_revenue > 0',
    }
  ]
}
```

### Workflows
```typescript
workflows: [
  {
    name: 'update_last_activity',
    triggerType: 'on_create_or_update',
    conditions: { field: 'status', operator: 'equals', value: 'closed' },
    actions: [
      {
        type: 'field_update',
        field: 'last_activity_date',
        value: 'TODAY()',
      }
    ]
  }
]
```

---

## 📚 Learning Paths

### 🟢 Beginner Path (1-2 hours)
1. [Todo Example](./examples/todo/) - Simple complete app
2. [Stack Definition](./examples/basic/stack-definition-example.ts) - Configuration patterns
3. [CRM Example](./examples/crm/) - Enterprise patterns

### 🟡 Intermediate Path (1-2 days)
1. Complete Beginner Path
2. [All Basic Examples](./examples/basic/) - Master each protocol
3. [Plugin Advanced CRM](./examples/plugin-advanced-crm/) - Plugin development
4. [MSW React CRUD](./examples/msw-react-crud/) - Frontend integration

### 🔴 Advanced Path (2-3 days)
1. Complete Beginner & Intermediate Paths
2. [AI Examples](./examples/) - AI integration patterns
3. [Integration Connectors](./examples/basic/integration-connectors-example.ts) - External systems
4. [System Protocols](./examples/basic/system-protocols-example.ts) - Production patterns
5. [Host Server](./examples/host/) - Backend implementation

---

## 🔗 Resources

- **[Full Examples Catalog](./examples/README.md)** - Complete examples guide
- **[Architecture Guide](./ARCHITECTURE.md)** - System architecture
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute
- **[Protocol Specifications](./packages/spec/)** - Detailed protocol docs

---

**Version:** 0.6.1  
**Last Updated:** 2026-01-31  
**Protocol Coverage:** 75/108 (69%)
