# ObjectStack Cloud Project - Quick Start Implementation Guide
# ObjectStack 云项目 - 快速实施指南

> **目标读者**: 技术负责人、开发团队  
> **用途**: 快速启动项目的实操指南  
> **时间**: 按照本指南可在 2 小时内完成基础环境搭建

---

## 🚀 第一天：基础设施搭建 (2-4 小时)

### Step 1: GitHub 仓库设置 (30 分钟)

```bash
# 1. 创建仓库 (使用 GitHub CLI)
gh repo create objectstack-ai/platform \
  --public \
  --description "ObjectStack Enterprise Management Platform" \
  --gitignore Node \
  --license apache-2.0

# 2. 克隆仓库
git clone https://github.com/objectstack-ai/platform.git
cd platform

# 3. 创建分支保护规则
gh api repos/objectstack-ai/platform/branches/main/protection \
  -X PUT \
  -f required_status_checks='{"strict":true,"contexts":["ci"]}' \
  -f required_pull_request_reviews='{"required_approving_review_count":1}' \
  -f enforce_admins=false \
  -f restrictions=null
```

**配置文件**:

创建 `.github/CODEOWNERS`:
```
* @objectstack-ai/core-team
/packages/spec/** @objectstack-ai/protocol-team
```

创建 `.github/pull_request_template.md`:
```markdown
## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构

## 测试
- [ ] 单元测试通过
- [ ] 本地测试完成

## 相关 Issue
Closes #
```

### Step 2: Vercel 项目配置 (30 分钟)

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录并链接项目
vercel login
vercel link

# 3. 配置环境变量
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
vercel env add NEXTAUTH_SECRET production

# 4. 部署
vercel --prod
```

**`vercel.json` 配置**:
```json
{
  "buildCommand": "pnpm run build",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1", "fra1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "REDIS_URL": "@redis-url"
  }
}
```

### Step 3: 数据库创建 (30 分钟)

**PostgreSQL (使用 Neon)**:

```bash
# 1. 访问 https://neon.tech
# 2. 创建新项目: objectstack-platform
# 3. 复制连接字符串

# 示例连接字符串
postgresql://user:password@ep-xx.us-east-2.aws.neon.tech/objectstack
```

**Redis (使用 Upstash)**:

```bash
# 1. 访问 https://console.upstash.com
# 2. 创建新数据库: objectstack-cache
# 3. 选择区域: US East
# 4. 复制连接字符串

# 示例连接字符串
rediss://default:password@global-example.upstash.io:6379
```

**初始化数据库**:

```sql
-- 执行 Schema 创建
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE object_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  label VARCHAR(255) NOT NULL,
  schema JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Step 4: CI/CD 配置 (30-60 分钟)

创建 `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm run lint
      - run: pnpm run test
      - run: pnpm run build
```

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - run: npm i -g vercel
      
      - run: vercel pull --yes --token=${{ secrets.VERCEL_TOKEN }}
      - run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      - run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🛠️ 第二天：本地开发环境 (2-3 小时)

### Step 1: 项目初始化 (30 分钟)

```bash
# 1. 创建 pnpm workspace
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'packages/*'
  - 'apps/*'
  - 'examples/*'
EOF

# 2. 创建根 package.json
cat > package.json << 'EOF'
{
  "name": "objectstack",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
EOF

# 3. 安装依赖
pnpm install
```

### Step 2: 创建核心包结构 (30 分钟)

```bash
# 创建目录结构
mkdir -p packages/{spec,core,objectql,runtime,cli}
mkdir -p apps/{platform,docs}

# 创建 spec 包
cd packages/spec
pnpm init
cat > package.json << 'EOF'
{
  "name": "@objectstack/spec",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --dts",
    "dev": "tsup src/index.ts --dts --watch",
    "test": "vitest"
  },
  "dependencies": {
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "tsup": "^8.0.1",
    "vitest": "^1.0.4"
  }
}
EOF

# 创建核心导出
mkdir -p src
cat > src/index.ts << 'EOF'
// 导出所有协议
export * from './data/object.zod';
export * from './data/field.zod';
export * from './ui/app.zod';
export * from './api/contract.zod';
export * from './integration/connector/github.zod';
export * from './integration/connector/vercel.zod';
export * from './ai/devops-agent.zod';
EOF

pnpm install
pnpm run build
```

