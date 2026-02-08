# API Protocol 实现计划

**日期:** 2026-02-08  
**基于:** `src/api/protocol.zod.ts` (ObjectStackProtocolSchema)  
**关联:** `src/system/core-services.zod.ts` (CoreServiceName)  
**目标:** 定义 API Protocol 的内核服务划分、REST Endpoint 规范、以及插件实现策略

---

## 概述

ObjectStackProtocolSchema 定义了 **61 个方法**，横跨 **14 个命名空间**。本文档评估每个命名空间应由哪个内核服务（CoreService）负责，以及如何通过插件机制暴露为 REST/WebSocket Endpoint。

### 设计原则

1. **Protocol-Service 对齐**: 每个 Protocol 命名空间由一个核心服务（CoreServiceName）负责实现
2. **HttpDispatcher 路由**: 内核中的 HttpDispatcher 根据 URL 前缀将请求路由到对应服务
3. **插件化实现**: 除了 `metadata`、`data`、`auth` 三个 Required 服务外，其他服务均可通过插件提供
4. **契约驱动**: 所有 Request/Response 通过 Zod Schema 校验，保证类型安全

---

## 第一部分：内核服务与 Protocol 命名空间映射

### 1.1 服务分类总表

| CoreServiceName | 级别 | Protocol 命名空间 | 方法数 | 实现方式 |
|:---|:---|:---|:---:|:---|
| `metadata` | **required** | Discovery & Metadata | 7 | 内核内置 |
| `data` | **required** | Data CRUD, Batch | 9 | 内核内置 |
| `auth` | **required** | Permission | 3 | 内核内置 |
| `cache` | **core** | (内部服务，无直接 API) | 0 | 内核内置 (内存降级) |
| `queue` | **core** | (内部服务，无直接 API) | 0 | 内核内置 (内存降级) |
| `job` | **core** | (内部服务，无直接 API) | 0 | 内核内置 (内存降级) |
| `automation` | optional | Automation | 1 | 插件提供 |
| `analytics` | optional | Analytics | 2 | 插件提供 |
| `hub` | optional | Hub, Packages | 9 | 插件提供 |
| `realtime` | optional | Realtime | 6 | 插件提供 |
| `notification` | optional | Notification | 7 | 插件提供 |
| `graphql` | optional | (独立端点 /graphql) | 0 | 插件提供 |
| — (新增) `ai` | optional | AI | 4 | 插件提供 |
| — (新增) `i18n` | optional | i18n | 3 | 插件提供 |
| — (新增) `ui` | optional | View Management | 5 | 插件提供 |
| — (新增) `workflow` | optional | Workflow | 5 | 插件提供 |

> **发现**: 目前 CoreServiceName 缺少 `ai`、`i18n`、`ui`、`workflow` 四个服务标识符。需要在 `core-services.zod.ts` 中扩展。

### 1.2 内核必须内置的服务 (Required)

这三个服务构成内核的最小运行集，不依赖任何插件即可工作：

```
┌─────────────────────────────────────────────────┐
│                  ObjectKernel                    │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ metadata │  │   data   │  │   auth   │      │
│  │ Service  │  │ Service  │  │ Service  │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │              │              │             │
│       └──────────────┼──────────────┘             │
│                      │                            │
│              ┌───────┴───────┐                    │
│              │ HttpDispatcher│                    │
│              └───────┬───────┘                    │
│                      │                            │
└──────────────────────┼────────────────────────────┘
                       │
              HTTP Request/Response
```

### 1.3 插件提供的服务 (Optional)

每个插件通过 `contributes` 机制注册自己提供的服务，内核通过 ServiceRegistry 发现并路由。

```
┌─────────────────────────────────────────────────────────┐
│                    Plugin Layer                          │
│                                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────────────┐   │
│  │ @os/plugin │ │ @os/plugin │ │ @os/plugin          │   │
│  │ -realtime  │ │ -analytics │ │ -ai                 │   │
│  │            │ │            │ │                     │   │
│  │ Provides:  │ │ Provides:  │ │ Provides:           │   │
│  │ realtime   │ │ analytics  │ │ ai, nlq, chat       │   │
│  │ service    │ │ service    │ │ services             │   │
│  └──────┬─────┘ └──────┬─────┘ └──────────┬──────────┘   │
│         │              │                   │              │
│         └──────────────┼───────────────────┘              │
│                        │                                  │
│                ┌───────┴───────┐                          │
│                │ServiceRegistry│                          │
│                └───────────────┘                          │
└─────────────────────────────────────────────────────────┘
```

---

## 第二部分：REST Endpoint 规范

### 2.1 URL 路由设计

所有 API 路由遵循统一前缀结构：`{basePath}/{version}/{namespace}/{resource}`

