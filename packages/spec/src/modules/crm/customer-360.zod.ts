import { z } from 'zod';

/**
 * Customer 360 Protocol
 * 
 * Comprehensive customer data platform providing unified view
 * of customer interactions, behaviors, and intelligence.
 * 
 * @module modules/crm/customer-360
 */

/**
 * Customer demographic information
 */
export const CustomerDemographicsSchema = z.object({
  /** First name */
  firstName: z.string().optional(),
  
  /** Last name */
  lastName: z.string().optional(),
  
  /** Company name */
  company: z.string().optional(),
  
  /** Job title */
  title: z.string().optional(),
  
  /** Industry */
  industry: z.string().optional(),
  
  /** Company size */
  companySize: z.enum([
    'self-employed',
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1001-5000',
    '5001+'
  ]).optional(),
  
  /** Location */
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string(),
    timezone: z.string().optional()
  }).optional(),
  
  /** Languages spoken */
  languages: z.array(z.string()).optional()
});

export type CustomerDemographics = z.infer<typeof CustomerDemographicsSchema>;

/**
 * Customer preferences and settings
 */
export const CustomerPreferencesSchema = z.object({
  /** Communication preferences */
  communication: z.object({
    /** Preferred channels */
    channels: z.array(z.enum(['email', 'phone', 'sms', 'chat', 'social'])),
    
    /** Best time to contact */
    bestTime: z.enum(['morning', 'afternoon', 'evening']).optional(),
    
    /** Frequency preference */
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).optional(),
    
    /** Opt-in status */
    marketing: z.boolean().default(false),
    transactional: z.boolean().default(true)
  }),
  
  /** Product/service preferences */
  products: z.object({
    /** Preferred categories */
    categories: z.array(z.string()).optional(),
    
    /** Price sensitivity */
    priceSensitivity: z.enum(['low', 'medium', 'high']).optional(),
    
    /** Feature priorities */
    priorities: z.array(z.string()).optional()
  }).optional(),
  
  /** Support preferences */
  support: z.object({
    /** Preferred support channels */
    channels: z.array(z.enum(['self-service', 'chat', 'phone', 'email'])),
    
    /** SLA expectations */
    sla: z.enum(['standard', 'priority', 'premium']).optional()
  }).optional()
});

export type CustomerPreferences = z.infer<typeof CustomerPreferencesSchema>;

/**
 * Customer segmentation
 */
export const CustomerSegmentationSchema = z.object({
  /** Segment identifiers */
  segments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.enum(['demographic', 'behavioral', 'psychographic', 'geographic']),
    score: z.number().min(0).max(100).optional()
  })),
  
  /** Primary segment */
  primarySegment: z.string(),
  
  /** Segment assignment date */
  assignedAt: z.date(),
  
  /** Next reassessment date */
  nextReassessment: z.date().optional()
});

export type CustomerSegmentation = z.infer<typeof CustomerSegmentationSchema>;

/**
 * Customer touchpoint (interaction point)
 */
export const CustomerTouchpointSchema = z.object({
  /** Touchpoint ID */
  id: z.string(),
  
  /** Timestamp */
  timestamp: z.date(),
  
  /** Channel */
  channel: z.enum([
    'website',
    'mobile-app',
    'email',
    'phone',
    'chat',
    'social-media',
    'in-person',
    'event',
    'advertising'
  ]),
  
  /** Touchpoint type */
  type: z.enum([
    'visit',
    'click',
    'view',
    'download',
    'purchase',
    'inquiry',
    'complaint',
    'review',
    'referral'
  ]),
  
  /** Source/campaign */
  source: z.string().optional(),
  
  /** Content viewed/interacted with */
  content: z.object({
    id: z.string().optional(),
    type: z.string().optional(),
    title: z.string().optional()
  }).optional(),
  
  /** Duration (seconds) */
  duration: z.number().optional(),
  
  /** Value/outcome */
  outcome: z.object({
    type: z.enum(['positive', 'neutral', 'negative']),
    value: z.number().optional(),
    notes: z.string().optional()
  }).optional()
});

