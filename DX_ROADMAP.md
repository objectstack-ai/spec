# ObjectStack — Developer Experience (DX) Roadmap

> **Date:** 2026-02-12  
> **Scope:** Post v3.0 — Focused entirely on Developer Experience  
> **Based On:** Full codebase audit — 171 schemas, 194 test files (5,243 tests), 150+ doc pages, 4 examples, 19 packages, 12 subpath exports  
> **Previous:** `ROADMAP.md` (v3.0 Phases 5–11 ✅ Complete)

---

## Executive Summary

ObjectStack v3.0 delivered a production-grade protocol spec with comprehensive type safety, test coverage, security hardening, and build tooling. The **next frontier is developer adoption** — making it effortless for developers to discover, learn, and build with the platform.

This roadmap prioritizes improvements based on the **"Time to First Wow"** metric: how quickly a new developer goes from `npm init` to a running application with data, UI, and API.

### Current DX Assessment (Feb 2026 Audit)

| Area | Score | Notes |
|------|-------|-------|
| **Type Safety** | ⭐⭐⭐⭐⭐ | Zod v4 first, 7,095+ `.describe()`, full inference, branded types |
| **Schema Completeness** | ⭐⭐⭐⭐⭐ | 171 schemas, 1,470 JSON Schemas, OpenAPI 3.1, bundled `objectstack.json` |
| **Test Coverage** | ⭐⭐⭐⭐⭐ | 194 test files (5,243 tests), 100%+ schema coverage |
| **IDE Autocomplete** | ⭐⭐⭐⭐ | Bundled `objectstack.json`, `.describe()` tooltips, 12 subpath exports |
| **Error Messages** | ⭐⭐⭐⭐⭐ | Custom Zod v4 error map, "Did you mean?" fuzzy suggestions, `safeParsePretty()` |
| **Helper Functions** | ⭐⭐⭐⭐⭐ | 6 `define*` helpers + `ObjectSchema.create()` + `Field.*` + strict `defineStack()` |
| **Getting Started** | ⭐⭐⭐⭐ | Docs with prerequisites, troubleshooting, StackBlitz playground; no `create-objectstack` wizard yet |
| **Reference Docs** | ⭐⭐⭐⭐⭐ | Field type gallery ✅, error catalog ✅, query cheat sheet ✅, Contracts docs ✅, wire format ✅, protocol diagram ✅, decision tree ✅, permissions matrix ✅ |
| **Examples** | ⭐⭐⭐⭐ | 4 examples with comprehensive READMEs, "How to Run" sections, StackBlitz playground link |
| **Migration Story** | ⭐⭐⭐ | V3 migration guide exists; no automated `codemod` tooling |

### Audit Findings Summary (New Issues Discovered)

| # | Finding | Severity | Location |
|---|---------|----------|----------|
| 1 | `examples/README.md` references non-existent `minimal-auth` example | 🔴 Critical | `examples/README.md` L31-63 |
| 2 | `plugin-bi` has NO README, NO scripts, placeholder-only code | 🔴 Critical | `examples/plugin-bi/` |
| 3 | `examples/README.md` says "Total Examples: 3" — should be 4 | 🟡 Medium | `examples/README.md` L379 |
| 4 | `examples/README.md` says "Protocol Version: 0.6.1" — should be 3.0.0 | 🟡 Medium | `examples/README.md` L378 |
| 5 | Contracts docs section is empty (`pages: []`) | 🟡 Medium | `content/docs/references/contracts/meta.json` |
| 6 | `app-todo` Quick Start lacks dev/serve instructions | 🟡 Medium | `examples/app-todo/README.md` |
| 7 | `app-crm` Quick Start lacks port/output details | 🟡 Medium | `examples/app-crm/README.md` |
| 8 | `app-host` README uses `npm run dev` instead of `pnpm dev` | 🟡 Medium | `examples/app-host/README.md` |
| 9 | `defineStudioPlugin` not re-exported at root index.ts (unlike other `define*` helpers) | 🟢 Low | `packages/spec/src/index.ts` |
| 10 | Some root-level schema objects missing `.describe()` (only properties annotated) | 🟢 Low | Various `.zod.ts` files |

