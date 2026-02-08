import { describe, it, expect } from 'vitest';
import {
  RecruitingConnectorSchema,
  RecruitingProviderSchema,
  RecruitingWebhookEventSchema,
  RecruitingObjectTypeSchema,
  CandidateSourceConfigSchema,
  PipelineConfigSchema,
  InterviewConfigSchema,
  ComplianceConfigSchema,
  linkedinConnectorExample,
  greenhouseConnectorExample,
  type RecruitingConnector,
} from './recruiting.zod';

describe('RecruitingProviderSchema', () => {
  it('should accept all valid providers', () => {
    const providers = ['linkedin', 'greenhouse', 'lever', 'workable', 'icims', 'custom'] as const;

    providers.forEach(provider => {
      expect(() => RecruitingProviderSchema.parse(provider)).not.toThrow();
    });
  });

  it('should reject invalid provider', () => {
    expect(() => RecruitingProviderSchema.parse('indeed')).toThrow();
  });
});

describe('RecruitingWebhookEventSchema', () => {
  it('should accept all valid webhook events', () => {
    const events = [
      'candidate.applied', 'candidate.sourced', 'candidate.stage_changed',
      'candidate.hired', 'candidate.rejected',
      'interview.scheduled', 'interview.completed',
      'offer.created', 'offer.accepted', 'offer.declined',
    ] as const;

    events.forEach(event => {
      expect(() => RecruitingWebhookEventSchema.parse(event)).not.toThrow();
    });
  });

  it('should reject invalid webhook event', () => {
    expect(() => RecruitingWebhookEventSchema.parse('candidate.deleted')).toThrow();
  });
});

describe('RecruitingObjectTypeSchema', () => {
  it('should accept valid object type with CRUD flags', () => {
    const objectType = {
      name: 'candidates',
      label: 'Candidates',
      apiName: 'candidates',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    };

    expect(() => RecruitingObjectTypeSchema.parse(objectType)).not.toThrow();
  });

  it('should enforce snake_case for object type name', () => {
    expect(() => RecruitingObjectTypeSchema.parse({
      name: 'candidates',
      label: 'Candidates',
      apiName: 'candidates',
    })).not.toThrow();

    expect(() => RecruitingObjectTypeSchema.parse({
      name: 'JobApplications',
      label: 'Job Applications',
      apiName: 'applications',
    })).toThrow();
  });

  it('should apply defaults for CRUD flags', () => {
    const result = RecruitingObjectTypeSchema.parse({
      name: 'interviews',
      label: 'Interviews',
      apiName: 'scheduled_interviews',
    });

    expect(result.enabled).toBe(true);
    expect(result.supportsCreate).toBe(true);
    expect(result.supportsUpdate).toBe(true);
    expect(result.supportsDelete).toBe(true);
  });
});

describe('CandidateSourceConfigSchema', () => {
  it('should accept full candidate source config', () => {
    const config = {
      defaultSource: 'linkedin',
      autoTagSource: true,
      sourceTrackingField: 'source_channel',
    };

    expect(() => CandidateSourceConfigSchema.parse(config)).not.toThrow();
  });

  it('should apply defaults', () => {
    const result = CandidateSourceConfigSchema.parse({});
    expect(result.autoTagSource).toBe(true);
  });
});

describe('PipelineConfigSchema', () => {
  it('should accept valid pipeline config', () => {
    const config = {
      stages: [
        { name: 'screening', label: 'Screening', order: 0 },
        { name: 'interview', label: 'Interview', order: 1 },
        { name: 'offer', label: 'Offer', order: 2 },
      ],
      autoAdvance: false,
      stageNotifications: true,
    };

    const result = PipelineConfigSchema.parse(config);
    expect(result.stages).toHaveLength(3);
    expect(result.autoAdvance).toBe(false);
    expect(result.stageNotifications).toBe(true);
  });
});

describe('InterviewConfigSchema', () => {
  it('should accept full interview config', () => {
    const config = {
      defaultDuration: 60,
      calendarIntegration: true,
      feedbackRequired: true,
      scorecardTemplateId: 'tmpl_001',
    };

    const result = InterviewConfigSchema.parse(config);
    expect(result.defaultDuration).toBe(60);
    expect(result.calendarIntegration).toBe(true);
    expect(result.feedbackRequired).toBe(true);
    expect(result.scorecardTemplateId).toBe('tmpl_001');
  });

  it('should apply defaults', () => {
    const result = InterviewConfigSchema.parse({ defaultDuration: 30 });
    expect(result.calendarIntegration).toBe(false);
    expect(result.feedbackRequired).toBe(true);
  });
});

