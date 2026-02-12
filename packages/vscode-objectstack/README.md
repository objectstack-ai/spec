# ObjectStack for Visual Studio Code

> Autocomplete, validation, and inline diagnostics for ObjectStack Protocol files.

## Features

- **Snippets** — Quickly scaffold objects, fields, views, flows, agents, and full `defineStack` configs with `os-` prefixed snippets.
- **Hover Documentation** — Hover over `defineStack`, `defineView`, field types (`text`, `lookup`, `select`, etc.) to see inline descriptions.
- **Diagnostics** — Real-time warnings for common mistakes:
  - Missing `manifest` in `defineStack()`
  - camelCase names that should be `snake_case`
- **Config File Watching** — Automatically re-validates when `objectstack.config.ts` changes.
- **JSON Schema Validation** — Validates `objectstack.json` files against the bundled schema.
- **Quick Fix Stubs** — Code action provider for quick fixes (add missing label, convert to snake_case).

## Snippets

| Prefix | Description |
|--------|-------------|
| `os-object` | Define a new business object |
| `os-field-text` | Add a text field |
| `os-field-select` | Add a select (picklist) field |
| `os-field-lookup` | Add a lookup (reference) field |
| `os-view-grid` | Define a grid list view |
| `os-flow` | Define an automation flow |
| `os-stack` | Full `defineStack` boilerplate |
| `os-agent` | Define an AI agent |

## Installation

### From Source

```bash
cd packages/vscode-objectstack
npm install
npm run build
npm run package
# Install the generated .vsix file in VSCode
```

### From Marketplace (Coming Soon)

Search for "ObjectStack" in the VSCode Extensions marketplace.

## Usage

1. Open a project containing `objectstack.config.ts`
2. The extension activates automatically for `.object.ts`, `.view.ts`, and `objectstack.config.ts` files
3. Start typing `os-` to see available snippets
4. Hover over ObjectStack keywords for inline documentation

## Supported File Types

| Pattern | Description |
|---------|-------------|
| `*.object.ts` | Business object definitions |
| `*.view.ts` | View configurations (list, form, kanban) |
| `objectstack.config.ts` | Stack configuration file |
| `objectstack.json` | JSON configuration (with schema validation) |

## Development

```bash
# Build the extension
npm run build

# Watch for changes
npm run watch

# Package as .vsix
npm run package
```

## Requirements

- VSCode 1.85.0 or later
- TypeScript project using `@objectstack/spec`

## License

Apache-2.0 — see [LICENSE](../../LICENSE) for details.
