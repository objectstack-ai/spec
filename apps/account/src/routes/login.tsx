// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useClient } from '@objectstack/client-react';
import { useObjectTranslation } from '@object-ui/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';
import { SocialSignInButtons } from '@/components/auth/social-sign-in-buttons';
import { GalleryVerticalEnd } from 'lucide-react';

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const r = search.redirect;
    return typeof r === 'string' ? { redirect: r } : {};
  },
  component: LoginPage,
});

function isSafeRedirect(target: string | undefined): target is string {
  return !!target && target.startsWith('/') && !target.startsWith('//');
}

/**
 * Resolve a redirect target to an absolute path on the current origin.
 *
 * - Paths beginning with `/_` (e.g. `/_studio/...`, `/_account/...`) are
 *   already absolute SPA mounts — return them verbatim.
 * - Otherwise the target is an Account-internal SPA path (`/account`,
 *   `/organizations/...`) and gets prefixed with the Account SPA base URL.
 */
function resolveRedirect(target: string): string {
  if (target.startsWith('/_')) return target;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base + target;
}

function LoginPage() {
  const { t } = useObjectTranslation();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const client = useClient() as any;
  const { session, user, refresh } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (isSafeRedirect(redirect)) {
      window.location.assign(resolveRedirect(redirect));
      return;
    }
    if (!session?.activeOrganizationId) {
      navigate({ to: '/organizations' });
      return;
    }
    // Default landing after sign-in: the platform home, not the Account
    // profile page. Users can reach `/account` from the top-bar menu.
    window.location.assign('/');
  }, [user, session, navigate, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client?.auth) return;
    setSubmitting(true);
    try {
      await client.auth.login({ type: 'email', email, password });
      await refresh();
      toast({ title: t('auth.login.welcomeToast') });
    } catch (err) {
      toast({
        title: t('auth.login.failed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          ObjectStack
        </a>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{t('auth.login.title')}</CardTitle>
              <CardDescription>{t('auth.login.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  <SocialSignInButtons mode="sign-in" redirect={redirect} />
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">{t('auth.emailLabel')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">{t('auth.passwordLabel')}</Label>
                      <Link
                        to="/forgot-password"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        {t('auth.login.forgotPassword')}
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? t('auth.login.submitting') : t('auth.login.submit')}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    {t('auth.login.noAccount')}{' '}
                    <Link
                      to="/register"
                      search={redirect ? { redirect } : undefined}
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      {t('auth.login.signUp')}
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
          <p className="px-6 text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
            {t('legal.agreementPrefix')}{' '}
            <a href="#">{t('legal.termsOfService')}</a> {t('legal.and')} <a href="#">{t('legal.privacyPolicy')}</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
