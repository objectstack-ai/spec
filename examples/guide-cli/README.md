# CLI Usage Example

This example demonstrates how to use the `@objectstack/cli` to develop, serve, and debug an ObjectStack project.

## Scripts

The `package.json` includes several useful scripts:

- `pnpm dev`: Starts the development server in watch mode.
- `pnpm serve`: Starts the production server.
- `pnpm build`: Compiles the project.
- `pnpm doctor`: Checks for issues.
- `pnpm debug`: Starts the server in debug mode (breaking at the first line).

## Debugging in VS Code

To debug this project using VS Code:

1. Open the Javascript Debug Terminal.
2. Run `pnpm dev` or `pnpm serve`.

### Using Launch Configuration

You can also use a launch configuration. Add this to your `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug CLI Usage Example",
      "cwd": "${workspaceFolder}/examples/cli-usage",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["debug"],
      "port": 9229
    }
  ]
}
```

## Project Structure

- `src/project.object.ts`: Defines a simple "Project" object.
- `objectstack.config.ts`: Registers the object and imports plugins from other examples.

## Plugins Integration

This example demonstrates how to compose multiple plugins:

1.  **NPM Package Plugin**: `@objectstack/plugin-bi` is installed via workspace dependency.
2.  **Local Config Plugin**: `CRMPlugin` is imported directly from `../plugin-advanced-crm/objectstack.config.ts`.


