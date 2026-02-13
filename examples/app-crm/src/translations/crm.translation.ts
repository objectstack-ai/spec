// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { TranslationBundle } from '@objectstack/spec/system';
import { en } from './en';
import { zhCN } from './zh-CN';
import { jaJP } from './ja-JP';
import { esES } from './es-ES';

/**
 * CRM App — Internationalization (i18n)
 *
 * Demonstrates **per-locale file splitting** convention:
 * each language is defined in its own file (`en.ts`, `zh-CN.ts`, `ja-JP.ts`, `es-ES.ts`)
 * and assembled into a single `TranslationBundle` here.
 *
 * Enterprise-grade multi-language translations covering:
 * - Core CRM objects: Account, Contact, Lead, Opportunity
 * - Select-field option labels for each object
 * - App & navigation group labels
 * - Common UI messages, validation messages
 *
 * Supported locales: en, zh-CN, ja-JP, es-ES
 */
export const CrmTranslations: TranslationBundle = {
  en,
  'zh-CN': zhCN,
  'ja-JP': jaJP,
  'es-ES': esES,
};
