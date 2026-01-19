# 🤖 Automation Quick Reference

## Workflow Summary

| Workflow | When it runs | What it does |
|----------|--------------|--------------|
| 🔨 **CI** | On every push/PR | Runs tests & builds code |
| 🎯 **Lint** | On every push/PR | Type checks TypeScript |
| 🔒 **CodeQL** | On push/PR + weekly | Security scanning |
| 📚 **Docs** | On main push (docs changes) | Deploys documentation |
| 🏷️ **PR Automation** | On PR open/update | Adds labels & checks changesets |
| 🧹 **Stale** | Daily | Manages inactive issues/PRs |
| 📦 **Validate Deps** | On dep changes + weekly | Checks dependencies & licenses |
| 🚀 **Release** | On main push | Publishes to npm |

## Quick Commands

```bash
# Run tests locally
pnpm --filter @objectstack/spec test

# Run tests with coverage
pnpm --filter @objectstack/spec test:coverage

# Build everything
pnpm run build

# Type check
pnpm --filter @objectstack/spec exec tsc --noEmit

# Start docs locally
pnpm docs:dev

# Create a changeset
pnpm changeset
```

## PR Checklist

Before submitting a PR:

- [ ] Tests pass locally
- [ ] TypeScript compiles without errors
- [ ] Added changeset (if user-facing changes)
- [ ] Updated documentation (if needed)
- [ ] Keep PR size reasonable (< 500 lines preferred)

## Labels

**Automatic labels added to PRs:**
- `size/*` - Based on lines changed
- `protocol:*` - Based on files changed (data/ui/system/ai)
- `documentation` - Changes to docs
- `ci/cd` - Changes to workflows
- `dependencies` - Changes to package.json
- `tests` - Changes to test files

**Manual labels:**
- `skip-changeset` - Skip changeset requirement
- `pinned` - Prevent auto-stale
- `security` - Security-related changes
- `work-in-progress` - PR is not ready for review

## Secrets Required

- `GITHUB_TOKEN` - ✅ Automatic
- `NPM_TOKEN` - ⚠️ Configure in repo settings

## Monitoring

- **CI/CD**: [Actions tab](../actions)
- **Security**: [Security tab → Code scanning](../security/code-scanning)
- **Dependencies**: [Security tab → Dependabot](../security/dependabot)
- **Coverage**: Download from workflow artifacts

---

💡 **Tip**: All workflows use pnpm caching for faster runs!
