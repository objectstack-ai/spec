# ObjectStack Phase 2 Implementation

This document describes the Phase 2 implementation of the ObjectStack Microkernel and Plugin Architecture Improvement Plan.

## Overview

Phase 2 implements the core runtime features for advanced plugin lifecycle management, dependency resolution, and security sandboxing. These components build upon the protocol definitions from Phase 1 and provide production-ready implementations.

## Components

### 1. Health Monitor (`health-monitor.ts`)

The Health Monitor provides real-time health checking and auto-recovery for plugins.

**Features:**
- Configurable health check intervals
- Automatic failure detection with thresholds
- Auto-restart with backoff strategies (fixed, linear, exponential)
- Health status tracking (healthy, degraded, unhealthy, failed, recovering, unknown)
- Metrics collection (uptime, memory, CPU, connections, error rate)

**Usage:**

```typescript
import { PluginHealthMonitor } from '@objectstack/core';

const monitor = new PluginHealthMonitor(logger);

// Register a plugin for monitoring
monitor.registerPlugin('my-plugin', {
  interval: 30000,           // Check every 30 seconds
  timeout: 5000,             // 5 second timeout
  failureThreshold: 3,       // Mark unhealthy after 3 failures
  successThreshold: 1,       // Mark healthy after 1 success
  autoRestart: true,         // Auto-restart on failure
  maxRestartAttempts: 3,     // Max 3 restart attempts
  restartBackoff: 'exponential',
});

// Start monitoring
monitor.startMonitoring('my-plugin', pluginInstance);

// Get health status
const status = monitor.getHealthStatus('my-plugin');
const report = monitor.getHealthReport('my-plugin');
```

### 2. Hot Reload Manager (`hot-reload.ts`)

The Hot Reload Manager enables zero-downtime plugin updates with state preservation.

**Features:**
- State preservation strategies (memory, disk, distributed, none)
- File watching integration points
- Debounced reload scheduling
- Graceful shutdown with configurable timeout
- Before/after reload hooks
- State checksum verification

**Usage:**

```typescript
import { HotReloadManager } from '@objectstack/core';

const hotReload = new HotReloadManager(logger);

// Register plugin for hot reload
hotReload.registerPlugin('my-plugin', {
  enabled: true,
  watchPatterns: ['src/**/*.ts'],
  debounceDelay: 1000,
  preserveState: true,
  stateStrategy: 'memory',
  shutdownTimeout: 30000,
  beforeReload: ['plugin:beforeReload'],
  afterReload: ['plugin:afterReload'],
});

// Trigger reload
await hotReload.reloadPlugin(
  'my-plugin',
  pluginInstance,
  '1.2.0',
  () => ({ /* current state */ }),
  (state) => { /* restore state */ }
);
```

### 3. Dependency Resolver (`dependency-resolver.ts`)

The Dependency Resolver provides semantic versioning and dependency management.

