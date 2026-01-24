# Hook vs Trigger Clarification

## 问题 (Question)
审核所有的zod，我们之前有定义一个类似现在trigger的hook规范，现在还需要保留吗？

## 分析结果 (Analysis Results)

### 现有的 "Hook-like" 规范 (Current "Hook-like" Specifications)

经过全面审查，发现以下几个与"hook"或"trigger"相关的规范：

1. **Trigger** (`src/data/trigger.zod.ts`) - 数据库级别的业务逻辑钩子
   - 目的：在数据库操作前后执行业务逻辑
   - 时机：before/after insert/update/delete
   - 功能：数据验证、设置默认值、更新关联记录、阻止操作

2. **Plugin Lifecycle** (`src/system/plugin.zod.ts`) - 插件生命周期回调
   - 目的：插件安装和生命周期管理
   - 回调：onInstall, onEnable, onDisable, onUninstall, onUpgrade
   - 功能：插件初始化、服务启停、数据迁移、资源清理

3. **Webhook** (`src/system/webhook.zod.ts`) - 外部HTTP集成
   - 目的：与外部系统的HTTP回调集成
   - 类型：create, update, delete, undelete, api
   - 方向：出站(push)和入站(receive)

4. **Workflow** (`src/data/workflow.zod.ts`) - 业务流程自动化
   - 目的：业务流程自动化规则
   - 触发器：on_create, on_update, on_create_or_update, on_delete, schedule
   - 动作：field_update, email_alert, sms_notification等

### 发现的问题 (Issues Found)

1. **术语混淆**：Plugin Lifecycle 在描述中使用了 "Hook" 术语，但其实是生命周期回调，与 Trigger 的语义不同
2. **未实现的计划**：开发路线图中提到的 `hooks.zod.ts`（包含 beforeObjectCreate, afterRecordSave 等）实际上与现有的 Trigger 重复

### 建议 (Recommendations)

**✅ 推荐方案：保留现有结构，澄清术语**

1. **Trigger** - 保留，作为数据库级别的业务逻辑钩子（这是正确的设计）
2. **Plugin Lifecycle** - 保留，但将术语从 "Hook" 改为 "Lifecycle callback"，避免混淆
3. **不需要新的 hooks.zod.ts** - Trigger 已经覆盖了计划中的扩展点

### 已实施的更改 (Changes Made)

1. 更新了 `src/system/plugin.zod.ts` 中的描述，将 "Hook called on..." 改为 "Lifecycle callback on..."
2. 将类型名称从 `PluginLifecycleHooks` 改为 `PluginLifecycleCallbacks`，更准确地反映其用途
3. 更新了相关测试文件

### 语义区别 (Semantic Differences)

| 方面 | Trigger | Plugin Lifecycle | Webhook | Workflow |
|------|---------|------------------|---------|----------|
| **层级** | 数据/记录 | 系统/插件 | 集成 | 流程 |
| **同步** | 是 | 是 | 可异步 | 可异步 |
| **可修改数据** | 是(before) | 通过QL API | 否 | 是 |
| **可阻止操作** | 是(before) | 否 | 否 | 通过条件 |
| **执行上下文** | 每条记录 | 每个插件 | 每个事件 | 每条规则 |

## 结论 (Conclusion)

**不需要保留旧的 hook 规范，因为：**
1. 代码库中不存在单独的旧 `hook.zod.ts` 文件
2. 当前的 Trigger 规范已经非常完善，涵盖了数据库级别的钩子需求
3. Plugin Lifecycle 服务于不同的目的（插件生命周期管理），已通过术语澄清与 Trigger 区分开来
4. 计划中的 Hook Registry Protocol 会与 Trigger 重复，不需要实现

**Trigger 规范应该作为 ObjectStack 的主要 "hook" 机制保留和使用。**
