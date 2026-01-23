# ObjectStack 下一步行动计划

> **制定日期**: 2026-01-22  
> **更新日期**: 2026-01-23  
> **规划周期**: Q1-Q4 2026  
> **执行负责**: ObjectStack 核心团队  
> **状态**: ✅ 计划有效 - 准备开始执行

---

## 🔍 2026-01-23 更新说明

**验证状态**: ✅ 计划已重新验证

基于最新代码库审查，确认:
- ✅ 所有统计数据准确无误 (40 协议文件, 6,796 行代码, 1,203 测试)
- ✅ 所有优先级排序仍然有效
- ✅ 执行计划可立即开始
- ✅ 资源估算和时间线合理

**行动建议**: 
1. 立即组建团队，启动 Sprint 1-2
2. 重点关注多租户和实时同步协议
3. 保持每周进度跟踪和文档更新

---

## 🎯 总体目标

将 ObjectStack 协议从当前的 **85% 完成度**提升到 **100% 生产就绪**，重点补齐企业级 SaaS 部署的关键能力。

### 关键里程碑
- **Q1 2026**: 达到 90% 完成度，补齐多租户、实时同步等关键协议
- **Q2 2026**: 达到 95% 完成度，完善生态系统和 AI 能力
- **Q3 2026**: 达到 98% 完成度，企业治理和性能优化
- **Q4 2026**: 达到 100% 完成度，全功能就绪

---

## 📅 详细执行计划

### 🔴 第一阶段: 关键能力补齐 (Q1 2026 | Week 1-8)

#### Sprint 1 (Week 1-2) - 多租户和实时同步

##### 任务 1.1: 多租户协议 ⚠️ 最高优先级
**文件**: `packages/spec/src/system/tenant.zod.ts`  
**负责人**: 系统架构师  
**工作量**: 3 天  
**依赖**: 无

**实现要点**:
```typescript
// 1. 租户隔离级别
export const TenantIsolationLevel = z.enum([
  'shared_schema',    // 共享数据库和表，通过 tenant_id 隔离
  'isolated_schema',  // 独立 Schema，共享数据库
  'isolated_db',      // 完全独立的数据库
]);

// 2. 租户配额管理
export const TenantQuotaSchema = z.object({
  maxUsers: z.number().int().positive().optional(),
  maxStorage: z.number().int().positive().optional().describe('Storage in MB'),
  maxApiCalls: z.number().int().positive().optional().describe('API calls per day'),
  maxObjects: z.number().int().positive().optional(),
  maxRecordsPerObject: z.number().int().positive().optional(),
});

// 3. 租户定制化
export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  isolationLevel: TenantIsolationLevel,
  quotas: TenantQuotaSchema.optional(),
  customizations: z.object({
    theme: z.string().optional(),
    logo: z.string().url().optional(),
    domain: z.string().optional(),
  }).optional(),
  status: z.enum(['active', 'suspended', 'trial']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

**验收标准**:
- [ ] Zod Schema 定义完成
- [ ] TypeScript 类型推导正确
- [ ] 测试覆盖率 ≥ 80% (至少 20 个测试用例)
- [ ] JSON Schema 生成成功
- [ ] 文档示例完整 (MDX)

**测试重点**:
- 租户 ID 唯一性验证
- 配额限制验证
- 隔离级别枚举验证
- Schema 序列化/反序列化

---

##### 任务 1.2: 实时同步协议
**文件**: `packages/spec/src/system/realtime.zod.ts`  
**负责人**: 系统架构师  
**工作量**: 4 天  
**依赖**: 无

**实现要点**:
```typescript
// 1. 传输层选择
export const TransportProtocol = z.enum([
  'websocket',  // 全双工，低延迟
  'sse',        // Server-Sent Events，单向推送
  'polling',    // 短轮询，兼容性最好
]);

// 2. 事件订阅
export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  events: z.array(z.object({
    type: z.enum(['record.created', 'record.updated', 'record.deleted', 'field.changed']),
    object: z.string().optional().describe('Object name to subscribe to'),
    filters: z.any().optional().describe('Filter conditions'),
  })),
  transport: TransportProtocol,
  channel: z.string().optional(),
});