describe('ComplianceConfigSchema', () => {
  it('should accept full compliance config', () => {
    const config = {
      gdprCompliant: true,
      eeocEnabled: true,
      dataRetentionDays: 730,
      anonymizeRejected: true,
    };

    expect(() => ComplianceConfigSchema.parse(config)).not.toThrow();
  });

  it('should apply defaults', () => {
    const result = ComplianceConfigSchema.parse({});
    expect(result.gdprCompliant).toBe(false);
    expect(result.eeocEnabled).toBe(false);
    expect(result.anonymizeRejected).toBe(false);
  });
});

describe('RecruitingConnectorSchema', () => {
  describe('Basic Properties', () => {
    it('should accept minimal recruiting connector', () => {
      const connector: RecruitingConnector = {
        name: 'greenhouse_test',
        label: 'Greenhouse Test',
        type: 'saas',
        provider: 'greenhouse',
        baseUrl: 'https://harvest.greenhouse.io/v1',
        authentication: {
          type: 'api-key',
          key: 'gh_test_123',
          headerName: 'Authorization',
        },
        objectTypes: [
          {
            name: 'candidates',
            label: 'Candidates',
            apiName: 'candidates',
          },
        ],
      };

      expect(() => RecruitingConnectorSchema.parse(connector)).not.toThrow();
    });

    it('should enforce snake_case for connector name', () => {
      const validNames = ['greenhouse_test', 'linkedin_production', '_internal'];
      validNames.forEach(name => {
        expect(() => RecruitingConnectorSchema.parse({
          name,
          label: 'Test',
          type: 'saas',
          provider: 'greenhouse',
          baseUrl: 'https://harvest.greenhouse.io/v1',
          authentication: { type: 'api-key', key: 'key', headerName: 'Authorization' },
          objectTypes: [{ name: 'candidates', label: 'Candidates', apiName: 'candidates' }],
        })).not.toThrow();
      });

      const invalidNames = ['greenhouseTest', 'LinkedIn-Recruiter', '123lever'];
      invalidNames.forEach(name => {
        expect(() => RecruitingConnectorSchema.parse({
          name,
          label: 'Test',
          type: 'saas',
          provider: 'greenhouse',
          baseUrl: 'https://harvest.greenhouse.io/v1',
          authentication: { type: 'api-key', key: 'key', headerName: 'Authorization' },
          objectTypes: [{ name: 'candidates', label: 'Candidates', apiName: 'candidates' }],
        })).toThrow();
      });
    });
  });

  describe('Complete Configuration', () => {
    it('should accept full recruiting connector with all features', () => {
      const connector: RecruitingConnector = {
        name: 'greenhouse_full',
        label: 'Greenhouse Full Config',
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
        ],

        webhookEvents: ['candidate.applied', 'candidate.hired', 'offer.created'],

        candidateSourceConfig: {
          defaultSource: 'greenhouse',
          autoTagSource: true,
        },

        pipelineConfig: {
          stages: [
            { name: 'screening', label: 'Screening', order: 0 },
            { name: 'interview', label: 'Interview', order: 1 },
            { name: 'offer', label: 'Offer', order: 2 },
          ],
          autoAdvance: false,
          stageNotifications: true,
        },

        interviewConfig: {
          defaultDuration: 45,
          calendarIntegration: true,
          feedbackRequired: true,
          scorecardTemplateId: 'tmpl_engineering',
        },

        complianceConfig: {
          gdprCompliant: true,
          eeocEnabled: true,
          dataRetentionDays: 730,
          anonymizeRejected: false,
        },

        oauthSettings: {
          scopes: ['candidates:read', 'candidates:write'],
          refreshTokenUrl: 'https://harvest.greenhouse.io/oauth/token',
          autoRefresh: true,
        },

        status: 'active',
        enabled: true,
      };

      expect(() => RecruitingConnectorSchema.parse(connector)).not.toThrow();
    });
  });

  describe('Example Configurations', () => {
    it('should accept LinkedIn connector example', () => {
      expect(() => RecruitingConnectorSchema.parse(linkedinConnectorExample)).not.toThrow();
    });

    it('should accept Greenhouse connector example', () => {
      expect(() => RecruitingConnectorSchema.parse(greenhouseConnectorExample)).not.toThrow();
    });
  });
});
