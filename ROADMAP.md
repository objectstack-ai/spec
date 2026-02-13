# ObjectStack — Project Roadmap

> **Last Updated:** 2026-02-13  
> **Current Version:** 3.0.2  
> **Based On:** Full codebase audit — 175 Zod schemas, 195 test files (5,269 tests), 25 service contracts, 15 protocol domains, 14 packages, 4 examples  
> **Related:** [`DX_ROADMAP.md`](./DX_ROADMAP.md) · [`apps/studio/ROADMAP.md`](./apps/studio/ROADMAP.md) · [`ENTERPRISE_ASSESSMENT.md`](./ENTERPRISE_ASSESSMENT.md)

---

## Current State — v3.0 ✅ Complete

All v3.0 milestones have been delivered. The spec package has comprehensive type safety, full test coverage, production-grade security, DX tooling, and adapters for 3 major frameworks.

### v3.0 Audit Snapshot (Feb 2026)

| Metric | Value |
|--------|-------|
| Zod schema files (`.zod.ts`) | **175** across 15 domains |
| Test files / Tests | **195 / 5,269** (all passing) |
| `.describe()` annotations | **7,111** |
| Service contracts | **25** (with 100% test coverage) |
| `@deprecated` items remaining | **2** (informational only) |
| `z.any()` usage | **9** (filter context only) |
| JSON Schemas generated | **1,470** (with `$id` URLs + `x-spec-version`) |
| Bundled schema | `objectstack.json` (1,452 definitions) |
| OpenAPI spec | Auto-generated 3.1 |
| Packages | **14** (unified version) |
| Adapters | Hono ✅ · Next.js ✅ · NestJS ✅ |
| Compliance | GDPR ✅ · SOC2 ✅ · HIPAA ✅ · PCI-DSS ✅ |
| SBOM | CycloneDX 1.4 (63 components) |

### Protocol Domain Coverage

| Domain | Schemas | Tests | Coverage |
|--------|---------|-------|----------|
| `data/` | 19 | 20 | ✅ 100% |
| `ui/` | 18 | 18 | ✅ 100% |
| `system/` | 27 | 27 | ✅ 100% |
| `api/` | 25 | 25 | ✅ 100% |
| `kernel/` | 32 | 26 | ✅ 81% (events sub-modules untested separately) |
| `ai/` | 14 | 14 | ✅ 100% |
| `automation/` | 8 | 8 | ✅ 100% |
| `integration/` | 7 | 7 | ✅ 100% |
| `security/` | 5 | 5 | ✅ 100% |
| `shared/` | 9 | 9 | ✅ 100% |
| `identity/` | 4 | 4 | ✅ 100% |
| `cloud/` | 4 | 4 | ✅ 100% |
| `contracts/` | 25 svc | 25 | ✅ 100% |
| `studio/` | 1 | 1 | ✅ 100% |
| `qa/` | 1 | 1 | ✅ 100% |

### v3.0 Completed Phases (Summary)

<details>
<summary><strong>Phase 5–11 — Click to expand full details</strong></summary>

| Phase | Title | Duration | Key Deliverables |
|-------|-------|----------|-----------------|
| **5** | Spec Test Coverage | 1 week | 195 test files, 5,269 tests, 100%+ schema coverage |
| **6** | Runtime Hardening | 2 weeks | 0 TODOs remaining, REST/metadata/adapter tests added |
| **7** | Adapter Implementation | 1–2 weeks | Hono + Next.js + NestJS adapters fully implemented |
| **8** | Deprecation Cleanup | 1 week | All deprecated items removed, v3 migration guide |
| **9** | Developer Experience | 2 weeks | JSON Schema `$id`, OpenAPI 3.1, `generate types`, bundled `objectstack.json` |
| **10** | Performance Optimization | 1 week | Benchmark suite, bundle analyzer, tree-shaking, CI gate |
| **11** | Security Hardening | 1 week | SBOM, license audit, compliance schemas (GDPR/SOC2/HIPAA/PCI-DSS) |

</details>

---

## v4.0 — Enterprise Readiness

