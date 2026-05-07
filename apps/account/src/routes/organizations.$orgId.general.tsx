// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Organization → General — editable details (owner/admin only) plus the
 * danger zone.
 *
 * Permission model: only members with role `owner` or `admin` can edit
 * the name/slug/logo or delete the organization. The form is rendered
 * read-only for everyone else; the server still enforces the same rule.
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Trash2, Save } from 'lucide-react';
import { useObjectTranslation } from '@object-ui/i18n';
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
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  useOrganizations,
  useSession,
  useDeleteOrganization,
  useUpdateOrganization,
} from '@/hooks/useSession';
import { useOrganizationMembers, useOrganizationInvitations } from '@/hooks/useOrganizationMembers';

export const Route = createFileRoute('/organizations/$orgId/general')({
  component: OrgGeneralPage,
});

function OrgGeneralPage() {
  const { t } = useObjectTranslation();
  const { orgId } = Route.useParams();
  const navigate = useNavigate();
  const { organizations } = useOrganizations();
  const { session, user, setActiveOrganization } = useSession();
  const org = organizations.find((o) => o.id === orgId);
  const { members } = useOrganizationMembers(orgId);
  const { invitations } = useOrganizationInvitations(orgId);
  const { remove: deleteOrganization, deleting: deletingOrg } = useDeleteOrganization();
  const { update: updateOrganization, updating } = useUpdateOrganization();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Hydrate the edit form whenever the org snapshot changes.
  useEffect(() => {
    setName(org?.name ?? '');
    setSlug(org?.slug ?? '');
    setLogo(org?.logo ?? '');
  }, [org?.id, org?.name, org?.slug, org?.logo]);

  const isActive = session?.activeOrganizationId === orgId;
  const pendingInvitations = invitations.filter((i) => i.status === 'pending');

  // Permission check — derived from the members list.
  const myMembership = user ? members.find((m) => m.userId === user.id) : undefined;
  const myRole = myMembership?.role ?? null;
  const canEdit = myRole === 'owner' || myRole === 'admin';

  const dirty =
    canEdit &&
    org != null &&
    (name.trim() !== (org.name ?? '') ||
      slug.trim() !== (org.slug ?? '') ||
      logo.trim() !== (org.logo ?? ''));

  const handleSetActive = async () => {
    try {
      await setActiveOrganization(orgId);
      toast({ title: t('organizations.general.switched') });
    } catch (err) {
      toast({
        title: t('organizations.general.switchFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!org || !canEdit || !dirty) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast({
        title: t('organizations.general.nameRequired'),
        variant: 'destructive',
      });
      return;
    }
    try {
      await updateOrganization(orgId, {
        name: trimmedName,
        slug: slug.trim() || undefined,
        logo: logo.trim() || undefined,
      });
      toast({ title: t('organizations.general.updated') });
    } catch (err) {
      toast({
        title: t('organizations.general.updateFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setName(org?.name ?? '');
    setSlug(org?.slug ?? '');
    setLogo(org?.logo ?? '');
  };

  const handleDelete = async () => {
    if (!org) return;
    if (deleteConfirmText !== org.name) {
      toast({
        title: t('organizations.general.confirmationMismatch'),
        description: t('organizations.general.confirmationHint', { name: org.name }),
        variant: 'destructive',
      });
      return;
    }
    try {
      const result = await deleteOrganization(orgId);
      const warnings = (result as any)?.warnings as string[] | undefined;
      const deletedProjects = (result as any)?.deletedProjects ?? 0;
      toast({
        title: t('organizations.general.deleted'),
        description: warnings?.length
          ? t('organizations.general.deletedWithWarnings', {
              deletedProjects,
              warning: warnings[0],
              extraCount: Math.max(warnings.length - 1, 0),
            })
          : t('organizations.general.deletedDescription', {
              name: org.name,
              deletedProjects,
            }),
        variant: warnings?.length ? 'destructive' : undefined,
      });
      setDeleteDialogOpen(false);
      setDeleteConfirmText('');
      navigate({ to: '/organizations' });
    } catch (err) {
      toast({
        title: t('organizations.general.deleteFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isActive && <Badge variant="outline">{t('organizations.active')}</Badge>}
          {myRole && (
            <Badge variant="secondary" className="capitalize">
              {t(`common.roles.${myRole}`)}
            </Badge>
          )}
        </div>
        {!isActive && (
          <Button size="sm" variant="outline" onClick={handleSetActive}>
            {t('organizations.general.setActive')}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('organizations.general.detailsTitle')}</CardTitle>
          <CardDescription>
            {canEdit
              ? t('organizations.general.detailsDescription')
              : t('organizations.general.detailsReadOnly')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">{t('organizations.new.name')}</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canEdit || updating}
              placeholder={t('organizations.general.namePlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-slug">{t('organizations.new.slug')}</Label>
            <Input
              id="org-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={!canEdit || updating}
              placeholder={t('organizations.general.slugPlaceholder')}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {t('organizations.general.slugHint')}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-logo">{t('organizations.general.logo')}</Label>
            <Input
              id="org-logo"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              disabled={!canEdit || updating}
              placeholder={t('organizations.general.logoPlaceholder')}
            />
          </div>
          <div className="flex justify-between border-t pt-4 text-xs">
            <span className="text-muted-foreground">{t('organizations.general.organizationId')}</span>
            <code className="font-mono">{orgId}</code>
          </div>
        </CardContent>
        {canEdit && (
          <CardContent className="flex justify-end gap-2 border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={!dirty || updating}
            >
              {t('organizations.general.reset')}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!dirty || updating}>
              <Save className="mr-2 h-4 w-4" />
              {updating ? t('common.saving') : t('organizations.general.save')}
            </Button>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('organizations.general.overviewTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('organizations.general.members')}</span>
            <span>{members.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('organizations.general.pendingInvitations')}</span>
            <span>{pendingInvitations.length}</span>
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base text-destructive">{t('organizations.general.dangerTitle')}</CardTitle>
            <CardDescription>
              {t('organizations.general.dangerDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deletingOrg}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('organizations.general.delete')}
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeleteConfirmText('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">{t('organizations.general.deleteDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('organizations.general.deleteDialogDescription', { name: org?.name ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">{t('organizations.general.deleteDialogLabel', { name: org?.name ?? '' })}</Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={org?.name ?? ''}
                disabled={deletingOrg}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingOrg}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletingOrg || !org || deleteConfirmText !== org.name}
            >
              {deletingOrg ? t('organizations.general.deleting') : t('organizations.general.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
