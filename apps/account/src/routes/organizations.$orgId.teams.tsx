// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Organization → Teams — CRUD teams and manage team membership.
 *
 * Teams are sub-groups within an organization. Members can belong to
 * multiple teams. Owner/admin permission is enforced server-side.
 */

import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { MoreVertical, Plus, Trash2, UserMinus, UserPlus, Users2 } from 'lucide-react';
import { useObjectTranslation } from '@object-ui/i18n';
import { useClient } from '@objectstack/client-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers';

export const Route = createFileRoute('/organizations/$orgId/teams')({
  component: OrgTeamsPage,
});

interface Team {
  id: string;
  name: string;
  organizationId: string;
  createdAt?: string;
}

interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
}

function OrgTeamsPage() {
  const { t } = useObjectTranslation();
  const { orgId } = Route.useParams();
  const client = useClient() as any;

  const { members: orgMembers } = useOrganizationMembers(orgId);

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [creating, setCreating] = useState(false);

  // Expanded team → show members
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  const loadTeams = useCallback(async () => {
    if (!client?.organizations?.teams) return;
    setLoading(true);
    try {
      const res = await client.organizations.teams.list(orgId);
      setTeams(res?.teams ?? []);
    } catch {
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [client, orgId]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const loadTeamMembers = useCallback(
    async (teamId: string) => {
      if (!client?.organizations?.teams) return;
      setLoadingMembers(true);
      try {
        const res = await client.organizations.teams.listMembers(teamId);
        setTeamMembers(res?.members ?? []);
      } catch {
        setTeamMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    },
    [client],
  );

  useEffect(() => {
    if (expandedTeam) loadTeamMembers(expandedTeam);
  }, [expandedTeam, loadTeamMembers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setCreating(true);
    try {
      await client.organizations.teams.create({ name: newTeamName.trim(), organizationId: orgId });
      toast({ title: t('teams.created') });
      setCreateDialogOpen(false);
      setNewTeamName('');
      await loadTeams();
    } catch (err) {
      toast({
        title: t('teams.createFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (team: Team) => {
    if (!confirm(t('teams.deleteConfirm', { name: team.name }))) return;
    try {
      await client.organizations.teams.delete({ teamId: team.id, organizationId: orgId });
      toast({ title: t('teams.deleted') });
      if (expandedTeam === team.id) setExpandedTeam(null);
      await loadTeams();
    } catch (err) {
      toast({
        title: t('teams.deleteFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleAddMember = async () => {
    if (!expandedTeam || !selectedUserId) return;
    try {
      await client.organizations.teams.addMember({ teamId: expandedTeam, userId: selectedUserId });
      toast({ title: t('teams.memberAdded') });
      setAddMemberDialogOpen(false);
      setSelectedUserId('');
      await loadTeamMembers(expandedTeam);
    } catch (err) {
      toast({
        title: t('teams.addMemberFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (teamId: string, userId: string) => {
    try {
      await client.organizations.teams.removeMember({ teamId, userId });
      toast({ title: t('teams.memberRemoved') });
      await loadTeamMembers(teamId);
    } catch (err) {
      toast({
        title: t('teams.removeMemberFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  const memberMap = Object.fromEntries(orgMembers.map((m) => [m.userId, m]));
  const teamMemberUserIds = new Set(teamMembers.map((tm) => tm.userId));
  const availableMembers = orgMembers.filter((m) => !teamMemberUserIds.has(m.userId));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                {t('teams.title', { count: teams.length })}
              </CardTitle>
              <CardDescription>{t('teams.description')}</CardDescription>
            </div>
            <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('teams.create')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}
          {!loading && teams.length === 0 && (
            <div className="text-center py-8">
              <Users2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">{t('teams.empty')}</p>
            </div>
          )}
          {!loading && teams.length > 0 && (
            <div className="divide-y">
              {teams.map((team) => (
                <div key={team.id}>
                  <div className="flex items-center justify-between py-3">
                    <button
                      type="button"
                      className="flex-1 text-left"
                      onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                    >
                      <div className="font-medium text-sm">{team.name}</div>
                      {team.createdAt && (
                        <div className="text-xs text-muted-foreground">
                          {new Date(team.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(team)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('teams.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {expandedTeam === team.id && (
                    <div className="pb-3 pl-4 border-l-2 ml-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">
                          {t('teams.members', { count: teamMembers.length })}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAddMemberDialogOpen(true)}
                        >
                          <UserPlus className="mr-1 h-3 w-3" />
                          {t('teams.addMember')}
                        </Button>
                      </div>
                      {loadingMembers && <Skeleton className="h-8 w-full" />}
                      {!loadingMembers && teamMembers.length === 0 && (
                        <p className="text-xs text-muted-foreground">{t('teams.noMembers')}</p>
                      )}
                      {!loadingMembers &&
                        teamMembers.map((tm) => {
                          const member = memberMap[tm.userId];
                          return (
                            <div key={tm.id} className="flex items-center justify-between py-1">
                              <span className="text-sm">
                                {member?.user?.name || member?.user?.email || tm.userId}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => handleRemoveMember(team.id, tm.userId)}
                              >
                                <UserMinus className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Team Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('teams.createTitle')}</DialogTitle>
            <DialogDescription>{t('teams.createDescription')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">{t('teams.nameLabel')}</Label>
                <Input
                  id="team-name"
                  required
                  placeholder={t('teams.namePlaceholder')}
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setCreateDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? t('common.saving') : t('teams.create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Member to Team Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('teams.addMemberTitle')}</DialogTitle>
            <DialogDescription>{t('teams.addMemberDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('teams.selectMember')}</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('teams.selectMemberPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.user?.name || m.user?.email || m.userId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAddMember} disabled={!selectedUserId}>
              {t('teams.addMember')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
