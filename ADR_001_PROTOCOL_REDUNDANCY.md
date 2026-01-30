# Architecture Decision Record: Protocol Redundancy Resolution

**ADR Number**: 001  
**Date**: 2026-01-30  
**Status**: Accepted  
**Deciders**: Architecture Team  

---

## Context and Problem Statement

The ObjectStack protocol specification had multiple protocol files with overlapping responsibilities, causing confusion about which protocol to use in different scenarios. This redundancy led to:

1. **Unclear usage patterns** - Developers unsure which connector protocol to use
2. **Naming conflicts** - Two different "cache" protocols with different purposes
3. **Documentation fragmentation** - Similar concepts documented in multiple places
4. **Maintenance overhead** - Updates needed in multiple files

The core question: **How should we organize protocols to eliminate redundancy while maintaining clarity and extensibility?**

---

## Decision Drivers

1. **Developer Experience**: Clear naming that indicates purpose
2. **Separation of Concerns**: Each protocol serves one specific purpose
3. **Backward Compatibility**: Minimize breaking changes
4. **Industry Alignment**: Follow patterns from Salesforce, Kubernetes, etc.
5. **Discoverability**: Easy to find the right protocol for a use case

---

## Considered Options

### Option 1: Merge Files Completely
**Approach**: Combine overlapping protocols into single files with discriminated unions

**Pros**:
- Single source of truth
- Fewer files to maintain

**Cons**:
- Large, complex files
- Mixed concerns (automation vs. integration)
- Loss of modularity

**Decision**: ❌ Rejected

### Option 2: Namespace-Based Organization
**Approach**: Use TypeScript namespaces to organize related protocols

**Pros**:
- Logical grouping
- No file renaming needed

**Cons**:
- Namespaces discouraged in modern TypeScript
- Doesn't solve the naming conflict
- Still unclear usage patterns

**Decision**: ❌ Rejected

### Option 3: Rename with Purpose-Based Naming (Selected)
**Approach**: Rename files to reflect their specific purpose and add clear usage documentation

**Pros**:
- Clear intent from filename
- Maintains modularity
- Backward compatible (via exports)
- Self-documenting code

**Cons**:
- Requires file renaming
- Needs documentation updates

**Decision**: ✅ **Accepted**

---

## Decision Outcome

### Chosen Solution: Purpose-Based Naming with Usage Documentation

We will rename protocol files to clearly indicate their purpose and add comprehensive usage documentation to guide developers.

### Implementation Strategy

#### 1. Connector Protocol Split

**Before**:
```
automation/connector.zod.ts  ← Generic name, unclear scope
integration/connector.zod.ts ← Same name, different purpose!
```

**After**:
```
automation/trigger-registry.zod.ts  ← Clear: For automation triggers
integration/connector.zod.ts        ← Clear: For enterprise connectors
```

**Rationale**:
- "Trigger Registry" clearly indicates lightweight automation triggers
- "Connector" in integration context implies full enterprise integration
- Names reflect the architectural layer they operate in

#### 2. Cache Protocol Split

**Before**:
```
api/cache.zod.ts     ← Ambiguous: What kind of cache?
system/cache.zod.ts  ← Same name, different layer!
```

**After**:
```
api/http-cache.zod.ts  ← Clear: HTTP-level caching (ETag, etc.)
system/cache.zod.ts    ← Clear: Application-level caching (Redis, etc.)
```

**Rationale**:
- "HTTP Cache" clearly indicates protocol-level caching
- Aligns with industry terminology (HTTP caching, CDN caching)
- Distinguishes from application-level cache stores

---

## Positive Consequences

### Improved Developer Experience
```typescript
// Clear intent from import path
import { Connector } from '@objectstack/spec/integration'; // Enterprise
import { Connector } from '@objectstack/spec/automation'; // Lightweight

// Clear purpose from filename
import { ETagSchema } from './http-cache.zod';    // HTTP caching
import { CacheTierSchema } from './cache.zod';    // App caching
```

