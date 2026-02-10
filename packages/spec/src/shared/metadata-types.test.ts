import { describe, it, expect } from 'vitest';
import { MetadataFormatSchema, BaseMetadataRecordSchema } from './metadata-types.zod';

describe('MetadataFormatSchema', () => {
  it('should accept all valid formats', () => {
    const valid = ['yaml', 'json', 'typescript', 'javascript'];
    valid.forEach((v) => {
      expect(MetadataFormatSchema.parse(v)).toBe(v);
    });
  });

  it('should reject invalid formats', () => {
    expect(() => MetadataFormatSchema.parse('xml')).toThrow();
    expect(() => MetadataFormatSchema.parse('YAML')).toThrow();
    expect(() => MetadataFormatSchema.parse('')).toThrow();
    expect(() => MetadataFormatSchema.parse('toml')).toThrow();
  });
});

describe('BaseMetadataRecordSchema', () => {
  it('should accept valid metadata record', () => {
    const result = BaseMetadataRecordSchema.parse({
      id: 'abc-123',
      type: 'object',
      name: 'user_profile',
    });
    expect(result).toEqual({
      id: 'abc-123',
      type: 'object',
      name: 'user_profile',
    });
  });

  it('should accept record with optional format', () => {
    const result = BaseMetadataRecordSchema.parse({
      id: 'abc-123',
      type: 'view',
      name: 'account_list',
      format: 'yaml',
    });
    expect(result.format).toBe('yaml');
  });

  it('should have format as optional', () => {
    const result = BaseMetadataRecordSchema.parse({
      id: 'xyz',
      type: 'flow',
      name: 'my_flow',
    });
    expect(result.format).toBeUndefined();
  });

  it('should reject missing required fields', () => {
    expect(() => BaseMetadataRecordSchema.parse({ id: 'x', type: 'object' })).toThrow();
    expect(() => BaseMetadataRecordSchema.parse({ id: 'x', name: 'test_name' })).toThrow();
    expect(() => BaseMetadataRecordSchema.parse({ type: 'object', name: 'test_name' })).toThrow();
  });

  it('should reject name that is not snake_case', () => {
    expect(() =>
      BaseMetadataRecordSchema.parse({
        id: 'abc',
        type: 'object',
        name: 'UserProfile',
      }),
    ).toThrow();
  });

  it('should reject name with kebab-case', () => {
    expect(() =>
      BaseMetadataRecordSchema.parse({
        id: 'abc',
        type: 'object',
        name: 'user-profile',
      }),
    ).toThrow();
  });

  it('should reject invalid format value', () => {
    expect(() =>
      BaseMetadataRecordSchema.parse({
        id: 'abc',
        type: 'object',
        name: 'my_object',
        format: 'xml',
      }),
    ).toThrow();
  });
});
