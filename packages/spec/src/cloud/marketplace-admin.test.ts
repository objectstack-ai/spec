import { describe, it, expect } from 'vitest';
import {
  ReviewCriterionSchema,
  ReviewDecisionSchema,
  RejectionReasonSchema,
  SubmissionReviewSchema,
  FeaturedListingSchema,
  CuratedCollectionSchema,
  PolicyViolationTypeSchema,
  PolicyActionSchema,
  MarketplaceHealthMetricsSchema,
  TrendingListingSchema,
} from './marketplace-admin.zod';

describe('ReviewCriterionSchema', () => {
  it('should accept a required criterion', () => {
    const criterion = {
      id: 'sec-001',
      category: 'security' as const,
      description: 'No known vulnerabilities in dependencies',
    };
    const parsed = ReviewCriterionSchema.parse(criterion);
    expect(parsed.required).toBe(true);
  });

  it('should accept a completed criterion', () => {
    const criterion = {
      id: 'ux-001',
      category: 'ux' as const,
      description: 'Follows ObjectStack UI guidelines',
      required: false,
      passed: true,
      notes: 'Clean UI, follows design system',
    };
    const parsed = ReviewCriterionSchema.parse(criterion);
    expect(parsed.passed).toBe(true);
  });

  it('should accept all criterion categories', () => {
    const categories = [
      'security', 'performance', 'quality', 'ux',
      'documentation', 'policy', 'compatibility',
    ];
    categories.forEach(category => {
      const criterion = {
        id: `test-${category}`,
        category,
        description: `Test ${category}`,
      };
      expect(() => ReviewCriterionSchema.parse(criterion)).not.toThrow();
    });
  });
});

describe('ReviewDecisionSchema', () => {
  it('should accept all decisions', () => {
    const decisions = ['approved', 'rejected', 'changes-requested'];
    decisions.forEach(decision => {
      expect(() => ReviewDecisionSchema.parse(decision)).not.toThrow();
    });
  });
});

describe('RejectionReasonSchema', () => {
  it('should accept all rejection reasons', () => {
    const reasons = [
      'security-vulnerability', 'policy-violation', 'quality-below-standard',
      'misleading-metadata', 'incompatible', 'duplicate',
      'insufficient-documentation', 'other',
    ];
    reasons.forEach(reason => {
      expect(() => RejectionReasonSchema.parse(reason)).not.toThrow();
    });
  });
});

describe('SubmissionReviewSchema', () => {
  it('should accept minimal review (in-progress)', () => {
    const review = {
      id: 'review-001',
      submissionId: 'sub-001',
      reviewerId: 'admin-001',
      startedAt: '2025-06-01T10:00:00Z',
    };
    const parsed = SubmissionReviewSchema.parse(review);
    expect(parsed.decision).toBeUndefined();
  });

  it('should accept approved review with criteria', () => {
    const review = {
      id: 'review-001',
      submissionId: 'sub-001',
      reviewerId: 'admin-001',
      decision: 'approved' as const,
      criteria: [
        { id: 'sec-001', category: 'security' as const, description: 'No vulnerabilities', passed: true },
        { id: 'qual-001', category: 'quality' as const, description: 'Code quality', passed: true },
      ],
      feedback: 'Looks great! Approved for publishing.',
      startedAt: '2025-06-01T10:00:00Z',
      completedAt: '2025-06-01T14:00:00Z',
    };
    const parsed = SubmissionReviewSchema.parse(review);
    expect(parsed.criteria).toHaveLength(2);
  });

  it('should accept rejected review with reasons', () => {
    const review = {
      id: 'review-002',
      submissionId: 'sub-002',
      reviewerId: 'admin-001',
      decision: 'rejected' as const,
      rejectionReasons: ['security-vulnerability', 'insufficient-documentation'],
      feedback: '## Issues Found\n\n1. Critical CVE in lodash dependency\n2. Missing API documentation',
      internalNotes: 'Publisher notified via email',
      startedAt: '2025-06-01T10:00:00Z',
      completedAt: '2025-06-01T11:30:00Z',
    };
    const parsed = SubmissionReviewSchema.parse(review);
    expect(parsed.rejectionReasons).toHaveLength(2);
    expect(parsed.decision).toBe('rejected');
  });
});

describe('FeaturedListingSchema', () => {
  it('should accept minimal featured listing', () => {
    const featured = {
      listingId: 'listing-001',
      startDate: '2025-06-01T00:00:00Z',
    };
    const parsed = FeaturedListingSchema.parse(featured);
    expect(parsed.active).toBe(true);
    expect(parsed.priority).toBe(0);
  });

  it('should accept full featured listing', () => {
    const featured = {
      listingId: 'listing-001',
      priority: 1,
      bannerUrl: 'https://marketplace.objectstack.io/banners/crm.png',
      editorialNote: 'Best CRM of the month',
      startDate: '2025-06-01T00:00:00Z',
      endDate: '2025-06-30T23:59:59Z',
      active: true,
    };
    const parsed = FeaturedListingSchema.parse(featured);
    expect(parsed.editorialNote).toBe('Best CRM of the month');
  });
});

