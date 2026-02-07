# ObjectStack Protocol Architecture & Zod Schema Audit Report

> **Generated:** 2026-02-07  
> **Scope:** `packages/spec/src/**/*.zod.ts` (139 files, 43,746 lines)  
> **Package:** `@objectstack/spec`  
> **Perspective:** Enterprise Management Software Architect + AI Agent Architect

---

## Executive Summary

| Metric | Value |
|---|---|
| Total `.zod.ts` files | **139** |
| Total lines of code | **43,746** |
| Exported schemas (`export const *Schema`) | **1,089** |
| `z.infer` type derivations | **1,011** |
| `.describe()` annotations | **5,026** |
| `z.any()` usages | **397** (across 88 files) |
| `z.unknown()` usages | **8** (across 3 files) |
| Files missing `z.infer` entirely | **5** |

### Overall Assessment

The codebase is **well-structured and professionally documented**, with excellent `.describe()` coverage (~5× per schema on average), consistent naming conventions, and good modular organization. The primary systemic issue is **pervasive `z.any()` usage** (397 instances in 63% of files), which undermines Zod's type-safety guarantees. A secondary concern is inconsistent use of `z.date()` vs `z.string().datetime()` for timestamps.

**Quality Grade: B+** — Excellent architecture and documentation, dragged down by loose typing.

---

## Part I: Protocol Architecture Evaluation (协议架构评估)

> 以下从**顶级企业管理软件架构师**和**AI Agent 架构师**的双重视角，评估 ObjectStack 协议的设计合理性、完备性与行业竞争力。

### 0. 协议全景图

```
                         ┌────────────────────────────┐
                         │    ObjectStackDefinition    │  ← stack.zod.ts (全栈蓝图)
                         │   (Project ≡ Plugin 统一)   │
                         └──────────┬─────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
   ┌────▼─────┐             ┌──────▼──────┐             ┌──────▼──────┐
   │  DATA    │             │     UI      │             │     AI      │
   │ Protocol │             │  Protocol   │             │  Protocol   │
   └────┬─────┘             └──────┬──────┘             └──────┬──────┘
        │                          │                           │
   Object ← Field            App ← View               Agent ← Tool
   Query ← Filter            Page ← Action             Orchestration
   Datasource ← Driver       Widget ← Theme            RAG ← Model
   Validation ← Hook         Dashboard ← Chart         Conversation
        │                          │                           │
   ┌────▼─────┐             ┌──────▼──────┐             ┌──────▼──────┐
   │ SECURITY │             │ AUTOMATION  │             │   SYSTEM    │
   │ Protocol │             │  Protocol   │             │  Protocol   │
   └──────────┘             └─────────────┘             └─────────────┘
   Permission ← RLS         Flow ← Workflow             Manifest ← Plugin
   Sharing ← Territory      Trigger ← Webhook           Identity ← SCIM
   Policy                   Approval ← ETL              Translation
```

---

### 1. 核心数据协议评估 (Data Protocol)

**评级: A-** — 联邦查询能力超越行业水平，但字段类型建模有结构性缺陷。

#### 1.1 架构决策评审

| 决策 | 分析 | 评价 |
|:---|:---|:---:|
| **Field 采用平坦 z.object() 而非 discriminatedUnion** | 46 种字段类型共享同一结构，`vectorConfig`/`currencyConfig` 等作为可选属性挂载。无法静态阻止 `type: 'text'` 搭配 `vectorConfig` 的非法组合 | ⚠️ |
| **Object.fields 使用 `z.record()` 而非数组** | 键即字段名，`Field.name` 变为冗余。比 Salesforce XML 紧凑，但查找模型与全栈定义的 `objects[]` 数组形式不一致 | ✅ |
| **QuerySchema 作为数据库无关 AST** | 统一 SQL/NoSQL/SaaS 为单一查询语言，含 Window Functions、Full-Text Search。SQL 偏向但 capability-driven 下推 | ✅✅ |
| **Capabilities-driven Query Planning** | 引擎根据 `DatasourceCapabilities` 判断下推 vs 内存计算，类似 Calcite/Trino 联邦查询 | ✅✅ |
| **Own/Extend 所有权模型** | 任何包可声明 `extend` 向其他包的对象注入字段，优先级系统控制合并 | ✅✅ |
| **Filter DSL 使用 MongoDB 风格 `$` 前缀** | 灵活但 `FilterConditionSchema` 使用 `z.record(z.string(), z.any())` 使运行时验证几乎为零 | ⚠️ |

#### 1.2 与行业领导者差距

| 缺失概念 | 影响度 | 说明 |
|:---|:---:|:---|
| **Record Type** | 🔴 高 | Salesforce 核心概念——同一对象按记录类型显示不同布局/验证/选项值。这是构建复杂业务应用的基础 |
| **Polymorphic Lookup** | 🟡 中 | Salesforce 的 `WhoId`/`WhatId` 可指向多个对象。当前 `reference` 只支持单一目标 |
| **Object Inheritance** | 🟡 中 | ServiceNow Table Inheritance 是其核心特性。当前有 `abstract` 标记但无 `extends` 继承链 |
| **Compound Fields** | 🟡 中 | Name (First+Last)、Address (structured) 等组合字段的声明缺失 |
| **Dependent Picklist** | 🟡 中 | 选项列表级联依赖（如「国家」控制「省份」选项） |
| **CTE / UNION / Subquery** | 🟢 低 | 复杂分析查询的 SQL 操作缺失，但可通过 analytics 层补充 |
| **Governor Limits** | 🟡 中 | 缺少查询配额/限制声明（Salesforce SOQL Limits 是治理基础） |
| **Field 通用扩展点** | 🟡 中 | 无 `metadata`/`extensions` record 让插件注入自定义字段属性 |

#### 1.3 突出优势

- **联邦数据架构**: 多数据源 + capability 驱动查询规划，超越所有传统低代码平台
- **事件溯源内置**: Object 级 `versioning: 'event_sourcing'` 模式声明
- **向量字段一等公民**: `type: 'vector'` + `vectorConfig`，为 AI-native 而生
- **Hook 优先级分层**: 0-99 系统级、100-999 应用级、1000+ 用户级，对标 K8s Admission Controller

---

### 2. AI Agent 协议评估 (AI Protocol)

**评级: B** — 单 Agent 能力业界领先，但多 Agent 协作和安全护栏是关键短板。

#### 2.1 架构能力矩阵

