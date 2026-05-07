// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Organization → Members — list members + manage pending invitations.
 *
 * Pro features: inline role change, leave org, resend invitation,
 * copy invite link, bulk invite (multi-email), expiry display.
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Clock,
  Copy,
  LogOut,
  Mail,
  MoreVertical,
  RefreshCw,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useSession, useOrganizations } from '@/hooks/useSession';
import {
  useOrganizationMembers,
  useOrganizationInvitations,
} from '@/hooks/useOrganizationMembers';
import { useClient } from '@objectstack/client-react';

export const Route = createFileRoute('/organizations/$orgId/members')({
  component: OrgMembersPage,
});

function OrgMembersPage() {
  const { t } = useObjectTranslation();
  const { orgId } = Route.useParams();
  const { organizations } = useOrganizations();
  const { user } = useSession();
  const client = useClient() as any;
  const org = organizations.find((o) => o.id === orgId);

  const {
    members,
    loading: loadingMembers,
    inviteMember,
    removeMember,
    updateMemberRole,
  } = useOrganizationMembers(orgId);

  const {
    invitations,
    loading: loadingInvitations,
    cancelInvitation,
    resendInvitation,
  } = useOrganizationInvitations(orgId);

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const pendingInvitations = invitations.filter((i) => i.status === 'pending');
  const currentMember = members.find((m) => m.userId === user?.id);
  const isOwnerOrAdmin = currentMember?.role === 'owner' || currentMember?.role === 'admin';

  const handleInviteMember = async () => {
    const emails = bulkMode
      ? bulkEmails
          .split(/[,;\n]+/)
          .map((e) => e.trim())
          .filter(Boolean)
      : [inviteEmail.trim()].filter(Boolean);

    if (emails.length === 0) {
      toast({
        title: t('organizations.members.emailRequired'),
        variant: 'destructive',
      });
      return;
    }
    setInviting(true);
    let failed = 0;
    try {
      for (const email of emails) {
        try {
          await inviteMember(email, inviteRole);
        } catch {
          failed++;
        }
      }
      if (failed > 0 && failed < emails.length) {
        toast({
          title: t('organizations.members.invitePartialSuccess', {
            sent: emails.length - failed,
            failed,
          }),
          variant: 'destructive',
        });
      } else if (failed === emails.length) {
        toast({
          title: t('organizations.members.inviteFailed'),
          variant: 'destructive',
        });
      } else {
        toast({ title: t('organizations.members.invitationSent') });
      }
      setInviteDialogOpen(false);
      setInviteEmail('');
      setBulkEmails('');
      setInviteRole('member');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(t('organizations.members.removeConfirm', { name: memberName }))) return;
    try {
      await removeMember(memberId);
      toast({ title: t('organizations.members.memberRemoved') });
    } catch (err) {
      toast({
        title: t('organizations.members.removeFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await updateMemberRole(memberId, newRole);
      toast({ title: t('organizations.members.roleUpdated') });
    } catch (err) {
      toast({
        title: t('organizations.members.roleUpdateFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleLeaveOrg = async () => {
    if (!confirm(t('organizations.members.leaveConfirm', { org: org?.name ?? orgId }))) return;
    setLeaving(true);
    try {
      await client.organizations.leave(orgId);
      toast({ title: t('organizations.members.leftOrg') });
      window.location.assign('/');
    } catch (err) {
      toast({
        title: t('organizations.members.leaveFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLeaving(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string, email: string) => {
    if (!confirm(t('organizations.members.cancelConfirm', { email }))) return;
    try {
      await cancelInvitation(invitationId);
      toast({ title: t('organizations.members.invitationCanceled') });
    } catch (err) {
      toast({
        title: t('organizations.members.cancelFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleResendInvitation = async (inv: (typeof invitations)[0]) => {
    try {
      await resendInvitation(inv);
      toast({ title: t('organizations.members.invitationResent') });
    } catch (err) {
      toast({
        title: t('organizations.members.resendFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  const copyInviteLink = async (invitationId: string) => {
    const url = `${window.location.origin}/accept-invitation/${invitationId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: t('organizations.members.linkCopied') });
    } catch {
      toast({ title: t('organizations.members.linkCopyFailed'), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                {t('organizations.members.title', { count: members.length })}
              </CardTitle>
              <CardDescription>{t('organizations.members.description')}</CardDescription>
            </div>
            <div className="flex gap-2">
              {currentMember && currentMember.role !== 'owner' && (
                <Button size="sm" variant="outline" onClick={handleLeaveOrg} disabled={leaving}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('organizations.members.leave')}
                </Button>
              )}
              {isOwnerOrAdmin && (
                <Button size="sm" onClick={() => setInviteDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t('organizations.members.invite')}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingMembers && (
            <p className="text-xs text-muted-foreground">{t('organizations.members.loadingMembers')}</p>
          )}
          {!loadingMembers && members.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                {t('organizations.members.empty')}
              </p>
            </div>
          )}
          {!loadingMembers && members.length > 0 && (
            <div className="divide-y">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3">
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {m.user?.name || m.user?.email || m.userId}
                      {m.userId === user?.id && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {t('organizations.members.you')}
                        </Badge>
                      )}
                    </div>
                    {m.user?.email && (
                      <div className="text-xs text-muted-foreground">{m.user.email}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwnerOrAdmin && m.role !== 'owner' && m.userId !== user?.id ? (
                      <Select
                        value={m.role}
                        onValueChange={(v) => handleRoleChange(m.id, v)}
                      >
                        <SelectTrigger className="h-7 w-24 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">{t('common.roles.admin')}</SelectItem>
                          <SelectItem value="member">{t('common.roles.member')}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {t(`common.roles.${m.role ?? 'member'}`)}
                      </Badge>
                    )}
                    {isOwnerOrAdmin && m.role !== 'owner' && m.userId !== user?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              handleRemoveMember(m.id, m.user?.name || m.user?.email || m.userId)
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('organizations.members.removeMember')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                {t('organizations.members.pendingTitle', { count: pendingInvitations.length })}
              </CardTitle>
              <CardDescription>{t('organizations.members.pendingDescription')}</CardDescription>
            </div>
            {isOwnerOrAdmin && (
              <Button size="sm" variant="outline" onClick={() => setInviteDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                {t('organizations.members.sendInvitation')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingInvitations && (
            <p className="text-xs text-muted-foreground">{t('organizations.members.loadingInvitations')}</p>
          )}
          {!loadingInvitations && pendingInvitations.length === 0 && (
            <div className="text-center py-8">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">{t('organizations.members.noPending')}</p>
            </div>
          )}
          {!loadingInvitations && pendingInvitations.length > 0 && (
            <div className="divide-y">
              {pendingInvitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-3">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{inv.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {t(`common.roles.${inv.role}`)}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t('organizations.members.expires', {
                          date: new Date(inv.expiresAt).toLocaleDateString(),
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title={t('organizations.members.copyLink')}
                      onClick={() => copyInviteLink(inv.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title={t('organizations.members.resend')}
                      onClick={() => handleResendInvitation(inv)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title={t('organizations.members.cancel')}
                      onClick={() => handleCancelInvitation(inv.id, inv.email)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog — single or bulk mode */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('organizations.members.inviteDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('organizations.members.inviteDialogDescription', { organization: org?.name ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={bulkMode ? 'outline' : 'default'}
                size="sm"
                onClick={() => setBulkMode(false)}
              >
                {t('organizations.members.singleInvite')}
              </Button>
              <Button
                type="button"
                variant={bulkMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBulkMode(true)}
              >
                {t('organizations.members.bulkInvite')}
              </Button>
            </div>
            {bulkMode ? (
              <div className="space-y-2">
                <Label>{t('organizations.members.bulkEmails')}</Label>
                <Textarea
                  placeholder={t('organizations.members.bulkEmailsPlaceholder')}
                  rows={5}
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {t('organizations.members.bulkEmailsHint')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="invite-email">{t('organizations.members.email')}</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder={t('organizations.members.emailPlaceholder')}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="role">{t('organizations.members.role')}</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">{t('common.roles.owner')}</SelectItem>
                  <SelectItem value="admin">{t('common.roles.admin')}</SelectItem>
                  <SelectItem value="member">{t('common.roles.member')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
              disabled={inviting}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleInviteMember} disabled={inviting}>
              {inviting ? t('organizations.members.sending') : t('organizations.members.sendInvitation')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
