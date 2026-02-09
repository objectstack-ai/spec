import { describe, it, expect } from 'vitest';
import {
  EncryptionAlgorithmSchema,
  KeyManagementProviderSchema,
  KeyRotationPolicySchema,
  EncryptionConfigSchema,
  FieldEncryptionSchema,
} from './encryption.zod';

describe('EncryptionAlgorithmSchema', () => {
  it('should accept valid algorithms', () => {
    const algorithms = ['aes-256-gcm', 'aes-256-cbc', 'chacha20-poly1305'];

    algorithms.forEach((alg) => {
      expect(() => EncryptionAlgorithmSchema.parse(alg)).not.toThrow();
    });
  });

  it('should reject invalid algorithms', () => {
    expect(() => EncryptionAlgorithmSchema.parse('invalid')).toThrow();
    expect(() => EncryptionAlgorithmSchema.parse('aes-128-gcm')).toThrow();
  });
});

describe('KeyManagementProviderSchema', () => {
  it('should accept valid providers', () => {
    const providers = ['local', 'aws-kms', 'azure-key-vault', 'gcp-kms', 'hashicorp-vault'];

    providers.forEach((provider) => {
      expect(() => KeyManagementProviderSchema.parse(provider)).not.toThrow();
    });
  });

  it('should reject invalid providers', () => {
    expect(() => KeyManagementProviderSchema.parse('invalid')).toThrow();
    expect(() => KeyManagementProviderSchema.parse('custom')).toThrow();
  });
});

describe('KeyRotationPolicySchema', () => {
  it('should apply defaults', () => {
    const policy = KeyRotationPolicySchema.parse({});

    expect(policy.enabled).toBe(false);
    expect(policy.frequencyDays).toBe(90);
    expect(policy.retainOldVersions).toBe(3);
    expect(policy.autoRotate).toBe(true);
  });

  it('should accept custom values', () => {
    const policy = KeyRotationPolicySchema.parse({
      enabled: true,
      frequencyDays: 30,
      retainOldVersions: 5,
      autoRotate: false,
    });

    expect(policy.enabled).toBe(true);
    expect(policy.frequencyDays).toBe(30);
    expect(policy.retainOldVersions).toBe(5);
    expect(policy.autoRotate).toBe(false);
  });

  it('should reject frequencyDays less than 1', () => {
    expect(() => KeyRotationPolicySchema.parse({
      frequencyDays: 0,
    })).toThrow();

    expect(() => KeyRotationPolicySchema.parse({
      frequencyDays: -1,
    })).toThrow();
  });
});

describe('EncryptionConfigSchema', () => {
  it('should accept valid configuration with defaults', () => {
    const config = EncryptionConfigSchema.parse({
      keyManagement: {
        provider: 'local',
      },
      scope: 'field',
    });

    expect(config.enabled).toBe(false);
    expect(config.algorithm).toBe('aes-256-gcm');
    expect(config.keyManagement.provider).toBe('local');
    expect(config.scope).toBe('field');
    expect(config.deterministicEncryption).toBe(false);
    expect(config.searchableEncryption).toBe(false);
  });

  it('should accept full configuration', () => {
    const config = EncryptionConfigSchema.parse({
      enabled: true,
      algorithm: 'chacha20-poly1305',
      keyManagement: {
        provider: 'aws-kms',
        keyId: 'arn:aws:kms:us-east-1:123456:key/abc',
        rotationPolicy: {
          enabled: true,
          frequencyDays: 30,
          retainOldVersions: 5,
          autoRotate: true,
        },
      },
      scope: 'record',
      deterministicEncryption: true,
      searchableEncryption: true,
    });

    expect(config.enabled).toBe(true);
    expect(config.algorithm).toBe('chacha20-poly1305');
    expect(config.keyManagement.provider).toBe('aws-kms');
    expect(config.keyManagement.keyId).toBe('arn:aws:kms:us-east-1:123456:key/abc');
    expect(config.keyManagement.rotationPolicy?.enabled).toBe(true);
    expect(config.scope).toBe('record');
    expect(config.deterministicEncryption).toBe(true);
    expect(config.searchableEncryption).toBe(true);
  });

  it('should accept all scope values', () => {
    const scopes = ['field', 'record', 'table', 'database'];

    scopes.forEach((scope) => {
      expect(() => EncryptionConfigSchema.parse({
        keyManagement: { provider: 'local' },
        scope,
      })).not.toThrow();
    });
  });

  it('should reject missing required fields', () => {
    expect(() => EncryptionConfigSchema.parse({})).toThrow();
    expect(() => EncryptionConfigSchema.parse({ keyManagement: { provider: 'local' } })).toThrow();
    expect(() => EncryptionConfigSchema.parse({ scope: 'field' })).toThrow();
  });

  it('should reject invalid algorithm', () => {
    expect(() => EncryptionConfigSchema.parse({
      algorithm: 'invalid',
      keyManagement: { provider: 'local' },
      scope: 'field',
    })).toThrow();
  });
});

describe('FieldEncryptionSchema', () => {
  it('should accept valid field encryption config', () => {
    const config = FieldEncryptionSchema.parse({
      fieldName: 'ssn',
      encryptionConfig: {
        keyManagement: { provider: 'local' },
        scope: 'field',
      },
    });

    expect(config.fieldName).toBe('ssn');
    expect(config.indexable).toBe(false);
    expect(config.encryptionConfig.algorithm).toBe('aes-256-gcm');
  });

  it('should accept full configuration', () => {
    const config = FieldEncryptionSchema.parse({
      fieldName: 'credit_card',
      encryptionConfig: {
        enabled: true,
        algorithm: 'aes-256-cbc',
        keyManagement: {
          provider: 'hashicorp-vault',
          keyId: 'transit/keys/credit-card',
        },
        scope: 'field',
        deterministicEncryption: true,
      },
      indexable: true,
    });

    expect(config.fieldName).toBe('credit_card');
    expect(config.encryptionConfig.algorithm).toBe('aes-256-cbc');
    expect(config.encryptionConfig.keyManagement.provider).toBe('hashicorp-vault');
    expect(config.indexable).toBe(true);
  });

  it('should reject missing required fields', () => {
    expect(() => FieldEncryptionSchema.parse({})).toThrow();
    expect(() => FieldEncryptionSchema.parse({ fieldName: 'test' })).toThrow();
  });
});
