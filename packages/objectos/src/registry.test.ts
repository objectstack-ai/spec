// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, expect, it } from 'vitest';
import {
  getSystemObject,
  getSystemObjectNames,
  getSystemObjects,
  SystemObjects,
  SysMetadata,
} from './registry';

describe('ObjectOS system object registry', () => {
  it('registers metadata-layer platform objects by canonical name', () => {
    expect(getSystemObjectNames()).toEqual([
      'sys_object',
      'sys_view',
      'sys_flow',
      'sys_agent',
      'sys_tool',
    ]);
    expect(getSystemObject('sys_object')?.name).toBe('sys_object');
    expect(getSystemObjects()).toHaveLength(5);
  });

  it('keeps sys_metadata separate from the queryable registry', () => {
    expect(SysMetadata.name).toBe('sys_metadata');
    expect(SystemObjects).not.toHaveProperty('sys_metadata');
  });
});
