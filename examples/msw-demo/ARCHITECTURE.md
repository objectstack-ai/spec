# MSW Frontend Integration Architecture

## 架构概览 / Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Environment                       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           React Application Layer                   │    │
│  │                                                     │    │
│  │  ┌──────────────┐    ┌──────────────┐            │    │
│  │  │ UserList.tsx │    │UserMgmt.tsx  │            │    │
│  │  │  (Hooks)     │    │  (Full CRUD) │            │    │
│  │  └──────┬───────┘    └──────┬───────┘            │    │
│  │         │                   │                      │    │
│  │         └───────┬───────────┘                      │    │
│  │                 │                                   │    │
│  │         ┌───────▼────────┐                         │    │
│  │         │ Custom Hooks   │                         │    │
│  │         │ - useObjectData│                         │    │
│  │         │ - useCreateData│                         │    │
│  │         │ - useUpdateData│                         │    │
│  │         │ - useDeleteData│                         │    │
│  │         └───────┬────────┘                         │    │
│  └─────────────────┼──────────────────────────────────┘    │
│                    │                                         │
│  ┌─────────────────▼──────────────────────────────────┐    │
│  │              Fetch API Calls                        │    │
│  │  GET    /api/v1/data/:object                       │    │
│  │  POST   /api/v1/data/:object                       │    │
│  │  PATCH  /api/v1/data/:object/:id                   │    │
│  │  DELETE /api/v1/data/:object/:id                   │    │
│  └─────────────────┬──────────────────────────────────┘    │
│                    │                                         │
│  ┌─────────────────▼──────────────────────────────────┐    │
│  │         MSW Service Worker (Intercepts)            │    │
│  │                                                     │    │
│  │  ┌───────────────────────────────────────────┐    │    │
│  │  │         MSW Request Handlers               │    │    │
│  │  │  http.get('/api/v1/data/:object', ...)    │    │    │
│  │  │  http.post('/api/v1/data/:object', ...)   │    │    │
│  │  │  http.patch('/api/v1/data/:object/:id', ...)│  │    │
│  │  │  http.delete('/api/v1/data/:object/:id', ...)│ │    │
│  │  └───────────────┬───────────────────────────┘    │    │
│  │                  │                                 │    │
│  │         ┌────────▼─────────┐                      │    │
│  │         │ ObjectStackServer│                      │    │
│  │         │  - findData()    │                      │    │
│  │         │  - getData()     │                      │    │
│  │         │  - createData()  │                      │    │
│  │         │  - updateData()  │                      │    │
│  │         │  - deleteData()  │                      │    │
│  │         └────────┬─────────┘                      │    │
│  └──────────────────┼────────────────────────────────┘    │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────┐     │
│  │         Runtime Protocol / Driver                 │     │
│  │  (InMemoryDriver, SQLDriver, etc.)               │     │
│  │                                                   │     │
│  │  ┌─────────────────────────────────────────┐    │     │
│  │  │     In-Memory Data Store                 │    │     │
│  │  │  users: [                                │    │     │
│  │  │    { id: '1', name: 'John', ... },      │    │     │
│  │  │    { id: '2', name: 'Jane', ... }       │    │     │
│  │  │  ]                                       │    │     │
│  │  └─────────────────────────────────────────┘    │     │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 数据流 / Data Flow

### 读取数据 (GET)
```
Component → Hook → fetch(GET) → MSW → ObjectStackServer → Protocol → Data Store
   ↓                                                                      ↓
   ↓←──────────────────────────────────────────────────────────────────←↓
          Response with data
```

### 创建数据 (POST)
```
Component → Hook → fetch(POST + body) → MSW → ObjectStackServer → Protocol
   ↓                                                                   ↓
   ↓                                                            Create in Store
   ↓                                                                   ↓
   ↓←──────────────────────────────────────────────────────────────←↓
          Response with created record
```

### 更新数据 (PATCH)
```
Component → Hook → fetch(PATCH + id + body) → MSW → ObjectStackServer
   ↓                                                        ↓
   ↓                                                 Update in Store
   ↓                                                        ↓
   ↓←──────────────────────────────────────────────────────←↓
          Response with updated record
```

### 删除数据 (DELETE)
```
Component → Hook → fetch(DELETE + id) → MSW → ObjectStackServer
   ↓                                                  ↓
   ↓                                           Remove from Store
   ↓                                                  ↓
   ↓←─────────────────────────────────────────────────←↓
          Response with deletion confirmation
```

