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

export const Route = createFileRoute('/register')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const r = search.redirect;
    return typeof r === 'string' ? { redirect: r } : {};
  },
  component: RegisterPage,
});

function isSafeRedirect(target: string | undefined): target is string {
  return !!target && target.startsWith('/') && !target.startsWith('//');
}

function resolveRedirect(target: string): string {
  if (target.startsWith('/_')) return target;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base + target;
}

function RegisterPage() {
  const { t } = useObjectTranslation();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const client = useClient() as any;
  const { session, user, refresh } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (isSafeRedirect(redirect)) {
      window.location.assign(resolveRedirect(redirect));
      return;
    }
    // If the user already has an org (e.g. signed up via an invitation),
    // hand off to the platform home. Otherwise, send them to the org
    // creation page — they need an org before they can use the product.
    if (session?.activeOrganizationId) {
      window.location.assign('/');
      return;
    }
    navigate({ to: '/organizations/new' });
  }, [user, session, navigate, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client?.auth) return;
    setSubmitting(true);
    try {
      await client.auth.register({ name, email, password });
      await refresh();
      toast({ title: t('auth.register.successToast') });
      // Navigation is handled by the auth-redirect effect above once the
      // session updates: it sends users with an active org to the platform
      // home, otherwise to /organizations/new.
    } catch (err) {
      toast({
        title: t('auth.register.failed'),
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
              <CardTitle className="text-xl">{t('auth.register.title')}</CardTitle>
              <CardDescription>{t('auth.register.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  <SocialSignInButtons mode="sign-up" redirect={redirect} />
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">{t('auth.nameLabel')}</Label>
                    <Input
                      id="name"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
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
                    <Label htmlFor="password">{t('auth.passwordLabel')}</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? t('auth.register.submitting') : t('auth.register.submit')}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    {t('auth.register.haveAccount')}{' '}
                    <Link
                      to="/login"
                      search={redirect ? { redirect } : undefined}
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      {t('auth.register.signIn')}
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
          <p className="px-6 text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
            {t('legal.agreementPrefix')}{' '}
            <a href="#">{t('legal.termsOfService')}</a> {t('legal.and')}{' '}
            <a href="#">{t('legal.privacyPolicy')}</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
