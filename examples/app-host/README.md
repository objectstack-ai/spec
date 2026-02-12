# ObjectStack Example Server

This is a reference implementation of the ObjectStack Server Protocol (Kernel).
It demonstrates how to build a metadata-driven backend that dynamically loads object definitions from plugins and automatically generates REST APIs.

## Features

- **Dynamic Schema Loading**: Loads `crm` and `todo` apps as plugins.
- **Unified Metadata API**: `/api/v1/meta/objects`
- **Unified Data API**: `/api/v1/data/:object` (CRUD)
- **Zero-Code Backend**: No creating routes or controllers per object.

## Setup

### Prerequisites
- Node.js 18+ and pnpm 8+

### Install & Run

1. Make sure all dependencies are installed in the workspace root:
   ```bash
   corepack enable && pnpm install
   ```

2. Run the server:
   ```bash
   pnpm dev
   # Expected: Server starts at http://localhost:3000
   ```

## API Usage Examples

### 1. Get All Objects
```bash
curl http://localhost:3000/api/v1/meta/objects
# Expected: JSON array of loaded object definitions
# Example: [{"name":"todo_task","label":"Task",...}, {"name":"account","label":"Account",...}]
```

### 2. Create a Todo
```bash
curl -X POST http://localhost:3000/api/v1/data/todo_task \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy Milk", "priority": "high"}'
# Expected: {"id":"<generated-id>","title":"Buy Milk","priority":"high",...}
```

### 3. List Todos
```bash
curl http://localhost:3000/api/v1/data/todo_task
# Expected: {"data":[{"id":"...","title":"Buy Milk","priority":"high",...}]}
```