---

## Phase 1: First Five Minutes (Onboarding) — 2 weeks

> **Goal:** A new developer runs `npx create-objectstack` and has a working app in under 5 minutes.  
> **Metric:** Time from `npm init` → running app with CRUD UI < 5 min.

### 1.1 Interactive Playground

| Task | Details | Priority |
|------|---------|----------|
| StackBlitz starter template | Pre-configured `app-todo` example on StackBlitz with "Open in Editor" button | 🔴 High |
| "Try Online" button in README | One-click link in `packages/spec/README.md` and docs site | 🔴 High |
| CodeSandbox template | Alternative playground for CodeSandbox users | 🟡 Medium |

### 1.2 Quick-Start Improvements

| Task | Details | Priority |
|------|---------|----------|
| Prerequisites check page | Add Node 18+, pnpm requirement callouts to getting-started/index.mdx | 🔴 High |
| "How to Run" in every example | Add copy-paste commands + expected output to each example README | 🔴 High |
| First-run troubleshooting guide | Common issues: pnpm install fails, port conflicts, TypeScript version | 🟡 Medium |
| 5-minute video walkthrough | Screen recording of `create-objectstack` → running app | 🟡 Medium |

### 1.3 `create-objectstack` Scaffolding

| Task | Details | Priority |
|------|---------|----------|
| Interactive project wizard | `npx create-objectstack` with prompts: name, template, driver, framework | 🔴 High |
| Template: Minimal API | Server + memory driver + 1 object + REST API | 🔴 High |
| Template: Full-Stack | Server + UI + auth + 3 objects (CRM-lite) | 🟡 Medium |
| Template: Plugin | Bare plugin skeleton with test setup | 🟡 Medium |

### 1.4 Examples Catalog Hygiene (NEW — Audit Finding)

| Task | Details | Priority |
|------|---------|----------|
| Remove `minimal-auth` ghost reference | `examples/README.md` references non-existent `minimal-auth` directory — remove or create it | 🔴 High |
| Fix `plugin-bi` example | Add README.md, add build/typecheck scripts, implement BI objects or mark as stub | 🔴 High |
| Update `examples/README.md` metadata | Protocol Version 0.6.1 → 3.0.0, Total Examples 3 → 4, Last Updated date | 🟡 Medium |
| Fix `app-host` README | Use `pnpm dev` instead of `npm run dev` | 🟡 Medium |

### Phase 1 Checklist

- [x] Create StackBlitz starter template from `app-todo`
- [x] Add "Try Online" button to spec README.md and docs site hero
- [x] Add "How to Run" section to each example README (app-todo, app-crm, app-host, plugin-bi)
- [x] Add prerequisites section to getting-started docs
- [x] Create first-run troubleshooting page
- [x] Implement `create-objectstack` CLI wizard with 3 templates
- [ ] Record 5-minute getting-started video
- [x] Fix `examples/README.md`: remove `minimal-auth` ghost reference, update metadata (version, count, date)
- [x] Fix `plugin-bi` example: add README.md, add package.json scripts, document purpose
- [x] Fix `app-host` README: use `pnpm dev` instead of `npm run dev`

---

## Phase 2: Schema DX Helpers — 2 weeks

> **Goal:** Make defining objects, views, and flows feel as natural as writing a React component.  
> **Metric:** Lines of code to define a complete CRUD object < 20 LOC.

### 2.1 Enhanced Factory Functions

| Task | Details | Priority |
|------|---------|----------|
| `ObjectSchema.create()` with defaults | Auto-generate `label` from `name`, merge common fields (id, created_at, updated_at), validate fields | 🔴 High |
| `defineView()` helper | Type-safe view builder: `defineView({ object: 'task', type: 'grid', columns: [...] })` | 🔴 High |
| `defineApp()` helper | Type-safe app builder: `defineApp({ name: 'crm', navigation: [...] })` | 🟡 Medium |
| `defineFlow()` helper | Type-safe flow builder: `defineFlow({ trigger: 'record_create', steps: [...] })` | 🟡 Medium |
| `defineAgent()` helper | Type-safe agent builder: `defineAgent({ role: 'support', tools: [...] })` | 🟡 Medium |

