import './global.css';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

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

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
