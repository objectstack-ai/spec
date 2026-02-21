import { describe, it, expect } from 'vitest';
import {
  PluginBuildOptionsSchema,
  PluginBuildResultSchema,
  ValidationSeverityEnum,
  ValidationFindingSchema,
  PluginValidateOptionsSchema,
  PluginValidateResultSchema,
  PluginPublishOptionsSchema,
  PluginPublishResultSchema,
} from './cli-plugin-commands.zod';

// ==========================================
// os plugin build
// ==========================================

describe('PluginBuildOptionsSchema', () => {
  it('should accept minimal options with defaults', () => {
    const result = PluginBuildOptionsSchema.parse({});
    expect(result.format).toBe('tgz');
    expect(result.sign).toBe(false);
    expect(result.checksumAlgorithm).toBe('sha256');
    expect(result.includeData).toBe(true);
    expect(result.includeLocales).toBe(true);
  });

  it('should accept full build options', () => {
    const result = PluginBuildOptionsSchema.parse({
      directory: '/home/user/my-plugin',
      outDir: './dist',
      format: 'zip',
      sign: true,
      privateKeyPath: '/keys/private.pem',
      signAlgorithm: 'RSA-SHA256',
      checksumAlgorithm: 'sha512',
      includeData: false,
      includeLocales: false,
    });
    expect(result.directory).toBe('/home/user/my-plugin');
    expect(result.format).toBe('zip');
    expect(result.sign).toBe(true);
    expect(result.privateKeyPath).toBe('/keys/private.pem');
    expect(result.signAlgorithm).toBe('RSA-SHA256');
    expect(result.checksumAlgorithm).toBe('sha512');
    expect(result.includeData).toBe(false);
  });

  it('should reject invalid format', () => {
    expect(() => PluginBuildOptionsSchema.parse({ format: 'rar' })).toThrow();
  });

  it('should reject invalid signing algorithm', () => {
    expect(() => PluginBuildOptionsSchema.parse({ signAlgorithm: 'MD5' })).toThrow();
  });
});

describe('PluginBuildResultSchema', () => {
  it('should accept a successful build result', () => {
    const result = PluginBuildResultSchema.parse({
      success: true,
      artifactPath: '/dist/com.acme.crm-1.0.0.tgz',
      artifact: {
        packageId: 'com.acme.crm',
        version: '1.0.0',
        builtAt: '2026-02-01T10:00:00Z',
      },
      fileCount: 25,
      size: 1024000,
      durationMs: 3200,
    });
    expect(result.success).toBe(true);
    expect(result.artifactPath).toContain('.tgz');
    expect(result.fileCount).toBe(25);
  });

  it('should accept a failed build result', () => {
    const result = PluginBuildResultSchema.parse({
      success: false,
      errorMessage: 'Missing manifest.json in project root',
    });
    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('manifest');
  });

  it('should accept build result with warnings', () => {
    const result = PluginBuildResultSchema.parse({
      success: true,
      warnings: ['No seed data found', 'No locale files found'],
    });
    expect(result.warnings).toHaveLength(2);
  });
});

// ==========================================
// os plugin validate
// ==========================================

describe('ValidationSeverityEnum', () => {
  it('should accept all valid severities', () => {
    expect(ValidationSeverityEnum.parse('error')).toBe('error');
    expect(ValidationSeverityEnum.parse('warning')).toBe('warning');
    expect(ValidationSeverityEnum.parse('info')).toBe('info');
  });

  it('should reject invalid severity', () => {
    expect(() => ValidationSeverityEnum.parse('critical')).toThrow();
  });
});

describe('ValidationFindingSchema', () => {
  it('should accept a valid finding', () => {
    const result = ValidationFindingSchema.parse({
      severity: 'error',
      rule: 'manifest-required',
      message: 'manifest.json is missing from the artifact',
      path: 'manifest.json',
    });
    expect(result.severity).toBe('error');
    expect(result.rule).toBe('manifest-required');
    expect(result.path).toBe('manifest.json');
  });

  it('should accept finding without path', () => {
    const result = ValidationFindingSchema.parse({
      severity: 'warning',
      rule: 'no-seed-data',
      message: 'No seed data directory found',
    });
    expect(result.path).toBeUndefined();
  });
});

describe('PluginValidateOptionsSchema', () => {
  it('should accept minimal options with defaults', () => {
    const result = PluginValidateOptionsSchema.parse({
      artifactPath: './dist/my-plugin-1.0.0.tgz',
    });
    expect(result.artifactPath).toContain('.tgz');
    expect(result.verifySignature).toBe(true);
    expect(result.verifyChecksums).toBe(true);
    expect(result.validateMetadata).toBe(true);
  });

  it('should accept options with signature disabled', () => {
    const result = PluginValidateOptionsSchema.parse({
      artifactPath: './dist/my-plugin-1.0.0.tgz',
      verifySignature: false,
      platformVersion: '3.2.0',
    });
    expect(result.verifySignature).toBe(false);
    expect(result.platformVersion).toBe('3.2.0');
  });
});

