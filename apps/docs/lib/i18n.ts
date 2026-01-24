import { defineI18n } from 'fumadocs-core/i18n';

/**
 * i18n Configuration for ObjectStack Documentation
 * 
 * Supported Languages:
 * - en: English (Default)
 * - cn: Chinese (中文)
 */
export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en'],
  // Hide locale prefix for default language (e.g., /docs instead of /en/docs)
  hideLocale: 'default-locale',
});
