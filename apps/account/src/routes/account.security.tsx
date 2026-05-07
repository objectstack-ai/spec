// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useObjectTranslation } from '@object-ui/i18n';
import { useClient } from '@objectstack/client-react';
import { AlertTriangle, Mail, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';

export const Route = createFileRoute('/account/security')({
  component: SecurityPage,
});

function SecurityPage() {
  const { t } = useObjectTranslation();
  const client = useClient() as any;
  const navigate = useNavigate();
  const { user, logout } = useSession();

  // ── change password ───────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [revokeOthers, setRevokeOthers] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── change email ──────────────────────────────────────────────────
  const [newEmail, setNewEmail] = useState('');
  const [changingEmail, setChangingEmail] = useState(false);

  // ── delete account ────────────────────────────────────────────────
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: t('security.passwordsMismatch'), variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await client.auth.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: revokeOthers,
      });
      toast({ title: t('security.changed') });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast({
        title: t('security.changeFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || newEmail === user?.email) return;
    setChangingEmail(true);
    try {
      await client.auth.changeEmail({
        newEmail,
        callbackURL: window.location.origin + '/login',
      });
      toast({
        title: t('security.email.requested'),
        description: t('security.email.checkInbox', { email: newEmail }),
      });
      setNewEmail('');
    } catch (err) {
      toast({
        title: t('security.email.requestFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setChangingEmail(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.email) {
      toast({
        title: t('security.delete.confirmationMismatch'),
        description: t('security.delete.confirmationHint', { email: user?.email ?? '' }),
        variant: 'destructive',
      });
      return;
    }
    setDeleting(true);
    try {
      await client.auth.deleteUser({ password: deletePassword });
      toast({ title: t('security.delete.success') });
      try { await logout(); } catch { /* already gone */ }
      navigate({ to: '/login', replace: true });
    } catch (err) {
      toast({
        title: t('security.delete.failed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('security.title')}</CardTitle>
          <CardDescription>{t('security.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current-password">{t('security.currentPassword')}</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">{t('security.newPassword')}</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-new-password">{t('security.confirmPassword')}</Label>
              <Input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={revokeOthers}
                onChange={(e) => setRevokeOthers(e.target.checked)}
              />
              {t('security.revokeOtherSessions')}
            </label>
            <Button type="submit" disabled={saving}>
              {saving ? t('common.saving') : t('security.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {t('security.email.title')}
          </CardTitle>
          <CardDescription>{t('security.email.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangeEmail} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current-email">{t('security.email.current')}</Label>
              <Input id="current-email" value={user?.email ?? ''} disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-email">{t('security.email.new')}</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={t('security.email.placeholder')}
                required
              />
            </div>
            <Button type="submit" disabled={changingEmail || !newEmail || newEmail === user?.email}>
              {changingEmail ? t('common.saving') : t('security.email.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {t('security.delete.title')}
          </CardTitle>
          <CardDescription>{t('security.delete.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t('security.delete.cta')}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('security.delete.dialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('security.delete.dialogDescription', { email: user?.email ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="delete-password">{t('security.delete.password')}</Label>
              <Input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="delete-confirm">
                {t('security.delete.typeEmail', { email: user?.email ?? '' })}
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={user?.email ?? ''}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirm !== user?.email}
            >
              {deleting ? t('common.saving') : t('security.delete.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
