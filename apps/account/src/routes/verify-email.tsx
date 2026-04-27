// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
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
  const { token } = Route.useSearch();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }
    fetch(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`, {
      credentials: 'include',
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus('success');
        } else {
          const data = await res.json().catch(() => ({}));
          setStatus('error');
          setMessage((data as any)?.message || `Verification failed (${res.status})`);
        }
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message);
      });
  }, [token]);

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
                <CardTitle className="text-xl">Verifying email…</CardTitle>
                <CardDescription>Please wait while we verify your email address.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
              </CardContent>
            </>
          )}
          {status === 'success' && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Email verified</CardTitle>
                <CardDescription>Your email has been verified successfully.</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link to="/login" className="text-sm underline underline-offset-4 hover:text-primary">
                  Sign in to your account
                </Link>
              </CardContent>
            </>
          )}
          {status === 'error' && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Verification failed</CardTitle>
                <CardDescription>{message || 'The verification link is invalid or has expired.'}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link to="/login" className="text-sm underline underline-offset-4 hover:text-primary">
                  Back to sign in
                </Link>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
