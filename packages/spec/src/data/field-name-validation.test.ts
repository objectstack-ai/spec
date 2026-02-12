import { describe, it, expect } from 'vitest';
import { FieldSchema } from './field.zod';

describe('FieldSchema name validation', () => {
  it('should reject camelCase name when provided', () => {
    const fieldWithCamelCase = {
      name: 'camelCaseName',
      type: 'text',
      label: 'Test Field'
    };

    expect(() => FieldSchema.parse(fieldWithCamelCase)).toThrow();
  });

  it('should reject PascalCase name when provided', () => {
    const fieldWithPascalCase = {
      name: 'PascalCaseName',
      type: 'text',
      label: 'Test Field'
    };

    expect(() => FieldSchema.parse(fieldWithPascalCase)).toThrow();
  });

  it('should accept snake_case name when provided', () => {
    const fieldWithSnakeCase = {
      name: 'snake_case_name',
      type: 'text',
      label: 'Test Field'
    };

    expect(() => FieldSchema.parse(fieldWithSnakeCase)).not.toThrow();
  });

  it('should accept field without name (optional)', () => {
    const fieldWithoutName = {
      type: 'text',
      label: 'Test Field'
    };

    expect(() => FieldSchema.parse(fieldWithoutName)).not.toThrow();
  });
});