### Step 3: 创建 Next.js 应用 (30 分钟)

```bash
cd apps
pnpx create-next-app@latest platform \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd platform

# 安装依赖
pnpm add @objectstack/spec
pnpm add next-auth prisma @prisma/client
pnpm add zod react-hook-form @hookform/resolvers

# 初始化 Prisma
pnpx prisma init
```

**配置 `.env.local`**:
```bash
# 数据库
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-min-32-chars"

# GitHub OAuth
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

**创建 Prisma Schema** (`prisma/schema.prisma`):
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("users")
}

model ObjectDefinition {
  id        String   @id @default(uuid())
  name      String   @unique
  label     String
  schema    Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("object_definitions")
}
```

**运行迁移**:
```bash
pnpx prisma migrate dev --name init
pnpx prisma generate
```

### Step 4: 实现基础认证 (45 分钟)

**`src/app/api/auth/[...nextauth]/route.ts`**:
```typescript
import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
```

**`src/lib/prisma.ts`**:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Step 5: 创建基础 API (45 分钟)

**`src/app/api/objects/route.ts`**:
```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { ObjectDefinitionSchema } from '@objectstack/spec';

// GET /api/objects - 列出所有对象
export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const objects = await prisma.objectDefinition.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(objects);
}

// POST /api/objects - 创建对象
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // 使用 Zod 验证
    const validated = ObjectDefinitionSchema.parse(body);
    
    const object = await prisma.objectDefinition.create({
      data: {
        name: validated.name,
        label: validated.label,
        schema: validated as any,
      },
    });

    return NextResponse.json(object, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

**测试 API**:
```bash
# 启动开发服务器
pnpm run dev

# 测试 API (需要先登录)
curl -X GET http://localhost:3000/api/objects \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# 创建对象
curl -X POST http://localhost:3000/api/objects \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "name": "project",
    "label": "Project",
    "fields": {}
  }'
```

---

## 📊 第三天：验证与测试 (2-3 小时)

### Step 1: 编写单元测试 (60 分钟)

**`packages/spec/src/data/object.test.ts`**:
```typescript
import { describe, it, expect } from 'vitest';
import { ObjectDefinitionSchema } from './object.zod';

describe('ObjectDefinitionSchema', () => {
  it('should validate a valid object definition', () => {
    const validObject = {
      name: 'project',
      label: 'Project',
      fields: {},
    };

    const result = ObjectDefinitionSchema.safeParse(validObject);
    expect(result.success).toBe(true);
  });

  it('should reject invalid name (not snake_case)', () => {
    const invalidObject = {
      name: 'ProjectName',
      label: 'Project',
      fields: {},
    };

    const result = ObjectDefinitionSchema.safeParse(invalidObject);
    expect(result.success).toBe(false);
  });

  it('should reject missing required fields', () => {
    const invalidObject = {
      name: 'project',
    };

    const result = ObjectDefinitionSchema.safeParse(invalidObject);
    expect(result.success).toBe(false);
  });
});
```

**运行测试**:
```bash
cd packages/spec
pnpm run test
```

### Step 2: 集成测试 (60 分钟)

**`apps/platform/__tests__/api/objects.test.ts`**:
```typescript
import { describe, it, expect, beforeAll } from 'vitest';

