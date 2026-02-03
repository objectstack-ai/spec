import { z } from 'zod';

/**
 * AI Governance Framework
 * 
 * Comprehensive governance, compliance, and ethical AI protocols
 * for enterprise-grade AI deployment.
 * 
 * @module ai/governance
 */

/**
 * Data privacy compliance levels
 */
export const PrivacyComplianceLevelSchema = z.enum([
  'gdpr',          // General Data Protection Regulation (EU)
  'ccpa',          // California Consumer Privacy Act
  'hipaa',         // Health Insurance Portability and Accountability Act
  'pci-dss',       // Payment Card Industry Data Security Standard
  'sox',           // Sarbanes-Oxley Act
  'coppa',         // Children's Online Privacy Protection Act
  'ferpa'          // Family Educational Rights and Privacy Act
]);

export type PrivacyComplianceLevel = z.infer<typeof PrivacyComplianceLevelSchema>;

/**
 * Actions requiring human approval
 */
export const HumanApprovalActionSchema = z.enum([
  'data-deletion',           // Deleting user data
  'access-grant',            // Granting elevated access
  'financial-transaction',   // Processing financial transactions
  'contract-signing',        // Signing legal contracts
  'employee-termination',    // HR-related decisions
  'medical-diagnosis',       // Healthcare decisions
  'legal-advice',           // Providing legal recommendations
  'security-override',      // Overriding security policies
  'data-export',            // Exporting sensitive data
  'model-deployment'        // Deploying new AI models
]);

export type HumanApprovalAction = z.infer<typeof HumanApprovalActionSchema>;

/**
 * AI compliance configuration
 */
export const AIComplianceSchema = z.object({
  /** Data privacy compliance requirements */
  dataPrivacy: z.object({
    enabled: z.boolean().default(true),
    
    /** Compliance frameworks to adhere to */
    frameworks: z.array(PrivacyComplianceLevelSchema),
    
    /** Data retention policies */
    retention: z.object({
      /** Default retention period in days */
      defaultDays: z.number(),
      
      /** Per-data-type retention rules */
      rules: z.array(z.object({
        dataType: z.string(),
        retentionDays: z.number(),
        autoDelete: z.boolean().default(false)
      })).optional()
    }),
    
    /** Consent management */
    consent: z.object({
      required: z.boolean().default(true),
      granular: z.boolean().default(true),
      withdrawable: z.boolean().default(true)
    })
  }),
  
  /** Audit logging configuration */
  auditLogging: z.object({
    enabled: z.boolean().default(true),
    
    /** Events to audit */
    events: z.array(z.enum([
      'ai-decision',
      'model-inference',
      'data-access',
      'permission-change',
      'configuration-change',
      'error',
      'anomaly'
    ])),
    
    /** Retention period for audit logs */
    retentionDays: z.number().default(365),
    
    /** Tamper-proof logging */
    immutable: z.boolean().default(true)
  }),
  
  /** Actions requiring human approval */
  humanApproval: z.object({
    enabled: z.boolean().default(true),
    
    /** Actions that need approval */
    actions: z.array(HumanApprovalActionSchema),
    
    /** Approval workflow */
    workflow: z.object({
      /** Minimum number of approvers */
      minApprovers: z.number().default(1),
      
      /** Approval timeout in hours */
      timeoutHours: z.number().default(24),
      
      /** Auto-reject on timeout */
      autoReject: z.boolean().default(true)
    }).optional()
  })
});

export type AICompliance = z.infer<typeof AIComplianceSchema>;

/**
 * Bias detection configuration
 */
export const BiasDetectionSchema = z.object({
  /** Enable bias detection */
  enabled: z.boolean().default(true),
  
  /** Protected attributes to monitor */
  protectedAttributes: z.array(z.enum([
    'race',
    'gender',
    'age',
    'religion',
    'nationality',
    'disability',
    'sexual-orientation',
    'marital-status',
    'veteran-status'
  ])),
  
  /** Bias metrics to track */
  metrics: z.array(z.enum([
    'demographic-parity',      // Equal outcomes across groups
    'equalized-odds',          // Equal TPR and FPR across groups
    'equal-opportunity',       // Equal TPR across groups
    'predictive-parity',       // Equal PPV across groups
    'treatment-equality',      // Equal error rates
    'fairness-through-unawareness' // No use of protected attributes
  ])),
  
  /** Acceptable threshold for bias (0-1) */
  threshold: z.number().min(0).max(1).default(0.1),
  
  /** Action on bias detection */
  onBiasDetected: z.enum([
    'warn',        // Log warning
    'block',       // Block the operation
    'review',      // Queue for manual review
    'retrain'      // Trigger model retraining
  ]).default('warn')
});

export type BiasDetection = z.infer<typeof BiasDetectionSchema>;

/**
 * AI monitoring configuration
 */
export const AIMonitoringSchema = z.object({
  /** Bias detection */
  biasDetection: BiasDetectionSchema,
  
  /** Fairness metrics tracking */
  fairnessMetrics: z.array(z.object({
    name: z.string(),
    description: z.string(),
    target: z.number(),
    threshold: z.number()
  })),
  
  /** Performance thresholds */
  performanceThresholds: z.object({
    /** Minimum accuracy */
    accuracy: z.number().min(0).max(1).optional(),
    
    /** Minimum precision */
    precision: z.number().min(0).max(1).optional(),
    
    /** Minimum recall */
    recall: z.number().min(0).max(1).optional(),
    
    /** Maximum latency (ms) */
    latency: z.number().optional(),
    
    /** Maximum error rate */
    errorRate: z.number().min(0).max(1).optional()
  }),
  
  /** Model drift detection */
  driftDetection: z.object({
    enabled: z.boolean().default(true),
    
    /** Detection frequency in hours */
    frequency: z.number().default(24),
    
    /** Acceptable drift threshold */
    threshold: z.number().min(0).max(1).default(0.05),
    
    /** Action on drift detection */
    onDrift: z.enum(['warn', 'retrain', 'rollback']).default('warn')
  }),
  
  /** Anomaly detection */
  anomalyDetection: z.object({
    enabled: z.boolean().default(true),
    
    /** Sensitivity (0-1, higher = more sensitive) */
    sensitivity: z.number().min(0).max(1).default(0.8)
  })
});

