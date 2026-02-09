import { describe, it, expect } from 'vitest';
import {
  GDPRConfigSchema,
  HIPAAConfigSchema,
  PCIDSSConfigSchema,
  AuditLogConfigSchema,
  ComplianceConfigSchema,
} from './compliance.zod';

describe('GDPRConfigSchema', () => {
  it('should accept valid GDPR config with defaults', () => {
    const config = GDPRConfigSchema.parse({
      enabled: true,
      dataSubjectRights: {},
      legalBasis: 'consent',
    });

    expect(config.enabled).toBe(true);
    expect(config.dataSubjectRights.rightToAccess).toBe(true);
    expect(config.dataSubjectRights.rightToRectification).toBe(true);
    expect(config.dataSubjectRights.rightToErasure).toBe(true);
    expect(config.dataSubjectRights.rightToRestriction).toBe(true);
    expect(config.dataSubjectRights.rightToPortability).toBe(true);
    expect(config.dataSubjectRights.rightToObjection).toBe(true);
    expect(config.consentTracking).toBe(true);
  });

  it('should accept all legal basis values', () => {
    const bases = [
      'consent', 'contract', 'legal-obligation',
      'vital-interests', 'public-task', 'legitimate-interests',
    ];

    bases.forEach((basis) => {
      expect(() => GDPRConfigSchema.parse({
        enabled: true,
        dataSubjectRights: {},
        legalBasis: basis,
      })).not.toThrow();
    });
  });

  it('should accept optional fields', () => {
    const config = GDPRConfigSchema.parse({
      enabled: true,
      dataSubjectRights: {},
      legalBasis: 'consent',
      dataRetentionDays: 365,
      dataProcessingAgreement: 'https://example.com/dpa',
    });

    expect(config.dataRetentionDays).toBe(365);
    expect(config.dataProcessingAgreement).toBe('https://example.com/dpa');
  });

  it('should reject invalid legal basis', () => {
    expect(() => GDPRConfigSchema.parse({
      enabled: true,
      dataSubjectRights: {},
      legalBasis: 'invalid',
    })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => GDPRConfigSchema.parse({})).toThrow();
    expect(() => GDPRConfigSchema.parse({ enabled: true })).toThrow();
  });
});

describe('HIPAAConfigSchema', () => {
  it('should accept valid HIPAA config with defaults', () => {
    const config = HIPAAConfigSchema.parse({
      enabled: true,
      phi: {},
    });

    expect(config.enabled).toBe(true);
    expect(config.phi.encryption).toBe(true);
    expect(config.phi.accessControl).toBe(true);
    expect(config.phi.auditTrail).toBe(true);
    expect(config.phi.backupAndRecovery).toBe(true);
    expect(config.businessAssociateAgreement).toBe(false);
  });

  it('should accept full configuration', () => {
    const config = HIPAAConfigSchema.parse({
      enabled: true,
      phi: {
        encryption: false,
        accessControl: true,
        auditTrail: true,
        backupAndRecovery: false,
      },
      businessAssociateAgreement: true,
    });

    expect(config.phi.encryption).toBe(false);
    expect(config.phi.backupAndRecovery).toBe(false);
    expect(config.businessAssociateAgreement).toBe(true);
  });

  it('should reject missing required fields', () => {
    expect(() => HIPAAConfigSchema.parse({})).toThrow();
    expect(() => HIPAAConfigSchema.parse({ enabled: true })).toThrow();
  });
});

describe('PCIDSSConfigSchema', () => {
  it('should accept valid PCI-DSS config with defaults', () => {
    const config = PCIDSSConfigSchema.parse({
      enabled: true,
      level: '1',
      cardDataFields: ['card_number', 'cvv'],
    });

    expect(config.enabled).toBe(true);
    expect(config.level).toBe('1');
    expect(config.cardDataFields).toEqual(['card_number', 'cvv']);
    expect(config.tokenization).toBe(true);
    expect(config.encryptionInTransit).toBe(true);
    expect(config.encryptionAtRest).toBe(true);
  });

  it('should accept all compliance levels', () => {
    const levels = ['1', '2', '3', '4'];

    levels.forEach((level) => {
      expect(() => PCIDSSConfigSchema.parse({
        enabled: true,
        level,
        cardDataFields: [],
      })).not.toThrow();
    });
  });

  it('should reject invalid level', () => {
    expect(() => PCIDSSConfigSchema.parse({
      enabled: true,
      level: '5',
      cardDataFields: [],
    })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => PCIDSSConfigSchema.parse({})).toThrow();
    expect(() => PCIDSSConfigSchema.parse({ enabled: true })).toThrow();
    expect(() => PCIDSSConfigSchema.parse({ enabled: true, level: '1' })).toThrow();
  });
});

describe('AuditLogConfigSchema', () => {
  it('should accept valid config with defaults', () => {
    const config = AuditLogConfigSchema.parse({
      events: ['create', 'update', 'delete'],
    });

    expect(config.enabled).toBe(true);
    expect(config.retentionDays).toBe(365);
    expect(config.immutable).toBe(true);
    expect(config.signLogs).toBe(false);
    expect(config.events).toEqual(['create', 'update', 'delete']);
  });

  it('should accept all event types', () => {
    const events = [
      'create', 'read', 'update', 'delete', 'export',
      'permission-change', 'login', 'logout', 'failed-login',
    ];

    expect(() => AuditLogConfigSchema.parse({ events })).not.toThrow();
  });

  it('should reject invalid event type', () => {
    expect(() => AuditLogConfigSchema.parse({
      events: ['invalid-event'],
    })).toThrow();
  });

  it('should reject missing events', () => {
    expect(() => AuditLogConfigSchema.parse({})).toThrow();
  });
});

describe('ComplianceConfigSchema', () => {
  it('should accept minimal configuration with required auditLog', () => {
    const config = ComplianceConfigSchema.parse({
      auditLog: {
        events: ['create', 'update'],
      },
    });

    expect(config.gdpr).toBeUndefined();
    expect(config.hipaa).toBeUndefined();
    expect(config.pciDss).toBeUndefined();
    expect(config.auditLog).toBeDefined();
    expect(config.auditLog.events).toEqual(['create', 'update']);
  });

  it('should accept full configuration', () => {
    const config = ComplianceConfigSchema.parse({
      gdpr: {
        enabled: true,
        dataSubjectRights: {},
        legalBasis: 'consent',
      },
      hipaa: {
        enabled: true,
        phi: {},
      },
      pciDss: {
        enabled: true,
        level: '1',
        cardDataFields: ['card_number'],
      },
      auditLog: {
        events: ['create', 'read', 'update', 'delete'],
      },
    });

    expect(config.gdpr?.enabled).toBe(true);
    expect(config.hipaa?.enabled).toBe(true);
    expect(config.pciDss?.enabled).toBe(true);
    expect(config.auditLog.events).toHaveLength(4);
  });

  it('should reject missing auditLog', () => {
    expect(() => ComplianceConfigSchema.parse({})).toThrow();
  });
});
