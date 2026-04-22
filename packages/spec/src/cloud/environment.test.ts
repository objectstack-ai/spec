// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect } from 'vitest';
import {
  ProjectSchema,
  ProjectStatusSchema,
  ProjectCredentialSchema,
  ProjectCredentialStatusSchema,
  ProjectMemberSchema,
  ProjectRoleSchema,
  ProvisionProjectRequestSchema,
  ProvisionOrganizationRequestSchema,
} from './project.zod';

describe('ProjectStatusSchema', () => {
  it('accepts lifecycle statuses including migrating', () => {
    for (const s of [
      'provisioning',
      'active',
      'suspended',
      'archived',
      'failed',
      'migrating',
    ]) {
      expect(() => ProjectStatusSchema.parse(s)).not.toThrow();
    }
  });
});

describe('ProjectSchema', () => {
  const base = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    organizationId: 'org_1',
    displayName: 'Production',
    isDefault: true,
    plan: 'pro' as const,
    status: 'active' as const,
    createdBy: 'user_1',
    createdAt: '2026-04-19T00:00:00.000Z',
    updatedAt: '2026-04-19T00:00:00.000Z',
  };

  it('parses a valid project', () => {
    expect(() => ProjectSchema.parse(base)).not.toThrow();
  });

  it('rejects a non-UUID id', () => {
    expect(() => ProjectSchema.parse({ ...base, id: 'not-a-uuid' })).toThrow();
  });

  it('defaults isDefault to false when omitted', () => {
    const { isDefault: _d, ...rest } = base;
    const parsed = ProjectSchema.parse(rest);
    expect(parsed.isDefault).toBe(false);
  });

  it('does not define a slug or projectType field', () => {
    const parsed = ProjectSchema.parse(base);
    expect((parsed as any).slug).toBeUndefined();
    expect((parsed as any).projectType).toBeUndefined();
    expect((parsed as any).region).toBeUndefined();
  });
});

describe('ProjectCredentialSchema', () => {
  it('parses a valid active credential', () => {
    const cred = ProjectCredentialSchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      projectId: '550e8400-e29b-41d4-a716-446655440001',
      secretCiphertext: 'ciphertext',
      encryptionKeyId: 'kms-key-1',
      createdAt: '2026-04-19T00:00:00.000Z',
    });
    expect(cred.status).toBe('active');
    expect(cred.authorization).toBe('full_access');
  });

  it('rejects unknown status', () => {
    expect(() =>
      ProjectCredentialSchema.parse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        projectId: '550e8400-e29b-41d4-a716-446655440001',
        secretCiphertext: 'ciphertext',
        encryptionKeyId: 'kms-key-1',
        createdAt: '2026-04-19T00:00:00.000Z',
        status: 'bogus',
      }),
    ).toThrow();
  });

  it('accepts the full rotation status set', () => {
    for (const s of ['active', 'rotating', 'revoked']) {
      expect(() => ProjectCredentialStatusSchema.parse(s)).not.toThrow();
    }
  });
});

describe('ProjectMemberSchema', () => {
  it('accepts canonical roles', () => {
    for (const r of ['owner', 'admin', 'maker', 'reader', 'guest']) {
      expect(() => ProjectRoleSchema.parse(r)).not.toThrow();
    }
  });

  it('parses a valid member row', () => {
    expect(() =>
      ProjectMemberSchema.parse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        projectId: '550e8400-e29b-41d4-a716-446655440001',
        userId: 'user_1',
        role: 'admin',
        invitedBy: 'user_0',
        createdAt: '2026-04-19T00:00:00.000Z',
        updatedAt: '2026-04-19T00:00:00.000Z',
      }),
    ).not.toThrow();
  });
});

describe('ProvisionProjectRequestSchema', () => {
  it('accepts a minimal request (only organizationId + displayName + createdBy)', () => {
    expect(() =>
      ProvisionProjectRequestSchema.parse({
        organizationId: 'org_1',
        displayName: 'Alice dev',
        createdBy: 'user_1',
      }),
    ).not.toThrow();
  });

  it('rejects a request missing displayName', () => {
    expect(() =>
      ProvisionProjectRequestSchema.parse({
        organizationId: 'org_1',
        createdBy: 'user_1',
      }),
    ).toThrow();
  });

  it('rejects an empty displayName', () => {
    expect(() =>
      ProvisionProjectRequestSchema.parse({
        organizationId: 'org_1',
        displayName: '',
        createdBy: 'user_1',
      }),
    ).toThrow();
  });
});

describe('ProvisionOrganizationRequestSchema', () => {
  it('applies default defaultProjectDisplayName', () => {
    const parsed = ProvisionOrganizationRequestSchema.parse({
      organizationId: 'org_1',
      createdBy: 'user_1',
    });
    expect(parsed.defaultProjectDisplayName).toBe('Production');
  });
});