## 文件组织 / File Organization

```
examples/msw-demo/
├── src/
│   ├── browser.ts                 # MSW 浏览器模式配置
│   ├── server.ts                  # MSW 运行时集成
│   ├── demo.tsx                   # 完整演示应用
│   ├── index.ts                   # 导出入口
│   │
│   ├── components/                # React 组件
│   │   ├── UserManagement.tsx     # 完整 CRUD 组件
│   │   └── UserList.tsx          # 使用 Hooks 的简化组件
│   │
│   └── hooks/                     # 自定义 Hooks
│       └── useObjectData.ts       # 数据操作 Hooks
│
├── README.md                      # 英文文档
├── GUIDE_CN.md                    # 中文完整指南
├── QUICKSTART.md                  # 快速开始
└── package.json                   # 依赖配置
```

## 核心概念 / Core Concepts

### 1. MSW (Mock Service Worker)
- 拦截网络请求
- 在浏览器 Service Worker 中运行
- 不修改应用代码

### 2. ObjectStackServer
- 提供统一的数据操作接口
- 连接 MSW 和底层数据驱动
- 处理 CRUD 操作

### 3. Custom Hooks
- 封装数据操作逻辑
- 管理加载和错误状态
- 提供成功/失败回调

### 4. Runtime Protocol
- 定义标准数据操作接口
- 支持多种数据源 (内存、SQL、NoSQL)
- 提供元数据管理

## 使用场景 / Use Cases

### 开发环境
```typescript
// 在开发时使用 MSW 模拟后端
if (process.env.NODE_ENV === 'development') {
  await worker.start();
}
```

### 测试环境
```typescript
// 在测试中使用 MSW
beforeAll(() => worker.start());
afterAll(() => worker.stop());

test('should fetch users', async () => {
  const users = await fetch('/api/v1/data/user').then(r => r.json());
  expect(users).toBeDefined();
});
```

### 演示环境
```typescript
// 在演示应用中使用 MSW
// 无需真实后端即可展示功能
await setupMSW();
render(<DemoApp />);
```

## 优势 / Advantages

✅ **零后端依赖** - 完全离线工作  
✅ **快速开发** - 无需等待后端 API  
✅ **易于测试** - 模拟各种场景  
✅ **类型安全** - TypeScript 支持  
✅ **真实请求** - 使用真实的 fetch API  
✅ **灵活配置** - 自定义处理器和响应  

## API 端点映射 / API Endpoint Mapping

| 操作 | HTTP Method | 端点 | Hook |
|------|-------------|------|------|
| 查询列表 | GET | `/api/v1/data/:object` | `useObjectData(object)` |
| 获取单个 | GET | `/api/v1/data/:object/:id` | `useObjectData(object, id)` |
| 创建 | POST | `/api/v1/data/:object` | `useCreateData(object)` |
| 更新 | PATCH | `/api/v1/data/:object/:id` | `useUpdateData(object)` |
| 删除 | DELETE | `/api/v1/data/:object/:id` | `useDeleteData(object)` |
| 元数据 | GET | `/api/v1/meta/:type/:name` | `useMetadata(type, name)` |

## 最佳实践 / Best Practices

1. **分离关注点**: 将 MSW 配置与业务逻辑分离
2. **类型定义**: 为数据定义 TypeScript 接口
3. **错误处理**: 始终处理加载和错误状态
4. **性能优化**: 使用 React.memo 和 useCallback
5. **测试覆盖**: 为组件和 Hooks 编写测试
6. **环境隔离**: 仅在开发/测试环境启用 MSW

## 扩展性 / Extensibility

### 添加新对象类型
```typescript
// 只需定义数据结构，MSW 自动处理
interface Project {
  id: string;
  name: string;
  status: string;
}

const { data: projects } = useObjectData<Project[]>('project');
```

### 自定义处理器
```typescript
// 添加特殊业务逻辑
const customHandlers = [
  http.post('/api/v1/auth/login', async ({ request }) => {
    // 自定义登录逻辑
    return HttpResponse.json({ token: 'mock-token' });
  })
];
```

### 集成现有系统
```typescript
// 可以与现有 API 混合使用
// MSW 只拦截配置的端点，其他请求正常发送
```

---

**相关文档**:
- [完整中文指南](./GUIDE_CN.md)
- [快速开始](./QUICKSTART.md)
- [README](./README.md)
