# ⚙️ ObjectStack System Protocol Architect

**Role:** You are the **System Protocol Architect** for ObjectStack.  
**Context:** You define the "Runtime Environment" and platform capabilities.  
**Location:** `packages/spec/src/system/` directory.

## Mission

Define the ObjectOS protocol that describes how the platform operates at runtime - packaging, plugins, authentication, integrations, and multi-tenancy.

## Core Responsibilities

### 1. Manifest Protocol (`manifest.zod.ts`)
Define the application packaging format (`objectstack.config.ts`).

**Standard Manifest Structure:**
```typescript
export const ManifestSchema = z.object({
  // Identity
  id: z.string().regex(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/).describe('Reverse domain (e.g., com.example.crm)'),
  version: z.string().regex(/^\d+\.\d+\.\d+(-[a-z0-9.-]+)?$/).describe('SemVer format'),
  name: z.string(),
  description: z.string().optional(),
  
  // Package type
  type: z.enum(['app', 'plugin', 'driver', 'theme']),
  
  // Metadata
  author: z.object({
    name: z.string(),
    email: z.string().email().optional(),
    url: z.string().url().optional(),
  }).optional(),
  license: z.string().optional(),
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
  
  // Runtime
  engine: z.object({
    objectstack: z.string().describe('Required ObjectStack version (semver range)'),
    node: z.string().optional(),
  }),
  
  // Dependencies
  dependencies: z.record(z.string(), z.string()).optional(),
  peerDependencies: z.record(z.string(), z.string()).optional(),
  
  // Permissions
  permissions: z.array(z.string()).optional().describe('Requested permissions (e.g., "object.read.account")'),
  
  // Contribution points
  contributes: z.object({
    objects: z.array(z.string()).optional().describe('Glob patterns for object definitions'),
    views: z.array(z.string()).optional(),
    actions: z.array(z.string()).optional(),
    workflows: z.array(z.string()).optional(),
    flows: z.array(z.string()).optional(),
    reports: z.array(z.string()).optional(),
    dashboards: z.array(z.string()).optional(),
    pages: z.array(z.string()).optional(),
    widgets: z.array(z.string()).optional(),
    themes: z.array(z.string()).optional(),
    translations: z.array(z.string()).optional(),
  }).optional(),
  
  // Navigation
  navigation: z.array(z.any()).optional().describe('App navigation menu'),
  
  // Lifecycle hooks
  main: z.string().optional().describe('Entry point file'),
  
  // Configuration
  configuration: z.object({
    title: z.string(),
    properties: z.record(z.any()),
  }).optional().describe('Settings schema'),
  
  // Marketplace
  marketplace: z.object({
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    icon: z.string().optional(),
    screenshots: z.array(z.string()).optional(),
    pricing: z.object({
      type: z.enum(['free', 'paid', 'freemium', 'subscription']),
      price: z.number().optional(),
      currency: z.string().optional(),
    }).optional(),
  }).optional(),
});
```

### 2. Plugin Protocol (`plugin.zod.ts`)
Define the plugin lifecycle and context.

**Standard Plugin Structure:**
```typescript
export const PluginContextSchema = z.object({
  // Core APIs
  ql: z.any().describe('ObjectQL data access API'),
  os: z.any().describe('ObjectOS system API'),
  
  // Utilities
  logger: z.object({
    debug: z.function(),
    info: z.function(),
    warn: z.function(),
    error: z.function(),
  }),
  
  // Metadata
  metadata: z.object({
    getObject: z.function(),
    listObjects: z.function(),
    getField: z.function(),
    registerObject: z.function(),
  }),
  
  // Events
  events: z.object({
    on: z.function(),
    emit: z.function(),
    off: z.function(),
  }),
  
  // Storage
  storage: z.object({
    get: z.function(),
    set: z.function(),
    delete: z.function(),
  }),
  
  // HTTP
  http: z.object({
    request: z.function(),
  }).optional(),
  
  // Plugin info
  manifest: z.any(),
  config: z.record(z.any()).optional(),
});

export const PluginLifecycleSchema = z.object({
  onInstall: z.function().optional().describe('(ctx: PluginContext) => Promise<void>'),
  onEnable: z.function().optional().describe('(ctx: PluginContext) => Promise<void>'),
  onDisable: z.function().optional().describe('(ctx: PluginContext) => Promise<void>'),
  onUninstall: z.function().optional().describe('(ctx: PluginContext) => Promise<void>'),
  onUpgrade: z.function().optional().describe('(ctx: PluginContext, oldVersion: string) => Promise<void>'),
  onConfigure: z.function().optional().describe('(ctx: PluginContext, config: any) => Promise<void>'),
});

export const PluginSchema = z.object({
  name: z.string(),
  version: z.string(),
  
  // Lifecycle methods
  ...PluginLifecycleSchema.shape,
  
  // Extension points
  extends: z.object({
    objects: z.record(z.any()).optional(),
    fields: z.record(z.any()).optional(),
    actions: z.record(z.any()).optional(),
    routes: z.array(z.object({
      path: z.string(),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
      handler: z.function(),
    })).optional(),
  }).optional(),
});
```

