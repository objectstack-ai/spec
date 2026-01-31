# 开发调试测试指南 | Development, Debugging & Testing Guide

> **English** | [中文](#中文版)

## Quick Start

### Environment Setup

```bash
# Clone the repository
git clone https://github.com/objectstack-ai/spec.git
cd spec

# Install dependencies and setup (one-time)
pnpm setup

# Run health check
pnpm doctor
```

### Development Workflow

#### Using the ObjectStack CLI

```bash
# Build CLI first (if not built)
pnpm --filter @objectstack/cli build

# Compile configuration to JSON
pnpm objectstack compile objectstack.config.ts dist/objectstack.json

# Start development mode (watch mode for packages)
pnpm objectstack dev [package-name]

# Check environment health
pnpm objectstack doctor

# Create new project
pnpm objectstack create plugin my-plugin
pnpm objectstack create example my-app
```

#### Common npm Shortcuts

```bash
# One-time setup
pnpm setup              # Install dependencies and build core packages

# Development
pnpm dev                # Start development mode (default: msw-react-crud example)
pnpm build              # Build all packages
pnpm test               # Run tests

# Diagnostics
pnpm doctor             # Check environment health

# Cleanup
pnpm clean              # Clean build artifacts
```

### Package Development

#### Working on @objectstack/spec

```bash
# Watch mode (auto-rebuild on changes)
cd packages/spec
pnpm dev

# Run tests in watch mode
pnpm test:watch

# Generate schemas and docs
pnpm gen:schema
pnpm gen:docs
```

#### Creating a New Plugin

```bash
# Using CLI
pnpm objectstack create plugin my-feature

# Then develop
cd packages/plugins/plugin-my-feature
pnpm install
pnpm dev
```

#### Creating a New Example

```bash
# Using CLI
pnpm objectstack create example my-app

# Then develop
cd examples/my-app
pnpm install
pnpm build
```

### Testing

#### Unit Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @objectstack/spec test

# Watch mode
pnpm --filter @objectstack/spec test:watch

# Coverage report
pnpm --filter @objectstack/spec test:coverage
```

#### Integration Tests

```bash
# Test CRM example
cd examples/crm
pnpm build
pnpm test
```

### Debugging

#### VSCode Debugging

Pre-configured launch configurations are available in `.vscode/launch.json`:

1. **Debug Current TypeScript File** - Debug any .ts file
2. **Debug @objectstack/spec Tests** - Debug spec tests
3. **Debug CLI (compile)** - Debug compile command
4. **Debug CLI (doctor)** - Debug doctor command
5. **Debug Example (CRM)** - Debug CRM example

**To use:**
1. Open the file you want to debug
2. Press `F5` or go to Run & Debug panel
3. Select the appropriate configuration
4. Set breakpoints and debug

#### Command Line Debugging

```bash
# Debug with tsx
tsx --inspect packages/cli/src/bin.ts doctor

# Debug with node
node --inspect $(which tsx) packages/cli/src/bin.ts compile
```

#### Logging

```bash
# Enable verbose logging
DEBUG=* pnpm build

# Package-specific logging
DEBUG=objectstack:* pnpm build
```

### Common Tasks

#### Adding a New Protocol Schema

```typescript
// 1. Create schema file: packages/spec/src/data/my-schema.zod.ts
import { z } from 'zod';

/**
 * My new schema
 * @description Detailed description of the schema
 */
export const MySchema = z.object({
  /** Field description */
  name: z.string().describe('Machine name (snake_case)'),
  
  /** Another field */
  value: z.number().optional().describe('Optional value'),
});

export type MyType = z.infer<typeof MySchema>;

// 2. Export from index
// packages/spec/src/data/index.ts
export * from './my-schema.zod.js';

// 3. Build to generate JSON schema
pnpm --filter @objectstack/spec build
```

#### Running Specific Package Commands

```bash
# Filter by package name
pnpm --filter @objectstack/spec <command>
pnpm --filter @objectstack/cli <command>

# Filter pattern (all plugins)
pnpm --filter "@objectstack/plugin-*" build

# Run in all packages
pnpm -r <command>

# Run in parallel
pnpm -r --parallel <command>
```

### Performance Tips

1. **Incremental Builds**: Use watch mode (`pnpm dev`) during development
2. **Selective Testing**: Test only changed packages
3. **Parallel Execution**: Use `--parallel` for independent tasks
4. **Filter Packages**: Use `--filter` to target specific packages

### Troubleshooting

#### Common Issues

**Dependencies not installed:**
```bash
pnpm doctor
pnpm install
```

**Build errors:**
```bash
# Clean and rebuild
pnpm clean
pnpm build
```

**Type errors:**
```bash
# Ensure spec is built first
pnpm --filter @objectstack/spec build
```

**Watch mode not working:**
```bash
# Kill existing processes
pkill -f "tsc --watch"
# Restart
pnpm dev
```

#### Getting Help

```bash
# Check environment
pnpm doctor

# CLI help
pnpm objectstack --help
pnpm objectstack <command> --help
```

---

## 中文版

## 快速开始

### 环境设置

```bash
# 克隆仓库
git clone https://github.com/objectstack-ai/spec.git
cd spec

# 安装依赖
pnpm install

# 构建核心包
pnpm build

# 运行健康检查
pnpm doctor
```

### 开发工作流

#### 使用 ObjectStack CLI

```bash
# 首先构建CLI（如未构建）
pnpm --filter @objectstack/cli build

# 编译配置为JSON
pnpm objectstack compile objectstack.config.ts dist/objectstack.json

# 启动开发模式（包的监听模式）
pnpm objectstack dev [package-name]

# 检查环境健康
pnpm objectstack doctor

# 创建新项目
pnpm objectstack create plugin my-plugin
pnpm objectstack create example my-app
```

#### 常用 npm 快捷命令

```bash
# 一次性设置
pnpm setup              # 安装依赖并构建核心包

# 开发
pnpm dev                # 启动开发模式（默认：msw-react-crud示例）
pnpm build              # 构建所有包
pnpm test               # 运行测试

# 诊断
pnpm doctor             # 检查环境健康

# 清理
pnpm clean              # 清理构建产物
```

### 包开发

#### 开发 @objectstack/spec

```bash
# 监听模式（更改时自动重建）
cd packages/spec
pnpm dev

# 测试监听模式
pnpm test:watch

# 生成schemas和文档
pnpm gen:schema
pnpm gen:docs
```

#### 创建新插件

```bash
# 使用CLI
pnpm objectstack create plugin my-feature

# 然后开发
cd packages/plugins/plugin-my-feature
pnpm install
pnpm dev
```

#### 创建新示例

```bash
# 使用CLI
pnpm objectstack create example my-app

# 然后开发
cd examples/my-app
pnpm install
pnpm build
```

### 测试

#### 单元测试

```bash
# 运行所有测试
pnpm test

# 运行特定包的测试
pnpm --filter @objectstack/spec test

# 监听模式
pnpm --filter @objectstack/spec test:watch

# 覆盖率报告
pnpm --filter @objectstack/spec test:coverage
```

#### 集成测试

```bash
# 测试CRM示例
cd examples/crm
pnpm build
pnpm test
```

### 调试

#### VSCode 调试

`.vscode/launch.json` 中预配置了启动配置：

1. **Debug Current TypeScript File** - 调试任何 .ts 文件
2. **Debug @objectstack/spec Tests** - 调试 spec 测试
3. **Debug CLI (compile)** - 调试 compile 命令
4. **Debug CLI (doctor)** - 调试 doctor 命令
5. **Debug Example (CRM)** - 调试 CRM 示例

**使用方法：**
1. 打开要调试的文件
2. 按 `F5` 或转到运行与调试面板
3. 选择适当的配置
4. 设置断点并调试

#### 命令行调试

```bash
# 使用 tsx 调试
tsx --inspect packages/cli/src/bin.ts doctor

# 使用 node 调试
node --inspect $(which tsx) packages/cli/src/bin.ts compile
```

#### 日志记录

```bash
# 启用详细日志
DEBUG=* pnpm build

# 特定包的日志
DEBUG=objectstack:* pnpm build
```

### 常见任务

#### 添加新的协议Schema

```typescript
// 1. 创建schema文件: packages/spec/src/data/my-schema.zod.ts
import { z } from 'zod';

/**
 * 我的新schema
 * @description schema的详细描述
 */
export const MySchema = z.object({
  /** 字段描述 */
  name: z.string().describe('机器名称 (snake_case)'),
  
  /** 另一个字段 */
  value: z.number().optional().describe('可选值'),
});

export type MyType = z.infer<typeof MySchema>;

// 2. 从index导出
// packages/spec/src/data/index.ts
export * from './my-schema.zod.js';

// 3. 构建生成JSON schema
pnpm --filter @objectstack/spec build
```

#### 运行特定包命令

```bash
# 按包名过滤
pnpm --filter @objectstack/spec <command>
pnpm --filter @objectstack/cli <command>

# 过滤模式（所有插件）
pnpm --filter "@objectstack/plugin-*" build

# 在所有包中运行
pnpm -r <command>

# 并行运行
pnpm -r --parallel <command>
```

### 性能技巧

1. **增量构建**: 开发期间使用监听模式 (`pnpm dev`)
2. **选择性测试**: 只测试变更的包
3. **并行执行**: 对独立任务使用 `--parallel`
4. **过滤包**: 使用 `--filter` 针对特定包

### 问题排查

#### 常见问题

**依赖未安装：**
```bash
pnpm doctor
pnpm install
```

**构建错误：**
```bash
# 清理并重建
pnpm clean
pnpm build
```

**类型错误：**
```bash
# 确保先构建spec
pnpm --filter @objectstack/spec build
```

**监听模式不工作：**
```bash
# 终止现有进程
pkill -f "tsc --watch"
# 重启
pnpm dev
```

#### 获取帮助

```bash
# 检查环境
pnpm doctor

# CLI帮助
pnpm objectstack --help
pnpm objectstack <command> --help
```

---

## Architecture Overview

### Monorepo Structure

```
spec/
├── packages/              # Core packages
│   ├── spec/             # Protocol definitions (Zod schemas)
│   ├── cli/              # Command-line tools
│   ├── objectql/         # Query engine
│   ├── client/           # Client SDK
│   ├── client-react/     # React hooks
│   └── plugins/          # Plugin implementations
│       ├── driver-memory/
│       ├── plugin-hono-server/
│       └── plugin-msw/
├── examples/             # Example applications
│   ├── crm/             # Full CRM example
│   ├── todo/            # Simple todo example
│   └── ...
├── apps/                # Applications
│   └── docs/           # Documentation site
└── packages/cli/        # Command-line tools
    ├── src/commands/   # CLI commands (dev, doctor, create, compile)
    └── bin/           # Executable entry points
```

### Package Dependencies

```
@objectstack/spec (Foundation - Zod schemas)
    ↓
@objectstack/cli (Uses spec for validation)
    ↓
@objectstack/objectql (Uses spec for types)
    ↓
@objectstack/client (Uses objectql)
    ↓
@objectstack/client-react (Uses client)
```

### Build Order

1. `@objectstack/spec` - Must build first (provides types)
2. `@objectstack/cli` - Can build after spec
3. Other packages - Can build in parallel after spec
4. Examples - Build last

---

## Best Practices

### Code Organization

1. **Zod First**: Always define schemas with Zod first
2. **Type Derivation**: Use `z.infer<typeof Schema>` for types
3. **Naming Conventions**:
   - Config keys: `camelCase` (e.g., `maxLength`)
   - Data values: `snake_case` (e.g., `project_task`)
4. **Documentation**: Add JSDoc comments with `@description`

### Testing

1. Co-locate tests with source files (`*.test.ts`)
2. Target 80%+ code coverage
3. Use descriptive test names
4. Test both success and error cases

### Commits

1. Use conventional commits format
2. Reference issues in commit messages
3. Keep changes focused and minimal

### Pull Requests

1. Run `pnpm doctor` before submitting
2. Ensure all tests pass
3. Update documentation if needed
4. Follow the PR template

---

## Resources

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Detailed contribution guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture documentation
- [Package Dependencies](./PACKAGE-DEPENDENCIES.md) - Dependency graph
- [Quick Reference](./QUICK-REFERENCE.md) - API quick reference

---

## License

Apache 2.0 © ObjectStack
