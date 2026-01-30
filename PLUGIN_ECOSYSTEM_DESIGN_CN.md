# ObjectStack 插件生态系统设计方案

## 项目背景

作为 ObjectStack 微内核系统架构师，我们需要建立一个完整的插件生态系统，确保：
1. 不同厂商的插件能够互相发现和调用
2. 插件能够声明实现的协议和提供的能力
3. 有明确的命名规范保证全局唯一性
4. 支持插件间的协作和扩展

## 设计原则

### 1. 协议优先（Protocol-First）

插件通过声明实现的**协议（Protocol）**来表达能力，而不是硬编码依赖。类似于：
- Kubernetes 的 CRD（自定义资源定义）
- OSGi 服务注册表
- Eclipse 扩展点机制

### 2. 反向域名命名（Reverse Domain Naming）

所有插件、协议、接口都使用反向域名表示法，确保全局唯一性：

```
格式：{域名}.{类别}.{名称}

示例：
- 插件：com.acme.crm.customer-management
- 协议：com.objectstack.protocol.storage.v1
- 接口：com.acme.crm.interface.contact_service
- 扩展点：com.acme.crm.extension.customer_validator
```

### 3. 语义化版本（Semantic Versioning）

所有协议和插件遵循 SemVer 规范：
- Major：破坏性变更
- Minor：向后兼容的功能添加
- Patch：向后兼容的错误修复

### 4. 松耦合通信

插件通过以下方式通信：
- **接口调用**：服务注册表模式
- **事件总线**：发布/订阅模式
- **扩展点**：插件可扩展的位置

## 核心组件

### 1. 能力声明系统（Capability Manifest）

每个插件通过 `capabilities` 字段声明：

```typescript
capabilities: {
  // 实现的协议
  implements: [
    {
      protocol: {
        id: 'com.objectstack.protocol.storage.v1',
        version: { major: 1, minor: 0, patch: 0 },
      },
      conformance: 'full',  // full | partial | experimental | deprecated
      certified: true,      // 是否通过官方认证
    }
  ],
  
  // 提供的接口
  provides: [
    {
      id: 'com.acme.crm.interface.customer_service',
      name: 'CustomerService',
      methods: [...],      // 方法列表
      events: [...],       // 事件列表
    }
  ],
  
  // 依赖的插件
  requires: [
    {
      pluginId: 'com.objectstack.driver.postgres',
      version: '^1.0.0',
      requiredCapabilities: ['com.objectstack.protocol.storage.v1'],
    }
  ],
  
  // 定义的扩展点
  extensionPoints: [
    {
      id: 'com.acme.crm.extension.customer_validator',
      type: 'validator',
      cardinality: 'multiple',
    }
  ],
  
  // 贡献的扩展
  extensions: [
    {
      targetPluginId: 'com.acme.crm',
      extensionPointId: 'com.acme.crm.extension.customer_validator',
      implementation: './validators/email-validator.ts',
    }
  ],
}
```

### 2. 插件注册表（Plugin Registry）

中心化的插件发现和管理系统，支持：

- **插件发布**：版本管理、依赖解析
- **能力搜索**：按协议、接口、标签搜索
- **质量评分**：测试覆盖率、文档完整性
- **安全扫描**：漏洞检测、认证状态
- **厂商验证**：官方/验证/社区/未验证

```typescript
{
  id: 'com.acme.crm.customer-management',
  version: '1.2.3',
  vendor: {
    id: 'com.acme',
    name: 'ACME Corporation',
    trustLevel: 'verified',  // official | verified | community | unverified
  },
  quality: {
    testCoverage: 85,
    securityScan: { passed: true },
  },
  statistics: {
    downloads: 15000,
    ratings: { average: 4.5 },
  },
}
```

### 3. 协议定义规范

协议是一组标准化的功能规范：

```typescript
protocol: {
  id: 'com.objectstack.protocol.storage.v1',
  label: 'Storage Protocol v1',
  version: { major: 1, minor: 0, patch: 0 },
  specification: 'https://docs.objectstack.ai/protocols/storage',
}
```

