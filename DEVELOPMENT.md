# 开发调试测试指南 | Development, Debugging & Testing Guide

> **English** | [中文](#中文版)

## Quick Start

### Environment Setup

```bash
# Clone the repository
git clone https://github.com/objectstack-ai/spec.git
cd spec

# Install dependencies
pnpm install

# Build core packages
pnpm build

# Run health check
./scripts/dev.sh doctor
```

### Development Workflow

#### 1. Using the Development Helper Script

The `scripts/dev.sh` provides common development tasks:

```bash
# Setup development environment (first time)
./scripts/dev.sh setup

# Start watch mode for a package
./scripts/dev.sh dev spec          # Watch @objectstack/spec
./scripts/dev.sh dev cli           # Watch @objectstack/cli

# Build packages
./scripts/dev.sh build spec        # Build @objectstack/spec
./scripts/dev.sh build             # Build all packages

# Run tests
./scripts/dev.sh test spec         # Test @objectstack/spec
./scripts/dev.sh test              # Test all packages

# Check environment health
./scripts/dev.sh doctor

# Create new project from template
./scripts/dev.sh create plugin     # Create plugin (uses CLI)
./scripts/dev.sh create example    # Create example (uses CLI)

# Clean build artifacts
./scripts/dev.sh clean
```

#### 2. Using the ObjectStack CLI

```bash
# Build CLI first
pnpm --filter @objectstack/cli build

# Compile configuration to JSON
pnpm objectstack compile objectstack.config.ts dist/objectstack.json

# Start development mode
pnpm objectstack dev [package-name]

# Check environment health
pnpm objectstack doctor

# Create new project
pnpm objectstack create plugin my-plugin
pnpm objectstack create example my-app
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
# Method 1: Using CLI
pnpm objectstack create plugin my-feature

# Method 2: Using dev script
./scripts/dev.sh create plugin

# Then develop
cd packages/plugins/plugin-my-feature
pnpm install
pnpm dev
```

#### Creating a New Example

```bash
# Method 1: Using CLI
pnpm objectstack create example my-app

# Method 2: Using dev script  
./scripts/dev.sh create example

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
./scripts/dev.sh doctor
pnpm install
```

**Build errors:**
```bash
# Clean and rebuild
./scripts/dev.sh clean
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
./scripts/dev.sh doctor

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
./scripts/dev.sh doctor
```

### 开发工作流

#### 1. 使用开发辅助脚本

`scripts/dev.sh` 提供常用开发任务：

```bash
# 首次设置开发环境
./scripts/dev.sh setup

# 启动包的监听模式
./scripts/dev.sh dev spec          # 监听 @objectstack/spec
./scripts/dev.sh dev cli           # 监听 @objectstack/cli

# 构建包
./scripts/dev.sh build spec        # 构建 @objectstack/spec
./scripts/dev.sh build             # 构建所有包

# 运行测试
./scripts/dev.sh test spec         # 测试 @objectstack/spec
./scripts/dev.sh test              # 测试所有包

# 检查环境健康
./scripts/dev.sh doctor

# 从模板创建新项目
./scripts/dev.sh create plugin     # 创建插件（使用CLI）
./scripts/dev.sh create example    # 创建示例（使用CLI）

# 清理构建产物
./scripts/dev.sh clean
```

#### 2. 使用 ObjectStack CLI

```bash
# 首先构建CLI
pnpm --filter @objectstack/cli build

# 编译配置为JSON
pnpm objectstack compile objectstack.config.ts dist/objectstack.json

# 启动开发模式
pnpm objectstack dev [package-name]

# 检查环境健康
pnpm objectstack doctor

# 创建新项目
pnpm objectstack create plugin my-plugin
pnpm objectstack create example my-app
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
# 方法1：使用CLI
pnpm objectstack create plugin my-feature

# 方法2：使用开发脚本
./scripts/dev.sh create plugin

# 然后开发
cd packages/plugins/plugin-my-feature
pnpm install
pnpm dev
```

#### 创建新示例

```bash
# 方法1：使用CLI
pnpm objectstack create example my-app

# 方法2：使用开发脚本
./scripts/dev.sh create example

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
./scripts/dev.sh doctor
pnpm install
```

**构建错误：**
```bash
# 清理并重建
./scripts/dev.sh clean
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
./scripts/dev.sh doctor

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
├── scripts/            # Development scripts
│   └── dev.sh         # Main development helper
└── .vscode/           # VSCode configurations
    ├── launch.json    # Debug configurations
    ├── settings.json  # Editor settings
    └── extensions.json # Recommended extensions
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

1. Run `./scripts/dev.sh doctor` before submitting
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