其中 `basePath` 默认为 `/api`，`version` 默认为 `v1`。

### 2.2 Discovery & Metadata Endpoints (metadata 服务)

| 方法 | HTTP | Endpoint | 描述 |
|:---|:---|:---|:---|
| `getDiscovery` | GET | `/api/v1/discovery` | 获取 API 发现信息（路由表、能力清单） |
| `getMetaTypes` | GET | `/api/v1/meta` | 列出所有元数据类型 |
| `getMetaItems` | GET | `/api/v1/meta/:type` | 获取某类型下的所有元数据项 |
| `getMetaItem` | GET | `/api/v1/meta/:type/:name` | 获取单个元数据项 |
| `saveMetaItem` | PUT | `/api/v1/meta/:type/:name` | 创建或更新元数据项 |
| `getMetaItemCached` | GET | `/api/v1/meta/:type/:name` | 支持 `If-None-Match` / `If-Modified-Since` 缓存 |
| `getUiView` | GET | `/api/v1/meta/view/resolve?object=:object&type=:type` | 根据上下文解析 UI View |

**实现说明:**
- `getMetaItemCached` 与 `getMetaItem` 共用同一路由，根据请求头自动判断是否返回缓存响应（304 Not Modified）
- Discovery endpoint 是公开的（无需认证），其他 metadata 端点需要 `system.metadata.read` 权限

### 2.3 Data CRUD Endpoints (data 服务)

| 方法 | HTTP | Endpoint | 描述 |
|:---|:---|:---|:---|
| `findData` | GET | `/api/v1/data/:object` | 查询记录列表 |
| `getData` | GET | `/api/v1/data/:object/:id` | 获取单条记录 |
| `createData` | POST | `/api/v1/data/:object` | 创建记录 |
| `updateData` | PATCH | `/api/v1/data/:object/:id` | 更新记录 |
| `deleteData` | DELETE | `/api/v1/data/:object/:id` | 删除记录 |

**查询参数 (findData):**
```
GET /api/v1/data/account?$filter=status eq 'active'&$select=name,revenue&$top=10&$skip=0&$orderby=name asc
```

### 2.4 Batch Endpoints (data 服务)

| 方法 | HTTP | Endpoint | 描述 |
|:---|:---|:---|:---|
| `batchData` | POST | `/api/v1/data/:object/batch` | 通用批量操作 |
| `createManyData` | POST | `/api/v1/data/:object/createMany` | 批量创建 |
| `updateManyData` | POST | `/api/v1/data/:object/updateMany` | 批量更新 |
| `deleteManyData` | POST | `/api/v1/data/:object/deleteMany` | 批量删除 |

### 2.5 Analytics Endpoints (analytics 服务 - 插件)

| 方法 | HTTP | Endpoint | 描述 |
|:---|:---|:---|:---|
| `analyticsQuery` | POST | `/api/v1/analytics/query` | 执行分析查询 |
| `getAnalyticsMeta` | GET | `/api/v1/analytics/meta` | 获取分析元数据（维度、度量） |

**插件:** `@objectstack/plugin-analytics`

### 2.6 Automation Endpoint (automation 服务 - 插件)

| 方法 | HTTP | Endpoint | 描述 |
|:---|:---|:---|:---|
| `triggerAutomation` | POST | `/api/v1/automation/trigger` | 触发自动化流程 |

**插件:** `@objectstack/plugin-automation`

### 2.7 Hub Endpoints (hub 服务 - 插件)

| 方法 | HTTP | Endpoint | 描述 |
|:---|:---|:---|:---|
| `listSpaces` | GET | `/api/v1/hub/spaces` | 列出 Hub 空间 |
| `createSpace` | POST | `/api/v1/hub/spaces` | 创建 Hub 空间 |
| `installPlugin` | POST | `/api/v1/hub/spaces/:spaceId/plugins` | 安装插件到空间 |

**插件:** `@objectstack/plugin-hub`

### 2.8 Package Management Endpoints (hub 服务 - 插件)

| 方法 | HTTP | Endpoint | 描述 |
|:---|:---|:---|:---|
| `listPackages` | GET | `/api/v1/packages` | 列出已安装的包 |
| `getPackage` | GET | `/api/v1/packages/:id` | 获取指定包信息 |
| `installPackage` | POST | `/api/v1/packages` | 安装新包 |
| `uninstallPackage` | DELETE | `/api/v1/packages/:id` | 卸载包 |
| `enablePackage` | POST | `/api/v1/packages/:id/enable` | 启用包 |
| `disablePackage` | POST | `/api/v1/packages/:id/disable` | 禁用包 |