**符合性级别：**
- `full`：完整实现
- `partial`：部分实现（需列出已实现特性）
- `experimental`：实验性实现
- `deprecated`：已弃用但仍支持

### 4. 接口契约

接口定义插件对外提供的服务：

```typescript
interface: {
  id: 'com.acme.crm.interface.customer_service',
  name: 'CustomerService',
  version: { major: 2, minor: 1, patch: 0 },
  stability: 'stable',  // stable | beta | alpha | experimental
  
  methods: [
    {
      name: 'getCustomer',
      parameters: [{ name: 'id', type: 'string', required: true }],
      returnType: 'Customer',
      async: true,
    }
  ],
  
  events: [
    {
      name: 'customerCreated',
      payload: 'Customer',
    }
  ],
}
```

### 5. 扩展点机制

允许其他插件扩展功能的位置：

```typescript
extensionPoint: {
  id: 'com.acme.crm.extension.customer_validator',
  name: 'Customer Validator',
  type: 'validator',  // action | hook | widget | provider | transformer | validator | decorator
  cardinality: 'multiple',  // single | multiple
  contract: {
    input: 'Customer',
    output: 'ValidationResult',
  },
}
```

## 跨插件通信模式

### 模式 1：接口调用

```typescript
// 插件 B 提供服务
ctx.registerService('customer-service', {
  async getCustomer(id: string) { ... }
});

// 插件 A 使用服务
const service = ctx.getService('customer-service');
const customer = await service.getCustomer('123');
```

### 模式 2：事件总线

```typescript
// 插件 A 发布事件
ctx.trigger('crm:customer:created', { customerId: '123' });

// 插件 B 订阅事件
ctx.hook('crm:customer:created', async (event) => {
  console.log('新客户:', event.data);
});
```

### 模式 3：扩展贡献

```typescript
// 插件 B 定义扩展点
extensionPoints: [{
  id: 'com.acme.crm.extension.customer_validator',
  type: 'validator',
}]

// 插件 A 贡献扩展
extensions: [{
  targetPluginId: 'com.acme.crm',
  extensionPointId: 'com.acme.crm.extension.customer_validator',
  implementation: './validators/email-validator.ts',
}]
```

## 生态系统保障机制

### 1. 厂商验证

| 信任级别 | 说明 |
|---------|------|
| `official` | ObjectStack 官方插件 |
| `verified` | 经过验证的厂商 |
| `community` | 社区贡献 |
| `unverified` | 未验证的厂商 |

### 2. 质量指标

```typescript
quality: {
  testCoverage: 85,           // 测试覆盖率 %
  documentationScore: 90,     // 文档评分
  codeQuality: 88,           // 代码质量
  securityScan: {
    vulnerabilities: {
      critical: 0,
      high: 0,
      medium: 1,
      low: 3,
    },
    passed: true,
  },
  conformanceTests: [
    {
      protocolId: 'com.objectstack.protocol.storage.v1',
      passed: true,
      totalTests: 150,
      passedTests: 150,
    }
  ],
}
```

### 3. 依赖解析

系统自动解析插件依赖：
- 版本兼容性检查（SemVer）
- 能力需求验证
- 循环依赖检测
- 拓扑排序初始化

### 4. 权限管理

插件必须声明所需权限：

```typescript
permissions: [
  'system.user.read',
  'system.data.write',
  'network.http.request',
  'storage.local.write',
]
```

## 实施路径

### 阶段 1：核心协议定义 ✅

- [x] 创建 `plugin-capability.zod.ts` 定义能力声明规范
- [x] 创建 `plugin-registry.zod.ts` 定义注册表结构
- [x] 更新 `manifest.zod.ts` 集成能力声明
- [x] 编写完整的 Zod 模式和 TypeScript 类型
- [x] 27 个测试用例全部通过

### 阶段 2：文档体系 ✅

- [x] 编写架构设计文档（中英双语）
- [x] 创建最佳实践指南
- [x] 提供完整示例（Advanced CRM Plugin）
- [x] 集成到开发者文档

### 阶段 3：工具支持（待实施）