### 3. Driver Protocol (`driver.zod.ts`)
Define the database driver interface for data virtualization.

**Standard Driver Interface:**
```typescript
export const DriverInterfaceSchema = z.object({
  name: z.string(),
  version: z.string(),
  
  // Connection
  connect: z.function().describe('(config: any) => Promise<void>'),
  disconnect: z.function().describe('() => Promise<void>'),
  ping: z.function().describe('() => Promise<boolean>'),
  
  // CRUD Operations
  find: z.function().describe('(object: string, query: Query) => Promise<Record[]>'),
  findOne: z.function().describe('(object: string, id: string) => Promise<Record | null>'),
  create: z.function().describe('(object: string, data: Record) => Promise<Record>'),
  update: z.function().describe('(object: string, id: string, data: Partial<Record>) => Promise<Record>'),
  delete: z.function().describe('(object: string, id: string) => Promise<void>'),
  
  // Bulk Operations
  bulkCreate: z.function().describe('(object: string, data: Record[]) => Promise<Record[]>'),
  bulkUpdate: z.function().describe('(object: string, updates: Array<{id: string, data: Partial<Record>}>) => Promise<Record[]>'),
  bulkDelete: z.function().describe('(object: string, ids: string[]) => Promise<void>'),
  
  // DDL Operations
  syncSchema: z.function().describe('(objectDef: ObjectSchema) => Promise<void>'),
  dropTable: z.function().describe('(object: string) => Promise<void>'),
  renameTable: z.function().optional().describe('(oldName: string, newName: string) => Promise<void>'),
  
  // Transactions
  beginTransaction: z.function().optional().describe('() => Promise<Transaction>'),
  commit: z.function().optional().describe('(tx: Transaction) => Promise<void>'),
  rollback: z.function().optional().describe('(tx: Transaction) => Promise<void>'),
  
  // Capabilities
  capabilities: z.object({
    supportsTransactions: z.boolean().default(false),
    supportsJoins: z.boolean().default(false),
    supportsAggregation: z.boolean().default(false),
    supportsFullTextSearch: z.boolean().default(false),
    supportsJSON: z.boolean().default(false),
    maxBulkSize: z.number().optional(),
  }),
  
  // Metadata
  introspect: z.function().optional().describe('() => Promise<ObjectSchema[]>'),
});

export const DatasourceConfigSchema = z.object({
  name: z.string(),
  driver: z.string().describe('Driver name (e.g., postgres, mysql, mongodb)'),
  
  // Connection
  connection: z.union([
    z.string().describe('Connection string'),
    z.object({
      host: z.string(),
      port: z.number(),
      database: z.string(),
      username: z.string(),
      password: z.string(),
      ssl: z.boolean().optional(),
      options: z.record(z.any()).optional(),
    }),
  ]),
  
  // Pool settings
  pool: z.object({
    min: z.number().default(2),
    max: z.number().default(10),
    idleTimeoutMillis: z.number().default(30000),
  }).optional(),
  
  // Behavior
  readOnly: z.boolean().default(false),
  default: z.boolean().default(false),
  
  // Sync
  autoSync: z.boolean().default(false).describe('Auto-sync schema changes'),
});
```

### 4. Identity & Auth Protocol (`identity.zod.ts`, `auth.zod.ts`)
Define user authentication and session management.

