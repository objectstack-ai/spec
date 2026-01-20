# ObjectStack Protocol - Priority Matrix

> Quick reference for what to work on next. See [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) for the complete plan.

**Last Updated**: 2026-01-20

---

## 🔥 Critical Path Items (Must Do Now)

These are blocking the ecosystem and should be addressed immediately.

### 1. Field Widget Contract ⚠️ CRITICAL
**File**: `packages/spec/src/ui/widget.zod.ts`  
**Effort**: 1-2 days  
**Blocks**: Custom field components, plugin UI extensions  
**Dependencies**: None  

**Why Critical**: Third-party developers cannot build custom field components without this contract.

**Definition**:
```typescript
export const FieldWidgetPropsSchema = z.object({
  value: z.any(),
  onChange: z.function(),
  readonly: z.boolean().default(false),
  required: z.boolean().default(false),
  error: z.string().optional(),
  field: FieldSchema,
  record: z.record(z.any()).optional(),
  options: z.record(z.any()).optional(),
});

export type FieldWidgetProps = z.infer<typeof FieldWidgetPropsSchema>;
```

---

### 2. Plugin Lifecycle Interface ⚠️ CRITICAL
**File**: `packages/spec/src/system/plugin.zod.ts`  
**Effort**: 2-3 days  
**Blocks**: Plugin ecosystem, marketplace  
**Dependencies**: None  

**Why Critical**: This is the contract between ObjectOS and all plugins. Without it, plugins cannot be loaded.

**Definition**:
```typescript
export const PluginContextSchema = z.object({
  ql: z.any().describe('ObjectQL data access API'),
  os: z.any().describe('ObjectOS system API'),
  logger: z.any().describe('Logging interface'),
  metadata: z.any().describe('Metadata registry'),
  events: z.any().describe('Event bus'),
});

export const PluginLifecycleSchema = z.object({
  onInstall: z.function().optional(),
  onEnable: z.function().optional(),
  onDisable: z.function().optional(),
  onUninstall: z.function().optional(),
  onUpgrade: z.function().optional(),
});
```

---

### 3. Driver Interface ⚠️ CRITICAL
**File**: `packages/spec/src/system/driver.zod.ts`  
**Effort**: 3-4 days  
**Blocks**: Multi-database support, data virtualization  
**Dependencies**: None  

**Why Critical**: This enables ObjectQL to work with any database through a unified interface.

