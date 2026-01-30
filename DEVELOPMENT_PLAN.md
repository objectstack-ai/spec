# ObjectStack 核心包开发计划
# ObjectStack Core Packages Development Plan

**文档版本 / Version**: 1.0  
**创建日期 / Created**: 2026-01-30  
**作者 / Author**: ObjectStack 核心团队 / ObjectStack Core Team  
**关联 PR / Related PR**: https://github.com/objectstack-ai/spec/pull/397

---

## 📋 目录 / Table of Contents

1. [项目概述](#1-项目概述--project-overview)
2. [core 微内核](#2-core-微内核--microkernel)
3. [objectql 查询引擎](#3-objectql-查询引擎--query-engine)
4. [runtime 运行时环境](#4-runtime-运行时环境--runtime-environment)
5. [client 客户端 SDK](#5-client-客户端-sdk--client-sdk)
6. [cli 命令行工具](#6-cli-命令行工具--cli-tool)
7. [types 共享类型](#7-types-共享类型--shared-types)
8. [实施时间线](#8-实施时间线--implementation-timeline)
9. [成功指标](#9-成功指标--success-metrics)

---

## 1. 项目概述 / Project Overview

### 1.1 架构愿景

ObjectStack 采用**微内核 + 插件架构**，打造一个开放、可扩展的低代码平台生态系统。

```
┌─────────────────────────────────────────────────────────────┐
│                   协议层 / Protocol Layer                    │
│                  @objectstack/spec (本仓库)                   │
│          Zod Schemas → TypeScript Types → JSON Schema       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  微内核层 / Microkernel Layer                 │
│  ┌─────────┬──────────┬─────────┬─────────┬──────┬───────┐ │
│  │  core   │ objectql │ runtime │ client  │ cli  │ types │ │
│  └─────────┴──────────┴─────────┴─────────┴──────┴───────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    插件层 / Plugin Layer                      │
│        Drivers │ Connectors │ Plugins │ Server Adapters     │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 核心包职责划分

| 包名 | 职责 | NPM 包名 | 状态 |
|---|---|---|:---:|
| **core** | 微内核、插件加载器、依赖注入、生命周期管理 | `@objectstack/core` | 🟡 增强中 |
| **objectql** | 查询引擎、SQL构建器、查询优化器、AST解析器 | `@objectstack/objectql` | 🟡 增强中 |
| **runtime** | 运行时环境、服务器、工作器、事件总线、中间件 | `@objectstack/runtime` | 🟡 增强中 |
| **client** | 客户端SDK、API客户端、类型安全查询、React Hooks | `@objectstack/client` | 🟡 增强中 |
| **cli** | 命令行工具、脚手架、迁移、代码生成 | `@objectstack/cli` | 🟡 增强中 |
| **types** | 共享类型、运行时环境接口 | `@objectstack/types` | 🟡 增强中 |

**状态说明**:
- 🟢 已完成 / Completed
- 🟡 增强中 / In Progress
- 🔴 待开发 / Planned

---

## 2. core 微内核 / Microkernel

### 2.1 当前状态 / Current State

**已实现功能**:
- ✅ 基础插件系统 (Plugin lifecycle)
- ✅ 服务注册与依赖注入 (Service Registry & DI)
- ✅ 事件总线 (Event Bus with hooks)
- ✅ 高性能日志系统 (Pino-based logging)
- ✅ 插件依赖解析 (Dependency resolution)
- ✅ 环境检测 (Node.js/Browser detection)

**文件结构**:
```
packages/core/src/
├── index.ts                 # 公共 API
├── kernel.ts               # 微内核实现
├── kernel.test.ts          # 内核测试
├── logger.ts               # 日志实现
├── logger.test.ts          # 日志测试
├── types.ts                # 类型定义
└── contracts/
    ├── logger.ts           # 日志接口
    ├── http-server.ts      # HTTP 服务器接口
    └── data-engine.ts      # 数据引擎接口
```

### 2.2 待实现功能清单 / Features Roadmap

#### P0: 核心功能增强

- [ ] **插件隔离与沙箱**
  - 插件命名空间隔离
  - 内存使用限制
  - 错误隔离机制
  - 安全上下文 (Security Context)

- [ ] **插件热加载 (Hot Reload)**
  - 插件动态加载/卸载
  - 状态迁移 (State Migration)
  - 配置热更新
  - 开发模式支持

- [ ] **插件市场协议**
  - 插件元数据标准 (Manifest)
  - 版本兼容性检查
  - 依赖版本解析
  - 插件签名验证

#### P1: 高级功能

- [ ] **中间件系统**
  - 通用中间件接口
  - 中间件链 (Middleware Chain)
  - 异步中间件支持
  - 中间件上下文传递

- [ ] **配置管理**
  - 配置schema验证
  - 环境变量支持
  - 配置合并策略
  - 运行时配置更新

- [ ] **性能监控**
  - 插件启动时间追踪
  - 内存使用监控
  - 事件总线性能指标
  - 慢查询检测

#### P2: 扩展功能

- [ ] **插件通信协议**
  - 跨插件消息传递
  - RPC 支持
  - 事件订阅/发布优化
  - 消息队列集成

- [ ] **开发者工具**
  - 插件调试器
  - 依赖关系可视化
  - 插件性能分析
  - 配置验证工具

### 2.3 API 设计 / API Design

#### 插件热加载API

```typescript
class ObjectKernel {
  // 现有 API
  use(plugin: Plugin): this;
  bootstrap(): Promise<void>;
  shutdown(): Promise<void>;
  
  // 新增 API
  loadPlugin(name: string, plugin: Plugin): Promise<void>;
  unloadPlugin(name: string): Promise<void>;
  reloadPlugin(name: string): Promise<void>;
  getPluginState(name: string): PluginState;
}
```

#### 中间件系统API

```typescript
interface Middleware {
  name: string;
  priority?: number;
  handler: (ctx: MiddlewareContext, next: () => Promise<void>) => Promise<void>;
}

class ObjectKernel {
  useMiddleware(middleware: Middleware): this;
  executeMiddleware(context: any): Promise<void>;
}
```

### 2.4 测试计划 / Testing Plan

- **单元测试覆盖率**: 目标 90%+
- **集成测试**: 插件加载场景、依赖解析
- **性能测试**: 插件启动时间、事件总线吞吐量
- **压力测试**: 大量插件加载、内存泄漏检测

### 2.5 文档需求 / Documentation Requirements

- [ ] 插件开发指南
- [ ] 中间件开发指南
- [ ] 性能优化最佳实践
- [ ] 故障排查手册
- [ ] API 完整参考文档

---

## 3. objectql 查询引擎 / Query Engine

### 3.1 当前状态 / Current State

**已实现功能**:
- ✅ 基础 CRUD 操作 (Create, Read, Update, Delete)
- ✅ 驱动路由 (Driver Routing)
- ✅ 简单查询 (Simple Query)
- ✅ Schema 注册 (Schema Registry)
- ✅ 插件系统集成

**文件结构**:
```
packages/objectql/src/
├── index.ts                # 公共 API
├── engine.ts              # 查询引擎核心
├── protocol.ts            # 协议定义
├── registry.ts            # Schema 注册表
└── plugin.ts              # ObjectQL 插件
```

### 3.2 待实现功能清单 / Features Roadmap

#### P0: SQL 构建器 (SQL Builder)

- [ ] **基础 SQL 生成**
  - SELECT 语句生成
  - INSERT 语句生成
  - UPDATE 语句生成
  - DELETE 语句生成
  - WHERE 条件构建

- [ ] **高级查询支持**
  - JOIN 操作 (INNER, LEFT, RIGHT, FULL)
  - 子查询 (Subquery)
  - 聚合函数 (COUNT, SUM, AVG, MIN, MAX)
  - GROUP BY / HAVING
  - UNION / INTERSECT / EXCEPT

- [ ] **查询参数化**
  - 参数绑定 (Parameterized Queries)
  - SQL 注入防护
  - 类型转换
  - NULL 处理

#### P0: AST 解析器 (AST Parser)

- [ ] **查询 AST 定义**
  - 查询节点类型 (QueryNode types)
  - 表达式树 (Expression Tree)
  - 操作符定义 (Operators)
  - 函数调用 (Function Calls)

- [ ] **AST 转换器**
  - 简化查询 → AST
  - AST → SQL
  - AST → NoSQL (MongoDB Query)
  - AST 优化器

- [ ] **AST 验证器**
  - 语法检查
  - 类型检查
  - 权限检查
  - 性能分析

#### P0: 查询优化器 (Query Optimizer)

- [ ] **查询计划生成**
  - 执行计划评估
  - 索引选择
  - JOIN 顺序优化
  - 查询重写

- [ ] **性能优化**
  - 查询缓存
  - 结果集缓存
  - 预编译查询
  - 批量操作优化

- [ ] **统计信息**
  - 表统计信息
  - 索引统计
  - 查询执行统计
  - 慢查询日志

#### P1: 高级功能

- [ ] **跨对象查询 (Federation)**
  - 跨数据源 JOIN
  - 分布式查询
  - 数据聚合
  - 查询下推

- [ ] **事务支持**
  - 单数据源事务
  - 分布式事务 (2PC)
  - SAGA 模式
  - 事务隔离级别

- [ ] **数据验证层**
  - Schema 验证 (Zod integration)
  - 业务规则验证
  - 自定义验证器
  - 验证错误处理

#### P2: 扩展功能

- [ ] **实时查询**
  - 查询订阅
  - 变更通知
  - Reactive Queries
  - WebSocket 集成

- [ ] **分析型查询**
  - 窗口函数 (Window Functions)
  - 时间序列查询
  - 数据透视 (Pivot)
  - 数据立方体 (OLAP)

### 3.3 API 设计 / API Design

#### SQL 构建器 API

```typescript
class SQLBuilder {
  select(...fields: string[]): this;
  from(table: string): this;
  where(conditions: WhereClause): this;
  join(table: string, on: JoinCondition): this;
  groupBy(...fields: string[]): this;
  having(conditions: HavingClause): this;
  orderBy(...fields: OrderByClause[]): this;
  limit(count: number): this;
  offset(count: number): this;
  build(): { sql: string; params: any[] };
}
```

#### AST 解析器 API

```typescript
interface QueryAST {
  type: 'select' | 'insert' | 'update' | 'delete';
  object: string;
  fields?: FieldSelection[];
  where?: WhereNode;
  joins?: JoinNode[];
  orderBy?: OrderByNode[];
  limit?: number;
  offset?: number;
}

class ASTParser {
  parse(query: SimpleQuery): QueryAST;
  toSQL(ast: QueryAST, dialect: SQLDialect): string;
  toMongoDB(ast: QueryAST): MongoQuery;
  optimize(ast: QueryAST): QueryAST;
  validate(ast: QueryAST, schema: ObjectSchema): ValidationResult;
}
```

#### 查询优化器 API

```typescript
class QueryOptimizer {
  analyzeQuery(ast: QueryAST): QueryPlan;
  selectIndexes(plan: QueryPlan): IndexSelection[];
  optimizeJoins(plan: QueryPlan): QueryPlan;
  estimateCost(plan: QueryPlan): number;
  explainQuery(query: QueryAST): ExplainResult;
}
```

### 3.4 测试计划 / Testing Plan

- **SQL 生成测试**: 覆盖所有SQL语句类型
- **AST 解析测试**: 各种查询场景
- **优化器测试**: 性能基准测试
- **跨驱动测试**: PostgreSQL, MySQL, MongoDB, Redis
- **性能测试**: 查询吞吐量、延迟

### 3.5 文档需求 / Documentation Requirements

- [ ] 查询语法完整参考
- [ ] SQL 构建器使用指南
- [ ] AST 结构文档
- [ ] 查询优化最佳实践
- [ ] 性能调优指南

---

## 4. runtime 运行时环境 / Runtime Environment

### 4.1 当前状态 / Current State

**已实现功能**:
- ✅ 基础插件系统 (AppPlugin, DriverPlugin)
- ✅ 能力接口 (IHttpServer, IDataEngine)
- ✅ ObjectQL 集成

**文件结构**:
```
packages/runtime/src/
├── index.ts                # 公共 API
├── app-plugin.ts          # 应用插件
└── driver-plugin.ts       # 驱动插件
```

### 4.2 待实现功能清单 / Features Roadmap

#### P0: 服务器 (Server)

- [ ] **HTTP 服务器抽象**
  - 统一的服务器接口
  - 路由管理
  - 请求/响应处理
  - 中间件支持

- [ ] **REST API 服务器**
  - RESTful 路由自动生成
  - CRUD 端点
  - 批量操作端点
  - 元数据端点

- [ ] **GraphQL 服务器**
  - Schema 自动生成
  - Resolver 自动生成
  - 订阅支持
  - DataLoader 集成

#### P0: 工作器 (Worker)

- [ ] **后台任务系统**
  - 任务队列
  - 任务调度
  - 任务重试
  - 任务优先级

- [ ] **定时任务 (Cron Jobs)**
  - Cron 表达式解析
  - 任务调度器
  - 任务日志
  - 错误处理

- [ ] **批处理作业**
  - 批量数据处理
  - 数据导入/导出
  - ETL 任务
  - 进度追踪

#### P0: 事件总线 (Event Bus)

- [ ] **事件系统增强**
  - 事件类型定义
  - 事件优先级
  - 事件过滤
  - 事件持久化

- [ ] **异步事件处理**
  - 事件队列
  - 事件重放
  - 死信队列
  - 事件源 (Event Sourcing)

- [ ] **事件集成**
  - Webhook 支持
  - 消息队列集成 (Kafka, RabbitMQ)
  - 实时通知
  - 事件日志

#### P1: 中间件 (Middleware)

- [ ] **请求中间件**
  - 认证中间件
  - 授权中间件
  - 日志中间件
  - 错误处理中间件

- [ ] **数据中间件**
  - 数据验证
  - 数据转换
  - 数据加密/解密
  - 审计日志

- [ ] **缓存中间件**
  - 查询缓存
  - 响应缓存
  - 缓存失效策略
  - 分布式缓存

#### P2: 扩展功能

- [ ] **WebSocket 服务器**
  - 实时通信
  - 房间管理
  - 广播支持
  - 连接管理

- [ ] **微服务支持**
  - 服务发现
  - 负载均衡
  - 健康检查
  - 服务网格集成

### 4.3 API 设计 / API Design

#### 服务器 API

```typescript
interface Server {
  start(port: number): Promise<void>;
  stop(): Promise<void>;
  registerRoute(route: Route): void;
  registerMiddleware(middleware: Middleware): void;
  getStatus(): ServerStatus;
}

class RuntimeServer implements Server {
  constructor(config: ServerConfig);
  // 实现方法...
}
```

#### 工作器 API

```typescript
interface Worker {
  registerJob(job: Job): void;
  schedule(cronExpression: string, handler: JobHandler): void;
  enqueue(jobName: string, data: any): Promise<JobId>;
  getJobStatus(jobId: JobId): JobStatus;
  cancelJob(jobId: JobId): Promise<void>;
}

class BackgroundWorker implements Worker {
  // 实现方法...
}
```

#### 事件总线 API

```typescript
interface EventBus {
  publish(event: Event): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): Subscription;
  unsubscribe(subscription: Subscription): void;
  replay(fromTimestamp: Date): AsyncIterator<Event>;
}

class DistributedEventBus implements EventBus {
  // 实现方法...
}
```

### 4.4 测试计划 / Testing Plan

- **服务器测试**: HTTP请求处理、路由匹配
- **工作器测试**: 任务调度、错误重试
- **事件总线测试**: 事件发布/订阅、性能测试
- **中间件测试**: 中间件链、错误处理
- **集成测试**: 完整应用场景

### 4.5 文档需求 / Documentation Requirements

- [ ] 服务器配置指南
- [ ] 工作器使用指南
- [ ] 事件总线架构
- [ ] 中间件开发指南
- [ ] 部署最佳实践

---

## 5. client 客户端 SDK / Client SDK

### 5.1 当前状态 / Current State

**已实现功能**:
- ✅ 基础 CRUD 操作
- ✅ 元数据访问 (Meta API)
- ✅ 批量操作 (Batch Operations)
- ✅ 视图存储 (View Storage)
- ✅ 元数据缓存 (ETag-based caching)
- ✅ 标准化错误处理

**文件结构**:
```
packages/client/src/
└── index.ts                # 客户端实现
```

### 5.2 待实现功能清单 / Features Roadmap

#### P0: 类型安全查询 (Type-Safe Queries)

- [ ] **类型生成器**
  - Schema → TypeScript 类型
  - 自动类型推导
  - 泛型支持
  - 类型校验

- [ ] **类型安全查询构建器**
  - Fluent API
  - 编译时类型检查
  - 智能代码补全
  - 类型安全的过滤器

- [ ] **运行时类型验证**
  - Zod 集成
  - 请求验证
  - 响应验证
  - 错误类型

#### P0: React Hooks

- [ ] **数据查询 Hooks**
  - `useQuery` - 查询数据
  - `useMutation` - 修改数据
  - `useInfiniteQuery` - 无限滚动
  - `usePagination` - 分页查询

- [ ] **元数据 Hooks**
  - `useObject` - 获取对象schema
  - `useView` - 获取视图配置
  - `useFields` - 获取字段列表
  - `useMetadata` - 通用元数据

- [ ] **实时数据 Hooks**
  - `useSubscription` - 数据订阅
  - `useLiveQuery` - 实时查询
  - `usePresence` - 在线状态
  - `useCollaboration` - 协作编辑

#### P1: 高级功能

- [ ] **离线支持**
  - 本地数据库 (IndexedDB)
  - 离线查询
  - 数据同步
  - 冲突解决

- [ ] **乐观更新**
  - 乐观UI更新
  - 回滚机制
  - 冲突检测
  - 合并策略

- [ ] **请求去重**
  - 相同请求合并
  - 请求缓存
  - 防抖/节流
  - 请求取消

#### P2: 扩展功能

- [ ] **Vue Hooks (Composables)**
  - Vue 3 Composition API
  - 响应式数据
  - 自动清理
  - SSR 支持

- [ ] **Svelte Stores**
  - Svelte 响应式 Store
  - 自动订阅
  - 派生 Store
  - SSR 支持

- [ ] **开发者工具**
  - 浏览器扩展
  - 请求追踪
  - 性能分析
  - 调试工具

### 5.3 API 设计 / API Design

#### 类型安全查询 API

```typescript
// 类型生成器
type TodoTask = {
  id: string;
  subject: string;
  priority: number;
  status: 'active' | 'completed';
};

// 类型安全查询
const tasks = await client
  .table<TodoTask>('todo_task')
  .where('priority', '>=', 2)
  .where('status', '=', 'active')
  .orderBy('priority', 'desc')
  .limit(10)
  .select('subject', 'priority')
  .execute();
// tasks 的类型自动推导为: Pick<TodoTask, 'subject' | 'priority'>[]
```

#### React Hooks API

```typescript
// 查询数据
function TaskList() {
  const { data, loading, error, refetch } = useQuery('todo_task', {
    where: { status: 'active' },
    orderBy: ['-priority']
  });
  
  const { mutate, loading: mutating } = useMutation('todo_task');
  
  const handleComplete = async (id: string) => {
    await mutate.update(id, { status: 'completed' });
    refetch();
  };
  
  // ...
}

// 元数据
function TaskForm() {
  const { object, fields, loading } = useObject('todo_task');
  
  // 根据 schema 动态生成表单
}

// 实时订阅
function RealTimeTaskList() {
  const { data, connected } = useSubscription('todo_task', {
    where: { status: 'active' }
  });
  
  // data 自动更新
}
```

### 5.4 测试计划 / Testing Plan

- **单元测试**: API 方法、类型推导
- **集成测试**: 与服务器交互
- **React 测试**: Hooks 测试 (React Testing Library)
- **端到端测试**: 完整应用场景
- **性能测试**: 请求性能、内存占用

### 5.5 文档需求 / Documentation Requirements

- [ ] 快速开始指南
- [ ] API 完整参考
- [ ] React Hooks 使用指南
- [ ] 类型安全最佳实践
- [ ] 离线优先架构指南

---

## 6. cli 命令行工具 / CLI Tool

### 6.1 当前状态 / Current State

**已实现功能**:
- ✅ 基础命令框架 (Commander.js)
- ✅ 配置编译 (compile 命令)

**文件结构**:
```
packages/cli/src/
├── bin.ts                  # CLI 入口
├── index.ts               # 导出
└── commands/
    └── compile.ts         # 编译命令
```

### 6.2 待实现功能清单 / Features Roadmap

#### P0: 脚手架 (Scaffolding)

- [ ] **项目初始化**
  - `os init` - 创建新项目
  - 模板选择 (CRM, Helpdesk, Custom)
  - 包管理器检测 (npm, pnpm, yarn)
  - Git 初始化

- [ ] **代码生成**
  - `os generate object` - 生成对象定义
  - `os generate view` - 生成视图配置
  - `os generate app` - 生成应用配置
  - `os generate plugin` - 生成插件骨架

- [ ] **配置管理**
  - `os config list` - 列出配置
  - `os config set` - 设置配置
  - `os config get` - 获取配置
  - 环境配置管理

#### P0: 迁移 (Migration)

- [ ] **数据库迁移**
  - `os migrate create` - 创建迁移文件
  - `os migrate up` - 执行迁移
  - `os migrate down` - 回滚迁移
  - `os migrate status` - 迁移状态

- [ ] **Schema 迁移**
  - Schema 版本管理
  - 字段添加/删除/修改
  - 数据转换
  - 迁移历史

- [ ] **数据迁移**
  - 数据导入 (`os import`)
  - 数据导出 (`os export`)
  - 数据转换
  - 批量操作

#### P0: 代码生成 (Code Generation)

- [ ] **TypeScript 类型生成**
  - Schema → TypeScript 类型
  - API 客户端生成
  - Zod Schema 生成
  - GraphQL Schema 生成

- [ ] **API 文档生成**
  - OpenAPI/Swagger
  - GraphQL Schema
  - API 使用示例
  - Postman Collection

- [ ] **表单生成器**
  - React 表单组件
  - Vue 表单组件
  - 表单验证
  - 样式主题

#### P1: 开发工具

- [ ] **开发服务器**
  - `os dev` - 启动开发服务器
  - 热重载 (Hot Reload)
  - 错误提示
  - 调试模式

- [ ] **构建工具**
  - `os build` - 生产构建
  - 代码优化
  - Tree Shaking
  - 打包配置

- [ ] **测试工具**
  - `os test` - 运行测试
  - 测试覆盖率
  - 性能测试
  - E2E 测试

#### P2: 扩展功能

- [ ] **插件管理**
  - `os plugin install` - 安装插件
  - `os plugin list` - 列出插件
  - `os plugin remove` - 移除插件
  - 插件版本管理

- [ ] **部署工具**
  - `os deploy` - 部署到云平台
  - Docker 镜像生成
  - K8s 配置生成
  - CI/CD 集成

### 6.3 命令设计 / Command Design

#### 脚手架命令

```bash
# 初始化项目
os init my-app
  --template crm        # 使用 CRM 模板
  --pm pnpm            # 指定包管理器
  --git                # 初始化 Git

# 生成代码
os generate object todo_task
  --fields "subject:text,priority:number"
  --datasource default

os generate view task_list
  --object todo_task
  --type grid
  --columns "subject,priority,status"
```

#### 迁移命令

```bash
# 创建迁移
os migrate create add_priority_field

# 执行迁移
os migrate up

# 回滚迁移
os migrate down --steps 1

# 查看状态
os migrate status
```

#### 代码生成命令

```bash
# 生成 TypeScript 类型
os generate types --output ./src/types

# 生成 API 客户端
os generate client --output ./src/api

# 生成 API 文档
os generate docs --format openapi --output ./docs
```

#### 开发命令

```bash
# 启动开发服务器
os dev --port 3000 --watch

# 生产构建
os build --minify --sourcemap

# 运行测试
os test --coverage --watch
```

### 6.4 测试计划 / Testing Plan

- **命令测试**: 每个命令的功能测试
- **生成代码测试**: 生成的代码可运行
- **迁移测试**: 迁移的正确性
- **集成测试**: 完整工作流测试

### 6.5 文档需求 / Documentation Requirements

- [ ] CLI 命令完整参考
- [ ] 脚手架使用指南
- [ ] 迁移最佳实践
- [ ] 代码生成指南
- [ ] 常见问题解答

---

## 7. types 共享类型 / Shared Types

### 7.1 当前状态 / Current State

**已实现功能**:
- ✅ 基础类型定义
- ✅ 从 `@objectstack/spec` 导入协议类型

**文件结构**:
```
packages/types/src/
└── index.ts                # 类型导出
```

### 7.2 待实现功能清单 / Features Roadmap

#### P0: 运行时环境接口

- [ ] **HTTP 服务器接口**
  - Request/Response 类型
  - 路由类型
  - 中间件类型
  - 服务器配置类型

- [ ] **数据引擎接口**
  - 查询接口
  - 事务接口
  - 连接接口
  - 驱动接口

- [ ] **插件接口**
  - 插件元数据类型
  - 插件生命周期类型
  - 插件配置类型
  - 插件服务类型

#### P1: 通用工具类型

- [ ] **查询类型**
  - Filter 类型
  - Sort 类型
  - Pagination 类型
  - Projection 类型

- [ ] **元数据类型增强**
  - 完整的 Object 类型
  - 完整的 Field 类型
  - 完整的 View 类型
  - 完整的 App 类型

- [ ] **错误类型**
  - 错误代码枚举
  - 错误详情类型
  - 验证错误类型
  - 网络错误类型

#### P2: 类型工具

- [ ] **类型转换工具**
  - Schema → TypeScript
  - TypeScript → JSON Schema
  - 类型合并工具
  - 类型验证工具

- [ ] **类型守卫 (Type Guards)**
  - 运行时类型检查
  - 类型断言工具
  - 类型缩窄工具
  - 自定义类型守卫

### 7.3 类型设计 / Type Design

#### 运行时环境接口

```typescript
// HTTP 服务器接口
export interface IHttpServer {
  get(path: string, handler: RouteHandler): void;
  post(path: string, handler: RouteHandler): void;
  put(path: string, handler: RouteHandler): void;
  delete(path: string, handler: RouteHandler): void;
  use(middleware: Middleware): void;
  listen(port: number): Promise<void>;
  close(): Promise<void>;
}

export type RouteHandler = (
  req: IHttpRequest,
  res: IHttpResponse
) => Promise<void> | void;

// 数据引擎接口
export interface IDataEngine {
  insert<T = any>(object: string, data: Partial<T>): Promise<T>;
  find<T = any>(object: string, query?: Query): Promise<T[]>;
  update<T = any>(object: string, id: string, data: Partial<T>): Promise<T>;
  delete(object: string, id: string): Promise<void>;
  transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>;
}
```

#### 查询类型

```typescript
// Filter 类型
export type FilterOperator =
  | '=' | '!=' | '>' | '>=' | '<' | '<='
  | 'in' | 'not_in'
  | 'contains' | 'starts_with' | 'ends_with'
  | 'is_null' | 'is_not_null';

export type Filter =
  | [field: string, operator: FilterOperator, value: any]
  | { and: Filter[] }
  | { or: Filter[] }
  | { not: Filter };

// Sort 类型
export type SortDirection = 'asc' | 'desc';
export type Sort = string | [field: string, direction: SortDirection];

// Query 类型
export interface Query {
  select?: string[];
  where?: Filter;
  orderBy?: Sort[];
  limit?: number;
  offset?: number;
}
```

#### 错误类型

```typescript
// 错误代码
export enum ErrorCode {
  VALIDATION_ERROR = 'validation_error',
  PERMISSION_DENIED = 'permission_denied',
  NOT_FOUND = 'resource_not_found',
  CONFLICT = 'resource_conflict',
  RATE_LIMIT = 'rate_limit_exceeded',
  INTERNAL_ERROR = 'internal_error',
}

// 错误详情
export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  httpStatus: number;
  retryable: boolean;
  details?: any;
}
```

### 7.4 测试计划 / Testing Plan

- **类型测试**: TypeScript 编译时测试
- **类型兼容性测试**: 与 spec 包的兼容性
- **类型守卫测试**: 运行时类型检查测试

### 7.5 文档需求 / Documentation Requirements

- [ ] 类型系统概览
- [ ] 接口使用指南
- [ ] 类型工具参考
- [ ] 类型最佳实践

---

## 8. 实施时间线 / Implementation Timeline

### Q1 2026 (当前季度)

```
月份 1-2: 基础增强
├─ core: 插件热加载、中间件系统
├─ objectql: SQL构建器、AST解析器
├─ runtime: 服务器抽象、事件总线增强
├─ client: 类型安全查询构建器
├─ cli: 脚手架命令 (init, generate)
└─ types: 运行时环境接口定义

月份 3: 集成与测试
├─ 集成测试
├─ 文档完善
├─ 示例项目
└─ 发布 v0.7.0
```

### Q2 2026

```
月份 4-5: 高级功能
├─ objectql: 查询优化器、事务支持
├─ runtime: 工作器系统、WebSocket
├─ client: React Hooks、离线支持
├─ cli: 迁移系统、代码生成
└─ 性能优化

月份 6: 生态系统
├─ 驱动开发 (PostgreSQL, MySQL, MongoDB)
├─ 插件开发 (缓存、加密)
├─ 模板开发 (CRM, Helpdesk)
└─ 发布 v0.8.0
```

### Q3 2026

```
月份 7-8: 扩展功能
├─ objectql: 跨对象查询
├─ runtime: 微服务支持
├─ client: Vue/Svelte 支持
├─ cli: 部署工具
└─ 开发者工具

月份 9: 稳定化
├─ 性能优化
├─ 安全审计
├─ 文档完善
└─ 发布 v1.0.0
```

### Q4 2026

```
月份 10-12: 生产就绪
├─ 生产部署案例
├─ 企业功能
├─ 商业化准备
├─ 社区建设
└─ 发布 v1.1.0
```

---

## 9. 成功指标 / Success Metrics

### 技术指标

| 指标 | Q1 目标 | Q2 目标 | Q3 目标 | Q4 目标 |
|---|:---:|:---:|:---:|:---:|
| **代码覆盖率** | 70% | 80% | 85% | 90% |
| **TypeScript 严格模式** | ✅ | ✅ | ✅ | ✅ |
| **API 稳定性** | Beta | RC | Stable | Stable |
| **文档完整度** | 60% | 80% | 90% | 95% |
| **性能基准** | Baseline | +20% | +50% | +100% |

### 功能指标

| 功能 | Q1 | Q2 | Q3 | Q4 |
|---|:---:|:---:|:---:|:---:|
| **core - 插件热加载** | ✅ | ✅ | ✅ | ✅ |
| **core - 中间件系统** | ✅ | ✅ | ✅ | ✅ |
| **objectql - SQL构建器** | ✅ | ✅ | ✅ | ✅ |
| **objectql - 查询优化器** | 🔨 | ✅ | ✅ | ✅ |
| **objectql - 事务支持** | 🔨 | ✅ | ✅ | ✅ |
| **runtime - 服务器** | ✅ | ✅ | ✅ | ✅ |
| **runtime - 工作器** | 🔨 | ✅ | ✅ | ✅ |
| **client - 类型安全查询** | ✅ | ✅ | ✅ | ✅ |
| **client - React Hooks** | 🔨 | ✅ | ✅ | ✅ |
| **cli - 脚手架** | ✅ | ✅ | ✅ | ✅ |
| **cli - 迁移系统** | 🔨 | ✅ | ✅ | ✅ |

**图例**: ✅ 已完成 | 🔨 开发中 | 📋 计划中

### 生态系统指标

| 指标 | Q1 | Q2 | Q3 | Q4 |
|---|:---:|:---:|:---:|:---:|
| **NPM 周下载** | 500 | 2K | 5K | 10K |
| **GitHub Stars** | 300 | 800 | 2K | 5K |
| **贡献者** | 5 | 15 | 30 | 50 |
| **驱动数量** | 2 | 5 | 8 | 12 |
| **插件数量** | 3 | 8 | 15 | 25 |
| **模板数量** | 1 | 3 | 6 | 10 |

### 质量指标

| 指标 | 标准 | 当前 | Q2 | Q4 |
|---|:---:|:---:|:---:|:---:|
| **构建时间** | < 30s | 15s | 20s | 25s |
| **测试运行时间** | < 60s | 30s | 45s | 60s |
| **包大小 (core)** | < 50KB | 25KB | 30KB | 35KB |
| **包大小 (client)** | < 100KB | 45KB | 60KB | 80KB |
| **启动时间** | < 100ms | 50ms | 70ms | 90ms |
| **查询延迟 (p99)** | < 50ms | 20ms | 30ms | 40ms |

---

## 附录 A: 依赖关系图

```
┌──────────────────────────────────────────────────────────┐
│                       @objectstack/spec                   │
│                     (协议定义 - 最底层)                     │
└──────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────┐
│                       @objectstack/types                  │
│                    (共享类型 - 第二层)                      │
└──────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                                           ↓
┌─────────────────┐                       ┌─────────────────┐
│ @objectstack/   │                       │ @objectstack/   │
│     core        │                       │    objectql     │
│  (微内核)       │                       │  (查询引擎)     │
└─────────────────┘                       └─────────────────┘
        ↓                                           ↓
        └─────────────────────┬─────────────────────┘
                              ↓
                  ┌─────────────────────┐
                  │  @objectstack/      │
                  │     runtime         │
                  │   (运行时环境)       │
                  └─────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                                           ↓
┌─────────────────┐                       ┌─────────────────┐
│ @objectstack/   │                       │ @objectstack/   │
│     client      │                       │      cli        │
│  (客户端 SDK)   │                       │  (命令行工具)   │
└─────────────────┘                       └─────────────────┘
```

---

## 附录 B: 技术栈

### 核心技术

- **语言**: TypeScript 5.x
- **包管理**: pnpm (Workspace)
- **构建工具**: tsc, tsup
- **测试框架**: Vitest
- **文档**: Markdown, TypeDoc

### core 包

- **日志**: Pino (Node.js), Console (Browser)
- **依赖注入**: 自研 Service Registry
- **事件系统**: 自研 Event Bus

### objectql 包

- **SQL 构建**: 自研 SQL Builder
- **解析器**: 自研 AST Parser
- **验证**: Zod

### runtime 包

- **HTTP**: 抽象接口 (Hono, Express, Fastify 适配器)
- **任务队列**: 待定 (BullMQ, Agenda)
- **消息队列**: 待定 (Kafka, RabbitMQ)

### client 包

- **HTTP 客户端**: Fetch API
- **状态管理**: React Query (React)
- **缓存**: 内存 + LocalStorage

### cli 包

- **CLI 框架**: Commander.js
- **提示**: Inquirer.js
- **颜色**: Chalk
- **代码生成**: 自研模板引擎

---

## 附录 C: 参考资源

### 架构参考

- **Kubernetes**: [https://kubernetes.io/](https://kubernetes.io/)
- **Salesforce**: [https://developer.salesforce.com/](https://developer.salesforce.com/)
- **VS Code Extensions**: [https://code.visualstudio.com/api](https://code.visualstudio.com/api)
- **Prisma**: [https://www.prisma.io/](https://www.prisma.io/)

### 技术文档

- **Zod**: [https://zod.dev/](https://zod.dev/)
- **Pino**: [https://getpino.io/](https://getpino.io/)
- **React Query**: [https://tanstack.com/query](https://tanstack.com/query)
- **Commander.js**: [https://github.com/tj/commander.js](https://github.com/tj/commander.js)

### 内部文档

- [GITHUB_ORGANIZATION_STRUCTURE.md](./GITHUB_ORGANIZATION_STRUCTURE.md)
- [ARCHITECTURE_QUICK_REFERENCE.md](./ARCHITECTURE_QUICK_REFERENCE.md)
- [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)

---

**文档维护 / Maintained By**: ObjectStack 核心团队  
**最后更新 / Last Updated**: 2026-01-30  
**下次审查 / Next Review**: 2026-02-15