**说明:** Package Management 可以作为内核内置功能（因为包管理是启动阶段必需的），也可以由 hub 插件扩展。推荐内核内置基础的 list/get，插件扩展 install/uninstall。

### 2.9 View Management Endpoints (ui 服务 - 插件)

| 方法 | HTTP | Endpoint | 描述 |
|:---|:---|:---|:---|
| `listViews` | GET | `/api/v1/ui/views/:object` | 列出对象的视图 |
| `getView` | GET | `/api/v1/ui/views/:object/:viewId` | 获取指定视图 |
| `createView` | POST | `/api/v1/ui/views/:object` | 创建视图 |
| `updateView` | PATCH | `/api/v1/ui/views/:object/:viewId` | 更新视图 |
| `deleteView` | DELETE | `/api/v1/ui/views/:object/:viewId` | 删除视图 |

**插件:** `@objectstack/plugin-ui-api`

### 2.10 Permission Endpoints (auth 服务)

| 方法 | HTTP | Endpoint | 描述 |
|:---|:---|:---|:---|
| `checkPermission` | POST | `/api/v1/auth/check` | 检查权限 |
| `getObjectPermissions` | GET | `/api/v1/auth/permissions/:object` | 获取对象权限 |
| `getEffectivePermissions` | GET | `/api/v1/auth/permissions/effective` | 获取当前用户有效权限 |

### 2.11 Workflow Endpoints (workflow 服务 - 插件)

| 方法 | HTTP | Endpoint | 描述 |
|:---|:---|:---|:---|
| `getWorkflowConfig` | GET | `/api/v1/workflow/:object/config` | 获取对象的工作流配置 |
| `getWorkflowState` | GET | `/api/v1/workflow/:object/:recordId/state` | 获取记录的工作流状态 |
| `workflowTransition` | POST | `/api/v1/workflow/:object/:recordId/transition` | 执行状态转换 |
| `workflowApprove` | POST | `/api/v1/workflow/:object/:recordId/approve` | 审批通过 |
| `workflowReject` | POST | `/api/v1/workflow/:object/:recordId/reject` | 审批驳回 |

**插件:** `@objectstack/plugin-workflow`

### 2.12 Realtime Endpoints (realtime 服务 - 插件)

| 方法 | HTTP | Endpoint | 描述 |
|:---|:---|:---|:---|
| `realtimeConnect` | POST | `/api/v1/realtime/connect` | 建立实时连接（返回 WS URL） |
| `realtimeDisconnect` | POST | `/api/v1/realtime/disconnect` | 断开实时连接 |
| `realtimeSubscribe` | POST | `/api/v1/realtime/subscribe` | 订阅频道 |
| `realtimeUnsubscribe` | POST | `/api/v1/realtime/unsubscribe` | 取消订阅 |
| `setPresence` | PUT | `/api/v1/realtime/presence` | 设置在线状态 |
| `getPresence` | GET | `/api/v1/realtime/presence/:channel` | 获取频道在线状态 |

**实际传输:** 除 `connect` 外，其余操作通常通过 WebSocket 帧完成，REST 端点作为回退。

**插件:** `@objectstack/plugin-realtime`

### 2.13 Notification Endpoints (notification 服务 - 插件)

| 方法 | HTTP | Endpoint | 描述 |
|:---|:---|:---|:---|
| `registerDevice` | POST | `/api/v1/notifications/devices` | 注册推送设备 |
| `unregisterDevice` | DELETE | `/api/v1/notifications/devices/:deviceId` | 注销推送设备 |
| `getNotificationPreferences` | GET | `/api/v1/notifications/preferences` | 获取通知偏好 |
| `updateNotificationPreferences` | PATCH | `/api/v1/notifications/preferences` | 更新通知偏好 |
| `listNotifications` | GET | `/api/v1/notifications` | 列出通知 |
| `markNotificationsRead` | POST | `/api/v1/notifications/read` | 标记已读 |
| `markAllNotificationsRead` | POST | `/api/v1/notifications/readAll` | 全部标记已读 |

**插件:** `@objectstack/plugin-notification`

### 2.14 AI Endpoints (ai 服务 - 插件)

| 方法 | HTTP | Endpoint | 描述 |
|:---|:---|:---|:---|
| `aiNlq` | POST | `/api/v1/ai/nlq` | 自然语言查询 |
| `aiChat` | POST | `/api/v1/ai/chat` | AI 对话 |
| `aiSuggest` | POST | `/api/v1/ai/suggest` | AI 建议 |
| `aiInsights` | POST | `/api/v1/ai/insights` | AI 洞察 |

**插件:** `@objectstack/plugin-ai`

### 2.15 i18n Endpoints (i18n 服务 - 插件)