**Features:**
- Full SemVer parsing and comparison
- Version constraint matching (^, ~, >=, <=, <, >, -, *, latest)
- Topological sorting (Kahn's algorithm)
- Circular dependency detection
- Version conflict detection
- Compatibility level assessment
- Best version selection

**Usage:**

```typescript
import { 
  SemanticVersionManager, 
  DependencyResolver 
} from '@objectstack/core';

// Parse and compare versions
const v1 = SemanticVersionManager.parse('1.2.3');
const v2 = SemanticVersionManager.parse('1.3.0');
const cmp = SemanticVersionManager.compare(v1, v2); // -1

// Check if version satisfies constraint
const satisfies = SemanticVersionManager.satisfies(v1, '^1.0.0'); // true

// Get compatibility level
const compat = SemanticVersionManager.getCompatibilityLevel(v1, v2);
// 'backward-compatible'

// Resolve dependencies
const resolver = new DependencyResolver(logger);

const plugins = new Map([
  ['core', { dependencies: [] }],
  ['plugin-a', { dependencies: ['core'] }],
  ['plugin-b', { dependencies: ['core', 'plugin-a'] }],
]);

const order = resolver.resolve(plugins);
// ['core', 'plugin-a', 'plugin-b']

// Detect conflicts
const conflicts = resolver.detectConflicts(pluginsWithVersions);

// Find best version
const best = resolver.findBestVersion(
  ['1.0.0', '1.1.0', '1.2.0', '2.0.0'],
  ['^1.0.0', '>=1.1.0']
);
// '1.2.0'
```

### 4. Permission Manager (`security/permission-manager.ts`)

The Permission Manager enforces fine-grained access control for plugins.

**Features:**
- Resource-level permissions (data, UI, system, storage, network, process)
- Action-based access control (create, read, update, delete, execute, etc.)
- Permission scopes (global, tenant, user, resource, plugin)
- Grant/revoke mechanisms
- Permission expiration
- Required vs optional permissions
- Field-level access control

**Usage:**

```typescript
import { PluginPermissionManager } from '@objectstack/core/security';

const permManager = new PluginPermissionManager(logger);

// Register permissions
permManager.registerPermissions('my-plugin', {
  permissions: [
    {
      id: 'read-customer-data',
      resource: 'data.object',
      actions: ['read'],
      scope: 'plugin',
      description: 'Read customer data',
      required: true,
      filter: {
        resourceIds: ['customer'],
        fields: ['name', 'email'],
      },
    },
  ],
  defaultGrant: 'prompt',
});

// Grant permission
permManager.grantPermission('my-plugin', 'read-customer-data', 'admin');

// Check access
const result = permManager.checkAccess(
  'my-plugin',
  'data.object',
  'read',
  'customer'
);

if (result.allowed) {
  // Proceed with operation
}

// Check all required permissions
const hasAll = permManager.hasAllRequiredPermissions('my-plugin');
```

### 5. Sandbox Runtime (`security/sandbox-runtime.ts`)

The Sandbox Runtime provides isolated execution environments with resource limits.

**Features:**
- Multiple isolation levels (none, minimal, standard, strict, paranoid)
- File system access control (allowed/denied paths)
- Network access control (allowed/blocked hosts)
- Process spawning control
- Environment variable access control
- Resource limit enforcement (memory, CPU, connections)
- Resource usage monitoring

**Usage:**

```typescript
import { PluginSandboxRuntime } from '@objectstack/core/security';

const sandbox = new PluginSandboxRuntime(logger);

// Create sandbox
const context = sandbox.createSandbox('my-plugin', {
  enabled: true,
  level: 'standard',
  filesystem: {
    mode: 'restricted',
    allowedPaths: ['/app/plugins/my-plugin'],
    deniedPaths: ['/etc', '/root'],
  },
  network: {
    mode: 'restricted',
    allowedHosts: ['api.example.com'],
    blockedHosts: ['malicious.com'],
    maxConnections: 10,
  },
  process: {
    allowSpawn: false,
  },
  memory: {
    maxHeap: 100 * 1024 * 1024, // 100 MB
  },
});

// Check resource access
const fileAccess = sandbox.checkResourceAccess(
  'my-plugin',
  'file',
  '/app/plugins/my-plugin/data.json'
);

const netAccess = sandbox.checkResourceAccess(
  'my-plugin',
  'network',
  'https://api.example.com/data'
);

// Check resource limits
const { withinLimits, violations } = sandbox.checkResourceLimits('my-plugin');

// Get resource usage
const usage = sandbox.getResourceUsage('my-plugin');
```

### 6. Security Scanner (`security/security-scanner.ts`)

The Security Scanner performs comprehensive security analysis of plugins.

**Features:**
- Code vulnerability scanning
- Dependency vulnerability detection (CVE database integration)
- Malware pattern detection
- License compliance checking
- Configuration security analysis
- Security scoring (0-100)
- Issue categorization (critical, high, medium, low, info)

**Usage:**

```typescript
import { PluginSecurityScanner } from '@objectstack/core/security';

const scanner = new PluginSecurityScanner(logger);

// Perform security scan
const result = await scanner.scan({
  pluginId: 'my-plugin',
  version: '1.0.0',
  files: ['src/**/*.ts'],
  dependencies: {
    'express': '4.18.0',
    'lodash': '4.17.21',
  },
});

console.log(`Security Score: ${result.score}/100`);
console.log(`Passed: ${result.passed}`);
console.log(`Issues:`, result.summary);

// Add vulnerability to database
scanner.addVulnerability('lodash', '4.17.20', {
  cve: 'CVE-2021-23337',
  severity: 'high',
  affectedVersions: ['<=4.17.20'],
  fixedIn: ['4.17.21'],
});

// Update vulnerability database
await scanner.updateVulnerabilityDatabase();
```

## Integration with Kernel

These components are designed to integrate with the existing ObjectKernel:

```typescript
import { 
  ObjectKernel,
  PluginHealthMonitor,
  HotReloadManager,
  DependencyResolver,
  PluginPermissionManager,
  PluginSandboxRuntime,
  PluginSecurityScanner
} from '@objectstack/core';

const kernel = new ObjectKernel({ logger: { level: 'info' } });

// Initialize Phase 2 components
const healthMonitor = new PluginHealthMonitor(kernel.logger);
const hotReload = new HotReloadManager(kernel.logger);
const depResolver = new DependencyResolver(kernel.logger);
const permManager = new PluginPermissionManager(kernel.logger);
const sandbox = new PluginSandboxRuntime(kernel.logger);
const scanner = new PluginSecurityScanner(kernel.logger);

// Register plugins with enhanced features
// ... plugin registration code ...

// Bootstrap kernel
await kernel.bootstrap();
```

## Testing

Comprehensive unit tests are provided for all components:

- `health-monitor.test.ts` - Health monitoring tests
- `dependency-resolver.test.ts` - SemVer and dependency resolution tests
- `security/permission-manager.test.ts` - Permission management tests

Run tests with:

```bash
npm test
```

## Performance Considerations

- Health checks run in separate intervals to avoid blocking
- State preservation uses checksums for integrity verification
- Dependency resolution uses efficient topological sorting
- Resource monitoring is throttled (default 5 seconds)
- Security scanning can be run asynchronously

## Security

- All permissions must be explicitly granted
- Sandbox provides multiple isolation levels
- Security scanner integrates with CVE databases
- Resource limits prevent DoS attacks
- State preservation uses checksums to detect tampering

## Future Enhancements

Phase 3 and beyond will add:
- Plugin marketplace integration
- AI-powered plugin development
- Enhanced monitoring and observability
- Distributed plugin management
- Advanced security features

## References

- [MICROKERNEL_IMPROVEMENT_PLAN.md](../../MICROKERNEL_IMPROVEMENT_PLAN.md)
- [ARCHITECTURE.md](../../ARCHITECTURE.md)
- [Protocol Definitions](../spec/src/system/)
