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

#### Serving a compiled app bundle locally

Point ObjectOS at a third-party app bundle compiled by `objectstack build` (e.g. `examples/app-crm`). The bundle is a JSON file plus a sibling `objectstack-runtime.<hash>.mjs` that carries the compiled hook handlers; both are loaded automatically.

```bash
# Build the example app once
pnpm --filter @objectstack/app-crm build

# Boot ObjectOS pointing at the bundle
cd apps/objectos
OS_ARTIFACT_PATH=$PWD/../../examples/app-crm/dist/objectstack.json \
  PORT=3000 pnpm start

# All three URL shapes resolve to the same project kernel:
curl -X POST http://localhost:3000/api/v1/data/account \
  -H 'Content-Type: application/json' \
  -d '{"name":"Acme","website":"bogus"}'
# → 400 Website must start with http:// or https://  (CRM hook fired)

curl -X POST http://localhost:3000/api/v1/projects/proj_local/data/account \
  -H 'Content-Type: application/json' \
  -d '{"name":"Acme","website":"https://acme.com","account_number":"abc-9"}'
# → 200 with record.account_number === "ABC-9"  (uppercase hook fired)
```

The bare `/api/v1/data/...` URL is routed to the default project (`proj_local`) by `createSingleProjectPlugin`. Tables are auto-created by the SQL driver on first access; the bundle's seed data (e.g. `Acme Corporation`) is upserted on boot.

#### Hosting multiple compiled bundles

Two bundles can share a single ObjectOS host. Each bundle gets its own
project kernel; isolation is enforced at the kernel boundary (separate
SQLite file per project, separate object registry, separate hooks).

There are three binding mechanisms, evaluated in this order at request
time (first hit wins):

| Priority | Source | Scope | Best for |
|:---|:---|:---|:---|
| 1 | `OS_PROJECT_ARTIFACTS` env | per-project, ephemeral | Local dev, CI |
| 2 | `sys_project.metadata.artifact_path` (DB row) | per-project, persisted | Production, control-plane managed |
| 3 | `OS_ARTIFACT_PATH` env | shared default for unbound projects | Single-bundle hosts |

**Mode 1 — env-driven (recommended for local multi-bundle):**

```bash
# Build both bundles once
pnpm --filter @objectstack/app-crm build
pnpm --filter @example/app-todo build

cd apps/objectos
OS_PROJECT_ARTIFACTS="proj_crm:$PWD/../../examples/app-crm/dist/objectstack.json,proj_todo:$PWD/../../examples/app-todo/dist/objectstack.json" \
  PORT=3000 pnpm start

# Address each project explicitly via scoped URL
curl -X POST http://localhost:3000/api/v1/projects/proj_crm/data/account \
  -H 'Content-Type: application/json' \
  -d '{"name":"Acme","website":"https://acme.com","account_number":"abc-9"}'

curl -X POST http://localhost:3000/api/v1/projects/proj_todo/data/todo_task \
  -H 'Content-Type: application/json' \
  -d '{"title":"Buy Milk","priority":"high"}'

# Or use the X-Project-Id header on a bare URL — equivalent
curl -X POST http://localhost:3000/api/v1/data/account \
  -H 'X-Project-Id: proj_crm' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Beta","website":"https://beta.io"}'
```

**Mode 2 — DB-persisted (recommended for production):**

```bash
# Bind once via CLI; the path is stored in sys_project.metadata.artifact_path
pnpm exec objectstack projects bind proj_crm \
  $PWD/examples/app-crm/dist/objectstack.json

# Subsequent boots load the binding from the control plane DB
pnpm --filter @objectstack/objectos start
```

**Routing rules:**

- A scoped URL `/api/v1/projects/<id>/...` always targets the named
  project (assuming it's bound).
- A bare URL `/api/v1/data/...` resolves a project via this chain:
  hostname → `X-Project-Id` header → `defaultProjectId` (set by
  `createSingleProjectPlugin` in single-project mode). Multi-bundle
  hosts should not rely on the default fallback — always specify the
  project via URL or header.
- `OS_ARTIFACT_PATH` is **only** the default fallback for projects with
  no other binding. In multi-bundle mode, leave it unset so each
  project picks up its own bundle from `OS_PROJECT_ARTIFACTS` or DB.

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
| `OS_ARTIFACT_PATH` | `dist/objectstack.json` | Path to the compiled app artifact (single-bundle default) |
| `OS_PROJECT_ARTIFACTS` | — | Comma list of `<projectId>:<path>` pairs for multi-bundle hosting |
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

---

## Production-shape verification (cloud + hostname routing)

The full production deployment shape — `apps/cloud` as the control plane,
`apps/objectos` as a runtime node, vanity hostnames routed by
`EnvironmentRegistry.resolveByHostname` to per-project kernels — is
covered end-to-end by an in-process test that exercises the same code
paths a 2-process deployment would (the only difference is HTTP vs
in-memory transport between the registry and the control-plane SQL
driver).

```bash
# from repo root
pnpm --filter @objectstack/cloud build
pnpm --filter @objectstack/cloud test:production-flow
```

What it verifies (6 steps, all in one process):

1. Boot `apps/cloud` in `OS_MODE=cloud` (control plane + runtime node).
2. Seed an organization via the control-plane `objectql` engine.
3. `GET /api/v1/cloud/templates` returns `crm` in the catalog.
4. `POST /api/v1/cloud/projects` with `template_id=crm` + `hostname=<vanity>`
   provisions a project. The provisioning workflow:
   1. Create the project SQLite file (or Turso DB).
   2. Persist `database_url` so kernel-factory can resolve the DB.
   3. Run the template seeder — registers metadata, binds hooks,
      `initObjects` to create physical tables, loads seed data.
   4. Flip `status` to `active` (so `waitForActive` clients only see
      the project as ready *after* schema + seed data are queryable).
5. `POST /api/v1/data/account` with `Host: <vanity>` and `website: bogus`
   → routed to the project kernel by hostname → CRM hook returns
   `400 Website must start with http:// or https://`.
6. `POST /api/v1/data/account` with a valid payload → 2xx, and the
   `account_number` is uppercased by the `account_protection` hook;
   subsequent `GET /api/v1/data/account` returns the row through the
   same hostname-routed kernel.

For a true 2-process verification, run `apps/cloud` and `apps/objectos`
on separate ports with `OS_CLOUD_URL=http://<cloud-host>:<port>` on the
runtime node. Browser users add `127.0.0.1 crm.localhost` to `/etc/hosts`
and visit `http://crm.localhost:<runtime-port>/`. The framework code
paths exercised are identical to the in-process test above.
