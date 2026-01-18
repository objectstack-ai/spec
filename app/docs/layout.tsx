import { source } from '@/app/source';
import type { Metadata } from 'next';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={source.pageTree} {...baseOptions}>
      {children}
    </DocsLayout>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: {
      default: 'ObjectStack Protocol',
      template: '%s | ObjectStack Protocol',
    },
    description: 'The Standard for Post-SaaS Operating Systems',
  };
}
