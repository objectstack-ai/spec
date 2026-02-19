// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createObjectQLAdapter,
  AUTH_MODEL_TO_PROTOCOL,
  resolveProtocolName,
} from './objectql-adapter';
import { SystemObjectName } from '@objectstack/spec/system';
import type { IDataEngine } from '@objectstack/core';

describe('AUTH_MODEL_TO_PROTOCOL mapping', () => {
  it('should map all four core better-auth models to sys_ protocol names', () => {
    expect(AUTH_MODEL_TO_PROTOCOL.user).toBe('sys_user');
    expect(AUTH_MODEL_TO_PROTOCOL.session).toBe('sys_session');
    expect(AUTH_MODEL_TO_PROTOCOL.account).toBe('sys_account');
    expect(AUTH_MODEL_TO_PROTOCOL.verification).toBe('sys_verification');
  });

  it('should align with SystemObjectName constants', () => {
    expect(AUTH_MODEL_TO_PROTOCOL.user).toBe(SystemObjectName.USER);
    expect(AUTH_MODEL_TO_PROTOCOL.session).toBe(SystemObjectName.SESSION);
    expect(AUTH_MODEL_TO_PROTOCOL.account).toBe(SystemObjectName.ACCOUNT);
    expect(AUTH_MODEL_TO_PROTOCOL.verification).toBe(SystemObjectName.VERIFICATION);
  });
});

describe('resolveProtocolName', () => {
  it('should resolve core models to sys_ prefixed names', () => {
    expect(resolveProtocolName('user')).toBe('sys_user');
    expect(resolveProtocolName('session')).toBe('sys_session');
    expect(resolveProtocolName('account')).toBe('sys_account');
    expect(resolveProtocolName('verification')).toBe('sys_verification');
  });

  it('should fall back to original name for unknown models', () => {
    expect(resolveProtocolName('organization')).toBe('organization');
    expect(resolveProtocolName('custom_model')).toBe('custom_model');
  });
});

describe('createObjectQLAdapter – model name mapping', () => {
  let mockEngine: IDataEngine;

  beforeEach(() => {
    mockEngine = {
      insert: vi.fn().mockResolvedValue({ id: '1' }),
      findOne: vi.fn().mockResolvedValue({ id: '1' }),
      find: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      update: vi.fn().mockResolvedValue({ id: '1' }),
      delete: vi.fn().mockResolvedValue(undefined),
    } as unknown as IDataEngine;
  });

  it('create: should call dataEngine.insert with sys_ protocol name', async () => {
    const adapter = createObjectQLAdapter(mockEngine);
    await adapter.create({ model: 'user', data: { email: 'a@b.com' } });
    expect(mockEngine.insert).toHaveBeenCalledWith('sys_user', { email: 'a@b.com' });
  });

  it('findOne: should call dataEngine.findOne with sys_ protocol name', async () => {
    const adapter = createObjectQLAdapter(mockEngine);
    await adapter.findOne({
      model: 'session',
      where: [{ field: 'token', value: 'abc', operator: 'eq', connector: 'AND' }],
    });
    expect(mockEngine.findOne).toHaveBeenCalledWith('sys_session', expect.objectContaining({
      filter: { token: 'abc' },
    }));
  });

  it('findMany: should call dataEngine.find with sys_ protocol name', async () => {
    const adapter = createObjectQLAdapter(mockEngine);
    await adapter.findMany({ model: 'account', limit: 10 });
    expect(mockEngine.find).toHaveBeenCalledWith('sys_account', expect.objectContaining({
      limit: 10,
    }));
  });

  it('count: should call dataEngine.count with sys_ protocol name', async () => {
    const adapter = createObjectQLAdapter(mockEngine);
    await adapter.count({ model: 'verification' });
    expect(mockEngine.count).toHaveBeenCalledWith('sys_verification', expect.anything());
  });

  it('update: should call dataEngine with sys_ protocol name', async () => {
    const adapter = createObjectQLAdapter(mockEngine);
    await adapter.update({
      model: 'user',
      where: [{ field: 'id', value: '1', operator: 'eq', connector: 'AND' }],
      update: { name: 'New' },
    });
    expect(mockEngine.findOne).toHaveBeenCalledWith('sys_user', expect.anything());
    expect(mockEngine.update).toHaveBeenCalledWith('sys_user', expect.objectContaining({ name: 'New', id: '1' }));
  });

  it('delete: should call dataEngine with sys_ protocol name', async () => {
    const adapter = createObjectQLAdapter(mockEngine);
    await adapter.delete({
      model: 'session',
      where: [{ field: 'id', value: '1', operator: 'eq', connector: 'AND' }],
    });
    expect(mockEngine.findOne).toHaveBeenCalledWith('sys_session', expect.anything());
    expect(mockEngine.delete).toHaveBeenCalledWith('sys_session', expect.anything());
  });

  it('should pass through unknown model names unchanged', async () => {
    const adapter = createObjectQLAdapter(mockEngine);
    await adapter.create({ model: 'organization', data: { name: 'Acme' } });
    expect(mockEngine.insert).toHaveBeenCalledWith('organization', { name: 'Acme' });
  });
});
