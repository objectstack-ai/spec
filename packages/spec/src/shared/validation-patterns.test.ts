import { describe, it, expect } from 'vitest';
import {
  SNAKE_CASE_PATTERN,
  DOT_NOTATION_PATTERN,
  SEMVER_PATTERN,
  URL_SLUG_PATTERN,
  EMAIL_PATTERN,
  UUID_V4_PATTERN,
  HEX_COLOR_PATTERN,
  HTTP_URL_PATTERN,
  SnakeCaseString,
  DotNotationString,
  SemverString,
  UrlSlugString,
  EmailString,
  UuidString,
  HexColorString,
  HttpUrlString,
  LENGTH_CONSTRAINTS,
} from './validation-patterns.zod.js';

describe('SNAKE_CASE_PATTERN', () => {
  it('should match valid snake_case', () => {
    expect(SNAKE_CASE_PATTERN.test('user_profile')).toBe(true);
    expect(SNAKE_CASE_PATTERN.test('crm_account')).toBe(true);
    expect(SNAKE_CASE_PATTERN.test('order_item_detail')).toBe(true);
  });

  it('should reject invalid formats', () => {
    expect(SNAKE_CASE_PATTERN.test('UserProfile')).toBe(false);
    expect(SNAKE_CASE_PATTERN.test('user-profile')).toBe(false);
    expect(SNAKE_CASE_PATTERN.test('user.profile')).toBe(false);
    expect(SNAKE_CASE_PATTERN.test('User_Profile')).toBe(false);
  });
});

describe('DOT_NOTATION_PATTERN', () => {
  it('should match valid dot notation', () => {
    expect(DOT_NOTATION_PATTERN.test('user.created')).toBe(true);
    expect(DOT_NOTATION_PATTERN.test('order.payment.completed')).toBe(true);
    expect(DOT_NOTATION_PATTERN.test('user_profile')).toBe(true);
  });

  it('should reject uppercase', () => {
    expect(DOT_NOTATION_PATTERN.test('User.Created')).toBe(false);
  });
});

describe('SEMVER_PATTERN', () => {
  it('should match valid semantic versions', () => {
    expect(SEMVER_PATTERN.test('1.0.0')).toBe(true);
    expect(SEMVER_PATTERN.test('2.1.3')).toBe(true);
    expect(SEMVER_PATTERN.test('10.20.30')).toBe(true);
  });

  it('should match pre-release versions', () => {
    expect(SEMVER_PATTERN.test('1.0.0-alpha')).toBe(true);
    expect(SEMVER_PATTERN.test('2.0.0-beta.1')).toBe(true);
    expect(SEMVER_PATTERN.test('3.0.0-rc.2')).toBe(true);
  });

  it('should reject invalid versions', () => {
    expect(SEMVER_PATTERN.test('1.0')).toBe(false);
    expect(SEMVER_PATTERN.test('v1.0.0')).toBe(false);
    expect(SEMVER_PATTERN.test('1.0.0.0')).toBe(false);
  });
});

describe('URL_SLUG_PATTERN', () => {
  it('should match valid URL slugs', () => {
    expect(URL_SLUG_PATTERN.test('my-awesome-post')).toBe(true);
    expect(URL_SLUG_PATTERN.test('user-123')).toBe(true);
    expect(URL_SLUG_PATTERN.test('article-2024-01-15')).toBe(true);
  });

  it('should reject invalid slugs', () => {
    expect(URL_SLUG_PATTERN.test('My-Post')).toBe(false);
    expect(URL_SLUG_PATTERN.test('my_post')).toBe(false);
    expect(URL_SLUG_PATTERN.test('my post')).toBe(false);
    expect(URL_SLUG_PATTERN.test('-my-post')).toBe(false);
    expect(URL_SLUG_PATTERN.test('my-post-')).toBe(false);
  });
});

