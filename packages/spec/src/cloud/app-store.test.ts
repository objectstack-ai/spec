import { describe, it, expect } from 'vitest';
import {
  ReviewModerationStatusSchema,
  UserReviewSchema,
  SubmitReviewRequestSchema,
  ListReviewsRequestSchema,
  ListReviewsResponseSchema,
  RecommendationReasonSchema,
  RecommendedAppSchema,
  AppDiscoveryRequestSchema,
  AppDiscoveryResponseSchema,
  SubscriptionStatusSchema,
  AppSubscriptionSchema,
  InstalledAppSummarySchema,
  ListInstalledAppsRequestSchema,
  ListInstalledAppsResponseSchema,
  PreviewRequestSchema,
  PreviewObjectSummarySchema,
  PreviewViewSummarySchema,
  PreviewResponseSchema,
} from './app-store.zod';

describe('ReviewModerationStatusSchema', () => {
  it('should accept all moderation statuses', () => {
    const statuses = ['pending', 'approved', 'flagged', 'rejected'];
    statuses.forEach(status => {
      expect(() => ReviewModerationStatusSchema.parse(status)).not.toThrow();
    });
  });
});

describe('UserReviewSchema', () => {
  it('should accept minimal review (rating only)', () => {
    const review = {
      id: 'rev-001',
      listingId: 'listing-001',
      userId: 'user-001',
      rating: 5,
      submittedAt: '2025-06-01T10:00:00Z',
    };
    const parsed = UserReviewSchema.parse(review);
    expect(parsed.moderationStatus).toBe('pending');
    expect(parsed.helpfulCount).toBe(0);
  });

  it('should accept full review with publisher response', () => {
    const review = {
      id: 'rev-001',
      listingId: 'listing-001',
      userId: 'user-001',
      displayName: 'John Doe',
      rating: 4,
      title: 'Great CRM plugin!',
      body: 'This plugin transformed our sales process. The pipeline view is excellent.',
      appVersion: '2.1.0',
      moderationStatus: 'approved' as const,
      helpfulCount: 12,
      publisherResponse: {
        body: 'Thank you for the kind review! We are glad you enjoy the pipeline view.',
        respondedAt: '2025-06-02T14:00:00Z',
      },
      submittedAt: '2025-06-01T10:00:00Z',
      updatedAt: '2025-06-02T14:00:00Z',
    };
    const parsed = UserReviewSchema.parse(review);
    expect(parsed.publisherResponse?.body).toContain('Thank you');
    expect(parsed.helpfulCount).toBe(12);
  });

  it('should enforce rating range 1-5', () => {
    const base = {
      id: 'rev-001',
      listingId: 'listing-001',
      userId: 'user-001',
      submittedAt: '2025-06-01T10:00:00Z',
    };
    expect(() => UserReviewSchema.parse({ ...base, rating: 0 })).toThrow();
    expect(() => UserReviewSchema.parse({ ...base, rating: 6 })).toThrow();
    expect(() => UserReviewSchema.parse({ ...base, rating: 1 })).not.toThrow();
    expect(() => UserReviewSchema.parse({ ...base, rating: 5 })).not.toThrow();
  });

  it('should enforce title max length', () => {
    const review = {
      id: 'rev-001',
      listingId: 'listing-001',
      userId: 'user-001',
      rating: 3,
      title: 'x'.repeat(201),
      submittedAt: '2025-06-01T10:00:00Z',
    };
    expect(() => UserReviewSchema.parse(review)).toThrow();
  });

  it('should enforce body max length', () => {
    const review = {
      id: 'rev-001',
      listingId: 'listing-001',
      userId: 'user-001',
      rating: 3,
      body: 'x'.repeat(5001),
      submittedAt: '2025-06-01T10:00:00Z',
    };
    expect(() => UserReviewSchema.parse(review)).toThrow();
  });
});

describe('SubmitReviewRequestSchema', () => {
  it('should accept minimal review submission', () => {
    const request = {
      listingId: 'listing-001',
      rating: 5,
    };
    const parsed = SubmitReviewRequestSchema.parse(request);
    expect(parsed.rating).toBe(5);
  });

  it('should accept review with title and body', () => {
    const request = {
      listingId: 'listing-001',
      rating: 4,
      title: 'Great app',
      body: 'Works perfectly for our needs.',
    };
    const parsed = SubmitReviewRequestSchema.parse(request);
    expect(parsed.title).toBe('Great app');
  });
});