export type AIMonitoring = z.infer<typeof AIMonitoringSchema>;

/**
 * AI explainability configuration
 */
export const AIExplainabilitySchema = z.object({
  /** Require explanations for AI decisions */
  requireExplanations: z.boolean().default(true),
  
  /** Trace decision-making process */
  traceDecisions: z.boolean().default(true),
  
  /** Track model lineage */
  modelLineage: z.object({
    enabled: z.boolean().default(true),
    
    /** Track training data */
    trackTrainingData: z.boolean().default(true),
    
    /** Track hyperparameters */
    trackHyperparameters: z.boolean().default(true),
    
    /** Track feature importance */
    trackFeatureImportance: z.boolean().default(true)
  }),
  
  /** Explanation methods */
  methods: z.array(z.enum([
    'lime',            // Local Interpretable Model-agnostic Explanations
    'shap',            // SHapley Additive exPlanations
    'attention',       // Attention weights visualization
    'counterfactual',  // Counterfactual explanations
    'feature-importance', // Feature importance scores
    'decision-tree',   // Decision tree approximation
    'rule-based'       // Rule-based explanations
  ])).optional(),
  
  /** Minimum confidence level for explanations */
  minConfidence: z.number().min(0).max(1).default(0.7)
});

export type AIExplainability = z.infer<typeof AIExplainabilitySchema>;

/**
 * Comprehensive AI Governance Schema
 */
export const AIGovernanceSchema = z.object({
  /** Compliance configuration */
  compliance: AIComplianceSchema,
  
  /** Monitoring configuration */
  monitoring: AIMonitoringSchema,
  
  /** Explainability configuration */
  explainability: AIExplainabilitySchema,
  
  /** Risk management */
  riskManagement: z.object({
    /** Risk assessment frequency in days */
    assessmentFrequency: z.number().default(30),
    
    /** Risk categories to assess */
    categories: z.array(z.enum([
      'bias',
      'privacy',
      'security',
      'accuracy',
      'reliability',
      'transparency',
      'accountability'
    ])),
    
    /** Acceptable risk level */
    acceptableRiskLevel: z.enum(['low', 'medium', 'high']).default('medium')
  }),
  
  /** Model governance */
  modelGovernance: z.object({
    /** Require model approval before deployment */
    approvalRequired: z.boolean().default(true),
    
    /** Model versioning */
    versioning: z.object({
      enabled: z.boolean().default(true),
      strategy: z.enum(['semantic', 'timestamp', 'incremental']).default('semantic')
    }),
    
    /** Model registry */
    registry: z.object({
      enabled: z.boolean().default(true),
      
      /** Store model artifacts */
      storeArtifacts: z.boolean().default(true),
      
      /** Store training metadata */
      storeMetadata: z.boolean().default(true)
    }),
    
    /** Rollback capability */
    rollback: z.object({
      enabled: z.boolean().default(true),
      
      /** Number of previous versions to keep */
      keepVersions: z.number().default(5)
    })
  }),
  
  /** Data governance */
  dataGovernance: z.object({
    /** Data classification */
    classification: z.object({
      enabled: z.boolean().default(true),
      
      /** Classification levels */
      levels: z.array(z.enum([
        'public',
        'internal',
        'confidential',
        'restricted',
        'pii',
        'sensitive'
      ]))
    }),
    
    /** Data quality monitoring */
    qualityMonitoring: z.object({
      enabled: z.boolean().default(true),
      
      /** Quality checks */
      checks: z.array(z.enum([
        'completeness',
        'accuracy',
        'consistency',
        'timeliness',
        'validity',
        'uniqueness'
      ]))
    }),
    
    /** Data lineage tracking */
    lineageTracking: z.boolean().default(true)
  })
});

export type AIGovernance = z.infer<typeof AIGovernanceSchema>;

/**
 * Governance audit event
 */
export const GovernanceAuditEventSchema = z.object({
  /** Event ID */
  id: z.string(),
  
  /** Timestamp */
  timestamp: z.date(),
  
  /** Event type */
  type: z.enum([
    'compliance-check',
    'bias-detection',
    'risk-assessment',
    'model-deployment',
    'human-approval',
    'policy-violation',
    'data-access',
    'explainability-request'
  ]),
  
  /** Event status */
  status: z.enum(['success', 'warning', 'failure']),
  
  /** Event details */
  details: z.record(z.any()),
  
  /** Actor (user/agent) */
  actor: z.object({
    type: z.enum(['user', 'agent', 'system']),
    id: z.string()
  }),
  
  /** Affected entities */
  entities: z.array(z.object({
    type: z.string(),
    id: z.string()
  })).optional(),
  
  /** Compliance frameworks involved */
  complianceFrameworks: z.array(PrivacyComplianceLevelSchema).optional()
});

export type GovernanceAuditEvent = z.infer<typeof GovernanceAuditEventSchema>;
