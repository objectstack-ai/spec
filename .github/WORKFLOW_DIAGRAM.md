# Workflow Triggers & Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GITHUB ACTIONS WORKFLOWS                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   Push to Main   │
└────────┬─────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
    ┌────────┐      ┌──────────┐
    │   CI   │      │ Release  │
    └────────┘      └──────────┘
    - Test          - Changesets
    - Build         - Publish npm
    - Coverage      
    - Type Check    
         │
         ▼
    [Artifacts]


┌──────────────────┐
│  Pull Request    │
└────────┬─────────┘
         │
         ├──────────────┬──────────────┬─────────────────┐
         │              │              │                 │
         ▼              ▼              ▼                 ▼
    ┌────────┐   ┌──────────┐  ┌─────────────┐  ┌──────────────┐
    │   CI   │   │  CodeQL  │  │    Lint     │  │ PR Automation│
    └────────┘   └──────────┘  └─────────────┘  └──────────────┘
    - Test       - Security   - Type Check     - Size Labels
    - Build      - Scanning                     - Auto Labels
                                                - Changesets


┌──────────────────┐
│  Scheduled       │
└────────┬─────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         │              │              │              │
         ▼              ▼              ▼              ▼
    ┌────────┐   ┌──────────┐  ┌─────────────┐  ┌──────────┐
    │ Stale  │   │  CodeQL  │  │ Validate    │  │Dependabot│
    └────────┘   └──────────┘  │ Deps        │  └──────────┘
    Daily        Weekly Mon    └─────────────┘  Weekly Mon
    01:00 UTC    02:00 UTC     Weekly Mon       (Auto PRs)
                                03:00 UTC


┌──────────────────┐
│  Manual Trigger  │
└────────┬─────────┘
         │
         ├──────────────┬──────────────┐
         │              │              │
         ▼              ▼              ▼
    ┌────────┐   ┌──────────┐  ┌─────────────┐
    │  Docs  │   │  Stale   │  │ Validate    │
    └────────┘   └──────────┘  │ Deps        │
    Deploy       Clean Up      └─────────────┘
                                Security Scan


┌─────────────────────────────────────────────────────────────────────────────┐
│                            AUTOMATION FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Developer creates PR
        │
        ▼
┌───────────────────┐
│ PR Created        │
└────────┬──────────┘
         │
         ├─── CI runs tests ────────────────┐
         │                                   │
         ├─── Lint checks types ────────────┤
         │                                   │
         ├─── CodeQL scans security ────────┤
         │                                   │
         ├─── PR Automation                 │
         │    - Adds size label             ├──→ [Feedback to Dev]
         │    - Adds category labels        │
         │    - Checks changeset            │
         │                                   │
         └───────────────────────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │ Review & Merge │
            └────────┬───────┘
                     │
                     ▼
            ┌────────────────┐
            │ Main Branch    │
            └────────┬───────┘
                     │
                     ├─── CI (test + build) ───────┐
                     │                              │
                     ├─── Docs deploy ──────────────┤
                     │                              │
                     ├─── Release workflow         │
                     │    - Create release PR       ├──→ [npm publish]
                     │    - Or publish if merged    │
                     │                              │
                     └──────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          MAINTENANCE CYCLE                                   │
└─────────────────────────────────────────────────────────────────────────────┘

   Monday 01:00 UTC          Monday 02:00 UTC         Monday 03:00 UTC
         │                         │                        │
         ▼                         ▼                        ▼
    ┌────────┐              ┌──────────┐            ┌─────────────┐
    │ Stale  │              │ CodeQL + │            │  Validate   │
    │ Check  │              │Dependabot│            │    Deps     │
    └────────┘              └──────────┘            └─────────────┘
    Marks old               Security scan           Audit packages
    issues/PRs              + Creates PRs           List outdated


   Daily 01:00 UTC
         │
         ▼
    ┌────────┐
    │ Stale  │
    │Manager │
    └────────┘
    Closes old
    issues/PRs


┌─────────────────────────────────────────────────────────────────────────────┐
│                        ARTIFACT & OUTPUT FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

    CI Test Job                    CI Build Job
         │                              │
         ▼                              ▼
    ┌─────────────┐              ┌─────────────┐
    │  Coverage   │              │   Build     │
    │   Report    │              │  Artifacts  │
    └─────────────┘              └─────────────┘
    (30 days)                    (30 days)
         │                              │
         ├──────────────┬───────────────┤
         │              │               │
         ▼              ▼               ▼
    [Download]     [Review]      [Documentation]
                                       Site
                                        │
                                        ▼
                                  GitHub Pages


┌─────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY WORKFLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  Code Push   │
    └──────┬───────┘
           │
           ├────────────────┬───────────────┐
           │                │               │
           ▼                ▼               ▼
    ┌──────────┐     ┌──────────┐    ┌──────────┐
    │  CodeQL  │     │Dependency│    │ License  │
    │  Scan    │     │  Audit   │    │  Check   │
    └──────────┘     └──────────┘    └──────────┘
           │                │               │
           └────────────────┴───────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │   Security    │
                   │     Tab       │
                   └───────────────┘
                   View all alerts
```

## Summary Statistics

| Category | Count |
|----------|-------|
| **Workflows** | 8 files |
| **Triggers** | Push, PR, Schedule, Manual |
| **Jobs** | 12+ total jobs |
| **Languages Scanned** | JavaScript/TypeScript |
| **Caching** | pnpm store (all workflows) |
| **Artifacts** | Coverage + Build (30 days) |
| **Scheduled Tasks** | 4 (Stale daily, 3 weekly) |
| **Auto-labels** | 9 categories |

## Dependencies

- Node.js: 20
- pnpm: 10.28.0
- GitHub Actions versions:
  - checkout: v4
  - setup-node: v4
  - cache: v4
  - pnpm/action-setup: v4
  - upload-artifact: v4
  - deploy-pages: v4
  - codeql-action: v3
  - stale: v9
  - labeler: v5

---

*Generated: 2026-01-19*
*Maintained by: GitHub Actions Automation*