| 方法 | HTTP | Endpoint | 描述 |
|:---|:---|:---|:---|
| `getLocales` | GET | `/api/v1/i18n/locales` | 获取可用语言列表 |
| `getTranslations` | GET | `/api/v1/i18n/translations/:locale` | 获取翻译数据 |
| `getFieldLabels` | GET | `/api/v1/i18n/labels/:object/:locale` | 获取字段翻译标签 |

**插件:** `@objectstack/plugin-i18n`

---

## 第三部分：内核改造计划

### 3.1 扩展 CoreServiceName（P0）

**文件:** `src/system/core-services.zod.ts`

当前 CoreServiceName 缺少 Protocol 中需要的服务标识符。需要扩展：

```typescript
export const CoreServiceName = z.enum([
  // 现有 Required 服务
  'metadata',
  'data',
  'auth',
  
  // 现有 Core 基础设施
  'cache',
  'queue',
  'job',
  
  // 现有 Optional 服务
  'file-storage',
  'search',
  'automation',
  'graphql',
  'analytics',
  'hub',
  'realtime',
  'notification',
  
  // === 新增服务 ===
  'ai',           // AI 引擎（NLQ、Chat、Suggest、Insights）
  'i18n',         // 国际化服务
  'ui',           // UI 元数据服务（View CRUD）
  'workflow',     // 工作流引擎
]);
```

同时更新 `ServiceRequirementDef`：

```typescript
export const ServiceRequirementDef = {
  // Required
  metadata: 'required',
  data: 'required',
  auth: 'required',
  // Core
  cache: 'core',
  queue: 'core',
  job: 'core',
  // Optional（现有）
  'file-storage': 'optional',
  search: 'optional',
  automation: 'optional',
  graphql: 'optional',
  analytics: 'optional',
  hub: 'optional',
  realtime: 'optional',
  notification: 'optional',
  // Optional（新增）
  ai: 'optional',
  i18n: 'optional',
  ui: 'optional',
  workflow: 'optional',
} as const;
```

### 3.2 ApiRoutes 扩展（P0）

**文件:** `src/api/discovery.zod.ts`

当前 ApiRoutesSchema 缺少几个路由项，需要补充：

```typescript
export const ApiRoutesSchema = z.object({
  // 现有路由
  data: z.string().describe('e.g. /api/v1/data'),
  metadata: z.string().describe('e.g. /api/v1/meta'),
  ui: z.string().optional().describe('e.g. /api/v1/ui'),
  auth: z.string().describe('e.g. /api/v1/auth'),
  automation: z.string().optional().describe('e.g. /api/v1/automation'),
  storage: z.string().optional().describe('e.g. /api/v1/storage'),
  analytics: z.string().optional().describe('e.g. /api/v1/analytics'),
  hub: z.string().optional().describe('e.g. /api/v1/hub'),
  graphql: z.string().optional().describe('e.g. /graphql'),
  
  // === 新增路由 ===
  packages: z.string().optional().describe('e.g. /api/v1/packages'),
  workflow: z.string().optional().describe('e.g. /api/v1/workflow'),
  realtime: z.string().optional().describe('e.g. /api/v1/realtime'),
  notifications: z.string().optional().describe('e.g. /api/v1/notifications'),
  ai: z.string().optional().describe('e.g. /api/v1/ai'),
  i18n: z.string().optional().describe('e.g. /api/v1/i18n'),
});
```

### 3.3 HttpDispatcher 路由表协议（P1）

**新文件:** `src/api/dispatcher.zod.ts`

定义 HttpDispatcher 如何将 URL 前缀路由到对应服务：

```typescript
/**
 * 路由-服务映射规则
 * HttpDispatcher 使用此映射将 API 请求分发到内核服务
 */
export const DispatcherRouteSchema = z.object({
  /** URL 前缀 (e.g. '/api/v1/data') */
  prefix: z.string().describe('URL path prefix for routing'),
  /** 目标服务名 */
  service: CoreServiceName.describe('Target core service name'),
  /** 是否需要认证 */
  authRequired: z.boolean().default(true),
  /** 服务级别（决定服务不可用时的行为） */
  criticality: ServiceCriticalitySchema.default('optional'),
});

/**
 * 完整路由表
 */
export const DispatcherConfigSchema = z.object({
  routes: z.array(DispatcherRouteSchema),
  /** 未匹配路由的默认行为 */
  fallback: z.enum(['404', 'proxy', 'custom']).default('404'),
});
```

### 3.4 插件注册 API 路由的协议（P1）

**修改文件:** `src/kernel/manifest.zod.ts` → `contributes`

在 Manifest 的 `contributes` 中新增 `routes` 字段，让插件可以声明自己提供哪些 API 路由：

