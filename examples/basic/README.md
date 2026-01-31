# Basic Protocol Examples

A standalone package containing comprehensive examples demonstrating core ObjectStack protocols and features.

## 📦 Package Information

- **Package**: `@objectstack/example-basic`
- **Type**: Demonstration/Reference
- **Status**: Standalone examples with type checking

## 🚀 Usage

### Build and Type Check

```bash
# From monorepo root
pnpm install

# Build the spec package first
pnpm --filter @objectstack/spec build

# Type check the examples
pnpm --filter @objectstack/example-basic typecheck

# Or run directly with tsx
npx tsx examples/basic/stack-definition-example.ts
```

### Running Examples

Each example file can be run independently with `tsx`:

```bash
# Run a specific example
npx tsx examples/basic/ai-rag-example.ts

# Or uncomment the demonstration function calls at the end of each file
```

## 📚 Examples

### Stack Definition
**File:** [`stack-definition-example.ts`](./stack-definition-example.ts)

Demonstrates the `defineStack()` helper for creating comprehensive ObjectStack configurations:
- Minimal stack setup
- Task management application with Objects, UI, and Workflows
- CRM with AI agent integration
- Type-safe configuration patterns

**Key Concepts:**
- Manifest configuration
- Object and Field definitions
- UI components (Apps, Views, Dashboards)
- Automation (Workflows)
- Security (Roles, Permissions)
- AI Agents

### Capabilities Configuration
**File:** [`capabilities-example.ts`](./capabilities-example.ts)

Shows how to define runtime capabilities for ObjectStack instances:
- Production environment with full features
- Development environment with minimal features
- AI-focused environment optimized for RAG
- Capability checking helpers

**Key Concepts:**
- ObjectQL (Data) capabilities
- ObjectUI (UI) capabilities
- ObjectOS (System) capabilities
- Environment-specific configurations

### API Discovery
**File:** [`api-discovery-example.ts`](./api-discovery-example.ts)

Demonstrates the API Discovery protocol for runtime introspection:
- Complete discovery response
- Development mode discovery
- Adaptive client behavior
- AI agent system prompt generation

**Key Concepts:**
- System identity and versioning
- Available API endpoints (REST, GraphQL, OData, WebSocket)
- Runtime capabilities
- Authentication configuration
- Feature flags

### AI & RAG Pipeline
**File:** [`ai-rag-example.ts`](./ai-rag-example.ts)

Shows Retrieval-Augmented Generation (RAG) pipeline configuration:
- Document ingestion and chunking
- Vector embeddings and storage
- Semantic search and retrieval
- Context assembly for LLMs
- AI agent with RAG integration

**Key Concepts:**
- RAG pipeline configuration
- Document processing
- Vector database integration
- Hybrid search (vector + keyword)
- Reranking for better results
- Context template formatting

### Auth & Permissions
**File:** [`auth-permission-example.ts`](./auth-permission-example.ts)

Demonstrates authentication and authorization systems:
- User identity and sessions
- Role-based access control (RBAC) with hierarchy
- Object and field-level permissions
- Row-level security (RLS)
- Sharing rules for data access
- Territory management

**Key Concepts:**
- User authentication and profiles
- Role hierarchy and inheritance
- Permission sets
- Granular access control
- Dynamic data filtering
- Territory-based assignments

### Automation & Workflows
**File:** [`automation-example.ts`](./automation-example.ts)

Shows automation capabilities in ObjectStack:
- Workflow rules for field updates
- Email alerts and notifications
- Automatic record creation
- Multi-step approval processes
- Screen flows with user interaction
- ETL processes for data integration

**Key Concepts:**
- Event-driven automation
- Scheduled workflows (cron)
- Approval hierarchies
- Visual process automation
- Data transformation pipelines
- Error handling and notifications

### Integration Connectors
**File:** [`integration-connectors-example.ts`](./integration-connectors-example.ts)

Demonstrates external system integration connectors:
- Database connectors (PostgreSQL, MySQL, MongoDB)
- File storage connectors (AWS S3, Azure Blob, Local)
- Message queue connectors (RabbitMQ, Kafka, Redis)
- SaaS connectors (Salesforce, HubSpot, Stripe)
- Custom API connectors

**Key Concepts:**
- Connection configuration and authentication
- Schema synchronization
- SSL/TLS security
- Connection pooling
- Rate limiting and retry strategies
- Webhook integration
- ETL pipeline integration

### System Protocols (Advanced)
**File:** [`system-protocols-example.ts`](./system-protocols-example.ts)

Shows advanced system protocols for production applications:
- Job scheduling (Cron, event-triggered, batch jobs)
- Metrics & monitoring (Prometheus, StatsD)
- Distributed tracing (OpenTelemetry, Jaeger)
- Multi-level caching (In-memory, Redis)
- Audit logging with tamper protection
- Compliance controls (GDPR, HIPAA, SOC 2)
- Encryption (at rest and in transit)

**Key Concepts:**
- Background job orchestration
- Observability and monitoring
- Performance optimization through caching
- Compliance and data governance
- Security and encryption
- Distributed systems patterns

## 🎯 Usage

These examples are TypeScript files in a proper package that can be:

1. **Type checked:**
   ```bash
   pnpm --filter @objectstack/example-basic typecheck
   ```

2. **Run directly:**
   ```bash
   npx tsx examples/basic/stack-definition-example.ts
   ```

3. **Used as references:**
   Import types and patterns in your own projects

## 🔗 Related Resources

- **[CRM Example](../crm/)** - Full application using these patterns
- **[Todo Example](../todo/)** - Simple application example
- **[Protocol Reference](../../packages/spec/)** - Complete schema documentation

## 📝 Notes

- All examples use TypeScript for type safety
- Examples import types from `@objectstack/spec`
- Each example is self-contained and documented
- Examples demonstrate real-world patterns, not toy scenarios