// 3. 在线状态
export const PresenceSchema = z.object({
  userId: z.string(),
  status: z.enum(['online', 'away', 'offline']),
  lastSeen: z.string().datetime(),
  metadata: z.record(z.any()).optional().describe('Custom presence data'),
});

// 4. 同步事件
export const RealtimeEventSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  object: z.string().optional(),
  action: z.enum(['created', 'updated', 'deleted']).optional(),
  payload: z.any(),
  timestamp: z.string().datetime(),
  userId: z.string().optional(),
});
```

**验收标准**:
- [ ] Schema 定义完成
- [ ] 测试覆盖率 ≥ 80% (至少 25 个测试用例)
- [ ] 支持 WebSocket、SSE、Polling 三种传输层
- [ ] 事件过滤和路由逻辑清晰
- [ ] 文档包含实际使用示例

**测试重点**:
- 事件类型枚举完整性
- 订阅过滤器验证
- 传输层配置验证
- 在线状态转换逻辑

---

#### Sprint 2 (Week 3-4) - 事件总线和任务调度

##### 任务 2.1: 事件总线协议
**文件**: `packages/spec/src/system/events.zod.ts`  
**负责人**: 系统架构师  
**工作量**: 3 天  
**依赖**: 无

**实现要点**:
```typescript
// 1. 事件定义
export const EventSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_.]*$/),
  payload: z.any().describe('Event payload schema'),
  metadata: z.object({
    source: z.string().describe('Event source (e.g., plugin name)'),
    timestamp: z.string().datetime(),
    userId: z.string().optional(),
    tenantId: z.string().optional(),
  }),
});

// 2. 事件处理器
export const EventHandlerSchema = z.object({
  eventName: z.string(),
  handler: z.function().args(EventSchema).returns(z.promise(z.void())),
  priority: z.number().int().default(0).describe('Lower numbers execute first'),
  async: z.boolean().default(true).describe('Execute in background'),
});

// 3. 事件路由
export const EventRouteSchema = z.object({
  from: z.string().describe('Source event pattern (supports wildcards)'),
  to: z.array(z.string()).describe('Target event names'),
  transform: z.function().optional().describe('Transform payload'),
});

// 4. 持久化配置
export const EventPersistenceSchema = z.object({
  enabled: z.boolean().default(false),
  retention: z.number().int().positive().describe('Days to retain events'),
  filter: z.function().optional().describe('Filter which events to persist'),
});
```

**验收标准**:
- [ ] Schema 定义完成
- [ ] 测试覆盖率 ≥ 80%
- [ ] 支持事件路由和转换
- [ ] 支持优先级和异步执行
- [ ] 文档清晰

---

##### 任务 2.2: 任务调度协议
**文件**: `packages/spec/src/system/job.zod.ts`  
**负责人**: 系统架构师  
**工作量**: 3 天  
**依赖**: 事件总线协议 (可选)

**实现要点**:
```typescript
// 1. 调度策略
export const ScheduleSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('cron'),
    expression: z.string().describe('Cron expression (e.g., "0 0 * * *")'),
    timezone: z.string().optional().default('UTC'),
  }),
  z.object({
    type: z.literal('interval'),
    intervalMs: z.number().int().positive(),
  }),
  z.object({
    type: z.literal('once'),
    at: z.string().datetime(),
  }),
]);

// 2. 任务定义
export const JobSchema = z.object({
  id: z.string(),
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/),
  schedule: ScheduleSchema,
  handler: z.function().returns(z.promise(z.void())),
  retryPolicy: z.object({
    maxRetries: z.number().int().min(0).default(3),
    backoffMs: z.number().int().positive().default(1000),
    backoffMultiplier: z.number().positive().default(2),
  }).optional(),
  timeout: z.number().int().positive().optional().describe('Timeout in ms'),
  enabled: z.boolean().default(true),
});

