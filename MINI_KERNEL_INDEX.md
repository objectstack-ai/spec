# ObjectStack MiniKernel 架构索引

## 📚 文档导航

本次架构改造将 ObjectStack 从单体架构转变为**微内核 (MiniKernel)** 架构，实现了业务逻辑的完全插件化。

### 核心文档

1. **[架构实现总结](./MINI_KERNEL_IMPLEMENTATION.md)** - 实现概述、核心组件、使用示例
   - 快速了解 MiniKernel 是什么
   - 核心组件说明
   - 迁移指南
   - 技术要点

2. **[完整使用指南](./MINI_KERNEL_GUIDE.md)** - 详细的 API 文档和最佳实践
   - 概念介绍
   - 基础用法
   - 高级模式
   - 故障排查

3. **[架构设计图](./MINI_KERNEL_ARCHITECTURE.md)** - 可视化架构图和流程图
   - 总体架构
   - 生命周期流程
   - 服务注册表
   - 依赖解析
   - 钩子系统

### 代码示例

1. **[基础示例](./examples/mini-kernel-example.ts)** - 简单的 MiniKernel 使用示例
2. **[测试套件](./test-mini-kernel.ts)** - 完整的测试用例

### 源代码

- **[ObjectKernel](./packages/runtime/src/mini-kernel.ts)** - 微内核实现
- **[Plugin Types](./packages/runtime/src/types.ts)** - 插件接口定义
- **[ObjectQLPlugin](./packages/runtime/src/objectql-plugin.ts)** - ObjectQL 插件
- **[DriverPlugin](./packages/runtime/src/driver-plugin.ts)** - 驱动器插件
- **[HonoServerPlugin](./packages/plugin-hono-server/src/hono-plugin.ts)** - HTTP 服务器插件

## 🚀 快速开始

```typescript
import { ObjectKernel, ObjectQLPlugin, DriverPlugin } from '@objectstack/runtime';

const kernel = new ObjectKernel();

kernel
  .use(new ObjectQLPlugin())
  .use(new DriverPlugin(memoryDriver, 'memory'));

await kernel.bootstrap();

// 访问服务
const objectql = kernel.getService('objectql');
```

## 📋 核心特性

- ✅ **插件化架构**: 业务逻辑完全剥离到插件
- ✅ **依赖注入**: 服务注册表实现 DI
- ✅ **生命周期管理**: init → start → destroy
- ✅ **事件系统**: Hook 机制实现松耦合
- ✅ **依赖解析**: 自动拓扑排序
- ✅ **向后兼容**: 保留旧 API

## 🔄 迁移路径

### 旧架构
```typescript
const kernel = new ObjectStackKernel([
  new ObjectQLPlugin(),
  appManifest
]);
await kernel.start();
```

### 新架构
```typescript
const kernel = new ObjectKernel();
kernel.use(new ObjectQLPlugin());
kernel.use(appManifestPlugin);
await kernel.bootstrap();
```

## 📖 推荐阅读顺序

1. 先读 [实现总结](./MINI_KERNEL_IMPLEMENTATION.md) 了解整体概况
2. 查看 [架构图](./MINI_KERNEL_ARCHITECTURE.md) 理解设计思路
3. 参考 [使用指南](./MINI_KERNEL_GUIDE.md) 学习具体用法
4. 运行 [示例代码](./examples/mini-kernel-example.ts) 实践操作

## 🤝 贡献

欢迎贡献新的插件、改进文档或提出问题！

## 📄 License

Apache-2.0