describe('PluginValidateResultSchema', () => {
  it('should accept a valid artifact', () => {
    const result = PluginValidateResultSchema.parse({
      valid: true,
      findings: [],
      checksumVerification: { passed: true },
      signatureVerification: { passed: true },
      summary: { errors: 0, warnings: 0, infos: 0 },
    });
    expect(result.valid).toBe(true);
    expect(result.findings).toHaveLength(0);
  });

  it('should accept an invalid artifact with findings', () => {
    const result = PluginValidateResultSchema.parse({
      valid: false,
      findings: [
        { severity: 'error', rule: 'checksum-mismatch', message: 'Checksum mismatch for metadata/objects/account.object.json' },
        { severity: 'warning', rule: 'missing-icon', message: 'No icon.svg found in assets/' },
      ],
      checksumVerification: {
        passed: false,
        mismatches: ['metadata/objects/account.object.json'],
      },
      summary: { errors: 1, warnings: 1, infos: 0 },
    });
    expect(result.valid).toBe(false);
    expect(result.findings).toHaveLength(2);
    expect(result.checksumVerification?.passed).toBe(false);
    expect(result.checksumVerification?.mismatches).toHaveLength(1);
    expect(result.summary?.errors).toBe(1);
  });

  it('should accept platform compatibility result', () => {
    const result = PluginValidateResultSchema.parse({
      valid: false,
      findings: [
        { severity: 'error', rule: 'platform-incompatible', message: 'Requires ObjectStack >=3.5.0, current: 3.2.0' },
      ],
      platformCompatibility: {
        compatible: false,
        requiredRange: '>=3.5.0',
        targetVersion: '3.2.0',
      },
    });
    expect(result.platformCompatibility?.compatible).toBe(false);
    expect(result.platformCompatibility?.requiredRange).toBe('>=3.5.0');
  });

  it('should accept signature verification failure', () => {
    const result = PluginValidateResultSchema.parse({
      valid: false,
      findings: [
        { severity: 'error', rule: 'signature-invalid', message: 'Digital signature verification failed' },
      ],
      signatureVerification: {
        passed: false,
        failureReason: 'Public key mismatch',
      },
    });
    expect(result.signatureVerification?.passed).toBe(false);
    expect(result.signatureVerification?.failureReason).toContain('mismatch');
  });
});

// ==========================================
// os plugin publish
// ==========================================

describe('PluginPublishOptionsSchema', () => {
  it('should accept minimal publish options', () => {
    const result = PluginPublishOptionsSchema.parse({
      artifactPath: './dist/my-plugin-1.0.0.tgz',
    });
    expect(result.artifactPath).toContain('.tgz');
    expect(result.preRelease).toBe(false);
    expect(result.skipValidation).toBe(false);
    expect(result.access).toBe('public');
  });

  it('should accept full publish options', () => {
    const result = PluginPublishOptionsSchema.parse({
      artifactPath: './dist/my-plugin-1.0.0.tgz',
      registryUrl: 'https://marketplace.objectstack.io/api/v1',
      token: 'os_token_abc123',
      releaseNotes: '## What\'s New\n- Added CRM features',
      preRelease: true,
      skipValidation: false,
      access: 'restricted',
      tags: ['crm', 'sales'],
    });
    expect(result.registryUrl).toContain('objectstack.io');
    expect(result.preRelease).toBe(true);
    expect(result.access).toBe('restricted');
    expect(result.tags).toHaveLength(2);
  });

  it('should reject invalid registry URL', () => {
    expect(() => PluginPublishOptionsSchema.parse({
      artifactPath: './dist/test.tgz',
      registryUrl: 'not-a-url',
    })).toThrow();
  });
});

describe('PluginPublishResultSchema', () => {
  it('should accept a successful publish result', () => {
    const result = PluginPublishResultSchema.parse({
      success: true,
      packageId: 'com.acme.crm',
      version: '1.0.0',
      artifactUrl: 'https://marketplace.objectstack.io/artifacts/com.acme.crm/1.0.0.tgz',
      sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
      submissionId: 'sub_001',
      message: 'Package submitted for review',
    });
    expect(result.success).toBe(true);
    expect(result.packageId).toBe('com.acme.crm');
    expect(result.submissionId).toBe('sub_001');
  });

  it('should accept a failed publish result', () => {
    const result = PluginPublishResultSchema.parse({
      success: false,
      errorMessage: 'Authentication failed: invalid token',
    });
    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('Authentication');
  });
});