// 3. 任务执行日志
export const JobExecutionSchema = z.object({
  jobId: z.string(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  status: z.enum(['running', 'success', 'failed', 'timeout']),
  error: z.string().optional(),
  duration: z.number().int().optional().describe('Duration in ms'),
});
```

**验收标准**:
- [ ] 支持 Cron、Interval、Once 三种调度策略
- [ ] 重试策略完整 (指数退避)
- [ ] 测试覆盖率 ≥ 80%
- [ ] 文档包含实际 Cron 表达式示例

---

#### Sprint 3 (Week 5-6) - 字段类型和验证增强

##### 任务 3.1: 增强字段类型
**文件**: 扩展 `packages/spec/src/data/field.zod.ts`  
**负责人**: 数据协议负责人  
**工作量**: 2 天  
**依赖**: 无

**新增字段类型**:
```typescript
export const FieldType = z.enum([
  // ... 现有 25+ 类型
  
  // 新增类型
  'geolocation',    // GPS 坐标
  'address',        // 结构化地址
  'richtext',       // 富文本
  'code',           // 代码编辑器
  'color',          // 颜色选择器
  'rating',         // 星级评分
  'slider',         // 数值滑块
  'signature',      // 数字签名
  'qrcode',         // 二维码/条形码
  'duration',       // 时长 (hours:minutes)
]);

// 地理位置字段配置
export const GeolocationFieldConfigSchema = z.object({
  defaultLatitude: z.number().optional(),
  defaultLongitude: z.number().optional(),
  displayFormat: z.enum(['dms', 'decimal']).default('decimal'),
  required: z.boolean().default(false),
});

// 地址字段配置
export const AddressFieldConfigSchema = z.object({
  requireStreet: z.boolean().default(true),
  requireCity: z.boolean().default(true),
  requireState: z.boolean().default(false),
  requireCountry: z.boolean().default(false),
  requireZip: z.boolean().default(false),
});

// 富文本配置
export const RichTextFieldConfigSchema = z.object({
  toolbar: z.array(z.string()).optional(),
  allowImages: z.boolean().default(true),
  allowLinks: z.boolean().default(true),
  maxLength: z.number().int().positive().optional(),
});
```

**验收标准**:
- [ ] 至少新增 9 种字段类型
- [ ] 每种类型都有对应的配置 Schema
- [ ] 测试用例覆盖所有新类型
- [ ] 文档包含 UI 组件示例

---

##### 任务 3.2: 跨字段验证
**文件**: 扩展 `packages/spec/src/data/validation.zod.ts`  
**负责人**: 数据协议负责人  
**工作量**: 2 天  
**依赖**: 无

**实现要点**:
```typescript
// 跨字段验证规则
export const CrossFieldValidationSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/),
  description: z.string().optional(),
  
  // 规则类型
  type: z.enum([
    'field_comparison',   // 字段比较 (e.g., end_date > start_date)
    'field_dependency',   // 字段依赖 (e.g., if country='USA', state is required)
    'sum_constraint',     // 总和约束 (e.g., sum(line_items.amount) = total)
    'custom_formula',     // 自定义公式
  ]),
  
  // 比较条件
  condition: z.string().describe('Expression like "end_date > start_date"'),
  
  // 涉及的字段
  fields: z.array(z.string()).min(2),
  
  // 错误消息
  errorMessage: z.string(),
  
  // 活动状态
  active: z.boolean().default(true),
});

// 条件验证
export const ConditionalValidationSchema = z.object({
  field: z.string(),
  
  // 条件
  when: z.object({
    field: z.string(),
    operator: z.enum(['=', '!=', '>', '<', '>=', '<=', 'contains', 'not_contains']),
    value: z.any(),
  }),
  
  // 满足条件时的验证规则
  then: z.object({
    required: z.boolean().optional(),
    minValue: z.number().optional(),
    maxValue: z.number().optional(),
    pattern: z.string().optional(),
  }),
  
  errorMessage: z.string(),
});
```

**验收标准**:
- [ ] 支持字段比较、依赖、总和约束
- [ ] 支持条件验证 (if-then 逻辑)
- [ ] 测试覆盖所有验证类型
- [ ] 性能测试 (复杂验证 < 10ms)

---

#### Sprint 4 (Week 7-8) - API 网关和组件库

##### 任务 4.1: API 网关配置
**文件**: `packages/spec/src/api/gateway.zod.ts`  
**负责人**: API 协议负责人  
**工作量**: 3 天  
**依赖**: 无

**实现要点**:
```typescript
// 1. 速率限制
export const RateLimitSchema = z.object({
  requestsPerMinute: z.number().int().positive(),
  requestsPerHour: z.number().int().positive().optional(),
  requestsPerDay: z.number().int().positive().optional(),
  burst: z.number().int().positive().optional().describe('Burst allowance'),
  key: z.enum(['ip', 'user', 'api_key', 'tenant']).default('ip'),
});

