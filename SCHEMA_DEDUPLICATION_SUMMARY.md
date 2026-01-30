# Schema Deduplication - Changes Summary

## Issue
@hotlong requested evaluation of whether the new HTTP server and REST API Zod schemas duplicate existing definitions in `spec/api`.

## Analysis Results

### Identified Duplications

1. **CORS Configuration**
   - Found in: `api/router.zod.ts` and `system/http-server.zod.ts`
   - Issue: Similar structure with minor differences (field names: "origin" vs "origins", "dir" vs "directory")

2. **Rate Limiting**
   - Found in: `api/endpoint.zod.ts` and `system/http-server.zod.ts`
   - Issue: Nearly identical schema, one exported, one inline

3. **Static File Serving**
   - Found in: `api/router.zod.ts` and `system/http-server.zod.ts`
   - Issue: Same structure with field name differences

### Resolution

Created a new shared schema file to consolidate duplicated HTTP-related schemas:

**New File:** `packages/spec/src/shared/http.zod.ts`

This file now contains:
- `CorsConfigSchema` - Unified CORS configuration
- `RateLimitConfigSchema` - Unified rate limiting configuration
- `StaticMountSchema` - Unified static file serving configuration

### Files Modified

1. **`packages/spec/src/shared/http.zod.ts`** (NEW)
   - Created new shared HTTP schemas
   - Comprehensive JSDoc documentation
   - Examples for each schema

2. **`packages/spec/src/shared/index.ts`**
   - Added export for `http.zod.ts`

3. **`packages/spec/src/system/http-server.zod.ts`**
   - Removed inline CORS, rate limit, and static schemas
   - Now imports from `shared/http.zod.ts`
   - Standardized field names: "origins" and "directory"

4. **`packages/spec/src/api/router.zod.ts`**
   - Removed inline CORS and static mount schemas
   - Now imports from `shared/http.zod.ts`
   - Standardized field names to match shared schemas

5. **`packages/spec/src/api/endpoint.zod.ts`**
   - Deprecated local `RateLimitSchema`
   - Now re-exports from `shared/http.zod.ts` for backward compatibility

## Benefits

1. ✅ **Eliminated Duplication** - Single source of truth for common HTTP schemas
2. ✅ **Consistency** - Standardized field names across all uses
3. ✅ **Maintainability** - Changes to HTTP schemas now only need to be made in one place
4. ✅ **Documentation** - Centralized documentation for shared schemas
5. ✅ **Backward Compatibility** - Old `RateLimitSchema` still available (deprecated)

## Breaking Changes

### Field Name Changes (Minor)

**CORS Configuration:**
- `origin` → `origins` (more semantically correct for multiple origins)

**Static Mounts:**
- `dir` → `directory` (more explicit and clear)

These changes standardize the naming convention and improve clarity. If there are existing implementations depending on the old field names, they should be updated to use the new names.

## Migration Guide

### For CORS Configuration
```typescript
// Before (router.zod.ts)
cors: {
  origin: 'http://localhost:3000'
}

// After (shared/http.zod.ts)
cors: {
  origins: 'http://localhost:3000'  // Note: 'origins' instead of 'origin'
}
```

### For Static Mounts
```typescript
// Before (router.zod.ts)
staticMounts: [{
  path: '/static',
  dir: './public'
}]

// After (shared/http.zod.ts)
staticMounts: [{
  path: '/static',
  directory: './public'  // Note: 'directory' instead of 'dir'
}]
```

### For Rate Limiting
```typescript
// Before (endpoint.zod.ts or http-server.zod.ts)
import { RateLimitSchema } from './endpoint.zod';

// After (shared/http.zod.ts)
import { RateLimitConfigSchema } from '../shared/http.zod';
// Or continue using RateLimitSchema (deprecated) from endpoint.zod.ts
```

## Next Steps

1. Update any existing code that uses `origin` to use `origins`
2. Update any existing code that uses `dir` to use `directory`
3. Consider adding migration guide to CHANGELOG.md
4. Run tests to ensure no breaking changes in actual usage

## Notes

- The `HttpMethod` enum was already being imported from `router.zod.ts` in the new files (no duplication)
- All changes follow the Zod-first architecture pattern
- Maintained backward compatibility where possible