describe('EMAIL_PATTERN', () => {
  it('should match valid emails', () => {
    expect(EMAIL_PATTERN.test('user@example.com')).toBe(true);
    expect(EMAIL_PATTERN.test('test.user@company.co.uk')).toBe(true);
    expect(EMAIL_PATTERN.test('admin+tag@domain.org')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(EMAIL_PATTERN.test('invalid')).toBe(false);
    expect(EMAIL_PATTERN.test('@example.com')).toBe(false);
    expect(EMAIL_PATTERN.test('user@')).toBe(false);
    expect(EMAIL_PATTERN.test('user @example.com')).toBe(false);
  });
});

describe('UUID_V4_PATTERN', () => {
  it('should match valid UUIDs', () => {
    expect(UUID_V4_PATTERN.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(UUID_V4_PATTERN.test('6ba7b810-9dad-41d1-80b4-00c04fd430c8')).toBe(true);
  });

  it('should reject invalid UUIDs', () => {
    expect(UUID_V4_PATTERN.test('not-a-uuid')).toBe(false);
    expect(UUID_V4_PATTERN.test('550e8400-e29b-11d4-a716-446655440000')).toBe(false); // Not v4
  });
});

describe('HEX_COLOR_PATTERN', () => {
  it('should match valid hex colors', () => {
    expect(HEX_COLOR_PATTERN.test('#FF5733')).toBe(true);
    expect(HEX_COLOR_PATTERN.test('#333')).toBe(true);
    expect(HEX_COLOR_PATTERN.test('#ABCDEF')).toBe(true);
  });

  it('should reject invalid hex colors', () => {
    expect(HEX_COLOR_PATTERN.test('FF5733')).toBe(false);
    expect(HEX_COLOR_PATTERN.test('#GG5733')).toBe(false);
    expect(HEX_COLOR_PATTERN.test('#FF57333')).toBe(false);
  });
});

describe('HTTP_URL_PATTERN', () => {
  it('should match valid HTTP/HTTPS URLs', () => {
    expect(HTTP_URL_PATTERN.test('http://example.com')).toBe(true);
    expect(HTTP_URL_PATTERN.test('https://www.example.com/path')).toBe(true);
    expect(HTTP_URL_PATTERN.test('HTTPS://API.EXAMPLE.COM')).toBe(true);
  });

  it('should reject non-HTTP URLs', () => {
    expect(HTTP_URL_PATTERN.test('ftp://example.com')).toBe(false);
    expect(HTTP_URL_PATTERN.test('example.com')).toBe(false);
    expect(HTTP_URL_PATTERN.test('//example.com')).toBe(false);
  });
});

describe('Zod Schema Wrappers', () => {
  describe('SnakeCaseString', () => {
    it('should validate snake_case strings', () => {
      expect(() => SnakeCaseString.parse('user_profile')).not.toThrow();
    });

    it('should reject non-snake_case strings', () => {
      expect(() => SnakeCaseString.parse('UserProfile')).toThrow();
    });
  });

  describe('DotNotationString', () => {
    it('should validate dot notation strings', () => {
      expect(() => DotNotationString.parse('user.created')).not.toThrow();
    });

    it('should reject uppercase', () => {
      expect(() => DotNotationString.parse('User.Created')).toThrow();
    });
  });

  describe('SemverString', () => {
    it('should validate semantic versions', () => {
      expect(() => SemverString.parse('1.2.3')).not.toThrow();
      expect(() => SemverString.parse('2.0.0-beta.1')).not.toThrow();
    });

    it('should reject invalid versions', () => {
      expect(() => SemverString.parse('v1.2.3')).toThrow();
    });
  });

  describe('UrlSlugString', () => {
    it('should validate URL slugs', () => {
      expect(() => UrlSlugString.parse('my-awesome-post')).not.toThrow();
    });

    it('should reject invalid slugs', () => {
      expect(() => UrlSlugString.parse('My-Post')).toThrow();
    });
  });

  describe('EmailString', () => {
    it('should validate emails', () => {
      expect(() => EmailString.parse('user@example.com')).not.toThrow();
    });

    it('should reject invalid emails', () => {
      expect(() => EmailString.parse('invalid')).toThrow();
    });
  });

  describe('UuidString', () => {
    it('should validate UUIDs', () => {
      expect(() => UuidString.parse('550e8400-e29b-41d4-a716-446655440000')).not.toThrow();
    });

    it('should reject invalid UUIDs', () => {
      expect(() => UuidString.parse('not-a-uuid')).toThrow();
    });
  });

  describe('HexColorString', () => {
    it('should validate hex colors', () => {
      expect(() => HexColorString.parse('#FF5733')).not.toThrow();
      expect(() => HexColorString.parse('#333')).not.toThrow();
    });

    it('should reject invalid colors', () => {
      expect(() => HexColorString.parse('FF5733')).toThrow();
    });
  });

  describe('HttpUrlString', () => {
    it('should validate HTTP URLs', () => {
      expect(() => HttpUrlString.parse('https://example.com')).not.toThrow();
    });

    it('should reject non-HTTP URLs', () => {
      expect(() => HttpUrlString.parse('ftp://example.com')).toThrow();
    });
  });
});

describe('LENGTH_CONSTRAINTS', () => {
  it('should export standard length constraints', () => {
    expect(LENGTH_CONSTRAINTS.SHORT_TEXT).toEqual({ min: 1, max: 255 });
    expect(LENGTH_CONSTRAINTS.MEDIUM_TEXT).toEqual({ min: 1, max: 1000 });
    expect(LENGTH_CONSTRAINTS.LONG_TEXT).toEqual({ min: 1, max: 65535 });
    expect(LENGTH_CONSTRAINTS.IDENTIFIER).toEqual({ min: 2, max: 64 });
    expect(LENGTH_CONSTRAINTS.NAMESPACE).toEqual({ min: 2, max: 20 });
    expect(LENGTH_CONSTRAINTS.EMAIL).toEqual({ min: 5, max: 255 });
    expect(LENGTH_CONSTRAINTS.PASSWORD).toEqual({ min: 8, max: 128 });
    expect(LENGTH_CONSTRAINTS.URL).toEqual({ min: 10, max: 2048 });
  });
});
