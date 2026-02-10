import { describe, it, expect } from 'vitest';
import {
  MetadataSourceSchema,
  IssueSchema,
  ResolutionSchema,
  FeedbackLoopSchema,
} from './feedback-loop.zod';

describe('MetadataSourceSchema', () => {
  it('should accept empty object (all fields optional)', () => {
    const result = MetadataSourceSchema.parse({});
    expect(result.file).toBeUndefined();
    expect(result.line).toBeUndefined();
    expect(result.column).toBeUndefined();
    expect(result.package).toBeUndefined();
    expect(result.object).toBeUndefined();
    expect(result.field).toBeUndefined();
    expect(result.component).toBeUndefined();
  });

  it('should accept full source metadata', () => {
    const source = {
      file: 'src/objects/account.ts',
      line: 42,
      column: 10,
      package: 'crm',
      object: 'account',
      field: 'status',
      component: 'StatusDropdown',
    };
    expect(() => MetadataSourceSchema.parse(source)).not.toThrow();
  });

  it('should reject non-object values', () => {
    expect(() => MetadataSourceSchema.parse('string')).toThrow();
  });
});

describe('IssueSchema', () => {
  const validIssue = {
    id: 'issue-001',
    severity: 'error',
    message: 'Field validation failed',
    timestamp: '2024-01-15T10:30:00Z',
  };

  it('should accept minimal valid issue', () => {
    const result = IssueSchema.parse(validIssue);
    expect(result.id).toBe('issue-001');
    expect(result.severity).toBe('error');
    expect(result.stackTrace).toBeUndefined();
    expect(result.userId).toBeUndefined();
    expect(result.context).toBeUndefined();
    expect(result.source).toBeUndefined();
  });

  it('should accept all severity levels', () => {
    const severities = ['critical', 'error', 'warning', 'info'] as const;
    severities.forEach(severity => {
      expect(() => IssueSchema.parse({ ...validIssue, severity })).not.toThrow();
    });
  });

  it('should accept full issue with all optional fields', () => {
    const issue = {
      ...validIssue,
      stackTrace: 'Error at line 42\n  at module.ts:10',
      userId: 'user-123',
      context: { recordId: 'rec-456', action: 'save' },
      source: { file: 'src/objects/account.ts', line: 42 },
    };
    expect(() => IssueSchema.parse(issue)).not.toThrow();
  });

  it('should reject invalid severity', () => {
    expect(() => IssueSchema.parse({ ...validIssue, severity: 'fatal' })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => IssueSchema.parse({ id: 'x' })).toThrow();
    expect(() => IssueSchema.parse({ id: 'x', severity: 'error' })).toThrow();
  });

  it('should reject invalid timestamp format', () => {
    expect(() => IssueSchema.parse({ ...validIssue, timestamp: 'not-a-date' })).toThrow();
  });
});

describe('ResolutionSchema', () => {
  const metadataChangeResolution = {
    issueId: 'issue-001',
    reasoning: 'The field type is incompatible with the data',
    confidence: 0.85,
    fix: {
      type: 'metadata_change',
      changeSet: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Fix field type',
        operations: [{ type: 'add_field', objectName: 'account', fieldName: 'status', field: { name: 'status', type: 'text' } }],
      },
    },
  };

  const manualResolution = {
    issueId: 'issue-002',
    reasoning: 'Requires manual database migration',
    confidence: 0.6,
    fix: {
      type: 'manual_intervention',
      instructions: 'Run ALTER TABLE to update the column type',
    },
  };

  it('should accept metadata_change resolution', () => {
    const result = ResolutionSchema.parse(metadataChangeResolution);
    expect(result.fix.type).toBe('metadata_change');
    expect(result.confidence).toBe(0.85);
  });

  it('should accept manual_intervention resolution', () => {
    const result = ResolutionSchema.parse(manualResolution);
    expect(result.fix.type).toBe('manual_intervention');
  });

  it('should reject confidence below 0', () => {
    expect(() => ResolutionSchema.parse({ ...metadataChangeResolution, confidence: -0.1 })).toThrow();
  });

  it('should reject confidence above 1', () => {
    expect(() => ResolutionSchema.parse({ ...metadataChangeResolution, confidence: 1.1 })).toThrow();
  });

  it('should reject invalid fix type', () => {
    expect(() => ResolutionSchema.parse({
      issueId: 'x',
      reasoning: 'test',
      confidence: 0.5,
      fix: { type: 'auto_fix', data: {} },
    })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => ResolutionSchema.parse({ issueId: 'x' })).toThrow();
  });
});

describe('FeedbackLoopSchema', () => {
  const validIssue = {
    id: 'issue-001',
    severity: 'warning',
    message: 'Slow query detected',
    timestamp: '2024-06-01T12:00:00Z',
  };

  it('should accept minimal feedback loop with defaults', () => {
    const result = FeedbackLoopSchema.parse({ issue: validIssue });
    expect(result.status).toBe('open');
    expect(result.analysis).toBeUndefined();
    expect(result.resolutions).toBeUndefined();
  });

  it('should accept all status values', () => {
    const statuses = ['open', 'analyzing', 'resolved', 'ignored'] as const;
    statuses.forEach(status => {
      expect(() => FeedbackLoopSchema.parse({ issue: validIssue, status })).not.toThrow();
    });
  });

  it('should accept full feedback loop', () => {
    const loop = {
      issue: validIssue,
      analysis: 'The query lacks proper indexing',
      resolutions: [{
        issueId: 'issue-001',
        reasoning: 'Add index on account.status',
        confidence: 0.9,
        fix: { type: 'manual_intervention', instructions: 'CREATE INDEX idx_status ON account(status)' },
      }],
      status: 'resolved',
    };
    expect(() => FeedbackLoopSchema.parse(loop)).not.toThrow();
  });

  it('should reject without issue', () => {
    expect(() => FeedbackLoopSchema.parse({ status: 'open' })).toThrow();
  });

  it('should reject invalid status', () => {
    expect(() => FeedbackLoopSchema.parse({ issue: validIssue, status: 'pending' })).toThrow();
  });
});
