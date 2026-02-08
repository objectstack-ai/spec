import { z } from 'zod';

/**
 * Reusable Regex Validation Patterns
 * 
 * Centralized collection of regex patterns used across ObjectStack schemas.
 * Ensures consistency and maintainability of validation rules.
 * 
 * **Design Principle:** Define once, reference everywhere.
 */

/**
 * Identifier Patterns
 */

/** Matches lowercase snake_case identifiers (e.g., "user_profile", "crm_account") */
export const SNAKE_CASE_PATTERN = /^[a-z][a-z0-9_]*$/;

/** Matches lowercase identifiers with dots for namespacing (e.g., "user.created", "order.paid") */
export const DOT_NOTATION_PATTERN = /^[a-z][a-z0-9_.]*$/;

/** Matches camelCase identifiers (e.g., "userId", "firstName") */
export const CAMEL_CASE_PATTERN = /^[a-z][a-zA-Z0-9]*$/;

/** Matches PascalCase identifiers (e.g., "UserProfile", "OrderItem") */
export const PASCAL_CASE_PATTERN = /^[A-Z][a-zA-Z0-9]*$/;

/** Matches kebab-case identifiers (e.g., "user-profile", "order-item") */
export const KEBAB_CASE_PATTERN = /^[a-z][a-z0-9-]*$/;

/** Matches namespace identifiers (1-20 chars, lowercase, starts with letter) */
export const NAMESPACE_PATTERN = /^[a-z][a-z0-9_]{1,19}$/;

/**
 * Version Patterns
 */

/** Matches semantic version (e.g., "1.2.3", "2.0.0-beta.1") */
export const SEMVER_PATTERN = /^\d+\.\d+\.\d+(-[a-z0-9.]+)?$/;

/** Matches relaxed version (allows more formats like "1.0", "v2.1.3") */
export const VERSION_PATTERN = /^v?\d+(\.\d+){0,2}(-[a-z0-9.]+)?$/i;

/**
 * URL Patterns
 */

/** Matches URL slug (e.g., "my-awesome-post", "user-123") */
export const URL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Matches URL path segment (allows underscores) */
export const URL_PATH_PATTERN = /^[a-z0-9_-]+$/;

/**
 * Data Format Patterns
 */

/** Matches email address (basic validation) */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Matches phone number (international format) */
export const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/;

/** Matches ISO 8601 date (YYYY-MM-DD) */
export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Matches ISO 8601 datetime with timezone */
export const ISO_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

/** Matches UUID v4 */
export const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Matches nanoid (21 char alphanumeric) */
export const NANOID_PATTERN = /^[A-Za-z0-9_-]{21}$/;

/**
 * Code Patterns
 */

/** Matches JavaScript/TypeScript variable name */
export const JS_IDENTIFIER_PATTERN = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

/** Matches SQL identifier (table/column name) */
export const SQL_IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/** Matches CSS class name */
export const CSS_CLASS_PATTERN = /^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/;

/** Matches HTML id attribute */
export const HTML_ID_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

/**
 * Network Patterns
 */

/** Matches IPv4 address */
export const IPV4_PATTERN = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;

/** Matches IPv6 address (simplified) */
export const IPV6_PATTERN = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::)$/;

/** Matches domain name */
export const DOMAIN_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;

/** Matches HTTP/HTTPS URL */
export const HTTP_URL_PATTERN = /^https?:\/\/.+$/i;

/**
 * Security Patterns
 */

/** Matches strong password (min 8 chars, uppercase, lowercase, number, special char) */
export const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/** Matches hex color code (e.g., "#FF5733", "#333") */
export const HEX_COLOR_PATTERN = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/** Matches JWT token (3 base64 segments separated by dots) */
export const JWT_PATTERN = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

/**
 * Business Patterns
 */

/** Matches US ZIP code (5 or 9 digits) */
export const US_ZIP_PATTERN = /^\d{5}(-\d{4})?$/;

/** Matches credit card number (spaces/dashes optional) */
export const CREDIT_CARD_PATTERN = /^[\d\s-]{13,19}$/;

/** Matches currency amount (e.g., "1234.56", "-99.99") */
export const CURRENCY_PATTERN = /^-?\d+(\.\d{1,2})?$/;

/**
 * Zod Schema Wrappers
 * 
 * Pre-configured Zod schemas using the patterns above.
 * Use these for consistent validation across the codebase.
 */

export const SnakeCaseString = z
  .string()
  .regex(SNAKE_CASE_PATTERN, {
    message: 'Must be lowercase snake_case (e.g., "user_profile")',
  })
  .describe('Snake case identifier');

export const DotNotationString = z
  .string()
  .regex(DOT_NOTATION_PATTERN, {
    message: 'Must be lowercase with dots for namespacing (e.g., "user.created")',
  })
  .describe('Dot notation identifier');

export const SemverString = z
  .string()
  .regex(SEMVER_PATTERN, {
    message: 'Must follow semantic versioning (e.g., "1.2.3")',
  })
  .describe('Semantic version number');

export const UrlSlugString = z
  .string()
  .regex(URL_SLUG_PATTERN, {
    message: 'Must be a valid URL slug (e.g., "my-awesome-post")',
  })
  .describe('URL-friendly slug');

export const EmailString = z
  .string()
  .regex(EMAIL_PATTERN, {
    message: 'Must be a valid email address',
  })
  .describe('Email address');

export const UuidString = z
  .string()
  .regex(UUID_V4_PATTERN, {
    message: 'Must be a valid UUID v4',
  })
  .describe('UUID v4 identifier');

export const HexColorString = z
  .string()
  .regex(HEX_COLOR_PATTERN, {
    message: 'Must be a valid hex color (e.g., "#FF5733")',
  })
  .describe('Hex color code');

export const HttpUrlString = z
  .string()
  .regex(HTTP_URL_PATTERN, {
    message: 'Must be a valid HTTP/HTTPS URL',
  })
  .describe('HTTP/HTTPS URL');

/**
 * Length Constraints
 * 
 * Standard length limits used across schemas.
 */

export const LENGTH_CONSTRAINTS = {
  /** Short text (labels, titles): 1-255 chars */
  SHORT_TEXT: { min: 1, max: 255 },
  
  /** Medium text (descriptions): 1-1000 chars */
  MEDIUM_TEXT: { min: 1, max: 1000 },
  
  /** Long text (rich content): 1-65535 chars */
  LONG_TEXT: { min: 1, max: 65535 },
  
  /** Identifier (machine names): 2-64 chars */
  IDENTIFIER: { min: 2, max: 64 },
  
  /** Namespace: 2-20 chars */
  NAMESPACE: { min: 2, max: 20 },
  
  /** Email: 5-255 chars */
  EMAIL: { min: 5, max: 255 },
  
  /** Password: 8-128 chars */
  PASSWORD: { min: 8, max: 128 },
  
  /** URL: 10-2048 chars */
  URL: { min: 10, max: 2048 },
} as const;

/**
 * Type Exports
 */
export type SnakeCaseString = z.infer<typeof SnakeCaseString>;
export type DotNotationString = z.infer<typeof DotNotationString>;
export type SemverString = z.infer<typeof SemverString>;
export type UrlSlugString = z.infer<typeof UrlSlugString>;
export type EmailString = z.infer<typeof EmailString>;
export type UuidString = z.infer<typeof UuidString>;
export type HexColorString = z.infer<typeof HexColorString>;
export type HttpUrlString = z.infer<typeof HttpUrlString>;
