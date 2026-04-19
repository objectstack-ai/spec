// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect } from 'vitest';
import {
  SysEnvironment,
  SysEnvironmentDatabase,
  SysDatabaseCredential,
  SysEnvironmentMember,
} from './index';

describe('control-plane environment objects', () => {
  it('registers all four sys_ objects with correct namespaced names', () => {
    expect(`${SysEnvironment.namespace}_${SysEnvironment.name}`).toBe('sys_environment');
    expect(`${SysEnvironmentDatabase.namespace}_${SysEnvironmentDatabase.name}`).toBe(
      'sys_environment_database',
    );
    expect(`${SysDatabaseCredential.namespace}_${SysDatabaseCredential.name}`).toBe(
      'sys_database_credential',
    );
    expect(`${SysEnvironmentMember.namespace}_${SysEnvironmentMember.name}`).toBe(
      'sys_environment_member',
    );
  });

  it('declares UNIQUE (organization_id, slug) on sys_environment', () => {
    const idx = SysEnvironment.indexes ?? [];
    expect(
      idx.some((i: any) => i.unique && i.fields.join(',') === 'organization_id,slug'),
    ).toBe(true);
  });

  it('declares UNIQUE environment_id on sys_environment_database (1:1)', () => {
    const idx = SysEnvironmentDatabase.indexes ?? [];
    expect(idx.some((i: any) => i.unique && i.fields.join(',') === 'environment_id')).toBe(true);
    expect(idx.some((i: any) => i.unique && i.fields.join(',') === 'database_name')).toBe(true);
  });

  it('declares UNIQUE (environment_id, user_id) on sys_environment_member', () => {
    const idx = SysEnvironmentMember.indexes ?? [];
    expect(
      idx.some((i: any) => i.unique && i.fields.join(',') === 'environment_id,user_id'),
    ).toBe(true);
  });

  it('gives every field on sys_environment a .description', () => {
    for (const [name, field] of Object.entries(SysEnvironment.fields)) {
      expect((field as any).description, `field ${name} missing description`).toBeTruthy();
    }
  });

  it('marks sys_environment and sys_environment_database as system objects', () => {
    expect(SysEnvironment.isSystem).toBe(true);
    expect(SysEnvironmentDatabase.isSystem).toBe(true);
    expect(SysDatabaseCredential.isSystem).toBe(true);
    expect(SysEnvironmentMember.isSystem).toBe(true);
  });
});
