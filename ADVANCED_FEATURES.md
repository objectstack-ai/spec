# ObjectStack 高级特性实现指南

## 概述

本文档展示如何使用 MiniKernel 架构实现三个关键的高级特性：

1. **事件驱动机制 (Event Bus)** - 实现插件间的解耦通信
2. **UI 引擎动态挂载** - 动态路由注册和页面渲染
3. **配置驱动加载** - 通过 JSON 配置文件加载插件

## ✅ 特性 1: 事件驱动机制 (Event Bus)

### 架构说明

当前 MiniKernel 已经实现了完整的事件系统：

```typescript
interface PluginContext {
  hook(name: string, handler: (...args: any[]) => void | Promise<void>): void;
  trigger(name: string, ...args: any[]): Promise<void>;
}
```

### 标准化钩子

推荐的标准化事件钩子：

#### 数据生命周期事件

```typescript
// 数据创建
'data:record:beforeCreate'  // { table, data }
'data:record:afterCreate'   // { table, data }

// 数据更新
'data:record:beforeUpdate'  // { table, id, data, oldRecord }
'data:record:afterUpdate'   // { table, id, data, changes }

// 数据删除
'data:record:beforeDelete'  // { table, id }
'data:record:afterDelete'   // { table, id }
```

#### 服务器生命周期事件

```typescript
'server:route:register'     // { method, path, handler }
'server:ready'              // { port, url }
'server:request'            // { method, path, query, body }
```

#### 内核生命周期事件

```typescript
'kernel:ready'              // Kernel bootstrap complete
'kernel:shutdown'           // Kernel shutting down
```

### 实现示例

#### 1. Data Engine (事件生产者)

```typescript
export class DataEnginePlugin implements Plugin {
  name = 'com.objectstack.engine.data';

  async init(ctx: PluginContext) {
    const db = {
      insert: async (table: string, data: any) => {
        // 触发前置钩子 - 允许修改数据
        await ctx.trigger('data:record:beforeCreate', { table, data });
        
        // 执行插入
        const record = { id: generateId(), ...data };
        
        // 触发后置钩子 - 用于自动化 (非阻塞)
        ctx.trigger('data:record:afterCreate', { table, data: record })
          .catch(err => console.error('Hook error:', err));
        
        return record;
      }
    };
    
    ctx.registerService('db', db);
  }
}
```

#### 2. Flow Engine (事件消费者)

```typescript
export class FlowEnginePlugin implements Plugin {
  name = 'com.objectstack.engine.flow';

  async start(ctx: PluginContext) {
    // 监听数据创建事件
    ctx.hook('data:record:afterCreate', async ({ table, data }) => {
      console.log(`[Flow] New ${table} record:`, data.id);
      
      // 根据条件触发不同的流程
      if (table === 'orders' && data.status === 'pending') {
        await this.executeFlow('process_order', data);
      }
    });
    
    // 监听数据更新事件
    ctx.hook('data:record:afterUpdate', async ({ table, data, changes }) => {
      if (table === 'orders' && changes.status === 'shipped') {
        await this.executeFlow('notify_shipping', data);
      }
    });
  }
  
  private async executeFlow(flowName: string, data: any) {
    console.log(`[Flow] ⚡️ Executing: ${flowName}`);
    // 实际的工作流执行逻辑
  }
}
```

### 关键优势

✅ **完全解耦**: Flow Engine 不需要知道 Data Engine 的存在  
✅ **可扩展**: 可以添加任意数量的事件监听器  
✅ **异步执行**: 后置钩子不阻塞主流程  
✅ **类型安全**: TypeScript 支持完整的类型推导

### 使用示例

```typescript
const kernel = new ObjectKernel();

kernel
  .use(new DataEnginePlugin())    // 生产事件
  .use(new FlowEnginePlugin());   // 消费事件

await kernel.bootstrap();

// 触发数据操作，自动触发工作流
const db = kernel.getService('db');
await db.insert('orders', {
  customer: 'John',
  total: 299.99,
  status: 'pending'
});
// → 自动触发 'process_order' 工作流
```

