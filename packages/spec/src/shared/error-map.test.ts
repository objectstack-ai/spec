import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  objectStackErrorMap,
  formatZodError,
  formatZodIssue,
  safeParsePretty,
} from './error-map.zod';
import { FieldType } from '../data/field.zod';

describe('objectStackErrorMap', () => {
  describe('FieldType enum errors', () => {
    it('should suggest corrections for field type typos', () => {
      const result = FieldType.safeParse('dropdown', { error: objectStackErrorMap });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid field type');
        expect(result.error.issues[0].message).toContain("'select'");
      }
    });

    it('should suggest corrections for common alternative names', () => {
      const result = FieldType.safeParse('string', { error: objectStackErrorMap });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("'text'");
      }
    });

    it('should handle completely unknown field types', () => {
      const result = FieldType.safeParse('xyzzy', { error: objectStackErrorMap });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid field type');
      }
    });
  });

  describe('generic enum errors', () => {
    const SmallEnum = z.enum(['active', 'inactive', 'pending']);

    it('should suggest corrections for small enum typos', () => {
      const result = SmallEnum.safeParse('actve', { error: objectStackErrorMap });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("'active'");
      }
    });

    it('should list options when no close match', () => {
      const result = SmallEnum.safeParse('xyz', { error: objectStackErrorMap });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Expected one of');
      }
    });
  });

  describe('string validation errors', () => {
    it('should format too-short errors', () => {
      const schema = z.string().min(3);
      const result = schema.safeParse('ab', { error: objectStackErrorMap });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 3 characters');
      }
    });

    it('should format too-long errors', () => {
      const schema = z.string().max(5);
      const result = schema.safeParse('toolong', { error: objectStackErrorMap });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at most 5 characters');
      }
    });
  });

  describe('missing required fields', () => {
    it('should report missing required property', () => {
      const schema = z.object({ name: z.string(), age: z.number() });
      const result = schema.safeParse({}, { error: objectStackErrorMap });
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages.some((m) => m.includes("Required property"))).toBe(true);
      }
    });
  });

  describe('type mismatch', () => {
    it('should report type mismatch', () => {
      const schema = z.number();
      const result = schema.safeParse('not a number', { error: objectStackErrorMap });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Expected number');
        expect(result.error.issues[0].message).toContain('received string');
      }
    });
  });

  describe('unrecognized keys', () => {
    it('should report unrecognized keys', () => {
      const schema = z.object({ name: z.string() }).strict();
      const result = schema.safeParse({ name: 'ok', extra: true }, { error: objectStackErrorMap });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Unrecognized key');
        expect(result.error.issues[0].message).toContain('extra');
      }
    });
  });
});

describe('formatZodIssue', () => {
  it('should format issue with path', () => {
    const issue = {
      code: 'custom' as const,
      path: ['objects', 0, 'name'] as (string | number)[],
      message: 'Something went wrong',
    };
    const result = formatZodIssue(issue);
    expect(result).toBe('  ✗ objects.0.name: Something went wrong');
  });

  it('should format issue without path as (root)', () => {
    const issue = {
      code: 'custom' as const,
      path: [] as (string | number)[],
      message: 'Root error',
    };
    const result = formatZodIssue(issue);
    expect(result).toBe('  ✗ (root): Root error');
  });
});

describe('formatZodError', () => {
  it('should format error with label', () => {
    const schema = z.object({ name: z.string(), type: z.string() });
    const result = schema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatZodError(result.error, 'Validation failed');
      expect(formatted).toContain('Validation failed');
      expect(formatted).toContain('issue');
      expect(formatted).toContain('✗');
    }
  });

  it('should format error without label', () => {
    const schema = z.object({ name: z.string() });
    const result = schema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(formatted).toContain('Validation failed');
    }
  });

  it('should handle single issue (singular)', () => {
    const schema = z.object({ name: z.string() });
    const result = schema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(formatted).toContain('1 issue');
    }
  });
});

describe('safeParsePretty', () => {
  it('should return success with data for valid input', () => {
    const schema = z.object({ name: z.string() });
    const result = safeParsePretty(schema, { name: 'valid' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('valid');
    }
  });

  it('should return formatted error for invalid input', () => {
    const schema = z.object({ name: z.string() });
    const result = safeParsePretty(schema, {}, 'Config error');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.formatted).toContain('Config error');
      expect(result.formatted).toContain('✗');
    }
  });

  it('should use objectStackErrorMap for enhanced messages', () => {
    const schema = z.object({ type: FieldType });
    const result = safeParsePretty(schema, { type: 'dropdown' }, 'Field validation');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.formatted).toContain("'select'");
    }
  });
});
