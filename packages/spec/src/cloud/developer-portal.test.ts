import { describe, it, expect } from 'vitest';
import {
  DeveloperAccountStatusSchema,
  ApiKeyScopeSchema,
  DeveloperApiKeySchema,
  DeveloperAccountSchema,
  ReleaseChannelSchema,
  VersionReleaseSchema,
  CreateListingRequestSchema,
  UpdateListingRequestSchema,
  ListingActionRequestSchema,
  AnalyticsTimeRangeSchema,
  PublishingAnalyticsRequestSchema,
  PublishingAnalyticsResponseSchema,
  TimeSeriesPointSchema,
} from './developer-portal.zod';

describe('DeveloperAccountStatusSchema', () => {
  it('should accept all valid statuses', () => {
    const statuses = ['pending', 'active', 'suspended', 'deactivated'];
    statuses.forEach(status => {
      expect(() => DeveloperAccountStatusSchema.parse(status)).not.toThrow();
    });
  });

  it('should reject invalid status', () => {
    expect(() => DeveloperAccountStatusSchema.parse('banned')).toThrow();
  });
});

describe('ApiKeyScopeSchema', () => {
  it('should accept all valid scopes', () => {
    const scopes = ['publish', 'read', 'manage', 'admin'];
    scopes.forEach(scope => {
      expect(() => ApiKeyScopeSchema.parse(scope)).not.toThrow();
    });
  });
});

describe('DeveloperApiKeySchema', () => {
  it('should accept minimal API key', () => {
    const key = {
      id: 'key-001',
      label: 'CI/CD Pipeline',
      scopes: ['publish'],
      createdAt: '2025-06-01T00:00:00Z',
    };
    const parsed = DeveloperApiKeySchema.parse(key);
    expect(parsed.active).toBe(true);
  });

  it('should accept full API key', () => {
    const key = {
      id: 'key-001',
      label: 'CI/CD Pipeline',
      scopes: ['publish', 'read'],
      prefix: 'os_pk_ab',
      expiresAt: '2026-06-01T00:00:00Z',
      createdAt: '2025-06-01T00:00:00Z',
      lastUsedAt: '2025-09-15T10:30:00Z',
      active: true,
    };
    const parsed = DeveloperApiKeySchema.parse(key);
    expect(parsed.scopes).toHaveLength(2);
    expect(parsed.prefix).toBe('os_pk_ab');
  });

  it('should require at least one scope', () => {
    const key = {
      id: 'key-001',
      label: 'Empty',
      scopes: [],
      createdAt: '2025-06-01T00:00:00Z',
    };
    expect(() => DeveloperApiKeySchema.parse(key)).toThrow();
  });
});

describe('DeveloperAccountSchema', () => {
  it('should accept minimal account', () => {
    const account = {
      id: 'dev-001',
      publisherId: 'pub-001',
      organizationName: 'Acme Corp',
      email: 'dev@acme.com',
      registeredAt: '2025-01-15T10:00:00Z',
    };
    const parsed = DeveloperAccountSchema.parse(account);
    expect(parsed.status).toBe('pending');
    expect(parsed.verification).toBe('unverified');
  });

  it('should accept full account with team members', () => {
    const account = {
      id: 'dev-001',
      publisherId: 'pub-001',
      status: 'active' as const,
      verification: 'verified' as const,
      organizationName: 'Acme Corp',
      email: 'dev@acme.com',
      teamMembers: [
        { userId: 'user-001', role: 'owner' as const, joinedAt: '2025-01-15T10:00:00Z' },
        { userId: 'user-002', role: 'developer' as const },
      ],
      agreementVersion: '2.0',
      registeredAt: '2025-01-15T10:00:00Z',
    };
    const parsed = DeveloperAccountSchema.parse(account);
    expect(parsed.teamMembers).toHaveLength(2);
    expect(parsed.status).toBe('active');
  });

  it('should require valid email', () => {
    const account = {
      id: 'dev-001',
      publisherId: 'pub-001',
      organizationName: 'Acme Corp',
      email: 'not-an-email',
      registeredAt: '2025-01-15T10:00:00Z',
    };
    expect(() => DeveloperAccountSchema.parse(account)).toThrow();
  });
});

describe('ReleaseChannelSchema', () => {
  it('should accept all channels', () => {
    const channels = ['alpha', 'beta', 'rc', 'stable'];
    channels.forEach(channel => {
      expect(() => ReleaseChannelSchema.parse(channel)).not.toThrow();
    });
  });
});

describe('VersionReleaseSchema', () => {
  it('should accept minimal release', () => {
    const release = {
      version: '1.0.0',
    };
    const parsed = VersionReleaseSchema.parse(release);
    expect(parsed.channel).toBe('stable');
    expect(parsed.deprecated).toBe(false);
  });

  it('should accept beta release with changelog', () => {
    const release = {
      version: '2.0.0-beta.1',
      channel: 'beta' as const,
      releaseNotes: '## Beta Release\n\nNew pipeline view',
      changelog: [
        { type: 'added' as const, description: 'New pipeline view' },
        { type: 'fixed' as const, description: 'Fixed pagination bug' },
      ],
      minPlatformVersion: '1.2.0',
      artifactUrl: 'https://registry.objectstack.io/com.acme.crm-2.0.0-beta.1.tgz',
      artifactChecksum: 'sha256:abc123...',
      releasedAt: '2025-06-01T00:00:00Z',
    };
    const parsed = VersionReleaseSchema.parse(release);
    expect(parsed.channel).toBe('beta');
    expect(parsed.changelog).toHaveLength(2);
  });

  it('should accept deprecated release with message', () => {
    const release = {
      version: '1.0.0',
      deprecated: true,
      deprecationMessage: 'Please upgrade to v2.0.0',
    };
    const parsed = VersionReleaseSchema.parse(release);
    expect(parsed.deprecated).toBe(true);
    expect(parsed.deprecationMessage).toBe('Please upgrade to v2.0.0');
  });
});

