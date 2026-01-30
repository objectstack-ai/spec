# ObjectStack GitHub Organization Structure
# ObjectStack GitHub 组织架构

**Document Version / 文档版本**: 1.0  
**Created / 创建日期**: 2026-01-30  
**Author / 作者**: ObjectStack Core Team  
**Purpose / 目的**: Define GitHub organization structure for microkernel architecture with plugin ecosystem

---

## 📋 Table of Contents / 目录

1. [Architecture Overview / 架构概览](#1-architecture-overview)
2. [Repository Categories / 仓库分类](#2-repository-categories)
3. [Repository Matrix / 仓库矩阵](#3-repository-matrix)
4. [Repository Structure Templates / 仓库结构模板](#4-repository-structure-templates)
5. [Development Workflow / 开发工作流](#5-development-workflow)
6. [Naming Conventions / 命名规范](#6-naming-conventions)
7. [Quality Standards / 质量标准](#7-quality-standards)

---

## 1. Architecture Overview / 架构概览

### 1.1 Microkernel Design Philosophy / 微内核设计哲学

ObjectStack adopts a **microkernel + plugin architecture** inspired by:
- **Kubernetes**: Extensibility through CRDs and operators
- **VS Code**: Extension marketplace model
- **Linux Kernel**: Driver and module system
- **Salesforce**: AppExchange ecosystem

```
┌─────────────────────────────────────────────────────────────────┐
│                     PROTOCOL LAYER / 协议层                      │
│              objectstack-ai/spec (Single Source of Truth)       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Zod Schemas │ TypeScript Types │ JSON Schemas │ Docs    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ imports
┌─────────────────────────────────────────────────────────────────┐
│                    MICROKERNEL LAYER / 微内核层                  │
│  objectstack-ai/core    objectstack-ai/objectql               │
│  objectstack-ai/runtime objectstack-ai/client                 │
│  objectstack-ai/cli                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓ plugins
┌─────────────────────────────────────────────────────────────────┐
│                     PLUGIN LAYER / 插件层                        │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │   Drivers    │  Connectors  │   Services   │  Templates   │ │
│  │   驱动       │   连接器      │    服务      │    模板      │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Repository Organization Principles / 仓库组织原则

| Principle / 原则 | Description / 描述 |
|---|---|
| **Single Responsibility** | Each repository has ONE clear purpose |
| **Independent Versioning** | Each plugin can version independently |
| **Dependency Clarity** | All repos depend on `@objectstack/spec` |
| **Testing Isolation** | Each repo has its own CI/CD pipeline |
| **Documentation Decentralization** | Each repo maintains its own docs |
| **Community Contribution** | Lower barrier for external contributors |

---

## 2. Repository Categories / 仓库分类

### 2.1 Core Repositories / 核心仓库 (7 repos)

**Ownership**: Core Team  
**Stability**: High  
**Breaking Changes**: Require RFC process

| Repository Name | Purpose | Key Components |
|---|---|---|
| **spec** | Protocol definitions | Zod schemas, TypeScript types, JSON schemas |
| **core** | Microkernel | Plugin loader, dependency injection, lifecycle |
| **objectql** | Query engine | SQL builder, query optimizer, AST parser |
| **runtime** | Runtime environment | Server, workers, event bus, middleware |
| **client** | Client SDK | API client, type-safe queries, React hooks |
| **cli** | Command-line tools | Scaffolding, migrations, code generation |
| **types** | Shared types | Runtime environment interfaces |

### 2.2 Driver Repositories / 驱动仓库 (12+ repos)

**Ownership**: Core Team + Community  
**Stability**: Medium  
**Breaking Changes**: Follow semver, coordinate with spec

| Category | Repository Name | Purpose | Status |
|---|---|---|---|
| **SQL** | `driver-postgres` | PostgreSQL driver | 🟡 Planned |
| **SQL** | `driver-mysql` | MySQL/MariaDB driver | 🟡 Planned |
| **SQL** | `driver-sqlite` | SQLite driver | 🟡 Planned |
| **SQL** | `driver-mssql` | Microsoft SQL Server driver | 🟡 Planned |
| **SQL** | `driver-oracle` | Oracle Database driver | 🟡 Planned |
| **NoSQL** | `driver-mongodb` | MongoDB driver | 🟡 Planned |
| **NoSQL** | `driver-redis` | Redis driver | 🟡 Planned |
| **NoSQL** | `driver-dynamodb` | AWS DynamoDB driver | 🟡 Planned |
| **Cache** | `driver-memcached` | Memcached driver | 🟡 Planned |
| **Search** | `driver-elasticsearch` | Elasticsearch driver | 🟡 Planned |
| **Search** | `driver-meilisearch` | Meilisearch driver | 🟡 Planned |
| **Memory** | `driver-memory` | In-memory driver (reference) | 🟢 Exists |

### 2.3 Connector Repositories / 连接器仓库 (10+ repos)

**Ownership**: Community (with core team guidance)  
**Stability**: Variable  
**Breaking Changes**: Independent versioning

| Category | Repository Name | Purpose | Priority |
|---|---|---|---|
| **CRM** | `connector-salesforce` | Salesforce integration | ⭐⭐⭐ |
| **CRM** | `connector-hubspot` | HubSpot integration | ⭐⭐ |
| **Collaboration** | `connector-slack` | Slack integration | ⭐⭐⭐ |
| **Collaboration** | `connector-teams` | Microsoft Teams integration | ⭐⭐ |
| **Accounting** | `connector-quickbooks` | QuickBooks integration | ⭐⭐ |
| **Accounting** | `connector-xero` | Xero integration | ⭐ |
| **ERP** | `connector-sap` | SAP integration | ⭐⭐ |
| **HRIS** | `connector-workday` | Workday integration | ⭐⭐ |
| **Marketing** | `connector-mailchimp` | Mailchimp integration | ⭐ |
| **Payment** | `connector-stripe` | Stripe integration | ⭐⭐⭐ |

### 2.4 Service Plugin Repositories / 服务插件仓库 (15+ repos)

**Ownership**: Core Team  
**Stability**: Medium to High  
**Breaking Changes**: Coordinated releases

| Category | Repository Name | Purpose | Priority |
|---|---|---|---|
| **Security** | `plugin-encryption` | Field-level encryption | ⭐⭐⭐ |
| **Security** | `plugin-masking` | PII masking | ⭐⭐⭐ |
| **Security** | `plugin-compliance` | GDPR/HIPAA compliance toolkit | ⭐⭐⭐ |
| **Multi-tenant** | `plugin-multitenancy` | Tenant isolation | ⭐⭐⭐ |
| **Caching** | `plugin-cache` | Multi-tier caching | ⭐⭐⭐ |
| **Search** | `plugin-fulltext-search` | Full-text search | ⭐⭐ |
| **Files** | `plugin-file-storage` | File/attachment management | ⭐⭐ |
| **Workflow** | `plugin-workflow` | Advanced workflow engine | ⭐⭐ |
| **Approval** | `plugin-approval` | Approval process | ⭐⭐ |
| **Notification** | `plugin-notification` | Multi-channel notifications | ⭐⭐ |
| **Analytics** | `plugin-analytics` | Business intelligence | ⭐⭐ |
| **AI** | `plugin-ai-agent` | AI agent orchestration | ⭐⭐⭐ |
| **AI** | `plugin-ai-rag` | RAG pipeline | ⭐⭐⭐ |
| **Observability** | `plugin-logging` | Structured logging | ⭐⭐ |
| **Observability** | `plugin-tracing` | Distributed tracing | ⭐⭐ |

### 2.5 Server Plugin Repositories / 服务器插件仓库 (8+ repos)

**Ownership**: Core Team  
**Stability**: High  
**Breaking Changes**: Coordinated releases

| Repository Name | Purpose | Framework | Status |
|---|---|---|---|
| `plugin-hono-server` | Hono server adapter | Hono | 🟢 Exists |
| `plugin-express-server` | Express server adapter | Express | 🟡 Planned |
| `plugin-fastify-server` | Fastify server adapter | Fastify | 🟡 Planned |
| `plugin-nestjs-server` | NestJS server adapter | NestJS | 🟡 Planned |
| `plugin-nextjs-server` | Next.js API routes adapter | Next.js | 🟡 Planned |
| `plugin-cloudflare-workers` | Cloudflare Workers adapter | Workers | 🟡 Planned |
| `plugin-aws-lambda` | AWS Lambda adapter | Serverless | 🟡 Planned |
| `plugin-msw` | Mock Service Worker | MSW | 🟢 Exists |

### 2.6 Template Repositories / 模板仓库 (10+ repos)

**Ownership**: Community (with core team curation)  
**Stability**: Variable  
**Breaking Changes**: Independent

| Repository Name | Purpose | Industry | Status |
|---|---|---|---|
| `template-crm` | CRM application | Sales | 🟡 Planned |
| `template-helpdesk` | Customer support system | Service | 🟡 Planned |
| `template-project-management` | Project management | Operations | 🟡 Planned |
| `template-hr-system` | Human resources | HR | 🟡 Planned |
| `template-inventory` | Inventory management | Supply Chain | 🟡 Planned |
| `template-ecommerce` | E-commerce platform | Retail | 🟡 Planned |
| `template-healthcare` | Healthcare management | Healthcare | 🟡 Planned |
| `template-education` | Learning management | Education | 🟡 Planned |
| `template-iot-platform` | IoT data platform | IoT | 🟡 Planned |
| `template-ai-saas` | AI-powered SaaS | AI/ML | 🟡 Planned |

### 2.7 Tool Repositories / 工具仓库 (5+ repos)

**Ownership**: Core Team  
**Stability**: Medium  
**Breaking Changes**: Independent

| Repository Name | Purpose | Users |
|---|---|---|
| `devtools` | Browser DevTools extension | Developers |
| `vscode-extension` | VS Code extension | Developers |
| `jetbrains-plugin` | JetBrains IDE plugin | Developers |
| `metadata-validator` | Metadata linting/validation | DevOps |
| `migration-tool` | Migration from other platforms | Admins |

### 2.8 Documentation & Infrastructure Repositories / 文档与基础设施仓库 (5+ repos)

**Ownership**: Core Team  
**Stability**: High  
**Breaking Changes**: Content only

| Repository Name | Purpose | Content |
|---|---|---|
| `docs` | Official documentation | Guides, tutorials, API reference |
| `examples` | Example applications | Sample code, demos |
| `awesome-objectstack` | Curated resources | Community plugins, tools, articles |
| `.github` | Organization-wide configs | Templates, workflows, community health |
| `registry` | Plugin registry service | Plugin metadata, versions, reviews |

---

## 3. Repository Matrix / 仓库矩阵

### 3.1 By Development Priority / 按开发优先级

| Priority | Phase | Repositories | Timeline |
|---|---|---|---|
| **P0** | Foundation | spec, core, objectql, runtime, client, cli | Q1 2026 |
| **P1** | Essential Drivers | driver-postgres, driver-mysql, driver-mongodb, driver-redis | Q2 2026 |
| **P2** | Essential Plugins | plugin-encryption, plugin-masking, plugin-multitenancy, plugin-cache | Q2 2026 |
| **P3** | Key Connectors | connector-salesforce, connector-slack, connector-stripe | Q3 2026 |
| **P4** | Server Adapters | plugin-express, plugin-fastify, plugin-nextjs | Q3 2026 |
| **P5** | Templates | template-crm, template-helpdesk, template-project-management | Q4 2026 |
| **P6** | Tools | devtools, vscode-extension, migration-tool | Q4 2026 |

### 3.2 By Ownership Model / 按所有权模型

| Ownership | Repositories | Maintenance | Support Level |
|---|---|---|---|
| **Core Team** | spec, core, objectql, runtime, client, cli | Daily | Enterprise SLA |
| **Core + Community** | All drivers, server plugins | Weekly | Community + Premium |
| **Community** | Connectors, templates, tools | Best effort | Community only |
| **Third-party** | Custom plugins, integrations | Independent | Self-support |

### 3.3 By Technology Stack / 按技术栈

| Tech Stack | Repositories | Language | Runtime |
|---|---|---|---|
| **TypeScript** | spec, core, objectql, runtime, client, cli | TypeScript | Node.js |
| **Database** | All driver-* repos | TypeScript | Node.js |
| **Integration** | All connector-* repos | TypeScript | Node.js |
| **Plugin** | All plugin-* repos | TypeScript | Node.js |
| **Frontend** | devtools, vscode-extension | TypeScript | Browser/Electron |

---

## 4. Repository Structure Templates / 仓库结构模板

### 4.1 Core Repository Template / 核心仓库模板

```
objectstack-ai/[core|objectql|runtime|client|cli]/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # Continuous integration
│   │   ├── release.yml            # Release automation
│   │   └── security.yml           # Security scanning
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
├── src/
│   ├── index.ts                   # Main entry point
│   ├── types/                     # TypeScript type definitions
│   ├── core/                      # Core functionality
│   ├── utils/                     # Utility functions
│   └── __tests__/                 # Unit tests
├── docs/
│   ├── README.md                  # Getting started
│   ├── API.md                     # API reference
│   └── ARCHITECTURE.md            # Architecture docs
├── examples/
│   └── basic/                     # Example usage
├── package.json
├── tsconfig.json
├── tsup.config.ts                 # Build configuration
├── vitest.config.ts               # Test configuration
├── README.md
├── CHANGELOG.md
├── LICENSE
└── CONTRIBUTING.md
```

### 4.2 Driver Repository Template / 驱动仓库模板

```
objectstack-ai/driver-[postgres|mysql|mongodb|redis]/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── integration-test.yml   # Database integration tests
│       └── release.yml
├── src/
│   ├── index.ts
│   ├── driver.ts                  # Driver implementation
│   ├── connection.ts              # Connection manager
│   ├── query-builder.ts           # Query builder
│   ├── migrations.ts              # Migration support
│   └── __tests__/
│       ├── unit/                  # Unit tests
│       └── integration/           # Integration tests
├── docker/
│   └── docker-compose.yml         # Test database setup
├── docs/
│   ├── README.md
│   ├── CONFIGURATION.md           # Configuration guide
│   └── MIGRATION.md               # Migration guide
├── package.json
├── README.md
└── CHANGELOG.md
```

### 4.3 Plugin Repository Template / 插件仓库模板

```
objectstack-ai/plugin-[encryption|masking|cache]/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── src/
│   ├── index.ts
│   ├── plugin.ts                  # Plugin entry point
│   ├── config.ts                  # Configuration schema
│   ├── hooks/                     # Lifecycle hooks
│   ├── services/                  # Service implementations
│   └── __tests__/
├── docs/
│   ├── README.md
│   ├── CONFIGURATION.md
│   └── EXAMPLES.md
├── examples/
│   └── basic/
├── package.json
├── README.md
└── CHANGELOG.md
```

### 4.4 Connector Repository Template / 连接器仓库模板

```
objectstack-ai/connector-[salesforce|slack|stripe]/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── integration-test.yml
├── src/
│   ├── index.ts
│   ├── connector.ts               # Connector implementation
│   ├── auth.ts                    # Authentication
│   ├── api-client.ts              # API client
│   ├── mapping.ts                 # Field mapping
│   ├── sync.ts                    # Sync engine
│   └── __tests__/
├── docs/
│   ├── README.md
│   ├── AUTHENTICATION.md          # Auth setup guide
│   ├── FIELD-MAPPING.md           # Mapping guide
│   └── SYNC-CONFIGURATION.md      # Sync configuration
├── examples/
│   └── sync-contacts/
├── package.json
├── README.md
└── CHANGELOG.md
```

### 4.5 Template Repository Template / 模板仓库模板

```
objectstack-ai/template-[crm|helpdesk|project-management]/
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   ├── domains/                   # Business domains
│   │   ├── account/
│   │   │   ├── account.object.ts
│   │   │   ├── account.view.ts
│   │   │   └── account.hook.ts
│   │   └── contact/
│   ├── ui/
│   │   ├── apps.ts
│   │   ├── dashboards.ts
│   │   └── reports.ts
│   ├── workflows/
│   └── index.ts
├── docs/
│   ├── README.md
│   ├── INSTALLATION.md
│   ├── CUSTOMIZATION.md
│   └── DATA-MODEL.md
├── screenshots/
├── objectstack.config.ts          # Stack configuration
├── package.json
└── README.md
```

---

## 5. Development Workflow / 开发工作流

### 5.1 Release Process / 发布流程

```
┌─────────────────────────────────────────────────────────┐
│  1. Protocol Update (spec repo)                         │
│     - Update Zod schemas                                │
│     - Increment version                                 │
│     - Publish @objectstack/spec@x.y.z                   │
└─────────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  2. Core Update (core repos)                            │
│     - Update to latest @objectstack/spec               │
│     - Implement new features                            │
│     - Publish core packages                             │
└─────────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  3. Plugin Update (plugin repos)                        │
│     - Update dependencies                               │
│     - Implement new protocol support                    │
│     - Publish plugin packages                           │
└─────────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  4. Template Update (template repos)                    │
│     - Update dependencies                               │
│     - Use new features                                  │
│     - Update documentation                              │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Dependency Management / 依赖管理

**Dependency Rules**:
1. All repos MUST depend on `@objectstack/spec` (protocol definitions)
2. Driver/Plugin repos MAY depend on `@objectstack/core` (if using kernel features)
3. Template repos SHOULD depend on `@objectstack/runtime` or `@objectstack/client`
4. Connectors SHOULD be independent (only spec dependency)

**Version Constraints**:
```json
{
  "dependencies": {
    "@objectstack/spec": "^0.6.0",      // Protocol - accept minor updates
    "@objectstack/core": "~0.6.1",      // Core - patch updates only
    "@objectstack/runtime": "^0.6.0"     // Runtime - accept minor updates
  }
}
```

### 5.3 CI/CD Pipeline / CI/CD 流水线

**Standard Pipeline for ALL Repositories**:

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
      
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run CodeQL
        uses: github/codeql-action/analyze@v2
      - name: Run npm audit
        run: npm audit --audit-level=high
```

### 5.4 Cross-Repository Testing / 跨仓库测试

**Integration Test Strategy**:

```typescript
// In driver-postgres repository
import { test } from 'vitest';
import { ObjectQLEngine } from '@objectstack/objectql';
import { PostgresDriver } from './src/driver';

test('PostgreSQL driver with ObjectQL engine', async () => {
  const engine = new ObjectQLEngine({
    driver: new PostgresDriver({
      connectionString: 'postgres://...'
    })
  });
  
  // Test integration
  const result = await engine.query({
    object: 'account',
    select: ['name', 'email'],
    filter: { status: 'active' }
  });
  
  expect(result).toBeDefined();
});
```

---

## 6. Naming Conventions / 命名规范

### 6.1 Repository Naming / 仓库命名

| Type | Pattern | Examples |
|---|---|---|
| **Core** | `[name]` | `spec`, `core`, `runtime`, `client`, `cli` |
| **Driver** | `driver-[database]` | `driver-postgres`, `driver-mongodb` |
| **Connector** | `connector-[service]` | `connector-salesforce`, `connector-slack` |
| **Plugin** | `plugin-[feature]` | `plugin-encryption`, `plugin-cache` |
| **Template** | `template-[domain]` | `template-crm`, `template-helpdesk` |
| **Tool** | `[tool-name]` | `devtools`, `vscode-extension` |

### 6.2 Package Naming / 包命名

| Type | Pattern | Examples |
|---|---|---|
| **Core** | `@objectstack/[name]` | `@objectstack/core`, `@objectstack/runtime` |
| **Driver** | `@objectstack/driver-[name]` | `@objectstack/driver-postgres` |
| **Connector** | `@objectstack/connector-[name]` | `@objectstack/connector-salesforce` |
| **Plugin** | `@objectstack/plugin-[name]` | `@objectstack/plugin-encryption` |
| **Template** | `@objectstack/template-[name]` | `@objectstack/template-crm` |

### 6.3 Branch Naming / 分支命名

| Type | Pattern | Examples |
|---|---|---|
| **Feature** | `feature/[issue-number]-[description]` | `feature/123-add-postgres-driver` |
| **Fix** | `fix/[issue-number]-[description]` | `fix/456-connection-leak` |
| **Release** | `release/v[version]` | `release/v0.7.0` |
| **Hotfix** | `hotfix/[version]` | `hotfix/0.6.2` |

---

## 7. Quality Standards / 质量标准

### 7.1 Code Quality Requirements / 代码质量要求

| Metric | Core Repos | Driver Repos | Plugin Repos | Template Repos |
|---|:---:|:---:|:---:|:---:|
| **Test Coverage** | ≥ 90% | ≥ 80% | ≥ 75% | ≥ 60% |
| **TypeScript Strict Mode** | ✅ Required | ✅ Required | ✅ Required | ⚠️ Recommended |
| **ESLint** | ✅ Required | ✅ Required | ✅ Required | ✅ Required |
| **Prettier** | ✅ Required | ✅ Required | ✅ Required | ✅ Required |
| **Documentation** | ✅ Comprehensive | ✅ Comprehensive | ✅ Required | ⚠️ Basic |
| **Examples** | ✅ Required | ✅ Required | ✅ Required | N/A (is example) |

### 7.2 Security Standards / 安全标准

**ALL repositories MUST**:
- ✅ Enable GitHub Dependabot
- ✅ Enable GitHub CodeQL scanning
- ✅ Enable GitHub Secret scanning
- ✅ Use npm audit in CI/CD
- ✅ Follow OWASP security guidelines
- ✅ Document security policies in SECURITY.md

### 7.3 Documentation Standards / 文档标准

**ALL repositories MUST include**:
- ✅ `README.md` - Overview, installation, quick start
- ✅ `CHANGELOG.md` - Version history (Keep a Changelog format)
- ✅ `CONTRIBUTING.md` - Contribution guidelines
- ✅ `LICENSE` - Apache 2.0 license file
- ✅ `SECURITY.md` - Security policy and reporting

**Driver/Plugin/Connector repositories SHOULD include**:
- ✅ `docs/CONFIGURATION.md` - Configuration reference
- ✅ `docs/API.md` - API documentation
- ✅ `examples/` - Usage examples

### 7.4 Accessibility Standards / 可访问性标准

**Repository Settings**:
- ✅ Public visibility (unless enterprise-only)
- ✅ Enable Issues
- ✅ Enable Discussions (for major repos)
- ✅ Enable Wiki (optional)
- ✅ Enable Projects (for roadmap)
- ✅ Protected `main` branch
- ✅ Require PR reviews (≥1 reviewer)
- ✅ Require status checks to pass
- ✅ Require signed commits (core repos)

---

## 8. Migration Path / 迁移路径

### 8.1 Current State / 当前状态

**Existing Structure (Monorepo)**:
```
objectstack-ai/spec/
├── packages/
│   ├── spec/           ← Keep (protocol definitions)
│   ├── core/           ← Extract to objectstack-ai/core
│   ├── objectql/       ← Extract to objectstack-ai/objectql
│   ├── runtime/        ← Extract to objectstack-ai/runtime
│   ├── client/         ← Extract to objectstack-ai/client
│   ├── cli/            ← Extract to objectstack-ai/cli
│   ├── types/          ← Keep or merge into spec
│   ├── ai-bridge/      ← Keep or extract
│   └── plugins/
│       ├── driver-memory/        ← Extract to objectstack-ai/driver-memory
│       ├── plugin-hono-server/   ← Extract to objectstack-ai/plugin-hono-server
│       └── plugin-msw/           ← Extract to objectstack-ai/plugin-msw
└── examples/           ← Keep for now
```

### 8.2 Target State / 目标状态

**Distributed Repositories**:
```
GitHub Organization: objectstack-ai/
├── spec                          (protocol definitions only)
├── core                          (microkernel)
├── objectql                      (query engine)
├── runtime                       (runtime environment)
├── client                        (client SDK)
├── cli                           (CLI tools)
├── types                         (shared types)
├── ai-bridge                     (AI bridge - optional)
├── driver-memory                 (reference driver)
├── driver-postgres               (new)
├── driver-mysql                  (new)
├── driver-mongodb                (new)
├── plugin-hono-server            (existing)
├── plugin-msw                    (existing)
├── plugin-encryption             (new)
├── plugin-multitenancy           (new)
├── connector-salesforce          (new)
├── template-crm                  (new)
├── docs                          (documentation site)
└── .github                       (org-wide configs)
```

### 8.3 Migration Strategy / 迁移策略

**Phase 1: Extract Core Repositories (Month 1-2)**
1. Create new repositories with proper structure
2. Copy code from monorepo to new repos
3. Set up CI/CD for each repo
4. Publish initial versions to npm
5. Update monorepo to use published packages

**Phase 2: Extract Plugins (Month 2-3)**
1. Extract existing plugins (driver-memory, plugin-hono-server, plugin-msw)
2. Create new driver repositories
3. Create new plugin repositories
4. Update dependency chains

**Phase 3: Create Ecosystem (Month 3-12)**
1. Develop connectors
2. Create templates
3. Build developer tools
4. Establish community contribution process

**Phase 4: Deprecate Monorepo (Month 12+)**
1. Archive monorepo or keep as workspace
2. Redirect traffic to individual repos
3. Update all documentation

---

## 9. Community & Governance / 社区与治理

### 9.1 Repository Ownership / 仓库所有权

| Level | Repositories | Maintainers | Decision Authority |
|---|---|---|---|
| **Tier 1** | spec, core | Core team only | Requires RFC + voting |
| **Tier 2** | objectql, runtime, client, cli | Core team + trusted contributors | Requires PR review |
| **Tier 3** | Drivers, server plugins | Core team + community | Standard PR process |
| **Tier 4** | Connectors, templates, tools | Community-led | Community maintainers |

### 9.2 Contribution Workflow / 贡献工作流

```
1. Fork repository
2. Create feature branch
3. Implement changes + tests
4. Submit pull request
5. Code review
6. CI/CD passes
7. Merge to main
8. Automated release (if applicable)
```

### 9.3 RFC Process / RFC 流程

**Required for**:
- Breaking changes in spec
- New protocols or major protocol changes
- Architecture changes in core
- New repository creation (Tier 1-2)

**Process**:
1. Submit RFC in `spec` repository discussions
2. Community discussion (2 weeks)
3. Core team review
4. Vote (for Tier 1 changes)
5. Implementation in feature branch
6. Final review and merge

---

## 10. Success Metrics / 成功指标

### 10.1 Ecosystem Health / 生态系统健康度

| Metric | Q2 2026 Target | Q4 2026 Target | 2027 Target |
|---|:---:|:---:|:---:|
| **Core Repositories** | 7 | 7 | 7 |
| **Driver Repositories** | 5 | 8 | 12+ |
| **Plugin Repositories** | 5 | 10 | 20+ |
| **Connector Repositories** | 3 | 8 | 15+ |
| **Template Repositories** | 2 | 5 | 10+ |
| **Community Contributors** | 10 | 30 | 100+ |
| **Total GitHub Stars** | 500 | 2,000 | 5,000+ |
| **NPM Weekly Downloads** | 1,000 | 10,000 | 50,000+ |

### 10.2 Quality Metrics / 质量指标

| Metric | Target |
|---|:---:|
| **Average Test Coverage** | ≥ 80% |
| **Security Vulnerabilities** | 0 high/critical |
| **Documentation Coverage** | ≥ 90% |
| **Issue Response Time** | < 48 hours |
| **PR Review Time** | < 72 hours |
| **Release Frequency** | Weekly (minor), Monthly (major) |

---

## 11. Implementation Checklist / 实施检查清单

### 11.1 Infrastructure Setup / 基础设施设置

- [ ] Create GitHub organization if not exists
- [ ] Set up organization-wide settings
- [ ] Configure organization secrets (NPM_TOKEN, etc.)
- [ ] Set up GitHub Discussions
- [ ] Create `.github` repository for templates
- [ ] Set up organization project boards
- [ ] Configure GitHub Pages for docs

### 11.2 Repository Creation / 仓库创建

**Phase 1: Core (Q1 2026)**
- [ ] Extract `objectstack-ai/core`
- [ ] Extract `objectstack-ai/objectql`
- [ ] Extract `objectstack-ai/runtime`
- [ ] Extract `objectstack-ai/client`
- [ ] Extract `objectstack-ai/cli`
- [ ] Keep `objectstack-ai/spec` (refactor to protocol-only)
- [ ] Keep `objectstack-ai/types`

**Phase 2: Essential Drivers (Q2 2026)**
- [ ] Create `objectstack-ai/driver-postgres`
- [ ] Create `objectstack-ai/driver-mysql`
- [ ] Create `objectstack-ai/driver-mongodb`
- [ ] Create `objectstack-ai/driver-redis`
- [ ] Extract `objectstack-ai/driver-memory`

**Phase 3: Essential Plugins (Q2 2026)**
- [ ] Create `objectstack-ai/plugin-encryption`
- [ ] Create `objectstack-ai/plugin-masking`
- [ ] Create `objectstack-ai/plugin-multitenancy`
- [ ] Create `objectstack-ai/plugin-cache`
- [ ] Extract `objectstack-ai/plugin-hono-server`
- [ ] Extract `objectstack-ai/plugin-msw`

**Phase 4: Ecosystem (Q3-Q4 2026)**
- [ ] Create connector repositories (3+)
- [ ] Create template repositories (2+)
- [ ] Create tool repositories (2+)
- [ ] Create `objectstack-ai/docs`
- [ ] Create `objectstack-ai/registry`

### 11.3 Documentation / 文档

- [ ] Create organization README
- [ ] Create contribution guidelines (org-wide)
- [ ] Create security policy (org-wide)
- [ ] Create code of conduct
- [ ] Create developer documentation site
- [ ] Create plugin development guide
- [ ] Create connector development guide
- [ ] Create template creation guide

---

## 12. Appendix / 附录

### 12.1 Reference Ecosystems / 参考生态系统

**Kubernetes**:
- Core: `kubernetes/kubernetes`
- Operators: `kubernetes-sigs/*`
- Helm Charts: `helm/charts`
- Community: `kubernetes/community`

**Prisma**:
- Core: `prisma/prisma`
- Engines: `prisma/prisma-engines`
- Client: `prisma/prisma-client-js`
- Examples: `prisma/prisma-examples`

**Nx**:
- Core: `nrwl/nx`
- Plugins: `nrwl/nx-*`
- Recipes: `nrwl/nx-recipes`
- Examples: `nrwl/nx-examples`

### 12.2 Useful Links / 有用链接

- [GitHub Organization Best Practices](https://docs.github.com/en/organizations)
- [Monorepo vs Multi-repo](https://earthly.dev/blog/monorepo-vs-polyrepo/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)

---

**Document Maintained By**: ObjectStack Core Team  
**Review Cycle**: Quarterly  
**Next Review**: 2026-04-30  
**Feedback**: Create issue in `objectstack-ai/spec` repository
