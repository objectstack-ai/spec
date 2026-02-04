# @objectstack/cli

Command Line Interface for developing ObjectStack applications.

## Commands

- **`os serve`**: Start the backend server.
  - Auto-detects configuration.
  - Auto-loads `ObjectQL` and `InMemoryDriver` if not specified.
- **`os dev`**: Start in development mode (with watch).
- **`os doctor`**: Check environment health.
- **`os create`**: Scaffold new projects.

## Configuration

The CLI looks for `objectstack.config.ts` in the current directory.

```typescript
// objectstack.config.ts
export default {
    metadata: { ... },
    plugins: [ ... ]
}
```