export type CustomerTouchpoint = z.infer<typeof CustomerTouchpointSchema>;

/**
 * Customer interaction (two-way communication)
 */
export const CustomerInteractionSchema = z.object({
  /** Interaction ID */
  id: z.string(),
  
  /** Timestamp */
  timestamp: z.date(),
  
  /** Channel */
  channel: z.enum(['email', 'phone', 'chat', 'video-call', 'in-person']),
  
  /** Direction */
  direction: z.enum(['inbound', 'outbound']),
  
  /** Subject/topic */
  subject: z.string(),
  
  /** Interaction type */
  type: z.enum([
    'sales-call',
    'demo',
    'support-ticket',
    'consultation',
    'follow-up',
    'onboarding',
    'review',
    'escalation'
  ]),
  
  /** Participants */
  participants: z.array(z.object({
    role: z.enum(['customer', 'sales', 'support', 'success', 'executive']),
    id: z.string(),
    name: z.string()
  })),
  
  /** Duration (minutes) */
  duration: z.number().optional(),
  
  /** Summary/notes */
  summary: z.string().optional(),
  
  /** Sentiment analysis */
  sentiment: z.object({
    score: z.number().min(-1).max(1),
    label: z.enum(['very-negative', 'negative', 'neutral', 'positive', 'very-positive'])
  }).optional(),
  
  /** Next steps */
  nextSteps: z.array(z.object({
    action: z.string(),
    owner: z.string(),
    dueDate: z.date().optional()
  })).optional()
});

export type CustomerInteraction = z.infer<typeof CustomerInteractionSchema>;

/**
 * Customer engagement metrics
 */
export const CustomerEngagementSchema = z.object({
  /** All touchpoints */
  touchpoints: z.array(CustomerTouchpointSchema),
  
  /** All interactions */
  interactions: z.array(CustomerInteractionSchema),
  
  /** Engagement score (0-100) */
  score: z.number().min(0).max(100),
  
  /** Trend */
  trend: z.enum(['increasing', 'stable', 'decreasing']),
  
  /** Overall sentiment (-1 to 1) */
  sentiment: z.number().min(-1).max(1),
  
  /** Last engagement date */
  lastEngagement: z.date(),
  
  /** Engagement frequency (interactions per month) */
  frequency: z.number(),
  
  /** Recency, Frequency, Monetary (RFM) scores */
  rfm: z.object({
    recency: z.number().min(1).max(5),
    frequency: z.number().min(1).max(5),
    monetary: z.number().min(1).max(5),
    score: z.number().min(3).max(15)
  }).optional()
});

export type CustomerEngagement = z.infer<typeof CustomerEngagementSchema>;

/**
 * Customer lifecycle stage
 */
export const CustomerLifecycleStageSchema = z.enum([
  'awareness',        // Just learned about the product/service
  'consideration',    // Evaluating options
  'decision',         // Ready to purchase
  'onboarding',       // New customer being onboarded
  'adoption',         // Actively using the product
  'retention',        // Long-term customer
  'expansion',        // Opportunity for upsell/cross-sell
  'advocacy',         // Promoting the product to others
  'at-risk',          // Risk of churn
  'churned',          // Former customer
  'win-back'          // Attempting to re-engage
]);

export type CustomerLifecycleStage = z.infer<typeof CustomerLifecycleStageSchema>;

/**
 * Customer journey tracking
 */
export const CustomerJourneySchema = z.object({
  /** Current lifecycle stage */
  currentStage: CustomerLifecycleStageSchema,
  
  /** Journey history */
  history: z.array(z.object({
    stage: CustomerLifecycleStageSchema,
    enteredAt: z.date(),
    exitedAt: z.date().optional(),
    duration: z.number().optional() // days
  })),
  
  /** Customer since */
  customerSince: z.date(),
  
  /** Tenure (days) */
  tenure: z.number(),
  
  /** Milestones achieved */
  milestones: z.array(z.object({
    id: z.string(),
    name: z.string(),
    achievedAt: z.date(),
    value: z.number().optional()
  })).optional()
});

