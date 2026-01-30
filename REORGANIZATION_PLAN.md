# ObjectStack 仓库重组方案
# ObjectStack Repository Reorganization Plan

**日期 / Date**: 2026-01-30  
**状态 / Status**: 提案 / Proposal  
**目标 / Goal**: 简化多包项目结构，降低维护成本

---

## 📊 当前状态分析 / Current State Analysis

### 现有包统计 / Existing Package Statistics

| 包名 / Package | 文件数 / Files | 代码行数估算 / LOC Estimate | 职责 / Responsibility |
|---|---:|---:|---|
| **@objectstack/spec** | 189 | ~15,000 | Protocol Definitions (Zod Schemas, Types) |
| @objectstack/core | 9 | ~400 | Microkernel (Plugin Loader, DI, Lifecycle) |
| @objectstack/objectql | 5 | ~1,500 | Query Engine (SQL Builder, AST Parser) |
| @objectstack/runtime | 3 | ~200 | Runtime Environment (Server, Workers) |
| @objectstack/types | 1 | ~30 | Shared Runtime Interfaces |
| @objectstack/client | 1 | ~500 | Client SDK (API Client, React Hooks) |
| @objectstack/cli | 3 | ~300 | Command Line Tool |
| @objectstack/ai-bridge | 5 | ~200 | AI Integration Bridge |
| **总计 / Total** | **216** | **~18,130** | |

### 核心问题 / Core Issues

1. **维护负担过重** / Excessive Maintenance Burden
   - 8个包需要独立管理版本、发布、文档
   - 交叉依赖复杂（大部分都依赖 spec）
   - 大部分包非常小（< 10 文件），不值得单独维护

2. **与设计文档不符** / Misaligned with Design Documents
   - 架构文档提到 `objectui` 和 `objectos`，但实际不存在
   - 当前拆分过细，不符合"易于维护"的原则

3. **用户意图** / User Intent
   - 用户明确表示"不想拆得那么细，维护不过来"
   - 用户提到已创建 spec, objectql, objectui, objectos 四个项目概念

---

## 🎯 重组方案 / Reorganization Proposal

### 方案 A：四包结构（推荐）/ Option A: 4-Package Structure (Recommended)

将所有代码重组为4个核心包，与用户提到的项目概念对齐：

```
┌─────────────────────────────────────────────────────────────┐
│                    @objectstack/spec                        │
│                   (协议定义层 / Protocol Layer)               │
│  • Zod Schemas, TypeScript Types, JSON Schemas              │
│  • 保持纯粹：只有定义，没有实现                                 │
│  • 189 文件 → 189 文件（保持不变）                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   @objectstack/objectql                     │
│              (数据引擎层 / Data Engine Layer)                │
│  • Query Engine + Schema Registry                           │
│  • Driver Abstraction + SQL Builder                         │
│  • 合并：objectql + 部分 core (data-engine contract)         │
│  • 5 文件 → ~10 文件                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   @objectstack/objectui                     │
│                 (UI 层 / UI Layer) - 新建                    │
│  • 从 spec 提取 UI 相关定义和实现                              │
│  • Component Library, Layout DSL                            │
│  • Widget Contracts, Theme Engine                           │
│  • 0 文件 → ~20 文件（从 spec/src/ui 提取）                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   @objectstack/objectos                     │
│              (系统运行时层 / System Runtime Layer) - 新建      │
│  • Microkernel (core) + Runtime + Client                    │
│  • CLI Tools + AI Bridge                                    │
│  • Plugin Management + Lifecycle                            │
│  • 合并：core + runtime + types + client + cli + ai-bridge   │
│  • 22 文件 → ~25 文件                                         │
└─────────────────────────────────────────────────────────────┘
```

#### 包职责划分 / Package Responsibilities

##### 1. `@objectstack/spec` (保持不变 / Keep as-is)
**职责**: 协议定义的"单一数据源"  
**内容**:
- ✅ 保留所有 Zod Schemas
- ✅ 保留所有 TypeScript Types
- ✅ 保留 JSON Schema 生成脚本
- ✅ 保留 defineStack 辅助函数
- ⚠️ **移除**: UI 相关定义 → 迁移到 @objectstack/objectui
- ⚠️ **移除**: System 相关定义 → 迁移到 @objectstack/objectos