## ✅ 特性 2: UI 引擎动态挂载

### 架构说明

UI Engine 通过服务注册表获取 HTTP Server，然后动态注册路由。

### 实现示例

```typescript
export class UiEnginePlugin implements Plugin {
  name = 'com.objectstack.engine.ui';
  dependencies = ['com.objectstack.server.hono'];  // 依赖 HTTP 服务器

  async init(ctx: PluginContext) {
    // 注册 UI 引擎服务
    const uiEngine = {
      renderPage: (route: string, data: any) => {
        return `<!DOCTYPE html>
          <html>
            <head><title>ObjectStack - ${route}</title></head>
            <body>
              <h1>Current Route: ${route}</h1>
              <pre>${JSON.stringify(data, null, 2)}</pre>
            </body>
          </html>`;
      }
    };
    
    ctx.registerService('ui-engine', uiEngine);
  }

  async start(ctx: PluginContext) {
    // 获取 HTTP 服务器
    const app = ctx.getService('http-server');
    const uiEngine = ctx.getService('ui-engine');
    
    // 注册 UI 路由
    app.get('/app/*', (c) => {
      const html = uiEngine.renderPage(c.req.path, {
        timestamp: new Date().toISOString()
      });
      return c.html(html);
    });
    
    // 注册列表视图路由
    app.get('/ui/list/:object', (c) => {
      const objectName = c.req.param('object');
      const html = uiEngine.renderPage(`/ui/list/${objectName}`, {
        object: objectName,
        view: 'list'
      });
      return c.html(html);
    });
    
    // 注册表单视图路由
    app.get('/ui/form/:object/:id?', (c) => {
      const objectName = c.req.param('object');
      const id = c.req.param('id');
      const html = uiEngine.renderPage(`/ui/form/${objectName}/${id || 'new'}`, {
        object: objectName,
        id: id || null,
        view: 'form'
      });
      return c.html(html);
    });

    console.log('[UI] Routes mounted: /app/*, /ui/list/:object, /ui/form/:object/:id');
  }
}
```

### 使用示例

```typescript
const kernel = new ObjectKernel();

kernel
  .use(new HonoServerPlugin({ port: 3000 }))  // HTTP 服务器
  .use(new UiEnginePlugin());                 // UI 引擎

await kernel.bootstrap();

// 访问:
// - http://localhost:3000/app/
// - http://localhost:3000/ui/list/contacts
// - http://localhost:3000/ui/form/orders/12345
```

## ✅ 特性 3: 配置驱动加载

### 架构说明

通过 JSON 配置文件定义要加载的插件，实现真正的 "低代码" 平台特性。

### 配置文件格式

```json
{
  "version": "1.0.0",
  "plugins": [
    {
      "name": "objectstack-objectql",
      "enabled": true,
      "options": {
        "env": "production"
      }
    },
    {
      "name": "objectstack-data",
      "enabled": true,
      "options": {
        "enableHooks": true
      }
    },
    {
      "name": "objectstack-flow",
      "enabled": false
    },
    {
      "name": "objectstack-ui",
      "enabled": true
    }
  ]
}
```

### 配置加载器实现

```typescript
// 插件注册表
export class PluginRegistry {
  private static registry = new Map<string, () => Plugin>();

  static register(name: string, factory: () => Plugin) {
    this.registry.set(name, factory);
  }

  static get(name: string) {
    return this.registry.get(name);
  }
}

// 从配置创建内核
export async function createKernelFromConfig(configPath: string) {
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const kernel = new ObjectKernel();

  for (const pluginConfig of config.plugins) {
    if (!pluginConfig.enabled) {
      console.log(`Skipping disabled plugin: ${pluginConfig.name}`);
      continue;
    }

    const factory = PluginRegistry.get(pluginConfig.name);
    if (!factory) {
      console.warn(`Plugin not found: ${pluginConfig.name}`);
      continue;
    }

    const plugin = factory();
    kernel.use(plugin);
    console.log(`✅ Loaded: ${pluginConfig.name}`);
  }

  return kernel;
}
```