export type CustomerJourney = z.infer<typeof CustomerJourneySchema>;

/**
 * Customer health score
 */
export const CustomerHealthScoreSchema = z.object({
  /** Overall health score (0-100) */
  score: z.number().min(0).max(100),
  
  /** Health status */
  status: z.enum(['critical', 'at-risk', 'stable', 'healthy', 'thriving']),
  
  /** Component scores */
  components: z.object({
    /** Product usage */
    usage: z.number().min(0).max(100),
    
    /** Engagement level */
    engagement: z.number().min(0).max(100),
    
    /** Support satisfaction */
    support: z.number().min(0).max(100),
    
    /** Financial health */
    financial: z.number().min(0).max(100),
    
    /** Relationship strength */
    relationship: z.number().min(0).max(100)
  }),
  
  /** Trend */
  trend: z.enum(['improving', 'stable', 'declining']),
  
  /** Last calculated */
  lastCalculated: z.date(),
  
  /** Risk factors */
  riskFactors: z.array(z.object({
    factor: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string()
  })).optional()
});

export type CustomerHealthScore = z.infer<typeof CustomerHealthScoreSchema>;

/**
 * AI-powered customer intelligence
 */
export const CustomerIntelligenceSchema = z.object({
  /** Predictive analytics */
  predictions: z.object({
    /** Churn probability (0-1) */
    churnProbability: z.number().min(0).max(1).optional(),
    
    /** Lifetime value prediction */
    lifetimeValue: z.number().optional(),
    
    /** Next purchase likelihood */
    nextPurchaseProbability: z.number().min(0).max(1).optional(),
    
    /** Upsell opportunities */
    upsellProbability: z.number().min(0).max(1).optional()
  }).optional(),
  
  /** AI recommendations */
  recommendations: z.array(z.object({
    type: z.enum([
      'product-recommendation',
      'engagement-action',
      'retention-strategy',
      'pricing-adjustment',
      'channel-optimization'
    ]),
    title: z.string(),
    description: z.string(),
    confidence: z.number().min(0).max(1),
    expectedImpact: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent'])
  })),
  
  /** Risk factors */
  riskFactors: z.array(z.object({
    factor: z.string(),
    impact: z.enum(['low', 'medium', 'high']),
    mitigation: z.string().optional()
  })),
  
  /** Opportunity insights */
  opportunities: z.array(z.object({
    type: z.string(),
    description: z.string(),
    estimatedValue: z.number().optional(),
    probability: z.number().min(0).max(1)
  })).optional()
});

export type CustomerIntelligence = z.infer<typeof CustomerIntelligenceSchema>;

/**
 * Customer 360 View
 * 
 * Comprehensive unified customer profile
 */
export const Customer360Schema = z.object({
  /** Customer ID */
  customerId: z.string(),
  
  /** Profile information */
  profile: z.object({
    demographics: CustomerDemographicsSchema,
    preferences: CustomerPreferencesSchema,
    segmentation: CustomerSegmentationSchema
  }),
  
  /** Engagement data */
  engagement: CustomerEngagementSchema,
  
  /** Lifecycle tracking */
  lifecycle: CustomerJourneySchema,
  
  /** Health metrics */
  health: CustomerHealthScoreSchema,
  
  /** AI-powered intelligence */
  intelligence: CustomerIntelligenceSchema,
  
  /** Last updated */
  lastUpdated: z.date(),
  
  /** Data sources */
  dataSources: z.array(z.object({
    source: z.string(),
    lastSync: z.date(),
    recordCount: z.number()
  })).optional()
});

export type Customer360 = z.infer<typeof Customer360Schema>;