describe('Objects API', () => {
  let authToken: string;

  beforeAll(async () => {
    // 获取测试用户 token
    // TODO: 实现测试认证
  });

  it('GET /api/objects should return objects list', async () => {
    const response = await fetch('http://localhost:3000/api/objects', {
      headers: {
        Cookie: `next-auth.session-token=${authToken}`,
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('POST /api/objects should create new object', async () => {
    const newObject = {
      name: 'test_object',
      label: 'Test Object',
      fields: {},
    };

    const response = await fetch('http://localhost:3000/api/objects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `next-auth.session-token=${authToken}`,
      },
      body: JSON.stringify(newObject),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.name).toBe('test_object');
  });
});
```

### Step 3: 端到端测试 (60 分钟)

**安装 Playwright**:
```bash
cd apps/platform
pnpm add -D @playwright/test
pnpx playwright install
```

**`e2e/login.spec.ts`**:
```typescript
import { test, expect } from '@playwright/test';

test('user can login with GitHub', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // 点击登录按钮
  await page.click('text=Sign in');
  
  // 等待重定向到 GitHub
  await page.waitForURL(/github\.com/);
  
  // TODO: 完成 OAuth 流程测试
});

test('authenticated user can view objects', async ({ page, context }) => {
  // 设置认证 cookie
  await context.addCookies([{
    name: 'next-auth.session-token',
    value: 'test-token',
    domain: 'localhost',
    path: '/',
  }]);

  await page.goto('http://localhost:3000/objects');
  
  // 验证对象列表显示
  await expect(page.locator('h1')).toContainText('Objects');
});
```

**运行 E2E 测试**:
```bash
pnpm exec playwright test
```

---

## ✅ 验收检查清单

### 基础设施 (Day 1)

- [ ] GitHub 仓库已创建并配置分支保护
- [ ] Vercel 项目可以自动部署
- [ ] PostgreSQL 数据库已创建并可连接
- [ ] Redis 缓存已配置
- [ ] CI/CD Pipeline 运行正常
- [ ] 环境变量已正确配置

### 开发环境 (Day 2)

- [ ] 本地开发环境可在 30 分钟内搭建完成
- [ ] 所有包可以成功构建
- [ ] Next.js 应用可以启动
- [ ] 数据库迁移成功执行
- [ ] GitHub OAuth 认证正常工作
- [ ] 基础 API 端点响应正常

### 测试 (Day 3)

- [ ] 单元测试覆盖率 > 80%
- [ ] 集成测试通过
- [ ] E2E 测试覆盖核心流程
- [ ] 所有 lint 检查通过
- [ ] 类型检查无错误

---

## 🎯 下一步行动

完成以上步骤后，你已经有了一个可运行的基础框架。接下来：

### Week 2-3: 核心功能开发
```bash
1. 实现对象定义完整 CRUD
2. 开发字段类型系统
3. 实现验证规则引擎
4. 创建 GraphQL API
```

### Week 4-5: UI 开发
```bash
1. 创建对象管理界面
2. 实现表单生成器
3. 开发数据表格组件
4. 构建仪表板
```

### Week 6+: AI 功能
```bash
1. 集成 DevOps Agent
2. 实现 RAG Pipeline
3. 开发 NLQ 功能
```

---

## 📚 有用的命令参考

```bash
# 开发
pnpm run dev              # 启动所有服务
pnpm run dev:platform     # 只启动平台应用
pnpm run build            # 构建所有包

# 测试
pnpm run test             # 运行所有测试
pnpm run test:watch       # 监听模式
pnpm run test:e2e         # 运行 E2E 测试

# 数据库
pnpx prisma studio        # 打开数据库管理界面
pnpx prisma migrate dev   # 创建迁移
pnpx prisma generate      # 生成客户端

# 部署
vercel                    # 部署预览
vercel --prod             # 部署生产环境

# 代码质量
pnpm run lint             # 运行 ESLint
pnpm run type-check       # 类型检查
pnpm run format           # 格式化代码
```

---

## 🆘 常见问题

### Q: 数据库连接失败
```bash
# 检查连接字符串
echo $DATABASE_URL

# 测试连接
pnpx prisma db pull
```

### Q: Vercel 部署失败
```bash
# 查看构建日志
vercel logs

# 本地测试构建
pnpm run build
```

### Q: 认证不工作
```bash
# 检查环境变量
cat .env.local | grep GITHUB

# 验证 NextAuth 配置
curl http://localhost:3000/api/auth/providers
```

---

**最后更新**: 2026-02-04  
**维护者**: ObjectStack DevOps Team  
**获取帮助**: [GitHub Discussions](https://github.com/objectstack-ai/spec/discussions)