| 维度 | 评分 | 说明 |
|:---|:---:|:---|
| **Agent 定义** | 9/10 | 声明式 Agent + 角色/指令/模型/工具/知识/生命周期状态机。超越 OpenAI Assistants |
| **UI Action Protocol** | 9/10 | 40+ 原子动作覆盖导航/表单/数据/工作流/组件操作，业界领先 |
| **RAG Pipeline** | 9/10 | 10 种向量存储 + 4 种分块策略 + 4 种检索策略 + 重排序，企业就绪 |
| **Model Registry** | 9/10 | 完整的模型生命周期 + 降级 + 选择策略 + Prompt Template。正确的企业选择 |
| **Conversation Memory** | 8/10 | 多模态 + 5 种裁剪策略 + 向量嵌入。OpenAI 兼容的 Tool Call 协议 |
| **Tool Binding** | 5/10 | 松耦合 name 引用，**缺少 `inputSchema`/`outputSchema` 参数声明**。Agent 编译时不知工具签名 |
| **单 Agent 编排** | 6/10 | 10 种 AI 任务类型 + 批量执行，但仅支持任务级并行，非 Agent 级 |
| **多 Agent 协作** | 2/10 | **完全缺失**: 无 AgentTeam、Routing、Handoff、Supervisor 模式 |
| **Flow ↔ AI 集成** | 4/10 | Agent → Flow(✅) 但 Flow → Agent(❌)。Flow 节点无 `ai_task`/`agent_call` 类型 |
| **安全护栏** | 5/10 | 有确认/置信度/状态机约束，但缺 PII 检测、Prompt Injection 防护、内容安全策略 |

#### 2.2 关键架构缺陷

**缺陷 1: Flow 与 AI 是两个平行系统**

```
当前:  Agent ──→ Flow   (单向调用)
       Flow  ──✘ Agent  (Flow 无法调用 AI)

理想:  Agent ←──→ Flow  (双向集成)
       Flow 节点: [start, decision, ..., ai_task, agent_call, human_in_loop]
```

Flow 的 14 种节点类型中没有 `ai_task` 或 `agent_call`。这意味着自动化流程无法在中间步骤调用 AI 分类/提取/生成——必须用 `script` 节点做 escape hatch。

**缺陷 2: Tool 绑定缺乏参数声明**

```typescript
// 当前: Agent 只知道工具名和描述
AIToolSchema = { type, name, description }

// 缺失: 工具参数签名 (对标 OpenAI function calling)
AIToolSchema = { type, name, description, inputSchema, outputSchema }
```

没有 `inputSchema`/`outputSchema`，Agent 无法在编译时验证工具调用参数，LLM 也无法获得结构化的参数约束。

**缺陷 3: Agent 无法感知 Object Schema**

Agent 通过 `tools[].name` 字符串引用数据操作，但**不知道目标对象有哪些字段**。对比 Salesforce Einstein 的 "Object-Aware" 设计，Agent 需要 `objectBindings` 显式关联到 Object，使其能推理字段含义和数据约束。

**缺陷 4: 缺少企业 AI 安全层**

| 缺失 | 说明 |
|:---|:---|
| PII 检测/掩码 | 输入输出内容过滤 |
| Prompt Injection 防护 | 注入检测规则 |
| Agent 行为审计日志 | 全量操作记录 |
| Per-agent 速率限制 | 只有 model-level rateLimit |
| Content Safety Policy | 有害内容过滤规则 |

#### 2.3 行业对标

| 维度 | ObjectStack | OpenAI Assistants | LangGraph | AutoGen | Salesforce Einstein | ServiceNow Now Assist |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| Agent 定义 | ✅ 声明式 | ✅ API | ✅ Code | ✅ Code | ✅ 配置 | ✅ 配置 |
| Tool Binding | ⚠️ name引用 | ✅ JSON Schema | ✅ Python 函数 | ✅ Python 函数 | ✅ Action+Topic | ✅ Skill |
| Multi-Agent | ❌ | ❌ | ✅✅ | ✅✅✅ | ✅ Topic路由 | ⚠️ |
| State Machine | ✅✅ XState | ❌ | ✅ Graph | ❌ | ❌ | ❌ |
| RAG Pipeline | ✅✅✅ | ✅ File Search | ⚠️ 需自建 | ⚠️ 需自建 | ✅ Data Cloud | ✅ |
| UI Action | ✅✅✅ 40+ | ❌ | ❌ | ❌ | ✅ Quick Action | ✅ |
| Flow-AI 集成 | ⚠️ 单向 | ❌ | ✅ 原生 | ⚠️ | ✅✅ | ✅ |
| 成本追踪 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Guardrails | ⚠️ 中等 | ⚠️ | ⚠️ | ⚠️ | ✅ Trust Layer | ✅ |

---

### 3. 安全协议评估 (Security Protocol)

**评级: A-** — RLS 业界领先，Permission Set 模型成熟，但缺少数据分类和动态脱敏。

#### 3.1 安全模型：混合 RBAC + ABAC + PBAC

ObjectStack 融合了四种安全范式：

| 模型 | 来源 | 说明 |
|:---|:---|:---|
| **RBAC** | role.zod.ts | 角色层级，经理看到下属数据 |
| **PBAC** | permission.zod.ts | Profile + Permission Set 双层（Salesforce 模式） |
| **ABAC** | rls.zod.ts | RLS `using` 子句引用 `current_user.*` 上下文属性 |
| **OWD** | sharing.zod.ts | private / public_read / public_read_write / controlled_by_parent |

#### 3.2 安全层次评估

| 安全层 | 评分 | 说明 |
|:---|:---:|:---|
| 对象权限 (CRUD+) | ★★★★★ | 超越 Salesforce — `allowPurge`(GDPR硬删) + `allowRestore`(回收站) |
| 字段安全 (FLS) | ★★★☆☆ | 读/写双维度，但缺数据分类标签和动态脱敏 |
| 行级安全 (RLS) | ★★★★★ | **业界领先** — PostgreSQL RLS + Salesforce Sharing 融合，含审计/缓存/工厂 |
| 共享规则 | ★★★★☆ | Criteria + Owner Based，但缺 Manual Sharing 和 Programmatic Sharing |
| 安全策略 | ★★★★☆ | 密码/网络/会话/审计四维，但缺 Device Trust 和 OAuth Scope |
| 区域管理 | ★★★★☆ | 完整复刻 Salesforce ETM 2.0 |
| 身份 / SCIM | ★★★★★ | 完整 RFC 7643/7644，Okta/Azure AD 就绪 |

#### 3.3 关键安全缺口

