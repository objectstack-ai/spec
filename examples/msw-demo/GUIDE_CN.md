# 在前端组件中使用 MSW 数据源进行模拟 API 数据操作

## 📖 概述

本案例展示如何在前端 React 组件中使用 MSW (Mock Service Worker) 数据源进行模拟 API 数据操作。MSW 允许你在开发和测试环境中拦截网络请求，无需真实的后端服务器。

## 🎯 主要特性

- ✅ **完整的 CRUD 操作**: 创建、读取、更新、删除数据
- ✅ **自定义 React Hooks**: 封装数据操作逻辑，提高代码复用性
- ✅ **错误处理和加载状态**: 完善的用户体验
- ✅ **TypeScript 类型安全**: 全面的类型支持
- ✅ **零后端依赖**: 完全在前端模拟数据操作

## 📁 项目结构

```
examples/msw-demo/
├── src/
│   ├── browser.ts              # MSW 浏览器模式配置
│   ├── server.ts               # MSW 运行时集成示例
│   ├── components/
│   │   ├── UserManagement.tsx  # 完整的用户管理组件（包含 CRUD）
│   │   └── UserList.tsx        # 使用自定义 Hooks 的简化组件
│   └── hooks/
│       └── useObjectData.ts    # 数据操作自定义 Hooks
└── README.md
```

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动 MSW Worker

在你的应用入口文件中初始化 MSW：

```typescript
import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';
import { ObjectStackServer } from '@objectstack/plugin-msw';

// 初始化 Mock Server
ObjectStackServer.init(protocol);

// 定义请求处理器
const handlers = [
  http.get('/api/v1/data/user', async () => {
    const result = await ObjectStackServer.findData('user');
    return HttpResponse.json(result.data, { status: result.status });
  }),
  
  http.post('/api/v1/data/user', async ({ request }) => {
    const body = await request.json();
    const result = await ObjectStackServer.createData('user', body);
    return HttpResponse.json(result.data, { status: result.status });
  }),
];

// 启动 Worker
const worker = setupWorker(...handlers);
await worker.start();
```

## 💡 使用示例

### 方式一：直接使用 Fetch API

```typescript
import React, { useState, useEffect } from 'react';

export const UserComponent = () => {
  const [users, setUsers] = useState([]);

  // 获取用户列表
  const fetchUsers = async () => {
    const response = await fetch('/api/v1/data/user');
    const data = await response.json();
    setUsers(data);
  };

  // 创建用户
  const createUser = async (userData) => {
    const response = await fetch('/api/v1/data/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const newUser = await response.json();
    setUsers([...users, newUser]);
  };

  // 更新用户
  const updateUser = async (id, updates) => {
    const response = await fetch(`/api/v1/data/user/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const updatedUser = await response.json();
    setUsers(users.map(u => u.id === id ? updatedUser : u));
  };

  // 删除用户
  const deleteUser = async (id) => {
    await fetch(`/api/v1/data/user/${id}`, {
      method: 'DELETE',
    });
    setUsers(users.filter(u => u.id !== id));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      {/* 你的 UI 组件 */}
    </div>
  );
};
```

### 方式二：使用自定义 Hooks（推荐）

```typescript
import React from 'react';
import { useObjectData, useCreateData, useUpdateData, useDeleteData } from './hooks/useObjectData';

