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
      };

      const result = SpaceResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate ListSpacesResponse', () => {
      const validResponse = {
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
        id: 'com.acme.crm',
        version: '1.0.0',
        name: 'Advanced CRM',
        description: 'Enterprise CRM solution',
        vendor: {
          id: 'com.acme',
          name: 'Acme Corporation',
          verified: true,
          trustLevel: 'verified' as const,
        },
      };

      const result = PublishPluginRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should validate SearchPluginsResponse', () => {
      const validResponse = {
        data: [
          {
            id: 'com.acme.crm',
            version: '1.0.0',
            name: 'Advanced CRM',
            vendor: {
              id: 'com.acme',
              name: 'Acme Corporation',
              verified: true,
              trustLevel: 'verified' as const,
            },
            deprecated: false,
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
        spaceId: '550e8400-e29b-41d4-a716-446655440000',
        planCode: 'enterprise_v1',
        expiresAt: '2025-12-31T23:59:59Z',
        customFeatures: ['advanced_analytics'],
        customLimits: {
          storage_gb: 500,
        },
        plugins: ['com.acme.crm'],
      };

      const result = IssueLicenseRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should validate ValidateLicenseResponse', () => {
      const validResponse = {
        valid: true,
        license: {
          spaceId: '550e8400-e29b-41d4-a716-446655440000',
          planCode: 'enterprise_v1',
          status: 'active' as const,
          issuedAt: '2024-01-01T00:00:00Z',
        },
        errors: [],
        warnings: [],
      };

      const result = ValidateLicenseResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate failed license validation', () => {
      const invalidResponse = {
        valid: false,
        errors: ['License has expired', 'Invalid signature'],
        warnings: [],
      };

      const result = ValidateLicenseResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.valid).toBe(false);
        expect(result.data.errors).toHaveLength(2);
      }
    });
  });

  describe('Composer Service', () => {
    it('should validate CompileManifestRequest', () => {
      const validRequest = {
        bom: {
          tenantId: 'tenant_123',
          dependencies: [
            {
              id: 'com.objectstack.crm',
              version: '2.0.0',
              configuration: {
                currency: 'USD',
              },
            },
          ],
          resolutionStrategy: 'override' as const,
        },
        runtimeVersion: '1.5.0',
        dryRun: false,
      };

      const result = CompileManifestRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });
  });

  describe('Health & Monitoring', () => {
    it('should validate HubHealthResponse', () => {
      const validResponse = {
        status: 'healthy' as const,
        version: '1.0.0',
        uptime: 86400,
        services: {
          database: {
            status: 'healthy' as const,
            latency: 5,
          },
          cache: {
            status: 'healthy' as const,
            latency: 2,
          },
        },
        timestamp: '2024-01-01T12:00:00Z',
      };

      const result = HubHealthResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate HubMetricsResponse', () => {
      const validResponse = {
        metrics: {
          spaces: {
            total: 1250,
            active: 980,
            created_last_30d: 45,
          },
          tenants: {
            total: 320,
            active: 285,
          },
          plugins: {
            total: 156,
            published_last_30d: 8,
            total_downloads: 456789,
          },
          api: {
            requests_per_minute: 850,
            avg_response_time: 125,
            error_rate: 0.002,
          },
        },
        timestamp: '2024-01-01T12:00:00Z',
      };

      const result = HubMetricsResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });
});