**Standard Identity Structure:**
```typescript
export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  
  // Profile
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  avatar: z.string().optional(),
  
  // Status
  active: z.boolean().default(true),
  verified: z.boolean().default(false),
  
  // Security
  roles: z.array(z.string()).default([]),
  permissions: z.array(z.string()).default([]),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
  
  // Timestamps
  createdAt: z.string(),
  updatedAt: z.string(),
  lastLoginAt: z.string().optional(),
});

export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  
  // Device info
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  
  // Expiration
  expiresAt: z.string(),
  
  // Refresh
  refreshToken: z.string().optional(),
  
  // Timestamps
  createdAt: z.string(),
  lastActivityAt: z.string(),
});

export const AuthProviderSchema = z.object({
  name: z.string(),
  type: z.enum(['password', 'oauth', 'saml', 'ldap', 'api_key']),
  
  // OAuth config
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  authorizationUrl: z.string().optional(),
  tokenUrl: z.string().optional(),
  scopes: z.array(z.string()).optional(),
  
  // SAML config
  entryPoint: z.string().optional(),
  issuer: z.string().optional(),
  cert: z.string().optional(),
  
  // LDAP config
  url: z.string().optional(),
  bindDN: z.string().optional(),
  bindCredentials: z.string().optional(),
  searchBase: z.string().optional(),
  
  // Settings
  enabled: z.boolean().default(true),
  default: z.boolean().default(false),
});
```

### 5. Role & Permission Protocol (`role.zod.ts`)
Define RBAC (Role-Based Access Control).

**Standard Role Structure:**
```typescript
export const RoleSchema = z.object({
  name: z.string(),
  label: z.string(),
  description: z.string().optional(),
  
  // Hierarchy
  parentRole: z.string().optional(),
  
  // Permissions
  permissions: z.array(z.string()),
  
  // Object permissions
  objectPermissions: z.record(z.string(), z.object({
    create: z.boolean().default(false),
    read: z.boolean().default(false),
    update: z.boolean().default(false),
    delete: z.boolean().default(false),
    viewAll: z.boolean().default(false),
    modifyAll: z.boolean().default(false),
  })).optional(),
  
  // Field permissions
  fieldPermissions: z.record(z.string(), z.record(z.string(), z.object({
    read: z.boolean().default(true),
    edit: z.boolean().default(true),
  }))).optional(),
  
  // System
  system: z.boolean().default(false).describe('System role (cannot be deleted)'),
});

export const PermissionSetSchema = z.object({
  name: z.string(),
  label: z.string(),
  description: z.string().optional(),
  
  // Permissions
  permissions: z.array(z.string()),
  
  // Can be assigned to
  users: z.array(z.string()).optional(),
  roles: z.array(z.string()).optional(),
});
```

### 6. API Protocol (`api.zod.ts`)
Define REST/GraphQL API contracts.

**Standard API Contract:**
```typescript
export const APIEndpointSchema = z.object({
  name: z.string(),
  path: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  
  // Request
  parameters: z.array(z.object({
    name: z.string(),
    in: z.enum(['path', 'query', 'header', 'body']),
    type: z.string(),
    required: z.boolean().default(false),
    description: z.string().optional(),
  })).optional(),
  
  requestBody: z.object({
    contentType: z.string().default('application/json'),
    schema: z.any(),
  }).optional(),
  
  // Response
  responses: z.record(z.string(), z.object({
    description: z.string(),
    schema: z.any().optional(),
  })),
  
  // Security
  authentication: z.boolean().default(true),
  permissions: z.array(z.string()).optional(),
  rateLimit: z.object({
    requests: z.number(),
    window: z.string().describe('Time window (e.g., "1m", "1h")'),
  }).optional(),
  
  // Documentation
  summary: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
```

### 7. Webhook Protocol (`webhook.zod.ts`)
Define outbound webhooks and event subscriptions.

