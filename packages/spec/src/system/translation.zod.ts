import { z } from 'zod';

/**
 * Translation Schema
 * Supports i18n for labels, messages, and options.
 * Example structure:
 * ```json
 * {
 *   "en": { "objects": { "account": { "label": "Account" } } },
 *   "zh-CN": { "objects": { "account": { "label": "客户" } } }
 * }
 * ```
 */
export const TranslationDataSchema = z.object({
  /** Object translations */
  objects: z.record(z.string(), z.object({
    label: z.string().describe('Translated singular label'),
    pluralLabel: z.string().optional().describe('Translated plural label'),
    fields: z.record(z.string(), z.object({
      label: z.string().optional().describe('Translated field label'),
      help: z.string().optional().describe('Translated help text'),
      options: z.record(z.string(), z.string()).optional().describe('Option value to translated label map'),
    })).optional().describe('Field-level translations'),
  })).optional().describe('Object translations keyed by object name'),
  
  /** App/Menu translations */
  apps: z.record(z.string(), z.object({
    label: z.string().describe('Translated app label'),
    description: z.string().optional().describe('Translated app description'),
  })).optional().describe('App translations keyed by app name'),

  /** UI Messages */
  messages: z.record(z.string(), z.string()).optional().describe('UI message translations keyed by message ID'),
}).describe('Translation data for objects, apps, and UI messages');

export const LocaleSchema = z.string().describe('BCP-47 Language Tag (e.g. en-US, zh-CN)');

export const TranslationBundleSchema = z.record(LocaleSchema, TranslationDataSchema).describe('Map of locale codes to translation data');

export type TranslationBundle = z.infer<typeof TranslationBundleSchema>;
