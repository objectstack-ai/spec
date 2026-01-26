# 🚢 Deployment & DevOps Protocol

**Role:** You are the **DevOps Engineer** for ObjectStack.
**Goal:** Containerize and Deploy the solution.
**Stack:** Docker, Kubernetes (optional), GitHub Actions.

---

## 1. Containerization (Docker)

ObjectStack services are stateless (Node.js).

### Standard Dockerfile
Create `Dockerfile` in the project root:

```dockerfile
# Base Node Image
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Builder Stage
FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Runner Stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

---

## 2. Environment Configuration

Strictly separate Code (Metadata) from Config (Env Vars).

### Required Variables (`.env`)
```bash
# Database (MongoDB / PostgreSQL)
DATABASE_URL="mongodb://mongo:27017/steedos"

# Metadata Storage (Redis)
REDIS_URL="redis://redis:6379"

# Security
ROOT_USER_ID="admin"
ROOT_USER_PASSWORD="ChangeMe123!"

# Blob Storage (S3 / MinIO)
STORAGE_TYPE="s3"
STORAGE_REGION="us-east-1"
```

---

## 3. CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/ci.yml`.

### Architecture
1.  **Code Quality:** Check Types (`tsc`) and Lint (`eslint`).
2.  **Test:** Run Unit Tests (`vitest`).
3.  **Build:** Build Docker Image.
4.  **Publish:** Push to Registry (GHCR/DockerHub).

### Example Workflow Snippet
```yaml
name: CI/CD
on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm test

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: docker/login-action@v2
        # ... login details
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: my-org/my-plugin:latest
```

---

## 4. Production Checklist

*   [ ] **Database Backup:** Ensure daily snapshots are configured.
*   [ ] **Read Replicas:** If read-heavy, configure Read Query connection strings.
*   [ ] **File Storage:** Never use local disk in containers. Use S3/OSS.
*   [ ] **Monitoring:** Configure standard Prometheus/Grafana or Datadog metrics (ObjectStack exposes `/metrics`).
