# GitHub Actions Workflows Documentation

This document describes all automated workflows configured for the ObjectStack Spec repository.

## Overview

The repository uses GitHub Actions for continuous integration, automated testing, security scanning, and maintenance tasks. Below is a comprehensive guide to all workflows.

## Workflows

### 1. CI (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**
- **Test Job**: Runs unit tests with Vitest
  - Executes all tests in `packages/spec`
  - Generates code coverage reports
  - Uploads coverage reports as artifacts (retained for 30 days)
  
- **Build Job**: Builds all packages
  - Compiles TypeScript
  - Generates JSON schemas
  - Uploads build artifacts (retained for 30 days)

**Caching:** Uses pnpm store caching for faster builds

---

### 2. Lint & Type Check (`.github/workflows/lint.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**
- **Type Check**: Validates TypeScript type correctness
  - Runs `tsc --noEmit` to check for type errors
  - Ensures type safety across the codebase

**Purpose:** Catch type errors early before they reach production

---

### 3. CodeQL Security Analysis (`.github/workflows/codeql.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch
- Scheduled: Every Monday at 02:00 UTC

**Jobs:**
- **Analyze**: Security code scanning with CodeQL
  - Scans JavaScript/TypeScript code
  - Checks for security vulnerabilities
  - Uses `security-and-quality` query suite
  - Results uploaded to GitHub Security tab

**Purpose:** Proactive security vulnerability detection

---

### 4. Deploy Documentation (`.github/workflows/docs.yml`)

**Triggers:**
- Push to `main` branch (when docs/spec files change)
- Manual trigger via `workflow_dispatch`

**Jobs:**
- **Deploy**: Builds and deploys documentation
  - Builds protocol schemas
  - Compiles Next.js documentation site
  - Deploys to GitHub Pages

**Concurrency:** Prevents concurrent deployments to avoid conflicts

**Purpose:** Keep documentation in sync with code changes

---

### 5. PR Automation (`.github/workflows/pr-automation.yml`)

**Triggers:**
- Pull request events: opened, synchronize, reopened, labeled, unlabeled

**Jobs:**

1. **PR Size Check**: Adds size labels to PRs
   - `size/xs`: 0-10 lines changed
   - `size/s`: 11-100 lines changed
   - `size/m`: 101-500 lines changed
   - `size/l`: 501-1000 lines changed
   - `size/xl`: 1000+ lines changed
   - Ignores lock files in calculations

2. **Auto Label**: Labels PRs based on changed files
   - Uses `.github/labeler.yml` configuration
   - Labels: `protocol:data`, `protocol:ui`, `protocol:system`, `ci/cd`, `documentation`, etc.

3. **Changeset Check**: Validates changeset presence
   - Warns if no changeset found
   - Can be bypassed with `skip-changeset` label
   - Ensures version tracking for releases

**Purpose:** Improve PR review workflow and tracking

---

### 6. Stale Issues and PRs (`.github/workflows/stale.yml`)

**Triggers:**
- Scheduled: Daily at 01:00 UTC
- Manual trigger via `workflow_dispatch`

**Behavior:**

**Issues:**
- Marked stale after 60 days of inactivity
- Auto-closed 14 days after marked stale
- Exempt labels: `pinned`, `security`, `roadmap`

**Pull Requests:**
- Marked stale after 30 days of inactivity
- Auto-closed 7 days after marked stale
- Exempt labels: `pinned`, `security`, `work-in-progress`

**Purpose:** Keep issue/PR lists clean and relevant

---

### 7. Validate Dependencies (`.github/workflows/validate-deps.yml`)

**Triggers:**
- Pull requests modifying `package.json` or `pnpm-lock.yaml`
- Scheduled: Weekly on Monday at 03:00 UTC
- Manual trigger via `workflow_dispatch`

**Jobs:**

1. **Validate**: Dependency validation
   - Verifies lockfile is up-to-date
   - Runs security audit (high severity and above)
   - Lists outdated packages (scheduled runs only)