```typescript
contributes: z.object({
  // ... 现有字段 ...
  
  /**
   * Register API route namespaces.
   * Declares the API endpoints this plugin provides.
   * The kernel HttpDispatcher will route matching prefixes to this plugin.
   */
  routes: z.array(z.object({
    /** URL 前缀 */
    prefix: z.string().describe('API path prefix (e.g. "/api/v1/ai")'),
    /** 提供的服务名 */
    service: z.string().describe('Service name this plugin provides'),
    /** 支持的 Protocol 方法列表 */
    methods: z.array(z.string()).optional()
      .describe('Protocol method names implemented (e.g. ["aiNlq", "aiChat"])'),
  })).optional().describe('API route contributions'),
}).optional(),
```

---

## 第四部分：插件开发计划

### 4.1 插件全景

| 插件 | 提供服务 | Protocol 方法 | 优先级 | 依赖 |
|:---|:---|:---:|:---|:---|
| `@objectstack/plugin-rest-api` | (内核核心) | 19 | **P0** | metadata, data, auth |
| `@objectstack/plugin-ui-api` | `ui` | 5 | **P1** | metadata |
| `@objectstack/plugin-workflow` | `workflow` | 5 | **P1** | data, automation |
| `@objectstack/plugin-analytics` | `analytics` | 2 | **P1** | data |
| `@objectstack/plugin-automation` | `automation` | 1 | **P1** | data, queue |
| `@objectstack/plugin-i18n` | `i18n` | 3 | **P1** | metadata |
| `@objectstack/plugin-notification` | `notification` | 7 | **P2** | queue, data |
| `@objectstack/plugin-realtime` | `realtime` | 6 | **P2** | cache |
| `@objectstack/plugin-ai` | `ai` | 4 | **P2** | data, (external LLM) |
| `@objectstack/plugin-hub` | `hub` | 3 | **P2** | data, auth |
| `@objectstack/plugin-graphql` | `graphql` | 0* | **P3** | metadata, data |

> *GraphQL 不在 ObjectStackProtocolSchema 中定义方法，而是通过 Schema 自动生成。

### 4.2 P0: plugin-rest-api（内核 REST 网关）

这是核心 server 类型插件，负责将 ObjectStackProtocolSchema 的 Required 方法暴露为 REST Endpoint。

**类型:** `server`  
**依赖:** 内核 metadata, data, auth 服务

```typescript
// objectstack.config.ts
import { defineStack } from '@objectstack/core';

export default defineStack({
  id: 'com.objectstack.plugin-rest-api',
  version: '1.0.0',
  type: 'server',
  name: 'REST API Server',
  
  contributes: {
    routes: [
      { prefix: '/api/v1/discovery', service: 'metadata' },
      { prefix: '/api/v1/meta',      service: 'metadata' },
      { prefix: '/api/v1/data',      service: 'data' },
      { prefix: '/api/v1/auth',      service: 'auth' },
      { prefix: '/api/v1/packages',  service: 'hub' },
    ],
  },
});
```

**路由注册实现模式:**

```typescript
// src/main.ts
export default function activate(ctx: PluginContext) {
  const { app, ql, os } = ctx;
  
  // Discovery
  app.router.get('/api/v1/discovery', async (c) => {
    return c.json(await os.getDiscovery());
  });
  
  // Metadata CRUD
  app.router.get('/api/v1/meta', async (c) => {
    const result = await os.getMetaTypes();
    return c.json(result);
  });
  
  app.router.get('/api/v1/meta/:type', async (c) => {
    const { type } = c.req.param();
    const result = await os.getMetaItems({ type });
    return c.json(result);
  });
  
  // Data CRUD
  app.router.get('/api/v1/data/:object', async (c) => {
    const { object } = c.req.param();
    const query = parseQueryParams(c.req.query());
    const result = await ql.object(object).find(query);
    return c.json(result);
  });
  
  app.router.get('/api/v1/data/:object/:id', async (c) => {
    const { object, id } = c.req.param();
    const result = await ql.object(object).findOne(id);
    return c.json(result);
  });
  
  app.router.post('/api/v1/data/:object', async (c) => {
    const { object } = c.req.param();
    const data = await c.req.json();
    const result = await ql.object(object).insert(data);
    return c.json(result, 201);
  });
  
  // ... 更多路由
}
```

### 4.3 P1: plugin-workflow（工作流插件）

**类型:** `standard`  
**提供服务:** `workflow`  
**Protocol 方法:** getWorkflowConfig, getWorkflowState, workflowTransition, workflowApprove, workflowReject

