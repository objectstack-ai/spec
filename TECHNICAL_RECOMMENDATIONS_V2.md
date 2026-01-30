# ObjectStack Protocol Technical Recommendations
# 协议技术建议

**Evaluation Benchmark / 评估基准**: Salesforce, ServiceNow, Kubernetes, Prisma  
**Target Positioning / 目标定位**: Universal Protocol Standard for Enterprise Software  
**Scope / 范围**: Protocol definitions and specifications ONLY (implementations in separate repos)

---

## 🎯 Core Principle / 核心原则

**This document focuses on PROTOCOL DESIGN, not implementation.**  
**本文档专注于协议设计，而非实现。**

All recommendations are for **Zod schemas, TypeScript types, and interface contracts** that will be defined in `objectstack-ai/spec`. Actual implementations belong in separate plugin repositories.

---

## 📋 Table of Contents / 目录

1. [Missing Critical Protocols](#1-missing-critical-protocols)
2. [Protocol Enhancement Recommendations](#2-protocol-enhancement-recommendations)
3. [Driver Protocol Standardization](#3-driver-protocol-standardization)
4. [API Protocol Completeness](#4-api-protocol-completeness)
5. [Security Protocol Framework](#5-security-protocol-framework)
6. [Integration Protocol Templates](#6-integration-protocol-templates)
7. [Competitive Analysis](#7-competitive-analysis)

---

## 1. Missing Critical Protocols / 缺失的关键协议

### 1.1 Database & Storage Protocols

#### GraphQL Protocol (Priority: ⭐⭐⭐)
**File**: `packages/spec/src/api/graphql.zod.ts`

```typescript
import { z } from 'zod';

/**
 * GraphQL schema generation configuration
 * Maps ObjectQL schemas to GraphQL types
 */
export const GraphQLTypeSchema = z.object({
  typeName: z.string(),
  description: z.string().optional(),
  fields: z.record(z.object({
    type: z.enum(['String', 'Int', 'Float', 'Boolean', 'ID', 'Custom']),
    list: z.boolean().default(false),
    nullable: z.boolean().default(true),
    customType: z.string().optional(),
  })),
});

export const GraphQLQueryConfigSchema = z.object({
  enabled: z.boolean().default(true),
  operationName: z.string(),
  returnType: z.string(),
  args: z.record(z.string()).optional(),
  complexity: z.number().optional(),
});

export const GraphQLMutationConfigSchema = z.object({
  enabled: z.boolean().default(true),
  operationName: z.string(),
  inputType: z.string(),
  returnType: z.string(),
});

export const GraphQLSubscriptionConfigSchema = z.object({
  enabled: z.boolean().default(false),
  eventName: z.string(),
  filter: z.string().optional(),
  payload: z.string(),
});

export const GraphQLConfigSchema = z.object({
  enabled: z.boolean().default(false),
  endpoint: z.string().default('/graphql'),
  playground: z.boolean().default(true),
  introspection: z.boolean().default(true),
  queryDepthLimit: z.number().default(10),
  complexityLimit: z.number().default(1000),
  queries: z.array(GraphQLQueryConfigSchema).optional(),
  mutations: z.array(GraphQLMutationConfigSchema).optional(),
  subscriptions: z.array(GraphQLSubscriptionConfigSchema).optional(),
});

export type GraphQLConfig = z.infer<typeof GraphQLConfigSchema>;
```

**Rationale / 原因**:
- Hasura and Prisma prove GraphQL is essential for modern data APIs
- Type-safe schema generation from ObjectQL definitions
- Automatic resolver generation based on permissions

---

#### Cache Protocol (Priority: ⭐⭐⭐)
**File**: `packages/spec/src/system/cache.zod.ts`

```typescript
import { z } from 'zod';

/**
 * Multi-tier caching strategy
 * Supports Memory, Redis, CDN
 */
export const CacheStrategySchema = z.enum([
  'lru',          // Least Recently Used
  'lfu',          // Least Frequently Used
  'fifo',         // First In First Out
  'ttl',          // Time To Live only
  'adaptive',     // Dynamic strategy selection
]);

export const CacheTierSchema = z.object({
  name: z.string(),
  type: z.enum(['memory', 'redis', 'memcached', 'cdn']),
  maxSize: z.number().optional().describe('Max size in MB'),
  ttl: z.number().default(300).describe('Default TTL in seconds'),
  strategy: CacheStrategySchema.default('lru'),
  warmup: z.boolean().default(false),
});

export const CacheInvalidationSchema = z.object({
  trigger: z.enum(['create', 'update', 'delete', 'manual']),
  scope: z.enum(['key', 'pattern', 'tag', 'all']),
  pattern: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const CacheConfigSchema = z.object({
  enabled: z.boolean().default(false),
  tiers: z.array(CacheTierSchema),
  invalidation: z.array(CacheInvalidationSchema),
  prefetch: z.boolean().default(false),
  compression: z.boolean().default(false),
  encryption: z.boolean().default(false),
});

export type CacheConfig = z.infer<typeof CacheConfigSchema>;
```

---

#### Object Storage Protocol (Priority: ⭐⭐)
**File**: `packages/spec/src/system/object-storage.zod.ts`

```typescript
import { z } from 'zod';

/**
 * Object storage protocol for file/blob management
 * Compatible with S3, Azure Blob, GCS, MinIO
 */
export const StorageProviderSchema = z.enum([
  's3',
  'azure-blob',
  'gcs',
  'minio',
  'local',
]);

export const BucketConfigSchema = z.object({
  name: z.string(),
  region: z.string().optional(),
  public: z.boolean().default(false),
  versioning: z.boolean().default(false),
  encryption: z.enum(['none', 'aes256', 'kms']).default('none'),
  lifecycle: z.object({
    expirationDays: z.number().optional(),
    transitionToArchive: z.number().optional(),
  }).optional(),
});

export const PresignedUrlConfigSchema = z.object({
  expiration: z.number().default(3600).describe('Expiration in seconds'),
  allowedOperations: z.array(z.enum(['get', 'put', 'delete'])),
});

export const ObjectStorageConfigSchema = z.object({
  provider: StorageProviderSchema,
  accessKeyId: z.string().optional(),
  secretAccessKey: z.string().optional(),
  endpoint: z.string().optional(),
  buckets: z.array(BucketConfigSchema),
  multipartThreshold: z.number().default(5242880).describe('5MB in bytes'),
  presignedUrls: PresignedUrlConfigSchema.optional(),
});

export type ObjectStorageConfig = z.infer<typeof ObjectStorageConfigSchema>;
```

---

#### Message Queue Protocol (Priority: ⭐⭐)
**File**: `packages/spec/src/system/message-queue.zod.ts`

```typescript
import { z } from 'zod';

/**
 * Message queue protocol for async communication
 * Supports Kafka, RabbitMQ, AWS SQS, Redis Pub/Sub
 */
export const MessageQueueProviderSchema = z.enum([
  'kafka',
  'rabbitmq',
  'aws-sqs',
  'redis-pubsub',
  'google-pubsub',
  'azure-service-bus',
]);

export const TopicConfigSchema = z.object({
  name: z.string(),
  partitions: z.number().default(1),
  replicationFactor: z.number().default(1),
  retentionMs: z.number().optional(),
  compressionType: z.enum(['none', 'gzip', 'snappy', 'lz4']).default('none'),
});

export const ConsumerConfigSchema = z.object({
  groupId: z.string(),
  autoOffsetReset: z.enum(['earliest', 'latest']).default('latest'),
  enableAutoCommit: z.boolean().default(true),
  maxPollRecords: z.number().default(500),
});

export const DeadLetterQueueSchema = z.object({
  enabled: z.boolean().default(false),
  maxRetries: z.number().default(3),
  queueName: z.string(),
});

export const MessageQueueConfigSchema = z.object({
  provider: MessageQueueProviderSchema,
  topics: z.array(TopicConfigSchema),
  consumers: z.array(ConsumerConfigSchema).optional(),
  deadLetterQueue: DeadLetterQueueSchema.optional(),
  ssl: z.boolean().default(false),
  sasl: z.object({
    mechanism: z.enum(['plain', 'scram-sha-256', 'scram-sha-512']),
    username: z.string(),
    password: z.string(),
  }).optional(),
});

export type MessageQueueConfig = z.infer<typeof MessageQueueConfigSchema>;
```

---

#### Search Engine Protocol (Priority: ⭐⭐)
**File**: `packages/spec/src/system/search-engine.zod.ts`

```typescript
import { z } from 'zod';

/**
 * Full-text search protocol
 * Supports Elasticsearch, Algolia, Meilisearch, Typesense
 */
export const SearchProviderSchema = z.enum([
  'elasticsearch',
  'algolia',
  'meilisearch',
  'typesense',
  'opensearch',
]);

export const AnalyzerConfigSchema = z.object({
  type: z.enum(['standard', 'simple', 'whitespace', 'keyword', 'pattern', 'language']),
  language: z.string().optional(),
  stopwords: z.array(z.string()).optional(),
  customFilters: z.array(z.string()).optional(),
});

export const SearchIndexConfigSchema = z.object({
  indexName: z.string(),
  objectName: z.string().describe('Source ObjectQL object'),
  fields: z.array(z.object({
    name: z.string(),
    type: z.enum(['text', 'keyword', 'number', 'date', 'boolean', 'geo']),
    analyzer: z.string().optional(),
    searchable: z.boolean().default(true),
    filterable: z.boolean().default(false),
    sortable: z.boolean().default(false),
    boost: z.number().default(1),
  })),
  replicas: z.number().default(1),
  shards: z.number().default(1),
});

export const FacetConfigSchema = z.object({
  field: z.string(),
  maxValues: z.number().default(10),
  sort: z.enum(['count', 'alpha']).default('count'),
});

export const SearchConfigSchema = z.object({
  provider: SearchProviderSchema,
  indexes: z.array(SearchIndexConfigSchema),
  analyzers: z.record(AnalyzerConfigSchema).optional(),
  facets: z.array(FacetConfigSchema).optional(),
  typoTolerance: z.boolean().default(true),
  synonyms: z.record(z.array(z.string())).optional(),
  ranking: z.array(z.enum(['typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'])).optional(),
});

export type SearchConfig = z.infer<typeof SearchConfigSchema>;
```

---

### 1.2 Security & Compliance Protocols

#### Encryption Protocol (Priority: ⭐⭐⭐)
**File**: `packages/spec/src/system/encryption.zod.ts`

```typescript
import { z } from 'zod';

/**
 * Field-level encryption protocol
 * GDPR/HIPAA/PCI-DSS compliant
 */
export const EncryptionAlgorithmSchema = z.enum([
  'aes-256-gcm',
  'aes-256-cbc',
  'chacha20-poly1305',
]);

export const KeyManagementProviderSchema = z.enum([
  'local',
  'aws-kms',
  'azure-key-vault',
  'gcp-kms',
  'hashicorp-vault',
]);

export const KeyRotationPolicySchema = z.object({
  enabled: z.boolean().default(false),
  frequencyDays: z.number().min(1).default(90),
  retainOldVersions: z.number().default(3),
  autoRotate: z.boolean().default(true),
});

export const EncryptionConfigSchema = z.object({
  enabled: z.boolean().default(false),
  algorithm: EncryptionAlgorithmSchema.default('aes-256-gcm'),
  keyManagement: z.object({
    provider: KeyManagementProviderSchema,
    keyId: z.string().optional(),
    rotationPolicy: KeyRotationPolicySchema.optional(),
  }),
  scope: z.enum(['field', 'record', 'table', 'database']),
  deterministicEncryption: z.boolean().default(false).describe('Allows equality queries on encrypted data'),
  searchableEncryption: z.boolean().default(false).describe('Allows search on encrypted data'),
});

export const FieldEncryptionSchema = z.object({
  fieldName: z.string(),
  encryptionConfig: EncryptionConfigSchema,
  indexable: z.boolean().default(false),
});

export type EncryptionConfig = z.infer<typeof EncryptionConfigSchema>;
export type FieldEncryption = z.infer<typeof FieldEncryptionSchema>;
```

---

#### Compliance Protocol (Priority: ⭐⭐⭐)
**File**: `packages/spec/src/system/compliance.zod.ts`

```typescript
import { z } from 'zod';

/**
 * Compliance protocol for GDPR, CCPA, HIPAA, SOX, PCI-DSS
 */
export const GDPRConfigSchema = z.object({
  enabled: z.boolean(),
  dataSubjectRights: z.object({
    rightToAccess: z.boolean().default(true),
    rightToRectification: z.boolean().default(true),
    rightToErasure: z.boolean().default(true),
    rightToRestriction: z.boolean().default(true),
    rightToPortability: z.boolean().default(true),
    rightToObject: z.boolean().default(true),
  }),
  legalBasis: z.enum([
    'consent',
    'contract',
    'legal-obligation',
    'vital-interests',
    'public-task',
    'legitimate-interests',
  ]),
  consentTracking: z.boolean().default(true),
  dataRetentionDays: z.number().optional(),
  dataProcessingAgreement: z.string().optional(),
});

export const HIPAAConfigSchema = z.object({
  enabled: z.boolean(),
  phi: z.object({
    encryption: z.boolean().default(true),
    accessControl: z.boolean().default(true),
    auditTrail: z.boolean().default(true),
    backupAndRecovery: z.boolean().default(true),
  }),
  businessAssociateAgreement: z.boolean().default(false),
});

export const PCIDSSConfigSchema = z.object({
  enabled: z.boolean(),
  level: z.enum(['1', '2', '3', '4']),
  cardDataFields: z.array(z.string()),
  tokenization: z.boolean().default(true),
  encryptionInTransit: z.boolean().default(true),
  encryptionAtRest: z.boolean().default(true),
});

export const AuditLogConfigSchema = z.object({
  enabled: z.boolean().default(true),
  retentionDays: z.number().default(365),
  immutable: z.boolean().default(true),
  signLogs: z.boolean().default(false),
  events: z.array(z.enum([
    'create',
    'read',
    'update',
    'delete',
    'export',
    'permission-change',
    'login',
    'logout',
    'failed-login',
  ])),
});

export const ComplianceConfigSchema = z.object({
  gdpr: GDPRConfigSchema.optional(),
  hipaa: HIPAAConfigSchema.optional(),
  pciDss: PCIDSSConfigSchema.optional(),
  auditLog: AuditLogConfigSchema,
});

export type ComplianceConfig = z.infer<typeof ComplianceConfigSchema>;
```

---

#### Data Masking Protocol (Priority: ⭐⭐)
**File**: `packages/spec/src/system/masking.zod.ts`

```typescript
import { z } from 'zod';

/**
 * Data masking protocol for PII protection
 */
export const MaskingStrategySchema = z.enum([
  'redact',       // Complete redaction: ****
  'partial',      // Partial masking: 138****5678
  'hash',         // Hash value: sha256(value)
  'tokenize',     // Tokenization: token-12345
  'randomize',    // Randomize: generate random value
  'nullify',      // Null value: null
  'substitute',   // Substitute with dummy data
]);

export const MaskingRuleSchema = z.object({
  field: z.string(),
  strategy: MaskingStrategySchema,
  pattern: z.string().optional().describe('Regex pattern for partial masking'),
  preserveFormat: z.boolean().default(true),
  preserveLength: z.boolean().default(true),
  roles: z.array(z.string()).optional().describe('Roles that see masked data'),
  exemptRoles: z.array(z.string()).optional().describe('Roles that see unmasked data'),
});

export const MaskingConfigSchema = z.object({
  enabled: z.boolean().default(false),
  rules: z.array(MaskingRuleSchema),
  auditUnmasking: z.boolean().default(true),
});

export type MaskingConfig = z.infer<typeof MaskingConfigSchema>;
```

---

## 2. Protocol Enhancement Recommendations / 协议增强建议

### 2.1 Field Protocol Enhancement

**Current**: `packages/spec/src/data/field.zod.ts`  
**Enhancement**: Add encryption, masking, audit, and caching

```typescript
import { z } from 'zod';
import { EncryptionConfigSchema } from '../system/encryption.zod';
import { MaskingRuleSchema } from '../system/masking.zod';

export const FieldSchema = z.object({
  // ... existing fields (name, label, type, etc.)
  
  // ✅ NEW: Encryption support
  encryption: EncryptionConfigSchema.optional(),
  
  // ✅ NEW: Masking rules
  masking: MaskingRuleSchema.optional(),
  
  // ✅ NEW: Audit trail
  auditTrail: z.boolean().default(false),
  
  // ✅ NEW: Field dependencies
  dependencies: z.array(z.string()).optional(),
  
  // ✅ NEW: Computed field caching
  cached: z.object({
    enabled: z.boolean(),
    ttl: z.number(),
    invalidateOn: z.array(z.string()),
  }).optional(),
  
  // ✅ NEW: Data quality rules
  dataQuality: z.object({
    uniqueness: z.boolean().default(false),
    completeness: z.number().min(0).max(1).default(1),
    accuracy: z.object({
      source: z.string(),
      threshold: z.number(),
    }).optional(),
  }).optional(),
  
  // ✅ NEW: File/attachment configuration
  fileConfig: z.object({
    maxSize: z.number(),
    allowedTypes: z.array(z.string()),
    virusScan: z.boolean().default(true),
    storageProvider: z.string(),
  }).optional(),
});
```

---

### 2.2 Object Protocol Enhancement

**Current**: `packages/spec/src/data/object.zod.ts`  
**Enhancement**: Add multi-tenancy, soft delete, versioning, partitioning

```typescript
import { z } from 'zod';

export const ObjectSchema = z.object({
  // ... existing fields (name, label, fields, etc.)
  
  // ✅ NEW: Multi-tenancy configuration
  tenancy: z.object({
    enabled: z.boolean(),
    strategy: z.enum(['shared', 'isolated', 'hybrid']),
    tenantField: z.string().default('tenant_id'),
    crossTenantAccess: z.boolean().default(false),
  }).optional(),
  
  // ✅ NEW: Soft delete
  softDelete: z.object({
    enabled: z.boolean(),
    field: z.string().default('deleted_at'),
    cascadeDelete: z.boolean().default(false),
  }).optional(),
  
  // ✅ NEW: Versioning
  versioning: z.object({
    enabled: z.boolean(),
    strategy: z.enum(['snapshot', 'delta', 'event-sourcing']),
    retentionDays: z.number().optional(),
    versionField: z.string().default('version'),
  }).optional(),
  
  // ✅ NEW: Partitioning strategy
  partitioning: z.object({
    enabled: z.boolean(),
    strategy: z.enum(['range', 'hash', 'list']),
    key: z.string(),
    interval: z.string().optional(),
  }).optional(),
  
  // ✅ NEW: Index definitions
  indexes: z.array(z.object({
    name: z.string(),
    fields: z.array(z.string()),
    type: z.enum(['btree', 'hash', 'gin', 'gist', 'fulltext']),
    unique: z.boolean().default(false),
    partial: z.string().optional(),
  })).optional(),
  
  // ✅ NEW: Change Data Capture
  cdc: z.object({
    enabled: z.boolean(),
    events: z.array(z.enum(['insert', 'update', 'delete'])),
    destination: z.string(),
  }).optional(),
});
```

---

## 3. Driver Protocol Standardization / 驱动协议标准化

### 3.1 Enhanced Driver Capabilities

**Current**: `packages/spec/src/system/driver.zod.ts`  
**Enhancement**: More granular capability flags

```typescript
import { z } from 'zod';

export const DriverCapabilitiesSchema = z.object({
  // Basic CRUD
  create: z.boolean().default(true),
  read: z.boolean().default(true),
  update: z.boolean().default(true),
  delete: z.boolean().default(true),
  
  // Bulk operations
  bulkCreate: z.boolean().default(false),
  bulkUpdate: z.boolean().default(false),
  bulkDelete: z.boolean().default(false),
  
  // Transactions
  transactions: z.boolean().default(false),
  savepoints: z.boolean().default(false),
  isolationLevels: z.array(z.enum([
    'read-uncommitted',
    'read-committed',
    'repeatable-read',
    'serializable',
  ])).optional(),
  
  // Query capabilities
  queryFilters: z.boolean().default(true),
  queryAggregations: z.boolean().default(false),
  querySorting: z.boolean().default(true),
  queryPagination: z.boolean().default(true),
  queryWindowFunctions: z.boolean().default(false),
  querySubqueries: z.boolean().default(false),
  queryCTE: z.boolean().default(false),
  
  // Advanced features
  fullTextSearch: z.boolean().default(false),
  jsonQuery: z.boolean().default(false),
  geospatialQuery: z.boolean().default(false),
  streaming: z.boolean().default(false),
  
  // Schema management
  schemaSync: z.boolean().default(false),
  migrations: z.boolean().default(false),
  indexes: z.boolean().default(false),
  
  // Performance
  connectionPooling: z.boolean().default(false),
  preparedStatements: z.boolean().default(false),
  queryCache: z.boolean().default(false),
});

export const DriverConfigSchema = z.object({
  name: z.string(),
  type: z.enum(['sql', 'nosql', 'cache', 'search', 'graph', 'timeseries']),
  capabilities: DriverCapabilitiesSchema,
  connectionString: z.string().optional(),
  poolConfig: z.object({
    min: z.number().default(2),
    max: z.number().default(10),
    idleTimeoutMillis: z.number().default(30000),
    connectionTimeoutMillis: z.number().default(5000),
  }).optional(),
});

export type DriverConfig = z.infer<typeof DriverConfigSchema>;
export type DriverCapabilities = z.infer<typeof DriverCapabilitiesSchema>;
```

---

### 3.2 SQL-Specific Driver Protocol

**New**: `packages/spec/src/system/driver-sql.zod.ts`

```typescript
import { z } from 'zod';
import { DriverConfigSchema } from './driver.zod';

export const SQLDialectSchema = z.enum([
  'postgresql',
  'mysql',
  'sqlite',
  'mssql',
  'oracle',
  'mariadb',
]);

export const DataTypeMappingSchema = z.object({
  text: z.string(),
  number: z.string(),
  boolean: z.string(),
  date: z.string(),
  datetime: z.string(),
  json: z.string().optional(),
  uuid: z.string().optional(),
  binary: z.string().optional(),
});

export const SQLDriverConfigSchema = DriverConfigSchema.extend({
  type: z.literal('sql'),
  dialect: SQLDialectSchema,
  dataTypeMapping: DataTypeMappingSchema,
  ssl: z.boolean().default(false),
  sslConfig: z.object({
    rejectUnauthorized: z.boolean().default(true),
    ca: z.string().optional(),
    cert: z.string().optional(),
    key: z.string().optional(),
  }).optional(),
});

export type SQLDriverConfig = z.infer<typeof SQLDriverConfigSchema>;
```

---

## 4. API Protocol Completeness / API协议完整性

### 4.1 WebSocket Enhancement

**Current**: `packages/spec/src/api/websocket.zod.ts`  
**Enhancement**: Add collaboration features

```typescript
import { z } from 'zod';

export const WebSocketEventSchema = z.object({
  type: z.enum([
    'subscribe',
    'unsubscribe',
    'data-change',
    'presence-update',
    'cursor-update',
    'error',
  ]),
  channel: z.string(),
  payload: z.any(),
  timestamp: z.number(),
});

export const PresenceStateSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  status: z.enum(['online', 'away', 'offline']),
  lastSeen: z.number(),
  metadata: z.record(z.any()).optional(),
});

export const CursorPositionSchema = z.object({
  userId: z.string(),
  recordId: z.string(),
  fieldName: z.string(),
  position: z.number(),
  selection: z.object({
    start: z.number(),
    end: z.number(),
  }).optional(),
});

export const WebSocketConfigSchema = z.object({
  enabled: z.boolean().default(false),
  path: z.string().default('/ws'),
  heartbeatInterval: z.number().default(30000),
  reconnectAttempts: z.number().default(5),
  presence: z.boolean().default(false),
  cursorSharing: z.boolean().default(false),
});

export type WebSocketConfig = z.infer<typeof WebSocketConfigSchema>;
```

---

## 5. Security Protocol Framework / 安全协议框架

### 5.1 Row-Level Security Enhancement

**Current**: `packages/spec/src/auth/permission.zod.ts`  
**Enhancement**: Add dynamic RLS rules

```typescript
import { z } from 'zod';

export const RLSRuleSchema = z.object({
  name: z.string(),
  objectName: z.string(),
  operation: z.enum(['read', 'create', 'update', 'delete']),
  filter: z.object({
    field: z.string(),
    operator: z.enum(['eq', 'ne', 'in', 'nin', 'gt', 'gte', 'lt', 'lte']),
    value: z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.any()),
      z.object({ contextVariable: z.string() }),
    ]),
  }),
  enabled: z.boolean().default(true),
  priority: z.number().default(0),
});

export const PermissionSchema = z.object({
  // ... existing fields
  
  // ✅ NEW: Row-level security
  rls: z.array(RLSRuleSchema).optional(),
  
  // ✅ NEW: Context-based access control
  contextVariables: z.record(z.any()).optional(),
});
```

---

## 6. Integration Protocol Templates / 集成协议模板

### 6.1 SaaS Connector Template

**New**: `packages/spec/src/system/connector-template.zod.ts`

```typescript
import { z } from 'zod';

export const AuthMethodSchema = z.enum([
  'oauth2',
  'api-key',
  'jwt',
  'basic',
  'saml',
]);

export const OAuth2ConfigSchema = z.object({
  authorizationUrl: z.string().url(),
  tokenUrl: z.string().url(),
  clientId: z.string(),
  clientSecret: z.string(),
  scopes: z.array(z.string()),
  redirectUri: z.string().url().optional(),
});

export const FieldMappingSchema = z.object({
  source: z.string(),
  target: z.string(),
  transformation: z.enum([
    'none',
    'uppercase',
    'lowercase',
    'trim',
    'split',
    'join',
    'custom',
  ]).default('none'),
  customTransform: z.string().optional(),
});

export const SyncConfigSchema = z.object({
  direction: z.enum(['inbound', 'outbound', 'bidirectional']),
  frequency: z.object({
    type: z.enum(['realtime', 'scheduled', 'manual']),
    cron: z.string().optional(),
  }),
  conflictResolution: z.enum([
    'source-wins',
    'target-wins',
    'latest-wins',
    'manual',
  ]).default('latest-wins'),
});

export const ConnectorTemplateSchema = z.object({
  name: z.string(),
  version: z.string(),
  authMethod: AuthMethodSchema,
  authConfig: z.union([
    OAuth2ConfigSchema,
    z.object({ apiKey: z.string() }),
    z.object({ username: z.string(), password: z.string() }),
  ]),
  endpoints: z.record(z.object({
    url: z.string(),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
    headers: z.record(z.string()).optional(),
  })),
  fieldMappings: z.array(FieldMappingSchema),
  syncConfig: SyncConfigSchema,
  rateLimiting: z.object({
    requestsPerSecond: z.number(),
    retryStrategy: z.enum(['exponential-backoff', 'linear', 'none']),
    maxRetries: z.number().default(3),
  }).optional(),
});

export type ConnectorTemplate = z.infer<typeof ConnectorTemplateSchema>;
```

---

## 7. Competitive Analysis / 竞品分析

### 7.1 ObjectStack vs. Salesforce

| Feature / 功能 | Salesforce | ObjectStack (Current) | ObjectStack (Target) |
|---|:---:|:---:|:---:|
| **Object Definition** | ✅ Custom Objects | ✅ Object Protocol | ✅ Enhanced |
| **Field Types** | ✅ 20+ types | ✅ 15+ types | ✅ 25+ types |
| **Workflow Automation** | ✅ Flow Builder | ✅ Flow Protocol | ✅ Enhanced |
| **Permission Model** | ✅ RBAC + RLS | ✅ RBAC only | ✅ RBAC + RLS |
| **API Support** | ✅ REST + SOAP | ✅ REST + OData | ✅ REST + GraphQL |
| **Platform Encryption** | ✅ Shield | ❌ Missing | ✅ Protocol defined |
| **External Lookups** | ✅ Yes | ❌ Missing | ✅ Connector protocol |
| **Multi-tenancy** | ✅ Native | ⚠️ Spec only | ✅ Protocol + Impl |

**Gap Analysis**:
- ❌ Missing: Platform encryption protocol → **Add encryption.zod.ts**
- ❌ Missing: External lookup protocol → **Enhance connector.zod.ts**
- ❌ Missing: Row-level security → **Enhance permission.zod.ts**

---

### 7.2 ObjectStack vs. Prisma Schema

| Feature / 功能 | Prisma | ObjectStack |
|---|:---:|:---:|
| **Schema Language** | Custom DSL | Zod (TypeScript) |
| **Type Safety** | ✅ Generated types | ✅ Inferred types |
| **Runtime Validation** | ❌ No | ✅ Yes (Zod) |
| **Multi-database** | ✅ 10+ databases | ⚠️ 1 (InMemory) |
| **Migrations** | ✅ Built-in | ❌ Missing |
| **Seeding** | ✅ Built-in | ❌ Missing |
| **Relations** | ✅ Native | ✅ Lookup/Master-Detail |

**Recommendations**:
- Define migration protocol in driver.zod.ts
- Add seed data protocol
- Leverage Zod's runtime validation advantage in marketing

---

## 📝 Implementation Checklist / 实施检查清单

### Priority 0 (Critical) - Protocol Specs Only

- [ ] `packages/spec/src/api/graphql.zod.ts`
- [ ] `packages/spec/src/system/encryption.zod.ts`
- [ ] `packages/spec/src/system/compliance.zod.ts`
- [ ] `packages/spec/src/system/cache.zod.ts`
- [ ] `packages/spec/src/system/driver-sql.zod.ts`
- [ ] Enhance `driver.zod.ts` with granular capabilities
- [ ] Enhance `field.zod.ts` with encryption/masking
- [ ] Enhance `object.zod.ts` with multi-tenancy

### Priority 1 (High) - Protocol Specs Only

- [ ] `packages/spec/src/system/object-storage.zod.ts`
- [ ] `packages/spec/src/system/message-queue.zod.ts`
- [ ] `packages/spec/src/system/search-engine.zod.ts`
- [ ] `packages/spec/src/system/masking.zod.ts`
- [ ] `packages/spec/src/system/multi-tenancy.zod.ts`
- [ ] Enhance `websocket.zod.ts` with collaboration
- [ ] Enhance `permission.zod.ts` with RLS

### Priority 2 (Medium) - Protocol Specs Only

- [ ] `packages/spec/src/system/time-series.zod.ts`
- [ ] `packages/spec/src/system/graph-database.zod.ts`
- [ ] `packages/spec/src/system/logging.zod.ts`
- [ ] `packages/spec/src/system/metrics.zod.ts`
- [ ] `packages/spec/src/system/tracing.zod.ts`
- [ ] `packages/spec/src/system/connector-template.zod.ts`

### Implementation Repos (Separate Projects)

Implementations should be created in separate repositories:
- 🔌 Driver implementations: `objectstack-ai/driver-*`
- 🔌 Connector implementations: `objectstack-ai/connector-*`
- 🔌 Plugin implementations: `objectstack-ai/plugin-*`

---

## 🎯 Success Criteria / 成功标准

Protocol definitions are successful when:
1. ✅ All schemas pass Zod validation tests
2. ✅ TypeScript types are correctly inferred
3. ✅ JSON Schemas are auto-generated
4. ✅ Documentation is comprehensive
5. ✅ Interface contracts are complete
6. ✅ Breaking changes follow semver
7. ✅ Implementers can build plugins without ambiguity

---

**Document Version**: 2.0  
**Last Updated**: 2026-01-30  
**Scope**: Protocol specifications only (no implementation code)