export const UserComponent = () => {
  // 数据获取
  const { data: users, loading, error, refetch } = useObjectData('user');
  
  // CRUD 操作
  const { execute: createUser } = useCreateData('user', {
    onSuccess: () => refetch(),
  });
  
  const { execute: updateUser } = useUpdateData('user', {
    onSuccess: () => refetch(),
  });
  
  const { execute: deleteUser } = useDeleteData('user', {
    onSuccess: () => refetch(),
  });

  const handleCreate = async () => {
    await createUser({
      name: 'New User',
      email: 'user@example.com',
      status: 'active',
    });
  };

  const handleUpdate = async (id) => {
    await updateUser({
      id,
      data: { name: 'Updated Name' },
    });
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      <button onClick={handleCreate}>创建用户</button>
      {users?.map(user => (
        <div key={user.id}>
          <span>{user.name}</span>
          <button onClick={() => handleUpdate(user.id)}>更新</button>
          <button onClick={() => handleDelete(user.id)}>删除</button>
        </div>
      ))}
    </div>
  );
};
```

## 📚 完整组件示例

查看以下文件获取完整的实现示例：

### 1. **UserManagement.tsx** - 完整的用户管理组件
- 包含完整的 CRUD 操作
- 表单验证和错误处理
- 加载状态管理
- 编辑/取消功能

**路径**: `src/components/UserManagement.tsx`

### 2. **UserList.tsx** - 使用 Hooks 的简化组件
- 展示如何使用自定义 Hooks
- 更简洁的代码结构
- 易于维护和测试

**路径**: `src/components/UserList.tsx`

### 3. **useObjectData.ts** - 数据操作 Hooks
- `useObjectData` - 数据获取
- `useCreateData` - 创建数据
- `useUpdateData` - 更新数据
- `useDeleteData` - 删除数据
- `useMetadata` - 获取元数据

**路径**: `src/hooks/useObjectData.ts`

## 🔌 MSW 拦截的 API 端点

MSW 插件自动模拟以下 ObjectStack API 端点：

### 数据操作
- `GET /api/v1/data/:object` - 查询记录列表
- `GET /api/v1/data/:object/:id` - 获取单条记录
- `POST /api/v1/data/:object` - 创建记录
- `PATCH /api/v1/data/:object/:id` - 更新记录
- `DELETE /api/v1/data/:object/:id` - 删除记录

### 元数据
- `GET /api/v1/meta` - 获取元数据类型
- `GET /api/v1/meta/:type` - 获取特定类型的元数据
- `GET /api/v1/meta/:type/:name` - 获取特定元数据项

### 发现与配置
- `GET /api/v1` - API 发现信息
- `GET /api/v1/ui/view/:object` - UI 视图配置

## ⚙️ 自定义 Hooks API

### useObjectData

数据获取 Hook

```typescript
const { data, loading, error, refetch } = useObjectData<T>(
  objectName: string,
  id?: string,
  options?: {
    baseUrl?: string;
    autoFetch?: boolean;
  }
);
```

**参数**:
- `objectName`: 对象名称（如 'user'）
- `id`: 可选的记录 ID
- `options.baseUrl`: API 基础 URL（默认: '/api/v1'）
- `options.autoFetch`: 是否自动获取数据（默认: true）

**返回值**:
- `data`: 获取的数据
- `loading`: 加载状态
- `error`: 错误信息
- `refetch`: 重新获取数据的函数

### useCreateData

创建数据 Hook

```typescript
const { execute, loading, error, data } = useCreateData<T>(
  objectName: string,
  options?: {
    baseUrl?: string;
    onSuccess?: (data: any) => void;
    onError?: (error: string) => void;
  }
);
```

### useUpdateData

更新数据 Hook

```typescript
const { execute, loading, error, data } = useUpdateData<T>(
  objectName: string,
  options?: {
    baseUrl?: string;
    onSuccess?: (data: any) => void;
    onError?: (error: string) => void;
  }
);
```

### useDeleteData

删除数据 Hook

```typescript
const { execute, loading, error, data } = useDeleteData(
  objectName: string,
  options?: {
    baseUrl?: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
  }
);
```

### useMetadata

获取元数据 Hook

```typescript
const { data, loading, error, refetch } = useMetadata<T>(
  metaType: string,
  metaName?: string,
  options?: {
    baseUrl?: string;
    autoFetch?: boolean;
  }
);
```

## 🎨 最佳实践

### 1. 使用自定义 Hooks
将数据操作逻辑封装在自定义 Hooks 中，提高代码复用性和可维护性。

```typescript
// ✅ 推荐
const { data, loading } = useObjectData('user');

// ❌ 不推荐
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/v1/data/user')
    .then(res => res.json())
    .then(setData);
}, []);
```

### 2. 处理加载和错误状态
始终处理加载和错误状态，提供良好的用户体验。

```typescript
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

### 3. 使用回调函数
在数据变更操作后使用回调函数刷新数据。

```typescript
const { execute: createUser } = useCreateData('user', {
  onSuccess: () => refetch(), // 创建成功后刷新列表
  onError: (err) => toast.error(err), // 显示错误提示
});
```

### 4. TypeScript 类型定义
为数据定义清晰的 TypeScript 接口。

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

const { data } = useObjectData<User[]>('user');
```

## 🧪 测试

MSW 非常适合用于测试，因为它可以在测试环境中拦截网络请求：

```typescript
import { setupWorker } from 'msw/browser';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('UserComponent', () => {
  let worker;

  beforeAll(async () => {
    worker = setupWorker(...handlers);
    await worker.start();
  });

  afterAll(() => {
    worker.stop();
  });

  it('should fetch users', async () => {
    const response = await fetch('/api/v1/data/user');
    const users = await response.json();
    expect(users).toBeDefined();
  });
});
```

## 🔗 相关资源

- [MSW 官方文档](https://mswjs.io/)
- [@objectstack/plugin-msw](../../packages/plugin-msw)
- [@objectstack/runtime](../../packages/runtime)
- [ObjectStack 规范](../../packages/spec)

## 📝 许可证

Apache-2.0

---

## 💬 总结

本案例演示了如何在前端 React 组件中使用 MSW 进行数据操作：

1. **完整的 CRUD 操作**: 通过 MSW 拦截的 API 实现创建、读取、更新、删除
2. **自定义 Hooks**: 封装数据操作逻辑，提高代码质量
3. **TypeScript 支持**: 完整的类型安全
4. **最佳实践**: 包括错误处理、加载状态、用户反馈等

你可以直接使用这些组件和 Hooks，或根据自己的需求进行定制。