**导出结构** (优化后):
```typescript
export * as Data from './data';
export * as AI from './ai';
export * as API from './api';
export * as Automation from './automation';
export * as Auth from './auth';
export * as Integration from './integration';
export * as Permission from './permission';
// UI 和 System 移除，使用独立包
```

##### 2. `@objectstack/objectql` (扩展 / Expand)
**职责**: 完整的数据引擎实现  
**当前内容** (5 文件):
- `engine.ts` - ObjectQL 引擎
- `protocol.ts` - 协议实现
- `registry.ts` - Schema 注册表
- `plugin.ts` - 插件桥接
- `index.ts` - 导出

**新增内容**:
- 从 `@objectstack/core` 迁移: `contracts/data-engine.ts`
- 从 `@objectstack/types` 迁移: Runtime context interfaces (如果有数据相关)

**最终结构**:
```
packages/objectql/
├── src/
│   ├── engine.ts          # ObjectQL 引擎实现
│   ├── protocol.ts        # 协议适配器
│   ├── registry.ts        # Schema 注册表
│   ├── plugin.ts          # 插件接口
│   ├── contracts/         # 新增：合约定义
│   │   └── data-engine.ts
│   └── index.ts
├── package.json
└── README.md
```

##### 3. `@objectstack/objectui` (新建 / New Package)
**职责**: UI 层的定义和运行时  
**从 spec 提取**:
- `spec/src/ui/*` → `objectui/src/protocol/*` (Schemas)

**新增实现**:
- `src/runtime/` - UI 运行时引擎
- `src/contracts/` - UI 契约接口
- `src/components/` - 组件基础类（如果需要）

**包结构**:
```
packages/objectui/
├── src/
│   ├── protocol/          # 从 spec/src/ui 迁移
│   │   ├── app.zod.ts
│   │   ├── view.zod.ts
│   │   ├── page.zod.ts
│   │   ├── dashboard.zod.ts
│   │   ├── report.zod.ts
│   │   ├── action.zod.ts
│   │   ├── theme.zod.ts
│   │   ├── widget.zod.ts
│   │   ├── component.zod.ts
│   │   ├── block.zod.ts
│   │   └── index.ts
│   ├── runtime/           # 新增：UI 运行时
│   │   ├── renderer.ts    # 页面渲染器
│   │   ├── theme-engine.ts
│   │   └── widget-registry.ts
│   ├── contracts/         # 新增：UI 契约
│   │   └── component.ts
│   └── index.ts
├── package.json
└── README.md
```

**依赖关系**:
```json
{
  "dependencies": {
    "@objectstack/spec": "workspace:*",
    "zod": "^3.22.4"
  }
}
```

##### 4. `@objectstack/objectos` (新建 / New Package)
**职责**: 系统运行时和工具链  
**合并来源**:
- `@objectstack/core` → `objectos/src/kernel/`
- `@objectstack/runtime` → `objectos/src/runtime/`
- `@objectstack/types` → `objectos/src/types/`
- `@objectstack/client` → `objectos/src/client/`
- `@objectstack/cli` → `objectos/src/cli/`
- `@objectstack/ai-bridge` → `objectos/src/ai/`
- `spec/src/system` → `objectos/src/protocol/`

**包结构**:
```
packages/objectos/
├── src/
│   ├── protocol/          # 从 spec/src/system 迁移
│   │   ├── manifest.zod.ts
│   │   ├── datasource.zod.ts
│   │   ├── driver.zod.ts
│   │   ├── plugin.zod.ts
│   │   ├── events.zod.ts
│   │   ├── cache.zod.ts
│   │   ├── job.zod.ts
│   │   └── ...
│   ├── kernel/            # 从 core 迁移
│   │   ├── kernel.ts
│   │   ├── logger.ts
│   │   └── types.ts
│   ├── contracts/         # 从 core/contracts 迁移
│   │   ├── http-server.ts
│   │   ├── logger.ts
│   │   └── ...
│   ├── runtime/           # 从 runtime 迁移
│   │   ├── driver-plugin.ts
│   │   └── app-plugin.ts
│   ├── client/            # 从 client 迁移
│   │   └── index.ts
│   ├── cli/               # 从 cli 迁移
│   │   ├── bin.ts
│   │   └── commands/
│   ├── ai/                # 从 ai-bridge 迁移
│   │   ├── generator/
│   │   └── ...
│   └── index.ts
├── bin/
│   └── objectstack.js
├── package.json
└── README.md
```