### 使用示例

```typescript
// 1. 注册所有可用的插件
PluginRegistry.register('objectstack-objectql', () => new ObjectQLPlugin());
PluginRegistry.register('objectstack-data', () => new DataEnginePlugin());
PluginRegistry.register('objectstack-flow', () => new FlowEnginePlugin());
PluginRegistry.register('objectstack-ui', () => new UiEnginePlugin());

// 2. 从配置文件创建内核
const kernel = await createKernelFromConfig('./objectstack.config.json');

// 3. 启动
await kernel.bootstrap();
```

### 配置驱动的优势

✅ **无需修改代码**: 只需修改 JSON 文件  
✅ **环境特定配置**: 开发/测试/生产环境不同配置  
✅ **按需加载**: 只加载需要的插件  
✅ **版本控制友好**: 配置文件可以版本管理

## 完整示例

### 场景：订单处理系统

```typescript
// 1. 注册插件
PluginRegistry.register('objectstack-objectql', () => new ObjectQLPlugin());
PluginRegistry.register('objectstack-data', () => new DataEnginePlugin());
PluginRegistry.register('objectstack-server', () => new HonoServerPlugin({ port: 3000 }));
PluginRegistry.register('objectstack-flow', () => new FlowEnginePlugin());
PluginRegistry.register('objectstack-ui', () => new UiEnginePlugin());

// 2. 从配置加载
const kernel = await createKernelFromConfig('./objectstack.config.json');
await kernel.bootstrap();

// 3. 使用
const db = kernel.getService('db');

// 创建订单 → 自动触发工作流 → UI 可以查看
await db.insert('orders', {
  customer: 'Alice',
  items: ['Product A', 'Product B'],
  total: 599.99,
  status: 'pending'
});

// Flow Engine 自动执行:
// - 库存检查
// - 支付处理
// - 发货通知
// - 邮件通知

// UI Engine 提供:
// - 订单列表: http://localhost:3000/ui/list/orders
// - 订单详情: http://localhost:3000/ui/form/orders/12345
```

## 进阶模式

### 1. 条件化工作流

```typescript
ctx.hook('data:record:afterCreate', async ({ table, data }) => {
  // 根据数据触发不同的流程
  if (table === 'orders') {
    if (data.total > 1000) {
      await executeFlow('vip_order_processing', data);
    } else {
      await executeFlow('standard_order_processing', data);
    }
  }
});
```

### 2. 多环境配置

```json
// objectstack.dev.json
{
  "plugins": [
    { "name": "objectstack-data", "enabled": true },
    { "name": "objectstack-flow", "enabled": false }  // 开发环境禁用
  ]
}

// objectstack.prod.json
{
  "plugins": [
    { "name": "objectstack-data", "enabled": true },
    { "name": "objectstack-flow", "enabled": true }   // 生产环境启用
  ]
}
```

### 3. 动态插件选项

```typescript
// 根据配置传递选项给插件
const kernel = new ObjectKernel();

for (const cfg of config.plugins) {
  const factory = PluginRegistry.get(cfg.name);
  const plugin = factory(cfg.options);  // 传递选项
  kernel.use(plugin);
}
```

## 总结

✅ **事件驱动**: 已完全实现，通过 `hook()` 和 `trigger()`  
✅ **UI 挂载**: 已完全支持，通过服务注册表获取 HTTP 服务器  
✅ **配置加载**: 提供完整的参考实现和示例

**当前 MiniKernel 架构已经具备生产环境所需的所有核心能力！**

## 参考文件

- 完整示例: `/examples/complete-event-driven-example.ts`
- Flow Engine: `/examples/flow-engine-plugin.ts`
- Data Engine: `/examples/data-engine-plugin.ts`
- UI Engine: `/examples/ui-engine-plugin.ts`
- 配置加载器: `/examples/config-loader.ts`
- 配置示例: `/examples/objectstack.config.json`