describe('CuratedCollectionSchema', () => {
  it('should accept collection with listings', () => {
    const collection = {
      id: 'col-001',
      name: 'Best for Small Business',
      description: 'Curated apps perfect for small businesses',
      coverImageUrl: 'https://marketplace.objectstack.io/covers/smb.png',
      listingIds: ['listing-001', 'listing-002', 'listing-003'],
      published: true,
      sortOrder: 1,
      createdBy: 'admin-001',
      createdAt: '2025-06-01T00:00:00Z',
    };
    const parsed = CuratedCollectionSchema.parse(collection);
    expect(parsed.listingIds).toHaveLength(3);
    expect(parsed.published).toBe(true);
  });

  it('should require at least one listing', () => {
    const collection = {
      id: 'col-001',
      name: 'Empty Collection',
      listingIds: [],
    };
    expect(() => CuratedCollectionSchema.parse(collection)).toThrow();
  });
});

describe('PolicyViolationTypeSchema', () => {
  it('should accept all violation types', () => {
    const types = [
      'malware', 'data-harvesting', 'spam', 'copyright',
      'inappropriate-content', 'terms-of-service', 'security-risk', 'abandoned',
    ];
    types.forEach(type => {
      expect(() => PolicyViolationTypeSchema.parse(type)).not.toThrow();
    });
  });
});

describe('PolicyActionSchema', () => {
  it('should accept a warning action', () => {
    const action = {
      id: 'action-001',
      listingId: 'listing-005',
      violationType: 'spam' as const,
      action: 'warning' as const,
      reason: 'Listing description contains misleading claims about features',
      actionBy: 'admin-001',
      actionAt: '2025-06-15T10:00:00Z',
    };
    const parsed = PolicyActionSchema.parse(action);
    expect(parsed.resolved).toBe(false);
  });

  it('should accept a takedown action with resolution', () => {
    const action = {
      id: 'action-002',
      listingId: 'listing-010',
      violationType: 'malware' as const,
      action: 'takedown' as const,
      reason: 'Malicious code detected in v1.2.0',
      actionBy: 'admin-002',
      actionAt: '2025-06-15T10:00:00Z',
      resolution: 'Publisher removed malicious code, re-submitted clean version',
      resolved: true,
    };
    const parsed = PolicyActionSchema.parse(action);
    expect(parsed.resolved).toBe(true);
  });

  it('should accept all enforcement actions', () => {
    const actions = ['warning', 'suspend', 'takedown', 'restrict'];
    actions.forEach(a => {
      const action = {
        id: 'action-001',
        listingId: 'listing-001',
        violationType: 'terms-of-service' as const,
        action: a,
        reason: 'Test',
        actionBy: 'admin-001',
        actionAt: '2025-06-15T10:00:00Z',
      };
      expect(() => PolicyActionSchema.parse(action)).not.toThrow();
    });
  });
});

describe('MarketplaceHealthMetricsSchema', () => {
  it('should accept health metrics', () => {
    const metrics = {
      totalListings: 250,
      totalPublishers: 80,
      verifiedPublishers: 45,
      totalInstalls: 150000,
      averageReviewTime: 48.5,
      pendingReviews: 12,
      snapshotAt: '2025-06-15T00:00:00Z',
    };
    const parsed = MarketplaceHealthMetricsSchema.parse(metrics);
    expect(parsed.totalListings).toBe(250);
    expect(parsed.pendingReviews).toBe(12);
  });

  it('should accept metrics with breakdowns', () => {
    const metrics = {
      totalListings: 250,
      listingsByStatus: {
        published: 200,
        draft: 30,
        'in-review': 12,
        suspended: 8,
      },
      listingsByCategory: {
        crm: 40,
        erp: 25,
        analytics: 35,
      },
      totalPublishers: 80,
      verifiedPublishers: 45,
      totalInstalls: 150000,
      pendingReviews: 12,
      listingsByPricing: {
        free: 120,
        freemium: 50,
        subscription: 60,
        paid: 20,
      },
      snapshotAt: '2025-06-15T00:00:00Z',
    };
    const parsed = MarketplaceHealthMetricsSchema.parse(metrics);
    expect(parsed.listingsByCategory?.crm).toBe(40);
  });
});

describe('TrendingListingSchema', () => {
  it('should accept trending listing', () => {
    const trending = {
      listingId: 'listing-001',
      rank: 1,
      trendScore: 95.5,
      installVelocity: 120.3,
      period: '7d',
    };
    const parsed = TrendingListingSchema.parse(trending);
    expect(parsed.rank).toBe(1);
    expect(parsed.trendScore).toBe(95.5);
  });
});
