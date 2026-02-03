import { describe, expect, it } from 'vitest';
import {
  RegistrySyncPolicySchema,
  RegistryUpstreamSchema,
  RegistryConfigSchema,
  PluginCategorySchema,
  PluginLicenseSchema,
  PluginMarketplaceListingSchema,
  PluginSearchQuerySchema,
  PluginInstallationRequestSchema,
} from './marketplace-enhanced.zod';

describe('Marketplace Enhanced Schemas', () => {
  describe('RegistrySyncPolicySchema', () => {
    it('should validate sync policies', () => {
      expect(() => RegistrySyncPolicySchema.parse('manual')).not.toThrow();
      expect(() => RegistrySyncPolicySchema.parse('auto')).not.toThrow();
      expect(() => RegistrySyncPolicySchema.parse('proxy')).not.toThrow();
    });

    it('should reject invalid sync policy', () => {
      expect(() => RegistrySyncPolicySchema.parse('invalid')).toThrow();
    });
  });

  describe('RegistryUpstreamSchema', () => {
    it('should validate basic upstream configuration', () => {
      const upstream = {
        url: 'https://plugins.objectstack.com',
        syncPolicy: 'auto' as const,
      };
      const result = RegistryUpstreamSchema.parse(upstream);
      expect(result.url).toBe('https://plugins.objectstack.com');
      expect(result.syncPolicy).toBe('auto');
      expect(result.timeout).toBe(30000);
    });

    it('should validate upstream with authentication', () => {
      const upstream = {
        url: 'https://registry.acme.com',
        syncPolicy: 'auto' as const,
        syncInterval: 3600,
        auth: {
          type: 'bearer' as const,
          token: 'eyJhbGciOiJIUzI1NiIs...',
        },
        tls: {
          enabled: true,
          verifyCertificate: true,
        },
        retry: {
          maxAttempts: 5,
          backoff: 'exponential' as const,
        },
      };
      const result = RegistryUpstreamSchema.parse(upstream);
      expect(result.auth?.type).toBe('bearer');
      expect(result.syncInterval).toBe(3600);
      expect(result.retry?.maxAttempts).toBe(5);
    });

    it('should validate upstream with API key authentication', () => {
      const upstream = {
        url: 'https://private-registry.example.com',
        syncPolicy: 'manual' as const,
        auth: {
          type: 'api-key' as const,
          apiKey: 'sk-1234567890abcdef',
        },
      };
      const result = RegistryUpstreamSchema.parse(upstream);
      expect(result.auth?.type).toBe('api-key');
      expect(result.auth?.apiKey).toBe('sk-1234567890abcdef');
    });
  });

  describe('RegistryConfigSchema', () => {
    it('should validate public registry', () => {
      const config = {
        type: 'public' as const,
        storage: {
          backend: 's3' as const,
          path: 'objectstack-plugins',
        },
        visibility: 'public' as const,
        cache: {
          enabled: true,
          ttl: 3600,
        },
      };
      const result = RegistryConfigSchema.parse(config);
      expect(result.type).toBe('public');
      expect(result.visibility).toBe('public');
    });

    it('should validate private registry with scopes', () => {
      const config = {
        type: 'private' as const,
        scope: ['@acme', '@enterprise'],
        defaultScope: '@acme',
        storage: {
          backend: 'local' as const,
          path: '/var/lib/objectstack/plugins',
        },
        visibility: 'private' as const,
        accessControl: {
          requireAuthForRead: true,
          requireAuthForWrite: true,
          allowedPrincipals: ['team:engineering', 'team:platform'],
        },
      };
      const result = RegistryConfigSchema.parse(config);
      expect(result.type).toBe('private');
      expect(result.scope).toHaveLength(2);
      expect(result.defaultScope).toBe('@acme');
      expect(result.accessControl?.requireAuthForRead).toBe(true);
    });

    it('should validate hybrid registry with federation', () => {
      const config = {
        type: 'hybrid' as const,
        upstream: [
          {
            url: 'https://plugins.objectstack.com',
            syncPolicy: 'auto' as const,
            syncInterval: 7200,
          },
          {
            url: 'https://npmjs.org',
            syncPolicy: 'proxy' as const,
          },
        ],
        scope: ['@my-company'],
        storage: {
          backend: 's3' as const,
          path: 'my-company-plugins',
        },
        visibility: 'internal' as const,
        cache: {
          enabled: true,
          ttl: 7200,
          maxSize: 10737418240, // 10GB
        },
        mirrors: [
          {
            url: 'https://mirror1.example.com',
            priority: 1,
          },
          {
            url: 'https://mirror2.example.com',
            priority: 2,
          },
        ],
      };
      const result = RegistryConfigSchema.parse(config);
      expect(result.type).toBe('hybrid');
      expect(result.upstream).toHaveLength(2);
      expect(result.upstream?.[0].syncPolicy).toBe('auto');
      expect(result.upstream?.[1].syncPolicy).toBe('proxy');
      expect(result.mirrors).toHaveLength(2);
    });

    it('should validate registry with GCS storage', () => {
      const config = {
        type: 'private' as const,
        storage: {
          backend: 'gcs' as const,
          path: 'my-bucket/plugins',
          credentials: {
            projectId: 'my-project',
            keyFile: '/path/to/keyfile.json',
          },
        },
      };
      const result = RegistryConfigSchema.parse(config);
      expect(result.storage?.backend).toBe('gcs');
    });
  });

  describe('PluginCategorySchema', () => {
    it('should validate all plugin categories', () => {
      const categories = [
        'data-integration',
        'analytics',
        'ai-ml',
        'automation',
        'communication',
        'crm',
        'erp',
        'productivity',
        'security',
        'ui-components',
        'utilities',
        'developer-tools',
        'other',
      ];
      
      categories.forEach(category => {
        expect(() => PluginCategorySchema.parse(category)).not.toThrow();
      });
    });
  });

  describe('PluginLicenseSchema', () => {
    it('should validate free license', () => {
      const license = {
        type: 'free' as const,
        spdxId: 'MIT',
        commercialUse: true,
        attributionRequired: false,
      };
      const result = PluginLicenseSchema.parse(license);
      expect(result.type).toBe('free');
      expect(result.commercialUse).toBe(true);
    });

    it('should validate freemium license with pricing', () => {
      const license = {
        type: 'freemium' as const,
        pricing: {
          freeTier: true,
          trialDays: 30,
          model: 'per-user' as const,
          pricePerUnit: 999, // $9.99
          billingPeriod: 'monthly' as const,
          currency: 'USD',
        },
      };
      const result = PluginLicenseSchema.parse(license);
      expect(result.type).toBe('freemium');
      expect(result.pricing?.trialDays).toBe(30);
      expect(result.pricing?.pricePerUnit).toBe(999);
    });

    it('should validate enterprise license', () => {
      const license = {
        type: 'enterprise' as const,
        commercialUse: true,
        licenseUrl: 'https://acme.com/license',
      };
      const result = PluginLicenseSchema.parse(license);
      expect(result.type).toBe('enterprise');
    });
  });

  describe('PluginSearchQuerySchema', () => {
    it('should validate basic search query', () => {
      const query = {
        query: 'analytics dashboard',
      };
      const result = PluginSearchQuerySchema.parse(query);
      expect(result.query).toBe('analytics dashboard');
      expect(result.sortOrder).toBe('desc');
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('should validate advanced search query', () => {
      const query = {
        query: 'data connector',
        category: 'data-integration' as const,
        tags: ['sql', 'postgres', 'mysql'],
        minRating: 4.0,
        minQualityScore: 80,
        certifiedOnly: true,
        freeOnly: false,
        sortBy: 'popularity' as const,
        sortOrder: 'desc' as const,
        page: 2,
        pageSize: 50,
      };
      const result = PluginSearchQuerySchema.parse(query);
      expect(result.category).toBe('data-integration');
      expect(result.tags).toHaveLength(3);
      expect(result.minRating).toBe(4.0);
      expect(result.certifiedOnly).toBe(true);
    });
  });

  describe('PluginInstallationRequestSchema', () => {
    it('should validate basic installation request', () => {
      const request = {
        pluginId: 'com.acme.analytics',
        acceptLicense: true,
      };
      const result = PluginInstallationRequestSchema.parse(request);
      expect(result.pluginId).toBe('com.acme.analytics');
      expect(result.autoEnable).toBe(true);
      expect(result.scope).toBe('global');
    });

    it('should validate installation with specific version and config', () => {
      const request = {
        pluginId: 'com.acme.crm-connector',
        version: '2.1.0',
        config: {
          apiKey: 'sk-...',
          endpoint: 'https://api.acme.com',
        },
        acceptLicense: true,
        grantPermissions: ['read-data', 'write-data'],
        autoEnable: true,
        scope: 'tenant' as const,
        tenantId: 'tenant-123',
      };
      const result = PluginInstallationRequestSchema.parse(request);
      expect(result.version).toBe('2.1.0');
      expect(result.scope).toBe('tenant');
      expect(result.tenantId).toBe('tenant-123');
      expect(result.grantPermissions).toHaveLength(2);
    });
  });

  describe('PluginMarketplaceListingSchema', () => {
    it('should validate complete marketplace listing', () => {
      const listing = {
        pluginId: 'com.objectstack.analytics',
        name: 'ObjectStack Analytics',
        shortDescription: 'Advanced analytics and reporting for ObjectStack',
        description: '# ObjectStack Analytics\n\nComprehensive analytics solution...',
        publisher: {
          id: 'objectstack',
          name: 'ObjectStack Inc.',
          website: 'https://objectstack.com',
          verified: true,
        },
        categories: ['analytics' as const, 'productivity' as const],
        tags: [
          { name: 'analytics', category: 'feature' as const },
          { name: 'reporting', category: 'feature' as const },
        ],
        versions: [
          {
            pluginId: 'com.objectstack.analytics',
            version: {
              major: 1,
              minor: 0,
              patch: 0,
            },
            versionString: '1.0.0',
            releaseDate: new Date().toISOString(),
            support: {
              status: 'active' as const,
              securitySupport: true,
            },
          },
        ],
        latestVersion: '1.0.0',
        icon: 'https://cdn.objectstack.com/plugins/analytics/icon.png',
        license: {
          type: 'freemium' as const,
          pricing: {
            freeTier: true,
            model: 'per-user' as const,
          },
        },
        statistics: {
          downloads: 5000,
          activeInstallations: 1500,
        },
        publishedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      const result = PluginMarketplaceListingSchema.parse(listing);
      expect(result.name).toBe('ObjectStack Analytics');
      expect(result.publisher.verified).toBe(true);
      expect(result.categories).toHaveLength(2);
      expect(result.statistics.downloads).toBe(5000);
    });
  });
});
