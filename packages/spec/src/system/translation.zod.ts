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
    label: z.string(),
    pluralLabel: z.string().optional(),
    fields: z.record(z.string(), z.object({
      label: z.string().optional(),
      help: z.string().optional(),
      options: z.record(z.string(), z.string()).optional(), // Option value -> Label map
    })).optional(),
  })).optional(),
  
  /** App/Menu translations */
  apps: z.record(z.string(), z.object({
    label: z.string(),
    description: z.string().optional(),
  })).optional(),

  /** UI Messages */
  messages: z.record(z.string(), z.string()).optional(),
});

export const LocaleSchema = z.string().describe('BCP-47 Language Tag (e.g. en-US, zh-CN)');

export const TranslationBundleSchema = z.record(LocaleSchema, TranslationDataSchema);

export type TranslationBundle = z.infer<typeof TranslationBundleSchema>;
