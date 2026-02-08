import { z } from 'zod';
import {
  ConnectorSchema,
} from '../connector.zod';

/**
 * Recruiting Connector Protocol
 * 
 * Specialized connector for candidate sourcing and ATS (Applicant Tracking System)
 * integration enabling automated recruiting workflows and talent pipeline management.
 * 
 * Use Cases:
 * - Candidate sourcing and profile import
 * - Job posting and requisition management
 * - Application tracking and stage progression
 * - Interview scheduling and feedback collection
 * - Offer management and compliance tracking
 * 
 * @example
 * ```typescript
 * import { RecruitingConnector } from '@objectstack/spec/integration';
 * 
 * const linkedinConnector: RecruitingConnector = {
 *   name: 'linkedin_recruiting',
 *   label: 'LinkedIn Recruiter',
 *   type: 'saas',
 *   provider: 'linkedin',
 *   baseUrl: 'https://api.linkedin.com/v2',
 *   authentication: {
 *     type: 'oauth2',
 *     clientId: '${LINKEDIN_CLIENT_ID}',
 *     clientSecret: '${LINKEDIN_CLIENT_SECRET}',
 *     authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
 *     tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
 *     grantType: 'authorization_code',
 *     scopes: ['r_liteprofile', 'r_emailaddress', 'rw_organization_admin'],
 *   },
 *   objectTypes: [
 *     {
 *       name: 'candidates',
 *       label: 'Candidates',
 *       apiName: 'people',
 *       enabled: true,
 *       supportsCreate: false,
 *       supportsUpdate: false,
 *       supportsDelete: false,
 *     },
 *   ],
 * };
 * ```
 */

/**
 * Recruiting Provider Types
 */
export const RecruitingProviderSchema = z.enum([
  'linkedin',
  'greenhouse',
  'lever',
  'workable',
  'icims',
  'custom',
]).describe('Recruiting/ATS provider');

export type RecruitingProvider = z.infer<typeof RecruitingProviderSchema>;

/**
 * Recruiting Webhook Event Types
 */
export const RecruitingWebhookEventSchema = z.enum([
  'candidate.applied',
  'candidate.sourced',
  'candidate.stage_changed',
  'candidate.hired',
  'candidate.rejected',
  'interview.scheduled',
  'interview.completed',
  'offer.created',
  'offer.accepted',
  'offer.declined',
]).describe('Recruiting webhook event type');

export type RecruitingWebhookEvent = z.infer<typeof RecruitingWebhookEventSchema>;

/**
 * Recruiting Object Type Schema
 * Represents a syncable entity in the ATS (e.g., Candidate, Job, Application)
 */
export const RecruitingObjectTypeSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Object type name (snake_case)'),
  label: z.string().describe('Display label'),
  apiName: z.string().describe('API name in external system'),
  enabled: z.boolean().default(true).describe('Enable sync for this object'),
  supportsCreate: z.boolean().default(true).describe('Supports record creation'),
  supportsUpdate: z.boolean().default(true).describe('Supports record updates'),
  supportsDelete: z.boolean().default(true).describe('Supports record deletion'),
});

export type RecruitingObjectType = z.infer<typeof RecruitingObjectTypeSchema>;

/**
 * Candidate Source Configuration
 * Controls how candidate sourcing channels are tracked
 */
export const CandidateSourceConfigSchema = z.object({
  defaultSource: z.string().optional().describe('Default source attribution for candidates'),
  autoTagSource: z.boolean().default(true).describe('Automatically tag candidate source channel'),
  sourceTrackingField: z.string().optional().describe('Field name used to track candidate source'),
});

export type CandidateSourceConfig = z.infer<typeof CandidateSourceConfigSchema>;

/**
 * Pipeline Stage Definition
 */
export const PipelineStageSchema = z.object({
  name: z.string().describe('Stage machine name'),
  label: z.string().describe('Stage display label'),
  order: z.number().int().min(0).describe('Stage order in pipeline'),
});

export type PipelineStage = z.infer<typeof PipelineStageSchema>;

/**
 * Pipeline Configuration
 * Defines the recruiting pipeline stages and behavior
 */
export const PipelineConfigSchema = z.object({
  stages: z.array(PipelineStageSchema).describe('Pipeline stages in order'),
  autoAdvance: z.boolean().default(false).describe('Automatically advance candidates between stages'),
  stageNotifications: z.boolean().default(true).describe('Send notifications on stage changes'),
});

export type PipelineConfig = z.infer<typeof PipelineConfigSchema>;