### 2.2 Improved Validation Error Messages

| Task | Details | Priority |
|------|---------|----------|
| Custom Zod error map for ObjectStack | Contextual errors: "Field 'status' has type 'select' but is missing required 'options' property" | 🔴 High |
| Actionable error suggestions | Include "Did you mean?" suggestions for common typos (e.g., `text_area` → `textarea`) | 🟡 Medium |
| Validation error formatter | Pretty-print validation errors with path highlighting for CLI output | 🟡 Medium |
| Schema-aware diagnostics | Custom refinements that check cross-field consistency (e.g., lookup requires `reference`) | 🟡 Medium |

### 2.3 Type-Safe Patterns

| Task | Details | Priority |
|------|---------|----------|
| Branded types for identifiers | `ObjectName`, `FieldName`, `ViewName` branded types for compile-time safety | 🟡 Medium |
| Strict mode for `defineStack()` | Optional strict mode that validates all cross-references (e.g., view references valid object) | 🟡 Medium |
| Generic type parameters | `defineStack<Objects>()` that infers object names for type-safe view.object references | 🟢 Low |

### Phase 2 Checklist

- [x] Enhance `ObjectSchema.create()` with auto-label, common fields, and validation
- [x] Implement `defineView()` with column type inference
- [x] Implement `defineApp()` with navigation builder
- [x] Implement `defineFlow()` with step type inference
- [x] Create custom Zod error map with contextual messages
- [x] Add "Did you mean?" suggestions for FieldType typos
- [x] Create pretty-print validation error formatter for CLI
- [x] Add branded types for ObjectName, FieldName, ViewName
- [x] Add strict cross-reference validation mode to `defineStack()`

---

## Phase 3: Documentation & Reference — 3 weeks

> **Goal:** Every schema has a visual reference page; every error has a documented solution.  
> **Metric:** 100% of user-facing schemas have a dedicated reference page with examples.

### 3.1 Field Type Gallery

| Task | Details | Priority | Status |
|------|---------|----------|--------|
| Visual field type reference | Interactive page showing all 48 field types with live previews | 🔴 High | ✅ Done |
| Field configuration reference | Per-type property tables (text: maxLength, pattern; number: min, max, precision) | 🔴 High | ✅ Done |
| Field type decision tree | "Which field type should I use?" interactive guide | 🟡 Medium | ✅ Done |
| Field validation rules per type | Default validation behavior for each field type | 🟡 Medium | ✅ Done |

### 3.2 Error & Status Code Reference

| Task | Details | Priority | Status |
|------|---------|----------|--------|
| Error code catalog | All 41+ error codes with descriptions, causes, and fixes | 🔴 High | ✅ Done |
| HTTP status mapping table | Error category → HTTP status → retry strategy | 🟡 Medium | ✅ Done |
| Client-side error handling guide | Patterns for handling errors in React/Vue/vanilla JS | 🟡 Medium | ✅ Done |
| Server-side error handling guide | How to throw and format errors from plugins | 🟡 Medium | ✅ Done |

### 3.3 Protocol Documentation

| Task | Details | Priority | Status |
|------|---------|----------|--------|
| Protocol relationship diagram | Visual diagram showing how Data → API → UI layers connect | 🔴 High | ✅ Done |
| Query syntax cheat sheet | One-page reference for QuerySchema filters, sorts, pagination | 🔴 High | ✅ Done |
| Wire format examples | JSON request/response examples for every API endpoint | 🟡 Medium | ✅ Done |
| Security permissions matrix | Object × Role × Permission visual table | 🟡 Medium | ✅ Done |
| Backward compatibility policy | Versioning strategy, deprecation timeline, SemVer guarantees | 🟡 Medium | ❌ Not started |

### 3.4 Guide Improvements

| Task | Details | Priority | Status |
|------|---------|----------|--------|
| Common patterns guide | Top 10 patterns: CRUD, search, pagination, auth, file upload, realtime, etc. | 🔴 High | ✅ Done |
| Troubleshooting / FAQ page | "My query returns empty" / "Validation fails but data looks correct" | 🟡 Medium | ✅ Done |
| Data flow diagram guide | How data moves from defineStack → kernel → driver → database | 🟡 Medium | ✅ Done |
| Plugin development tutorial | Step-by-step: create a plugin, register services, respond to hooks | 🟡 Medium | ✅ Done |

