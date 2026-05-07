// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Account → Linked Accounts — list OAuth/social providers connected to the
 * current user. Allows unlinking and linking new providers.
 */

import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { Link2, Link2Off, Plus } from 'lucide-react';
import { useObjectTranslation } from '@object-ui/i18n';
import { useClient } from '@objectstack/client-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

export const Route = createFileRoute('/account/linked-accounts')({
  component: LinkedAccountsPage,
});

interface LinkedAccount {
  id: string;
  providerId: string;
  accountId?: string;
  createdAt?: string;
}

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  github: 'GitHub',
  microsoft: 'Microsoft',
  apple: 'Apple',
  discord: 'Discord',
  gitlab: 'GitLab',
  twitter: 'Twitter / X',
  facebook: 'Facebook',
};

function LinkedAccountsPage() {
  const { t } = useObjectTranslation();
  const client = useClient() as any;
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlinking, setUnlinking] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    if (!client?.auth?.accounts) return;
    setLoading(true);
    try {
      const res = await client.auth.accounts.list();
      const list = res?.accounts ?? res?.data ?? (Array.isArray(res) ? res : []);
      setAccounts(list);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleUnlink = async (account: LinkedAccount) => {
    if (!confirm(t('linkedAccounts.unlinkConfirm', { provider: PROVIDER_LABELS[account.providerId] ?? account.providerId }))) {
      return;
    }
    setUnlinking(account.id);
    try {
      await client.auth.accounts.unlink({ providerId: account.providerId, accountId: account.accountId });
      toast({ title: t('linkedAccounts.unlinked') });
      await loadAccounts();
    } catch (err) {
      toast({
        title: t('linkedAccounts.unlinkFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setUnlinking(null);
    }
  };

  const handleLink = async (provider: string) => {
    try {
      const res = await client.auth.accounts.linkSocial({
        provider,
        callbackURL: window.location.href,
      });
      const url = res?.url ?? res?.data?.url;
      if (url) {
        window.location.assign(url);
      } else {
        toast({ title: t('linkedAccounts.linkFailed'), variant: 'destructive' });
      }
    } catch (err) {
      toast({
        title: t('linkedAccounts.linkFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  const linkedProviders = new Set(accounts.map((a) => a.providerId));
  const availableProviders = Object.keys(PROVIDER_LABELS).filter(
    (p) => !linkedProviders.has(p),
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('linkedAccounts.title')}</CardTitle>
          <CardDescription>{t('linkedAccounts.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}
          {!loading && accounts.length === 0 && (
            <div className="text-center py-8">
              <Link2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">{t('linkedAccounts.empty')}</p>
            </div>
          )}
          {!loading && accounts.length > 0 && (
            <div className="divide-y">
              {accounts.map((acct) => (
                <div key={acct.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      {PROVIDER_LABELS[acct.providerId] ?? acct.providerId}
                    </Badge>
                    {acct.createdAt && (
                      <span className="text-xs text-muted-foreground">
                        {t('linkedAccounts.linkedOn', {
                          date: new Date(acct.createdAt).toLocaleDateString(),
                        })}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={unlinking === acct.id}
                    onClick={() => handleUnlink(acct)}
                  >
                    <Link2Off className="mr-1 h-4 w-4" />
                    {t('linkedAccounts.unlink')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {availableProviders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('linkedAccounts.addTitle')}</CardTitle>
            <CardDescription>{t('linkedAccounts.addDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableProviders.map((provider) => (
                <Button
                  key={provider}
                  variant="outline"
                  size="sm"
                  onClick={() => handleLink(provider)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {PROVIDER_LABELS[provider]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
