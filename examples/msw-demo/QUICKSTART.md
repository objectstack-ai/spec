# Quick Start Guide - MSW Frontend Components

## 快速开始指南

本指南将帮助你在 5 分钟内开始使用 MSW 模拟 API 进行前端数据操作。

## 📦 安装

```bash
# 安装依赖
pnpm add msw @objectstack/plugin-msw react

# 或使用 npm
npm install msw @objectstack/plugin-msw react
```

## 🚀 三步集成

### 第一步：初始化 MSW Worker

创建 `src/mocks/setup.ts`:

```typescript
import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';
import { ObjectStackServer } from '@objectstack/plugin-msw';

// 初始化 Mock Server
const mockProtocol = {
  async findData(object: string) {
    return [/* 模拟数据 */];
  },
  async createData(object: string, data: any) {
    return { id: '123', ...data };
  },
  // ... 其他方法
};

ObjectStackServer.init(mockProtocol);

// 定义处理器
const handlers = [
  http.get('/api/v1/data/:object', async ({ params }) => {
    const result = await ObjectStackServer.findData(params.object as string);
    return HttpResponse.json(result.data);
  }),
  // ... 其他端点
];

// 启动 Worker
export const worker = setupWorker(...handlers);
```

### 第二步：在应用入口启动 MSW

在 `src/main.tsx` 或 `src/index.tsx`:

```typescript
import { worker } from './mocks/setup';

async function main() {
  // 仅在开发环境启动 MSW
  if (process.env.NODE_ENV === 'development') {
    await worker.start({ onUnhandledRequest: 'bypass' });
    console.log('MSW started');
  }
  
  // 启动你的 React 应用
  // ...
}

main();
```

### 第三步：在组件中使用

#### 方式 A：使用自定义 Hooks（推荐）

```tsx
import { useObjectData, useCreateData } from './hooks/useObjectData';

function UserList() {
  const { data: users, loading, error } = useObjectData('user');
  const { execute: createUser } = useCreateData('user');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {users?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
      <button onClick={() => createUser({ name: 'New User' })}>
        Add User
      </button>
    </div>
  );
}
```

#### 方式 B：直接使用 Fetch API

```tsx
import { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/v1/data/user')
      .then(res => res.json())
      .then(setUsers);
  }, []);

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

## 📚 完整示例

查看以下文件获取完整示例：

- `src/demo.tsx` - 完整的演示应用
- `src/components/UserManagement.tsx` - 完整 CRUD 组件
- `src/components/UserList.tsx` - 使用 Hooks 的简化组件
- `src/hooks/useObjectData.ts` - 自定义 Hooks

## 🎯 支持的操作

### 数据操作

```typescript
// 获取列表
GET /api/v1/data/user

// 获取单个
GET /api/v1/data/user/123

// 创建
POST /api/v1/data/user
Body: { name: "John", email: "john@example.com" }

// 更新
PATCH /api/v1/data/user/123
Body: { name: "John Updated" }

// 删除
DELETE /api/v1/data/user/123
```

### 使用 Hooks

```typescript
// 获取数据
const { data, loading, error, refetch } = useObjectData('user');

// 创建数据
const { execute: create } = useCreateData('user', {
  onSuccess: () => console.log('Created!'),
});
await create({ name: 'John' });

// 更新数据
const { execute: update } = useUpdateData('user');
await update({ id: '123', data: { name: 'Updated' } });

// 删除数据
const { execute: remove } = useDeleteData('user');
await remove('123');
```

## 🐛 故障排除

### MSW Worker 无法启动

确保在浏览器环境中启动：

```typescript
if (typeof window !== 'undefined') {
  await worker.start();
}
```

### 请求未被拦截

检查 baseUrl 是否匹配：

```typescript
// 如果你的 API 是 /api/data/user
// 确保 handler 路径匹配
http.get('/api/data/:object', ...)
```

### TypeScript 错误

确保安装了类型定义：

```bash
pnpm add -D @types/react
```

并在 `tsconfig.json` 中启用 JSX：

```json
{
  "compilerOptions": {
    "jsx": "react",
    // ...
  }
}
```

## 📖 更多文档

- [完整中文指南](./GUIDE_CN.md)
- [README](./README.md)
- [MSW 官方文档](https://mswjs.io/)

## 💡 提示

1. **仅开发环境使用**: MSW 应该只在开发和测试环境使用
2. **代码分割**: 将 MSW 相关代码放在单独的 chunk 中
3. **类型安全**: 为你的数据定义 TypeScript 接口
4. **错误处理**: 始终处理加载和错误状态
5. **性能**: 使用 React.memo 和 useCallback 优化组件

## ⚡ 下一步

- 查看 [完整示例](./src/demo.tsx)
- 阅读 [自定义 Hooks 文档](./src/hooks/useObjectData.ts)
- 探索 [完整组件实现](./src/components/)

---

**需要帮助?** 查看 [Issues](https://github.com/objectstack-ai/spec/issues) 或阅读完整文档。
