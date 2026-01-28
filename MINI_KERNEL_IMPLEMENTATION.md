# ObjectStack MiniKernel Architecture - Implementation Summary

## 概述 (Overview)

本次实现将 ObjectStack 改造为基于**微内核 (MiniKernel)** 的插件化架构，实现了以下核心目标：

1. **高度模块化**: 业务逻辑完全剥离到插件中
2. **依赖注入 (DI)**: 通过服务注册表实现插件间通信
3. **生命周期管理**: 标准化的 init → start → destroy 流程
4. **事件/钩子机制**: 松耦合的插件通信方式
5. **ObjectQL 插件化**: 数据引擎成为可替换的插件

## 核心组件 (Core Components)

### 1. ObjectKernel (MiniKernel)

**文件位置**: `packages/runtime/src/mini-kernel.ts`

**功能**:
- 插件生命周期管理
- 服务注册表 (Service Registry)
- 事件钩子系统 (Hook System)
- 依赖解析 (拓扑排序)

**主要方法**:
```typescript
class ObjectKernel {
  use(plugin: Plugin): ObjectKernel
  bootstrap(): Promise<void>
  shutdown(): Promise<void>
  getService<T>(name: string): T
}
```

### 2. Plugin Interface

**文件位置**: `packages/runtime/src/types.ts`

**定义**:
```typescript
interface Plugin {
  name: string;
  version?: string;
  dependencies?: string[];
  
  init(ctx: PluginContext): Promise<void>;
  start?(ctx: PluginContext): Promise<void>;
  destroy?(): Promise<void>;
}
```

**生命周期**:
1. **init**: 注册服务、准备资源
2. **start**: 执行业务逻辑、启动服务器
3. **destroy**: 清理资源、关闭连接

### 3. PluginContext

**功能**: 为插件提供运行时上下文

**主要方法**:
```typescript
interface PluginContext {
  registerService(name: string, service: any): void;
  getService<T>(name: string): T;
  hook(name: string, handler: Function): void;
  trigger(name: string, ...args: any[]): Promise<void>;
  logger: Console;
}
```

## 核心插件 (Built-in Plugins)

### 1. ObjectQLPlugin

**文件位置**: `packages/runtime/src/objectql-plugin.ts`

**功能**: 将 ObjectQL 数据引擎注册为服务

**服务**: `'objectql'`

**使用示例**:
```typescript
kernel.use(new ObjectQLPlugin());
// 或
kernel.use(new ObjectQLPlugin(customQL));
```

### 2. DriverPlugin

**文件位置**: `packages/runtime/src/driver-plugin.ts`

**功能**: 将数据驱动器包装为插件

**依赖**: `['com.objectstack.engine.objectql']`

**使用示例**:
```typescript
kernel.use(new DriverPlugin(memoryDriver, 'memory'));
```

### 3. HonoServerPlugin (已更新)

**文件位置**: `packages/plugin-hono-server/src/hono-plugin.ts`

**功能**: HTTP 服务器插件

**服务**: `'http-server'`

**更新内容**:
- 实现新的 Plugin 接口
- 保持向后兼容
- 使用服务注册表

## 架构优势 (Benefits)

### 1. 真正的模块化

- 每个插件独立开发、测试、部署
- 插件可以按需加载/卸载
- 清晰的依赖关系

### 2. 灵活性

- 支持配置化加载插件
- 可以条件性加载插件
- 易于扩展新功能

### 3. 可测试性

- 服务可以被 Mock
- 插件可以独立测试
- 依赖注入简化测试



## 使用示例 (Usage Examples)

### 基础用法

```typescript
import { ObjectKernel, ObjectQLPlugin, DriverPlugin } from '@objectstack/runtime';

const kernel = new ObjectKernel();

kernel
  .use(new ObjectQLPlugin())
  .use(new DriverPlugin(driver, 'memory'))
  .use(new HonoServerPlugin({ port: 3000 }));

await kernel.bootstrap();
```

### 服务注册与消费

```typescript
// Plugin A: 注册服务
class DataPlugin implements Plugin {
  name = 'data-plugin';
  
  async init(ctx: PluginContext) {
    ctx.registerService('db', myDatabase);
  }
}

// Plugin B: 消费服务
class ApiPlugin implements Plugin {
  name = 'api-plugin';
  dependencies = ['data-plugin'];
  
  async start(ctx: PluginContext) {
    const db = ctx.getService('db');
    // 使用数据库服务
  }
}
```

### 使用钩子系统