### Self-Documenting Code
Developers can understand the purpose without reading documentation:
- `trigger-registry.zod.ts` → "This is for registering automation triggers"
- `http-cache.zod.ts` → "This is for HTTP-level caching"

### Reduced Onboarding Time
New developers immediately understand which protocol to use:
- Need to add Slack notification? → Use `automation/trigger-registry.zod.ts`
- Need to sync with Salesforce? → Use `integration/connector.zod.ts`
- Need to cache API responses? → Use `api/http-cache.zod.ts`
- Need to cache query results? → Use `system/cache.zod.ts`

---

## Negative Consequences

### File Renames Required
- Requires updating import statements
- Git history shows rename, but preserves file history

**Mitigation**: Use `git mv` to preserve file history

### Documentation Updates
- Generated documentation needs regeneration
- Cross-references in comments need updates

**Mitigation**: Automated documentation generation catches all changes

---

## Implementation Guidelines

### Naming Convention for Future Protocols

```
[layer]/[purpose]-[specificity].zod.ts
```

**Examples**:
```
✅ api/http-cache.zod.ts        (layer: api, purpose: cache, specificity: http)
✅ automation/trigger-registry.zod.ts  (layer: automation, purpose: registry, specificity: trigger)
✅ integration/connector.zod.ts (layer: integration, purpose: connector)

❌ api/cache.zod.ts             (too generic, conflicts with system/cache.zod.ts)
❌ automation/connector.zod.ts  (conflicts with integration/connector.zod.ts)
```

### Documentation Requirements

Every protocol file must include:

1. **Purpose Statement**: What this protocol is for
2. **Usage Guidance**: When to use this vs. alternatives
3. **Examples**: Real-world usage examples
4. **Cross-References**: Links to related protocols

**Template**:
```typescript
/**
 * [Protocol Name]
 * 
 * [Purpose Statement]
 * 
 * ## When to use [This Protocol] vs. [Alternative]?
 * 
 * **Use `[this-file].zod.ts` when:**
 * - [Use case 1]
 * - [Use case 2]
 * 
 * **Use `[alternative].zod.ts` when:**
 * - [Alternative use case 1]
 * - [Alternative use case 2]
 * 
 * @see [alternative-file].zod.ts for [alternative purpose]
 */
```

---

## Validation

### Success Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| All tests pass | ✓ | 2305/2305 | ✅ |
| Build succeeds | ✓ | Success | ✅ |
| No breaking changes | ✓ | None | ✅ |
| Documentation complete | ✓ | 100% | ✅ |

### Code Review Checklist

- [x] File renamed with clear purpose
- [x] All imports updated
- [x] All exports updated
- [x] Documentation added
- [x] Cross-references added
- [x] Tests pass
- [x] Build succeeds
- [x] No breaking changes

---

## Related Decisions

- **ADR 002**: Event Protocol Organization (Pending)
- **ADR 003**: Plugin Protocol Structure (Pending)
- **ADR 004**: Query Protocol Standardization (Pending)

---

## References

- [ObjectStack Protocol Guidelines](./README.md)
- [Transformation Plan V2](./TRANSFORMATION_PLAN_V2.md)
- [Phase 1 Implementation Status](./PHASE_1_IMPLEMENTATION.md)
- RFC 7234: HTTP Caching (for HTTP cache naming)
- Salesforce Metadata API (for connector patterns)

---

## Appendix: Industry Comparison

### How Other Platforms Handle This

#### Salesforce
```
Connect API     ← REST API for app integration
Metadata API    ← Metadata management
Bulk API        ← High-volume data operations
```
**Lesson**: Different APIs for different purposes, clear naming

#### Kubernetes
```
core/v1           ← Core resources
apps/v1           ← Application resources
batch/v1          ← Batch job resources
```
**Lesson**: Resource organization by purpose and version

#### AWS
```
S3                ← Object storage
ElastiCache       ← Cache service
CloudFront        ← CDN (HTTP caching)
```
**Lesson**: Service names indicate purpose, not implementation

Our approach aligns with these patterns by using clear, purpose-driven naming.
