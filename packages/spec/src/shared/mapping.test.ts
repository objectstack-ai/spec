import { describe, it, expect } from 'vitest';
import { TransformTypeSchema, FieldMappingSchema } from './mapping.zod';

describe('TransformTypeSchema', () => {
  it('should accept constant transform', () => {
    const result = TransformTypeSchema.parse({ type: 'constant', value: 'hello' });
    expect(result).toEqual({ type: 'constant', value: 'hello' });
  });

  it('should accept constant transform with any value type', () => {
    expect(() => TransformTypeSchema.parse({ type: 'constant', value: 42 })).not.toThrow();
    expect(() => TransformTypeSchema.parse({ type: 'constant', value: null })).not.toThrow();
    expect(() => TransformTypeSchema.parse({ type: 'constant', value: true })).not.toThrow();
  });

  it('should accept cast transform with valid target types', () => {
    const validTypes = ['string', 'number', 'boolean', 'date'];
    validTypes.forEach((t) => {
      const result = TransformTypeSchema.parse({ type: 'cast', targetType: t });
      expect(result).toEqual({ type: 'cast', targetType: t });
    });
  });

  it('should reject cast transform with invalid target type', () => {
    expect(() => TransformTypeSchema.parse({ type: 'cast', targetType: 'array' })).toThrow();
  });

  it('should accept lookup transform', () => {
    const result = TransformTypeSchema.parse({
      type: 'lookup',
      table: 'users',
      keyField: 'id',
      valueField: 'name',
    });
    expect(result).toEqual({
      type: 'lookup',
      table: 'users',
      keyField: 'id',
      valueField: 'name',
    });
  });

  it('should reject lookup transform missing required fields', () => {
    expect(() => TransformTypeSchema.parse({ type: 'lookup', table: 'users' })).toThrow();
  });

  it('should accept javascript transform', () => {
    const result = TransformTypeSchema.parse({
      type: 'javascript',
      expression: 'value.toUpperCase()',
    });
    expect(result).toEqual({ type: 'javascript', expression: 'value.toUpperCase()' });
  });

  it('should accept map transform', () => {
    const result = TransformTypeSchema.parse({
      type: 'map',
      mappings: { Active: 'active', Inactive: 'inactive' },
    });
    expect(result).toEqual({
      type: 'map',
      mappings: { Active: 'active', Inactive: 'inactive' },
    });
  });

  it('should reject unknown transform type', () => {
    expect(() => TransformTypeSchema.parse({ type: 'unknown' })).toThrow();
  });
});

describe('FieldMappingSchema', () => {
  it('should accept minimal valid mapping', () => {
    const result = FieldMappingSchema.parse({
      source: 'external_user_id',
      target: 'user_id',
    });
    expect(result).toEqual({
      source: 'external_user_id',
      target: 'user_id',
    });
  });

  it('should accept mapping with transform', () => {
    const result = FieldMappingSchema.parse({
      source: 'user_name',
      target: 'name',
      transform: { type: 'cast', targetType: 'string' },
    });
    expect(result.transform).toEqual({ type: 'cast', targetType: 'string' });
  });

  it('should accept mapping with defaultValue', () => {
    const result = FieldMappingSchema.parse({
      source: 'user_name',
      target: 'name',
      defaultValue: 'Unknown',
    });
    expect(result.defaultValue).toBe('Unknown');
  });

  it('should accept mapping with all fields', () => {
    const result = FieldMappingSchema.parse({
      source: 'FirstName',
      target: 'first_name',
      transform: { type: 'cast', targetType: 'string' },
      defaultValue: '',
    });
    expect(result.source).toBe('FirstName');
    expect(result.target).toBe('first_name');
    expect(result.transform).toBeDefined();
    expect(result.defaultValue).toBe('');
  });

  it('should reject missing source', () => {
    expect(() => FieldMappingSchema.parse({ target: 'name' })).toThrow();
  });

  it('should reject missing target', () => {
    expect(() => FieldMappingSchema.parse({ source: 'name' })).toThrow();
  });

  it('should have optional transform and defaultValue', () => {
    const result = FieldMappingSchema.parse({
      source: 'a',
      target: 'b',
    });
    expect(result.transform).toBeUndefined();
    expect(result.defaultValue).toBeUndefined();
  });
});