| # | 缺失 | 严重度 | 对标 |
|:---|:---|:---:|:---|
| GAP-1 | **数据分类标签** (PII/PHI/PCI) | 🔴 高 | Salesforce Shield, AWS Macie — 无法通过 HIPAA/PCI-DSS 合规 |
| GAP-2 | **动态数据脱敏** | 🔴 高 | SQL Server DDM, Oracle VPD |
| GAP-3 | **字段级加密策略** | 🔴 高 | Salesforce Shield Platform Encryption |
| GAP-4 | **Permission Registry** | 🟡 中 | `manifest.permissions` 是字符串数组，无权限注册表枚举 |
| GAP-5 | **OAuth Scope 绑定** | 🟡 中 | Endpoint 不声明所需 scope |
| GAP-6 | **Plugin 沙箱** | 🟡 中 | 插件上下文未按 manifest permissions 裁剪能力 |
| GAP-7 | **Manual/Programmatic Sharing** | 🟡 中 | 单条记录级手动共享和代码驱动共享 |
| GAP-8 | **权限委托/临时提权** | 🟢 低 | AWS STS AssumeRole |

---

### 4. UI 协议评估 (UI Protocol)

**评级: A-** — View/Form 声明能力超越 Salesforce Lightning，但响应式和实时协作是断层。

#### 4.1 范式判定：元数据驱动 + 组件组合 + 逃生舱口

ObjectStack UI 协议提供三条路径：

| 路径 | 场景 | 覆盖率 |
|:---|:---|:---|
| **快速路径 (View)** | 标准 CRUD 列表/表单 | ~80% 企业场景 |
| **高级路径 (Page)** | 自定义布局（仪表盘、审批页、AI 对话） | ~15% |
| **逃生舱口 (Widget)** | 完全自定义 UI（npm/Module Federation/inline） | ~5% |

#### 4.2 能力矩阵

| 维度 | 评分 | 说明 |
|:---|:---:|:---|
| CRUD 列表/表单 | **A** | 7 种列表 + 6 种表单 + 3 种数据源 + 7 种导航模式 |
| 仪表盘/报表 | **A** | 30+ 图表类型 + React-Grid-Layout + 4 种报表类型 |
| 操作/工作流 | **A-** | Action → Flow/API/Script，含确认/参数/刷新完整链路 |
| 页面组合 | **B+** | 模板+区域+组件树，但 `z.any()` 削弱 Props 安全 |
| 主题/品牌 | **A** | 完整 Design Token + 暗色模式 + 主题继承 |
| 自定义组件 | **A** | npm + Module Federation + inline，7 个生命周期，DOM 事件 |
| **移动端适配** | **C** | Breakpoints 存在但 View/Page 无法消费，响应式断层 |
| **实时协作** | **D** | 无 Presence/CRDT/Optimistic Update 声明 |
| **国际化** | **D** | UI 层无 i18n key 引用机制 |

#### 4.3 行业对标差距

| vs Salesforce Lightning | 严重度 | 说明 |
|:---|:---:|:---|
| Record Type → Layout 映射 | 🔴 高 | 同一对象按记录类型显示不同表单布局 |
| Compact Layout | 🟡 中 | lookup 预览的精简视图 |
| 响应式布局 | 🔴 高 | 断点定义了但无消费协议 |

| vs Retool/Appsmith | 严重度 | 说明 |
|:---|:---:|:---|
| 组件级 Query Binding | 🟡 中 | Page 组件依赖父级上下文而非独立数据绑定 |
| 组件级响应式 | 🔴 高 | 无组件级断点折叠 |

| vs ServiceNow UI Builder | 严重度 | 说明 |
|:---|:---:|:---|
| 页面级 Data Resources | 🟡 中 | `variables[]` 只是本地状态，无声明式数据获取 |

---

### 5. 跨域协议一致性评估

#### 5.1 数据结构一致性

| 问题 | 位置 | 影响 |
|:---|:---|:---|
| **Array vs Map 不一致** | `Object.fields` 用 `z.record()`，`StackDefinition.objects/views/roles` 用 `z.array()` | 查找语义不统一 |
| **标识符验证二元化** | 4 个 UI 文件用 `SnakeCaseIdentifierSchema`，4 个用 inline regex | 约束强度不一致 |
| **隔离级别枚举碎片化** | driver.zod.ts L101 kebab-case vs L570 SQL 大写 | 同一概念两种表达 |

#### 5.2 AI ↔ Data 连接断裂

| 断裂点 | 说明 | 影响 |
|:---|:---|:---|
| Agent 不感知 Object Schema | Agent 只知道 tool name，不知道字段定义 | AI 无法基于数据结构推理 |
| RAG 索引弱引用 | `knowledge.indexes` 是字符串数组，不引用 `RAGPipelineConfig.name` | 配置可能无效 |
| Flow 无 AI 节点 | Flow 的 14 种节点中没有 `ai_task`/`agent_call` | 自动化无法调用 AI |

#### 5.3 Security ↔ UI 连接断裂

| 断裂点 | 说明 | 影响 |
|:---|:---|:---|
| View 不引用 Permission | ListView/FormView 无 `requiredPermission` 声明 | 安全靠运行时而非声明式 |
| Action 无权限绑定 | ActionSchema 有 `visible` 表达式但无 permission 引用 | 操作按钮无法声明式权限门控 |

#### 5.4 UI ↔ Data 连接质量

| 连接 | 状态 | 说明 |
|:---|:---:|:---|
| View → Object | ✅ 🟢 | `ViewDataSchema` provider='object' + objectName |
| Action → Flow | ✅ 🟢 | `type: 'flow'` + target |
| Dashboard → Filter | ✅ 🟢 | 导入 `FilterConditionSchema` |
| **View → Filter** | ❌ 🔴 | `view.filter` 用 `z.array(z.any())` 而非 `FilterConditionSchema` |
| **Page → Data** | ⚠️ 🟡 | Page 无声明式数据获取，组件 props 全是 `z.any()` |

---

### 6. 全局评分总表