```typescript
class ServerPlugin implements Plugin {
  name = 'server';
  
  async start(ctx: PluginContext) {
    ctx.hook('kernel:ready', () => {
      console.log('Kernel is ready, starting server...');
      server.listen(3000);
    });
  }
}
```

## 文件结构 (File Structure)

```
packages/runtime/src/
├── mini-kernel.ts       # ObjectKernel 实现
├── types.ts             # Plugin, PluginContext 接口
├── objectql-plugin.ts   # ObjectQL 插件
├── driver-plugin.ts     # Driver 插件
├── protocol.ts          # Runtime Protocol
└── index.ts             # 导出

MINI_KERNEL_GUIDE.md     # 完整使用指南
examples/mini-kernel-example.ts  # 示例代码
test-mini-kernel.ts      # 测试套件
```

## 使用指南 (Usage Guide)

### 创建新插件

```typescript
import { Plugin, PluginContext } from '@objectstack/runtime';

class MyPlugin implements Plugin {
  name = 'my-plugin';
  version = '1.0.0';
  dependencies = ['other-plugin']; // 可选
  
  async init(ctx: PluginContext) {
    // 注册服务
    ctx.registerService('my-service', myService);
  }
  
  async start(ctx: PluginContext) {
    // 启动业务逻辑
    const otherService = ctx.getService('other-service');
  }
  
  async destroy() {
    // 清理资源
  }
}
```

## 测试 (Testing)

测试文件: `test-mini-kernel.ts`

包含以下测试用例:
1. ✅ 基础生命周期
2. ✅ 服务注册表
3. ✅ 依赖解析
4. ✅ 钩子系统
5. ✅ ObjectQL 插件
6. ✅ 多插件协作
7. ✅ 错误处理

## 下一步计划 (Next Steps)

1. **配置化加载**: 从 `objectstack.config.ts` 动态加载插件
2. **更多内置插件**: 
   - Flow Engine Plugin
   - Cache Plugin
   - Monitoring Plugin
3. **插件市场**: 支持第三方插件发布和安装
4. **沙箱隔离**: 为用户自定义脚本提供安全执行环境

## 参考文档 (References)

- [MINI_KERNEL_GUIDE.md](./MINI_KERNEL_GUIDE.md) - 完整使用指南
- [examples/mini-kernel-example.ts](./examples/mini-kernel-example.ts) - 示例代码
- [packages/runtime/src/mini-kernel.ts](./packages/runtime/src/mini-kernel.ts) - 核心实现

## 技术要点 (Technical Highlights)

### 依赖解析算法

使用**拓扑排序 (Topological Sort)** 解决插件依赖问题:

```typescript
private resolveDependencies(): Plugin[] {
  const resolved: Plugin[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const visit = (pluginName: string) => {
    if (visited.has(pluginName)) return;
    if (visiting.has(pluginName)) {
      throw new Error(`Circular dependency: ${pluginName}`);
    }
    visiting.add(pluginName);
    
    // Visit dependencies first
    const deps = plugin.dependencies || [];
    for (const dep of deps) {
      visit(dep);
    }
    
    visiting.delete(pluginName);
    visited.add(pluginName);
    resolved.push(plugin);
  };

  for (const pluginName of this.plugins.keys()) {
    visit(pluginName);
  }

  return resolved;
}
```

### 服务注册表

使用 **Map** 实现高效的服务注册和查找:

```typescript
private services: Map<string, any> = new Map();

registerService(name, service) {
  if (this.services.has(name)) {
    throw new Error(`Service '${name}' already registered`);
  }
  this.services.set(name, service);
}

getService<T>(name: string): T {
  const service = this.services.get(name);
  if (!service) {
    throw new Error(`Service '${name}' not found`);
  }
  return service as T;
}
```

### 钩子机制

使用**发布-订阅模式**实现事件通信:

```typescript
private hooks: Map<string, Function[]> = new Map();

hook(name, handler) {
  if (!this.hooks.has(name)) {
    this.hooks.set(name, []);
  }
  this.hooks.get(name)!.push(handler);
}

async trigger(name, ...args) {
  const handlers = this.hooks.get(name) || [];
  for (const handler of handlers) {
    await handler(...args);
  }
}
```

## 设计原则 (Design Principles)

1. **单一职责**: 内核只负责生命周期、DI 和事件，不包含业务逻辑
2. **开放封闭**: 对扩展开放（新插件），对修改封闭（内核不变）
3. **依赖倒置**: 高层模块不依赖低层模块，都依赖抽象（接口）
4. **接口隔离**: 插件只需实现必要的接口
5. **最小惊讶**: API 设计符合直觉，易于理解和使用

## License

Apache-2.0
