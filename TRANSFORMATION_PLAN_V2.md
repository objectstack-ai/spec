# ObjectStack Protocol Transformation Plan
# 协议改造计划

**Plan Version / 计划版本**: 2.0  
**Created / 制定日期**: 2026-01-29  
**Updated / 更新日期**: 2026-01-30  
**Implementation Cycle / 实施周期**: 12 Months / 12个月  
**Objective / 目标**: Define comprehensive protocol specifications for enterprise software ecosystem

---

## 🏗️ Architecture Principles / 架构原则

### Repository Scope / 仓库职责

**This Repository (`objectstack-ai/spec`) - Protocol Definitions Only**  
**本仓库 (`objectstack-ai/spec`) - 仅协议定义**

✅ **What belongs in this repo / 属于本仓库的内容:**
- Zod Schema definitions (runtime validation)
- TypeScript type definitions (derived from Zod)
- JSON Schema generation (for IDE support)
- Protocol documentation and specifications
- Interface contracts and API definitions
- Version management and compatibility rules

❌ **What does NOT belong in this repo / 不属于本仓库的内容:**
- Actual driver implementations (PostgreSQL, MySQL, MongoDB, etc.)
- Connector implementations (Salesforce, Slack, etc.)
- Business logic and runtime engines
- Plugin code with actual functionality
- Database-specific query builders
- HTTP clients and server implementations

### Implementation Strategy / 实现策略