| 协议域 | 设计成熟度 | 行业对标 | 评分 |
|:---|:---|:---|:---:|
| **Data — Object/Field** | 联邦查询超越行业，但 Field 结构需 discriminatedUnion | 超越 Salesforce(查询), 落后(RecordType) | **A-** |
| **Data — Query/Filter** | 窗口函数/全文搜索/游标分页，接近 BI 级 | 超越低代码, 接近 Trino | **A** |
| **AI — Agent/RAG** | 40+ UI Action 业界领先，RAG 企业就绪 | 超越 OpenAI, 落后 LangGraph(多Agent) | **B** |
| **AI — Orchestration** | 单 Agent 编排，缺多 Agent 和 Flow 双向 | 落后 LangGraph/AutoGen | **C+** |
| **Security — RLS/Sharing** | PostgreSQL RLS + Salesforce Sharing 融合 | 对等 Salesforce, 部分超越 | **A** |
| **Security — 合规** | 缺数据分类 + 动态脱敏 + 字段加密 | 落后 Salesforce Shield | **B-** |
| **UI — View/Form** | 7 视图 + 6 表单 + 7 导航 + 3 数据源 | 超越 Salesforce Lightning(80%) | **A-** |
| **UI — 响应式/协作** | 断点定义有但无消费，无实时协议 | 落后 Retool/ServiceNow | **D+** |
| **Automation — Flow** | DAG 图 + 14 节点 + 5 触发器 | 对等 Salesforce Flow | **B+** |
| **Kernel — Plugin** | Manifest + Own/Extend + Priority 合并 | 超越 Salesforce Managed Package | **A-** |
| **System — Identity** | SCIM 2.0 + 多租户 + 角色层级 | 对等行业最佳 | **A** |

**总体架构评级: B+/A-** — 一个有清晰愿景和专业执行的协议体系，离企业 SaaS 生产力平台差 3 个关键补齐。

---

### 7. 优先级路线图: 从 B+ 到 A

#### Tier 1 — 架构性补齐 (必须，影响市场竞争力)

| # | 行动 | 新增文件/字段 | 对标 |
|:---|:---|:---|:---|
| **T1-1** | **Flow 增加 AI 节点** — `ai_task`, `agent_call`, `human_in_loop` | `automation/flow.zod.ts` 新增 3 种节点 | LangGraph, Salesforce Einstein |
| **T1-2** | **AITool 增加参数声明** — `inputSchema`, `outputSchema` (JSON Schema) | `ai/agent.zod.ts` AIToolSchema | OpenAI function calling |
| **T1-3** | **新建多 Agent 协议** — AgentTeam, Routing, Handoff, Supervisor | 新文件 `ai/multi-agent.zod.ts` | AutoGen, LangGraph |
| **T1-4** | **新建 AI 安全护栏** — PII filter, prompt injection, content safety, audit | 新文件 `ai/guardrails.zod.ts` | Salesforce Trust Layer |
| **T1-5** | **数据分类 + 动态脱敏协议** | `security/classification.zod.ts` + `security/masking.zod.ts` | Salesforce Shield, AWS Macie |

#### Tier 2 — 能力性补齐 (重要，影响企业客户准入)

| # | 行动 | 影响域 |
|:---|:---|:---|
| **T2-1** | **Record Type 协议** — 同一对象多种布局/验证/选项值 | data + ui |
| **T2-2** | **Field discriminatedUnion** — 按类型特化字段属性 | data/field.zod.ts |
| **T2-3** | **响应式布局消费** — View/Page 引用断点，组件级 responsive 声明 | ui |
| **T2-4** | **Page-level Data Fetching** — 声明式数据获取（类似 Remix loader） | ui/page.zod.ts |
| **T2-5** | **Agent objectBindings** — Agent 显式关联 Object Schema | ai/agent.zod.ts |
| **T2-6** | **Governor Limits 协议** — 查询配额/限制声明（SOQL Limits 等价） | data/query.zod.ts |
| **T2-7** | **字段级加密策略 + Permission Registry** | security |

#### Tier 3 — 完善性优化 (持续改进)

| # | 行动 |
|:---|:---|
| T3-1 | Field 通用扩展点 (`extensions: z.record()`) |
| T3-2 | Polymorphic Lookup / Dependent Picklist / Compound Fields |
| T3-3 | Manual/Programmatic Sharing |
| T3-4 | UI 国际化 key 引用机制 |
| T3-5 | 实时协作协议 (Presence/CRDT) |
| T3-6 | 地理空间查询操作符 (`$near`/`$within`) |

---

## Part II: Zod Schema Code Quality Audit (代码质量审计)

> 以下是对 139 个 `.zod.ts` 文件的代码级审计结果。

## Per-Directory Statistics

