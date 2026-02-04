
import { describe, it, expect } from 'vitest';
import { 
  CreateSpaceRequestSchema, 
  SpaceResponseSchema,
  HubHealthResponseSchema,
  CreateTenantRequestSchema,
  TenantResponseSchema,
  IssueLicenseRequestSchema,
  LicenseResponseSchema,
  ValidateLicenseResponseSchema,
  CompileManifestRequestSchema,
  HubMetricsResponseSchema,
  PublishPluginRequestSchema,
  PluginResponseSchema
} from './hub.zod';

describe('Hub API Protocols', () => {

  it('validates CreateSpaceRequest', () => {
    const validRequest = {
      id: 'space-1',
      name: 'Development Space',
      slug: 'dev-space',
      ownerId: 'u1',
      region: 'us-east-1',
      config: {
        maxTenants: 5
      }
    };
    expect(CreateSpaceRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it('validates SpaceResponse', () => {
    const validResponse = {
      success: true,
      data: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Development Space',
        slug: 'dev-space',
        ownerId: 'u1',
        status: 'active', 
        runtime: { isolation: 'shared_schema' },
        bom: { tenantId: 't1', dependencies: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    expect(SpaceResponseSchema.safeParse(validResponse).success).toBe(true);
  });

  it('validates Tenant Operations', () => {
    const createTenant = {
      id: 'tenant-1',
      name: 'Acme Corp',
      spaceId: 'space-1',
      slug: 'acme',
      status: 'active',
      isolationLevel: 'shared_schema'
    };
    expect(CreateTenantRequestSchema.safeParse(createTenant).success).toBe(true);

    const tenantResponse = {
      success: true,
      data: {
        ...createTenant,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    expect(TenantResponseSchema.safeParse(tenantResponse).success).toBe(true);
  });

  it('validates License Operations', () => {
    const issueLicense = {
      spaceId: 'space-1',
      planCode: 'enterprise-starter',
      issuedTo: 'Acme Corp',
      contactEmail: 'admin@acme.com',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      features: ['api', 'sso']
    };
    expect(IssueLicenseRequestSchema.safeParse(issueLicense).success).toBe(true);

    const validateResponse = {
      success: true,
      data: {
        valid: true,
        license: {
            spaceId: 'space-1',
            planCode: 'enterprise-starter',
            status: 'active',
            issuedAt: new Date().toISOString()
        }
      }
    };
    expect(ValidateLicenseResponseSchema.safeParse(validateResponse).success).toBe(true);
  });

  it('validates Plugin Registry', () => {
    const publishPlugin = {
      id: 'com.example.plugin',
      version: '1.0.0',
      name: 'Example Plugin',
      description: 'Test plugin',
      category: 'integration',
      vendor: { 
        id: 'com.acme', 
        name: 'Acme', 
        verified: true, 
        trustLevel: 'verified' 
      },
      repository: 'https://github.com/example/plugin',
      license: 'MIT'
    };
    expect(PublishPluginRequestSchema.safeParse(publishPlugin).success).toBe(true);
  });

  it('validates Composer Operations', () => {
    const compileRequest = {
      bom: { 
        tenantId: "tenant-1",
        dependencies: []
      },
      runtimeVersion: '1.0.0',
      dryRun: true
    };
    expect(CompileManifestRequestSchema.safeParse(compileRequest).success).toBe(true);
  });

  it('validates System Health', () => {
    const healthResponse = {
      success: true,
      data: {
        status: 'healthy',
        version: '1.0.0',
        uptime: 3600,
        services: {
          database: { status: 'healthy' },
          redis: { status: 'healthy' }
        },
        timestamp: new Date().toISOString()
      }
    };
    expect(HubHealthResponseSchema.safeParse(healthResponse).success).toBe(true);
  });

  it('validates Metrics', () => {
    const metricsResponse = {
      success: true,
      data: {
        metrics: {
            spaces: { total: 10, active: 5 },
            tenants: { total: 20, active: 15 }
        },
        timestamp: new Date().toISOString()
      }
    };
    expect(HubMetricsResponseSchema.safeParse(metricsResponse).success).toBe(true);
  });

});
