// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useClient } from '@objectstack/client-react';
import { useObjectTranslation } from '@object-ui/i18n';
import { GalleryVerticalEnd, Plus, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';

/**
 * First-run setup page.
 *
 * Renders only when `client.auth.bootstrapStatus()` reports `hasOwner: false`.
 * Creates the first user via better-auth's standard `sign-up/email`,
 * provisions a default organization, and (optionally) seeds it with a
 * batch of teammate invitations. Once an owner exists this route becomes
 * inert and `__root` will redirect away.
 */
export const Route = createFileRoute('/setup')({
  component: SetupPage,
});

interface InviteRow {
  email: string;
  role: 'owner' | 'admin' | 'member';
}

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function SetupPage() {
  const { t } = useObjectTranslation();
  const navigate = useNavigate();
  const client = useClient() as any;
  const { user, refresh } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [bootstrapped, setBootstrapped] = useState<boolean | null>(null);

  // Probe bootstrap-status on mount via the SDK. If an owner already exists,
  // this page shouldn't be reachable — bounce back to /login.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { hasOwner } = await client.auth.bootstrapStatus();
        if (!cancelled) setBootstrapped(hasOwner);
      } catch {
        if (!cancelled) setBootstrapped(false);
      }
    })();
    return () => { cancelled = true; };
  }, [client]);

  useEffect(() => {
    if (bootstrapped === true && !user) {
      navigate({ to: '/login', replace: true });
    }
  }, [bootstrapped, user, navigate]);

  useEffect(() => {
    if (user) {
      // Already authenticated — hand off to the platform home.
      window.location.assign('/');
    }
  }, [user]);

  // Auto-derive slug from name unless the user has manually edited it.
  useEffect(() => {
    if (!slugTouched) setOrgSlug(slugify(orgName));
  }, [orgName, slugTouched]);

  const addInvite = () => setInvites((rows) => [...rows, { email: '', role: 'member' }]);
  const removeInvite = (idx: number) => setInvites((rows) => rows.filter((_, i) => i !== idx));
  const updateInvite = (idx: number, patch: Partial<InviteRow>) =>
    setInvites((rows) => rows.map((row, i) => (i === idx ? { ...row, ...patch } : row)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client?.auth) return;
    setSubmitting(true);
    try {
      // 1. Create the owner user (better-auth standard endpoint).
      await client.auth.register({ name, email, password });

      // 2. Refresh local session (sign-up auto-issues a session cookie).
      await refresh();

      // 3. Provision the default organization. better-auth's organization
      //    plugin attaches the calling user as owner automatically.
      const trimmedName = orgName.trim();
      let createdOrgId: string | undefined;
      if (trimmedName) {
        const slug = slugify(orgSlug || trimmedName);
        try {
          const created = await client.organizations.create({ name: trimmedName, slug });
          createdOrgId = (created as any)?.id ?? (created as any)?.data?.id;
          if (createdOrgId) {
            // Make the new org active so the next-step invitations land on it.
            await client.organizations.setActive(createdOrgId).catch(() => {});
          }
        } catch (err) {
          // Non-fatal: user can create an org from the dashboard.
          console.warn('[setup] organization creation failed', err);
        }
      }

      // 4. Fan out teammate invitations through better-auth so the
      //    `sendInvitationEmail` hook fires (or, in dev, the accept URL is
      //    logged). Failures are reported but don't abort setup.
      const validInvites = invites
        .map((row) => ({ ...row, email: row.email.trim() }))
        .filter((row) => row.email);
      if (validInvites.length > 0 && createdOrgId) {
        let failed = 0;
        for (const row of validInvites) {
          try {
            await client.organizations.invite({
              email: row.email,
              role: row.role,
              organizationId: createdOrgId,
            });
          } catch {
            failed++;
          }
        }
        if (failed > 0) {
          toast({
            title: t('auth.setup.invitePartialFailure'),
            description: t('auth.setup.invitePartialFailureDescription', {
              failed,
              total: validInvites.length,
            }),
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('auth.setup.invitesSent', { count: validInvites.length }),
          });
        }
      }

      toast({
        title: t('auth.setup.welcomeTitle'),
        description: t('auth.setup.successDescription'),
      });
      window.location.assign('/');
    } catch (err) {
      toast({
        title: t('auth.setup.failed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (bootstrapped === null) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground/20 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          ObjectStack
        </a>
        <Card>
          <CardHeader className="text-center">
            <ShieldCheck className="mx-auto mb-2 h-10 w-10 text-primary" />
            <CardTitle className="text-xl">{t('auth.setup.welcomeTitle')}</CardTitle>
            <CardDescription>
              {t('auth.setup.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">{t('auth.setup.yourName')}</Label>
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
                <p className="text-xs text-muted-foreground">{t('auth.setup.passwordHint')}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="orgName">{t('auth.setup.orgName')}</Label>
                <Input
                  id="orgName"
                  required
                  placeholder={t('auth.setup.orgNamePlaceholder')}
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="orgSlug">{t('auth.setup.orgSlug')}</Label>
                <Input
                  id="orgSlug"
                  placeholder="acme"
                  value={orgSlug}
                  onChange={(e) => { setSlugTouched(true); setOrgSlug(slugify(e.target.value)); }}
                />
                <p className="text-xs text-muted-foreground">
                  {t('auth.setup.orgSlugHint')}
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-md border bg-muted/40 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t('auth.setup.inviteTeammates')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('auth.setup.inviteTeammatesHint')}
                    </p>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={addInvite}>
                    <Plus className="mr-1 h-3 w-3" />
                    {t('auth.setup.addInvite')}
                  </Button>
                </div>
                {invites.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-2">
                    <UserPlus className="mx-auto mb-1 h-4 w-4" />
                    {t('auth.setup.inviteEmpty')}
                  </p>
                )}
                {invites.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="teammate@example.com"
                      value={row.email}
                      onChange={(e) => updateInvite(idx, { email: e.target.value })}
                      className="flex-1"
                    />
                    <select
                      className="h-9 rounded-md border bg-background px-2 text-sm"
                      value={row.role}
                      onChange={(e) => updateInvite(idx, { role: e.target.value as InviteRow['role'] })}
                    >
                      <option value="member">{t('common.roles.member')}</option>
                      <option value="admin">{t('common.roles.admin')}</option>
                      <option value="owner">{t('common.roles.owner')}</option>
                    </select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInvite(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? t('auth.setup.submitting') : t('auth.setup.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="px-6 text-center text-xs text-muted-foreground">
          {t('auth.setup.footerNote')}
        </p>
      </div>
    </div>
  );
}
