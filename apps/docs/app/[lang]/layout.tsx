import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { i18n } from '@/lib/i18n';

export default async function LanguageLayout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  
  return (
    <html lang={lang} suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}

export async function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}