describe('ListReviewsRequestSchema', () => {
  it('should accept minimal request', () => {
    const request = { listingId: 'listing-001' };
    const parsed = ListReviewsRequestSchema.parse(request);
    expect(parsed.sortBy).toBe('newest');
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(10);
  });

  it('should accept filtered request', () => {
    const request = {
      listingId: 'listing-001',
      sortBy: 'most-helpful' as const,
      rating: 5,
      page: 2,
      pageSize: 25,
    };
    const parsed = ListReviewsRequestSchema.parse(request);
    expect(parsed.rating).toBe(5);
  });

  it('should reject invalid page size', () => {
    expect(() => ListReviewsRequestSchema.parse({
      listingId: 'listing-001',
      pageSize: 0,
    })).toThrow();
    expect(() => ListReviewsRequestSchema.parse({
      listingId: 'listing-001',
      pageSize: 51,
    })).toThrow();
  });
});

describe('ListReviewsResponseSchema', () => {
  it('should accept empty response', () => {
    const response = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
    };
    const parsed = ListReviewsResponseSchema.parse(response);
    expect(parsed.items).toHaveLength(0);
  });

  it('should accept response with rating summary', () => {
    const response = {
      items: [{
        id: 'rev-001',
        listingId: 'listing-001',
        userId: 'user-001',
        rating: 5,
        submittedAt: '2025-06-01T10:00:00Z',
      }],
      total: 1,
      page: 1,
      pageSize: 10,
      ratingSummary: {
        averageRating: 4.5,
        totalRatings: 120,
        distribution: { 1: 2, 2: 5, 3: 15, 4: 48, 5: 50 },
      },
    };
    const parsed = ListReviewsResponseSchema.parse(response);
    expect(parsed.ratingSummary?.averageRating).toBe(4.5);
    expect(parsed.ratingSummary?.distribution[5]).toBe(50);
  });
});

describe('RecommendationReasonSchema', () => {
  it('should accept all recommendation reasons', () => {
    const reasons = [
      'popular-in-category', 'similar-users', 'complements-installed',
      'trending', 'new-release', 'editor-pick',
    ];
    reasons.forEach(reason => {
      expect(() => RecommendationReasonSchema.parse(reason)).not.toThrow();
    });
  });
});

describe('RecommendedAppSchema', () => {
  it('should accept recommended app', () => {
    const app = {
      listingId: 'listing-001',
      name: 'Acme CRM',
      tagline: 'Complete CRM for ObjectStack',
      iconUrl: 'https://acme.com/icon.png',
      category: 'crm' as const,
      pricing: 'freemium' as const,
      averageRating: 4.5,
      activeInstalls: 3200,
      reason: 'popular-in-category' as const,
    };
    const parsed = RecommendedAppSchema.parse(app);
    expect(parsed.reason).toBe('popular-in-category');
  });
});

describe('AppDiscoveryRequestSchema', () => {
  it('should accept empty discovery request', () => {
    const parsed = AppDiscoveryRequestSchema.parse({});
    expect(parsed.limit).toBe(10);
  });

  it('should accept personalized discovery request', () => {
    const request = {
      tenantId: 'tenant-001',
      categories: ['crm', 'analytics'],
      platformVersion: '1.5.0',
      limit: 20,
    };
    const parsed = AppDiscoveryRequestSchema.parse(request);
    expect(parsed.categories).toHaveLength(2);
  });
});

describe('AppDiscoveryResponseSchema', () => {
  it('should accept full discovery response', () => {
    const app = {
      listingId: 'listing-001',
      name: 'Acme CRM',
      category: 'crm' as const,
      pricing: 'free' as const,
      reason: 'editor-pick' as const,
    };
    const response = {
      featured: [app],
      recommended: [{ ...app, reason: 'popular-in-category' as const }],
      trending: [{ ...app, reason: 'trending' as const }],
      newArrivals: [{ ...app, reason: 'new-release' as const }],
      collections: [{
        id: 'col-001',
        name: 'Best for Small Business',
        apps: [app],
      }],
    };
    const parsed = AppDiscoveryResponseSchema.parse(response);
    expect(parsed.featured).toHaveLength(1);
    expect(parsed.collections).toHaveLength(1);
  });

  it('should accept minimal discovery response', () => {
    const response = {};
    const parsed = AppDiscoveryResponseSchema.parse(response);
    expect(parsed.featured).toBeUndefined();
  });
});

describe('SubscriptionStatusSchema', () => {
  it('should accept all subscription statuses', () => {
    const statuses = ['active', 'trialing', 'past-due', 'cancelled', 'expired'];
    statuses.forEach(status => {
      expect(() => SubscriptionStatusSchema.parse(status)).not.toThrow();
    });
  });
});

