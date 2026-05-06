// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Account portal i18n loader.
 *
 * Unlike the dashboard (which fetches metadata-driven translations from the
 * REST API), the Account portal is a fixed UI surface — translations live as
 * static JSON bundles and are loaded on demand via Vite's dynamic import.
 */

export const SUPPORTED_LANGUAGES = ['en', 'zh-CN'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

const loaders: Record<SupportedLanguage, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import('./locales/en.json'),
  'zh-CN': () => import('./locales/zh-CN.json'),
};

function normalize(lang: string): SupportedLanguage {
  if ((SUPPORTED_LANGUAGES as readonly string[]).includes(lang)) return lang as SupportedLanguage;
  // Map common aliases (e.g. 'zh', 'zh-Hans', 'zh_CN') → 'zh-CN'
  if (lang.toLowerCase().startsWith('zh')) return 'zh-CN';
  return DEFAULT_LANGUAGE;
}

export async function loadLanguage(lang: string): Promise<Record<string, unknown>> {
  const target = normalize(lang);
  try {
    const mod = await loaders[target]();
    return mod.default;
  } catch (err) {
    console.warn(`[account/i18n] Failed to load language pack '${lang}':`, err);
    return {};
  }
}
