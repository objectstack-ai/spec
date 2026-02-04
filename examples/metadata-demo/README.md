# Metadata Management Demo

This example demonstrates how to use the `@objectstack/metadata` package to manage application metadata (Objects, Views, Flows, etc.).

## Key Features Demonstrated

1.  **Metadata Manager**: Initialization and configuration.
2.  **Loading**: Reading metadata from the filesystem (`json`, `yaml`, `ts`).
3.  **Saving API**:
    *   **Atomic Writes**: Safe file updates.
    *   **Backups**: Automatic `.bak` creation.
    *   **Format Control**: Saving as JSON or YAML.
4.  **Registry Pattern**: How the manager handles multiple loaders (FileSystem, etc.).

## Project Structure

```text
├── metadata/             # Metadata Repository
│   └── objects/          # Object Definitions
│       └── demo.object.json
├── src/
│   └── index.ts          # Demo Script
└── package.json
```

## Running the Demo

Make sure you have installed dependencies in the root workspace.

```bash
# Run the demo script
pnpm start
```

## Expected Output

The script will:
1. Load `demo_object` from JSON.
2. Add a timestamp description and save it back (creating a backup).
3. Create a new `generated_object` as a YAML file.
4. List all available objects.
