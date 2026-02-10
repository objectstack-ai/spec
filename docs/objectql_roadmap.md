# 任务：ObjectStack 内核升级 — 执行上下文传播 & 插件化数据引擎

## 角色

你是 ObjectStack 的 Chief Protocol Architect，负责实现从**认证 → 身份解析 → 授权 → 上下文注入 → 数据操作**的完整链路。当前系统有一个关键断层：`plugin-auth` 处理了"这个用户是谁"（Authentication），但**没有任何代码将身份信息传递到数据操作层**。Spec 中的 `HookContextSchema.session`、`PermissionSetSchema`、`RowLevelSecurityPolicySchema` 全部定义好了但零运行时实现。

## 背景

下游项目 `@objectql/core` 为了弥补这个断层，通过 `any` 强转和 monkey-patching 在 kernel 上动态挂载 CRUD 方法、metadata facade、hook 管理器。这不可持续。现在需要将这些能力正式提升到上游内核。

### 当前断层全景

```
HTTP Request (带 session cookie / Bearer token)
    │
    ├─ /api/v1/auth/* → AuthPlugin (better-auth) → ✅ 认证已实现
    │
    ├─ /api/v1/data/* → HttpDispatcher → broker.call('data.*')
    │                                         │
    │   ⚠️ 此处无中间件验证 session             │
    │   ⚠️ 无 userId/tenantId 注入             │
    │                                         ▼
    │                                    IDataEngine.find()
    │                                         │
    │   ⚠️ 接口无 context 参数                  │
    │   ⚠️ 无 RBAC / RLS 执行                 │
    │                                         ▼
    │                                    Raw driver result (全局无过滤)
```

### Spec 已就绪但未衔接的 Schema

1. `HookContextSchema.session` — 已定义 `{ userId, tenantId, roles, accessToken }`，但 `ObjectQL.find/insert/update/delete` 从不填充它
2. `HookContextSchema.previous` — 已定义但 engine 从不获取 previousData
3. `HookContextSchema.transaction` — 已定义但 engine 无事务管理
4. `PermissionSetSchema` — 定义了 `ObjectPermission`（CRUD 权限）和 `FieldPermission`（字段级权限），零运行时
5. `RowLevelSecurityPolicySchema` — 定义了 `using`/`check` SQL 表达式 + `RLSUserContext`，零编译器
6. `SessionSchema.activeOrganizationId` — 多租户上下文切换字段，无人读取
7. `RoleSchema` — 有层级（parent），无运行时解析

---

## 实施计划（4 个阶段）

### Phase 1: ExecutionContext — 定义 + 传播

**目标**：建立从 HTTP 请求到数据操作的类型安全上下文链。

#### 1.1 定义 ExecutionContext（`packages/spec/src/kernel/execution-context.zod.ts`）

```typescript
import { z } from 'zod';

export const ExecutionContextSchema = z.object({
  /** 当前用户 ID（从 session 解析） */
  userId: z.string().optional(),
  
  /** 当前组织/租户 ID（从 session.activeOrganizationId 解析） */
  tenantId: z.string().optional(),
  
  /** 用户角色列表（从 Member + Role 解析） */
  roles: z.array(z.string()).default([]),
  
  /** 权限列表（从 PermissionSet 聚合） */
  permissions: z.array(z.string()).default([]),
  
  /** 是否系统级操作（跳过权限检查） */
  isSystem: z.boolean().default(false),
  
  /** 原始 access token（用于外部 API 调用透传） */
  accessToken: z.string().optional(),
  
  /** 数据库事务句柄 */
  transaction: z.unknown().optional(),
  
  /** 请求追踪 ID */
  traceId: z.string().optional(),
});

export type ExecutionContext = z.infer<typeof ExecutionContextSchema>;
```

在 `packages/spec/src/kernel/index.ts` 中导出。

#### 1.2 给 IDataEngine 增加 context 参数（`packages/spec/src/contracts/data-engine.ts`）

**关键设计决策**：不改变 `IDataEngine` 签名（破坏所有 Driver），而是在方法的 `options` 参数中增加可选 `context`。

修改 `packages/spec/src/data/data-engine.zod.ts`：