2. **License Check**: License compatibility verification
   - Checks all dependency licenses
   - Flags incompatible licenses (GPL, proprietary, etc.)
   - Allows: MIT, Apache-2.0, ISC, BSD variants, CC0, Unlicense

**Purpose:** Maintain dependency security and license compliance

---

### 8. Release (`.github/workflows/release.yml`)

**Triggers:**
- Push to `main` branch

**Jobs:**
- **Release**: Automated package publishing
  - Uses Changesets for version management
  - Creates release PRs automatically
  - Publishes to npm when release PR is merged
  - Requires `NPM_TOKEN` secret

**Concurrency:** Prevents concurrent release operations

**Purpose:** Automated semantic versioning and npm publishing

---

## Configuration Files

### Dependabot (`.github/dependabot.yml`)

**Configuration:**
- **npm dependencies**: Weekly updates on Monday at 02:00 UTC
  - Groups minor/patch updates together
  - Separate groups for dev and production dependencies
  - Limit: 10 open PRs
  
- **GitHub Actions**: Weekly updates on Monday at 02:00 UTC
  - Keeps workflow actions up-to-date

**Commit message format:** `chore(deps):` or `chore(ci):`

---

### Auto-Labeler (`.github/labeler.yml`)

**Label mapping based on file paths:**

| Label | File Patterns |
|-------|--------------|
| `documentation` | `content/**`, `apps/docs/**`, `*.md` |
| `protocol:data` | `packages/spec/src/data/**` |
| `protocol:ui` | `packages/spec/src/ui/**` |
| `protocol:system` | `packages/spec/src/system/**` |
| `protocol:ai` | `packages/spec/src/ai/**` |
| `ci/cd` | `.github/workflows/**`, `.github/actions/**` |
| `dependencies` | `package.json`, `pnpm-lock.yaml` |
| `tests` | `**/*.test.ts`, `**/*.spec.ts` |
| `tooling` | `tsconfig.json`, build scripts |

---

## Required Secrets

The following GitHub secrets must be configured:

1. **`GITHUB_TOKEN`**: Automatically provided by GitHub Actions
2. **`NPM_TOKEN`**: Required for npm publishing (release workflow)

---

## Permissions

All workflows use minimal required permissions following security best practices:

- Most workflows: `contents: read` only
- Release workflow: `contents: write`, `pull-requests: write`
- Security workflows: `security-events: write`
- Documentation: `pages: write`, `id-token: write`

---

## Monitoring & Maintenance

### Viewing Workflow Results
- Navigate to **Actions** tab in GitHub
- Select specific workflow from left sidebar
- View run history and logs

### Artifacts
- Test coverage reports (30 days retention)
- Build outputs (30 days retention)

### Security Scanning
- CodeQL results: **Security** tab → **Code scanning alerts**
- Dependabot alerts: **Security** tab → **Dependabot alerts**

---

## Best Practices

1. **Changeset Management**: Always add a changeset for user-facing changes
2. **PR Size**: Keep PRs under 500 lines when possible
3. **Labels**: Let automation handle labeling; add custom labels as needed
4. **Security**: Address security alerts promptly
5. **Dependencies**: Review and approve Dependabot PRs regularly

---

## Troubleshooting

### Build Failures
1. Check CI workflow logs
2. Verify dependencies are up-to-date
3. Run `pnpm install` and `pnpm build` locally

### Type Check Failures
1. Run `pnpm --filter @objectstack/spec exec tsc --noEmit` locally
2. Fix reported type errors
3. Push updated code

### Failed Tests
1. Run `pnpm --filter @objectstack/spec test` locally
2. Review failing test logs
3. Fix code or update tests as needed

---

## Future Enhancements

Potential improvements to consider:

- [ ] Visual regression testing for documentation
- [ ] Performance benchmarking
- [ ] Automated changelog generation
- [ ] Integration tests across packages
- [ ] Bundle size tracking
- [ ] E2E tests for documentation site

---

*Last updated: 2026-01-19*
