// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * /account/oauth-applications/new — register a new OAuth client app.
 *
 * On success the newly issued `client_secret` is shown ONCE in a "save it
 * now" panel; afterwards the user is sent to the application detail page.
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Copy, KeyRound } from 'lucide-react';
import { useObjectTranslation } from '@object-ui/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useRegisterOAuthApplication } from '@/hooks/useOAuthApplications';

export const Route = createFileRoute('/account/oauth-applications/new')({
  component: NewOAuthApplicationPage,
});

type AuthMethod = 'none' | 'client_secret_basic' | 'client_secret_post';

function NewOAuthApplicationPage() {
  const { t } = useObjectTranslation();
  const navigate = useNavigate();
  const { register, registering } = useRegisterOAuthApplication();

  const [name, setName] = useState('');
  const [redirectUris, setRedirectUris] = useState('');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('client_secret_basic');
  const [clientUri, setClientUri] = useState('');
  const [logoUri, setLogoUri] = useState('');

  const [created, setCreated] = useState<{
    client_id: string;
    client_secret?: string;
  } | null>(null);

  const handleCreate = async () => {
    const trimmedName = name.trim();
    const uris = redirectUris
      .split(/\r?\n|,/)
      .map((u) => u.trim())
      .filter(Boolean);
    if (!trimmedName) {
      toast({ title: t('oauth.applications.form.nameRequired'), variant: 'destructive' });
      return;
    }
    if (uris.length === 0) {
      toast({ title: t('oauth.applications.form.redirectRequired'), variant: 'destructive' });
      return;
    }
    try {
      const result = await register({
        client_name: trimmedName,
        redirect_uris: uris,
        token_endpoint_auth_method: authMethod,
        ...(clientUri.trim() ? { client_uri: clientUri.trim() } : {}),
        ...(logoUri.trim() ? { logo_uri: logoUri.trim() } : {}),
      });
      setCreated({
        client_id: result?.client_id ?? '',
        client_secret: result?.client_secret,
      });
      toast({ title: t('oauth.applications.registered') });
    } catch (err) {
      toast({
        title: t('oauth.applications.registerFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value).then(
      () => toast({ title: t('oauth.applications.copied', { label }) }),
      () => toast({ title: t('oauth.applications.copyFailed', { label }), variant: 'destructive' }),
    );
  };

  if (created) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{t('oauth.applications.registeredTitle')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('oauth.applications.registeredDescription')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('oauth.applications.credentials')}</CardTitle>
            <CardDescription>
              {t('oauth.applications.credentialsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>{t('oauth.applications.clientId')}</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-xs">
                  {created.client_id}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copy(created.client_id, t('oauth.applications.clientId'))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {created.client_secret && (
              <div className="space-y-1">
                <Label>{t('oauth.applications.clientSecret')}</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 break-all rounded-md border bg-muted px-3 py-2 font-mono text-xs">
                    {created.client_secret}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copy(created.client_secret!, t('oauth.applications.clientSecret'))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-destructive">
                  {t('oauth.applications.clientSecretWarning')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/account/oauth-applications' })}
          >
            {t('oauth.applications.backToList')}
          </Button>
          <Button
            onClick={() =>
              navigate({
                to: '/account/oauth-applications/$clientId',
                params: { clientId: created.client_id },
              })
            }
          >
            {t('oauth.applications.viewApplication')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('oauth.applications.form.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('oauth.applications.form.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" />
            {t('oauth.applications.form.details')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oauth-name">{t('oauth.applications.form.name')}</Label>
            <Input
              id="oauth-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('oauth.applications.form.namePlaceholder')}
              disabled={registering}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oauth-redirect">{t('oauth.applications.form.redirectUris')}</Label>
            <Textarea
              id="oauth-redirect"
              value={redirectUris}
              onChange={(e) => setRedirectUris(e.target.value)}
              placeholder={t('oauth.applications.form.redirectPlaceholder')}
              rows={3}
              disabled={registering}
            />
            <p className="text-xs text-muted-foreground">
              {t('oauth.applications.form.redirectHint')}
            </p>
          </div>
          <div className="space-y-2">
            <Label>{t('oauth.applications.form.authMethod')}</Label>
            <Select
              value={authMethod}
              onValueChange={(v) => setAuthMethod(v as AuthMethod)}
              disabled={registering}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client_secret_basic">
                  {t('oauth.applications.form.authMethodBasic')}
                </SelectItem>
                <SelectItem value="client_secret_post">{t('oauth.applications.form.authMethodPost')}</SelectItem>
                <SelectItem value="none">{t('oauth.applications.form.authMethodNone')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="oauth-client-uri">{t('oauth.applications.form.clientUri')}</Label>
            <Input
              id="oauth-client-uri"
              value={clientUri}
              onChange={(e) => setClientUri(e.target.value)}
              placeholder={t('oauth.applications.form.clientUriPlaceholder')}
              disabled={registering}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oauth-logo">{t('oauth.applications.form.logoUri')}</Label>
            <Input
              id="oauth-logo"
              value={logoUri}
              onChange={(e) => setLogoUri(e.target.value)}
              placeholder={t('oauth.applications.form.logoUriPlaceholder')}
              disabled={registering}
            />
            <p className="text-xs text-muted-foreground">
              {t('oauth.applications.form.logoHint')}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/account/oauth-applications' })}
          disabled={registering}
        >
          {t('common.cancel')}
        </Button>
        <Button onClick={handleCreate} disabled={registering}>
          {registering ? t('oauth.applications.form.registering') : t('oauth.applications.register')}
        </Button>
      </div>
    </div>
  );
}