```typescript
// 在每个 Options schema 中增加：
const BaseEngineOptionsSchema = z.object({
  /** Execution context (identity, tenant, transaction) */
  context: ExecutionContextSchema.optional(),
});

// DataEngineQueryOptionsSchema 改为 extend：
export const DataEngineQueryOptionsSchema = BaseEngineOptionsSchema.extend({
  filter: DataEngineFilterSchema.optional(),
  select: z.array(z.string()).optional(),
  sort: DataEngineSortSchema.optional(),
  limit: z.number().int().min(1).optional(),
  skip: z.number().int().min(0).optional(),
  top: z.number().int().min(1).optional(),
  populate: z.array(z.string()).optional(),
});

// 同样修改 DataEngineInsertOptionsSchema, UpdateOptionsSchema, DeleteOptionsSchema, CountOptionsSchema, AggregateOptionsSchema
```

这是**向后兼容**的——context 是 optional 的，不带 context 的调用行为不变。

#### 1.3 ObjectQL Engine 填充 context（`packages/objectql/src/engine.ts`）

在所有 CRUD 方法中，将 options.context 透传到 HookContext.session：

```typescript
// 修改 find() 方法（其他 insert/update/delete/count/aggregate 同理）
async find(object: string, query?: DataEngineQueryOptions): Promise<any[]> {
    object = this.resolveObjectName(object);
    const driver = this.getDriver(object);
    const ast = this.toQueryAST(object, query);

    const hookContext: HookContext = {
        object,
        event: 'beforeFind',
        input: { ast, options: query },
        // ★ 新增：从 query options 透传 session
        session: query?.context ? {
            userId: query.context.userId,
            tenantId: query.context.tenantId,
            roles: query.context.roles,
            accessToken: query.context.accessToken,
        } : undefined,
        transaction: query?.context?.transaction,
        ql: this
    };
    await this.triggerHooks('beforeFind', hookContext);
    // ... driver call + afterFind ...
}
```

---

### Phase 2: 增强 ObjectQL Engine（Per-Object Hooks + Middleware + MetadataFacade）

#### 2.1 Per-Object Hook 支持（`packages/objectql/src/engine.ts`）

当前 hook 注册是全局的，无法按对象过滤。Spec 的 `HookSchema` 已经定义了 `object` 字段（支持 string | string[] | "*"），但 engine 未实现。

```typescript
// 修改 hook 存储结构
private hooks: Map<string, Array<{
  handler: HookHandler;
  object?: string | string[];  // undefined = 全局
  priority: number;
}>> = new Map();

// 修改注册方法
registerHook(event: string, handler: HookHandler, options?: { 
  object?: string | string[]; 
  priority?: number;
}): void {
    if (!this.hooks.has(event)) {
        this.hooks.set(event, []);
    }
    this.hooks.get(event)!.push({
        handler,
        object: options?.object,
        priority: options?.priority ?? 100,
    });
    // 按 priority 排序
    this.hooks.get(event)!.sort((a, b) => a.priority - b.priority);
}

// 修改触发方法
async triggerHooks(event: string, context: HookContext): Promise<void> {
    const entries = this.hooks.get(event) || [];
    for (const entry of entries) {
        // 对象匹配逻辑
        if (entry.object) {
            const targets = Array.isArray(entry.object) ? entry.object : [entry.object];
            if (!targets.includes('*') && !targets.includes(context.object)) {
                continue; // 跳过不匹配的 hook
            }
        }
        await entry.handler(context);
    }
}
```

#### 2.2 Middleware Chain（`packages/objectql/src/engine.ts`）

在 driver 调用前后插入可组合的 middleware，用于：安全过滤 (RLS)、审计 (createdBy)、租户隔离 (tenantId)、事务管理。

