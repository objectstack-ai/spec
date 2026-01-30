import { z } from 'zod';

/**
 * Compliance protocol for GDPR, CCPA, HIPAA, SOX, PCI-DSS
 */
export const GDPRConfigSchema = z.object({
  enabled: z.boolean(),
  dataSubjectRights: z.object({
    rightToAccess: z.boolean().default(true),
    rightToRectification: z.boolean().default(true),
    rightToErasure: z.boolean().default(true),
    rightToRestriction: z.boolean().default(true),
    rightToPortability: z.boolean().default(true),
    rightToObject: z.boolean().default(true),
  }),
  legalBasis: z.enum([
    'consent',
    'contract',
    'legal-obligation',
    'vital-interests',
    'public-task',
    'legitimate-interests',
  ]),
  consentTracking: z.boolean().default(true),
  dataRetentionDays: z.number().optional(),
  dataProcessingAgreement: z.string().optional(),
});

export type GDPRConfig = z.infer<typeof GDPRConfigSchema>;

export const HIPAAConfigSchema = z.object({
  enabled: z.boolean(),
  phi: z.object({
    encryption: z.boolean().default(true),
    accessControl: z.boolean().default(true),
    auditTrail: z.boolean().default(true),
    backupAndRecovery: z.boolean().default(true),
  }),
  businessAssociateAgreement: z.boolean().default(false),
});

export type HIPAAConfig = z.infer<typeof HIPAAConfigSchema>;

export const PCIDSSConfigSchema = z.object({
  enabled: z.boolean(),
  level: z.enum(['1', '2', '3', '4']),
  cardDataFields: z.array(z.string()),
  tokenization: z.boolean().default(true),
  encryptionInTransit: z.boolean().default(true),
  encryptionAtRest: z.boolean().default(true),
});

export type PCIDSSConfig = z.infer<typeof PCIDSSConfigSchema>;

export const AuditLogConfigSchema = z.object({
  enabled: z.boolean().default(true),
  retentionDays: z.number().default(365),
  immutable: z.boolean().default(true),
  signLogs: z.boolean().default(false),
  events: z.array(z.enum([
    'create',
    'read',
    'update',
    'delete',
    'export',
    'permission-change',
    'login',
    'logout',
    'failed-login',
  ])),
});

export type AuditLogConfig = z.infer<typeof AuditLogConfigSchema>;

export const ComplianceConfigSchema = z.object({
  gdpr: GDPRConfigSchema.optional(),
  hipaa: HIPAAConfigSchema.optional(),
  pciDss: PCIDSSConfigSchema.optional(),
  auditLog: AuditLogConfigSchema,
});

export type ComplianceConfig = z.infer<typeof ComplianceConfigSchema>;
