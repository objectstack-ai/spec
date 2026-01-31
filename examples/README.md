# ObjectStack Examples Catalog

> **Comprehensive examples demonstrating all ObjectStack protocols and features**

Welcome to the ObjectStack examples catalog! This directory contains carefully crafted examples organized by complexity and use case to help you get started quickly and learn the platform effectively.

## 📚 Quick Navigation

### By Learning Path

| Level | Examples | Description |
|-------|----------|-------------|
| 🟢 **Beginner** | [Todo](#todo-app), [Basic](#basic-protocol-examples) | Start here - simple, focused examples |
| 🟡 **Intermediate** | [CRM](#crm-example), [Plugin Advanced CRM](#plugin-advanced-crm) | Real-world applications |
| 🔴 **Advanced** | [MSW React CRUD](#msw-react-crud), [Host Server](#host-server) | Complex integrations |

### By Protocol Category

| Protocol | Examples | Status |
|----------|----------|--------|
| **Data (ObjectQL)** | [Basic Data](./basic/), [CRM Objects](./crm/), [Todo](./todo/) | ✅ Complete |
| **UI (ObjectUI)** | [Basic UI](./basic/), [CRM UI](./crm/), [MSW React](./msw-react-crud/) | ✅ Complete |
| **System (ObjectOS)** | [Basic System](./basic/), [Host Server](./host/), [Middleware](./middleware-example.ts) | ✅ Complete |
| **AI** | [AI Sales](./ai-sales/), [AI Support](./ai-support/), [AI Analyst](./ai-analyst/), [AI Codegen](./ai-codegen/), [Basic AI/RAG](./basic/) | ✅ Complete |
| **Automation** | [Basic Automation](./basic/automation-example.ts), [CRM Workflows](./crm/) | ✅ Complete |
| **Auth & Permissions** | [Basic Auth](./basic/auth-permission-example.ts), [CRM Permissions](./crm/) | ✅ Complete |
| **API** | [REST Server](./rest-server-example.ts), [API Discovery](./basic/api-discovery-example.ts), [Host Server](./host/) | ✅ Complete |
| **Integration** | [Plugin BI](./plugin-bi/), [Advanced CRM Plugin](./plugin-advanced-crm/) | 🟡 Partial |
| **Hub & Marketplace** | _Coming soon_ | 🔴 Missing |

## 🎯 Example Descriptions

### Todo App
**Path:** [`examples/todo/`](./todo/)  
**Level:** 🟢 Beginner  
**Protocols:** Data, UI, System  

The simplest complete example. Perfect for your first ObjectStack application.

**What you'll learn:**
- Basic object definitions
- Simple CRUD operations
- Basic UI configuration
- Package structure with `objectstack.config.ts`

**Quick Start:**
```bash
cd examples/todo
pnpm install
pnpm typecheck
```

---

### Basic Protocol Examples
**Path:** [`examples/basic/`](./basic/)  
**Level:** 🟢 Beginner  
**Protocols:** All (70+ protocols)  

Comprehensive standalone examples for every core protocol. Each file is self-contained and runnable.

**Examples included:**
- [`stack-definition-example.ts`](./basic/stack-definition-example.ts) - Complete stack configuration patterns
- [`capabilities-example.ts`](./basic/capabilities-example.ts) - Runtime capabilities
- [`api-discovery-example.ts`](./basic/api-discovery-example.ts) - API introspection
- [`ai-rag-example.ts`](./basic/ai-rag-example.ts) - RAG pipeline and AI agents
- [`auth-permission-example.ts`](./basic/auth-permission-example.ts) - RBAC, RLS, sharing
- [`automation-example.ts`](./basic/automation-example.ts) - Workflows, flows, ETL
- [`logger-example.ts`](./basic/logger-example.ts) - Structured logging

**Quick Start:**
```bash
# Run any example directly
npx tsx examples/basic/stack-definition-example.ts

# Or type check all examples
cd examples/basic
pnpm typecheck
```

---

### CRM Example
**Path:** [`examples/crm/`](./crm/)  
**Level:** 🟡 Intermediate  
**Protocols:** Data, UI, Automation, Auth  

**Full-featured CRM** demonstrating enterprise-grade patterns and all major field types.

**What's included:**
- 6 interconnected objects (Account, Contact, Opportunity, Lead, Case, Task)
- All 28 field types demonstrated
- Multiple view types (Grid, Kanban, Calendar, Gantt)
- Validation rules and workflows
- Dashboards and reports
- Actions and automation

**Object Highlights:**
- **Account**: Formulas, validation, workflows, autonumber
- **Contact**: Master-detail relationships, avatars
- **Opportunity**: State machines, complex workflows, history tracking
- **Lead**: Conversion processes, status management
- **Case**: SLA tracking, escalation automation
- **Task**: Polymorphic relationships, time tracking

**Quick Start:**
```bash
cd examples/crm
pnpm install
pnpm build
```

---

### MSW React CRUD
**Path:** [`examples/msw-react-crud/`](./msw-react-crud/)  
**Level:** 🔴 Advanced  
**Protocols:** Data, UI, API, Client  

**Frontend-first development** - Run ObjectStack entirely in the browser with Service Workers.

**What you'll learn:**
- Browser-based ObjectStack kernel
- MSW (Mock Service Worker) integration
- React client with `@objectstack/client-react`
- In-memory data persistence
- Full CRUD without backend

**Architecture:**
```
React App → Service Worker → ObjectStack Kernel → In-Memory Driver
```

**Quick Start:**
```bash
cd examples/msw-react-crud
pnpm install
pnpm dev
# Open http://localhost:5173
```

---

### Host Server
**Path:** [`examples/host/`](./host/)  
**Level:** 🔴 Advanced  
**Protocols:** System, API, Data  

**Complete server implementation** showing how to build a metadata-driven backend.

**Features:**
- Dynamic schema loading from plugins
- Auto-generated REST APIs
- Unified metadata API
- Plugin orchestration
- Production-ready patterns

**Quick Start:**
```bash
cd examples/host
pnpm install
pnpm dev
# API available at http://localhost:3000
```

---

### AI Examples

#### AI Sales Assistant
**Path:** [`examples/ai-sales/`](./ai-sales/)  
**Protocols:** AI (Agent, RAG, NLQ)

Intelligent sales automation with lead qualification, email personalization, and opportunity insights.

#### AI Support Assistant
**Path:** [`examples/ai-support/`](./ai-support/)  
**Protocols:** AI (Agent, RAG, Model Registry)

RAG-powered customer support with vector search knowledge base.

#### AI Data Analyst
**Path:** [`examples/ai-analyst/`](./ai-analyst/)  
**Protocols:** AI (NLQ, Agent)

Natural language query system transforming questions into ObjectQL queries.

#### AI Code Generator
**Path:** [`examples/ai-codegen/`](./ai-codegen/)  
**Protocols:** AI (Agent, Orchestration)

Generate complete ObjectStack applications from natural language descriptions.

---

### Plugin Examples

#### Plugin Advanced CRM
**Path:** [`examples/plugin-advanced-crm/`](./plugin-advanced-crm/)  
**Protocols:** System (Plugin, Capabilities, Services)

Demonstrates plugin architecture with capability manifests, protocol conformance, and service interfaces.

#### Plugin BI
**Path:** [`examples/plugin-bi/`](./plugin-bi/)  
**Protocols:** UI (Dashboard, Report, Chart), Integration

Business intelligence plugin with advanced analytics and data visualization.

---

### Standalone Examples

#### REST Server Example
**Path:** [`examples/rest-server-example.ts`](./rest-server-example.ts)  
**Protocols:** API (REST, Endpoint, Router)

Single-file REST API server implementation showing minimal server setup.

#### Middleware Example
**Path:** [`examples/middleware-example.ts`](./middleware-example.ts)  
**Protocols:** System (Plugin, Lifecycle), API (HTTP)

Demonstrates plugin middleware patterns and HTTP interceptors.

---

## 🗺️ Protocol Coverage Map

### Data Protocol (ObjectQL)
| Protocol | Example | Location |
|----------|---------|----------|
| Object Definition | ✅ Complete | [CRM Objects](./crm/src/domains/crm/), [Todo](./todo/) |
| Field Types (28 types) | ✅ Complete | [CRM Account](./crm/src/domains/crm/account.object.ts) |
| Validation Rules | ✅ Complete | [CRM Examples](./crm/), [Basic](./basic/) |
| Relationships | ✅ Complete | [CRM Contact](./crm/src/domains/crm/contact.object.ts) |
| Formulas | ✅ Complete | [CRM Account](./crm/src/domains/crm/account.object.ts) |
| Hooks | ✅ Complete | [CRM Hooks](./crm/src/domains/crm/account.hook.ts) |
| Query & Filters | ✅ Complete | [Basic](./basic/) |
| External Lookup | 🟡 Partial | [Plugin BI](./plugin-bi/) |
| Document Storage | 🔴 Missing | _Planned_ |

### UI Protocol (ObjectUI)
| Protocol | Example | Location |
|----------|---------|----------|
| List Views | ✅ Complete | [CRM](./crm/) - Grid, Kanban, Calendar, Gantt |
| Form Views | ✅ Complete | [CRM](./crm/) - Simple, Tabbed, Wizard |
| Actions | ✅ Complete | [CRM Actions](./crm/src/ui/actions.ts) |
| Dashboards | ✅ Complete | [CRM Dashboards](./crm/src/ui/dashboards.ts) |
| Reports | ✅ Complete | [CRM Reports](./crm/src/ui/reports.ts) |
| Charts | ✅ Complete | [CRM](./crm/), [Plugin BI](./plugin-bi/) |
| Widgets | ✅ Complete | [CRM Dashboards](./crm/src/ui/dashboards.ts) |
| Themes | 🟡 Partial | [Basic](./basic/) |
| Pages | 🟡 Partial | [Basic](./basic/) |
| Components | 🔴 Missing | _Planned_ |

### System Protocol (ObjectOS)
| Protocol | Example | Location |
|----------|---------|----------|
| Manifest | ✅ Complete | All examples with `objectstack.config.ts` |
| Plugin System | ✅ Complete | [Plugin Advanced CRM](./plugin-advanced-crm/), [Host](./host/) |
| Capabilities | ✅ Complete | [Basic Capabilities](./basic/capabilities-example.ts) |
| Logging | ✅ Complete | [Basic Logger](./basic/logger-example.ts) |
| Events | ✅ Complete | [Middleware](./middleware-example.ts) |
| Service Registry | ✅ Complete | [Plugin Advanced CRM](./plugin-advanced-crm/) |
| Datasources | 🟡 Partial | [Basic](./basic/) |
| Job Scheduling | 🔴 Missing | _Planned_ |
| Metrics | 🔴 Missing | _Planned_ |
| Tracing | 🔴 Missing | _Planned_ |
| Object Storage | 🔴 Missing | _Planned_ |
| Search Engine | 🔴 Missing | _Planned_ |
| Message Queue | 🔴 Missing | _Planned_ |
| Cache | 🔴 Missing | _Planned_ |
| Encryption | 🔴 Missing | _Planned_ |
| Compliance | 🔴 Missing | _Planned_ |
| Audit | 🔴 Missing | _Planned_ |

### AI Protocol
| Protocol | Example | Location |
|----------|---------|----------|
| Agent | ✅ Complete | [AI Sales](./ai-sales/), [AI Support](./ai-support/) |
| RAG Pipeline | ✅ Complete | [AI Support](./ai-support/), [Basic RAG](./basic/ai-rag-example.ts) |
| Model Registry | ✅ Complete | [AI Support](./ai-support/) |
| NLQ (Natural Language Query) | ✅ Complete | [AI Analyst](./ai-analyst/) |
| Conversation | ✅ Complete | [AI Sales](./ai-sales/) |
| Orchestration | ✅ Complete | [AI Codegen](./ai-codegen/) |
| Cost Tracking | 🟡 Partial | [AI Examples](./ai-support/) |
| Predictive Analytics | 🔴 Missing | _Planned_ |

### Automation Protocol
| Protocol | Example | Location |
|----------|---------|----------|
| Workflow Rules | ✅ Complete | [CRM](./crm/), [Basic](./basic/automation-example.ts) |
| Flow (Visual) | ✅ Complete | [Basic Automation](./basic/automation-example.ts) |
| Approval Processes | ✅ Complete | [Basic Automation](./basic/automation-example.ts) |
| ETL Pipelines | ✅ Complete | [Basic Automation](./basic/automation-example.ts) |
| Webhooks | 🟡 Partial | [Basic](./basic/) |
| Triggers | ✅ Complete | [CRM](./crm/) |
| Sync | 🔴 Missing | _Planned_ |

### Auth & Permissions
| Protocol | Example | Location |
|----------|---------|----------|
| Identity & Sessions | ✅ Complete | [Basic Auth](./basic/auth-permission-example.ts) |
| Roles & RBAC | ✅ Complete | [Basic Auth](./basic/auth-permission-example.ts) |
| Permissions | ✅ Complete | [Basic Auth](./basic/auth-permission-example.ts), [CRM](./crm/) |
| Row-Level Security (RLS) | ✅ Complete | [Basic Auth](./basic/auth-permission-example.ts) |
| Sharing Rules | ✅ Complete | [Basic Auth](./basic/auth-permission-example.ts) |
| Territory Management | ✅ Complete | [Basic Auth](./basic/auth-permission-example.ts) |
| OAuth/OIDC Config | 🟡 Partial | [Plugin Advanced CRM](./plugin-advanced-crm/) |
| SCIM | 🔴 Missing | _Planned_ |
| Organizations | 🔴 Missing | _Planned_ |

### API Protocol
| Protocol | Example | Location |
|----------|---------|----------|
| REST Server | ✅ Complete | [REST Server](./rest-server-example.ts), [Host](./host/) |
| API Discovery | ✅ Complete | [Basic Discovery](./basic/api-discovery-example.ts) |
| GraphQL | 🟡 Partial | [Basic](./basic/) |
| OData | 🔴 Missing | _Planned_ |
| WebSocket/Realtime | 🔴 Missing | _Planned_ |
| Batch Operations | 🔴 Missing | _Planned_ |
| HTTP Cache | 🔴 Missing | _Planned_ |
| Error Handling | 🟡 Partial | [REST Server](./rest-server-example.ts) |

### Integration Protocol
| Protocol | Example | Location |
|----------|---------|----------|
| Database Connectors | 🟡 Partial | [Plugin Advanced CRM](./plugin-advanced-crm/) |
| File Storage Connectors | 🔴 Missing | _Planned_ |
| Message Queue Connectors | 🔴 Missing | _Planned_ |
| SaaS Connectors | 🔴 Missing | _Planned_ |

### Hub & Marketplace
| Protocol | Example | Location |
|----------|---------|----------|
| Plugin Registry | 🟡 Partial | [Plugin Examples](./plugin-advanced-crm/) |
| Marketplace | 🔴 Missing | _Planned_ |
| Licensing | 🔴 Missing | _Planned_ |
| Composer | 🔴 Missing | _Planned_ |
| Spaces | 🔴 Missing | _Planned_ |
| Multi-tenancy | 🔴 Missing | _Planned_ |

---

## 🚀 Getting Started

### Prerequisites
```bash
# Ensure you have Node.js 18+ and pnpm installed
node --version  # >= 18.0.0
pnpm --version  # >= 8.0.0
```

### Quick Start
```bash
# 1. Clone and install
git clone https://github.com/objectstack-ai/spec.git
cd spec
pnpm install

# 2. Build the spec package
pnpm --filter @objectstack/spec build

# 3. Run any example
npx tsx examples/basic/stack-definition-example.ts

# 4. Or explore a full app
cd examples/crm
pnpm build
```

### Learning Path

#### Path 1: Quick Start (1-2 hours)
1. Read [Todo Example](./todo/) - Understand basic structure
2. Run [Basic Stack Definition](./basic/stack-definition-example.ts) - See patterns
3. Explore [CRM Example](./crm/) - Learn advanced features

#### Path 2: Deep Dive (1-2 days)
1. Complete Path 1
2. Study all [Basic Examples](./basic/) - Master each protocol
3. Build [Plugin Advanced CRM](./plugin-advanced-crm/) - Understand plugins
4. Try [MSW React CRUD](./msw-react-crud/) - Frontend integration

#### Path 3: AI & Advanced (2-3 days)
1. Complete Path 1 & 2
2. Study [AI Support](./ai-support/) - RAG patterns
3. Try [AI Analyst](./ai-analyst/) - NLQ patterns
4. Explore [AI Codegen](./ai-codegen/) - AI orchestration
5. Build [Host Server](./host/) - Production backend

---

## 📝 Example Standards

All examples in this directory follow these standards:

### Code Quality
- ✅ **Type-safe**: All examples use TypeScript and pass `typecheck`
- ✅ **Zod-first**: Schemas defined with Zod, types inferred
- ✅ **Naming conventions**: `camelCase` for config, `snake_case` for data
- ✅ **Documented**: Comprehensive inline comments
- ✅ **Best practices**: Follow ObjectStack conventions

### File Structure
```
example-name/
├── README.md              # Comprehensive documentation
├── package.json           # Package definition
├── tsconfig.json          # TypeScript config
├── objectstack.config.ts  # Main configuration
└── src/                   # Source code
    ├── domains/           # Object definitions
    ├── ui/                # UI components
    └── ...
```

### Documentation Requirements
Each example MUST have:
- Clear purpose statement
- Prerequisites and dependencies
- Quick start instructions
- Protocol coverage explanation
- Key concepts highlighted
- Related examples linked

---

## 🤝 Contributing Examples

Want to add an example? Great! Please ensure:

1. **Follow the standards** above
2. **Fill a gap** in protocol coverage
3. **Add documentation** (README.md)
4. **Test thoroughly** (must compile and run)
5. **Submit PR** with clear description

See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

---

## 📚 Additional Resources

- **[Main Documentation](../content/docs/)** - Complete protocol reference
- **[Architecture Guide](../ARCHITECTURE.md)** - System architecture
- **[Quick Reference](../QUICK-REFERENCE.md)** - Fast lookup
- **[Package Dependencies](../PACKAGE-DEPENDENCIES.md)** - Build order

---

## 📄 License

All examples are licensed under Apache 2.0. See [LICENSE](../LICENSE) for details.

---

**Last Updated:** 2026-01-31  
**Protocol Version:** 0.6.1  
**Total Examples:** 15  
**Protocol Coverage:** 60/108 (56%)
