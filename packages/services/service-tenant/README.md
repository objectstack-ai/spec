# @objectstack/service-tenant

Multi-tenant context management and routing service for ObjectStack.

> **⚠️ Architectural upgrade (v4.1): Environment-per-Database**
>
> Starting in v4.1 this package ships the **environment-per-database**
> isolation model described in [ADR-0002](../../../docs/adr/0002-environment-database-isolation.md).
> Each `environment` (prod / sandbox / dev / test / preview / …) gets its
> **own physical database**, registered in the new control-plane objects
> `sys_environment`, `sys_environment_database`, `sys_database_credential`,
> and `sys_environment_member`.
>
> The legacy `sys_tenant_database` (per-organization DB) registry is
> **deprecated** and kept as a v4.x shim only. It will be **removed in
> v5.0** together with `TenantDatabaseSchema`. Run
> `migrateV4ToV5Environments()` (from `migrations/v4-to-v5-env-migration.ts`)
> before upgrading to v5.0. The migration is idempotent, non-destructive,
> and reuses your existing physical databases as each org's new `prod`
> environment DB — no data movement required.
>
> New integrations should use `EnvironmentProvisioningService`
> (`provisionOrganization()` + `provisionEnvironment()`) instead of
> `TenantProvisioningService`.

## Overview

This service provides comprehensive multi-tenant infrastructure for ObjectStack deployments, including:

- Tenant identification and context resolution
- **Environment registry + per-environment database provisioning** *(v4.1+)*
- **Rotatable, encrypted per-environment database credentials** *(v4.1+)*
- **Per-environment RBAC** *(v4.1+)*
- Turso Platform API integration for automated database provisioning
- Tenant database schema initialization
- Global control plane management
- Package installation per tenant

## Features

### Phase 1 (Complete)
- **Multiple Identification Sources**: Subdomain, custom domain, HTTP headers, JWT claims, session
- **UUID-Based Tenant Naming**: Immutable tenant identifiers (not organization slugs)
- **Tenant Context Caching**: Performance optimization for frequently accessed tenants
- **Flexible Configuration**: Priority-based identification source ordering

### Phase 2 (Complete)
- **Turso Platform API Integration**: Automated database creation via Turso Platform API
- **Tenant-Specific Auth Tokens**: Secure, database-specific authentication
- **Global Control Plane**: System objects for tenant registry and package installations
- **Schema Initialization**: Automated tenant database schema setup
- **Package Management**: Per-tenant package installation and schema migration

## Installation

```bash
pnpm add @objectstack/service-tenant
```

## Usage

### Basic Setup (Tenant Routing)

```typescript
import { createTenantPlugin } from '@objectstack/service-tenant';
import { ObjectKernel } from '@objectstack/core';

const kernel = new ObjectKernel();

// Create tenant plugin with routing configuration
const tenantPlugin = createTenantPlugin({
  routing: {
    enabled: true,
    identificationSources: ['header', 'custom_domain', 'jwt_claim'],
    tenantHeaderName: 'X-Tenant-ID',
    customDomainMapping: {
      'app.acme.com': '550e8400-e29b-41d4-a716-446655440000',
    },
  },
  registerSystemObjects: true, // Register control plane objects
});

await kernel.use(tenantPlugin);
await kernel.bootstrap();
```

### Tenant Provisioning

```typescript
import {
  TenantProvisioningService,
  TursoPlatformClient,
} from '@objectstack/service-tenant';

// Production mode: with Turso Platform API
const provisioningService = new TenantProvisioningService({
  turso: {
    apiToken: process.env.TURSO_API_TOKEN!,
    organization: 'my-org',
  },
  controlPlaneDriver: globalDriver, // Global control plane driver
  defaultRegion: 'us-east-1',
  databaseGroup: 'production-tenants',
});

// Provision a new tenant
const result = await provisioningService.provisionTenant({
  organizationId: 'org-123',
  plan: 'pro',
  region: 'us-west-2',
  storageLimitMb: 5120,
});

console.log('Tenant provisioned:', result.tenant);
// {
//   id: '550e8400-e29b-41d4-a716-446655440000',
//   databaseUrl: 'libsql://550e8400-e29b-41d4-a716-446655440000.turso.io',
//   authToken: '<encrypted-token>',
//   status: 'active',
//   ...
// }
```

### Development Mode (No Turso API)

```typescript
// Development/Mock mode: no Turso Platform API required
const devService = new TenantProvisioningService({
  defaultRegion: 'us-east-1',
});

const result = await devService.provisionTenant({
  organizationId: 'org-123',
  plan: 'free',
});

// Returns mock tenant with warnings
console.log(result.warnings);
// ['Running in mock mode - Turso Platform API credentials not configured']
```

### Schema Initialization

```typescript
import { TenantSchemaInitializer } from '@objectstack/service-tenant';

const initializer = new TenantSchemaInitializer();

// Initialize tenant database with base schema
await initializer.initializeTenantSchema(
  tenant.databaseUrl,
  tenant.authToken,
  baseObjects, // Optional: base objects to create
);

// Install package schema
await initializer.installPackageSchema(
  tenant.databaseUrl,
  tenant.authToken,
  packageObjects,
);
```

### Resolving Tenant Context

```typescript
import { TenantContextService } from '@objectstack/service-tenant';

const service = kernel.getService<TenantContextService>('tenant');

const context = await service.resolveTenantContext({
  hostname: 'app.acme.com',
  headers: {
    'X-Tenant-ID': '550e8400-e29b-41d4-a716-446655440000',
  },
  jwt: {
    organizationId: 'org-123',
  },
});

console.log(context);
// {
//   tenantId: '550e8400-e29b-41d4-a716-446655440000',
//   organizationId: 'org-123',
//   databaseUrl: 'libsql://550e8400-e29b-41d4-a716-446655440000.turso.io',
//   plan: 'pro'
// }
```

## Architecture

### Tenant Identification Flow

```
Request → TenantContextService → Identification Sources (in order)
                                  ↓
                           1. Subdomain
                           2. Custom Domain
                           3. HTTP Header
                           4. JWT Claim
                           5. Session
                           6. Default Tenant
                                  ↓
                           Tenant Context
```

### UUID-Based Naming

Tenant databases use UUID naming instead of organization slugs:

- **Why**: Organization slugs can be modified, UUIDs are immutable
- **Format**: `{uuid}.turso.io` (e.g., `550e8400-e29b-41d4-a716-446655440000.turso.io`)
- **Benefit**: Stable database URLs regardless of organization name changes

## Configuration

### TenantRoutingConfig

```typescript
interface TenantRoutingConfig {
  // Enable multi-tenant mode
  enabled: boolean;

  // Identification strategy (in order of precedence)
  identificationSources: TenantIdentificationSource[];

  // Default tenant ID (for single-tenant or fallback)
  defaultTenantId?: string;

  // Subdomain pattern for tenant extraction
  subdomainPattern?: string;

  // Custom domain to tenant ID mapping
  customDomainMapping?: Record<string, string>;

  // Header name for tenant ID
  tenantHeaderName: string; // Default: 'X-Tenant-ID'

  // JWT claim name for organization ID
  jwtOrganizationClaim: string; // Default: 'organizationId'
}
```

## Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## License

Apache-2.0
