import { z } from 'zod';

/**
 * Field-level encryption protocol
 * GDPR/HIPAA/PCI-DSS compliant
 */
export const EncryptionAlgorithmSchema = z.enum([
  'aes-256-gcm',
  'aes-256-cbc',
  'chacha20-poly1305',
]);

export type EncryptionAlgorithm = z.infer<typeof EncryptionAlgorithmSchema>;

export const KeyManagementProviderSchema = z.enum([
  'local',
  'aws-kms',
  'azure-key-vault',
  'gcp-kms',
  'hashicorp-vault',
]);

export type KeyManagementProvider = z.infer<typeof KeyManagementProviderSchema>;

export const KeyRotationPolicySchema = z.object({
  enabled: z.boolean().default(false),
  frequencyDays: z.number().min(1).default(90),
  retainOldVersions: z.number().default(3),
  autoRotate: z.boolean().default(true),
});

export type KeyRotationPolicy = z.infer<typeof KeyRotationPolicySchema>;

export const EncryptionConfigSchema = z.object({
  enabled: z.boolean().default(false),
  algorithm: EncryptionAlgorithmSchema.default('aes-256-gcm'),
  keyManagement: z.object({
    provider: KeyManagementProviderSchema,
    keyId: z.string().optional(),
    rotationPolicy: KeyRotationPolicySchema.optional(),
  }),
  scope: z.enum(['field', 'record', 'table', 'database']),
  deterministicEncryption: z.boolean().default(false).describe('Allows equality queries on encrypted data'),
  searchableEncryption: z.boolean().default(false).describe('Allows search on encrypted data'),
});

export type EncryptionConfig = z.infer<typeof EncryptionConfigSchema>;

export const FieldEncryptionSchema = z.object({
  fieldName: z.string(),
  encryptionConfig: EncryptionConfigSchema,
  indexable: z.boolean().default(false),
});

export type FieldEncryption = z.infer<typeof FieldEncryptionSchema>;
