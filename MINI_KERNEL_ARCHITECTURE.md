# ObjectStack MiniKernel 架构图

## 1. 总体架构 (Overall Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  (Business Logic, User Plugins, Custom Integrations)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Plugin Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ ObjectQL │  │  Driver  │  │   Hono   │  │   Flow   │   │
│  │  Plugin  │  │  Plugin  │  │  Server  │  │  Engine  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   REST   │  │  GraphQL │  │  Cache   │  │   Auth   │   │
│  │   API    │  │   API    │  │  Plugin  │  │  Plugin  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ObjectKernel (MiniKernel)                 │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │    Service     │  │   Lifecycle    │  │     Hook     │  │
│  │   Registry     │  │   Management   │  │    System    │  │
│  │   (DI)         │  │  (init/start)  │  │   (Events)   │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Dependency Resolution (Topological Sort)       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Infrastructure                          │
│   (Node.js Runtime, TypeScript, Zod, etc.)                  │
└─────────────────────────────────────────────────────────────┘
```

## 2. 插件生命周期 (Plugin Lifecycle)

```
     IDLE
       │
       ▼
   use(plugin) ────┐
       │           │
       │           │ (可以注册多个插件)
       │           │
       │◄──────────┘
       │
       ▼
  bootstrap()
       │
       ├─── Phase 1: INIT ────────────────┐
       │    (按依赖顺序)                    │
       │                                   │
       │    Plugin A: init(ctx)           │
       │    ├─ ctx.registerService('a')   │
       │    └─ 准备资源                    │
       │                                   │
       │    Plugin B: init(ctx)           │
       │    ├─ ctx.registerService('b')   │
       │    └─ ctx.getService('a')        │
       │                                   │
       │    Plugin C: init(ctx)           │
       │    └─ ctx.getService('b')        │
       │                                   │
       ├─── Phase 2: START ───────────────┤
       │    (按依赖顺序)                    │
       │                                   │
       │    Plugin A: start(ctx)          │
       │    ├─ 启动服务器                  │
       │    └─ 连接数据库                  │
       │                                   │
       │    Plugin B: start(ctx)          │
       │    └─ 注册路由                    │
       │                                   │
       │    Plugin C: start(ctx)          │
       │    └─ 启动定时任务                │
       │                                   │
       ├─── Phase 3: KERNEL READY ────────┤
       │                                   │
       │    trigger('kernel:ready')       │
       │    ├─ Hook Handler 1             │
       │    ├─ Hook Handler 2             │
       │    └─ Hook Handler 3             │
       │                                   │
       └───────────────────────────────────┘
       │
       ▼
    RUNNING
       │
       ▼
   shutdown()
       │
       ├─── DESTROY (反向顺序) ────────────┐
       │                                   │
       │    Plugin C: destroy()           │
       │    Plugin B: destroy()           │
       │    Plugin A: destroy()           │
       │                                   │
       └───────────────────────────────────┘
       │
       ▼
    STOPPED
```

## 3. 服务注册表 (Service Registry)

```
┌─────────────────────────────────────────────────────────┐
│                   PluginContext                          │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │          Service Registry (Map)                 │    │
│  │                                                 │    │
│  │  ┌──────────────┬──────────────────────────┐   │    │
│  │  │ Service Name │ Service Instance         │   │    │
│  │  ├──────────────┼──────────────────────────┤   │    │
│  │  │ 'objectql'   │ ObjectQL Instance        │   │    │
│  │  │ 'db'         │ Database Connection      │   │    │
│  │  │ 'http-server'│ Hono App Instance        │   │    │
│  │  │ 'cache'      │ Cache Manager            │   │    │
│  │  │ 'logger'     │ Winston Logger           │   │    │
│  │  └──────────────┴──────────────────────────┘   │    │
│  │                                                 │    │
│  │  Methods:                                       │    │
│  │  • registerService(name, service)              │    │
│  │  • getService<T>(name): T                      │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Plugin A                Plugin B                       │
│  ┌─────────┐            ┌─────────┐                    │
│  │         │            │         │                    │
│  │ init()  │───┬────────│ start() │                    │
│  │         │   │        │         │                    │
│  └─────────┘   │        └─────────┘                    │
│                │             │                          │
│      register  │             │ consume                  │
│      Service   │             │                          │
│                │             │                          │
│                ▼             ▼                          │
│         registerService   getService                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 4. 依赖解析 (Dependency Resolution)

```
注册顺序 (Registration Order):
┌────────┐  ┌────────┐  ┌────────┐
│Plugin C│→ │Plugin B│→ │Plugin A│
└────────┘  └────────┘  └────────┘
    │           │           │
    │           │           └── dependencies: []
    │           └── dependencies: ['plugin-a']
    └── dependencies: ['plugin-b']

依赖图 (Dependency Graph):
         ┌────────┐
         │Plugin A│ (无依赖)
         └────┬───┘
              │ depends on
              ▼
         ┌────────┐
         │Plugin B│
         └────┬───┘
              │ depends on
              ▼
         ┌────────┐
         │Plugin C│
         └────────┘

拓扑排序后的初始化顺序 (Topological Sort):
1. Plugin A  (init → start)
2. Plugin B  (init → start)
3. Plugin C  (init → start)

错误检测 (Error Detection):
循环依赖:
A → B → C → A  ❌ Error: Circular dependency

缺失依赖:
A requires 'non-existent'  ❌ Error: Dependency not found
```