```typescript
export type OperationContext = {
    object: string;
    operation: 'find' | 'findOne' | 'insert' | 'update' | 'delete' | 'count' | 'aggregate';
    ast?: QueryAST;
    data?: any;
    options?: any;
    context?: ExecutionContext;
    result?: any;
};

export type EngineMiddleware = (
    ctx: OperationContext, 
    next: () => Promise<void>
) => Promise<void>;

// 在 ObjectQL class 中增加
private middlewares: Array<{
    fn: EngineMiddleware;
    object?: string;
}> = [];

registerMiddleware(fn: EngineMiddleware, options?: { object?: string }): void {
    this.middlewares.push({ fn, object: options?.object });
}

private async executeWithMiddleware(ctx: OperationContext, executor: () => Promise<any>): Promise<any> {
    const applicable = this.middlewares.filter(m => 
        !m.object || m.object === '*' || m.object === ctx.object
    );
    
    let index = 0;
    const next = async (): Promise<void> => {
        if (index < applicable.length) {
            const mw = applicable[index++];
            await mw.fn(ctx, next);
        } else {
            ctx.result = await executor();
        }
    };
    
    await next();
    return ctx.result;
}

// 修改 find() 为使用 middleware
async find(object: string, query?: DataEngineQueryOptions): Promise<any[]> {
    object = this.resolveObjectName(object);
    const driver = this.getDriver(object);
    const ast = this.toQueryAST(object, query);
    
    const opCtx: OperationContext = {
        object,
        operation: 'find',
        ast,
        options: query,
        context: query?.context,
    };
    
    await this.executeWithMiddleware(opCtx, async () => {
        // Before hooks
        const hookContext: HookContext = {
            object, event: 'beforeFind',
            input: { ast: opCtx.ast, options: opCtx.options },
            session: opCtx.context ? {
                userId: opCtx.context.userId,
                tenantId: opCtx.context.tenantId,
                roles: opCtx.context.roles,
            } : undefined,
            transaction: opCtx.context?.transaction,
            ql: this
        };
        await this.triggerHooks('beforeFind', hookContext);
        
        const result = await driver.find(object, hookContext.input.ast as QueryAST, hookContext.input.options);
        
        hookContext.event = 'afterFind';
        hookContext.result = result;
        await this.triggerHooks('afterFind', hookContext);
        
        return hookContext.result;
    });
    
    return opCtx.result;
}
// 对 insert/update/delete/count/aggregate 做同样修改
```

#### 2.3 MetadataFacade（`packages/objectql/src/metadata-facade.ts` 新文件）

消除下游每次都要手动包装 SchemaRegistry 为 `metadata` facade 的重复代码。

```typescript
import { SchemaRegistry } from './registry.js';

/**
 * MetadataFacade
 * 
 * Provides a clean, injectable interface over SchemaRegistry.
 * Registered as the 'metadata' kernel service.
 */
export class MetadataFacade {
    /**
     * Register a metadata item
     */
    register(type: string, definition: any): void {
        if (type === 'object') {
            // Object registration goes through the FQN system
            SchemaRegistry.registerItem(type, definition, 'name');
        } else {
            SchemaRegistry.registerItem(type, definition, definition.id ? 'id' : 'name');
        }
    }

    /**
     * Get a metadata item by type and name
     */
    get(type: string, name: string): any {
        const item = SchemaRegistry.getItem(type, name) as any;
        return item?.content ?? item;
    }

    /**
     * Get the raw entry (with metadata wrapper)
     */
    getEntry(type: string, name: string): any {
        return SchemaRegistry.getItem(type, name);
    }

    /**
     * List all items of a type
     */
    list(type: string): any[] {
        const items = SchemaRegistry.listItems(type);
        return items.map((item: any) => item?.content ?? item);
    }

    /**
     * Unregister a metadata item
     */
    unregister(type: string, name: string): void {
        SchemaRegistry.unregisterItem(type, name);
    }

    /**
     * Unregister all metadata from a package
     */
    unregisterPackage(packageName: string): void {
        SchemaRegistry.unregisterObjectsByPackage(packageName);
    }

    /**
     * Convenience: get object definition
     */
    getObject(name: string): any {
        return SchemaRegistry.getObject(name);
    }

    /**
     * Convenience: list all objects
     */
    listObjects(): any[] {
        return SchemaRegistry.listObjects();
    }
}
```

修改 `packages/objectql/src/plugin.ts`，使用 MetadataFacade：

```typescript
init = async (ctx: PluginContext) => {
    // ... 创建 ObjectQL engine ...
    
    // 使用 MetadataFacade 替代裸 engine
    const metadataFacade = new MetadataFacade();
    ctx.registerService('metadata', metadataFacade);
    ctx.registerService('objectql', this.ql);
    ctx.registerService('data', this.ql);
    // ...
}
```

在 `packages/objectql/src/index.ts` 中导出 `MetadataFacade` 和所有新类型。