```typescript
// objectstack.config.ts
export default defineStack({
  id: 'com.objectstack.plugin-workflow',
  version: '1.0.0',
  type: 'plugin',
  name: 'Workflow Engine',
  
  contributes: {
    routes: [
      {
        prefix: '/api/v1/workflow',
        service: 'workflow',
        methods: [
          'getWorkflowConfig',
          'getWorkflowState',
          'workflowTransition',
          'workflowApprove',
          'workflowReject',
        ],
      },
    ],
  },
});
```

### 4.4 P1: plugin-ui-api（UI 元数据 API 插件）

**类型:** `standard`  
**提供服务:** `ui`  
**Protocol 方法:** listViews, getView, createView, updateView, deleteView

```typescript
export default defineStack({
  id: 'com.objectstack.plugin-ui-api',
  version: '1.0.0',
  type: 'plugin',
  name: 'UI Metadata API',
  
  contributes: {
    routes: [
      {
        prefix: '/api/v1/ui',
        service: 'ui',
        methods: ['listViews', 'getView', 'createView', 'updateView', 'deleteView'],
      },
    ],
  },
});
```

### 4.5 P2: plugin-ai（AI 插件）

**类型:** `agent`  
**提供服务:** `ai`  
**Protocol 方法:** aiNlq, aiChat, aiSuggest, aiInsights

```typescript
export default defineStack({
  id: 'com.objectstack.plugin-ai',
  version: '1.0.0',
  type: 'agent',
  name: 'AI Engine',
  
  configuration: {
    title: 'AI Configuration',
    properties: {
      provider: { type: 'string', default: 'openai', enum: ['openai', 'anthropic', 'local'] },
      apiKey: { type: 'string', secret: true },
      model: { type: 'string', default: 'gpt-4o' },
    },
  },
  
  contributes: {
    routes: [
      {
        prefix: '/api/v1/ai',
        service: 'ai',
        methods: ['aiNlq', 'aiChat', 'aiSuggest', 'aiInsights'],
      },
    ],
  },
});
```

### 4.6 P2: plugin-notification（通知插件）

**类型:** `standard`  
**提供服务:** `notification`  
**Protocol 方法:** 7 个通知方法

```typescript
export default defineStack({
  id: 'com.objectstack.plugin-notification',
  version: '1.0.0',
  type: 'plugin',
  name: 'Notification Engine',
  
  contributes: {
    routes: [
      {
        prefix: '/api/v1/notifications',
        service: 'notification',
        methods: [
          'registerDevice', 'unregisterDevice',
          'getNotificationPreferences', 'updateNotificationPreferences',
          'listNotifications', 'markNotificationsRead', 'markAllNotificationsRead',
        ],
      },
    ],
  },
});
```

### 4.7 P2: plugin-realtime（实时通信插件）

**类型:** `standard`  
**提供服务:** `realtime`  
**Protocol 方法:** 6 个实时方法

```typescript
export default defineStack({
  id: 'com.objectstack.plugin-realtime',
  version: '1.0.0',
  type: 'plugin',
  name: 'Realtime Engine',
  
  contributes: {
    routes: [
      {
        prefix: '/api/v1/realtime',
        service: 'realtime',
        methods: [
          'realtimeConnect', 'realtimeDisconnect',
          'realtimeSubscribe', 'realtimeUnsubscribe',
          'setPresence', 'getPresence',
        ],
      },
    ],
  },
});
```

---

## 第五部分：分阶段实施路线

### Phase 1: 内核基础改造（1-2 周）

- [ ] **1.1** 扩展 CoreServiceName，增加 `ai`、`i18n`、`ui`、`workflow` 四个服务标识
- [ ] **1.2** 扩展 ApiRoutesSchema，增加新的路由端点声明
- [ ] **1.3** 创建 `src/api/dispatcher.zod.ts`，定义 HttpDispatcher 路由配置协议
- [ ] **1.4** 扩展 ManifestSchema `contributes.routes`，允许插件声明 API 路由贡献
- [ ] **1.5** 补充所有相关 `.test.ts` 单元测试
- [ ] **1.6** 更新 PROTOCOL_MAP.md 文档

### Phase 2: 核心 REST API 插件（2-3 周）

- [ ] **2.1** 实现 `plugin-rest-api`：注册 Discovery、Metadata、Data CRUD、Batch、Permission 路由
- [ ] **2.2** Request 校验中间件：使用 Zod Schema 自动验证请求体
- [ ] **2.3** Response 封装：统一使用 `BaseResponseSchema` 信封格式
- [ ] **2.4** 错误处理：统一使用 `ApiErrorSchema` 格式
- [ ] **2.5** OpenAPI 文档自动生成（基于 `documentation.zod.ts`）

### Phase 3: 功能插件矩阵（3-4 周）

