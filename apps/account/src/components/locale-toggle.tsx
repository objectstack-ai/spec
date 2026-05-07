// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * LocaleToggle — language switcher button in the top bar.
 *
 * Mirrors the ThemeToggle pattern. Persists the selected language to
 * localStorage under `account.lang` so the choice survives reloads.
 */

import { Languages } from 'lucide-react';
import { useObjectTranslation } from '@object-ui/i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';

const LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  'zh-CN': '中文',
};

export function LocaleToggle() {
  const { t, language, changeLanguage } = useObjectTranslation();

  async function handleSelect(lang: SupportedLanguage) {
    await changeLanguage(lang);
    try {
      localStorage.setItem('account.lang', lang);
    } catch {
      /* ignore storage errors */
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={t('common.language')}
        >
          <Languages className="h-4 w-4" />
          <span className="sr-only">{t('common.language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onSelect={() => void handleSelect(lang)}
            className={lang === language ? 'font-medium' : undefined}
          >
            {LABELS[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
