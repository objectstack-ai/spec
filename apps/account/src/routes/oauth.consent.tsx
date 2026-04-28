// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * /oauth/consent — OAuth/OIDC consent screen.
 *
 * The better-auth `oidc-provider` plugin redirects unauthorized users here
 * with the following query parameters when an OAuth client requests
 * consent:
 *   - consent_code   — opaque token identifying the pending request
 *   - client_id      — the requesting application
 *   - scope          — space-separated requested scopes
 *
 * After the user accepts or denies, we POST to `/api/v1/auth/oauth2/consent`
 * which redirects the user back to the client's redirect_uri.
 */

import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Check, KeyRound, X } from 'lucide-react';
import { useClient } from '@objectstack/client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';
import { useOAuthConsent } from '@/hooks/useOAuthApplications';

interface ConsentSearch {
  consent_code?: string;
  client_id?: string;
  scope?: string;
}

export const Route = createFileRoute('/oauth/consent')({
  validateSearch: (s: Record<string, unknown>): ConsentSearch => ({
    consent_code: typeof s.consent_code === 'string' ? s.consent_code : undefined,
    client_id: typeof s.client_id === 'string' ? s.client_id : undefined,
    scope: typeof s.scope === 'string' ? s.scope : undefined,
  }),
  component: OAuthConsentPage,
});

function OAuthConsentPage() {
  const search = useSearch({ from: '/oauth/consent' });
  const navigate = useNavigate();
  const client = useClient() as any;
  const { user, loading: sessionLoading } = useSession();
  const { submit, submitting } = useOAuthConsent();

  const [clientInfo, setClientInfo] = useState<{ name?: string; icon?: string } | null>(null);

  // If unauthenticated, bounce to login with a return-to that brings the
  // user back here once signed in.
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      const here = window.location.pathname + window.location.search;
      navigate({ to: '/login', search: { redirect: here } as any });
    }
  }, [user, sessionLoading, navigate]);

  // Best-effort lookup of the client app's display name + icon.
  useEffect(() => {
    if (!search.client_id || !client?.oauth?.applications?.get) return;
    let cancelled = false;
    client.oauth.applications.get(search.client_id).then(
      (res: any) => {
        if (cancelled) return;
        const data = res?.data ?? res;
        setClientInfo({ name: data?.name, icon: data?.icon });
      },
      () => {},
    );
    return () => {
      cancelled = true;
    };
  }, [client, search.client_id]);

  const scopes = (search.scope ?? '').split(/\s+/).filter(Boolean);

  const handleDecision = async (accept: boolean) => {
    try {
      const res: any = await submit({
        accept,
        ...(search.consent_code ? { consent_code: search.consent_code } : {}),
      });
      const redirect = res?.redirectURI ?? res?.redirect_uri ?? res?.url;
      if (redirect) {
        window.location.href = redirect;
        return;
      }
      toast({
        title: accept ? 'Consent granted' : 'Consent denied',
        description: 'No redirect URL returned by the server.',
        variant: accept ? undefined : 'destructive',
      });
    } catch (err) {
      toast({
        title: 'Failed to submit consent',
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  const appName = clientInfo?.name ?? search.client_id ?? 'an application';

  return (
    <div className="flex min-h-svh w-full flex-1 items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="mb-3 rounded-full border bg-muted p-3">
            {clientInfo?.icon ? (
              <img
                src={clientInfo.icon}
                alt=""
                className="h-8 w-8 rounded"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <KeyRound className="h-7 w-7 text-muted-foreground" />
            )}
          </div>
          <CardTitle className="text-xl">Authorize {appName}</CardTitle>
          <CardDescription>
            {appName} is requesting access to your ObjectStack account
            {user?.email ? ` (${user.email})` : ''}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {scopes.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">This will allow it to:</p>
              <ul className="space-y-1.5 rounded-md border bg-muted/40 p-3 text-sm">
                {scopes.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-green-600 dark:text-green-400" />
                    <span>{describeScope(s)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => handleDecision(false)}
              disabled={submitting}
            >
              <X className="mr-2 h-4 w-4" />
              Deny
            </Button>
            <Button onClick={() => handleDecision(true)} disabled={submitting}>
              <Check className="mr-2 h-4 w-4" />
              {submitting ? 'Submitting…' : 'Authorize'}
            </Button>
          </div>

          <p className="pt-2 text-center text-xs text-muted-foreground">
            You can revoke access any time from your account settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function describeScope(scope: string): string {
  switch (scope) {
    case 'openid':
      return 'Verify your identity';
    case 'profile':
      return 'Access your basic profile (name, picture)';
    case 'email':
      return 'Access your email address';
    case 'offline_access':
      return 'Stay signed in (refresh tokens)';
    default:
      return scope;
  }
}