**CLI 支持**: 保留 bin 配置
```json
{
  "bin": {
    "objectstack": "./bin/objectstack.js",
    "os": "./bin/objectstack.js"
  }
}
```

---

### 方案 B：三包结构 / Option B: 3-Package Structure

如果希望更激进的简化：

```
@objectstack/spec      - 协议定义（纯 Schema）
@objectstack/engine    - 全部运行时（objectql + objectos 合并）
@objectstack/ui        - UI 层（独立，因为可能有 React 等依赖）
```

**不推荐理由**:
- 与用户提到的四个项目概念（spec, objectql, objectui, objectos）不符
- engine 包会变得过于庞大
- objectql 和 objectos 职责差异较大，不宜合并

---

## 📋 实施步骤 / Implementation Steps

### 阶段 1: 准备工作
- [ ] 1.1 获得用户确认选择方案 A 或方案 B
- [ ] 1.2 创建新包目录结构
- [ ] 1.3 备份当前状态（Git tag）

### 阶段 2: 创建新包
- [ ] 2.1 创建 `packages/objectui/` 包
  - [ ] 初始化 package.json
  - [ ] 创建目录结构
  - [ ] 从 spec/src/ui 复制文件
  - [ ] 更新导入路径
  - [ ] 配置 tsconfig.json
- [ ] 2.2 创建 `packages/objectos/` 包
  - [ ] 初始化 package.json
  - [ ] 创建目录结构
  - [ ] 从 spec/src/system 复制文件
  - [ ] 从 core 迁移代码
  - [ ] 从 runtime 迁移代码
  - [ ] 从 types 迁移代码
  - [ ] 从 client 迁移代码
  - [ ] 从 cli 迁移代码
  - [ ] 从 ai-bridge 迁移代码
  - [ ] 更新所有导入路径
  - [ ] 配置 tsconfig.json 和 bin

### 阶段 3: 更新现有包
- [ ] 3.1 更新 `@objectstack/spec`
  - [ ] 从 src/ui 删除文件（已迁移到 objectui）
  - [ ] 从 src/system 删除文件（已迁移到 objectos）
  - [ ] 更新 index.ts 导出
  - [ ] 更新 package.json exports
  - [ ] 更新文档
- [ ] 3.2 扩展 `@objectstack/objectql`
  - [ ] 从 core/contracts 复制 data-engine.ts
  - [ ] 更新导入
  - [ ] 更新 index.ts

### 阶段 4: 删除旧包
- [ ] 4.1 删除 `packages/core/`
- [ ] 4.2 删除 `packages/runtime/`
- [ ] 4.3 删除 `packages/types/`
- [ ] 4.4 删除 `packages/client/`
- [ ] 4.5 删除 `packages/cli/`
- [ ] 4.6 删除 `packages/ai-bridge/`

### 阶段 5: 更新依赖和示例
- [ ] 5.1 更新所有 examples/ 中的导入
- [ ] 5.2 更新 apps/docs 文档
- [ ] 5.3 更新根目录 README.md
- [ ] 5.4 更新 pnpm-workspace.yaml（如需要）

### 阶段 6: 测试和验证
- [ ] 6.1 运行所有包的构建：`pnpm build`
- [ ] 6.2 运行所有测试：`pnpm test`
- [ ] 6.3 验证示例项目能正常运行
- [ ] 6.4 验证 CLI 工具能正常工作

### 阶段 7: 文档更新
- [ ] 7.1 更新架构文档
- [ ] 7.2 更新 Migration Guide
- [ ] 7.3 更新 CHANGELOG.md
- [ ] 7.4 更新各包的 README

---

