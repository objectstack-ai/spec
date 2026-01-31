# ObjectStack 微内核架构优化方案

> **架构评估报告** - 2026年1月
> 
> 本文档提供ObjectStack微内核架构的深度评估、发现的问题及优化建议和开发计划。

## 目录

1. [架构评估总结](#架构评估总结)
2. [发现的问题](#发现的问题)
3. [优化建议](#优化建议)
4. [开发计划](#开发计划)
5. [重构路线图](#重构路线图)

---

## 架构评估总结

### 当前架构评分

| 评估维度 | 得分 | 状态 | 说明 |
|---------|------|------|------|
| 循环依赖检测 | 10/10 | ✅ 优秀 | 无循环依赖，DAG结构清晰 |
| 分层架构 | 9/10 | ✅ 非常好 | 0-6层划分清晰，依赖方向正确 |
| 关注点分离 | 6/10 | ⚠️ 需改进 | Logger和Contracts位置不当 |
| 代码重复率 | 4/10 | ❌ 高重复 | kernel.ts和enhanced-kernel.ts重复42-60行 |
| 包内聚性 | 6/10 | ⚠️ 混合关注点 | Core包承担过多责任 |
| **总体架构质量** | **7/10** | ⚠️ **良好基础** | **需要架构重构消除重复** |

### 核心发现

**✅ 优点：**
- 微内核设计理念正确，插件系统完善
- 依赖注入和事件系统设计合理
- 无循环依赖，依赖图清晰
- 包分层清楚，Layer 0-6 划分合理

**❌ 问题：**
- **严重代码重复**：`kernel.ts` (219行) 和 `enhanced-kernel.ts` (496行) 重复约40%代码
- **关注点错位**：Logger实现应独立为包，Contracts应在spec包
- **单一职责违反**：`@objectstack/core` 承担了内核+日志+契约定义+插件加载四个职责
- **缺失抽象**：服务注册、插件验证、启动编排没有接口抽象

---

## 发现的问题

### 问题1：内核实现严重重复

#### 代码重复分析

| 功能模块 | ObjectKernel | EnhancedObjectKernel | 问题 |
|---------|--------------|---------------------|------|
| 插件注册 | ✅ `use()` 同步 | ✅ `use()` 异步包装 | 重复逻辑 |
| 依赖解析 | ✅ `resolveDependencies()` 42行 | ✅ `resolveDependencies()` 42行 | **完全重复** |
| 服务注册表 | ✅ `services: Map` | ✅ `services: Map` + PluginLoader | **重复存储** |
| Hook系统 | ✅ `hooks: Map` | ✅ `hooks: Map` | **完全重复** |
| 上下文初始化 | ✅ 60行 | ✅ 60行 (1处差异) | **98%重复** |
| 状态机 | ✅ 4状态 | ✅ 5状态 | 轻微差异 |
| Init/Start/Destroy | ✅ 实现 | ✅ 实现 | **完全重复** |

**重复代码量统计：**
```
kernel.ts:               219 lines
enhanced-kernel.ts:      496 lines
重复代码:                ~120 lines (约55%重复)
可提取基类:              ~150 lines
```

#### 根本原因

- **设计模式错误**：应使用**组合模式**而非继承/重复实现
- **职责不清**：EnhancedKernel应该是Kernel的增强包装器，而非重新实现

#### 影响

- ❌ 维护成本翻倍：修复Bug需要同步两处
- ❌ 测试覆盖困难：需要为两个实现写相同测试
- ❌ 行为不一致风险：两个实现可能逐渐偏离

---

### 问题2：Logger位置不当

#### 当前状况

```
@objectstack/core/src/
├── logger.ts            ← 306行Pino封装实现
├── logger.test.ts       ← 116行测试
└── contracts/
    └── logger.ts        ← Logger接口
```

#### 问题分析

| 维度 | 问题描述 |
|------|---------|
| **职责混淆** | Core应管理插件，不应实现日志 |
| **依赖污染** | Core强依赖Pino，违反最小依赖原则 |
| **复用困难** | 其他项目无法单独使用ObjectStack Logger |
| **测试困难** | 测试Kernel需要Mock整个Logger实现 |

#### 正确架构

```
@objectstack/logger (NEW)  ← 独立包
├── logger.ts              ← Pino实现
├── logger.test.ts
└── types.ts               ← 接口导出

@objectstack/spec/contracts (MOVED)
└── logger.ts              ← ILogger接口定义

@objectstack/core
├── kernel.ts              ← 通过构造注入logger
└── types.ts               ← 依赖ILogger接口
```

---

### 问题3：Contracts位置错误

#### 当前状况

```
@objectstack/core/src/contracts/
├── data-engine.ts       ← IDataEngine接口
├── http-server.ts       ← IHttpServer接口
└── logger.ts            ← Logger接口
```

#### 问题分析

**违反原则：** "Protocol First" - 所有契约应在Spec包定义

| 契约类型 | 当前位置 | 应在位置 | 原因 |
|---------|---------|---------|------|
| IDataEngine | core/contracts | spec/contracts | 数据协议定义 |
| IHttpServer | core/contracts | spec/contracts | HTTP协议定义 |
| ILogger | core/contracts | spec/contracts | 日志协议定义 |

**影响：**
- ❌ Spec包不完整，无法独立用于类型检查
- ❌ 违反"协议优先"设计原则
- ❌ 契约变更需要发布Core包（应只发布Spec）

---

### 问题4：服务注册表重复存储

#### 问题描述

```typescript
// kernel.ts
class ObjectKernel {
    private services: Map<string, any> = new Map();  // 存储1
}

// enhanced-kernel.ts  
class EnhancedObjectKernel {
    private services: Map<string, any> = new Map();  // 存储2
    private pluginLoader: PluginLoader;              // PluginLoader内部也有serviceInstances
}

// plugin-loader.ts
class PluginLoader {
    private serviceInstances: Map<string, any> = new Map();  // 存储3
}
```

**问题：三份存储，数据不一致风险！**

#### 根本原因

- 没有定义 `IServiceRegistry` 接口
- EnhancedKernel试图同时使用两种存储
- 职责不清：谁是"真正"的服务注册表？

---

### 问题5：PluginLoader职责过重

#### 当前职责

```typescript
class PluginLoader {
    // 1. 插件验证
    validatePluginStructure(plugin: unknown): void
    validateVersion(version: string): boolean
    validateSignature(metadata: PluginMetadata): Promise<boolean>
    
    // 2. 服务生命周期管理
    registerService(name: string, factory: ServiceFactory): void
    getService(name: string, scopeId?: string): any
    createScopedServices(scopeId: string): Promise<void>
    
    // 3. 插件加载
    loadPlugin(pluginPath: string): Promise<PluginMetadata>
    
    // 4. 依赖检测
    detectCircularDependencies(deps: ServiceDependency[]): void
}
```

**问题：违反单一职责原则！**

一个类承担了4个不同的职责：
1. 验证 (Validation)
2. 生命周期管理 (Lifecycle)
3. 加载 (Loading)
4. 依赖分析 (Dependency Analysis)

#### 应该拆分为

```typescript
IPluginValidator        // 验证器
IServiceLifecycleManager  // 生命周期管理
IPluginLoader           // 加载器
IDependencyAnalyzer     // 依赖分析
```

---

### 问题6：缺失核心抽象接口

#### 缺失的接口

**1. IServiceRegistry - 服务注册表接口**

```typescript
// 应该定义但当前没有
export interface IServiceRegistry {
    register<T>(name: string, service: T): void;
    get<T>(name: string): T;
    getAsync<T>(name: string, scopeId?: string): Promise<T>;
    has(name: string): boolean;
    unregister(name: string): void;
}
```

**2. IPluginValidator - 插件验证器接口**

```typescript
// 应该定义但当前没有
export interface IPluginValidator {
    validate(plugin: unknown): ValidationResult;
    validateVersion(version: string): boolean;
    validateSignature(plugin: Plugin): Promise<boolean>;
    validateDependencies(plugin: Plugin, registry: Map<string, Plugin>): void;
}
```

**3. IStartupOrchestrator - 启动编排器接口**

```typescript
// 应该定义但当前没有
export interface IStartupOrchestrator {
    orchestrateStartup(plugins: Plugin[], options: StartupOptions): Promise<PluginStartupResult>;
    rollback(startedPlugins: Plugin[]): Promise<void>;
    checkHealth(plugin: Plugin): Promise<HealthStatus>;
}
```

**4. IPluginLifecycleEvents - 类型化事件接口**

```typescript
// 应该定义但当前没有
export interface IPluginLifecycleEvents {
    'kernel:ready': [];
    'kernel:shutdown': [];
    'plugin:init': [pluginName: string];
    'plugin:started': [pluginName: string, duration: number];
    'plugin:error': [pluginName: string, error: Error];
}
```

---

## 优化建议

### 建议1：消除内核重复 - 使用组合模式

#### 当前架构（继承）

```
ObjectKernel (219 lines)
EnhancedObjectKernel (496 lines) - 重新实现大部分代码
```

#### 建议架构（组合）

```typescript
// 核心基类 - 提取共同逻辑
abstract class ObjectKernelBase {
    protected plugins: Map<string, PluginMetadata> = new Map();
    protected services: IServiceRegistry;
    protected hooks: Map<string, any[]> = new Map();
    protected state: KernelState = 'idle';
    
    // 共享方法
    protected resolveDependencies(): Plugin[] { /* 单一实现 */ }
    protected createContext(): PluginContext { /* 单一实现 */ }
    protected validateState(requiredState: KernelState): void { /* 单一实现 */ }
}

// 基础内核 - 轻量级同步实现
export class ObjectKernel extends ObjectKernelBase {
    constructor(config?: KernelConfig) {
        super(config);
        this.services = new BasicServiceRegistry();
    }
    
    async bootstrap() {
        // 简单的init -> start流程
    }
}

// 增强内核 - 使用组合模式添加功能
export class EnhancedObjectKernel extends ObjectKernelBase {
    private pluginValidator: IPluginValidator;
    private startupOrchestrator: IStartupOrchestrator;
    private serviceLifecycle: IServiceLifecycleManager;
    
    constructor(config?: EnhancedKernelConfig) {
        super(config);
        this.services = new AdvancedServiceRegistry();
        this.pluginValidator = new PluginValidator();
        this.startupOrchestrator = new StartupOrchestrator(config);
        this.serviceLifecycle = new ServiceLifecycleManager();
    }
    
    async use(plugin: Plugin) {
        // 添加验证层
        await this.pluginValidator.validate(plugin);
        return super.use(plugin);
    }
    
    async bootstrap() {
        // 使用编排器添加超时、回滚等功能
        return this.startupOrchestrator.orchestrateStartup(
            this.resolveDependencies(),
            this.config
        );
    }
}
```

**优势：**
- ✅ 消除120行重复代码
- ✅ 基类统一维护，修复bug只需一处
- ✅ EnhancedKernel专注增强功能，不重复基础逻辑
- ✅ 更容易测试和扩展

---

### 建议2：提取Logger为独立包

#### 新包结构

```
packages/logger/
├── package.json
├── src/
│   ├── index.ts
│   ├── logger.ts           ← Pino实现
│   ├── logger.test.ts
│   ├── types.ts            ← 导出ILogger
│   └── adapters/
│       ├── console.ts      ← Console适配器
│       ├── pino.ts         ← Pino适配器
│       └── winston.ts      ← Winston适配器 (未来)
└── README.md

dependencies:
  - pino: ^8.17.0 (optional peer)
  - pino-pretty: ^10.3.0 (optional peer)
```

#### 迁移步骤

1. 创建 `@objectstack/logger` 包
2. 移动 `core/src/logger.ts` → `logger/src/logger.ts`
3. 移动 `core/src/contracts/logger.ts` → `spec/src/contracts/logger.ts`
4. 更新 `@objectstack/core` 依赖为 `@objectstack/logger`
5. 导出适配器模式，支持多种日志后端

**优势：**
- ✅ Core包更轻量（减少306行）
- ✅ Logger可独立复用
- ✅ 支持多种日志后端（Pino/Winston/Console）
- ✅ 更容易测试Kernel（Mock ILogger）

---

### 建议3：迁移Contracts到Spec包

#### 迁移路径

```
FROM: packages/core/src/contracts/
  ├── data-engine.ts
  ├── http-server.ts
  └── logger.ts

TO: packages/spec/src/contracts/
  ├── index.ts
  ├── data-engine.ts      ← IDataEngine
  ├── http-server.ts      ← IHttpServer
  ├── logger.ts           ← ILogger
  ├── service-registry.ts ← IServiceRegistry (NEW)
  └── plugin-validator.ts ← IPluginValidator (NEW)
```

#### package.json更新

```json
// packages/spec/package.json
{
  "exports": {
    "./contracts": {
      "types": "./dist/contracts/index.d.ts",
      "default": "./dist/contracts/index.js"
    }
  }
}
```

**优势：**
- ✅ 遵循"Protocol First"原则
- ✅ Spec包可独立用于类型检查
- ✅ 契约变更不触发Core包更新
- ✅ 更清晰的依赖关系

---

### 建议4：拆分PluginLoader职责

#### 重构方案

```typescript
// packages/core/src/validation/
export class PluginValidator implements IPluginValidator {
    validate(plugin: unknown): ValidationResult { /* ... */ }
    validateVersion(version: string): boolean { /* ... */ }
    validateSignature(plugin: Plugin): Promise<boolean> { /* ... */ }
}

// packages/core/src/services/
export class ServiceLifecycleManager implements IServiceLifecycleManager {
    registerService(name: string, factory: ServiceFactory): void { /* ... */ }
    getService(name: string, scopeId?: string): any { /* ... */ }
    createScopedServices(scopeId: string): Promise<void> { /* ... */ }
}

// packages/core/src/dependency/
export class DependencyAnalyzer implements IDependencyAnalyzer {
    detectCircularDependencies(deps: ServiceDependency[]): void { /* ... */ }
    resolveDependencyOrder(plugins: Plugin[]): Plugin[] { /* ... */ }
}

// packages/core/src/loading/
export class PluginLoader implements IPluginLoader {
    constructor(
        private validator: IPluginValidator,
        private dependencyAnalyzer: IDependencyAnalyzer
    ) {}
    
    async loadPlugin(pluginPath: string): Promise<PluginMetadata> {
        const plugin = await import(pluginPath);
        const validationResult = this.validator.validate(plugin);
        if (!validationResult.valid) throw new Error(validationResult.error);
        return plugin;
    }
}
```

**优势：**
- ✅ 每个类单一职责
- ✅ 更容易测试（Mock依赖）
- ✅ 可独立演进各功能
- ✅ 符合SOLID原则

---

### 建议5：创建服务注册表抽象

#### 接口定义

```typescript
// packages/spec/src/contracts/service-registry.ts
export interface IServiceRegistry {
    /** 注册服务 */
    register<T>(name: string, service: T | ServiceFactory<T>): void;
    
    /** 获取服务（同步） */
    get<T>(name: string): T;
    
    /** 获取服务（异步，支持工厂） */
    getAsync<T>(name: string, scopeId?: string): Promise<T>;
    
    /** 检查服务是否存在 */
    has(name: string): boolean;
    
    /** 注销服务 */
    unregister(name: string): void;
    
    /** 获取所有服务名 */
    getServiceNames(): string[];
}

export type ServiceFactory<T> = () => T | Promise<T>;
```

#### 实现类

```typescript
// packages/core/src/services/basic-registry.ts
export class BasicServiceRegistry implements IServiceRegistry {
    private services = new Map<string, any>();
    
    register<T>(name: string, service: T): void { /* ... */ }
    get<T>(name: string): T { /* ... */ }
    getAsync<T>(name: string): Promise<T> { return Promise.resolve(this.get(name)); }
    has(name: string): boolean { return this.services.has(name); }
    unregister(name: string): void { this.services.delete(name); }
    getServiceNames(): string[] { return Array.from(this.services.keys()); }
}

// packages/core/src/services/advanced-registry.ts
export class AdvancedServiceRegistry implements IServiceRegistry {
    private services = new Map<string, any>();
    private factories = new Map<string, ServiceFactory<any>>();
    private scoped = new Map<string, Map<string, any>>();
    
    // 支持工厂、生命周期、作用域
    register<T>(name: string, service: T | ServiceFactory<T>, lifecycle?: ServiceLifecycle): void { /* ... */ }
    getAsync<T>(name: string, scopeId?: string): Promise<T> { /* ... */ }
    // ... 其他方法
}
```

**优势：**
- ✅ 统一服务注册接口
- ✅ 基础/高级实现可选
- ✅ 容易切换实现
- ✅ 更好的类型安全

---

### 建议6：添加类型化事件系统

#### 接口定义

```typescript
// packages/spec/src/system/events.zod.ts
export const KernelEventsSchema = z.object({
    'kernel:init': z.tuple([]),
    'kernel:ready': z.tuple([]),
    'kernel:shutdown': z.tuple([]),
});

export const PluginEventsSchema = z.object({
    'plugin:beforeInit': z.tuple([z.string()]),
    'plugin:afterInit': z.tuple([z.string(), z.number()]),
    'plugin:beforeStart': z.tuple([z.string()]),
    'plugin:afterStart': z.tuple([z.string(), z.number()]),
    'plugin:error': z.tuple([z.string(), z.instanceof(Error)]),
});

export type KernelEvents = z.infer<typeof KernelEventsSchema>;
export type PluginEvents = z.infer<typeof PluginEventsSchema>;
export type LifecycleEvents = KernelEvents & PluginEvents;
```

#### 类型安全的Hook系统

```typescript
// packages/core/src/hooks/typed-hooks.ts
export class TypedEventBus<TEvents extends Record<string, any[]>> {
    private handlers = new Map<keyof TEvents, Array<(...args: any[]) => void>>();
    
    on<K extends keyof TEvents>(
        event: K,
        handler: (...args: TEvents[K]) => void | Promise<void>
    ): void {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event)!.push(handler);
    }
    
    async emit<K extends keyof TEvents>(
        event: K,
        ...args: TEvents[K]
    ): Promise<void> {
        const handlers = this.handlers.get(event) || [];
        for (const handler of handlers) {
            await handler(...args);
        }
    }
}

// 使用
const eventBus = new TypedEventBus<LifecycleEvents>();
eventBus.on('plugin:afterStart', (pluginName, duration) => {
    // TypeScript knows types!
    console.log(`${pluginName} started in ${duration}ms`);
});
```

**优势：**
- ✅ 类型安全的事件系统
- ✅ IDE自动补全
- ✅ 编译时错误检测
- ✅ 更好的文档

---

## 开发计划

### 阶段1：基础重构 (Week 1-2)

#### 任务1.1：提取核心抽象接口
- [ ] 创建 `IServiceRegistry` 接口
- [ ] 创建 `IPluginValidator` 接口
- [ ] 创建 `IStartupOrchestrator` 接口
- [ ] 创建 `IPluginLifecycleEvents` 接口
- [ ] 移动到 `packages/spec/src/contracts/`

**可交付成果：**
```
packages/spec/src/contracts/
├── index.ts
├── service-registry.ts
├── plugin-validator.ts
├── startup-orchestrator.ts
└── events.ts
```

#### 任务1.2：迁移Contracts到Spec
- [ ] 移动 `data-engine.ts` → `spec/src/contracts/`
- [ ] 移动 `http-server.ts` → `spec/src/contracts/`
- [ ] 移动 `logger.ts` → `spec/src/contracts/`
- [ ] 更新所有导入路径
- [ ] 更新 `spec/package.json` exports

**Breaking Change:** 需要major version bump

#### 任务1.3：提取Logger为独立包
- [ ] 创建 `packages/logger/` 包结构
- [ ] 移动 `logger.ts` 和测试
- [ ] 创建适配器模式（Pino/Console）
- [ ] 更新 `core` 依赖为 `@objectstack/logger`
- [ ] 发布 `@objectstack/logger@0.1.0`

---

### 阶段2：内核重构 (Week 3-4)

#### 任务2.1：创建ObjectKernelBase
- [ ] 提取共同代码到 `ObjectKernelBase`
- [ ] 实现 `resolveDependencies()` (单一版本)
- [ ] 实现 `createContext()` (单一版本)
- [ ] 实现状态验证方法
- [ ] 添加基类测试

**代码结构：**
```typescript
// packages/core/src/kernel-base.ts
export abstract class ObjectKernelBase {
    protected plugins: Map<string, PluginMetadata>;
    protected services: IServiceRegistry;
    protected hooks: TypedEventBus<LifecycleEvents>;
    protected state: KernelState;
    
    protected resolveDependencies(): Plugin[] { /* 单一实现 */ }
    protected createContext(): PluginContext { /* 单一实现 */ }
    
    abstract bootstrap(): Promise<void>;
}
```

#### 任务2.2：重构ObjectKernel
- [ ] 继承 `ObjectKernelBase`
- [ ] 删除重复代码
- [ ] 使用 `BasicServiceRegistry`
- [ ] 简化 `bootstrap()` 实现
- [ ] 确保所有测试通过

**预期代码减少：** 219 → ~100 lines

#### 任务2.3：重构EnhancedObjectKernel
- [ ] 继承 `ObjectKernelBase`
- [ ] 删除重复代码
- [ ] 使用组合模式注入组件：
  - `PluginValidator`
  - `StartupOrchestrator`
  - `ServiceLifecycleManager`
- [ ] 重写 `bootstrap()` 使用编排器
- [ ] 确保所有测试通过

**预期代码减少：** 496 → ~200 lines

---

### 阶段3：拆分PluginLoader (Week 5)

#### 任务3.1：创建PluginValidator
- [ ] 实现 `IPluginValidator` 接口
- [ ] 移动验证逻辑从 `PluginLoader`
- [ ] 添加单元测试
- [ ] 集成到 `EnhancedObjectKernel`

#### 任务3.2：创建ServiceLifecycleManager
- [ ] 实现 `IServiceLifecycleManager` 接口
- [ ] 支持 singleton/transient/scoped 生命周期
- [ ] 添加单元测试
- [ ] 集成到 `EnhancedObjectKernel`

#### 任务3.3：创建StartupOrchestrator
- [ ] 实现 `IStartupOrchestrator` 接口
- [ ] 实现超时控制
- [ ] 实现回滚逻辑
- [ ] 实现健康检查
- [ ] 添加单元测试
- [ ] 集成到 `EnhancedObjectKernel`

#### 任务3.4：简化PluginLoader
- [ ] 删除已移除的功能
- [ ] 保留纯粹的加载逻辑
- [ ] 更新测试

**预期代码减少：** 435 → ~150 lines

---

### 阶段4：服务注册表重构 (Week 6)

#### 任务4.1：实现BasicServiceRegistry
- [ ] 实现 `IServiceRegistry` 接口
- [ ] 简单的Map-based存储
- [ ] 同步服务获取
- [ ] 单元测试

#### 任务4.2：实现AdvancedServiceRegistry
- [ ] 实现 `IServiceRegistry` 接口
- [ ] 支持工厂函数
- [ ] 支持生命周期管理
- [ ] 支持作用域服务
- [ ] 单元测试

#### 任务4.3：替换直接Map使用
- [ ] `ObjectKernel` 使用 `BasicServiceRegistry`
- [ ] `EnhancedObjectKernel` 使用 `AdvancedServiceRegistry`
- [ ] 删除重复的 `services: Map` 声明
- [ ] 确保所有测试通过

---

### 阶段5：类型化事件系统 (Week 7)

#### 任务5.1：定义事件Schema
- [ ] 在 `spec/src/system/events.zod.ts` 定义事件类型
- [ ] 导出TypeScript类型

#### 任务5.2：实现TypedEventBus
- [ ] 创建 `TypedEventBus` 类
- [ ] 类型安全的 `on()` 和 `emit()`
- [ ] 单元测试

#### 任务5.3：集成到Kernel
- [ ] 替换 `hooks: Map` 为 `eventBus: TypedEventBus`
- [ ] 更新所有事件触发点
- [ ] 更新插件使用示例
- [ ] 更新文档

---

### 阶段6：测试和文档 (Week 8)

#### 任务6.1：补充测试覆盖
- [ ] `ObjectKernelBase` 测试
- [ ] `ObjectKernel` 测试（更新）
- [ ] `EnhancedObjectKernel` 测试（更新）
- [ ] 各新组件单元测试
- [ ] 集成测试
- [ ] E2E测试

**目标覆盖率：** >90%

#### 任务6.2：更新文档
- [ ] 更新 `ARCHITECTURE.md`
- [ ] 更新 `PACKAGE-DEPENDENCIES.md`
- [ ] 创建迁移指南 `MIGRATION-GUIDE-v1.0.md`
- [ ] 更新API文档
- [ ] 更新示例代码

#### 任务6.3：性能测试
- [ ] Benchmark: Kernel启动时间
- [ ] Benchmark: 服务查找性能
- [ ] Benchmark: 事件触发性能
- [ ] 内存使用分析
- [ ] 性能回归测试

---

## 重构路线图

### 时间线总览

```
Week 1-2: 阶段1 - 基础重构
  ├── 提取抽象接口
  ├── 迁移Contracts
  └── 提取Logger包

Week 3-4: 阶段2 - 内核重构
  ├── 创建KernelBase
  ├── 重构ObjectKernel
  └── 重构EnhancedKernel

Week 5: 阶段3 - 拆分PluginLoader
  ├── PluginValidator
  ├── ServiceLifecycleManager
  ├── StartupOrchestrator
  └── 简化PluginLoader

Week 6: 阶段4 - 服务注册表
  ├── BasicServiceRegistry
  ├── AdvancedServiceRegistry
  └── 集成到Kernel

Week 7: 阶段5 - 类型化事件
  ├── 定义事件Schema
  ├── 实现TypedEventBus
  └── 集成到Kernel

Week 8: 阶段6 - 测试和文档
  ├── 测试覆盖
  ├── 更新文档
  └── 性能测试

RELEASE: v1.0.0 - 架构优化版本
```

### 发布策略

#### Alpha Release (Week 2)
- `@objectstack/spec@0.7.0-alpha.1` - 新增contracts导出
- `@objectstack/logger@0.1.0-alpha.1` - 新包

#### Beta Release (Week 5)
- `@objectstack/core@0.7.0-beta.1` - 重构后的Kernel
- `@objectstack/spec@0.7.0-beta.1` - 完整contracts

#### RC Release (Week 7)
- 所有包 `@0.7.0-rc.1` - 功能冻结

#### Production Release (Week 8)
- 所有包 `@1.0.0` - 稳定版本发布

### Breaking Changes Summary

| Package | Old Version | New Version | Breaking Changes |
|---------|-------------|-------------|-----------------|
| `@objectstack/spec` | 0.6.1 | 1.0.0 | 新增 `/contracts` 导出 |
| `@objectstack/core` | 0.6.1 | 1.0.0 | - Contracts移除<br>- Logger提取<br>- Kernel API变化 |
| `@objectstack/logger` | - | 1.0.0 | 新包 |
| 其他包 | 0.6.1 | 1.0.0 | 依赖更新 |

---

## 风险评估

### 高风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 重构引入Bug | 破坏现有功能 | - 保持100%测试覆盖<br>- Alpha/Beta测试期<br>- 逐步迁移 |
| Breaking Changes | 下游项目需更新 | - 详细迁移指南<br>- Codemods工具<br>- 长期支持旧版本 |
| 性能回归 | 启动变慢 | - 性能基准测试<br>- 持续监控<br>- 优化热路径 |

### 中风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 时间延期 | 影响发布计划 | - 预留缓冲时间<br>- 可选功能后移<br>- 分阶段发布 |
| 文档不完整 | 用户困惑 | - 文档先行<br>- 示例更新<br>- 社区反馈 |

### 低风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 依赖冲突 | 安装问题 | - Peer dependencies<br>- 版本范围宽松 |

---

## 成功指标

### 代码质量

- [ ] 代码重复率 < 5% (当前 ~40%)
- [ ] 测试覆盖率 > 90% (当前 ~70%)
- [ ] Cyclomatic Complexity < 10 (当前部分 > 15)
- [ ] 所有Linter规则通过

### 架构质量

- [ ] 所有契约在 `@objectstack/spec`
- [ ] 核心包依赖 < 5 个 (当前 3个)
- [ ] 包内聚性评分 > 8/10 (当前 6/10)
- [ ] 关注点分离评分 > 9/10 (当前 6/10)

### 性能指标

- [ ] Kernel启动时间 < 100ms (无插件)
- [ ] 服务查找 < 1μs
- [ ] 事件触发 < 10μs
- [ ] 内存使用 < 当前版本

### 文档质量

- [ ] 100% API文档覆盖
- [ ] 迁移指南完整
- [ ] 至少5个示例更新
- [ ] 架构图更新

---

## 总结

### 现状

ObjectStack微内核架构基础扎实，依赖图清晰，无循环依赖。但存在严重的**代码重复问题**（~40%）和**关注点混淆**（Logger、Contracts位置不当）。

### 优化方向

1. **消除重复**：使用组合模式重构两个Kernel实现
2. **提取关注点**：Logger独立包、Contracts移至Spec
3. **接口抽象**：定义核心接口（IServiceRegistry等）
4. **职责分离**：拆分PluginLoader为4个单一职责类
5. **类型安全**：类型化事件系统

### 预期收益

- **代码量减少** ~30% (约400行)
- **维护成本降低** 50% (单一实现)
- **测试覆盖提升** 70% → 90%
- **包内聚性提升** 6/10 → 9/10
- **架构清晰度提升** 7/10 → 9/10

### 投入

- **开发时间**: 8周
- **风险等级**: 中等
- **Breaking Changes**: 是 (需major version bump)

**建议：** 立即启动重构，目标1.0.0稳定版发布。

---

**文档版本**: 1.0  
**作者**: ObjectStack Architecture Team  
**日期**: 2026年1月31日  
**状态**: 提案 - 待审批
