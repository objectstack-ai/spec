import './global.css';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { i18n } from '@/lib/i18n';

export const metadata: Metadata = {
  title: {
    template: '%s | ObjectStack Protocol',
    default: 'ObjectStack Protocol',
  },
  description: 'The Metadata-Driven Documentation Engine for the Low-Code Era.',
  icons: {
    icon: 'https://objectstack.ai/logo.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Root layout is only used for redirects with middleware
  // The actual layout is in [lang]/layout.tsx
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
