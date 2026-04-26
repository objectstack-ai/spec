// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect } from 'vitest';
import {
  PROJECT_ARTIFACT_SCHEMA_VERSION,
  ProjectArtifactSchema,
  ProjectArtifactChecksumSchema,
  ProjectArtifactFunctionSchema,
  ProjectArtifactManifestSchema,
} from './project-artifact.zod';

describe('ProjectArtifactSchema', () => {
  const minimal = {
    schemaVersion: PROJECT_ARTIFACT_SCHEMA_VERSION,
    projectId: 'proj_01HABCDE',
    commitId: 'commit_01HABCDE',
    checksum: { algorithm: 'sha256' as const, value: 'a1b2c3d4' },
    metadata: {},
    functions: [],
    manifest: {},
  };

  it('accepts a minimal valid artifact', () => {
    const parsed = ProjectArtifactSchema.parse(minimal);
    expect(parsed.schemaVersion).toBe('0.1');
    expect(parsed.functions).toEqual([]);
  });

  it('defaults functions to an empty array when omitted', () => {
    const { functions: _omit, ...rest } = minimal;
    const parsed = ProjectArtifactSchema.parse(rest);
    expect(parsed.functions).toEqual([]);
  });

  it('rejects unknown schemaVersion values', () => {
    const result = ProjectArtifactSchema.safeParse({ ...minimal, schemaVersion: '9.9' });
    expect(result.success).toBe(false);
  });

  it('requires projectId and commitId', () => {
    expect(ProjectArtifactSchema.safeParse({ ...minimal, projectId: '' }).success).toBe(false);
    expect(ProjectArtifactSchema.safeParse({ ...minimal, commitId: '' }).success).toBe(false);
  });

  it('passes through unknown metadata categories without dropping them', () => {
    const parsed = ProjectArtifactSchema.parse({
      ...minimal,
      metadata: { objects: [{ name: 'account' }], futureCategory: [{ id: 'x' }] },
    });
    expect((parsed.metadata as Record<string, unknown>).futureCategory).toBeDefined();
  });

  it('accepts optional builtAt / builtWith provenance', () => {
    const parsed = ProjectArtifactSchema.parse({
      ...minimal,
      builtAt: '2026-04-26T00:00:00Z',
      builtWith: 'objectstack-cli@3.4.0',
    });
    expect(parsed.builtAt).toBe('2026-04-26T00:00:00Z');
  });

  it('accepts optional payloadRef for future S3 indirection', () => {
    const parsed = ProjectArtifactSchema.parse({
      ...minimal,
      payloadRef: {
        url: 'https://artifacts.objectstack.io/proj_x/commit_y.json',
        checksum: { algorithm: 'sha256' as const, value: 'deadbeef' },
      },
    });
    expect(parsed.payloadRef?.url).toContain('artifacts.objectstack.io');
  });
});

describe('ProjectArtifactChecksumSchema', () => {
  it('accepts lowercase hex values', () => {
    expect(ProjectArtifactChecksumSchema.parse({ value: 'abc123' }).algorithm).toBe('sha256');
  });

  it('rejects uppercase / non-hex values', () => {
    expect(ProjectArtifactChecksumSchema.safeParse({ value: 'ABC123' }).success).toBe(false);
    expect(ProjectArtifactChecksumSchema.safeParse({ value: 'not-hex' }).success).toBe(false);
  });
});

describe('ProjectArtifactFunctionSchema', () => {
  it('accepts a typical inlined function', () => {
    const parsed = ProjectArtifactFunctionSchema.parse({
      name: 'on_account_create',
      code: 'export default async (ctx) => {}',
    });
    expect(parsed.language).toBe('javascript');
  });

  it('rejects function names that are not snake_case', () => {
    expect(
      ProjectArtifactFunctionSchema.safeParse({ name: 'OnAccountCreate', code: '' }).success,
    ).toBe(false);
  });
});

describe('ProjectArtifactManifestSchema', () => {
  it('accepts an empty manifest', () => {
    expect(ProjectArtifactManifestSchema.parse({})).toEqual({});
  });

  it('accepts plugins, drivers and engine constraints', () => {
    const parsed = ProjectArtifactManifestSchema.parse({
      plugins: [{ id: '@objectstack/plugin-auth', version: '^3.0.0' }],
      drivers: [{ id: '@objectstack/driver-turso' }],
      engine: { objectstack: '>=3.0.0' },
    });
    expect(parsed.plugins?.[0].id).toBe('@objectstack/plugin-auth');
    expect(parsed.engine?.objectstack).toBe('>=3.0.0');
  });

  it('rejects malformed engine version ranges', () => {
    expect(
      ProjectArtifactManifestSchema.safeParse({ engine: { objectstack: 'not-a-range' } }).success,
    ).toBe(false);
  });
});
