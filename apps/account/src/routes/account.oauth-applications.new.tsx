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
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }
    if (uris.length === 0) {
      toast({ title: 'At least one redirect URI is required', variant: 'destructive' });
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
      toast({ title: 'Application registered' });
    } catch (err) {
      toast({
        title: 'Failed to register application',
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value).then(
      () => toast({ title: `${label} copied to clipboard` }),
      () => toast({ title: `Failed to copy ${label}`, variant: 'destructive' }),
    );
  };

  if (created) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Application registered</h1>
          <p className="text-sm text-muted-foreground">
            Copy the client secret now — it cannot be displayed again.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Credentials</CardTitle>
            <CardDescription>
              Use these values to configure the OAuth/OIDC client in your
              application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Client ID</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-xs">
                  {created.client_id}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copy(created.client_id, 'Client ID')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {created.client_secret && (
              <div className="space-y-1">
                <Label>Client Secret</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 break-all rounded-md border bg-muted px-3 py-2 font-mono text-xs">
                    {created.client_secret}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copy(created.client_secret!, 'Client Secret')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-destructive">
                  Save this secret now — it cannot be retrieved later.
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
            Back to list
          </Button>
          <Button
            onClick={() =>
              navigate({
                to: '/account/oauth-applications/$clientId',
                params: { clientId: created.client_id },
              })
            }
          >
            View application
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Register OAuth application</h1>
        <p className="text-sm text-muted-foreground">
          Create credentials so an external app can authenticate users via
          this server.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" />
            Application details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oauth-name">Application name</Label>
            <Input
              id="oauth-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome App"
              disabled={registering}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oauth-redirect">Redirect URIs</Label>
            <Textarea
              id="oauth-redirect"
              value={redirectUris}
              onChange={(e) => setRedirectUris(e.target.value)}
              placeholder="https://app.example.com/callback"
              rows={3}
              disabled={registering}
            />
            <p className="text-xs text-muted-foreground">
              One per line, or comma-separated. Must exactly match the URI the
              client uses during the authorization flow.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Token endpoint auth method</Label>
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
                  client_secret_basic (recommended)
                </SelectItem>
                <SelectItem value="client_secret_post">client_secret_post</SelectItem>
                <SelectItem value="none">none (public client / PKCE only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="oauth-client-uri">Application URL (optional)</Label>
            <Input
              id="oauth-client-uri"
              value={clientUri}
              onChange={(e) => setClientUri(e.target.value)}
              placeholder="https://app.example.com"
              disabled={registering}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oauth-logo">Logo URL (optional)</Label>
            <Input
              id="oauth-logo"
              value={logoUri}
              onChange={(e) => setLogoUri(e.target.value)}
              placeholder="https://app.example.com/logo.png"
              disabled={registering}
            />
            <p className="text-xs text-muted-foreground">
              Shown to users on the consent screen.
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
          Cancel
        </Button>
        <Button onClick={handleCreate} disabled={registering}>
          {registering ? 'Registering…' : 'Register application'}
        </Button>
      </div>
    </div>
  );
}
