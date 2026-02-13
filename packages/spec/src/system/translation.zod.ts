// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';

// ────────────────────────────────────────────────────────────────────────────
// Locale
// ────────────────────────────────────────────────────────────────────────────

export const LocaleSchema = z.string().describe('BCP-47 Language Tag (e.g. en-US, zh-CN)');

// ────────────────────────────────────────────────────────────────────────────
// Object-level Translation (per-object file)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Field Translation Schema
 * Translation data for a single field.
 */
export const FieldTranslationSchema = z.object({
  label: z.string().optional().describe('Translated field label'),
  help: z.string().optional().describe('Translated help text'),
  options: z.record(z.string(), z.string()).optional().describe('Option value to translated label map'),
}).describe('Translation data for a single field');

export type FieldTranslation = z.infer<typeof FieldTranslationSchema>;

/**
 * Object Translation Data Schema
 *
 * Translation data for a **single object** in a **single locale**.
 * Use this schema to validate per-object translation files.
 *
 * File convention: `i18n/{locale}/{object_name}.json`
 *
 * @example
 * ```json
 * // i18n/en/account.json
 * {
 *   "label": "Account",
 *   "pluralLabel": "Accounts",
 *   "fields": {
 *     "name": { "label": "Account Name", "help": "Legal name" },
 *     "type": { "label": "Type", "options": { "customer": "Customer" } }
 *   }
 * }
 * ```
 */
export const ObjectTranslationDataSchema = z.object({
  /** Translated singular label for the object */
  label: z.string().describe('Translated singular label'),
  /** Translated plural label for the object */
  pluralLabel: z.string().optional().describe('Translated plural label'),
  /** Field-level translations keyed by field name (snake_case) */
  fields: z.record(z.string(), FieldTranslationSchema).optional().describe('Field-level translations'),
}).describe('Translation data for a single object');

export type ObjectTranslationData = z.infer<typeof ObjectTranslationDataSchema>;

// ────────────────────────────────────────────────────────────────────────────
// Locale-level Translation Data (per-locale aggregate)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Translation Data Schema
 * Supports i18n for labels, messages, and options within a single locale.
 * Example structure:
 * ```json
 * {
 *   "objects": { "account": { "label": "Account" } },
 *   "apps": { "crm": { "label": "CRM" } },
 *   "messages": { "common.save": "Save" }
 * }
 * ```
 */
export const TranslationDataSchema = z.object({
  /** Object translations */
  objects: z.record(z.string(), ObjectTranslationDataSchema).optional().describe('Object translations keyed by object name'),
  
  /** App/Menu translations */
  apps: z.record(z.string(), z.object({
    label: z.string().describe('Translated app label'),
    description: z.string().optional().describe('Translated app description'),
  })).optional().describe('App translations keyed by app name'),

  /** UI Messages */
  messages: z.record(z.string(), z.string()).optional().describe('UI message translations keyed by message ID'),
  
  /** Validation Error Messages */
  validationMessages: z.record(z.string(), z.string()).optional().describe('Translatable validation error messages keyed by rule name (e.g., {"discount_limit": "折扣不能超过40%"})'),
}).describe('Translation data for objects, apps, and UI messages');

export type TranslationData = z.infer<typeof TranslationDataSchema>;

// ────────────────────────────────────────────────────────────────────────────
// Translation Bundle (all locales)
// ────────────────────────────────────────────────────────────────────────────

export const TranslationBundleSchema = z.record(LocaleSchema, TranslationDataSchema).describe('Map of locale codes to translation data');

export type TranslationBundle = z.infer<typeof TranslationBundleSchema>;

// ────────────────────────────────────────────────────────────────────────────
// File Organization Convention
// ────────────────────────────────────────────────────────────────────────────

/**
 * Translation File Organization Strategy
 *
 * Defines how translation files are organized on disk.
 *
 * - `bundled` — All locales in a single `TranslationBundle` file.
 *   Best for small projects with few objects.
 *   ```
 *   src/translations/
 *     crm.translation.ts        # { en: {...}, "zh-CN": {...} }
 *   ```
 *
 * - `per_locale` — One file per locale containing all namespaces.
 *   Recommended when a single locale file stays under ~500 lines.
 *   ```
 *   src/translations/
 *     en.ts                     # TranslationData for English
 *     zh-CN.ts                  # TranslationData for Chinese
 *   ```
 *
 * - `per_namespace` — One file per namespace (object) per locale.
 *   Recommended for large projects with many objects/languages.
 *   Aligns with Salesforce DX and ServiceNow conventions.
 *   ```
 *   i18n/
 *     en/
 *       account.json            # ObjectTranslationData
 *       contact.json
 *       common.json             # messages + app labels
 *     zh-CN/
 *       account.json
 *       contact.json
 *       common.json
 *   ```
 */
export const TranslationFileOrganizationSchema = z.enum([
  'bundled',
  'per_locale',
  'per_namespace',
]).describe('Translation file organization strategy');

export type TranslationFileOrganization = z.infer<typeof TranslationFileOrganizationSchema>;

// ────────────────────────────────────────────────────────────────────────────
// Translation Configuration
// ────────────────────────────────────────────────────────────────────────────

/**
 * Translation Configuration Schema
 *
 * Defines internationalization settings for the stack.
 *
 * @example
 * ```typescript
 * export default defineStack({
 *   i18n: {
 *     defaultLocale: 'en',
 *     supportedLocales: ['en', 'zh-CN', 'ja-JP'],
 *     fallbackLocale: 'en',
 *     fileOrganization: 'per_locale',
 *   },
 *   translations: [...],
 * });
 * ```
 */
export const TranslationConfigSchema = z.object({
  /** Default locale for the application */
  defaultLocale: LocaleSchema.describe('Default locale (e.g., "en")'),
  /** Supported BCP-47 locale codes */
  supportedLocales: z.array(LocaleSchema).describe('Supported BCP-47 locale codes'),
  /** Fallback locale when translation is not found */
  fallbackLocale: LocaleSchema.optional().describe('Fallback locale code'),
  /** How translation files are organized on disk */
  fileOrganization: TranslationFileOrganizationSchema.default('per_locale')
    .describe('File organization strategy'),
  /** Load translations on demand instead of eagerly */
  lazyLoad: z.boolean().default(false).describe('Load translations on demand'),
  /** Cache loaded translations in memory */
  cache: z.boolean().default(true).describe('Cache loaded translations'),
}).describe('Internationalization configuration');

export type TranslationConfig = z.infer<typeof TranslationConfigSchema>;