### 3.5 Missing Documentation Sections (NEW — Audit Finding)

| Task | Details | Priority | Status |
|------|---------|----------|--------|
| Populate Contracts docs | `content/docs/references/contracts/meta.json` has `pages: []` — add pages documenting IMetadataService, IAuthService, IStorageService, etc. | 🔴 High | ✅ Done |
| Add `defineStudioPlugin` guide | Only `define*` helper not documented at guide level; add usage example to plugin-development guide | 🟡 Medium | ❌ Not started |
| Error handling guides (client + server) | Best practice patterns for both client-side and server-side error handling | 🟡 Medium | ✅ Done |

### Phase 3 Checklist

- [x] Create field type gallery page with all 48 types
- [x] Create per-field-type configuration reference tables
- [x] Create error code catalog with 41+ error codes
- [x] Create HTTP status mapping reference
- [x] Create protocol relationship diagram (visual)
- [x] Create query syntax cheat sheet
- [x] Add wire format JSON examples to protocol docs
- [x] Create common patterns guide (top 10 patterns)
- [x] Create troubleshooting / FAQ page
- [x] Create plugin development tutorial
- [x] Populate Contracts docs section (currently empty)
- [x] Add field type decision tree ("Which field type?")
- [x] Add client-side error handling guide
- [x] Add server-side error handling guide
- [x] Add data flow diagram guide (defineStack → kernel → driver → DB)
- [x] Add security permissions matrix

---

## Phase 4: CLI & Tooling DX — 2 weeks

> **Goal:** The CLI is a developer's best friend — it catches mistakes before runtime.  
> **Metric:** `objectstack doctor` catches 90%+ of common configuration mistakes.

### 4.1 CLI Enhancements

| Task | Details | Priority |
|------|---------|----------|
| `objectstack diff` | Compare two spec versions, detect breaking changes, output changelog | 🔴 High |
| `objectstack doctor` improvements | Detect: circular deps, missing test files, deprecated usage, unused objects, orphan views | 🔴 High |
| `objectstack lint` | Style checker: snake_case names, required fields, label conventions | 🟡 Medium |
| `objectstack explain <schema>` | Print human-readable explanation of any schema with examples | 🟡 Medium |
| `objectstack migrate` | Auto-generate migration scripts for schema changes (add/remove fields) | 🟢 Low |

### 4.2 IDE Integration

| Task | Details | Priority |
|------|---------|----------|
| VSCode extension | Syntax highlighting, autocomplete, inline validation for `.object.ts`, `.view.ts`, etc. | 🔴 High |
| JSON Schema for `objectstack.config.ts` | IDE autocomplete when editing config file | 🔴 High |
| Diagnostic language server | Real-time validation with inline error squiggles | 🟡 Medium |
| Code actions (quick fixes) | Auto-fix common issues: add missing `label`, fix snake_case, add required `options` | 🟡 Medium |

### 4.3 Code Generation

| Task | Details | Priority |
|------|---------|----------|
| `objectstack generate client --lang ts` | Type-safe client SDK from stack definition | 🟡 Medium |
| `objectstack generate openapi` | OpenAPI spec from stack definition (already exists, ensure completeness) | 🟡 Medium |
| `objectstack generate migration` | Database migration from object diff | 🟡 Medium |
| `objectstack generate seed` | Generate seed data from object schemas | 🟢 Low |

### 4.4 Codemod & Migration Tooling (NEW)

| Task | Details | Priority |
|------|---------|----------|
| `objectstack codemod v2-to-v3` | Automated AST transform for v2 → v3 breaking changes (removed fields, renames) | 🟡 Medium |
| Deprecation scanner | CLI command to detect usage of `@deprecated` items with suggested replacements | 🟡 Medium |
| Config validator | Deep validation of `objectstack.config.ts` with cross-reference checks (uses existing `defineStack({ strict: true })`) | 🟡 Medium |

### Phase 4 Checklist