// 2. CORS 配置
export const CorsConfigSchema = z.object({
  allowedOrigins: z.array(z.string()).default(['*']),
  allowedMethods: z.array(z.string()).default(['GET', 'POST', 'PUT', 'DELETE']),
  allowedHeaders: z.array(z.string()).optional(),
  exposedHeaders: z.array(z.string()).optional(),
  allowCredentials: z.boolean().default(false),
  maxAge: z.number().int().positive().optional(),
});

// 3. 缓存策略
export const CacheStrategySchema = z.object({
  enabled: z.boolean().default(false),
  ttl: z.number().int().positive().describe('TTL in seconds'),
  varyBy: z.array(z.enum(['query', 'header', 'user', 'tenant'])).optional(),
  invalidateOn: z.array(z.object({
    event: z.string(),
    pattern: z.string().optional(),
  })).optional(),
});

// 4. 网关配置
export const GatewayConfigSchema = z.object({
  baseUrl: z.string().url(),
  rateLimit: RateLimitSchema.optional(),
  cors: CorsConfigSchema.optional(),
  cache: CacheStrategySchema.optional(),
  compression: z.boolean().default(true),
  requestTimeout: z.number().int().positive().default(30000),
});
```

**验收标准**:
- [ ] 速率限制支持多维度 (IP/User/API Key/Tenant)
- [ ] CORS 配置完整
- [ ] 缓存失效策略灵活
- [ ] 测试覆盖率 ≥ 80%

---

##### 任务 4.2: 组件库协议
**文件**: `packages/spec/src/ui/component.zod.ts`  
**负责人**: UI 协议负责人  
**工作量**: 3 天  
**依赖**: 无

**实现要点**:
```typescript
// 可复用 UI 组件定义
export const ComponentType = z.enum([
  'card',
  'tabs',
  'accordion',
  'modal',
  'drawer',
  'timeline',
  'stepper',
  'breadcrumb',
  'alert',
  'badge',
  'tooltip',
  'popover',
]);

export const ComponentSchema = z.object({
  type: ComponentType,
  props: z.record(z.any()).optional(),
  children: z.lazy(() => z.array(ComponentSchema)).optional(),
  events: z.record(z.function()).optional(),
  style: z.record(z.string()).optional(),
});

// 卡片组件
export const CardComponentSchema = ComponentSchema.extend({
  type: z.literal('card'),
  props: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    image: z.string().url().optional(),
    actions: z.array(z.any()).optional(),
  }).optional(),
});

