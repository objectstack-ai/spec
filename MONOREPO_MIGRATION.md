# Monorepo Migration Guide

## Overview

This document explains the migration from a single package (`@objectstack/spec`) to a monorepo structure with multiple packages.

## New Structure

The repository is now organized as a pnpm workspace with the following packages:

### 📦 Packages

```
packages/
├── constants/          # @objectstack/spec-constants
├── meta/               # @objectstack/spec-meta
├── plugin/             # @objectstack/spec-plugin
├── schemas/            # @objectstack/spec-schemas
└── spec/               # @objectstack/spec (main package)
```

### Package Descriptions

1. **@objectstack/spec-meta** - Metamodel Type Definitions
   - Contains: `ObjectEntity`, `ObjectField`, `ObjectView`, `FieldType`
   - Also includes: Example entities and views
   - Dependencies: None

2. **@objectstack/spec-plugin** - Plugin Runtime Interfaces
   - Contains: `ObjectStackPlugin`, `PluginContext`, `PluginLogger`, etc.
   - Dependencies: None

3. **@objectstack/spec-schemas** - Zod Validation Schemas
   - Contains: `ManifestSchema`, `MenuItemSchema`
   - Dependencies: `zod`

4. **@objectstack/spec-constants** - Convention Constants
   - Contains: `PKG_CONVENTIONS`
   - Dependencies: None

5. **@objectstack/spec** - Main Package (Aggregator)
   - Re-exports all sub-packages for backward compatibility
   - Dependencies: All other packages (workspace:*)

## Migration Benefits

### 1. **Smaller Bundle Sizes**
Users can now install only the packages they need:
```bash
# Instead of installing the entire spec
pnpm install @objectstack/spec

# Install only what you need
pnpm install @objectstack/spec-meta
```

### 2. **Better Organization**
Each package has a clear responsibility and can evolve independently.

### 3. **Backward Compatibility**
The main `@objectstack/spec` package maintains full backward compatibility by re-exporting all sub-packages.

### 4. **Independent Versioning**
Each package can be versioned independently (though currently linked via changesets).

## Usage

### For Existing Users (No Breaking Changes)

```typescript
// This still works exactly as before
import { 
  ObjectEntity,
  ManifestSchema,
  PKG_CONVENTIONS
} from '@objectstack/spec';
```

### For New Users (Optimized Imports)

```typescript
// Import only what you need for smaller bundles
import { ObjectEntity } from '@objectstack/spec-meta';
import { ManifestSchema } from '@objectstack/spec-schemas';
import { PKG_CONVENTIONS } from '@objectstack/spec-constants';
```

## Development

### Building

```bash
# Build all packages
pnpm run build

# Build a specific package
cd packages/meta && pnpm run build
```

### Development Mode

```bash
# Watch all packages
pnpm run dev

# Watch a specific package
cd packages/meta && pnpm run dev
```

### Adding a New Package

1. Create a new directory in `packages/`
2. Create `package.json`, `tsconfig.json`, and `README.md`
3. Add the package to `.changeset/config.json` linked array
4. Add dependencies in `packages/spec/package.json` if needed

## Publishing

The monorepo uses Changesets for version management and publishing:

```bash
# Create a changeset
pnpm changeset

# Version packages
pnpm run version

# Publish packages
pnpm run release
```

## CI/CD

The existing GitHub Actions workflows have been updated to work with the monorepo:
- **CI**: Builds all packages
- **Release**: Publishes all packages with changesets

## File Structure

```
.
├── packages/
│   ├── constants/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   ├── meta/
│   ├── plugin/
│   ├── schemas/
│   └── spec/
├── content/              # Documentation and AI guides
├── .changeset/           # Changeset configuration
├── pnpm-workspace.yaml   # Workspace configuration
├── package.json          # Root package.json
├── tsconfig.json         # Base TypeScript configuration
└── README.md             # Main README
```

## Technical Details

### Workspace Configuration

- **Package Manager**: pnpm (v10.28.0)
- **Workspace Protocol**: `workspace:*` for internal dependencies
- **Build Tool**: TypeScript Compiler (tsc)
- **Version Management**: Changesets

### TypeScript Configuration

- Each package extends the root `tsconfig.json`
- All packages compile to `dist/` directory
- Declaration maps are generated for better IDE support

### Publishing Configuration

- All packages are published to npm with `public` access
- Each package includes only `dist/` and `README.md` files
- Workspace dependencies are replaced with actual versions during publish

## Migration Checklist

- [x] Created monorepo structure
- [x] Split code into logical packages
- [x] Updated all imports and exports
- [x] Configured pnpm workspace
- [x] Updated build scripts
- [x] Added package READMEs
- [x] Updated root README
- [x] Configured changesets for monorepo
- [x] Verified backward compatibility
- [x] Tested all builds
- [x] Updated CI/CD workflows

## Support

For issues or questions about the monorepo structure, please:
1. Check this migration guide
2. Review individual package READMEs
3. Open an issue on GitHub