- [ ] **3.1** 实现 `plugin-ui-api` (View CRUD)
- [ ] **3.2** 实现 `plugin-workflow` (工作流状态机)
- [ ] **3.3** 实现 `plugin-analytics` (分析查询)
- [ ] **3.4** 实现 `plugin-automation` (自动化触发)
- [ ] **3.5** 实现 `plugin-i18n` (国际化)

### Phase 4: 高级功能插件（3-4 周）

- [ ] **4.1** 实现 `plugin-notification` (设备注册、通知管理)
- [ ] **4.2** 实现 `plugin-realtime` (WebSocket、Presence)
- [ ] **4.3** 实现 `plugin-ai` (NLQ、Chat、Suggest、Insights)
- [ ] **4.4** 实现 `plugin-hub` (空间管理、插件市场)
- [ ] **4.5** 实现 `plugin-graphql` (GraphQL Schema 自动生成)

---

## 第六部分：架构决策记录 (ADR)

### ADR-001: 服务不可用时的降级策略

**决策:** 当插件提供的 optional 服务不可用时，对应的 API 端点返回 `503 Service Unavailable`，同时在 Discovery 响应的 `capabilities` 中标记该功能为 `false`。

**理由:** 前端通过 Discovery 获取能力清单，可以在 UI 层面隐藏未启用的功能，无需硬编码。

### ADR-002: Package Management 归属

**决策:** `listPackages` 和 `getPackage` 由内核内置（因为启动阶段需要包注册），`installPackage`、`uninstallPackage`、`enablePackage`、`disablePackage` 由 hub 插件提供。

**理由:** 包的查询是只读操作，几乎不依赖外部服务；而包的安装/卸载涉及复杂的生命周期管理、依赖解析，适合由专门插件处理。

### ADR-003: REST vs WebSocket 分界

**决策:** Realtime 命名空间同时提供 REST 和 WebSocket 两种接口。REST 用于连接管理（connect/disconnect），WebSocket 用于实际的消息传输（subscribe/unsubscribe/presence）。

**理由:** REST 适合请求-响应模式的管理操作，WebSocket 适合长连接的双向通信。

### ADR-004: 插件路由注册时机

**决策:** 插件在 `onEnable` 生命周期钩子中注册路由，在 `onDisable` 中注销路由。内核 HttpDispatcher 维护动态路由表。

**理由:** 支持热插拔，插件启用/禁用不需要重启服务器。

---

## 附录 A：完整 Protocol-to-Endpoint 映射表

