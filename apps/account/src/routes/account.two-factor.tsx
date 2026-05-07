// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useObjectTranslation } from '@object-ui/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';

export const Route = createFileRoute('/account/two-factor')({
  component: TwoFactorPage,
});

function TwoFactorPage() {
  const { t } = useObjectTranslation();
  const { user, loading: sessionLoading, refresh } = useSession();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [enablePassword, setEnablePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disabling, setDisabling] = useState(false);

  useEffect(() => {
    if (sessionLoading) return;
    setEnabled(Boolean(user?.twoFactorEnabled));
  }, [sessionLoading, user?.twoFactorEnabled]);

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/two-factor/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: enablePassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any)?.message || `Request failed: ${res.status}`);
      }
      const data = await res.json();
      setTotpUri((data as any)?.totpURI ?? null);
      setEnablePassword('');
    } catch (err) {
      toast({
        title: t('twoFactor.enableFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const res = await fetch('/api/v1/auth/two-factor/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: verifyCode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any)?.message || `Request failed: ${res.status}`);
      }
      toast({ title: t('twoFactor.enableSuccess') });
      setEnabled(true);
      setTotpUri(null);
      setVerifyCode('');
      await refresh();
    } catch (err) {
      toast({
        title: t('twoFactor.invalidCode'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisabling(true);
    try {
      const res = await fetch('/api/v1/auth/two-factor/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: disablePassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any)?.message || `Request failed: ${res.status}`);
      }
      toast({ title: t('twoFactor.disableSuccess') });
      setEnabled(false);
      setDisablePassword('');
      await refresh();
    } catch (err) {
      toast({
        title: t('twoFactor.disableFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setDisabling(false);
    }
  };

  if (enabled === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('twoFactor.title')}</CardTitle>
          <CardDescription>{t('twoFactor.loadingStatus')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (totpUri) {
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUri)}`;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('twoFactor.setupTitle')}</CardTitle>
          <CardDescription>{t('twoFactor.setupDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <img
              src={qrSrc}
              alt={t('twoFactor.qrAlt')}
              width={200}
              height={200}
              className="rounded border bg-white p-2"
            />
            <div className="w-full rounded bg-muted p-3 font-mono text-xs break-all">
              {totpUri}
            </div>
            <p className="text-xs text-muted-foreground">{t('twoFactor.uriHint')}</p>
          </div>
          <Separator />
          <form onSubmit={handleVerifyTotp} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="totp-code">{t('twoFactor.verificationCode')}</Label>
              <Input
                id="totp-code"
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={verifying || verifyCode.length < 6}>
                {verifying ? t('twoFactor.verifying') : t('twoFactor.verify')}
              </Button>
              <Button type="button" variant="outline" onClick={() => setTotpUri(null)}>
                {t('twoFactor.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (enabled === true) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">{t('twoFactor.title')}</CardTitle>
            <Badge variant="outline" className="border-green-600 text-green-600">
              {t('twoFactor.enabled')}
            </Badge>
          </div>
          <CardDescription>{t('twoFactor.enabledDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDisable} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="disable-password">{t('twoFactor.password')}</Label>
              <Input
                id="disable-password"
                type="password"
                autoComplete="current-password"
                required
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
              />
            </div>
            <Button variant="destructive" type="submit" disabled={disabling}>
              {disabling ? t('twoFactor.disabling') : t('twoFactor.disable')}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">{t('twoFactor.title')}</CardTitle>
          <Badge variant="outline">{t('twoFactor.notEnabled')}</Badge>
        </div>
        <CardDescription>{t('twoFactor.notEnabledDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEnable} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="enable-password">{t('twoFactor.password')}</Label>
            <Input
              id="enable-password"
              type="password"
              autoComplete="current-password"
              required
              value={enablePassword}
              onChange={(e) => setEnablePassword(e.target.value)}
              placeholder={t('twoFactor.passwordPlaceholder')}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? t('twoFactor.loading') : t('twoFactor.enable')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