| Directory | Files | Lines | Schemas | `z.infer` | `.describe()` | `z.any()` | Quality |
|---|---|---|---|---|---|---|---|
| **ai/** | 13 | 5,023 | ~85 | 138 | 630 | 57 | ⭐⭐⭐⭐ |
| **api/** | 20 | 7,133 | ~120 | 205 | 906 | 99 | ⭐⭐⭐ |
| **automation/** | 8 | 2,403 | ~45 | 41 | 327 | 30 | ⭐⭐⭐⭐ |
| **data/** | 18 | 5,525 | ~90 | 97 | 574 | 71 | ⭐⭐⭐ |
| **hub/** | 9 | 2,929 | ~50 | 49 | 145 | 4 | ⭐⭐⭐⭐ |
| **identity/** | 4 | 1,383 | ~20 | 23 | 150 | 3 | ⭐⭐⭐ |
| **integration/** | 7 | 3,197 | ~40 | 63 | 365 | 7 | ⭐⭐⭐⭐⭐ |
| **kernel/** | 17 | 5,689 | ~100 | 126 | 559 | 57 | ⭐⭐⭐ |
| **qa/** | 1 | 84 | 6 | 5 | 9 | 0 | ⭐⭐⭐⭐ |
| **security/** | 5 | 1,054 | ~15 | 14 | 76 | 2 | ⭐⭐⭐⭐ |
| **shared/** | 4 | 449 | ~10 | 10 | 44 | 3 | ⭐⭐⭐⭐⭐ |
| **system/** | 22 | 6,606 | ~100 | 184 | 810 | 45 | ⭐⭐⭐⭐ |
| **ui/** | 10 | 1,932 | ~30 | 51 | 347 | 18 | ⭐⭐⭐⭐ |
| **root** | 1 | 340 | 6 | 5 | ~30 | 1 | ⭐⭐⭐⭐⭐ |

---

## 1. Detailed Directory Analysis

### 1.1 `ai/` — AI Protocol (13 files, 5,023 LOC)

**Strengths:**
- Excellent cross-module architecture — `cost.zod.ts` exports `TokenUsageSchema` consumed by 5+ siblings
- Rich JSDoc with live examples (especially `devops-agent.zod.ts` at 891 lines)
- Good use of `z.discriminatedUnion()` in `rag-pipeline.zod.ts` (chunking strategies, retrieval strategies)
- `predictive.zod.ts` uses `.superRefine()` for data-split ratio validation — exemplary

**Key Files:**

| File | Exported Schemas | `z.any()` | `z.infer` types | Notes |
|---|---|---|---|---|
| `agent.zod.ts` | AgentSchema, AIModelConfigSchema, AIToolSchema, AIKnowledgeSchema | 0 | 2 | ✅ Clean |
| `agent-action.zod.ts` | ~20 schemas (NavigationAction, ViewAction, FormAction, etc.) | 6 | 16 | TypedAgentActionSchema union is impressive |
| `model-registry.zod.ts` | 10 schemas | 3 | 10 | ✅ Excellent describe coverage |
| `rag-pipeline.zod.ts` | 16 schemas | 3 | 0 | ⚠️ **Missing z.infer exports** |
| `orchestration.zod.ts` | 9 schemas | ~10 | 9 | z.any() heavy in I/O schemas |
| `conversation.zod.ts` | 18 schemas | 5 | 14 | Good TypedContent discriminated union |
| `cost.zod.ts` | 16 schemas | 5 | 16 | ✅ Core shared module |
| `predictive.zod.ts` | 9 schemas | 5 | ~4 | superRefine validation is excellent |
| `feedback-loop.zod.ts` | 3 schemas | 0 | 3 | ✅ Uses z.unknown() correctly |
| `devops-agent.zod.ts` | ~14 schemas | 2 | 12 | Largest AI file, has example object |
| `nlq.zod.ts` | 13 schemas | 6 | ~4 | ⚠️ Partial z.infer exports |
| `plugin-development.zod.ts` | 8 schemas | 3 | 8 | ✅ Well-structured |
| `runtime-ops.zod.ts` | 8 schemas | 4 | 8 | Imports from kernel/ |

**Issues:**
- `rag-pipeline.zod.ts` exports 16 schemas but **zero** `z.infer` type exports
- `nlq.zod.ts` only exports 4 of ~13 types
- `z.any()` used 57 times — primarily for metadata records, config objects, and AST structures

---

### 1.2 `api/` — API Protocol (20 files, 7,133 LOC)

**Strengths:**
- Largest protocol directory with comprehensive coverage (REST, GraphQL, OData, WebSocket, Realtime)
- `discovery.zod.ts` is cleanly designed with zero `z.any()`
- `errors.zod.ts` provides `ErrorHttpStatusMap` constant + runtime helpers (`createErrorResponse()`)
- `batch.zod.ts` well-documented with examples

**Key Files:**

| File | Exported Schemas | `z.any()` | Notes |
|---|---|---|---|
| `contract.zod.ts` | ~12 | 3 | `RecordDataSchema = z.record(z.string(), z.any())` — foundational |
| `protocol.zod.ts` | ~20 | 10+ | Heaviest z.any() user; metadata payloads inherently dynamic |
| `graphql.zod.ts` | ~15 | 3 | 911 lines, only 300 audited |
| `registry.zod.ts` | ~20 | 15+ | JSON Schema interop requires z.any() |
| `documentation.zod.ts` | ~10 | 12 | OpenAPI spec components are dynamic |
| `discovery.zod.ts` | 3 | 0 | ✅ Cleanest API file |
| `router.zod.ts` | 3 | 0 | ✅ Clean |
| `errors.zod.ts` | ~12 | 3 | ⚠️ Contains runtime helper functions |
| `realtime.zod.ts` | ~9 | 3 | ⚠️ Duplicates Presence schemas from websocket.zod.ts |
| `websocket.zod.ts` | ~15 | 6 | Rich collaborative editing schemas |
| `auth.zod.ts` | ~9 | 0 | ⚠️ Uses `z.date()` instead of iso strings |

**Issues:**
- **99 `z.any()` usages** — highest of any directory. Mostly justified (OpenAPI, JSON Schema, dynamic payloads) but some could be tightened
- `errors.zod.ts` exports **runtime functions** (`createErrorResponse()`, `getHttpStatusForCategory()`) — violates "no business logic" principle
- `contract.zod.ts` and `analytics.zod.ts` have **no `z.infer` type exports**
- `auth.zod.ts` uses `z.date()` for `createdAt`, `updatedAt`, `expiresAt` — inconsistent with ISO string patterns used elsewhere
- Presence schema duplication: `realtime.zod.ts` PresenceStatus/PresenceSchema overlaps with `websocket.zod.ts` WebSocketPresenceStatus/PresenceStateSchema

---

### 1.3 `automation/` — Automation Protocol (8 files, 2,403 LOC)

**Strengths:**
- Clean 3-layer architecture: sync (L1) → ETL (L2) → connector (L3), well-documented
- `state-machine.zod.ts` handles recursive types with `z.lazy()` properly
- `approval.zod.ts` exports factory method `ApprovalProcess.create()`
- All files use `SnakeCaseIdentifierSchema` from `shared/identifiers.zod.ts`

**Key Files:**

| File | Exported Schemas | `z.any()` | Notes |
|---|---|---|---|
| `flow.zod.ts` | 5 | 2 | ✅ Clean by design |
| `workflow.zod.ts` | ~10 | 6 | Good discriminatedUnion, uses shared identifiers |
| `trigger-registry.zod.ts` | ~10 | 5 | Has its own ConnectorSchema (different from integration/connector) |
| `approval.zod.ts` | 3 | 1 | ✅ Has factory method |
| `state-machine.zod.ts` | 6 | 4 | Uses z.lazy() for recursive StateNodeSchema |
| `webhook.zod.ts` | 3 | 1 | ✅ Simple and clean |
| `sync.zod.ts` | ~10 | 2 | Good 3-layer documentation |
| `etl.zod.ts` | ~10 | 5 | Well-positioned in architecture |

**Issues:**
- `trigger-registry.zod.ts` defines its own `ConnectorSchema` which overlaps with `integration/connector.zod.ts` — **intentional by design** (lightweight vs enterprise, documented with comments) but could cause confusion
- `approval.zod.ts` factory breaks "no business logic" rule (minor)

---

### 1.4 `data/` — Data Protocol (18 files, 5,525 LOC)

**Strengths:**
- Core protocol layer with comprehensive field types, validation, and driver interfaces
- `field.zod.ts` is the most important schema — well-structured with 70+ field-related types
- `filter.zod.ts` implements MongoDB-style query operators with proper recursive types
- `driver.zod.ts` uses `z.function()` for interface contracts — advanced pattern

**Key Files:**

| File | Exported Schemas | `z.any()` | Notes |
|---|---|---|---|
| `field.zod.ts` | ~15 | 1 | Only `defaultValue: z.any()` — appropriate |
| `object.zod.ts` | ~5 | 0 | ✅ Core object definition |
| `validation.zod.ts` | ~12 | 3 | Uses `z.lazy()` for recursive ValidationRuleSchema |
| `filter.zod.ts` | ~10 | 8 | `$eq: z.any()` etc. — inherent to filter operators |
| `driver.zod.ts` | 5 | 25+ | Heaviest z.any() user — `z.function()` args/returns |
| `data-engine.zod.ts` | ~8 | 20+ | Same pattern as driver — function interfaces |
| `datasource.zod.ts` | 2 | 3 | Config records are inherently dynamic |
| `document.zod.ts` | ~4 | 1 | ✅ Clean document management |
| `query.zod.ts` | ? | ? | Query DSL |
| `analytics.zod.ts` | ~5 | 0 | ✅ Cube/metrics schema |

**Issues:**
- `driver.zod.ts` and `data-engine.zod.ts` together have ~45 `z.any()` usages — necessary for `z.function()` interface contracts but defeats type-safety
- `validation.zod.ts` has `ValidationRuleSchema: z.ZodType<any>` — loses type info in recursive schema
- `filter.zod.ts` uses `z.date()` in comparison operators — the only appropriate use of z.date() (for runtime filter comparisons)

---

### 1.5 `hub/` — Hub/Marketplace Protocol (9 files, 2,929 LOC)

**Strengths:**
- Only **4 `z.any()` usages** across 9 files — cleanest large directory
- Comprehensive multi-tenancy support (`tenant.zod.ts` at 594 types with 3 isolation strategies)
- `plugin-security.zod.ts` is extensive (SBOM, provenance, trust scores)
- `hub-federation.zod.ts` models geo-distributed hub topology

**Key Files:**

| File | Exported Schemas | `z.any()` | Notes |
|---|---|---|---|
| `tenant.zod.ts` | ~10 | 1 | ✅ Excellent discriminatedUnion for isolation strategies |
| `plugin-registry.zod.ts` | ~6 | 1 | ✅ Well-designed |
| `plugin-security.zod.ts` | ~14 | 0 | ✅ Exemplary — no z.any() in 741 lines |
| `hub-federation.zod.ts` | ~7 | 0 | ✅ Clean geo-distribution model |
| `space.zod.ts` | ~4 | 0 | ✅ Clean |
| `marketplace.zod.ts` | 2 | 0 | ✅ Clean |
| `license.zod.ts` | 3 | 0 | ✅ Clean |
| `composer.zod.ts` | 3 | 1 | Minimal z.any() |
| `registry-config.zod.ts` | 3 | 1 | Credentials record |

**Issues:**
- Minor: `hub-federation.zod.ts` has duplicate type patterns with `kernel/plugin-versioning.zod.ts` (DependencyConflict)
- Otherwise excellent quality

---

### 1.6 `identity/` — Identity Protocol (4 files, 1,383 LOC)

**Key Files:**

| File | Exported Schemas | `z.any()` | Notes |
|---|---|---|---|
| `identity.zod.ts` | UserSchema, AccountSchema, SessionSchema, VerificationTokenSchema | 0 | ⚠️ Uses `z.date()` |
| `role.zod.ts` | RoleSchema | 0 | ✅ Clean, uses SnakeCaseIdentifierSchema |
| `organization.zod.ts` | OrganizationSchema, MemberSchema, InvitationSchema | 1 | ⚠️ Uses `z.date()` |
| `scim.zod.ts` | ~20+ SCIM schemas | 0 | ✅ Uses `z.string().datetime()` correctly |

**Issues:**
- **`z.date()` vs `z.string().datetime()` inconsistency:**
  - `identity.zod.ts` and `organization.zod.ts` use `z.date()` for `createdAt`, `updatedAt`
  - `scim.zod.ts` correctly uses `z.string().datetime()` for timestamps
  - `z.date()` is problematic for JSON serialization — Date objects don't survive JSON.parse/stringify
  - **Recommendation:** Standardize on `z.string().datetime()` for all serializable timestamps

---

### 1.7 `integration/` — Integration Protocol (7 files, 3,197 LOC)

**Strengths:**
- **Best-documented directory** — every connector has 50+ line JSDoc blocks with positioning, use-cases, and examples
- Clean layered architecture consistently documented (L1/L2/L3)
- Re-uses `ConnectorAuthConfigSchema` from `shared/connector-auth.zod.ts` — good DRY
- Each specialized connector (GitHub, Vercel, Database, FileStorage, SaaS, MessageQueue) extends base `ConnectorSchema`

**Key Files:**

| File | Notes |
|---|---|
| `connector.zod.ts` | Base connector — imports shared auth, mapping. Only 7 z.any() |
| `connector/github.zod.ts` | GitHub-specific: repos, PRs, Actions, releases |
| `connector/database.zod.ts` | Database-specific: CDC, pooling, SSL |
| `connector/file-storage.zod.ts` | S3/Azure/GCS: multipart, versioning, encryption |
| `connector/saas.zod.ts` | SaaS-specific: OAuth, pagination, sandboxing |
| `connector/vercel.zod.ts` | Vercel-specific: deployments, edge functions, domains |
| `connector/message-queue.zod.ts` | Kafka/RabbitMQ: consumer groups, DLQ, SASL |

**Issues:**
- `connector.zod.ts` has `AuthenticationSchema` as deprecated alias — should be removed
- `connector.zod.ts` has deprecated `FieldTransformSchema` — should be removed
- `message-queue.zod.ts` has `z.any()` in message filter attributes

---

### 1.8 `kernel/` — Kernel Protocol (17 files, 5,689 LOC)

**Key Files:**

| File | `z.any()` | Notes |
|---|---|---|
| `plugin.zod.ts` | **20+** | Most z.any()-heavy file — service interfaces use z.any() for methods |
| `events.zod.ts` | 10 | Event handlers, filters, transforms are functions |
| `manifest.zod.ts` | 5 | Config defaults, I/O schemas |
| `metadata-loader.zod.ts` | 4 | Data payloads inherently dynamic |
| `plugin-lifecycle-advanced.zod.ts` | 3 | State snapshots |
| `plugin-security-advanced.zod.ts` | 0 | ✅ 700 lines, zero z.any() |
| `plugin-versioning.zod.ts` | 0 | ✅ Clean |
| `plugin-loading.zod.ts` | 1 | ✅ Minimal |
| `plugin-capability.zod.ts` | 1 | ✅ Clean |
| `startup-orchestrator.zod.ts` | 2 | Minimal |

**Issues:**
- `plugin.zod.ts` uses `z.any()` 20+ times for service method signatures — Zod can't express function interfaces well, but a comment explains this justification
- `plugin-structure.zod.ts` has **no `z.infer` exports** despite exporting 3 schemas
- `events.zod.ts` uses `z.any()` for handler/filter/transform functions — same limitation as plugin.zod.ts

---

### 1.9 `security/` — Security Protocol (5 files, 1,054 LOC)

**Strengths:**
- Very clean directory with only **2 `z.any()` usages**
- Excellent documentation with Salesforce/Microsoft/Kubernetes comparisons
- `rls.zod.ts` at 661 lines is comprehensive with PostgreSQL RLS examples

**Key Files:**

| File | Notes |
|---|---|
| `permission.zod.ts` | ObjectPermission, FieldPermission, PermissionSet — 1 z.any() |
| `sharing.zod.ts` | Sharing rules with discriminatedUnion — **SharingRuleSchema typed as `z.ZodType<any>`** |
| `policy.zod.ts` | Password, Network, Session, Audit policies — 0 z.any() |
| `rls.zod.ts` | Row-level security — 1 z.any() |
| `territory.zod.ts` | Territory model — 0 z.any() |

**Issues:**
- `sharing.zod.ts` types `SharingRuleSchema` as `z.ZodType<any>` — **significant type-safety loss**
- Limited `z.infer` coverage (14 exports, but proportional to 15 schemas)

---

### 1.10 `shared/` — Shared Utilities (4 files, 449 LOC)

**Strengths:**
- Perfect foundational layer — small, focused, widely imported
- `identifiers.zod.ts` is the naming convention enforcer (SystemIdentifierSchema, SnakeCaseIdentifierSchema, EventNameSchema)
- `connector-auth.zod.ts` uses `z.discriminatedUnion` perfectly (5 auth types)

**Key Files:**

| File | Notes |
|---|---|
| `identifiers.zod.ts` | ✅ **Exemplary** — regex-enforced naming, exceptional documentation |
| `http.zod.ts` | ✅ HttpMethod, CorsConfig, RateLimitConfig, StaticMount — clean |
| `mapping.zod.ts` | FieldMappingSchema with discriminatedUnion TransformType — 2 z.any() (constant value, default) |
| `connector-auth.zod.ts` | ✅ 5-type auth discriminated union — clean, zero z.any() |

**Issues:**
- `mapping.zod.ts` has `value: z.any()` for constant transforms and `defaultValue: z.any()` — hard to avoid

---

### 1.11 `system/` — System Protocol (22 files, 6,606 LOC)

Largest directory by file count. Contains runtime configuration schemas for logging, tracing, metrics, audit, compliance, collaboration, caching, jobs, search, http-server, migration, notification, etc.

**Highlights:**
- 184 `z.infer` types — excellent type export coverage
- 810 `.describe()` annotations
- 45 `z.any()` usages spread across 22 files (moderate)

**Notable Issues:**
- `metadata-persistence.zod.ts` uses `z.date()` (line 80) — same inconsistency as identity/
- `migration.zod.ts` uses `z.unknown()` for `changes` field — correct usage
- `auth-config.zod.ts` has **no `z.infer` exports**

---

### 1.12 `ui/` — UI Protocol (10 files, 1,932 LOC)

**Highlights:**
- `view.zod.ts` uses `z.unknown()` in 3 places (params, body, items) — **correct and exemplary**
- 347 `.describe()` annotations
- 18 `z.any()` usages — moderate

---

### 1.13 `qa/` — QA Protocol (1 file, 84 LOC)

**File:** `testing.zod.ts`

**Strengths:**
- Uses `z.unknown()` consistently instead of `z.any()` — **best practice exemplar**
- Zero `z.any()` — the only directory with this distinction
- Clean test structure: Suite → Scenario → Step → Action → Assertion

**Issues:**
- Very small — minimal `.describe()` coverage (9 annotations for 6 schemas)
- Could benefit from more examples in JSDoc

---

### 1.14 Root Files

**`stack.zod.ts`** (340 lines):
- Central aggregator — `ObjectStackDefinitionSchema` and `ObjectStackCapabilitiesSchema`
- 1 `z.any()` usage: `plugins: z.array(z.any())` — runtime plugin instances can't be statically typed
- Well-structured 3-layer capabilities (ObjectQL, ObjectUI, ObjectOS)
- All type exports present

**`index.ts`** (77 lines):
- Clean namespace exports (`Data`, `UI`, `System`, `AI`, `API`, etc.)
- Prevents naming conflicts via namespace pattern
- Re-exports `defineStack`, `definePlugin` from kernel

---

## 2. Cross-Cutting Issues

### 2.1 `z.any()` — Pervasive Loose Typing (397 instances, 88 files)

**Categories of `z.any()` usage:**

| Pattern | Count (est.) | Justified? |
|---|---|---|
| `metadata: z.record(z.string(), z.any())` | ~80 | Partially — could use `z.unknown()` |
| `config/options: z.record(z.string(), z.any())` | ~60 | Partially |
| `z.function().args(z.any())` / `.returns(z.any())` | ~50 | Yes — Zod limitation |
| `defaultValue: z.any()` | ~30 | Mostly — values are polymorphic |
| `value: z.any()` in filter/comparison operators | ~20 | Yes — runtime comparison |
| `payload/data: z.any()` | ~30 | Partially |
| `schema: z.any()` (JSON Schema interop) | ~15 | Yes — JSON Schema is dynamic |
| Service method stubs (`z.any()`) | ~20 | Yes — Zod limitation |
| Other | ~92 | Mixed |

**Recommendation:** Replace `z.any()` with `z.unknown()` wherever the value is not immediately destructured. `z.unknown()` forces runtime narrowing, which is safer. Priority targets:
- All `metadata: z.record(z.string(), z.any())` → `z.record(z.string(), z.unknown())`
- All `config: z.record(z.string(), z.any())` → `z.record(z.string(), z.unknown())`
- `qa/testing.zod.ts` and `ai/feedback-loop.zod.ts` already demonstrate the correct pattern

### 2.2 `z.unknown()` — Severely Underused (8 instances, 3 files)

Only **3 files** use `z.unknown()`:
- `qa/testing.zod.ts` (3 usages) — consistent throughout
- `ai/feedback-loop.zod.ts` (1 usage) — `context: z.record(z.string(), z.unknown())`
- `ui/view.zod.ts` (3 usages) — params, body, items
- `system/migration.zod.ts` (1 usage) — `changes: z.record(z.string(), z.unknown())`

**Gap:** 88 files use `z.any()` while only 3 use `z.unknown()`. This is a 29:1 ratio that should be inverted for most cases.

### 2.3 `z.date()` vs `z.string().datetime()` Inconsistency

**Files using `z.date()`:**

| File | Fields | Problem |
|---|---|---|
| `identity/identity.zod.ts` | createdAt, updatedAt, emailVerified | Date objects don't survive JSON serialization |
| `identity/organization.zod.ts` | createdAt, updatedAt | Same issue |
| `api/auth.zod.ts` | createdAt, updatedAt, expiresAt | Same issue |
| `kernel/metadata-loader.zod.ts` | modifiedAt, timestamp, lastModified | Same issue |
| `data/filter.zod.ts` | $gt/$gte/$lt/$lte comparisons | ✅ Appropriate for runtime comparison |
| `system/object-storage.zod.ts` | lastModified | Same issue |
| `system/metadata-persistence.zod.ts` | created_at | Same issue + uses snake_case for property key |

**Files correctly using `z.string().datetime()`:**
- `identity/scim.zod.ts` — uses `z.string().datetime()` for all SCIM timestamps

**Recommendation:** Standardize on `z.string().datetime()` for all serializable schemas. `z.date()` is only appropriate for in-memory runtime objects (like filter comparisons).

### 2.4 Naming Convention Violations

The codebase is **generally consistent**, with only minor violations:

| Location | Issue |
|---|---|
| `system/metadata-persistence.zod.ts` | Property `created_at` uses snake_case — should be `createdAt` per spec rules |
| `api/auth.zod.ts:35-36` | Some properties missing `.describe()` but keys are correct camelCase |

All machine identifiers (object names, field names, role names) consistently use snake_case regex validation via `SnakeCaseIdentifierSchema`. Configuration keys consistently use camelCase. **Well-enforced.**

### 2.5 Cross-Module Duplication

| Duplication | Files | Severity |
|---|---|---|
| Presence schemas | `api/realtime.zod.ts` PresenceStatus/PresenceSchema vs `api/websocket.zod.ts` WebSocketPresenceStatus/PresenceStateSchema | **Medium** — should share a base |
| ConnectorSchema | `automation/trigger-registry.zod.ts` vs `integration/connector.zod.ts` | **Low** — intentionally differentiated (L1 vs L3), well-documented |
| DependencyConflict | `hub/plugin-security.zod.ts` vs `kernel/plugin-versioning.zod.ts` | **Medium** — identical concept in different domains |
| SecurityVulnerability | `hub/plugin-security.zod.ts` vs `kernel/plugin-security-advanced.zod.ts` | **Medium** — similar schemas with slight structural differences |
| PermissionSetSchema | `security/permission.zod.ts` vs `kernel/plugin-security-advanced.zod.ts` | **Low** — different contexts (data permissions vs plugin sandbox permissions) |

### 2.6 Files Missing `z.infer` Type Exports

| File | Schemas Exported | Impact |
|---|---|---|
| `system/auth-config.zod.ts` | auth configuration | Consumers must manually derive types |
| `api/contract.zod.ts` | RecordDataSchema, BaseResponseSchema, etc. | Core foundational schemas without types |
| `api/analytics.zod.ts` | AnalyticsQueryRequest, etc. | Minor impact |
| `api/metadata.zod.ts` | ObjectDefinitionResponse, etc. | Minor impact |
| `kernel/plugin-structure.zod.ts` | OpsPluginStructureSchema, etc. | Consumers must extract types manually |

### 2.7 Runtime Logic in Schema-Only Repository

Per the prime directive "No Business Logic — this repository contains ONLY definitions", these violations were found:

| File | Function/Logic |
|---|---|
| `api/errors.zod.ts` | `createErrorResponse()`, `getHttpStatusForCategory()` — runtime helper functions |
| `automation/approval.zod.ts` | `ApprovalProcess.create()` — factory method |

---

## 3. `.describe()` Annotation Coverage Assessment

With **5,026 `.describe()` calls across 1,089 exported schemas**, the average is ~4.6 descriptions per schema — **excellent coverage**.

**Best coverage:**
- `api/` (906 describes for ~120 schemas)
- `system/` (810 describes for ~100 schemas)
- `ai/` (630 describes for ~85 schemas)
- `integration/` (365 describes for ~40 schemas — highest ratio)

**Weakest coverage:**
- `qa/testing.zod.ts` (9 describes for 6 schemas — functional but minimal)
- `security/` (76 describes for ~15 schemas — some inline fields undescribed)

---

## 4. Recommendations

### P0 — Critical (Type Safety)
1. **Replace `z.any()` with `z.unknown()` for metadata/config records** — ~140 occurrences across `metadata:`, `config:`, `options:` fields. Pattern: `z.record(z.string(), z.any())` → `z.record(z.string(), z.unknown())`
2. **Fix `z.date()` inconsistency** — Standardize on `z.string().datetime()` for all serializable schemas; keep `z.date()` only for in-memory filter comparisons
3. **Add missing `z.infer` exports** — 5 files have zero type exports

### P1 — Important (Consistency)
4. **Extract shared Presence schemas** — Create `shared/presence.zod.ts` and import from both `api/realtime.zod.ts` and `api/websocket.zod.ts`
5. **Fix `SharingRuleSchema` typing** — Currently `z.ZodType<any>`, losing all type safety
6. **Add `z.infer` exports to `rag-pipeline.zod.ts`** — 16 schemas with 0 type exports
7. **Fix `created_at` property key** in `system/metadata-persistence.zod.ts` → `createdAt`

### P2 — Quality (Architecture)
8. **Move runtime functions out of spec** — `api/errors.zod.ts` helpers and `approval.zod.ts` factory belong in `@objectstack/core`
9. **Remove deprecated re-exports** in `integration/connector.zod.ts` (`AuthenticationSchema`, `FieldTransformSchema`)
10. **Consolidate DependencyConflict schemas** — Choose canonical location between `hub/` and `kernel/`
11. **Add more `.describe()` to `qa/testing.zod.ts`** — Currently the weakest annotated file

---

## 5. Quality Scorecard by Category

| Category | Score | Notes |
|---|---|---|
| **Architecture** | A | Clean domain separation, thoughtful layering (L1/L2/L3) |
| **Documentation** | A | 5,026 `.describe()` calls, extensive JSDoc, example objects |
| **Naming Convention** | A- | Consistent snake_case/camelCase split, 1 violation (`created_at`) |
| **Type Safety** | C+ | 397 `z.any()` usages overwhelm the otherwise clean typing |
| **Type Exports** | B+ | 1,011 `z.infer` vs 1,089 schemas (93% coverage), 5 files missing |
| **DRY Principle** | B | 3-4 duplication clusters identified, most documented as intentional |
| **Compliance** | B | 2 runtime logic violations in schema-only repo |
| **Overall** | **B+** | Professional, production-quality spec with fixable type-safety gaps |