#### 2.4 Context-Aware Repository（`packages/objectql/src/repository.ts` 新文件）

将下游 `ObjectRepository` 的核心功能提升到上游：

```typescript
import type { ExecutionContext } from '@objectstack/spec/kernel';
import type { IDataEngine } from '@objectstack/core';

/**
 * Scoped repository for a single object, bound to an execution context.
 * 
 * Usage:
 *   const ctx = engine.createContext({ userId: '...', tenantId: '...' });
 *   const users = ctx.object('user');
 *   await users.find({ filter: { status: 'active' } });
 */
export class ObjectRepository {
    constructor(
        private objectName: string,
        private context: ExecutionContext,
        private engine: IDataEngine
    ) {}

    async find(query: any = {}): Promise<any[]> {
        return this.engine.find(this.objectName, {
            ...query,
            context: this.context,
        });
    }

    async findOne(query: any = {}): Promise<any> {
        return this.engine.findOne(this.objectName, {
            ...query,
            context: this.context,
        });
    }

    async insert(data: any): Promise<any> {
        return this.engine.insert(this.objectName, data, {
            context: this.context,
        });
    }

    async update(data: any, options: any = {}): Promise<any> {
        return this.engine.update(this.objectName, data, {
            ...options,
            context: this.context,
        });
    }

    async delete(options: any = {}): Promise<any> {
        return this.engine.delete(this.objectName, {
            ...options,
            context: this.context,
        });
    }

    async count(query: any = {}): Promise<number> {
        return this.engine.count(this.objectName, {
            ...query,
            context: this.context,
        });
    }
}

/**
 * Scoped execution context with object() accessor.
 */
export class ScopedContext {
    constructor(
        private executionContext: ExecutionContext,
        private engine: IDataEngine
    ) {}

    /** Get a repository scoped to this context */
    object(name: string): ObjectRepository {
        return new ObjectRepository(name, this.executionContext, this.engine);
    }

    /** Create an elevated (system) context */
    sudo(): ScopedContext {
        return new ScopedContext(
            { ...this.executionContext, isSystem: true },
            this.engine
        );
    }

    get userId() { return this.executionContext.userId; }
    get tenantId() { return this.executionContext.tenantId; }
    get roles() { return this.executionContext.roles; }
}
```

在 `ObjectQL` engine 上增加 `createContext()` 方法：

```typescript
// 在 ObjectQL class 中
createContext(ctx: Partial<ExecutionContext>): ScopedContext {
    return new ScopedContext(
        ExecutionContextSchema.parse(ctx),
        this
    );
}
```

---

### Phase 3: Auth Middleware — 打通认证到数据的链路

#### 3.1 扩展 AuthPlugin（`packages/plugins/plugin-auth/src/auth-plugin.ts`）

在 `start()` 阶段注册 auth middleware 到 ObjectQL engine：

```typescript
start = async (ctx: PluginContext) => {
    // 已有：注册 auth 路由 ...
    
    // ★ 新增：注册引擎中间件，在所有数据操作前解析身份
    try {
        const ql = ctx.getService<ObjectQL>('objectql');
        if (ql && typeof ql.registerMiddleware === 'function') {
            ql.registerMiddleware(async (opCtx, next) => {
                // 如果已有 context（来自服务端代码），直接跳过
                if (opCtx.context?.userId || opCtx.context?.isSystem) {
                    return next();
                }
                
                // 从请求上下文中解析 session（需要 HTTP layer 传递 request）
                // 此处的 session 解析逻辑取决于你的 HTTP 集成方式
                // 通常通过 AsyncLocalStorage 或在 options 中传递 request
                
                await next();
            });
            ctx.logger.info('Auth middleware registered on ObjectQL engine');
        }
    } catch (e) {
        ctx.logger.debug('ObjectQL engine not available, skipping auth middleware registration');
    }
}
```

#### 3.2 内置审计 Hooks（可在 ObjectQLPlugin 的 start 阶段注册）

在 `packages/objectql/src/plugin.ts` 的 `start()` 中注册系统级 hooks：