> **Target:** v4.0.0  
> **Timeline:** 2026 Q2–Q3 (~13 weeks)  
> **Based On:** [`ENTERPRISE_ASSESSMENT.md`](./ENTERPRISE_ASSESSMENT.md) — benchmark against Salesforce, ServiceNow, SAP, Dynamics 365  
> **Goal:** Close 23 critical enterprise gaps to achieve ~95% Salesforce parity and ~90% ServiceNow parity.

### Enterprise Maturity Scoring (v3.0 → v4.0 Target)

| Domain | v3.0 Score | Key Gaps | v4.0 Target |
|--------|-----------|----------|------------|
| **Data Model** | ⭐⭐⭐⭐ | Expression language, record types, custom metadata | ⭐⭐⭐⭐⭐ |
| **UI / Forms** | ⭐⭐⭐½ | Page layout engine, document generation, portal | ⭐⭐⭐⭐½ |
| **Automation** | ⭐⭐⭐⭐ | SLA engine, assignment rules, scheduled jobs | ⭐⭐⭐⭐⭐ |
| **Security** | ⭐⭐⭐⭐ | Audit trail API, delegated admin | ⭐⭐⭐⭐½ |
| **System / DevOps** | ⭐⭐⭐ | Deployment protocol, sandbox, fiscal calendar | ⭐⭐⭐⭐ |
| **AI / Intelligence** | ⭐⭐⭐⭐ | Predictive analytics, model governance | ⭐⭐⭐⭐½ |

---

### Stage 1 — v4.0-alpha: Core Protocol Expansion (6 weeks)

#### Phase 12: Data Model Completeness — 3 weeks

> Close all critical data model gaps vs. Salesforce/ServiceNow.

| # | Task | Priority | New File |
|---|------|----------|----------|
| 12.1 | Expression Language Spec (functions, type system, variables) | 🔴 Critical | `data/expression.zod.ts` |
| 12.2 | Record Types (business process variants per object) | 🔴 Critical | Add to `data/object.zod.ts` |
| 12.3 | Custom Metadata Types (deployable config records) | 🔴 Critical | `data/custom-metadata.zod.ts` |
| 12.4 | Duplicate Detection Rules | 🟡 High | `data/duplicate-rule.zod.ts` |
| 12.5 | Multi-Currency Management (exchange rates, corporate currency) | 🟡 High | `data/currency.zod.ts` |
| 12.6 | Data Import/Export Wizard Protocol | 🟡 High | `data/data-import.zod.ts` |

**Checklist:**

- [ ] Create expression language spec with function catalog, type system, and system variables
- [ ] Add record types to object schema with picklist filtering and layout mapping
- [ ] Create custom metadata types for deployable configuration records
- [ ] Create duplicate detection rules with fuzzy/exact/phonetic matching
- [ ] Create multi-currency management with exchange rates and conversion
- [ ] Create data import/export wizard protocol with field mapping and validation

#### Phase 13: UI & Reporting Enhancement — 3 weeks

> Match Salesforce page layouts and reporting capabilities.

| # | Task | Priority | New File |
|---|------|----------|----------|
| 13.1 | Page Layout / Form Layout Engine | 🔴 Critical | `ui/page-layout.zod.ts` |
| 13.2 | Document Generation Templates (PDF, DOCX) | 🟡 High | `ui/document-template.zod.ts` |
| 13.3 | Report Scheduling & Subscriptions | 🟡 High | Enhance `ui/report.zod.ts` |
| 13.4 | Dashboard Drill-Down & Drill-Through | 🟡 High | Enhance `ui/dashboard.zod.ts` |
| 13.5 | Portal / Community Protocol | 🟡 High | `ui/portal.zod.ts` |
| 13.6 | Advanced Report Features (formulas, conditional formatting, snapshots) | 🟡 Medium | Enhance `ui/report.zod.ts` |

**Checklist:**

- [ ] Create page layout engine with sections, columns, related lists, compact layout
- [ ] Create document generation templates (PDF/DOCX/HTML) with variable binding
- [ ] Add report scheduling and subscription delivery
- [ ] Add dashboard drill-down with dynamic filter passing
- [ ] Create portal protocol for external user access (customer/partner/vendor)
- [ ] Add conditional formatting, report formulas, and analytic snapshots

---

### Stage 2 — v4.0-beta: Automation & Operations (4 weeks)

