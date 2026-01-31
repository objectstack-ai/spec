# @objectstack/cli

## Unreleased

### Major Changes

- **Plugin System Implementation**: Added comprehensive CLI plugin system
  - Created Zod-first plugin protocol schema (`@objectstack/spec/cli`)
  - Implemented `CLIPluginLoader` for dynamic plugin discovery and loading
  - Added plugin context with logger, config, and utility functions
  - Support for plugin discovery in global, local, and node_modules directories
  - Automatic command registration from plugins

### Minor Changes

- **Plugin Management Commands**: Added `plugin` command with subcommands:
  - `os plugin list` - List all discovered plugins with location badges
  - `os plugin info <name>` - Show detailed information about a plugin

### Features

- **Example Scaffold Plugin**: Created `@objectstack/cli-plugin-scaffold` demonstrating:
  - Project initialization (`os init`)
  - Code generation (`os generate object|view|app|plugin`)
  - Configuration management (`os config list|get|set`)

### Documentation

- Added comprehensive CLI Plugin Development Guide
- Updated CLI README with plugin system documentation
- Created example plugin with full TypeScript types

### Bug Fixes

- Fixed plugin discovery to properly handle symbolic links
- Improved error handling for invalid plugins

## 0.7.1

### Patch Changes

- Patch release for maintenance and stability improvements
- Updated dependencies
  - @objectstack/spec@0.7.1

## 0.6.1

### Patch Changes

- Patch release for maintenance and stability improvements
- Updated dependencies
  - @objectstack/spec@0.6.1

## 0.6.0

### Minor Changes

- b2df5f7: Unified version bump to 0.5.0

  - Standardized all package versions to 0.5.0 across the monorepo
  - Fixed driver-memory package.json paths for proper module resolution
  - Ensured all packages are in sync for the 0.5.0 release

### Patch Changes

- Updated dependencies [b2df5f7]
  - @objectstack/spec@0.6.0

## 0.4.2

### Patch Changes

- Unify all package versions to 0.4.2
- Updated dependencies
  - @objectstack/spec@0.4.2

## 0.1.1

### Patch Changes

- Updated dependencies
  - @objectstack/spec@0.4.1

## 0.1.1

### Patch Changes

- Updated dependencies
  - @objectstack/spec@0.4.0