/**
 * Interview Configuration
 * Controls interview scheduling and feedback settings
 */
export const InterviewConfigSchema = z.object({
  defaultDuration: z.number().int().min(1).describe('Default interview duration in minutes'),
  calendarIntegration: z.boolean().default(false).describe('Enable calendar integration for scheduling'),
  feedbackRequired: z.boolean().default(true).describe('Require feedback after interviews'),
  scorecardTemplateId: z.string().optional().describe('Default scorecard template identifier'),
});

export type InterviewConfig = z.infer<typeof InterviewConfigSchema>;

/**
 * Compliance Configuration
 * Manages GDPR, EEOC, and data retention policies
 */
export const ComplianceConfigSchema = z.object({
  gdprCompliant: z.boolean().default(false).describe('Enable GDPR compliance features'),
  eeocEnabled: z.boolean().default(false).describe('Enable EEOC reporting and tracking'),
  dataRetentionDays: z.number().int().min(1).optional().describe('Number of days to retain candidate data'),
  anonymizeRejected: z.boolean().default(false).describe('Anonymize rejected candidate data'),
});

export type ComplianceConfig = z.infer<typeof ComplianceConfigSchema>;

/**
 * Recruiting Connector Schema
 * Complete ATS/recruiting integration configuration
 */
export const RecruitingConnectorSchema = ConnectorSchema.extend({
  type: z.literal('saas'),

  /**
   * Recruiting/ATS provider
   */
  provider: RecruitingProviderSchema.describe('Recruiting provider'),

  /**
   * ATS API base URL
   */
  baseUrl: z.string().url().describe('ATS API base URL'),

  /**
   * Syncable recruiting object types
   */
  objectTypes: z.array(RecruitingObjectTypeSchema).describe('Syncable recruiting object types'),

  /**
   * Webhook events to subscribe to
   */
  webhookEvents: z.array(RecruitingWebhookEventSchema).optional().describe('Recruiting webhook events to subscribe to'),

  /**
   * Candidate source configuration
   */
  candidateSourceConfig: CandidateSourceConfigSchema.optional().describe('Candidate source tracking configuration'),

  /**
   * Pipeline configuration
   */
  pipelineConfig: PipelineConfigSchema.optional().describe('Recruiting pipeline configuration'),

  /**
   * Interview configuration
   */
  interviewConfig: InterviewConfigSchema.optional().describe('Interview scheduling and feedback configuration'),

  /**
   * Compliance configuration
   */
  complianceConfig: ComplianceConfigSchema.optional().describe('Compliance and data retention configuration'),

  /**
   * OAuth-specific settings
   */
  oauthSettings: z.object({
    scopes: z.array(z.string()).describe('Required OAuth scopes'),
    refreshTokenUrl: z.string().url().optional().describe('Token refresh endpoint'),
    revokeTokenUrl: z.string().url().optional().describe('Token revocation endpoint'),
    autoRefresh: z.boolean().default(true).describe('Automatically refresh expired tokens'),
  }).optional().describe('OAuth-specific configuration'),
});

export type RecruitingConnector = z.infer<typeof RecruitingConnectorSchema>;

// ============================================================================
// Helper Functions & Examples
// ============================================================================

/**
 * Example: LinkedIn Recruiter Connector Configuration
 */
export const linkedinConnectorExample = {
  name: 'linkedin_recruiting',
  label: 'LinkedIn Recruiter',
  type: 'saas',
  provider: 'linkedin',
  baseUrl: 'https://api.linkedin.com/v2',

  authentication: {
    type: 'oauth2',
    clientId: '${LINKEDIN_CLIENT_ID}',
    clientSecret: '${LINKEDIN_CLIENT_SECRET}',
    authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    grantType: 'authorization_code',
    scopes: ['r_liteprofile', 'r_emailaddress', 'rw_organization_admin'],
  },

  objectTypes: [
    {
      name: 'candidates',
      label: 'Candidates',
      apiName: 'people',
      enabled: true,
      supportsCreate: false,
      supportsUpdate: false,
      supportsDelete: false,
    },
    {
      name: 'jobs',
      label: 'Jobs',
      apiName: 'jobPostings',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'applications',
      label: 'Applications',
      apiName: 'applications',
      enabled: true,
      supportsCreate: false,
      supportsUpdate: false,
      supportsDelete: false,
    },
  ],

  webhookEvents: [
    'candidate.applied',
    'candidate.sourced',
    'candidate.stage_changed',
  ],

  candidateSourceConfig: {
    defaultSource: 'linkedin',
    autoTagSource: true,
    sourceTrackingField: 'source_channel',
  },

  pipelineConfig: {
    stages: [
      { name: 'sourced', label: 'Sourced', order: 0 },
      { name: 'screening', label: 'Screening', order: 1 },
      { name: 'interview', label: 'Interview', order: 2 },
      { name: 'offer', label: 'Offer', order: 3 },
      { name: 'hired', label: 'Hired', order: 4 },
    ],
    autoAdvance: false,
    stageNotifications: true,
  },

  oauthSettings: {
    scopes: ['r_liteprofile', 'r_emailaddress', 'rw_organization_admin'],
    refreshTokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    autoRefresh: true,
  },

  complianceConfig: {
    gdprCompliant: true,
    eeocEnabled: false,
    dataRetentionDays: 365,
    anonymizeRejected: true,
  },

  syncConfig: {
    strategy: 'incremental',
    direction: 'import',
    schedule: '0 */4 * * *',
    conflictResolution: 'source_wins',
    batchSize: 50,
  },

  rateLimitConfig: {
    strategy: 'token_bucket',
    maxRequests: 100,
    windowSeconds: 60,
    respectUpstreamLimits: true,
  },

  status: 'active',
  enabled: true,
};