- [ ] Implement `objectstack diff` with breaking change detection
- [ ] Enhance `objectstack doctor` (circular deps, missing tests, deprecated usage)
- [ ] Implement `objectstack lint` for naming conventions
- [ ] Implement `objectstack explain` for schema documentation
- [x] Create VSCode extension with autocomplete and validation
- [x] Add JSON Schema for `objectstack.config.ts` IDE support
- [ ] Implement `objectstack generate client` for typed SDK generation
- [ ] Implement `objectstack generate migration` for schema diffs
- [ ] Implement `objectstack codemod v2-to-v3` for automated migration
- [ ] Add deprecation scanner to CLI

---

## Phase 5: Studio as DX Hub — 3 weeks

> **Goal:** Studio becomes the visual IDE where developers design, test, and deploy without leaving the browser.  
> **Metric:** 80%+ of common CRUD apps can be built entirely in Studio.  
> **Dependency:** `apps/studio/ROADMAP.md` Phases 0–2.

### 5.1 Schema Designer

| Task | Details | Priority |
|------|---------|----------|
| Visual object builder | Drag-and-drop field creation with live preview | 🔴 High |
| Field type picker | Visual catalog with previews (linked to Field Type Gallery) | 🔴 High |
| Relationship visualizer | ERD-style diagram showing lookup/master-detail connections | 🟡 Medium |
| Schema diff viewer | Side-by-side comparison of schema changes before apply | 🟡 Medium |

### 5.2 API Console

| Task | Details | Priority |
|------|---------|----------|
| Query builder UI | Visual filter/sort/field builder that generates QuerySchema JSON | 🔴 High |
| Request/response history | Persistent history with replay, diff, and share capabilities | 🟡 Medium |
| Mock data generator | Generate realistic test data based on field types | 🟡 Medium |

### 5.3 Code-Visual Bridge

| Task | Details | Priority |
|------|---------|----------|
| "Export as Code" button | Any visual design → generates `.object.ts` / `.view.ts` file | 🔴 High |
| "Import from Code" | Paste `defineStack()` code → renders in Studio visual designer | 🟡 Medium |
| Live sync with file system | Watch `.ts` files and reflect changes in Studio in real-time | 🟡 Medium |

### Phase 5 Checklist

- [ ] Implement visual object builder with drag-and-drop fields
- [ ] Implement field type picker with live previews
- [ ] Implement relationship ERD visualizer
- [ ] Implement query builder UI with visual filters
- [ ] Add request/response history to API console
- [ ] Implement "Export as Code" for all visual designers
- [ ] Implement "Import from Code" for defineStack() configs
- [ ] Add live file sync between Studio and file system

---

## Phase 6: Ecosystem & Community — Ongoing

> **Goal:** Build a thriving ecosystem of plugins, examples, and community contributions.  
> **Metric:** 10+ community plugins published, 100+ GitHub stars.

### 6.1 Plugin Marketplace

| Task | Details | Priority |
|------|---------|----------|
| Plugin registry API | REST API for discovering, searching, and downloading plugins | 🟡 Medium |
| Plugin quality scoring | Automated scoring: tests, docs, types, security scan | 🟡 Medium |
| Plugin starter template | `objectstack generate plugin` with test setup, CI, publishing | 🔴 High |

### 6.2 Example Gallery

| Task | Details | Priority |
|------|---------|----------|
| 10+ curated examples | SaaS, eCommerce, Healthcare, Education, Project Management, etc. | 🟡 Medium |
| Example difficulty rating | Beginner / Intermediate / Advanced badges | 🟡 Medium |
| "Fork & Customize" flow | One-click fork of any example into user's own project | 🟢 Low |

### 6.3 Community Infrastructure

| Task | Details | Priority |
|------|---------|----------|
| Discord community | Developer support channel, showcase, RFC discussions | 🟡 Medium |
| Blog / Changelog | Regular updates on new features, best practices, community highlights | 🟡 Medium |
| Contributor recognition | Contributors page, "first PR" badges, hall of fame | 🟢 Low |

### Phase 6 Checklist