```typescript
start = async (ctx: PluginContext) => {
    // 已有：发现 driver.* 和 app.* ...
    
    // ★ 新增：注册审计 hooks（priority: 10，系统级，在用户 hook 之前执行）
    if (this.ql) {
        // Auto-stamp createdBy/modifiedBy
        this.ql.registerHook('beforeInsert', async (hookCtx) => {
            if (hookCtx.session?.userId && hookCtx.input?.data) {
                const data = hookCtx.input.data;
                if (typeof data === 'object' && data !== null) {
                    data.created_by = data.created_by ?? hookCtx.session.userId;
                    data.modified_by = hookCtx.session.userId;
                    data.created_at = data.created_at ?? new Date().toISOString();
                    data.modified_at = new Date().toISOString();
                    if (hookCtx.session.tenantId) {
                        data.space_id = data.space_id ?? hookCtx.session.tenantId;
                    }
                }
            }
        }, { object: '*', priority: 10 });

        this.ql.registerHook('beforeUpdate', async (hookCtx) => {
            if (hookCtx.session?.userId && hookCtx.input?.data) {
                const data = hookCtx.input.data;
                if (typeof data === 'object' && data !== null) {
                    data.modified_by = hookCtx.session.userId;
                    data.modified_at = new Date().toISOString();
                }
            }
        }, { object: '*', priority: 10 });

        // Auto-fetch previousData for update/delete hooks
        this.ql.registerHook('beforeUpdate', async (hookCtx) => {
            if (hookCtx.input?.id && !hookCtx.previous) {
                try {
                    const existing = await this.ql!.findOne(hookCtx.object, {
                        filter: { _id: hookCtx.input.id }
                    });
                    if (existing) {
                        hookCtx.previous = existing;
                    }
                } catch (e) {
                    // Non-fatal: some objects may not support findOne
                }
            }
        }, { object: '*', priority: 5 });

        this.ql.registerHook('beforeDelete', async (hookCtx) => {
            if (hookCtx.input?.id && !hookCtx.previous) {
                try {
                    const existing = await this.ql!.findOne(hookCtx.object, {
                        filter: { _id: hookCtx.input.id }
                    });
                    if (existing) {
                        hookCtx.previous = existing;
                    }
                } catch (e) {
                    // Non-fatal
                }
            }
        }, { object: '*', priority: 5 });
    }
}
```

#### 3.3 自动租户过滤 Middleware

```typescript
// 在 ObjectQLPlugin.start() 中注册租户隔离 middleware
if (this.ql) {
    this.ql.registerMiddleware(async (opCtx, next) => {
        // 只对有 tenantId 的上下文生效
        if (!opCtx.context?.tenantId || opCtx.context?.isSystem) {
            return next();
        }
        
        // 读操作：注入 space_id 过滤条件
        if (['find', 'findOne', 'count', 'aggregate'].includes(opCtx.operation)) {
            if (opCtx.ast) {
                const tenantFilter = { space_id: opCtx.context.tenantId };
                if (opCtx.ast.where) {
                    opCtx.ast.where = { $and: [opCtx.ast.where, tenantFilter] };
                } else {
                    opCtx.ast.where = tenantFilter;
                }
            }
        }
        
        await next();
    });
}
```

---

### Phase 4: plugin-security（权限运行时）

创建新包 `packages/plugins/plugin-security/`。

#### 4.1 Package 结构

```
packages/plugins/plugin-security/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    ├── security-plugin.ts       # Plugin 入口
    ├── permission-evaluator.ts  # PermissionSet 运行时求值
    ├── rls-compiler.ts          # RLS using/check 表达式编译
    └── field-masker.ts          # FieldPermission 字段级过滤
```

#### 4.2 SecurityPlugin 注册为 engine middleware