**Definition**:
```typescript
export const DriverInterfaceSchema = z.object({
  name: z.string(),
  version: z.string(),
  
  // CRUD
  find: z.function(),
  findOne: z.function(),
  create: z.function(),
  update: z.function(),
  delete: z.function(),
  bulkCreate: z.function(),
  bulkUpdate: z.function(),
  bulkDelete: z.function(),
  
  // DDL
  syncSchema: z.function(),
  dropTable: z.function(),
  
  // Transaction
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

---

### 4. Trigger Context Protocol 🟡 HIGH
**File**: `packages/spec/src/data/trigger.zod.ts`  
**Effort**: 1-2 days  
**Blocks**: Business logic, trigger code generation  
**Dependencies**: None  

**Why Important**: Standardizes how trigger code is written, enabling AI code generation.

**Definition**:
```typescript
export const TriggerContextSchema = z.object({
  action: z.enum(['insert', 'update', 'delete']),
  timing: z.enum(['before', 'after']),
  doc: z.record(z.any()),
  previousDoc: z.record(z.any()).optional(),
  userId: z.string(),
  user: z.record(z.any()),
  ql: z.any(),
  logger: z.any(),
  addError: z.function(),
  getOldValue: z.function(),
});
```

---

## 📊 High Priority Features (Do Next)

### Query Enhancements
**Files**: `packages/spec/src/data/query.zod.ts`  
**Effort**: 3-5 days  
**Value**: Enables complex analytics and reporting  

**Features**:
- Aggregation (GROUP BY, HAVING)
- Joins (INNER, LEFT, RIGHT)
- Subqueries
- Window functions

---

### Advanced Validation
**Files**: `packages/spec/src/data/validation.zod.ts`  
**Effort**: 2-3 days  
**Value**: Richer data quality controls  

**Features**:
- Cross-field validation ("end_date > start_date")
- Async validation (remote uniqueness checks)
- Custom validator functions
- Conditional rules

---

### Theme Configuration
**Files**: `packages/spec/src/ui/theme.zod.ts` (new)  
**Effort**: 2-3 days  
**Value**: Brand customization for customers  

**Features**:
- Color palettes
- Typography settings
- Spacing units
- Border radius, shadows

---

### Enhanced Field Types
**Files**: `packages/spec/src/data/field.zod.ts`  
**Effort**: 2-3 days  
**Value**: More rich UI components  

**New Types**:
- `location` (GPS coordinates)
- `address` (structured)
- `richtext` (WYSIWYG)
- `code` (syntax highlighting)
- `color` (color picker)
- `rating` (stars)
- `signature` (digital signature)

---

## 🧪 Developer Experience Priorities

### Test Coverage Improvement
**Files**: All `*.test.ts` files  
**Current**: ~40% coverage  
**Target**: 80%+ coverage  
**Effort**: 1 week  

**Focus Areas**:
- Edge case validation
- Error handling
- Schema composition
- Type inference

---

### Documentation Generation
**Effort**: 3-5 days  
**Value**: Better developer onboarding  

**Deliverables**:
- Auto-generated API docs from Zod schemas
- Interactive examples for each schema
- Code snippets in TypeScript, JavaScript, JSON
- Visual diagrams for complex schemas

---

### Mock Data Generator
**Files**: `packages/spec/src/testing/` (new)  
**Effort**: 2-3 days  
**Value**: Easier testing for consumers  

**Features**:
- Generate fake data matching schema
- Faker.js integration
- Seed data for examples

---

## 📦 Platform Completeness

### Plugin Marketplace Schema
**Files**: `packages/spec/src/system/marketplace.zod.ts` (new)  
**Effort**: 2-3 days  
**Blocks**: App store, discovery  

**Features**:
- Listing metadata
- Screenshots, ratings
- Pricing models
- Compatibility matrix

---

### Multi-tenancy Protocol
**Files**: `packages/spec/src/system/tenant.zod.ts` (new)  
**Effort**: 3-5 days  
**Blocks**: SaaS deployments  

**Features**:
- Tenant isolation strategies
- Shared vs isolated schemas
- Tenant-specific customizations

---

### Real-time Sync Protocol
**Files**: `packages/spec/src/system/realtime.zod.ts` (new)  
**Effort**: 3-4 days  
**Value**: Live collaboration  

**Features**:
- WebSocket event schema
- Presence detection
- Optimistic updates
- Conflict resolution

---

## 🔐 Enterprise Readiness

### Field-Level Encryption
**Files**: `packages/spec/src/data/field.zod.ts` (enhance)  
**Effort**: 2-3 days  
**Value**: Compliance (HIPAA, PCI)  

**Features**:
- Mark fields as encrypted
- Key rotation policies
- Searchable encryption config

---

### Compliance Framework
**Files**: `packages/spec/src/system/compliance.zod.ts` (new)  
**Effort**: 5-7 days  
**Value**: Enterprise sales  

**Features**:
- GDPR consent tracking
- HIPAA audit trails
- SOC2 compliance checks
- Data residency rules

---

### Data Retention Policy
**Files**: `packages/spec/src/system/retention.zod.ts` (new)  
**Effort**: 2-3 days  
**Value**: Legal compliance  

**Features**:
- Archival rules by object
- Purge schedules
- Legal hold configuration

---

## 🤖 AI & Intelligence

### AI Model Registry
**Files**: `packages/spec/src/ai/model.zod.ts` (new)  
**Effort**: 3-4 days  
**Value**: Pluggable AI models  

**Features**:
- LLM configuration (OpenAI, Anthropic, local)
- Prompt template management
- Token usage tracking
- Model versioning

---

### RAG Pipeline Schema
**Files**: `packages/spec/src/ai/rag.zod.ts` (new)  
**Effort**: 4-5 days  
**Value**: Context-aware AI  

**Features**:
- Vector DB configuration
- Embedding model selection
- Chunk size, overlap settings
- Retrieval strategy

---

### Natural Language Query
**Files**: `packages/spec/src/ai/nlq.zod.ts` (new)  
**Effort**: 5-7 days  
**Value**: End-user empowerment  

**Features**:
- NLQ to AST transformation rules
- Intent classification
- Entity extraction
- Query refinement

---

## 📅 Sprint Planning Guide

### Sprint 1-2 (Weeks 1-4): Critical Path
- [ ] Field Widget Contract
- [ ] Plugin Lifecycle Interface
- [ ] Driver Interface
- [ ] Trigger Context Protocol
- [ ] Tests for all above
- [ ] Documentation updates

**Goal**: Unblock plugin ecosystem and custom UI development.

---

### Sprint 3-4 (Weeks 5-8): Query & Validation
- [ ] Query aggregation support
- [ ] Query join support
- [ ] Cross-field validation
- [ ] Async validation
- [ ] Enhanced field types (5-10 new types)
- [ ] Comprehensive examples

**Goal**: Enable complex analytics and richer data validation.

---

### Sprint 5-6 (Weeks 9-12): Developer Experience
- [ ] Test coverage to 80%+
- [ ] Mock data generator
- [ ] Interactive documentation
- [ ] OpenAPI/GraphQL schema generation
- [ ] Code examples for every schema
- [ ] Video tutorials (3-5 videos)

**Goal**: Make ObjectStack easy to learn and use.

---

### Sprint 7-8 (Weeks 13-16): Platform Features
- [ ] Plugin marketplace schema
- [ ] Multi-tenancy protocol
- [ ] Real-time sync protocol
- [ ] Theme configuration
- [ ] Notification protocol
- [ ] Attachment protocol

**Goal**: Platform completeness for production deployments.

---

### Sprint 9-10 (Weeks 17-20): Enterprise Readiness
- [ ] Field-level encryption
- [ ] Compliance framework (GDPR, HIPAA)
- [ ] Data retention policy
- [ ] Audit log enhancements
- [ ] Performance monitoring schema
- [ ] Disaster recovery protocol

**Goal**: Enterprise sales readiness.

---

### Sprint 11-12 (Weeks 21-24): AI & Intelligence
- [ ] AI model registry
- [ ] RAG pipeline schema
- [ ] Natural language query
- [ ] AI workflow automation
- [ ] Recommendation engine
- [ ] Predictive analytics

**Goal**: Position as the most AI-friendly platform.

---

## 🎯 Quarterly Goals

### Q1 2026: Foundation Complete
- ✅ All P0 protocols implemented and tested
- ✅ 80%+ test coverage
- ✅ Basic plugin ecosystem functional
- ✅ Driver interface allows multi-database

### Q2 2026: Platform Maturity
- ✅ Advanced query capabilities (joins, aggregations)
- ✅ Multi-tenancy support
- ✅ Real-time sync
- ✅ 20+ plugins in ecosystem
- ✅ Comprehensive documentation

### Q3 2026: Enterprise Ready
- ✅ Compliance framework (GDPR, HIPAA, SOC2)
- ✅ Advanced security features
- ✅ Performance optimization
- ✅ First enterprise customer deployment
- ✅ 50+ plugins in marketplace

### Q4 2026: AI Leadership
- ✅ AI model registry
- ✅ RAG pipeline
- ✅ Natural language query
- ✅ AI-generated applications
- ✅ 100+ plugins in marketplace

---

## 📈 Success Metrics

| Metric | Current | Q1 Target | Q2 Target | Q3 Target | Q4 Target |
|--------|---------|-----------|-----------|-----------|-----------|
| **Protocol Completeness** | 60% | 85% | 95% | 98% | 100% |
| **Test Coverage** | 40% | 80% | 85% | 90% | 95% |
| **Documentation Pages** | 50 | 100 | 150 | 200 | 250 |
| **Community Plugins** | 0 | 5 | 20 | 50 | 100 |
| **Example Apps** | 2 | 5 | 10 | 15 | 20 |
| **GitHub Stars** | - | 100 | 500 | 1000 | 2500 |
| **Monthly NPM Downloads** | - | 100 | 500 | 2000 | 5000 |

---

## 🤝 How to Contribute

### Pick an Item
1. Choose an item from this priority list
2. Check [Issues](https://github.com/objectstack-ai/spec/issues) to see if someone is already working on it
3. Comment on the issue or create a new one to claim it

### Development Process
1. Fork the repository
2. Create a branch: `git checkout -b feature/widget-contract`
3. Implement the Zod schema in `packages/spec/src/`
4. Write comprehensive tests in `*.test.ts`
5. Update documentation
6. Run `pnpm build` to generate JSON schemas
7. Submit a pull request

### PR Checklist
- [ ] Zod schema follows naming conventions (camelCase for config, snake_case for identifiers)
- [ ] Comprehensive JSDoc comments with `@description`
- [ ] Unit tests with 80%+ coverage
- [ ] Documentation with examples
- [ ] JSON schema generated successfully
- [ ] All existing tests pass

---

**Questions?** Open a [GitHub Discussion](https://github.com/objectstack-ai/spec/discussions)  
**Bugs?** Open a [GitHub Issue](https://github.com/objectstack-ai/spec/issues)  
**Feature Requests?** Use the `protocol-proposal` label
