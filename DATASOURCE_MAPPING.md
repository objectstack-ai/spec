# Datasource Mapping Feature

## Overview

The `datasourceMapping` feature provides a centralized mechanism to configure which datasources (drivers) are used by different parts of your application. Instead of configuring `datasource` on every individual object, you can define routing rules based on:

- **Namespace**: Route all objects from a package namespace to a specific datasource
- **Package ID**: Route all objects from a specific package to a datasource  
- **Object Pattern**: Route objects matching a name pattern (glob-style) to a datasource
- **Default**: Fallback rule for objects that don't match any other rules

This feature is inspired by industry-proven patterns from Django's Database Router and Kubernetes' StorageClass.

## Priority Resolution

The system resolves datasources in the following priority order (first match wins):

1. **Object's explicit `datasource` field** (if set and not 'default')
2. **DatasourceMapping rules** (evaluated in order or by priority)
3. **Package's `defaultDatasource`** (from manifest)
4. **Global default driver**

## Configuration

### Basic Example

```typescript
// apps/server/objectstack.config.ts
import { defineStack } from '@objectstack/spec';
import { DriverPlugin } from '@objectstack/runtime';
import { TursoDriver } from '@objectstack/driver-turso';
import { InMemoryDriver } from '@objectstack/driver-memory';
import CrmApp from '../../examples/app-crm/objectstack.config';
import TodoApp from '../../examples/app-todo/objectstack.config';

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
    new AppPlugin(CrmApp),    // namespace: 'crm'
    new AppPlugin(TodoApp),   // namespace: 'todo'
  ],
  
  // 🎯 Centralized datasource routing configuration
  datasourceMapping: [
    // System core objects → Turso (persistent storage)
    { objectPattern: 'sys_*', datasource: 'turso' },
    { namespace: 'auth', datasource: 'turso' },
    
    // CRM application → Memory (dev/test environment)
    { namespace: 'crm', datasource: 'memory' },
    
    // Todo application → Turso (production storage)
    { namespace: 'todo', datasource: 'turso' },
    
    // Temporary/cache objects → Memory
    { objectPattern: 'temp_*', datasource: 'memory' },
    { objectPattern: 'cache_*', datasource: 'memory' },
    
    // Default fallback → Turso
    { default: true, datasource: 'turso' },
  ],
});
```

### Advanced: Priority-Based Rules

```typescript
datasourceMapping: [
  // High priority rules (lower number = higher priority)
  { objectPattern: 'sys_*', datasource: 'turso', priority: 10 },
  { namespace: 'auth', datasource: 'turso', priority: 10 },
  
  // Medium priority rules
  { package: 'com.example.crm', datasource: 'memory', priority: 50 },
  { namespace: 'crm', datasource: 'memory', priority: 50 },
  
  // Low priority rules
  { objectPattern: 'temp_*', datasource: 'memory', priority: 100 },
  
  // Default fallback (lowest priority)
  { default: true, datasource: 'turso', priority: 1000 },
]
```

### Package-Level Configuration

You can also set a default datasource at the package level:

```typescript
// examples/app-crm/objectstack.config.ts
export default defineStack({
  manifest: {
    id: 'com.example.crm',
    namespace: 'crm',
    version: '3.0.0',
    defaultDatasource: 'memory',  // All CRM objects use memory by default
  },
  
  objects: Object.values(objects),  // All objects inherit 'memory'
  // ...
});
```

## Rule Types

### 1. Namespace Matching

Routes all objects from a specific namespace to a datasource:

```typescript
{ namespace: 'crm', datasource: 'memory' }
```

All objects in the `crm` namespace (e.g., `crm__account`, `crm__contact`) will use the `memory` datasource.

### 2. Package Matching

Routes all objects from a specific package to a datasource:

```typescript
{ package: 'com.example.analytics', datasource: 'clickhouse' }
```

All objects defined in the `com.example.analytics` package will use the `clickhouse` datasource.

### 3. Pattern Matching (Glob-Style)

Routes objects matching a name pattern to a datasource:

```typescript
{ objectPattern: 'sys_*', datasource: 'turso' }
{ objectPattern: 'temp_*', datasource: 'memory' }
{ objectPattern: 'cache_*', datasource: 'redis' }
```

Supports wildcards:
- `*` matches any characters
- `?` matches a single character

### 4. Default Fallback

Catches all objects that don't match any other rules:

```typescript
{ default: true, datasource: 'turso' }
```

## Use Cases

### 1. System vs Application Data Separation

```typescript
datasourceMapping: [
  // System/core data → PostgreSQL (ACID, durable)
  { objectPattern: 'sys_*', datasource: 'postgres' },
  { namespace: 'auth', datasource: 'postgres' },
  
  // Application data → Memory (fast, ephemeral)
  { default: true, datasource: 'memory' },
]
```

### 2. Multi-Environment Setup

```typescript
datasourceMapping: [
  // Development: use memory for speed
  { namespace: 'crm', datasource: process.env.NODE_ENV === 'production' ? 'turso' : 'memory' },
  
  // Production: persistent storage
  { default: true, datasource: 'turso' },
]
```

### 3. Performance Optimization

```typescript
datasourceMapping: [
  // Hot data → Redis (cache)
  { objectPattern: 'cache_*', datasource: 'redis' },
  { objectPattern: 'session_*', datasource: 'redis' },
  
  // Analytics → ClickHouse (OLAP)
  { namespace: 'analytics', datasource: 'clickhouse' },
  
  // Regular data → PostgreSQL (OLTP)
  { default: true, datasource: 'postgres' },
]
```

### 4. Testing Isolation

```typescript
datasourceMapping: [
  // Test objects → In-memory (no persistence)
  { objectPattern: 'test_*', datasource: 'memory' },
  
  // Production objects → Turso
  { default: true, datasource: 'turso' },
]
```

## Benefits

1. **Centralized Configuration**: All datasource routing in one place
2. **No Object Modification**: Change datasources without touching object definitions
3. **Environment-Specific**: Different datasources per environment (dev/test/prod)
4. **Pattern-Based**: Flexible glob patterns for batch configuration
5. **Explicit Override**: Objects can still override with explicit `datasource` field

## Migration from Individual Configuration

### Before (Manual Configuration)

```typescript
// Every object needs datasource field
const Account = defineObject({
  name: 'account',
  datasource: 'memory',  // Repeated everywhere
  fields: { /* ... */ },
});

const Contact = defineObject({
  name: 'contact',
  datasource: 'memory',  // Repeated everywhere
  fields: { /* ... */ },
});
```

### After (Centralized Configuration)

```typescript
// Configure once at stack level
datasourceMapping: [
  { namespace: 'crm', datasource: 'memory' },
]

// Objects are clean
const Account = defineObject({
  name: 'account',
  // No datasource field needed
  fields: { /* ... */ },
});
```

## Debugging

Enable debug logging to see datasource resolution:

```typescript
// ObjectQL will log:
// "Resolved datasource from mapping: object=crm__account, datasource=memory"
// "Resolved datasource from package manifest: object=task, package=com.example.todo, datasource=turso"
```

## Best Practices

1. **Use Specific Rules First**: Place high-priority rules at the top
2. **Always Have a Default**: Include a default fallback rule
3. **Group by Purpose**: Organize rules by function (system, cache, analytics, etc.)
4. **Document Decisions**: Add comments explaining why each rule exists
5. **Test Thoroughly**: Verify that objects route to expected datasources