```typescript
export class SecurityPlugin implements Plugin {
    name = 'com.objectstack.security';
    dependencies = ['com.objectstack.engine.objectql'];
    
    async start(ctx: PluginContext) {
        const ql = ctx.getService<ObjectQL>('objectql');
        const metadata = ctx.getService<MetadataFacade>('metadata');
        
        // 注册权限检查 middleware
        ql.registerMiddleware(async (opCtx, next) => {
            if (opCtx.context?.isSystem) return next();
            
            const roles = opCtx.context?.roles ?? [];
            const permissions = this.resolvePermissions(roles, opCtx.object, metadata);
            
            // CRUD 权限检查
            this.checkObjectPermission(opCtx.operation, permissions);
            
            // RLS 过滤注入
            const rlsPolicies = this.getRLSPolicies(roles, opCtx.object, metadata);
            if (rlsPolicies.length > 0 && opCtx.ast) {
                const rlsFilter = this.compileRLSFilter(rlsPolicies, opCtx.context);
                opCtx.ast.where = opCtx.ast.where 
                    ? { $and: [opCtx.ast.where, rlsFilter] }
                    : rlsFilter;
            }
            
            await next();
            
            // afterFind: 字段级权限过滤
            if (opCtx.result && ['find', 'findOne'].includes(opCtx.operation)) {
                opCtx.result = this.maskFields(opCtx.result, opCtx.object, permissions, metadata);
            }
        }, { object: '*' });
    }
}
```

---

## 涉及的文件变更清单

### `packages/spec/`（协议层）
| 文件 | 操作 | 说明 |
|------|------|------|
| `src/kernel/execution-context.zod.ts` | **新增** | ExecutionContext schema |
| `src/kernel/index.ts` | 修改 | 导出 ExecutionContext |
| `src/data/data-engine.zod.ts` | 修改 | 所有 Options schema 增加可选 `context` 字段 |

### `packages/objectql/`（引擎层）
| 文件 | 操作 | 说明 |
|------|------|------|
| `src/engine.ts` | **重构** | Per-object hooks, middleware chain, context 透传, createContext() |
| `src/metadata-facade.ts` | **新增** | MetadataFacade 类 |
| `src/repository.ts` | **新增** | ObjectRepository + ScopedContext |
| `src/plugin.ts` | 修改 | 注册 MetadataFacade，审计 hooks，租户 middleware |
| `src/index.ts` | 修改 | 导出新类型 |

### `packages/plugins/`（插件层）
| 文件 | 操作 | 说明 |
|------|------|------|
| `plugin-auth/src/auth-plugin.ts` | 修改 | start() 中注册 auth middleware |
| `plugin-security/` | **新增** | 完整的权限运行时包 |

### 不需要修改的
| 文件 | 原因 |
|------|------|
| `packages/core/src/types.ts` | PluginContext 已足够 |
| `packages/core/src/kernel.ts` | 无需变更 |
| `packages/runtime/` | 无需变更 |

---

## 关键设计约束

1. **向后兼容**：`IDataEngine` 签名不变，context 通过 options 可选传入。不传 context 的调用行为与现在完全一致。
2. **HookContextSchema 已就绪**：Spec 中的 `session { userId, tenantId, roles }` 和 `transaction` 字段已定义好，engine 只需填充。
3. **Middleware 是洋葱模型**：外层 middleware 可以修改 AST（注入过滤条件），内层 middleware 看到的是修改后的 AST。
4. **Per-object hook 保持向后兼容**：不带 `object` 选项的 `registerHook()` 仍然是全局 hook。
5. **MetadataFacade 不改变 SchemaRegistry**：只是包装层，SchemaRegistry 仍然是静态单例（后续可改为实例）。
6. **SecurityPlugin 完全可选**：不安装它，系统行为与现在完全一致——无权限检查。

## 实施优先级

1. **P0**：Phase 1（ExecutionContext）+ Phase 2.1-2.2（per-object hooks + middleware）→ 这是消除下游 monkey-patching 的最小必要变更
2. **P0**：Phase 2.3（MetadataFacade）→ 消除下游重复代码
3. **P1**：Phase 2.4（Repository/ScopedContext）+ Phase 3（auth middleware + 审计 hooks）→ 打通完整链路
4. **P2**：Phase 4（plugin-security）→ RBAC + RLS 运行时

## 测试验证

每个 Phase 完成后：
1. 现有 `packages/objectql/src/__tests__/` 全部通过（向后兼容）
2. 新增测试用 `LiteKernel` + `InMemoryDriver` 验证：
   - context 从 `engine.find(obj, { context: { userId: '...' } })` 到达 HookContext.session
   - Per-object hook 只对目标对象触发
   - Middleware 可修改 QueryAST（注入 where 条件）
   - MetadataFacade.get/list/register/unregister 工作正常
   - ScopedContext.object('x').find() 透传 context
   - 审计 hooks 自动注入 created_by / modified_by
   - 租户 middleware 自动注入 space_id 过滤