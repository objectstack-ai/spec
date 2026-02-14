你的直觉是对的。让我基于代码现实来做一个精确对比：

---

## Core vs Runtime：职责解剖

### 用 OS 类比来理解

```
┌───────────────────────────────────────────────┐
│ @objectstack/spec       = 宪法 (Constitution)  │  ← 纯 Schema, 零运行时
├───────────────────────────────────────────────┤
│ @objectstack/core       = 内核 (Kernel)        │  ← 进程调度、内存管理、系统调用
├───────────────────────────────────────────────┤
│ @objectstack/runtime    = 标准库 (libc/glibc)  │  ← 包装内核 + HTTP + 应用加载
├───────────────────────────────────────────────┤
│ @objectstack/objectql   = 文件系统 (ext4)      │  ← 数据引擎
│ @objectstack/rest       = 网络栈 (TCP/IP)      │  ← HTTP CRUD 路由
│ @objectstack/metadata   = 注册表 (Registry)    │  ← 元数据管理
└───────────────────────────────────────────────┘
```

### 逐文件对比

#### `@objectstack/core` — 实际内容

```typescript name=core/src/index.ts url=https://github.com/objectstack-ai/spec/blob/ef29eb6b1823e8fdc47916a5c14a46e2aedd7a90/packages/core/src/index.ts#L1-L41
// 导出清单：
export * from './kernel-base.js';       // ① ObjectKernelBase 抽象基类
export * from './kernel.js';            // ② ObjectKernel 完整版（高级生命周期）
export * from './lite-kernel.js';       // ③ LiteKernel 精简版
export * from './types.js';             // ④ Plugin, PluginContext 接口
export * from './logger.js';            // ⑤ ObjectLogger (Pino 封装)
export * from './plugin-loader.js';     // ⑥ 插件加载器 + DI 容器 + 工厂模式
export * from './api-registry.js';      // ⑦ API 注册表
export * from './api-registry-plugin.js'; // ⑧ API 注册表插件
export * as QA from './qa/index.js';    // ⑨ QA 测试框架
export * from './security/index.js';    // ⑩ 安全（签名验证、配置校验、权限执行）
export * from './utils/env.js';         // ⑪ 环境检测
export * from './health-monitor.js';    // ⑫ 插件健康监控
export * from './hot-reload.js';        // ⑬ 热更新状态管理
export * from './dependency-resolver.js'; // ⑭ 依赖解析器
```

| # | 模块 | 行数 | 职责 | 是否属于"微内核"？ |
|---|------|------|------|-------------------|
| ①②③ | Kernel × 3 | ~700行 | 插件生命周期 init→start→destroy | ✅ 核心 |
| ④ | types | 120行 | Plugin/PluginContext 接口 | ✅ 核心 |
| ⑤ | logger | ~400行 | Pino 封装 + 浏览器降级 | ⚠️ 可独立 |
| ⑥ | plugin-loader | ~500行 | 插件验证、版本兼容、工厂DI、作用域 | ⚠️ 过重 |
| ⑦⑧ | api-registry | ~300行 | API 端点注册/发现/冲突解决 | ❌ 不是内核 |
| ⑨ | QA | ? | 测试框架 | ❌ 不是内核 |
| ⑩ | security | ~300行 | 签名验证、配置校验、权限 | ⚠️ 边界 |
| ⑫ | health-monitor | ~300行 | 插件健康检查 | ⚠️ 可独立 |
| ⑬ | hot-reload | ~300行 | 状态快照/恢复 | ❌ 高级特性 |
| ⑭ | dependency-resolver | ? | 拓扑排序 + 循环检测 | ✅ 核心 |

#### `@objectstack/runtime` — 实际内容

```typescript name=runtime/src/index.ts url=https://github.com/objectstack-ai/spec/blob/ef29eb6b1823e8fdc47916a5c14a46e2aedd7a90/packages/runtime/src/index.ts#L1-L38
export { ObjectKernel } from '@objectstack/core';     // 直接转发
export { Runtime } from './runtime.js';                // ① 69行薄包装
export { DriverPlugin } from './driver-plugin.js';     // ② 数据库驱动适配器
export { AppPlugin } from './app-plugin.js';           // ③ 应用包加载器
export { createDispatcherPlugin } from './dispatcher-plugin.js'; // ④ HTTP 路由分发
export { HttpServer } from './http-server.js';         // ⑤ HTTP 抽象层
export { HttpDispatcher } from './http-dispatcher.js'; // ⑥ 请求分发器（40KB!）
export { MiddlewareManager } from './middleware.js';   // ⑦ 中间件管理

// 转发 @objectstack/rest 和 @objectstack/core
export * from '@objectstack/rest';
export * from '@objectstack/core';                     // ← 全量 re-export core
```

