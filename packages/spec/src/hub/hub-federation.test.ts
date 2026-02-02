import { describe, it, expect } from 'vitest';
import {
  RegionSchema,
  HubInstanceSchema,
  FederationTopologySchema,
  TenantPlacementPolicySchema,
  ReplicationJobSchema,
  EdgeLocationSchema,
} from './hub-federation.zod';

describe('Hub Federation Protocol', () => {
  describe('Region', () => {
    it('should validate region with all fields', () => {
      const validRegion = {
        id: 'us-east-1',
        name: 'US East (N. Virginia)',
        location: {
          continent: 'NA' as const,
          country: 'US',
          city: 'Virginia',
          latitude: 37.5407,
          longitude: -77.4360,
        },
        provider: {
          name: 'aws' as const,
          region: 'us-east-1',
        },
        capabilities: {
          databases: ['postgres', 'redis'] as const,
          storage: ['s3'] as const,
          compute: ['containers', 'serverless'] as const,
          cdn: true,
        },
        compliance: ['soc2', 'iso27001'] as const,
        status: 'active' as const,
      };

      const result = RegionSchema.safeParse(validRegion);
      expect(result.success).toBe(true);
    });

    it('should reject invalid region ID format', () => {
      const invalidRegion = {
        id: 'invalid_region',
        name: 'Invalid Region',
        location: {
          continent: 'NA' as const,
          country: 'US',
        },
        status: 'active' as const,
      };

      const result = RegionSchema.safeParse(invalidRegion);
      expect(result.success).toBe(false);
    });
  });

  describe('HubInstance', () => {
    it('should validate primary hub instance', () => {
      const validHub = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        regionId: 'us-east-1',
        role: 'primary' as const,
        endpoints: {
          api: 'https://api.objectstack.com',
          admin: 'https://admin.objectstack.com',
          grpc: 'grpc://hub.objectstack.com:443',
        },
        version: '1.0.0',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      const result = HubInstanceSchema.safeParse(validHub);
      expect(result.success).toBe(true);
    });

    it('should validate secondary hub with replication config', () => {
      const validHub = {
        id: '650e8400-e29b-41d4-a716-446655440000',
        regionId: 'eu-west-1',
        role: 'secondary' as const,
        endpoints: {
          api: 'https://eu-api.objectstack.com',
        },
        replication: {
          primaryHubId: '550e8400-e29b-41d4-a716-446655440000',
          lagTolerance: 10,
          mode: 'async' as const,
        },
        version: '1.0.0',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      const result = HubInstanceSchema.safeParse(validHub);
      expect(result.success).toBe(true);
    });
  });

  describe('FederationTopology', () => {
    it('should validate complete federation topology', () => {
      const validTopology = {
        id: '750e8400-e29b-41d4-a716-446655440000',
        name: 'Global ObjectStack Federation',
        regions: [
          {
            id: 'us-east-1',
            name: 'US East',
            location: {
              continent: 'NA' as const,
              country: 'US',
            },
            status: 'active' as const,
            compliance: [],
          },
        ],
        hubs: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            regionId: 'us-east-1',
            role: 'primary' as const,
            endpoints: {
              api: 'https://api.objectstack.com',
            },
            version: '1.0.0',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z',
          },
        ],
        routing: {
          strategy: 'geo-proximity' as const,
          failover: {
            enabled: true,
            maxRetries: 3,
            timeout: 5000,
          },
        },
        synchronization: {
          scope: {
            plugins: true,
            tenants: true,
            spaces: false,
            licenses: true,
          },
          frequency: 'realtime' as const,
          conflictResolution: 'last-write-wins' as const,
        },
      };

      const result = FederationTopologySchema.safeParse(validTopology);
      expect(result.success).toBe(true);
    });
  });

  describe('TenantPlacementPolicy', () => {
    it('should validate tenant placement with data residency', () => {
      const validPolicy = {
        tenantId: 'tenant_123',
        primaryRegion: 'eu-west-1',
        replicaRegions: ['eu-central-1'],
        dataResidency: {
          continent: 'EU' as const,
          prohibitedRegions: ['us-east-1'],
        },
        failover: {
          enabled: true,
          preferredOrder: ['eu-central-1', 'eu-north-1'],
          maxLatency: 100,
        },
      };

      const result = TenantPlacementPolicySchema.safeParse(validPolicy);
      expect(result.success).toBe(true);
    });
  });

  describe('ReplicationJob', () => {
    it('should validate replication job', () => {
      const validJob = {
        id: '850e8400-e29b-41d4-a716-446655440000',
        type: 'incremental' as const,
        sourceHubId: '550e8400-e29b-41d4-a716-446655440000',
        targetHubIds: ['650e8400-e29b-41d4-a716-446655440000'],
        scope: {
          resourceType: 'plugin' as const,
          resourceIds: [],
        },
        status: 'running' as const,
        progress: {
          total: 100,
          completed: 45,
          failed: 0,
        },
        createdAt: '2024-01-01T00:00:00Z',
        startedAt: '2024-01-01T00:05:00Z',
        errors: [],
      };

      const result = ReplicationJobSchema.safeParse(validJob);
      expect(result.success).toBe(true);
    });
  });

  describe('EdgeLocation', () => {
    it('should validate edge location', () => {
      const validEdge = {
        id: 'edge-sfo-1',
        regionId: 'us-west-1',
        location: {
          continent: 'NA' as const,
          country: 'US',
          city: 'San Francisco',
        },
        cache: {
          resources: ['plugins', 'static-assets'] as const,
          ttl: 3600,
          maxSize: 10737418240, // 10GB
        },
        status: 'active' as const,
      };

      const result = EdgeLocationSchema.safeParse(validEdge);
      expect(result.success).toBe(true);
    });
  });
});
