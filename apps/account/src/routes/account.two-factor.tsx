// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useObjectTranslation } from '@object-ui/i18n';
import { useClient } from '@objectstack/client-react';
import { Copy, KeyRound, RefreshCw } from 'lucide-react';
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
  const client = useClient() as any;
  const { user, loading: sessionLoading, refresh } = useSession();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [enablePassword, setEnablePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [pendingBackupCodes, setPendingBackupCodes] = useState<string[] | null>(null);
  const [trustDevice, setTrustDevice] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disabling, setDisabling] = useState(false);

  // ── backup codes (only after enrolment) ────────────────────────────
  const [backupPassword, setBackupPassword] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  useEffect(() => {
    if (sessionLoading) return;
    setEnabled(Boolean(user?.twoFactorEnabled));
  }, [sessionLoading, user?.twoFactorEnabled]);

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await client.auth.twoFactor.enable({ password: enablePassword });
      setTotpUri(res?.totpURI ?? null);
      setPendingBackupCodes(res?.backupCodes ?? null);
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
      await client.auth.twoFactor.verifyTotp({ code: verifyCode, trustDevice });
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
      await client.auth.twoFactor.disable({ password: disablePassword });
      toast({ title: t('twoFactor.disableSuccess') });
      setEnabled(false);
      setDisablePassword('');
      setBackupCodes(null);
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

  const handleRegenerateBackupCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegenerating(true);
    try {
      const res = await client.auth.twoFactor.generateBackupCodes({ password: backupPassword });
      setBackupCodes(res?.backupCodes ?? []);
      setBackupPassword('');
      toast({ title: t('twoFactor.backupCodes.regenerated') });
    } catch (err) {
      toast({
        title: t('twoFactor.backupCodes.regenerateFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setRegenerating(false);
    }
  };

  const copyBackupCodes = async (codes: string[]) => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      toast({ title: t('twoFactor.backupCodes.copied') });
    } catch {
      toast({ title: t('twoFactor.backupCodes.copyFailed'), variant: 'destructive' });
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
          {pendingBackupCodes && pendingBackupCodes.length > 0 && (
            <div className="rounded border bg-muted/40 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{t('twoFactor.backupCodes.savedTitle')}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyBackupCodes(pendingBackupCodes)}
                >
                  <Copy className="mr-1 h-3 w-3" />
                  {t('twoFactor.backupCodes.copy')}
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('twoFactor.backupCodes.savedHint')}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-1 font-mono text-xs">
                {pendingBackupCodes.map((c) => (
                  <span key={c} className="rounded bg-background px-2 py-1">{c}</span>
                ))}
              </div>
            </div>
          )}
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
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
              />
              {t('twoFactor.trustDevice')}
            </label>
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
      <div className="space-y-6">
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              {t('twoFactor.backupCodes.title')}
            </CardTitle>
            <CardDescription>{t('twoFactor.backupCodes.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleRegenerateBackupCodes} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="backup-password">{t('twoFactor.password')}</Label>
                <Input
                  id="backup-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={backupPassword}
                  onChange={(e) => setBackupPassword(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline" disabled={regenerating}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {regenerating ? t('common.saving') : t('twoFactor.backupCodes.regenerate')}
              </Button>
            </form>
            {backupCodes && backupCodes.length > 0 && (
              <div className="rounded border bg-muted/40 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{t('twoFactor.backupCodes.newTitle')}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyBackupCodes(backupCodes)}
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    {t('twoFactor.backupCodes.copy')}
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('twoFactor.backupCodes.savedHint')}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-1 font-mono text-xs">
                  {backupCodes.map((c) => (
                    <span key={c} className="rounded bg-background px-2 py-1">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