describe('AppSubscriptionSchema', () => {
  it('should accept active subscription', () => {
    const subscription = {
      id: 'sub-001',
      listingId: 'listing-001',
      tenantId: 'tenant-001',
      status: 'active' as const,
      plan: 'Professional',
      billingCycle: 'annual' as const,
      priceInCents: 11988,
      currentPeriodStart: '2025-01-01T00:00:00Z',
      currentPeriodEnd: '2026-01-01T00:00:00Z',
      autoRenew: true,
      createdAt: '2025-01-01T00:00:00Z',
    };
    const parsed = AppSubscriptionSchema.parse(subscription);
    expect(parsed.status).toBe('active');
    expect(parsed.autoRenew).toBe(true);
  });

  it('should accept trial subscription', () => {
    const subscription = {
      id: 'sub-002',
      listingId: 'listing-001',
      tenantId: 'tenant-001',
      status: 'trialing' as const,
      trialEndDate: '2025-07-01T00:00:00Z',
      createdAt: '2025-06-01T00:00:00Z',
    };
    const parsed = AppSubscriptionSchema.parse(subscription);
    expect(parsed.status).toBe('trialing');
    expect(parsed.trialEndDate).toBe('2025-07-01T00:00:00Z');
  });
});

describe('InstalledAppSummarySchema', () => {
  it('should accept installed app with update available', () => {
    const app = {
      listingId: 'listing-001',
      packageId: 'com.acme.crm',
      name: 'Acme CRM',
      iconUrl: 'https://acme.com/icon.png',
      installedVersion: '2.0.0',
      latestVersion: '2.1.0',
      updateAvailable: true,
      enabled: true,
      subscriptionStatus: 'active' as const,
      installedAt: '2025-03-01T00:00:00Z',
    };
    const parsed = InstalledAppSummarySchema.parse(app);
    expect(parsed.updateAvailable).toBe(true);
    expect(parsed.subscriptionStatus).toBe('active');
  });

  it('should accept minimal installed app', () => {
    const app = {
      listingId: 'listing-002',
      packageId: 'com.acme.utils',
      name: 'Acme Utils',
      installedVersion: '1.0.0',
      installedAt: '2025-06-01T00:00:00Z',
    };
    const parsed = InstalledAppSummarySchema.parse(app);
    expect(parsed.updateAvailable).toBe(false);
    expect(parsed.enabled).toBe(true);
  });
});

describe('ListInstalledAppsRequestSchema', () => {
  it('should accept empty request', () => {
    const parsed = ListInstalledAppsRequestSchema.parse({});
    expect(parsed.sortBy).toBe('name');
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(20);
  });

  it('should accept filtered request', () => {
    const request = {
      tenantId: 'tenant-001',
      enabled: true,
      updateAvailable: true,
      sortBy: 'installed-date' as const,
    };
    const parsed = ListInstalledAppsRequestSchema.parse(request);
    expect(parsed.updateAvailable).toBe(true);
  });
});

describe('ListInstalledAppsResponseSchema', () => {
  it('should accept response with installed apps', () => {
    const response = {
      items: [{
        listingId: 'listing-001',
        packageId: 'com.acme.crm',
        name: 'Acme CRM',
        installedVersion: '2.0.0',
        installedAt: '2025-03-01T00:00:00Z',
      }],
      total: 1,
      page: 1,
      pageSize: 20,
    };
    const parsed = ListInstalledAppsResponseSchema.parse(response);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.total).toBe(1);
  });
});

// ==========================================
// Preview / Demo Mode Tests
// ==========================================

describe('PreviewRequestSchema', () => {
  it('should accept minimal preview request', () => {
    const request = { listingId: 'listing-001' };
    const parsed = PreviewRequestSchema.parse(request);
    expect(parsed.listingId).toBe('listing-001');
    expect(parsed.version).toBeUndefined();
    expect(parsed.includeContent).toBeUndefined();
  });

  it('should accept preview request with specific version and content types', () => {
    const request = {
      listingId: 'listing-001',
      version: '2.0.0',
      includeContent: ['objects', 'views', 'sample_data'] as const,
    };
    const parsed = PreviewRequestSchema.parse(request);
    expect(parsed.version).toBe('2.0.0');
    expect(parsed.includeContent).toHaveLength(3);
    expect(parsed.includeContent).toContain('objects');
  });

  it('should accept all valid content types', () => {
    const request = {
      listingId: 'listing-001',
      includeContent: ['objects', 'views', 'dashboards', 'flows', 'sample_data', 'navigation'] as const,
    };
    const parsed = PreviewRequestSchema.parse(request);
    expect(parsed.includeContent).toHaveLength(6);
  });

  it('should reject invalid content type', () => {
    const request = {
      listingId: 'listing-001',
      includeContent: ['invalid_type'],
    };
    expect(() => PreviewRequestSchema.parse(request)).toThrow();
  });
});

