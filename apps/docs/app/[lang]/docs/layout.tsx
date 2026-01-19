import { source } from '@/app/source';
import type { Metadata } from 'next';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { i18n } from '@/lib/i18n';

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  
  return (
    <DocsLayout 
      tree={source.pageTree[lang]} 
      {...baseOptions}
      i18n={i18n}
    >
      {children}
    </DocsLayout>
  );
}
