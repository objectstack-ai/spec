import { describe, it, expect } from 'vitest';
import {
  CreateSpaceRequestSchema,
  UpdateSpaceRequestSchema,
  SpaceResponseSchema,
  ListSpacesResponseSchema,
  PublishPluginRequestSchema,
  SearchPluginsResponseSchema,
  IssueLicenseRequestSchema,
  ValidateLicenseResponseSchema,
  CompileManifestRequestSchema,
  HubHealthResponseSchema,
  HubMetricsResponseSchema,
} from './hub.zod';

describe('Hub API Protocol', () => {
  describe('Space Management', () => {
    it('should validate CreateSpaceRequest', () => {
      const validRequest = {
        name: 'My Workspace',
        slug: 'my-workspace',
        ownerId: 'user_123',
        runtime: {
          isolation: 'shared_schema' as const,
          quotas: {
            maxUsers: 50,
            maxStorage: 107374182400, // 100GB
            apiRateLimit: 10000,
          },
        },
      };

      const result = CreateSpaceRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject invalid slug format', () => {
      const invalidRequest = {
        name: 'My Workspace',
        slug: 'My_Invalid_Slug!',
        ownerId: 'user_123',
      };

      const result = CreateSpaceRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should validate UpdateSpaceRequest with partial data', () => {
      const validUpdate = {
        name: 'Updated Name',
      };

      const result = UpdateSpaceRequestSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate SpaceResponse', () => {
      const validResponse = {
        success: true,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Sales Team',
          slug: 'sales-team',
          ownerId: 'user_123',
          bom: {
            tenantId: 'tenant_123',
            dependencies: [],
            resolutionStrategy: 'override' as const,
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      };

      const result = SpaceResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate ListSpacesResponse', () => {
      const validResponse = {
        success: true,
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Sales Team',
            slug: 'sales-team',
            ownerId: 'user_123',
            bom: {
              tenantId: 'tenant_123',
              dependencies: [],
              resolutionStrategy: 'override' as const,
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          perPage: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      const result = ListSpacesResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Plugin Registry', () => {
    it('should validate PublishPluginRequest', () => {
      const validRequest = {
        pluginId: 'com.objectstack.crm',
        version: '1.0.0',
        authorId: 'org_objectstack',
        manifest: {
          name: 'CRM Plugin',
          version: '1.0.0',
          description: 'CRM features',
          author: 'ObjectStack',
          license: 'MIT',
        },
        readme: '# CRM Plugin\n...',
        changelog: '## 1.0.0\n- Initial release',
        tarballUrl: 'https://registry.objectstack.com/crm-1.0.0.tgz',
        signature: 'sha256:abc...',
      };

      const result = PublishPluginRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should validate SearchPluginsResponse', () => {
      const validResponse = {
        success: true,
        data: [
          {
            id: 'com.objectstack.crm',
            name: 'CRM',
            description: 'CRM system',
            author: 'ObjectStack',
            latestVersion: '2.0.0',
            updatedAt: '2024-01-01T00:00:00Z',
            tags: ['crm', 'sales'],
            verified: true,
            downloads: 1000,
            rating: 4.8,
          },
        ],
        pagination: {
          page: 1,
          perPage: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      const result = SearchPluginsResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('License Management', () => {
    it('should validate IssueLicenseRequest', () => {
      const validRequest = {
        tenantId: 'tenant_123',
        plan: 'enterprise' as const,
        issuedTo: 'Acme Corp',
        features: ['sso', 'audit_logs'],
        limits: {
          users: 100,
          storage: 1024,
        },
        expiresAt: '2025-01-01T00:00:00Z',
      };

      const result = IssueLicenseRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should validate ValidateLicenseResponse', () => {
      const validResponse = {
        success: true,
        data: {
          valid: true,
          license: {
            id: 'lic_123',
            tenantId: 'tenant_123',
            plan: 'enterprise',
            status: 'active',
            issuedTo: 'Acme Corp',
            issuedAt: '2024-01-01T00:00:00Z',
            expiresAt: '2025-01-01T00:00:00Z',
            features: ['sso'],
            limits: { users: 100 },
          },
        },
      };

      const result = ValidateLicenseResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate failed license validation', () => {
      const invalidResponse = {
        success: true,
        data: {
          valid: false,
          error: {
            code: 'license_expired',
            message: 'License has expired',
          },
        },
      };

      const result = ValidateLicenseResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(true); // Schema validation succeeds
      if (result.success) {
        expect(result.data.data.valid).toBe(false);
      }
    });
  });

  describe('Composer Services', () => {
    it('should validate CompileManifestRequest', () => {
      const validRequest = {
        source: {
          files: {
            'objectstack.config.ts': 'export default {}',
          },
        },
        options: {
          target: 'runtime' as const,
          minify: true,
        },
      };

      const result = CompileManifestRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });
  });

  describe('Health & Monitoring', () => {
    it('should validate HubHealthResponse', () => {
      const validResponse = {
        success: true,
        data: {
          status: 'healthy' as const,
          version: '1.0.0',
          uptime: 3600,
          services: {
            database: 'healthy',
            redis: 'healthy',
            registry: 'healthy',
          },
        },
      };

      const result = HubHealthResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate HubMetricsResponse', () => {
      const validResponse = {
        success: true,
        data: {
          activeTenants: 100,
          activeUsers: 5000,
          totalPlugins: 50,
          apiRequestsPerMinute: 1200,
          storageUsed: 1024000,
          timestamp: '2024-01-01T00:00:00Z',
        },
      };

      const result = HubMetricsResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });
});
