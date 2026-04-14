# Datasource Mapping Feature - Implementation Summary

## Overview

Successfully implemented a centralized datasource mapping mechanism that allows developers to configure which datasources (drivers) different parts of the application use, without modifying individual object definitions.

## What Was Implemented

### 1. Schema Definitions (packages/spec/src/stack.zod.ts)

- **DatasourceMappingRuleSchema**: Zod schema defining routing rules with support for:
  - `namespace`: Match objects by namespace (e.g., 'crm', 'auth')
  - `package`: Match objects by package ID (e.g., 'com.example.crm')
  - `objectPattern`: Match objects by name pattern with glob support (e.g., 'sys_*', 'temp_*')
  - `default`: Fallback rule for unmatched objects
  - `datasource`: Target datasource name
  - `priority`: Optional priority for rule ordering (lower = higher priority)

- **ObjectStackDefinitionSchema**: Added `datasourceMapping` field to accept an array of routing rules

### 2. Manifest Extension (packages/spec/src/kernel/manifest.zod.ts)

- **ManifestSchema**: Added `defaultDatasource` field to allow package-level default datasource configuration

### 3. ObjectQL Engine Logic (packages/objectql/src/engine.ts)

- **Storage**: Added private fields for `datasourceMapping` rules and `manifests` registry
- **setDatasourceMapping()**: Public method to configure mapping rules
- **getDriver()**: Updated to implement 4-tier resolution priority:
  1. Object's explicit `datasource` field (if not 'default')
  2. DatasourceMapping rules (namespace/package/pattern matching)
  3. Package's `defaultDatasource` from manifest
  4. Global default driver
- **resolveDatasourceFromMapping()**: Evaluates rules in priority order and returns matched datasource
- **matchPattern()**: Implements glob-style pattern matching supporting `*` and `?` wildcards
- **registerApp()**: Updated to store manifests for defaultDatasource lookup

### 4. Runtime Integration (packages/runtime/src/app-plugin.ts)

- **AppPlugin.start()**: Calls `ql.setDatasourceMapping()` when `datasourceMapping` is present in the stack definition

### 5. Tests (packages/objectql/src/datasource-mapping.test.ts)

Created comprehensive test suite covering:
- Namespace-based routing
- Pattern-based routing (glob wildcards)
- Priority ordering
- Default fallback rules
- Explicit object datasource overrides

### 6. Documentation

- **DATASOURCE_MAPPING.md**: Complete feature documentation with examples and use cases
- **IMPLEMENTATION_SUMMARY.md**: This file

## Architecture Highlights

### Priority Resolution Order

```
1. Object.datasource (explicit) 
   ↓ if 'default' or undefined
2. datasourceMapping rules
   ↓ if no match
3. Manifest.defaultDatasource
   ↓ if not set
4. Global default driver
```

### Pattern Matching

The glob-style pattern matcher supports:
- `*` (matches any characters): `sys_*` → `sys_user`, `sys_role`, etc.
- `?` (matches single character): `temp_?` → `temp_1`, `temp_a`, etc.
- Exact matches: `account` → only `account`

### Industry Inspiration

This implementation draws from proven patterns:
- **Django's Database Router**: Multi-database routing based on app labels
- **Kubernetes StorageClass**: Declarative storage backend selection
- **Salesforce External Objects**: Datasource routing by object suffix

## Files Modified

```
M  packages/spec/src/stack.zod.ts
M  packages/spec/src/kernel/manifest.zod.ts
M  packages/objectql/src/engine.ts
M  packages/runtime/src/app-plugin.ts
A  packages/objectql/src/datasource-mapping.test.ts
A  DATASOURCE_MAPPING.md
A  IMPLEMENTATION_SUMMARY.md
```

## Usage Example

```typescript
// apps/server/objectstack.config.ts
export default defineStack({
  manifest: {
    id: 'com.objectstack.server',
    name: 'ObjectStack Server',
    version: '1.0.0',
  },
  
  plugins: [
    new ObjectQLPlugin(),
    new DriverPlugin(new TursoDriver({ url: 'file:./data/system.db' }), 'turso'),
    new DriverPlugin(new InMemoryDriver(), 'memory'),
    new AppPlugin(CrmApp),
  ],
  
  datasourceMapping: [
    // System objects → Turso
    { objectPattern: 'sys_*', datasource: 'turso' },
    { namespace: 'auth', datasource: 'turso' },
    
    // CRM → Memory
    { namespace: 'crm', datasource: 'memory' },
    
    // Default → Turso
    { default: true, datasource: 'turso' },
  ],
});
```

## Benefits

1. **Centralized Configuration**: All datasource routing in one place
2. **No Object Modification**: Change datasources without touching object definitions  
3. **Environment Flexibility**: Different datasources per environment (dev/test/prod)
4. **Pattern-Based Batch Config**: Configure multiple objects with one rule
5. **Backward Compatible**: Existing explicit `datasource` fields still work and take priority

## Testing

The test suite validates:
- ✅ Namespace matching works correctly
- ✅ Pattern matching with wildcards works correctly
- ✅ Priority ordering is respected
- ✅ Default fallback rules are applied
- ✅ Explicit object datasource overrides mapping rules

## Next Steps (Optional Enhancements)

1. Add read/write operation filtering (like Django's `db_for_read` vs `db_for_write`)
2. Support for conditional rules based on environment variables
3. Performance metrics for datasource routing decisions
4. Admin UI for visualizing datasource routing
5. Migration tools to help convert from explicit to centralized configuration

## Compatibility

- ✅ Fully backward compatible with existing code
- ✅ Objects with explicit `datasource` field continue to work
- ✅ No breaking changes to existing APIs
- ✅ TypeScript types are properly exported