// 标签页组件
export const TabsComponentSchema = ComponentSchema.extend({
  type: z.literal('tabs'),
  props: z.object({
    tabs: z.array(z.object({
      label: z.string(),
      icon: z.string().optional(),
      content: ComponentSchema.optional(),
    })),
    defaultTab: z.number().int().min(0).optional(),
  }),
});
```

**验收标准**:
- [ ] 至少定义 12 种常用组件
- [ ] 支持组件嵌套 (children)
- [ ] 支持事件绑定
- [ ] 文档包含渲染示例

---

### 🟠 第二阶段: 生态系统完善 (Q2 2026 | Week 9-16)

#### Sprint 5-6 (Week 9-12) - AI 和通知

##### 任务 5.1: AI 工作流自动化
**文件**: `packages/spec/src/ai/workflow-automation.zod.ts`  
**工作量**: 4 天

**核心功能**:
- 触发器: 记录创建/更新、字段变更、定时任务
- AI 任务: 分类、提取、摘要、生成、预测
- 模型选择: GPT-4、Claude、本地模型
- 输出映射: 自动填充字段

**验收标准**:
- [ ] 支持多种触发器和 AI 任务
- [ ] 测试包含端到端工作流示例

---

##### 任务 5.2: 通知协议
**文件**: `packages/spec/src/system/notification.zod.ts`  
**工作量**: 3 天

**核心功能**:
- 通知类型: 应用内、邮件、短信、推送
- 模板管理: 支持变量替换
- 发送策略: 立即、批量、定时
- 用户偏好: 订阅/退订管理

---

#### Sprint 7-8 (Week 13-16) - 附件和评论

##### 任务 7.1: 附件管理协议
**文件**: `packages/spec/src/data/attachment.zod.ts`  
**工作量**: 3 天

**核心功能**:
- 文件上传: 支持多种存储 (S3, Azure Blob, 本地)
- 版本控制: 文件版本历史
- 权限控制: 继承记录权限
- 预览生成: 缩略图、预览图

---

##### 任务 7.2: 评论/动态协议
**文件**: `packages/spec/src/data/feed.zod.ts`  
**工作量**: 3 天

**核心功能**:
- 帖子类型: 文本、图片、文件、链接
- @提及: 用户提及通知
- 点赞/评论: 互动功能
- 隐私控制: 公开、团队、私密

---

### 🟡 第三阶段: 企业治理 (Q3 2026 | Week 17-24)

#### Sprint 9-10 (Week 17-20) - 审计和迁移

##### 任务 9.1: 审计日志增强
**文件**: 扩展 `packages/spec/src/data/audit.zod.ts` (新建)  
**工作量**: 3 天

**核心功能**:
- 字段级跟踪: 记录每个字段的变更历史
- 保留策略: 归档规则、清理策略
- 导出格式: CSV、JSON、PDF
- 合规报告: GDPR、HIPAA 审计报告

---

##### 任务 9.2: 数据迁移协议
**文件**: `packages/spec/src/system/migration.zod.ts`  
**工作量**: 4 天

**核心功能**:
- ETL 映射: 源字段到目标字段映射
- 转换规则: 数据清洗、格式转换
- 错误处理: 失败记录跟踪、重试机制
- 进度监控: 实时进度、日志

---

#### Sprint 11-12 (Week 21-24) - 性能和合规

##### 任务 11.1: 缓存策略协议
**文件**: `packages/spec/src/system/cache.zod.ts`  
**工作量**: 3 天

**核心功能**:
- 缓存提供商: Redis、Memcached、内存
- 失效策略: TTL、LRU、事件驱动失效
- 预热策略: 启动时预加载热数据

---

##### 任务 11.2: 合规框架
**文件**: `packages/spec/src/system/compliance.zod.ts`  
**工作量**: 5 天

**核心功能**:
- GDPR: 同意管理、数据可携带、删除权
- HIPAA: PHI 字段标记、审计日志
- SOC2: 访问控制、加密、监控
- 数据驻留: 地理限制规则

---

### 🟢 第四阶段: 收尾和优化 (Q4 2026 | Week 25-52)

#### 剩余任务列表

1. **邮件模板协议** (`src/ui/email-template.zod.ts`) - 2 天
2. **打印模板协议** (`src/ui/print-template.zod.ts`) - 2 天
3. **插件市场协议** (`src/system/marketplace.zod.ts`) - 3 天
4. **预测分析协议** (`src/ai/predictive.zod.ts`) - 4 天
5. **性能监控协议** (`src/system/monitoring.zod.ts`) - 3 天
6. **备份恢复协议** (`src/system/backup.zod.ts`) - 3 天

---

## 📊 资源分配建议

### 团队配置

| 角色 | 人数 | 主要职责 |
|------|------|---------|
| **系统架构师** | 1 | 多租户、实时同步、事件总线、任务调度 |
| **数据协议负责人** | 1 | 字段类型、验证、审计、迁移 |
| **UI 协议负责人** | 1 | 组件库、模板、主题 |
| **API 协议负责人** | 1 | 网关、合规、性能 |
| **AI 协议负责人** | 1 | 工作流自动化、预测分析 |
| **QA 工程师** | 1 | 测试用例编写、覆盖率监控 |
| **技术文档工程师** | 1 | 文档、示例、教程 |

**总计**: 7 人

### 工作量估算

| 阶段 | 周数 | 新协议数 | 扩展协议数 | 测试用例数 | 文档页数 |
|------|------|---------|-----------|-----------|---------|
| Q1 | 8 周 | 5 | 3 | 150+ | 30+ |
| Q2 | 8 周 | 4 | 2 | 120+ | 25+ |
| Q3 | 8 周 | 4 | 1 | 100+ | 20+ |
| Q4 | 28 周 | 6 | 2 | 130+ | 25+ |
| **总计** | **52 周** | **19** | **8** | **500+** | **100+** |

---

## 🎯 成功标准

### 技术指标

| 指标 | 当前 | Q1 | Q2 | Q3 | Q4 |
|------|------|----|----|----|----|
| **协议数量** | 40 | 45 | 49 | 53 | 59 |
| **总代码行数** | 6,796 | 9,000 | 11,000 | 13,000 | 15,000 |
| **测试用例数** | 1,203 | 1,350 | 1,470 | 1,570 | 1,700 |
| **测试通过率** | 100% | 100% | 100% | 100% | 100% |
| **代码覆盖率** | - | 80% | 85% | 90% | 95% |
| **文档页数** | 50+ | 80+ | 105+ | 125+ | 150+ |

### 业务指标

| 指标 | Q1 | Q2 | Q3 | Q4 |
|------|----|----|----|----|
| **社区插件** | 3+ | 10+ | 25+ | 50+ |
| **示例应用** | 8+ | 12+ | 16+ | 20+ |
| **GitHub Stars** | 100+ | 500+ | 1,000+ | 2,500+ |
| **每月 NPM 下载** | 100+ | 500+ | 2,000+ | 5,000+ |
| **社区贡献者** | 5+ | 15+ | 30+ | 50+ |

---

## 🚨 风险管理

### 识别的风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|---------|
| **资源不足** | 高 | 中 | 优先级排序，聚焦 P1 任务 |
| **技术依赖** | 中 | 低 | 最小化外部依赖，文档清晰 |
| **范围蔓延** | 高 | 中 | 严格遵循 MVP 原则，分阶段交付 |
| **性能问题** | 中 | 低 | 早期性能测试，基准测试 |
| **社区采用慢** | 中 | 中 | 加强文档、示例、教程 |

---

## 📞 沟通机制

### 例会安排

- **每日站会** (15 分钟): 进度同步、问题识别
- **每周评审** (1 小时): Sprint 进展、代码审查
- **每月回顾** (2 小时): 里程碑检查、计划调整
- **季度规划** (半天): 下季度计划、优先级调整

### 文档更新

- **协议变更**: 立即更新 PROTOCOL_REVIEW.md
- **进度更新**: 每周五更新 NEXT_STEPS.md
- **里程碑达成**: 更新 DEVELOPMENT_ROADMAP.md

---

## 🎓 最佳实践

### 开发原则

1. **Zod-First**: 先定义 Schema，后推导类型
2. **测试驱动**: 先写测试，后写实现
3. **文档同步**: 代码和文档同步提交
4. **向后兼容**: 新版本兼容旧版本
5. **性能优先**: 每个协议都要有性能基准

### 质量检查

每个协议提交前必须通过:
- [ ] Zod Schema 验证
- [ ] TypeScript 类型检查
- [ ] 单元测试 (覆盖率 ≥ 80%)
- [ ] JSON Schema 生成
- [ ] 文档完整性检查
- [ ] 代码审查 (至少 2 人)

---

## 📅 关键日期

| 里程碑 | 日期 | 交付物 |
|--------|------|--------|
| **Q1 结束** | 2026-03-31 | 多租户、实时同步、事件总线、任务调度、字段增强 |
| **Q2 结束** | 2026-06-30 | AI 工作流、通知、附件、评论、组件库 |
| **Q3 结束** | 2026-09-30 | 审计增强、数据迁移、缓存、合规框架 |
| **Q4 结束** | 2026-12-31 | 所有剩余协议、性能优化、生产就绪 |

---

## 📧 联系方式

**项目负责人**: ObjectStack 核心团队  
**进度跟踪**: [GitHub Project](https://github.com/objectstack-ai/spec/projects)  
**问题反馈**: [GitHub Issues](https://github.com/objectstack-ai/spec/issues)  
**讨论区**: [GitHub Discussions](https://github.com/objectstack-ai/spec/discussions)

---

**制定人**: ObjectStack 协议架构师  
**最后更新**: 2026-01-22  
**下次更新**: 每周五