- [ ] CLI 工具：插件验证、发布
- [ ] IDE 插件：智能提示、模板生成
- [ ] 测试框架：协议一致性测试
- [ ] 注册表服务：插件发现 API

### 阶段 4：生态建设（待实施）

- [ ] 官方插件迁移到新规范
- [ ] 社区插件认证流程
- [ ] 插件市场上线
- [ ] 开发者激励计划

## 技术实现

### 文件结构

```
packages/spec/src/
├── system/
│   ├── plugin-capability.zod.ts  # 能力声明协议
│   ├── plugin-capability.test.ts # 测试用例
│   ├── manifest.zod.ts           # 清单规范（已更新）
│   └── plugin.zod.ts             # 插件生命周期
├── hub/
│   ├── plugin-registry.zod.ts    # 注册表协议
│   └── marketplace.zod.ts        # 市场协议

content/docs/developers/
└── plugin-ecosystem.mdx          # 设计文档

examples/
└── plugin-advanced-crm/          # 完整示例
    ├── objectstack.config.ts
    └── README.md
```

### 关键模式定义

```typescript
// 协议引用
ProtocolReferenceSchema = z.object({
  id: z.string().regex(/^([a-z][a-z0-9]*\.)+protocol\.[a-z][a-z0-9._]*\.v\d+$/),
  version: { major, minor, patch },
});

// 插件依赖
PluginDependencySchema = z.object({
  pluginId: z.string().regex(/^([a-z][a-z0-9]*\.)+[a-z][a-z0-9-]+$/),
  version: z.string(),  // SemVer range
  requiredCapabilities: z.array(z.string()),
});

// 扩展点
ExtensionPointSchema = z.object({
  id: z.string().regex(/^([a-z][a-z0-9]*\.)+extension\.[a-z][a-z0-9._]+$/),
  type: z.enum(['action', 'hook', 'widget', 'provider', 'transformer', 'validator', 'decorator']),
  cardinality: z.enum(['single', 'multiple']),
});
```

## 优势总结

### 1. 厂商无关性
- 标准化协议，任何厂商都可以实现
- 反向域名命名避免冲突
- 能力声明使依赖明确

### 2. 可发现性
- 中心化注册表
- 按协议、标签搜索
- 能力需求匹配

### 3. 互操作性
- 接口契约保证兼容性
- 扩展点机制支持灵活扩展
- 事件总线实现松耦合

### 4. 质量保障
- 自动化测试和认证
- 安全漏洞扫描
- 厂商信任级别

### 5. 演进友好
- 语义化版本控制
- 符合性级别管理
- 向后兼容性要求

## 参考标准

本设计参考了以下工业标准：

- **OSGi Service Platform** - Java 模块化系统
- **Eclipse Extension Points** - IDE 扩展机制
- **Kubernetes CRDs** - 自定义资源定义
- **VS Code Extension API** - 编辑器扩展 API
- **NPM Package System** - 依赖管理
- **Salesforce AppExchange** - 企业应用市场

## 总结

我们已经建立了一个完整的插件生态系统规范，包括：

1. ✅ **协议声明机制** - 插件如何表达能力
2. ✅ **命名规范** - 保证全局唯一性
3. ✅ **互操作性框架** - 插件如何协作
4. ✅ **注册表系统** - 插件如何发现
5. ✅ **质量保障** - 如何确保可靠性
6. ✅ **完整文档** - 开发者如何使用

这个规范确保了不同厂商的插件可以：
- 🔍 互相发现和依赖
- 🤝 安全地相互调用
- 🔌 灵活地组合和扩展
- 📈 持续演进而不破坏兼容性

## 下一步行动

1. **社区反馈**：收集开发者意见，完善规范
2. **工具开发**：CLI、IDE 插件、测试框架
3. **插件迁移**：现有插件适配新规范
4. **市场上线**：建设插件发现和交易平台
5. **生态激励**：认证计划、开发者支持

---

**文档版本**: 1.0.0  
**创建日期**: 2024-01-30  
**维护者**: ObjectStack Team  
**License**: Apache-2.0