describe('CreateListingRequestSchema', () => {
  it('should accept minimal listing creation', () => {
    const request = {
      packageId: 'com.acme.crm',
      name: 'Acme CRM',
      category: 'crm',
    };
    const parsed = CreateListingRequestSchema.parse(request);
    expect(parsed.pricing).toBe('free');
  });

  it('should accept full listing creation', () => {
    const request = {
      packageId: 'com.acme.crm',
      name: 'Acme CRM',
      tagline: 'Complete CRM for ObjectStack',
      description: '# Acme CRM\n\nFull-featured...',
      category: 'crm',
      tags: ['sales', 'pipeline'],
      iconUrl: 'https://acme.com/icon.png',
      screenshots: [{ url: 'https://acme.com/s1.png', caption: 'Dashboard' }],
      documentationUrl: 'https://docs.acme.com',
      supportUrl: 'https://support.acme.com',
      repositoryUrl: 'https://github.com/acme/crm',
      pricing: 'freemium' as const,
      priceInCents: 999,
    };
    const parsed = CreateListingRequestSchema.parse(request);
    expect(parsed.screenshots).toHaveLength(1);
  });

  it('should enforce tagline max length', () => {
    const request = {
      packageId: 'com.acme.crm',
      name: 'Test',
      category: 'other',
      tagline: 'x'.repeat(121),
    };
    expect(() => CreateListingRequestSchema.parse(request)).toThrow();
  });
});

describe('UpdateListingRequestSchema', () => {
  it('should accept partial update', () => {
    const request = {
      listingId: 'listing-001',
      tagline: 'Updated tagline',
    };
    const parsed = UpdateListingRequestSchema.parse(request);
    expect(parsed.tagline).toBe('Updated tagline');
    expect(parsed.name).toBeUndefined();
  });
});

describe('ListingActionRequestSchema', () => {
  it('should accept all listing actions', () => {
    const actions = ['submit', 'unlist', 'deprecate', 'reactivate'];
    actions.forEach(action => {
      const request = { listingId: 'listing-001', action };
      expect(() => ListingActionRequestSchema.parse(request)).not.toThrow();
    });
  });

  it('should accept action with reason', () => {
    const request = {
      listingId: 'listing-001',
      action: 'deprecate' as const,
      reason: 'Replaced by com.acme.crm-v2',
    };
    const parsed = ListingActionRequestSchema.parse(request);
    expect(parsed.reason).toBe('Replaced by com.acme.crm-v2');
  });
});

describe('AnalyticsTimeRangeSchema', () => {
  it('should accept all time ranges', () => {
    const ranges = ['last_7d', 'last_30d', 'last_90d', 'last_365d', 'all_time'];
    ranges.forEach(range => {
      expect(() => AnalyticsTimeRangeSchema.parse(range)).not.toThrow();
    });
  });
});

describe('PublishingAnalyticsRequestSchema', () => {
  it('should accept minimal request', () => {
    const request = { listingId: 'listing-001' };
    const parsed = PublishingAnalyticsRequestSchema.parse(request);
    expect(parsed.timeRange).toBe('last_30d');
  });

  it('should accept request with specific metrics', () => {
    const request = {
      listingId: 'listing-001',
      timeRange: 'last_90d' as const,
      metrics: ['installs', 'ratings', 'revenue'],
    };
    const parsed = PublishingAnalyticsRequestSchema.parse(request);
    expect(parsed.metrics).toHaveLength(3);
  });
});

describe('TimeSeriesPointSchema', () => {
  it('should accept data point', () => {
    const point = { date: '2025-06-01', value: 42 };
    const parsed = TimeSeriesPointSchema.parse(point);
    expect(parsed.value).toBe(42);
  });
});

describe('PublishingAnalyticsResponseSchema', () => {
  it('should accept analytics response', () => {
    const response = {
      listingId: 'listing-001',
      timeRange: 'last_30d' as const,
      summary: {
        totalInstalls: 5000,
        activeInstalls: 3200,
        totalUninstalls: 800,
        averageRating: 4.5,
        totalRatings: 120,
        totalRevenue: 99900,
        pageViews: 15000,
      },
      timeSeries: {
        installs: [
          { date: '2025-06-01', value: 45 },
          { date: '2025-06-02', value: 52 },
        ],
      },
      ratingDistribution: {
        1: 2,
        2: 5,
        3: 15,
        4: 48,
        5: 50,
      },
    };
    const parsed = PublishingAnalyticsResponseSchema.parse(response);
    expect(parsed.summary.totalInstalls).toBe(5000);
    expect(parsed.timeSeries?.installs).toHaveLength(2);
    expect(parsed.ratingDistribution?.[5]).toBe(50);
  });
});