#### Phase 14: Automation Maturity — 2 weeks

> Close SLA engine and assignment rule gaps for ITSM/customer service.

| # | Task | Priority | New File |
|---|------|----------|----------|
| 14.1 | SLA / Entitlement Engine (milestones, business hours) | 🔴 Critical | `automation/sla.zod.ts` |
| 14.2 | Queue / Assignment Rules (routing, round-robin, skill-based) | 🟡 High | `automation/assignment-rule.zod.ts` |
| 14.3 | Scheduled Job Protocol (general-purpose recurring tasks) | 🔴 Critical | `automation/scheduled-job.zod.ts` |
| 14.4 | Inbound Capture Protocol (email-to-case, web-to-lead) | 🟡 High | `integration/inbound-capture.zod.ts` |

**Checklist:**

- [ ] Create SLA engine with milestones, business hours, escalation, and pause conditions
- [ ] Create queue and assignment rules with round-robin, skill-based, and load-balanced routing
- [ ] Create standalone scheduled job protocol with dependency chains and concurrency control
- [ ] Create inbound capture protocol for email/web/social record creation

#### Phase 15: System & DevOps — 2 weeks

> Enable enterprise CI/CD for metadata with structured deployment.

| # | Task | Priority | New File |
|---|------|----------|----------|
| 15.1 | Deployment / Change Management Protocol | 🔴 Critical | `system/deployment.zod.ts` |
| 15.2 | Sandbox / Environment Management | 🔴 Critical | `system/sandbox.zod.ts` |
| 15.3 | Fiscal Year / Business Calendar | 🟡 High | `system/fiscal-calendar.zod.ts` |
| 15.4 | Audit Trail Query Protocol | 🟡 High | Enhance `security/audit.zod.ts` |
| 15.5 | Delegated Administration Protocol | 🟡 High | `security/delegated-admin.zod.ts` |

**Checklist:**

- [ ] Create deployment protocol with packages, validation, rollback, and history
- [ ] Create sandbox management with metadata/data cloning and PII masking
- [ ] Create fiscal year and business calendar protocol
- [ ] Enhance audit trail with structured query protocol
- [ ] Create delegated administration protocol with scoped capabilities

---

### Stage 3 — v4.0-GA: Intelligence & Contracts (3 weeks)

#### Phase 16: AI & Intelligence — 2 weeks

> Match Salesforce Einstein and ServiceNow Predictive Intelligence.

| # | Task | Priority | New File |
|---|------|----------|----------|
| 16.1 | Predictive Analytics Integration (scoring, forecasting) | 🟡 High | Enhance `ai/predictive.zod.ts` |
| 16.2 | AI Model Governance (bias, explainability, audit) | 🟡 High | `ai/governance.zod.ts` |
| 16.3 | Process Mining Protocol | 🟡 Medium | `ai/process-mining.zod.ts` |
| 16.4 | Recommendation Engine Protocol | 🟡 Medium | `ai/recommendation.zod.ts` |

**Checklist:**

- [ ] Enhance predictive analytics with object-level prediction definitions and drift monitoring
- [ ] Create AI governance protocol with bias detection, explainability, and audit logging
- [ ] Create process mining protocol for workflow optimization insights
- [ ] Create recommendation engine protocol for next-best-action suggestions

#### Phase 17: Service Contract Expansion — 1 week

> Complete the service contract layer for all new protocols.

| # | Task | Priority | New File |
|---|------|----------|----------|
| 17.1 | IAuditService contract | 🟡 High | `contracts/audit-service.ts` |
| 17.2 | IDeploymentService contract | 🟡 High | `contracts/deployment-service.ts` |
| 17.3 | ISLAService contract | 🟡 High | `contracts/sla-service.ts` |
| 17.4 | ISchedulerService contract | 🟡 Medium | `contracts/scheduler-service.ts` |
| 17.5 | IDocumentService contract | 🟡 Medium | `contracts/document-service.ts` |
| 17.6 | IPortalService contract | 🟡 Medium | `contracts/portal-service.ts` |

**Checklist:**

- [ ] Create IAuditService contract for audit trail querying and management
- [ ] Create IDeploymentService contract for package deployment and rollback
- [ ] Create ISLAService contract for SLA evaluation and escalation
- [ ] Create ISchedulerService contract for scheduled job management
- [ ] Create IDocumentService contract for document generation
- [ ] Create IPortalService contract for external user portal management