```
┌─────────────────────────────────────────────────────────┐
│  📜 Protocol Layer (THIS REPO)                          │
│  objectstack-ai/spec                                    │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Zod Schemas + TypeScript Types + JSON Schemas   │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↓ imports
┌─────────────────────────────────────────────────────────┐
│  🔌 Implementation Layer (SEPARATE REPOS)               │
│                                                          │
│  objectstack-ai/driver-postgres                         │
│  objectstack-ai/driver-mysql                            │
│  objectstack-ai/driver-mongodb                          │
│  objectstack-ai/connector-salesforce                    │
│  objectstack-ai/plugin-encryption                       │
│  objectstack-ai/template-crm                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Transformation Objectives / 改造目标

### Vision / 愿景

Become the **Universal Protocol Standard** for enterprise software in the **Post-SaaS Era**  
成为**后SaaS时代**企业软件的**通用协议标准**

### Quantitative Goals (for Spec Repo) / 量化目标（针对规范仓库）

| Dimension / 维度 | Current / 当前 | Target / 目标 |
|---|:---:|:---:|
| **Protocol Coverage / 协议覆盖率** | 71 files | 90+ files |
| **Missing Critical Protocols / 缺失关键协议** | 9+ gaps | 0 gaps |
| **Test Coverage / 测试覆盖率** | 72% | 95% |
| **Documentation Completeness / 文档完整性** | 80% | 95% |
| **JSON Schema Generation / JSON Schema生成** | Manual | Automated |
| **Version Management / 版本管理** | Basic | Semantic |

---

## 📅 Four-Phase Implementation Plan / 四阶段实施计划

---

## 🏗️ Phase 1: Core Protocol Completion (Q1 2026)
## 阶段1：核心协议完善

**Timeline / 时间线**: 3 Months / 3个月  
**Focus / 重点**: Complete missing database, security, and caching protocols

### 1.1 Database Driver Protocols / 数据库驱动协议

#### In THIS Repo (Spec Definitions) / 在本仓库（规范定义）

**Enhance Driver Interface Protocol**
- [ ] Update `packages/spec/src/system/driver.zod.ts`
  - [ ] Add transaction isolation level capabilities
  - [ ] Add full-text search capability flags
  - [ ] Add JSON/JSONB query capability flags
  - [ ] Add recursive query (CTE) capability flags
  - [ ] Add streaming result capability flags
  - [ ] Add connection pooling configuration schema
  - [ ] Add migration/schema sync protocol

**Define SQL Driver Protocol**
- [ ] Create `packages/spec/src/system/driver-sql.zod.ts`
  - [ ] SQL dialect enum (PostgreSQL, MySQL, SQLite, MSSQL)
  - [ ] Data type mapping schema
  - [ ] Index type schema (btree, hash, gin, gist, fulltext)
  - [ ] Transaction configuration schema
  - [ ] Connection pool configuration schema
  - [ ] Prepared statement configuration schema

**Define NoSQL Driver Protocol**
- [ ] Create `packages/spec/src/system/driver-nosql.zod.ts`
  - [ ] NoSQL type enum (Document, Key-Value, Column, Graph)
  - [ ] Aggregation pipeline schema (for MongoDB-like databases)
  - [ ] Embedded document schema
  - [ ] Array query schema
  - [ ] Geospatial query schema

**Define Cache Driver Protocol**
- [ ] Create `packages/spec/src/system/driver-cache.zod.ts`
  - [ ] Cache strategy enum (LRU, LFU, FIFO)
  - [ ] TTL configuration schema
  - [ ] Eviction policy schema
  - [ ] Cache invalidation strategy schema
  - [ ] Pub/Sub capability schema

#### In SEPARATE Repos (Implementations) / 在独立仓库（实现）

**Reference Implementation Repositories** (to be created separately):
- 🔌 `objectstack-ai/driver-postgres` - PostgreSQL driver implementation
- 🔌 `objectstack-ai/driver-mysql` - MySQL driver implementation
- 🔌 `objectstack-ai/driver-mongodb` - MongoDB driver implementation
- 🔌 `objectstack-ai/driver-redis` - Redis driver implementation
- 🔌 `objectstack-ai/driver-sqlite` - SQLite driver implementation

---

### 1.2 Security & Encryption Protocols / 安全与加密协议

#### In THIS Repo (Spec Definitions) / 在本仓库（规范定义）

**Field-Level Encryption Protocol**
- [ ] Create `packages/spec/src/system/encryption.zod.ts`
  - [ ] Encryption algorithm enum (AES-256-GCM, AES-256-CBC, ChaCha20-Poly1305)
  - [ ] Key management provider schema (AWS KMS, Azure Key Vault, GCP KMS, HashiCorp Vault)
  - [ ] Key rotation policy schema
  - [ ] Encryption scope enum (field, record, table, database)
  - [ ] Deterministic encryption configuration
  - [ ] Searchable encryption configuration

**Data Masking Protocol**
- [ ] Create `packages/spec/src/system/masking.zod.ts`
  - [ ] Masking strategy enum (redact, partial, hash, tokenize, randomize, nullify)
  - [ ] Masking rule schema
  - [ ] Pattern-based masking configuration
  - [ ] Role-based masking configuration

**Compliance Protocol**
- [ ] Create `packages/spec/src/system/compliance.zod.ts`
  - [ ] GDPR configuration schema
  - [ ] CCPA configuration schema
  - [ ] HIPAA configuration schema
  - [ ] SOX configuration schema
  - [ ] PCI-DSS configuration schema
  - [ ] Audit log configuration schema
  - [ ] Data retention policy schema

**Row-Level Security Protocol**
- [ ] Enhance `packages/spec/src/auth/permission.zod.ts`
  - [ ] Add row-level security rule schema
  - [ ] Add dynamic filter configuration
  - [ ] Add context-based access control

#### In SEPARATE Repos (Implementations) / 在独立仓库（实现）

**Reference Implementation Repositories**:
- 🔌 `objectstack-ai/plugin-encryption` - Encryption service implementation
- 🔌 `objectstack-ai/plugin-masking` - Data masking implementation
- 🔌 `objectstack-ai/plugin-compliance` - Compliance toolkit implementation

---

### 1.3 Multi-Tenancy Protocol / 多租户协议

#### In THIS Repo (Spec Definitions) / 在本仓库（规范定义）

**Tenant Isolation Protocol**
- [ ] Create `packages/spec/src/system/multi-tenancy.zod.ts`
  - [ ] Tenancy strategy enum (shared, isolated, hybrid)
  - [ ] Tenant identification schema
  - [ ] Tenant context propagation schema
  - [ ] Cross-tenant access control schema
  - [ ] Tenant-specific configuration schema

**Enhance Object Protocol for Multi-Tenancy**
- [ ] Update `packages/spec/src/data/object.zod.ts`
  - [ ] Add tenancy configuration field
  - [ ] Add tenant field specification
  - [ ] Add tenant isolation rules

#### In SEPARATE Repos (Implementations) / 在独立仓库（实现）

**Reference Implementation Repositories**:
- 🔌 `objectstack-ai/plugin-multitenancy` - Multi-tenancy middleware

---

## 🚀 Phase 2: API & Integration Protocols (Q2 2026)
## 阶段2：API与集成协议

**Timeline / 时间线**: 3 Months / 3个月  
**Focus / 重点**: GraphQL, WebSocket, and connector protocols

### 2.1 GraphQL Protocol / GraphQL协议

#### In THIS Repo (Spec Definitions) / 在本仓库（规范定义）

**GraphQL Schema Generation Protocol**
- [ ] Create `packages/spec/src/api/graphql.zod.ts`
  - [ ] GraphQL type mapping from ObjectQL
  - [ ] Query generation configuration
  - [ ] Mutation generation configuration
  - [ ] Subscription configuration
  - [ ] Resolver configuration schema
  - [ ] DataLoader configuration schema
  - [ ] GraphQL directive schema

**GraphQL Security Protocol**
- [ ] Add to `packages/spec/src/api/graphql.zod.ts`
  - [ ] Query depth limiting schema
  - [ ] Query complexity calculation schema
  - [ ] Rate limiting configuration
  - [ ] Persisted query configuration

#### In SEPARATE Repos (Implementations) / 在独立仓库（实现）

**Reference Implementation Repositories**:
- 🔌 `objectstack-ai/api-graphql` - GraphQL schema generator & resolver

---

### 2.2 Real-Time Protocol / 实时通信协议

#### In THIS Repo (Spec Definitions) / 在本仓库（规范定义）

**WebSocket Event Protocol**
- [ ] Enhance `packages/spec/src/api/websocket.zod.ts`
  - [ ] Event subscription schema
  - [ ] Event filtering schema
  - [ ] Presence tracking schema
  - [ ] Collaborative editing protocol

**Real-Time Collaboration Protocol**
- [ ] Create `packages/spec/src/system/collaboration.zod.ts`
  - [ ] Operational transformation schema
  - [ ] CRDT (Conflict-free Replicated Data Type) schema
  - [ ] Cursor sharing schema
  - [ ] Awareness state schema

#### In SEPARATE Repos (Implementations) / 在独立仓库（实现）

**Reference Implementation Repositories**:
- 🔌 `objectstack-ai/plugin-realtime` - WebSocket server implementation
- 🔌 `objectstack-ai/plugin-collaboration` - Real-time collaboration engine

---

### 2.3 Connector Protocols / 连接器协议

#### In THIS Repo (Spec Definitions) / 在本仓库（规范定义）

**External System Connector Protocol**
- [ ] Enhance `packages/spec/src/system/connector.zod.ts`
  - [ ] Authentication method schema (OAuth2, API Key, JWT, SAML)
  - [ ] Data synchronization configuration
  - [ ] Field mapping schema
  - [ ] Webhook configuration schema
  - [ ] Rate limiting and retry configuration

**Specific Connector Templates**
- [ ] Create connector protocol templates
  - [ ] SaaS connector protocol template
  - [ ] Database connector protocol template
  - [ ] File storage connector protocol template
  - [ ] Message queue connector protocol template

#### In SEPARATE Repos (Implementations) / 在独立仓库（实现）

**Reference Implementation Repositories**:
- 🔌 `objectstack-ai/connector-salesforce` - Salesforce connector
- 🔌 `objectstack-ai/connector-slack` - Slack connector
- 🔌 `objectstack-ai/connector-github` - GitHub connector
- 🔌 `objectstack-ai/connector-google-workspace` - Google Workspace connector

---

## 🧠 Phase 3: Advanced Feature Protocols (Q3 2026)
## 阶段3：高级功能协议

**Timeline / 时间线**: 3 Months / 3个月  
**Focus / 重点**: AI, Search, and Observability protocols

### 3.1 Enhanced AI Protocols / 增强AI协议

#### In THIS Repo (Spec Definitions) / 在本仓库（规范定义）

**AI Model Registry Protocol**
- [ ] Create `packages/spec/src/ai/model-registry.zod.ts`
  - [ ] Model metadata schema
  - [ ] Model versioning schema
  - [ ] Model deployment configuration
  - [ ] Model performance metrics schema

**AI Fine-Tuning Protocol**
- [ ] Create `packages/spec/src/ai/fine-tuning.zod.ts`
  - [ ] Training data schema
  - [ ] Fine-tuning configuration
  - [ ] Hyperparameter schema
  - [ ] Evaluation metrics schema

**Vector Database Protocol**
- [ ] Create `packages/spec/src/system/vector-db.zod.ts`
  - [ ] Embedding configuration schema
  - [ ] Similarity search configuration
  - [ ] Index type enum (HNSW, IVF, Flat)
  - [ ] Distance metric enum (cosine, euclidean, dot product)

#### In SEPARATE Repos (Implementations) / 在独立仓库（实现）

**Reference Implementation Repositories**:
- 🔌 `objectstack-ai/plugin-vector-search` - Vector search implementation
- 🔌 `objectstack-ai/plugin-fine-tuning` - Model fine-tuning service

---

### 3.2 Search Engine Protocol / 搜索引擎协议

#### In THIS Repo (Spec Definitions) / 在本仓库（规范定义）

**Full-Text Search Protocol**
- [ ] Create `packages/spec/src/system/search-engine.zod.ts`
  - [ ] Search index configuration schema
  - [ ] Tokenizer configuration schema
  - [ ] Analyzer configuration schema (language-specific)
  - [ ] Relevance scoring configuration
  - [ ] Faceted search configuration
  - [ ] Autocomplete/suggestion configuration

**Search Provider Integration Protocol**
- [ ] Add to `packages/spec/src/system/search-engine.zod.ts`
  - [ ] Elasticsearch configuration schema
  - [ ] Algolia configuration schema
  - [ ] Meilisearch configuration schema
  - [ ] Typesense configuration schema

#### In SEPARATE Repos (Implementations) / 在独立仓库（实现）

**Reference Implementation Repositories**:
- 🔌 `objectstack-ai/plugin-elasticsearch` - Elasticsearch integration
- 🔌 `objectstack-ai/plugin-algolia` - Algolia integration

---

### 3.3 Observability Protocol / 可观测性协议

#### In THIS Repo (Spec Definitions) / 在本仓库（规范定义）

**Logging Protocol**
- [ ] Create `packages/spec/src/system/logging.zod.ts`
  - [ ] Log level enum
  - [ ] Structured log schema
  - [ ] Log enrichment configuration
  - [ ] Log destination configuration (file, console, external service)

**Metrics Protocol**
- [ ] Create `packages/spec/src/system/metrics.zod.ts`
  - [ ] Metric type enum (counter, gauge, histogram, summary)
  - [ ] Metric aggregation configuration
  - [ ] Time-series data schema
  - [ ] Performance SLI/SLO schema

**Tracing Protocol**
- [ ] Create `packages/spec/src/system/tracing.zod.ts`
  - [ ] Trace context propagation schema
  - [ ] Span schema
  - [ ] Trace sampling configuration
  - [ ] OpenTelemetry compatibility schema

#### In SEPARATE Repos (Implementations) / 在独立仓库（实现）

**Reference Implementation Repositories**:
- 🔌 `objectstack-ai/plugin-observability` - Observability toolkit
- 🔌 `objectstack-ai/plugin-prometheus` - Prometheus metrics exporter
- 🔌 `objectstack-ai/plugin-opentelemetry` - OpenTelemetry integration

---

## 🌐 Phase 4: Ecosystem & Storage Protocols (Q4 2026)
## 阶段4：生态系统与存储协议

**Timeline / 时间线**: 3 Months / 3个月  
**Focus / 重点**: Storage, messaging, and specialized database protocols

### 4.1 Object Storage Protocol / 对象存储协议

#### In THIS Repo (Spec Definitions) / 在本仓库（规范定义）

**Object Storage Protocol**
- [ ] Create `packages/spec/src/system/object-storage.zod.ts`
  - [ ] Storage provider enum (S3, Azure Blob, GCS, MinIO)
  - [ ] Bucket configuration schema
  - [ ] Object metadata schema
  - [ ] Access control schema
  - [ ] Lifecycle policy schema
  - [ ] Presigned URL configuration
  - [ ] Multipart upload configuration

**File Attachment Protocol**
- [ ] Enhance `packages/spec/src/data/field.zod.ts`
  - [ ] Add file/attachment field configuration
  - [ ] Add file size limits
  - [ ] Add allowed file types
  - [ ] Add virus scanning configuration

#### In SEPARATE Repos (Implementations) / 在独立仓库（实现）

**Reference Implementation Repositories**:
- 🔌 `objectstack-ai/plugin-s3` - AWS S3 integration
- 🔌 `objectstack-ai/plugin-azure-blob` - Azure Blob Storage integration
- 🔌 `objectstack-ai/plugin-minio` - MinIO integration

---

### 4.2 Message Queue Protocol / 消息队列协议

#### In THIS Repo (Spec Definitions) / 在本仓库（规范定义）

**Message Queue Protocol**
- [ ] Create `packages/spec/src/system/message-queue.zod.ts`
  - [ ] Queue provider enum (Kafka, RabbitMQ, AWS SQS, Redis Pub/Sub)
  - [ ] Topic/queue configuration schema
  - [ ] Message schema
  - [ ] Consumer group configuration
  - [ ] Dead letter queue configuration
  - [ ] Message retention policy

**Event Streaming Protocol**
- [ ] Create `packages/spec/src/system/event-streaming.zod.ts`
  - [ ] Event schema
  - [ ] Stream partition configuration
  - [ ] Stream consumer configuration
  - [ ] Event sourcing configuration

#### In SEPARATE Repos (Implementations) / 在独立仓库（实现）

**Reference Implementation Repositories**:
- 🔌 `objectstack-ai/plugin-kafka` - Apache Kafka integration
- 🔌 `objectstack-ai/plugin-rabbitmq` - RabbitMQ integration

---

### 4.3 Specialized Database Protocols / 专用数据库协议

#### In THIS Repo (Spec Definitions) / 在本仓库（规范定义）

**Time-Series Database Protocol**
- [ ] Create `packages/spec/src/system/time-series.zod.ts`
  - [ ] Time-series data point schema
  - [ ] Retention policy schema
  - [ ] Downsampling configuration
  - [ ] Continuous query configuration
  - [ ] Time-based aggregation schema

**Graph Database Protocol**
- [ ] Create `packages/spec/src/system/graph-database.zod.ts`
  - [ ] Node schema
  - [ ] Edge/relationship schema
  - [ ] Graph traversal query schema
  - [ ] Path finding configuration
  - [ ] Graph algorithm configuration

**Data Warehouse Protocol**
- [ ] Create `packages/spec/src/system/data-warehouse.zod.ts`
  - [ ] Dimension table schema
  - [ ] Fact table schema
  - [ ] Star schema configuration
  - [ ] Snowflake schema configuration
  - [ ] ETL pipeline configuration
  - [ ] Data mart configuration

#### In SEPARATE Repos (Implementations) / 在独立仓库（实现）

**Reference Implementation Repositories**:
- 🔌 `objectstack-ai/plugin-influxdb` - InfluxDB integration
- 🔌 `objectstack-ai/plugin-neo4j` - Neo4j integration
- 🔌 `objectstack-ai/plugin-snowflake` - Snowflake integration

---

## 📊 Success Metrics / 成功指标

### For Spec Repository / 规范仓库指标

| Metric / 指标 | Baseline / 基准 | Q1 Target | Q2 Target | Q3 Target | Q4 Target |
|---|:---:|:---:|:---:|:---:|:---:|
| **Total Protocol Files** | 71 | 80 | 85 | 88 | 92 |
| **Missing Critical Protocols** | 9 | 5 | 2 | 1 | 0 |
| **Schema Test Coverage** | 72% | 80% | 85% | 90% | 95% |
| **Documentation Coverage** | 80% | 85% | 90% | 92% | 95% |
| **JSON Schema Automation** | Manual | 50% | 80% | 95% | 100% |

### For Ecosystem / 生态系统指标

| Metric / 指标 | Baseline / 基准 | Q1 Target | Q2 Target | Q3 Target | Q4 Target |
|---|:---:|:---:|:---:|:---:|:---:|
| **Driver Implementations** | 1 | 5 | 8 | 10 | 12 |
| **Connector Implementations** | 0 | 2 | 5 | 8 | 12 |
| **Plugin Implementations** | 3 | 6 | 10 | 15 | 20 |
| **Community Stars** | ~10 | 100 | 300 | 600 | 1000 |
| **Production Deployments** | 0 | 2 | 5 | 12 | 20 |

---

## 🎯 Key Deliverables Summary / 关键交付物总结

### In THIS Spec Repository / 在本规范仓库

**New Protocol Files (21 files)**:
1. `packages/spec/src/system/driver-sql.zod.ts`
2. `packages/spec/src/system/driver-nosql.zod.ts`
3. `packages/spec/src/system/driver-cache.zod.ts`
4. `packages/spec/src/system/encryption.zod.ts`
5. `packages/spec/src/system/masking.zod.ts`
6. `packages/spec/src/system/compliance.zod.ts`
7. `packages/spec/src/system/multi-tenancy.zod.ts`
8. `packages/spec/src/api/graphql.zod.ts`
9. `packages/spec/src/system/collaboration.zod.ts`
10. `packages/spec/src/ai/model-registry.zod.ts`
11. `packages/spec/src/ai/fine-tuning.zod.ts`
12. `packages/spec/src/system/vector-db.zod.ts`
13. `packages/spec/src/system/search-engine.zod.ts`
14. `packages/spec/src/system/logging.zod.ts`
15. `packages/spec/src/system/metrics.zod.ts`
16. `packages/spec/src/system/tracing.zod.ts`
17. `packages/spec/src/system/object-storage.zod.ts`
18. `packages/spec/src/system/message-queue.zod.ts`
19. `packages/spec/src/system/event-streaming.zod.ts`
20. `packages/spec/src/system/time-series.zod.ts`
21. `packages/spec/src/system/graph-database.zod.ts`
22. `packages/spec/src/system/data-warehouse.zod.ts`

**Enhanced Protocol Files (10 files)**:
1. `packages/spec/src/system/driver.zod.ts` (enhanced capabilities)
2. `packages/spec/src/data/field.zod.ts` (encryption, masking, file attachments)
3. `packages/spec/src/data/object.zod.ts` (multi-tenancy, partitioning, indexes)
4. `packages/spec/src/auth/permission.zod.ts` (row-level security)
5. `packages/spec/src/api/websocket.zod.ts` (enhanced real-time)
6. `packages/spec/src/system/connector.zod.ts` (enhanced authentication)

**Documentation & Tooling**:
1. Protocol reference documentation for all new schemas
2. JSON Schema auto-generation scripts
3. Protocol compliance testing framework
4. Migration guides for protocol updates
5. Best practices guides for implementers

### In SEPARATE Repositories / 在独立仓库

**Driver Implementations** (12 repos):
- PostgreSQL, MySQL, MongoDB, Redis, SQLite, MariaDB
- InfluxDB, Neo4j, Snowflake, TimescaleDB, CockroachDB, Cassandra

**Connector Implementations** (12 repos):
- Salesforce, Slack, GitHub, Google Workspace
- Microsoft 365, Zendesk, HubSpot, Stripe
- Shopify, QuickBooks, SAP, Oracle

**Plugin Implementations** (20 repos):
- Encryption, Masking, Compliance, Multi-tenancy
- Real-time, Collaboration, Vector Search, Fine-tuning
- Elasticsearch, Algolia, Observability, Prometheus
- OpenTelemetry, S3, Azure Blob, MinIO
- Kafka, RabbitMQ, Event Streaming, Data Warehouse

---

## 📚 Resources & References / 资源与参考

### Protocol Standards / 协议标准
- JSON Schema: https://json-schema.org/
- Zod: https://zod.dev/
- OpenAPI: https://www.openapis.org/
- GraphQL: https://graphql.org/
- OpenTelemetry: https://opentelemetry.io/

### Benchmarks / 对标
- Salesforce Platform Events: https://developer.salesforce.com/docs/atlas.en-us.platform_events.meta
- ServiceNow Integration Hub: https://docs.servicenow.com/
- Hasura GraphQL Engine: https://hasura.io/
- Prisma Schema: https://www.prisma.io/docs/concepts/components/prisma-schema

### Best Practices / 最佳实践
- API Design Patterns: https://www.apiguide.org/
- Database Design Patterns: https://en.wikipedia.org/wiki/Database_design
- Security Best Practices: OWASP Top 10
- Compliance Standards: GDPR, CCPA, HIPAA, SOX, PCI-DSS

---

## 🤝 Contribution Guidelines / 贡献指南

### For Protocol Contributors / 协议贡献者

When adding new protocols to this repository:
1. Always start with Zod schema definition
2. Derive TypeScript types using `z.infer<>`
3. Use `camelCase` for configuration keys
4. Use `snake_case` for machine names/identifiers
5. Add comprehensive JSDoc comments
6. Include usage examples in comments
7. Write unit tests for schema validation
8. Update documentation
9. Follow semantic versioning for breaking changes

### For Implementers / 实现者

When building plugins/drivers/connectors:
1. Import protocol schemas from `@objectstack/spec`
2. Implement all required interfaces
3. Use runtime validation with imported Zod schemas
4. Write integration tests against protocol contracts
5. Document implementation-specific details
6. Follow the plugin architecture guide
7. Submit implementation to community registry

---

## 📝 Version History / 版本历史

- **v2.0** (2026-01-30): Re-scoped plan to focus on protocol definitions only, separated implementation work to plugin repositories
- **v1.0** (2026-01-29): Initial comprehensive transformation plan (mixed protocols and implementations)
