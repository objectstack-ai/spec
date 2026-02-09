// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';

/**
 * Compliance protocol for GDPR, CCPA, HIPAA, SOX, PCI-DSS
 */
export const GDPRConfigSchema = z.object({
  enabled: z.boolean().describe('Enable GDPR compliance controls'),
  dataSubjectRights: z.object({
    rightToAccess: z.boolean().default(true).describe('Allow data subjects to access their data'),
    rightToRectification: z.boolean().default(true).describe('Allow data subjects to correct their data'),
    rightToErasure: z.boolean().default(true).describe('Allow data subjects to request deletion'),
    rightToRestriction: z.boolean().default(true).describe('Allow data subjects to restrict processing'),
    rightToPortability: z.boolean().default(true).describe('Allow data subjects to export their data'),
    rightToObjection: z.boolean().default(true).describe('Allow data subjects to object to processing'),
  }).describe('Data subject rights configuration per GDPR Articles 15-21'),
  legalBasis: z.enum([
    'consent',
    'contract',
    'legal-obligation',
    'vital-interests',
    'public-task',
    'legitimate-interests',
  ]).describe('Legal basis for data processing under GDPR Article 6'),
  consentTracking: z.boolean().default(true).describe('Track and record user consent'),
  dataRetentionDays: z.number().optional().describe('Maximum data retention period in days'),
  dataProcessingAgreement: z.string().optional().describe('URL or reference to the data processing agreement'),
}).describe('GDPR (General Data Protection Regulation) compliance configuration');

export type GDPRConfig = z.infer<typeof GDPRConfigSchema>;
export type GDPRConfigInput = z.input<typeof GDPRConfigSchema>;

export const HIPAAConfigSchema = z.object({
  enabled: z.boolean().describe('Enable HIPAA compliance controls'),
  phi: z.object({
    encryption: z.boolean().default(true).describe('Encrypt Protected Health Information at rest'),
    accessControl: z.boolean().default(true).describe('Enforce role-based access to PHI'),
    auditTrail: z.boolean().default(true).describe('Log all PHI access events'),
    backupAndRecovery: z.boolean().default(true).describe('Enable PHI backup and disaster recovery'),
  }).describe('Protected Health Information safeguards'),
  businessAssociateAgreement: z.boolean().default(false).describe('BAA is in place with third-party processors'),
}).describe('HIPAA (Health Insurance Portability and Accountability Act) compliance configuration');

export type HIPAAConfig = z.infer<typeof HIPAAConfigSchema>;
export type HIPAAConfigInput = z.input<typeof HIPAAConfigSchema>;

export const PCIDSSConfigSchema = z.object({
  enabled: z.boolean().describe('Enable PCI-DSS compliance controls'),
  level: z.enum(['1', '2', '3', '4']).describe('PCI-DSS compliance level (1 = highest)'),
  cardDataFields: z.array(z.string()).describe('Field names containing cardholder data'),
  tokenization: z.boolean().default(true).describe('Replace card data with secure tokens'),
  encryptionInTransit: z.boolean().default(true).describe('Encrypt cardholder data during transmission'),
  encryptionAtRest: z.boolean().default(true).describe('Encrypt stored cardholder data'),
}).describe('PCI-DSS (Payment Card Industry Data Security Standard) compliance configuration');

export type PCIDSSConfig = z.infer<typeof PCIDSSConfigSchema>;
export type PCIDSSConfigInput = z.input<typeof PCIDSSConfigSchema>;

export const AuditLogConfigSchema = z.object({
  enabled: z.boolean().default(true).describe('Enable audit logging'),
  retentionDays: z.number().default(365).describe('Number of days to retain audit logs'),
  immutable: z.boolean().default(true).describe('Prevent modification or deletion of audit logs'),
  signLogs: z.boolean().default(false).describe('Cryptographically sign log entries for tamper detection'),
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
  ])).describe('Event types to capture in the audit log'),
}).describe('Audit log configuration for compliance and security monitoring');

export type AuditLogConfig = z.infer<typeof AuditLogConfigSchema>;
export type AuditLogConfigInput = z.input<typeof AuditLogConfigSchema>;

export const ComplianceConfigSchema = z.object({
  gdpr: GDPRConfigSchema.optional().describe('GDPR compliance settings'),
  hipaa: HIPAAConfigSchema.optional().describe('HIPAA compliance settings'),
  pciDss: PCIDSSConfigSchema.optional().describe('PCI-DSS compliance settings'),
  auditLog: AuditLogConfigSchema.describe('Audit log configuration'),
}).describe('Unified compliance configuration spanning GDPR, HIPAA, and PCI-DSS');

export type ComplianceConfig = z.infer<typeof ComplianceConfigSchema>;
export type ComplianceConfigInput = z.input<typeof ComplianceConfigSchema>;