---

### v4.0 Timeline

```
Stage 1 — v4.0-alpha (2026 Q2, 6 weeks)
 ├── Phase 12: Data Model Completeness      [3 weeks]  → Expression language, record types, custom metadata
 └── Phase 13: UI & Reporting Enhancement   [3 weeks]  → Page layouts, document templates, portal

Stage 2 — v4.0-beta (2026 Q3, 4 weeks)
 ├── Phase 14: Automation Maturity          [2 weeks]  → SLA engine, assignment rules, scheduled jobs
 └── Phase 15: System & DevOps             [2 weeks]  → Deployment, sandbox, audit trail

Stage 3 — v4.0-GA (2026 Q3–Q4, 3 weeks)
 ├── Phase 16: AI & Intelligence           [2 weeks]  → Predictive analytics, model governance
 └── Phase 17: Service Contracts           [1 week]   → 6 new service interfaces

Total: ~13 weeks (3 months)
New schemas: ~18 files + ~12 enhancements
New tests: ~18 files + ~500 tests
New contracts: 6 service interfaces
```

### v4.0 Success Criteria

| Metric | v3.0 (Current) | v4.0 (Target) |
|--------|----------------|---------------|
| Spec schema files | 175 | ~193 (+18) |
| Spec test files | 195 | ~213 (+18) |
| Spec test count | 5,269 | ~5,769 (+500) |
| Service contracts | 25 | 31 (+6) |
| Enterprise gap count | 23 critical/high | 0 critical, < 5 medium |
| Salesforce parity | ~75% | ~95% |
| ServiceNow parity | ~70% | ~90% |

---

## Parallel Tracks

### Developer Experience — [`DX_ROADMAP.md`](./DX_ROADMAP.md)

| Phase | Title | Status |
|-------|-------|--------|
| 1 | First Five Minutes (Onboarding) | ✅ Complete (9/10) |
| 2 | Schema DX Helpers | ✅ Complete |
| 3 | Documentation & Reference | ✅ Complete (16/16) |
| 4 | CLI & Tooling DX | 🔄 Active |
| 5 | Studio as DX Hub | 📋 Planned |
| 6 | Ecosystem & Community | 📋 Planned |

### Studio Visual IDE — [`apps/studio/ROADMAP.md`](./apps/studio/ROADMAP.md)

| Phase | Title | Status |
|-------|-------|--------|
| 0 | Foundation Hardening (v2.1) | 📋 Planned |
| 1 | Data Protocol Designers (v2.2) | 📋 Planned |
| 2 | UI Protocol Designers (v2.3) | 📋 Planned |
| 3 | Automation Protocol (v2.4) | 📋 Planned |
| 4 | Security & Identity (v2.5) | 📋 Planned |
| 5 | AI & Intelligence (v2.6) | 📋 Planned |
| 6 | API & Integration (v2.7) | 📋 Planned |
| 7 | System & DevOps (v2.8) | 📋 Planned |
| 8 | Studio Platform Evolution (v3.0) | 📋 Planned |

---

## Related Documents

| Document | Location | Status |
|----------|----------|--------|
| Enterprise Assessment | `ENTERPRISE_ASSESSMENT.md` | 📋 v4.0 Reference |
| DX Roadmap | `DX_ROADMAP.md` | 🔄 Active (Phase 4–6) |
| Studio Roadmap | `apps/studio/ROADMAP.md` | 🔄 Active (Phase 0–8) |
| Architecture | `ARCHITECTURE.md` | ✅ Current |
| V3 Migration Guide | `packages/spec/V3_MIGRATION_GUIDE.md` | ✅ Current |
| Protocol Registry | `packages/spec/PROTOCOL_MAP.md` | ✅ Current |
| Release Notes | `RELEASE_NOTES.md` | ✅ Current |
| Changelog | `CHANGELOG.md` | ✅ Current |

---

**Last Updated:** 2026-02-13  
**Maintainers:** ObjectStack Core Team  
**Status:** ✅ v3.0 Released | 📋 v4.0 Enterprise Readiness — Planning
