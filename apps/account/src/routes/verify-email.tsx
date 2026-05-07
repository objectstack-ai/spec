// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useObjectTranslation } from '@object-ui/i18n';
import { useClient } from '@objectstack/client-react';
import { GalleryVerticalEnd } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/verify-email')({
  validateSearch: (search: Record<string, unknown>): { token?: string } => {
    const t = search.token;
    return typeof t === 'string' ? { token: t } : {};
  },
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { t } = useObjectTranslation();
  const { token } = Route.useSearch();
  const client = useClient() as any;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('auth.verifyEmail.missingToken'));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await client.auth.verifyEmail({ token });
        if (!cancelled) setStatus('success');
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setMessage((err as Error).message || t('auth.verifyEmail.errorDescription'));
        }
      }
    })();
    return () => { cancelled = true; };
  }, [token, t, client]);

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          ObjectStack
        </a>
        <Card>
          {status === 'loading' && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{t('auth.verifyEmail.verifyingTitle')}</CardTitle>
                <CardDescription>{t('auth.verifyEmail.verifyingDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
              </CardContent>
            </>
          )}
          {status === 'success' && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{t('auth.verifyEmail.successTitle')}</CardTitle>
                <CardDescription>{t('auth.verifyEmail.successDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link to="/login" className="text-sm underline underline-offset-4 hover:text-primary">
                  {t('auth.verifyEmail.signInLink')}
                </Link>
              </CardContent>
            </>
          )}
          {status === 'error' && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{t('auth.verifyEmail.errorTitle')}</CardTitle>
                <CardDescription>{message || t('auth.verifyEmail.errorDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link to="/login" className="text-sm underline underline-offset-4 hover:text-primary">
                  {t('auth.verifyEmail.backToSignIn')}
                </Link>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
