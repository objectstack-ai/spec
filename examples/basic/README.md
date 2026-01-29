# Basic Protocol Examples

This directory contains standalone examples demonstrating core ObjectStack protocols and features.

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

## 🎯 Usage

These examples are TypeScript files that can be:

1. **Imported as references:**
   ```typescript
   import { taskManagementStack } from './examples/basic/stack-definition-example';
   ```

2. **Run directly (if configured):**
   ```bash
   tsx examples/basic/stack-definition-example.ts
   ```

3. **Used as templates:**
   Copy and modify for your own projects

## 🔗 Related Resources

- **[CRM Example](../crm/)** - Full application using these patterns
- **[Todo Example](../todo/)** - Simple application example
- **[Protocol Reference](../../packages/spec/)** - Complete schema documentation

## 📝 Notes

- All examples use TypeScript for type safety
- Examples import types from `@objectstack/spec`
- Each example is self-contained and documented
- Examples demonstrate real-world patterns, not toy scenarios