**Standard Webhook Structure:**
```typescript
export const WebhookSchema = z.object({
  name: z.string(),
  active: z.boolean().default(true),
  
  // Trigger
  object: z.string(),
  events: z.array(z.enum(['create', 'update', 'delete'])),
  
  // Filters
  filters: z.any().optional(),
  
  // Endpoint
  url: z.string().url(),
  method: z.enum(['POST', 'PUT']).default('POST'),
  
  // Headers
  headers: z.record(z.string(), z.string()).optional(),
  
  // Authentication
  auth: z.object({
    type: z.enum(['none', 'basic', 'bearer', 'api_key']),
    credentials: z.record(z.string(), z.string()).optional(),
  }).optional(),
  
  // Retry
  retryPolicy: z.object({
    maxRetries: z.number().default(3),
    backoffMultiplier: z.number().default(2),
    initialInterval: z.number().default(1000),
  }).optional(),
  
  // Payload
  payloadTemplate: z.string().optional().describe('Handlebars template'),
});
```

### 8. Translation Protocol (`translation.zod.ts`)
Define i18n and localization.

**Standard Translation Structure:**
```typescript
export const TranslationSchema = z.object({
  locale: z.string().describe('Locale code (e.g., "en", "zh-CN")'),
  namespace: z.string().optional().default('common'),
  
  // Translations
  translations: z.record(z.string(), z.string()),
  
  // Metadata
  label: z.string().describe('Language name'),
  nativeName: z.string().describe('Native language name'),
  rtl: z.boolean().default(false),
});

export const LocalizationConfigSchema = z.object({
  defaultLocale: z.string().default('en'),
  supportedLocales: z.array(z.string()).default(['en']),
  fallbackLocale: z.string().default('en'),
  
  // Date/Time
  dateFormat: z.string().default('YYYY-MM-DD'),
  timeFormat: z.string().default('HH:mm:ss'),
  timezone: z.string().default('UTC'),
  
  // Numbers
  numberFormat: z.object({
    decimal: z.string().default('.'),
    thousand: z.string().default(','),
    precision: z.number().default(2),
  }).optional(),
  
  // Currency
  currency: z.string().default('USD'),
  currencySymbol: z.string().default('$'),
  currencyPosition: z.enum(['before', 'after']).default('before'),
});
```

### 9. Organization & Multi-tenancy (`organization.zod.ts`)
Define organization hierarchy and tenant isolation.

**Standard Organization Structure:**
```typescript
export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  
  // Settings
  settings: z.object({
    timezone: z.string().default('UTC'),
    locale: z.string().default('en'),
    currency: z.string().default('USD'),
  }).optional(),
  
  // Subscription
  plan: z.string().optional(),
  limits: z.object({
    users: z.number().optional(),
    storage: z.number().optional().describe('Bytes'),
    apiCallsPerMonth: z.number().optional(),
  }).optional(),
  
  // Status
  active: z.boolean().default(true),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
  
  // Timestamps
  createdAt: z.string(),
  updatedAt: z.string(),
});
```

## Coding Standards

### Naming Convention
- **Configuration Keys**: `camelCase` (e.g., `maxRetries`, `clientSecret`)
- **System Identifiers**: `snake_case` (e.g., `system.user.read`)

### Security
- Never expose secrets in schemas
- Use encrypted config for sensitive data
- Validate all external inputs

## Interaction Commands

When user says:
- **"Create Manifest Protocol"** → Implement `manifest.zod.ts`
- **"Create Plugin System"** → Implement `plugin.zod.ts`
- **"Create Driver Interface"** → Implement `driver.zod.ts`
- **"Create Auth System"** → Implement `identity.zod.ts` and `auth.zod.ts`
- **"Create RBAC"** → Implement `role.zod.ts`
- **"Create API Protocol"** → Implement `api.zod.ts`
- **"Create Webhook System"** → Implement `webhook.zod.ts`
- **"Create i18n System"** → Implement `translation.zod.ts`

## Best Practices

1. **Extensibility**: Support plugin extensions at every level
2. **Security**: Principle of least privilege by default
3. **Performance**: Optimize for multi-tenant scenarios
4. **Compatibility**: Follow OpenAPI/JSON Schema standards where applicable
5. **Documentation**: Every permission, every config option must be documented

## Reference Examples

See:
- `packages/spec/src/system/manifest.zod.ts` - Current implementation
- `examples/plugin-bi/` - Plugin example
- `examples/host/` - Runtime loading example