/**
 * Example: Greenhouse ATS Connector Configuration
 */
export const greenhouseConnectorExample = {
  name: 'greenhouse_ats',
  label: 'Greenhouse ATS',
  type: 'saas',
  provider: 'greenhouse',
  baseUrl: 'https://harvest.greenhouse.io/v1',

  authentication: {
    type: 'api-key',
    key: '${GREENHOUSE_API_KEY}',
    headerName: 'Authorization',
  },

  objectTypes: [
    {
      name: 'candidates',
      label: 'Candidates',
      apiName: 'candidates',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'jobs',
      label: 'Jobs',
      apiName: 'jobs',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'applications',
      label: 'Applications',
      apiName: 'applications',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'interviews',
      label: 'Interviews',
      apiName: 'scheduled_interviews',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'offers',
      label: 'Offers',
      apiName: 'offers',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    },
    {
      name: 'scorecards',
      label: 'Scorecards',
      apiName: 'scorecards',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: false,
      supportsDelete: false,
    },
    {
      name: 'referrals',
      label: 'Referrals',
      apiName: 'referrals',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: false,
      supportsDelete: false,
    },
    {
      name: 'sources',
      label: 'Sources',
      apiName: 'sources',
      enabled: true,
      supportsCreate: false,
      supportsUpdate: false,
      supportsDelete: false,
    },
  ],

  webhookEvents: [
    'candidate.applied',
    'candidate.sourced',
    'candidate.stage_changed',
    'candidate.hired',
    'candidate.rejected',
    'interview.scheduled',
    'interview.completed',
    'offer.created',
    'offer.accepted',
    'offer.declined',
  ],

  candidateSourceConfig: {
    defaultSource: 'greenhouse',
    autoTagSource: true,
  },

  pipelineConfig: {
    stages: [
      { name: 'application_review', label: 'Application Review', order: 0 },
      { name: 'phone_screen', label: 'Phone Screen', order: 1 },
      { name: 'technical_interview', label: 'Technical Interview', order: 2 },
      { name: 'onsite_interview', label: 'Onsite Interview', order: 3 },
      { name: 'reference_check', label: 'Reference Check', order: 4 },
      { name: 'offer', label: 'Offer', order: 5 },
      { name: 'hired', label: 'Hired', order: 6 },
    ],
    autoAdvance: false,
    stageNotifications: true,
  },

  interviewConfig: {
    defaultDuration: 60,
    calendarIntegration: true,
    feedbackRequired: true,
    scorecardTemplateId: 'tmpl_default_scorecard',
  },

  complianceConfig: {
    gdprCompliant: true,
    eeocEnabled: true,
    dataRetentionDays: 730,
    anonymizeRejected: false,
  },

  syncConfig: {
    strategy: 'incremental',
    direction: 'bidirectional',
    schedule: '*/30 * * * *',
    realtimeSync: true,
    conflictResolution: 'source_wins',
    batchSize: 100,
    deleteMode: 'soft_delete',
  },

  rateLimitConfig: {
    strategy: 'token_bucket',
    maxRequests: 50,
    windowSeconds: 10,
    respectUpstreamLimits: true,
  },

  retryConfig: {
    strategy: 'exponential_backoff',
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    retryOnNetworkError: true,
    jitter: true,
  },

  status: 'active',
  enabled: true,
};