| # | 模块 | 行数 | 职责 |
|---|------|------|------|
| ① | Runtime | 69行 | `new ObjectKernel()` + `kernel.bootstrap()` 的薄包装 |
| ② | DriverPlugin | 76行 | 驱动注册 + 自动配置 default datasource |
| ③ | AppPlugin | ~150行 | 解析 Stack Definition → 注册元数据 + seed data |
| ④ | DispatcherPlugin | ~250行 | 注册 auth/graphql/analytics 等非 CRUD 路由 |
| ⑤ | HttpServer | ~130行 | IHttpServer 适配器 |
| ⑥ | HttpDispatcher | **~1000行** | 所有 HTTP 请求的分发逻辑（最大的文件） |
| ⑦ | MiddlewareManager | ~140行 | 中间件链排序和过滤 |

---

### 问题核心：你说的"core 更复杂"是事实

| 对比维度 | `@objectstack/core` | `@objectstack/runtime` |
|----------|:---:|:---:|
| **源文件数** | 14+ | 7 |
| **依赖数** | spec + pino + zod | core + rest + spec + types |
| **职责纯度** | ❌ 混合了很多不属于微内核的东西 | ⚠️ 定位模糊 |
| **"微内核"名副其实？** | **否** — API 注册表、QA、热更新、安全验证都塞进来了 | — |
| **Runtime 实际是什么？** | — | 69行薄壳 + 几个便利 Plugin + 巨大的 HttpDispatcher |

### 依赖关系现实

```
runtime 的 index.ts 最后一行：
export * from '@objectstack/core';   ← runtime 是 core 的超集！
```

这意味着：**任何 `import from '@objectstack/runtime'` 都能拿到 core 的全部导出**。runtime 不是 core 的"使用者"，它就是 core 的"facade + 追加"。

---

## 诊断结论：职责边界模糊

### 当前的问题

```
应该的架构：
  core  = 纯微内核 (Kernel + Plugin + DI + Hooks + 依赖解析)
  runtime = 标准库 (HTTP + 插件集 + 应用加载)

实际的架构：
  core  = 微内核 + 日志 + 安全 + 健康监控 + 热更新 + API注册表 + QA框架
  runtime = core 的 re-export + 69行 Runtime 壳 + HTTP + 3个Plugin
```

**core 承担了太多**，runtime 又**太薄**（核心只有 69 行的 `Runtime` 类）。

### 理想拆分方案

如果从零设计，边界应该是：

| 包 | 职责 | 包含什么 |
|---|------|----------|
| **core** (真·微内核) | 插件生命周期 + DI + Hooks | `ObjectKernel`, `LiteKernel`, `KernelBase`, `types`, `dependency-resolver`, `env` |
| **core** 不该有的 → | 应迁出 | `logger` → 独立包或留但精简<br>`api-registry` → runtime<br>`QA` → 独立包 `@objectstack/qa`<br>`security/` → `@objectstack/plugin-security` 或 runtime<br>`health-monitor` → runtime 或独立<br>`hot-reload` → runtime 或独立 |
| **runtime** (标准库) | HTTP + 标准 Plugin + 应用加载 | 现有内容 + 从 core 迁入的 api-registry, health-monitor |

### 但现在能做什么？

**不建议现在大拆**。原因：

1. **23 个包 + fixed 版本组** — 重构 core/runtime 边界会触发全量级联发版
2. **runtime 的 `export * from '@objectstack/core'`** — 所有下游消费者都通过 runtime 拿 core，改了会断
3. **核心套件 10/10 已完成** — 当前架构虽不完美但能工作

### 务实建议：渐进式瘦身

| 阶段 | 动作 | 影响 |
|------|------|------|
| **Now** | 把 fallback factories 放 core (上次讨论的) | ��向：内核自动 fallback，不增加 core 复杂度（只加一个目录） |
| **v3.x** | 从 core 导出中标记 `@internal`：QA, api-registry, hot-reload | 零破坏，但表明意图 |
| **v4.0** | 将 QA → `@objectstack/qa`，api-registry → runtime | Breaking change，major 版本做 |
| **v4.0** | Runtime 增加 core auto-fallback 逻辑，承担更多"标准库"职责 | Runtime 变厚，core 变薄 |

**一句话总结**：**core 确实太重了**，runtime 确实太薄了。核心原因是历史上所有"不知道放哪"的东西都堆进了 core。但现在不是拆的时候——v4.0 major 版本再清理边界，当前先用 `@internal` 标记 + 渐进式迁出。

> **注**: 搜索结果可能不完整，更多代码可在 [GitHub 代码搜索](https://github.com/search?q=repo%3Aobjectstack-ai%2Fspec+path%3Apackages%2Fcore%2Fsrc+OR+path%3Apackages%2Fruntime%2Fsrc&type=code) 中查看。