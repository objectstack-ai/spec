// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useObjectTranslation } from '@object-ui/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';
import { CheckCircle2, GalleryVerticalEnd } from 'lucide-react';

export const Route = createFileRoute('/auth/device')({
  validateSearch: (search: Record<string, unknown>) => ({
    user_code: (search.user_code as string) ?? (search.code as string) ?? '',
  }),
  component: DeviceAuthPage,
});

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          ObjectStack
        </a>
        <div className="flex flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}

function DeviceAuthPage() {
  const { t } = useObjectTranslation();
  const { user_code: code } = Route.useSearch();
  const { user, loading } = useSession();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [denying, setDenying] = useState(false);
  const [approved, setApproved] = useState(false);
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState('');

  if (!code) {
    return (
      <PageShell>
        <Card>
          <CardHeader className="text-center">
            <CardTitle>{t('auth.device.invalidTitle')}</CardTitle>
            <CardDescription>{t('auth.device.invalidDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell>
        <Card>
          <CardHeader className="text-center">
            <CardDescription>{t('auth.device.loading')}</CardDescription>
          </CardHeader>
        </Card>
      </PageShell>
    );
  }

  if (!user) {
    return <Navigate to="/login" search={{ redirect: `/auth/device?user_code=${encodeURIComponent(code)}` }} />;
  }

  if (approved) {
    return (
      <PageShell>
        <Card>
          <CardHeader className="text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
            <CardTitle>{t('auth.device.approvedTitle')}</CardTitle>
            <CardDescription>{t('auth.device.approvedDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </PageShell>
    );
  }

  if (denied) {
    return (
      <PageShell>
        <Card>
          <CardHeader className="text-center">
            <CardTitle>{t('auth.device.deniedTitle')}</CardTitle>
            <CardDescription>{t('auth.device.deniedDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </PageShell>
    );
  }

  const handleApprove = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/auth/device/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userCode: code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any)?.message ?? (data as any)?.error?.message ?? t('auth.device.approveFailed'));
      }

      setApproved(true);
      toast({
        title: t('auth.device.approveSuccess'),
        description: t('auth.device.approveSuccessDescription'),
      });
    } catch (err: any) {
      setError(err?.message ?? t('auth.device.approveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeny = async () => {
    setError('');
    setDenying(true);
    try {
      await fetch('/api/v1/auth/device/deny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userCode: code }),
      });
      setDenied(true);
    } catch (err: any) {
      setError(err?.message ?? t('auth.device.denyFailed'));
    } finally {
      setDenying(false);
    }
  };

  return (
    <PageShell>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>{t('auth.device.title')}</CardTitle>
          <CardDescription>{t('auth.device.subtitle', { email: user.email })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border bg-background px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t('auth.device.userCodeLabel')}</p>
            <p className="font-mono font-semibold tracking-widest text-lg">{code}</p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              {t('auth.device.loggedInAs', { email: user.email })}
            </p>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button onClick={handleApprove} className="w-full" disabled={submitting || denying}>
              {submitting ? t('auth.device.approving') : t('auth.device.approve')}
            </Button>
            <Button onClick={handleDeny} variant="outline" className="w-full" disabled={submitting || denying}>
              {denying ? t('auth.device.denying') : t('auth.device.deny')}
            </Button>
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                onClick={() => navigate({ to: '/' })}
              >
                {t('auth.device.cancel')}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