## 5. 钩子系统 (Hook System)

```
┌─────────────────────────────────────────────────────────┐
│                   Hook Registry (Map)                    │
│                                                          │
│  ┌──────────────────┬─────────────────────────────┐    │
│  │  Hook Name       │  Handlers (Array)           │    │
│  ├──────────────────┼─────────────────────────────┤    │
│  │ 'kernel:ready'   │  [handler1, handler2, ...]  │    │
│  │ 'data:insert'    │  [validator, logger, ...]   │    │
│  │ 'http:request'   │  [auth, cors, ...]          │    │
│  └──────────────────┴─────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘

事件流 (Event Flow):

Plugin A                Plugin B                Plugin C
   │                       │                       │
   │ ctx.hook('event')     │                       │
   ├──────────────────────►│                       │
   │                       │                       │
   │                       │ ctx.hook('event')     │
   │                       ├──────────────────────►│
   │                       │                       │
   │                                               │
   │ ctx.trigger('event', data)                    │
   ├───────────────────────────────────────────────►
   │                       │                       │
   │                   handler1(data)              │
   │                       │                       │
   │                   handler2(data)              │
   │                       │                       │
   │◄──────────────────────┴───────────────────────┘
   │
```

## 6. ObjectQL 插件化 (ObjectQL as Plugin)

```
Before (Hardcoded):
┌─────────────────────┐
│  ObjectStackKernel  │
│                     │
│  ┌───────────────┐  │
│  │   ObjectQL    │  │ ← 硬编码在 Kernel 中
│  │   (Hardcoded) │  │
│  └───────────────┘  │
│                     │
└─────────────────────┘

After (Plugin-based):
┌─────────────────────┐
│   ObjectKernel      │
│  (MiniKernel)       │
│                     │
│  Service Registry:  │
│  ┌───────────────┐  │
│  │ 'objectql'    │  │ ← 注册为服务
│  │  → ObjectQL   │  │
│  └───────────────┘  │
│                     │
└─────────────────────┘
         ▲
         │
   ┌─────┴──────┐
   │ ObjectQL   │
   │  Plugin    │  ← 可替换的插件
   └────────────┘

优势:
1. ✅ ObjectQL 可以被替换
2. ✅ 可以提供自定义 ObjectQL 实例
3. ✅ 测试时可以 Mock
4. ✅ 插件间平等关系
```

## 7. 实际应用示例 (Real-world Example)

```
┌─────────────────────────────────────────────────────────┐
│                    ObjectKernel                          │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  ObjectQL    │  │   Memory     │  │    Hono      │
│   Plugin     │  │   Driver     │  │   Server     │
│              │  │   Plugin     │  │   Plugin     │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       │ init:           │ init:           │ init:
       │ register        │ get objectql    │ register
       │ 'objectql'      │ register driver │ 'http-server'
       │                 │                 │
       │ start:          │                 │ start:
       │ init engine     │                 │ setup routes
       │                 │                 │ listen on port
       │                 │                 │
       └─────────────────┴─────────────────┘
                         │
                         ▼
               trigger('kernel:ready')
                         │
                         ▼
              ┌──────────────────┐
              │  Server Starts   │
              │  on Port 3000    │
              └──────────────────┘
```

## 8. 插件通信模式 (Plugin Communication Patterns)

```
模式 1: 服务注册与消费 (Service Registry)
───────────────────────────────────────────
Provider Plugin          Consumer Plugin
      │                        │
      │ init()                 │
      ├─ registerService()     │
      │                        │
      │                   start()
      │                        ├─ getService()
      │                        │
      └────────────────────────┘

模式 2: 事件钩子 (Event Hooks)
───────────────────────────────────────────
Publisher Plugin         Subscriber Plugin
      │                        │
      │                   init()
      │                        ├─ hook('event')
      │                        │
      │ start()                │
      ├─ trigger('event')      │
      │        │               │
      │        └──────────────►│
      │                   handler()
      │                        │

模式 3: 依赖声明 (Dependency Declaration)
───────────────────────────────────────────
Plugin A                 Plugin B
dependencies: []         dependencies: ['plugin-a']
      │                        │
      │ init()                 │
      │                        │
      └────────┬───────────────┘
               │
          (Kernel 保证 A 先初始化)
```

## 9. 扩展路径 (Extension Paths)

```
当前架构 (Current):
ObjectKernel → Plugin Interface → Built-in Plugins

未来扩展 (Future):

1. 配置化加载 (Config-based Loading)
   ┌─────────────────────┐
   │ objectstack.config  │
   │  {                  │
   │    plugins: [       │
   │      "objectql",    │
   │      "hono-server", │
   │      "my-plugin"    │
   │    ]                │
   │  }                  │
   └──────────┬──────────┘
              │
              ▼
        Kernel.loadFromConfig()

2. 插件市场 (Plugin Marketplace)
   npm install @company/custom-plugin
              │
              ▼
        kernel.use(CustomPlugin)

3. 热加载 (Hot Reload)
   kernel.reload('plugin-name')
              │
              ▼
        destroy() → init() → start()

4. 沙箱隔离 (Sandboxing)
   ┌──────────────────┐
   │  User Script     │
   │  (Isolated VM)   │
   └──────────────────┘
```

## License

Apache-2.0