| # | Protocol 方法 | 服务 | HTTP 方法 | Endpoint | 认证 |
|:---:|:---|:---|:---|:---|:---:|
| 1 | getDiscovery | metadata | GET | /api/v1/discovery | ❌ |
| 2 | getMetaTypes | metadata | GET | /api/v1/meta | ✅ |
| 3 | getMetaItems | metadata | GET | /api/v1/meta/:type | ✅ |
| 4 | getMetaItem | metadata | GET | /api/v1/meta/:type/:name | ✅ |
| 5 | saveMetaItem | metadata | PUT | /api/v1/meta/:type/:name | ✅ |
| 6 | getMetaItemCached | metadata | GET | /api/v1/meta/:type/:name | ✅ |
| 7 | getUiView | metadata | GET | /api/v1/meta/view/resolve | ✅ |
| 8 | analyticsQuery | analytics | POST | /api/v1/analytics/query | ✅ |
| 9 | getAnalyticsMeta | analytics | GET | /api/v1/analytics/meta | ✅ |
| 10 | triggerAutomation | automation | POST | /api/v1/automation/trigger | ✅ |
| 11 | listSpaces | hub | GET | /api/v1/hub/spaces | ✅ |
| 12 | createSpace | hub | POST | /api/v1/hub/spaces | ✅ |
| 13 | installPlugin | hub | POST | /api/v1/hub/spaces/:spaceId/plugins | ✅ |
| 14 | listPackages | hub | GET | /api/v1/packages | ✅ |
| 15 | getPackage | hub | GET | /api/v1/packages/:id | ✅ |
| 16 | installPackage | hub | POST | /api/v1/packages | ✅ |
| 17 | uninstallPackage | hub | DELETE | /api/v1/packages/:id | ✅ |
| 18 | enablePackage | hub | POST | /api/v1/packages/:id/enable | ✅ |
| 19 | disablePackage | hub | POST | /api/v1/packages/:id/disable | ✅ |
| 20 | findData | data | GET | /api/v1/data/:object | ✅ |
| 21 | getData | data | GET | /api/v1/data/:object/:id | ✅ |
| 22 | createData | data | POST | /api/v1/data/:object | ✅ |
| 23 | updateData | data | PATCH | /api/v1/data/:object/:id | ✅ |
| 24 | deleteData | data | DELETE | /api/v1/data/:object/:id | ✅ |
| 25 | batchData | data | POST | /api/v1/data/:object/batch | ✅ |
| 26 | createManyData | data | POST | /api/v1/data/:object/createMany | ✅ |
| 27 | updateManyData | data | POST | /api/v1/data/:object/updateMany | ✅ |
| 28 | deleteManyData | data | POST | /api/v1/data/:object/deleteMany | ✅ |
| 29 | listViews | ui | GET | /api/v1/ui/views/:object | ✅ |
| 30 | getView | ui | GET | /api/v1/ui/views/:object/:viewId | ✅ |
| 31 | createView | ui | POST | /api/v1/ui/views/:object | ✅ |
| 32 | updateView | ui | PATCH | /api/v1/ui/views/:object/:viewId | ✅ |
| 33 | deleteView | ui | DELETE | /api/v1/ui/views/:object/:viewId | ✅ |
| 34 | checkPermission | auth | POST | /api/v1/auth/check | ✅ |
| 35 | getObjectPermissions | auth | GET | /api/v1/auth/permissions/:object | ✅ |
| 36 | getEffectivePermissions | auth | GET | /api/v1/auth/permissions/effective | ✅ |
| 37 | getWorkflowConfig | workflow | GET | /api/v1/workflow/:object/config | ✅ |
| 38 | getWorkflowState | workflow | GET | /api/v1/workflow/:object/:recordId/state | ✅ |
| 39 | workflowTransition | workflow | POST | /api/v1/workflow/:object/:recordId/transition | ✅ |
| 40 | workflowApprove | workflow | POST | /api/v1/workflow/:object/:recordId/approve | ✅ |
| 41 | workflowReject | workflow | POST | /api/v1/workflow/:object/:recordId/reject | ✅ |
| 42 | realtimeConnect | realtime | POST | /api/v1/realtime/connect | ✅ |
| 43 | realtimeDisconnect | realtime | POST | /api/v1/realtime/disconnect | ✅ |
| 44 | realtimeSubscribe | realtime | POST | /api/v1/realtime/subscribe | ✅ |
| 45 | realtimeUnsubscribe | realtime | POST | /api/v1/realtime/unsubscribe | ✅ |
| 46 | setPresence | realtime | PUT | /api/v1/realtime/presence | ✅ |
| 47 | getPresence | realtime | GET | /api/v1/realtime/presence/:channel | ✅ |
| 48 | registerDevice | notification | POST | /api/v1/notifications/devices | ✅ |
| 49 | unregisterDevice | notification | DELETE | /api/v1/notifications/devices/:deviceId | ✅ |
| 50 | getNotificationPreferences | notification | GET | /api/v1/notifications/preferences | ✅ |
| 51 | updateNotificationPreferences | notification | PATCH | /api/v1/notifications/preferences | ✅ |
| 52 | listNotifications | notification | GET | /api/v1/notifications | ✅ |
| 53 | markNotificationsRead | notification | POST | /api/v1/notifications/read | ✅ |
| 54 | markAllNotificationsRead | notification | POST | /api/v1/notifications/readAll | ✅ |
| 55 | aiNlq | ai | POST | /api/v1/ai/nlq | ✅ |
| 56 | aiChat | ai | POST | /api/v1/ai/chat | ✅ |
| 57 | aiSuggest | ai | POST | /api/v1/ai/suggest | ✅ |
| 58 | aiInsights | ai | POST | /api/v1/ai/insights | ✅ |
| 59 | getLocales | i18n | GET | /api/v1/i18n/locales | ✅ |
| 60 | getTranslations | i18n | GET | /api/v1/i18n/translations/:locale | ✅ |
| 61 | getFieldLabels | i18n | GET | /api/v1/i18n/labels/:object/:locale | ✅ |

---

## 附录 B：Spec 包需要的代码变更清单

以下是在 `packages/spec` 中需要实施的具体代码变更：

| 文件 | 变更类型 | 描述 |
|:---|:---|:---|
| `src/system/core-services.zod.ts` | 修改 | 扩展 CoreServiceName 和 ServiceRequirementDef |
| `src/api/discovery.zod.ts` | 修改 | 扩展 ApiRoutesSchema 增加新路由字段 |
| `src/api/dispatcher.zod.ts` | 新建 | HttpDispatcher 路由配置协议 |
| `src/kernel/manifest.zod.ts` | 修改 | contributes 增加 routes 字段 |
| `src/api/index.ts` | 修改 | 导出新模块 |
| `src/system/core-services.test.ts` | 新建/修改 | 新增服务的测试 |
| `src/api/dispatcher.test.ts` | 新建 | Dispatcher 协议测试 |
| `src/api/discovery.test.ts` | 修改 | ApiRoutes 扩展测试 |