- [ ] Implement plugin registry API (search, publish, download)
- [ ] Create plugin starter template with CI and publishing
- [ ] Add plugin quality scoring system
- [ ] Create 10+ curated example applications
- [ ] Add example difficulty ratings
- [ ] Set up Discord community with support channels
- [ ] Create blog/changelog system for regular updates

---

## Timeline Summary

```
2026 Q1 (Completed)
 ├── Phase 2: Schema DX Helpers         [2 weeks]   ✅ Complete — 6 define* helpers, error map, branded types, strict mode
 ├── Phase 3: Documentation & Reference [3 weeks]   ✅ Complete — 16/16 items done
 └── Phase 1: First Five Minutes        [2 weeks]   ✅ Complete (8/10) — Playground, quick-start, example fixes, prerequisites

2026 Q2–Q3 (Tooling Sprint)
 ├── Phase 1: Remaining items           [1 week]    → create-objectstack CLI wizard, video walkthrough
 ├── Phase 4: CLI & Tooling DX          [2 weeks]   → diff, doctor, lint, VSCode extension, codemod
 └── Phase 5: Studio as DX Hub          [3 weeks]   → Visual designer, code bridge

2026 Q3+ (Ecosystem Sprint)
 └── Phase 6: Ecosystem & Community     [Ongoing]   → Plugin marketplace, examples, community
```

### Priority Matrix

| Impact ↓ / Effort → | Low (< 1 week) | Medium (1–2 weeks) | High (> 2 weeks) |
|---------------------|-----------------|---------------------|-------------------|
| **High Impact** | Fix examples README (ghost ref, metadata), StackBlitz template, "How to Run" docs | `create-objectstack` wizard, Contracts docs, Protocol diagram | VSCode extension, Visual object builder |
| **Medium Impact** | Fix `plugin-bi` (README + scripts), `app-host` README fix, Field decision tree | `objectstack diff`, `objectstack doctor`, Wire format examples, Codemod tooling | Plugin marketplace, Live file sync |
| **Lower Impact** | `defineStudioPlugin` root re-export, Schema-level `.describe()` | Plugin starter template, Mock data generator, Security matrix | Diagnostic language server, Auto-migration |

---

## Success Criteria

| Metric | v3.0 (Current) | Phase 1 | Phase 3 | Phase 6 |
|--------|----------------|---------|---------|---------|
| Time to First App | ~30 min | < 5 min | < 5 min | < 3 min |
| Documentation coverage | ~70% | 80% | 95% | 100% |
| Interactive examples | 0 | 1 (StackBlitz) | 3+ | 10+ |
| Community plugins | 0 | 0 | 2+ | 10+ |
| CLI diagnostic commands | 2 | 4 | 6 | 8+ |
| IDE autocomplete coverage | JSON Schema + bundled | JSON Schema + hints | VSCode extension | Language server |
| Error message quality | Custom Zod v4 error map + "Did you mean?" | Full catalog | Contextual guides | AI-assisted |
| Helper functions (`define*`) | 6 (`defineStack/View/App/Flow/Agent/StudioPlugin`) | 6+ | 6+ | 8+ |
| Test files / Tests | 194 / 5,243 | 194+ / 5,300+ | 200+ / 5,500+ | 210+ / 6,000+ |
| Example quality | 3 working + 1 placeholder | 4 working + 1 scaffold | 6+ curated | 10+ |
| GitHub stars | — | 50+ | 200+ | 500+ |

---

## Relationship to Other Plans

| Document | Focus | Status |
|----------|-------|--------|
| `ROADMAP.md` | v3.0 spec hardening (Phases 5–11) | ✅ Complete |
| `apps/studio/ROADMAP.md` | Studio IDE visual features (Phases 0–8) | 🔄 Active |
| `packages/spec/DEVELOPMENT_PLAN.md` | Spec schema audit (Phases 1–4) | ✅ Complete |
| **`DX_ROADMAP.md` (this file)** | **Developer Experience & Adoption** | 🔄 Active |

---

**Last Updated:** 2026-02-12  
**Maintainers:** ObjectStack Core Team  
**Status:** ✅ Phase 1 Complete (8/10), Phase 2 ✅ Complete, Phase 3 ✅ Complete (16/16) — Phase 4–6 Ready to Start
