// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * /account/oauth-applications/$clientId — detail / revoke a registered
 * OAuth client app.
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Trash2, Copy } from 'lucide-react';
import { useClient } from '@objectstack/client-react';
import { useObjectTranslation } from '@object-ui/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  useOAuthApplications,
  useDeleteOAuthApplication,
} from '@/hooks/useOAuthApplications';

export const Route = createFileRoute('/account/oauth-applications/$clientId')({
  component: OAuthApplicationDetailPage,
});

function OAuthApplicationDetailPage() {
  const { t } = useObjectTranslation();
  const { clientId } = Route.useParams();
  const navigate = useNavigate();
  const { applications, loading: listLoading, reload } = useOAuthApplications();
  const { remove, deleting } = useDeleteOAuthApplication();
  const client = useClient() as any;

  // Prefer the row from the list (richer fields). Fall back to a direct
  // GET so deep-linking works even before the list arrives.
  const fromList = applications.find((a) => a.client_id === clientId);
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    if (fromList) return;
    if (!client?.oauth?.applications?.get) return;
    client.oauth.applications.get(clientId).then(
      (res: any) => {
        if (!cancelled) setDetail(res?.data ?? res);
      },
      () => {},
    );
    return () => {
      cancelled = true;
    };
  }, [client, clientId, fromList]);

  const app = fromList ?? detail;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value).then(
      () => toast({ title: t('oauth.applications.copied', { label }) }),
      () => toast({ title: t('oauth.applications.copyFailed', { label }), variant: 'destructive' }),
    );
  };

  const handleDelete = async () => {
    if (!app) return;
    try {
      await remove(app.client_id);
      toast({ title: t('oauth.applications.deleted') });
      await reload();
      navigate({ to: '/account/oauth-applications' });
    } catch (err) {
      toast({
        title: t('oauth.applications.deleteFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  if (listLoading && !app) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">{t('common.loading')}</div>
    );
  }

  if (!app) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{t('oauth.applications.notFoundTitle')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('oauth.applications.notFoundDescription')}
        </p>
        <Button onClick={() => navigate({ to: '/account/oauth-applications' })}>
          {t('oauth.applications.backToList')}
        </Button>
      </div>
    );
  }

  const redirectUris: string[] =
    typeof app.redirect_urls === 'string'
      ? app.redirect_urls
          .split(/\r?\n|,/)
          .map((u: string) => u.trim())
          .filter(Boolean)
      : Array.isArray(app.redirect_urls)
        ? app.redirect_urls
        : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{app.name}</h1>
          <p className="font-mono text-xs text-muted-foreground">{app.client_id}</p>
        </div>
        <div className="flex items-center gap-2">
          {app.type && (
            <Badge variant="outline" className="capitalize">
              {app.type}
            </Badge>
          )}
          {app.disabled && <Badge variant="destructive">{t('oauth.applications.disabled')}</Badge>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('oauth.applications.credentials')}</CardTitle>
          <CardDescription>
            {t('oauth.applications.credentialsDescriptionDetail')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>{t('oauth.applications.clientId')}</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-xs">
                {app.client_id}
              </code>
              <Button
                size="icon"
                variant="outline"
                onClick={() => copy(app.client_id, t('oauth.applications.clientId'))}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <Label>{t('oauth.applications.redirectUris')}</Label>
            {redirectUris.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('oauth.applications.noRedirectUris')}</p>
            ) : (
              <ul className="space-y-1">
                {redirectUris.map((u, i) => (
                  <li key={i} className="rounded-md border bg-muted px-3 py-2 font-mono text-xs">
                    {u}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base text-destructive">{t('oauth.applications.dangerTitle')}</CardTitle>
          <CardDescription>
            {t('oauth.applications.dangerDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('oauth.applications.delete')}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">{t('oauth.applications.deleteDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('oauth.applications.deleteDialogDescription', { name: app.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? t('oauth.applications.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
