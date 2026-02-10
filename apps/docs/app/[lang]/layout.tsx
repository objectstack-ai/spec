import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { i18n } from '@/lib/i18n';

// Language display names mapping
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  cn: '中文',
};

export default async function LanguageLayout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  
  return (
    <RootProvider
      i18n={{
        locale: lang,
        locales: i18n.languages.map((l) => ({
          name: LANGUAGE_NAMES[l] || l,
          locale: l,
        })),
      }}
    >
      {children}
    </RootProvider>
  );
}

export async function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}