## 🔄 迁移影响分析 / Migration Impact Analysis

### 对现有用户的影响

#### Breaking Changes

1. **Import 路径变更**:
```typescript
// 旧方式 ❌
import { User } from '@objectstack/spec/auth';
import { AppSchema } from '@objectstack/spec/ui';
import { ObjectKernel } from '@objectstack/core';
import { ObjectQL } from '@objectstack/objectql';

// 新方式 ✅
import { User } from '@objectstack/spec/auth';      // Auth 保持在 spec
import { AppSchema } from '@objectstack/objectui';  // UI 移到新包
import { ObjectKernel } from '@objectstack/objectos'; // Kernel 移到 objectos
import { ObjectQL } from '@objectstack/objectql';   // ObjectQL 保持
```

2. **Package 依赖更新**:
```json
// 旧 package.json ❌
{
  "dependencies": {
    "@objectstack/spec": "^0.6.1",
    "@objectstack/core": "^0.6.1",
    "@objectstack/runtime": "^0.6.1",
    "@objectstack/client": "^0.6.1"
  }
}

// 新 package.json ✅
{
  "dependencies": {
    "@objectstack/spec": "^0.7.0",      // 保留
    "@objectstack/objectql": "^0.7.0",  // 保留
    "@objectstack/objectui": "^0.7.0",  // 新增
    "@objectstack/objectos": "^0.7.0"   // 合并了 core+runtime+client
  }
}
```

#### 迁移脚本

我们可以提供 codemod 脚本帮助用户自动迁移：

```bash
# 自动更新导入路径
npx @objectstack/codemod migrate-v0.7
```

---

## 📦 最终包清单 / Final Package List

### 方案 A（推荐）

| 包名 | 文件数估算 | 职责 | 状态 |
|---|---:|---|---|
| @objectstack/spec | ~170 | 协议定义（移除 UI/System） | 精简 |
| @objectstack/objectql | ~10 | 数据引擎 | 扩展 |
| @objectstack/objectui | ~20 | UI 层 | 新建 |
| @objectstack/objectos | ~25 | 系统运行时 | 新建 |
| **总计** | **~225** | | **4 包** |

**对比现状**: 8 包 → 4 包（减少 50%）

---

## ✅ 成功标准 / Success Criteria

- [ ] 包数量从 8 减少到 4
- [ ] 所有测试通过
- [ ] 所有示例项目正常运行
- [ ] 文档完整更新
- [ ] 提供 Migration Guide
- [ ] CI/CD 流水线正常
- [ ] npm 发布成功

---

## 📝 备注 / Notes

### 为什么这样拆分？

1. **@objectstack/spec 保持独立**
   - 作为"协议单一数据源"，纯定义无实现
   - 所有其他包都依赖它
   - 变更频率低，稳定性高

2. **@objectstack/objectql 专注数据**
   - 数据引擎是核心能力
   - 独立演进，可能有性能优化
   - 与 UI 层无耦合

3. **@objectstack/objectui 独立成包**
   - UI 层可能有 React/Vue 等框架依赖
   - 前端开发者只需要这个包 + spec
   - 可以独立于后端演进

4. **@objectstack/objectos 整合系统层**
   - Kernel + Runtime + CLI + Client 天然是一体的
   - 减少了大量小包的维护成本
   - 提供完整的系统能力

### 命名理由

- `objectql` - 保持原名，已被用户熟知
- `objectui` - 与用户提到的概念一致
- `objectos` - 与用户提到的概念一致，代表 "ObjectStack OS"

---

## 🤔 待讨论问题 / Questions for Discussion

1. **是否同意方案 A（4包结构）？**
   - 如果不同意，是否考虑方案 B（3包）或其他建议？

2. **版本号策略**
   - 是否统一升级到 0.7.0 来标识 Breaking Change？

3. **发布策略**
   - 是否需要保留旧包一段时间并标记为 deprecated？
   - 还是直接废弃旧包？

4. **向后兼容**
   - 是否提供兼容层（如 @objectstack/core 重新导出 objectos）？
   - 还是强制用户迁移？

---

**下一步**: 等待反馈，确认方案后开始实施。