describe('PreviewObjectSummarySchema', () => {
  it('should accept object summary with fields', () => {
    const summary = {
      name: 'lead',
      label: 'Lead',
      fieldCount: 3,
      fields: [
        { name: 'first_name', label: 'First Name', type: 'text' },
        { name: 'email', label: 'Email', type: 'text' },
        { name: 'status', label: 'Status', type: 'select' },
      ],
    };
    const parsed = PreviewObjectSummarySchema.parse(summary);
    expect(parsed.name).toBe('lead');
    expect(parsed.fieldCount).toBe(3);
    expect(parsed.fields).toHaveLength(3);
  });

  it('should accept object summary without fields', () => {
    const summary = {
      name: 'account',
      label: 'Account',
      fieldCount: 15,
    };
    const parsed = PreviewObjectSummarySchema.parse(summary);
    expect(parsed.fields).toBeUndefined();
  });
});

describe('PreviewViewSummarySchema', () => {
  it('should accept list view summary', () => {
    const summary = {
      name: 'all_leads',
      label: 'All Leads',
      type: 'list' as const,
      objectName: 'lead',
    };
    const parsed = PreviewViewSummarySchema.parse(summary);
    expect(parsed.type).toBe('list');
  });

  it('should accept form view summary', () => {
    const summary = {
      name: 'lead_form',
      label: 'Lead Form',
      type: 'form' as const,
      objectName: 'lead',
    };
    const parsed = PreviewViewSummarySchema.parse(summary);
    expect(parsed.type).toBe('form');
  });

  it('should reject invalid view type', () => {
    expect(() => PreviewViewSummarySchema.parse({
      name: 'test',
      label: 'Test',
      type: 'invalid',
      objectName: 'test',
    })).toThrow();
  });
});

describe('PreviewResponseSchema', () => {
  it('should accept minimal preview response', () => {
    const response = {
      listingId: 'listing-001',
      name: 'Acme CRM',
      version: '2.0.0',
    };
    const parsed = PreviewResponseSchema.parse(response);
    expect(parsed.listingId).toBe('listing-001');
    expect(parsed.objects).toBeUndefined();
    expect(parsed.views).toBeUndefined();
  });

  it('should accept full preview response with all content', () => {
    const response = {
      listingId: 'listing-001',
      name: 'Acme CRM',
      version: '2.0.0',
      demoUrl: 'https://demo.acme.com/crm',
      objects: [
        { name: 'lead', label: 'Lead', fieldCount: 10, fields: [
          { name: 'first_name', label: 'First Name', type: 'text' },
        ]},
        { name: 'account', label: 'Account', fieldCount: 8 },
      ],
      views: [
        { name: 'all_leads', label: 'All Leads', type: 'list' as const, objectName: 'lead' },
        { name: 'lead_form', label: 'Lead Form', type: 'form' as const, objectName: 'lead' },
      ],
      dashboards: [
        { name: 'sales_overview', label: 'Sales Overview' },
      ],
      flows: [
        { name: 'lead_assignment', label: 'Lead Assignment', type: 'autolaunched' },
      ],
      navigation: [
        { id: 'nav_leads', label: 'Leads', type: 'object' },
        { id: 'nav_dashboard', label: 'Dashboard', type: 'dashboard' },
      ],
      sampleData: {
        lead: 50,
        account: 20,
      },
      expiresAt: '2025-06-01T12:00:00Z',
    };
    const parsed = PreviewResponseSchema.parse(response);
    expect(parsed.objects).toHaveLength(2);
    expect(parsed.views).toHaveLength(2);
    expect(parsed.dashboards).toHaveLength(1);
    expect(parsed.flows).toHaveLength(1);
    expect(parsed.navigation).toHaveLength(2);
    expect(parsed.sampleData?.lead).toBe(50);
    expect(parsed.demoUrl).toBe('https://demo.acme.com/crm');
    expect(parsed.expiresAt).toBe('2025-06-01T12:00:00Z');
  });

  it('should accept preview response with only objects', () => {
    const response = {
      listingId: 'listing-001',
      name: 'Acme Utils',
      version: '1.0.0',
      objects: [
        { name: 'task', label: 'Task', fieldCount: 5 },
      ],
    };
    const parsed = PreviewResponseSchema.parse(response);
    expect(parsed.objects).toHaveLength(1);
    expect(parsed.views).toBeUndefined();
    expect(parsed.dashboards).toBeUndefined();
  });
});
