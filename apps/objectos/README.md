# ObjectOS

ObjectOS is the ObjectStack runtime — a metadata-driven backend that loads object definitions from app bundles and auto-generates REST APIs. This directory is the reference host configuration for running ObjectOS.

## Run Modes

ObjectOS supports four run modes, controlled by the `OS_CLOUD_URL` environment variable.

### 1. Local (Default)

Single-project, fully self-contained. No control plane, no network dependency. Data is stored in a local SQLite file at `.objectstack/data/app.db`.

```bash
pnpm dev
# Server → http://localhost:3000
# DB     → .objectstack/data/app.db (auto-created)
```

Best for: local development, quick prototyping, CI.

---

### 2. Local + External Control Plane

ObjectOS runtime connects to a locally-running `apps/cloud` instance as the control plane. Studio shows the full org / project / branch picker.

```bash
# Terminal 1 — start the control plane
pnpm --filter @objectstack/cloud dev

# Terminal 2 — start ObjectOS, pointing at local cloud
OS_CLOUD_URL=http://localhost:4000 pnpm dev
```

Best for: end-to-end multi-project development.

---

### 3. Cloud (Hosted Control Plane)

ObjectOS runtime connects to the hosted ObjectStack Cloud control plane. Projects, credentials, and artifact resolution are all managed remotely.

```bash
OS_CLOUD_URL=https://cloud.objectstack.ai \
OS_CLOUD_API_KEY=osk_... \
pnpm dev
```

Best for: production deployments, staging environments.

---

### 4. Preview / Demo Mode

Bypass login entirely — the runtime auto-simulates an admin session. Designed for demos and marketplace previews. **Never use in production.**

```bash
OS_MODE=preview pnpm dev
```

Behavior:
- Login / registration pages are hidden
- Admin session is created automatically
- A preview banner is shown in the UI

---

## Environment Variables

### Runtime

| Variable | Default | Description |
|:---|:---|:---|
| `OS_CLOUD_URL` | `local` | `local` = standalone; URL = connect to that control plane |
| `OS_CLOUD_API_KEY` | — | API key when connecting to a remote control plane |
| `OS_ARTIFACT_PATH` | `dist/objectstack.json` | Path to the compiled app artifact |
| `OS_MODE` | — | `standalone` (default), `runtime`, `cloud`, or `preview` |

### Database (Local / Standalone mode)

| Variable | Default | Description |
|:---|:---|:---|
| `OS_DATABASE_URL` | `.objectstack/data/app.db` | SQLite file path, `libsql://`, or `http(s)://` |
| `OS_DATABASE_AUTH_TOKEN` | — | Auth token for libSQL / Turso |

Supported `OS_DATABASE_URL` formats:

| Value | Driver |
|:---|:---|
| unset | SQLite — `.objectstack/data/app.db` |
| `file:<path>` | SQLite at that path |
| `libsql://host` | libSQL / Turso |
| `http(s)://host` | libSQL over HTTP (sqld) |

### Kernel Tuning

| Variable | Default | Description |
|:---|:---|:---|
| `OS_KERNEL_CACHE_SIZE` | `32` | LRU size for per-project kernel instances |
| `OS_KERNEL_TTL_MS` | `900000` | Idle eviction TTL (ms) |
| `AUTH_SECRET` | — | Better Auth session secret (≥ 32 chars, required in production) |

---

## Quick Start

```bash
# Install workspace dependencies (run once from repo root)
corepack enable && pnpm install

# Start in local mode (default)
pnpm dev

# Start with Turso as the control-plane database
OS_DATABASE_URL=libsql://your-db.turso.io \
OS_DATABASE_AUTH_TOKEN=your-token \
AUTH_SECRET=$(openssl rand -hex 32) \
pnpm dev
```

---

## Build & Deploy

```bash
# Build the compiled artifact
pnpm build

# Serve the pre-built artifact (production)
pnpm start
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/objectstack-ai/framework/tree/main/apps/objectos&project-name=objectos&repository-name=objectos)

The `api/` directory contains the Vercel serverless handler. Set the environment variables above in the Vercel project settings.

---

## API

### Metadata

```bash
# List all loaded objects
curl http://localhost:3000/api/v1/meta/objects
```

### Data (CRUD)

```bash
# Create
curl -X POST http://localhost:3000/api/v1/data/todo_task \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy Milk", "priority": "high"}'

# List
curl http://localhost:3000/api/v1/data/todo_task

# Get one
curl http://localhost:3000/api/v1/data/todo_task/<id>

# Update
curl -X PATCH http://localhost:3000/api/v1/data/todo_task/<id> \
  -H "Content-Type: application/json" \
  -d '{"priority": "low"}'

# Delete
curl -X DELETE http://localhost:3000/api/v1/data/todo_task/<id>
```
