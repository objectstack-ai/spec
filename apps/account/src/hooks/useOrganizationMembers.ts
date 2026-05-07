// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * React hooks for organization member and invitation management.
 *
 * All network calls go through `client.organizations.*` (better-auth's
 * organization plugin endpoints). We never read or write `sys_invitation`
 * via the data API directly: better-auth owns the invitation lifecycle
 * (status enum, expiry, dedupe, `sendInvitationEmail` side-effect) and
 * bypassing it produces silently-broken data.
 */

import { useCallback, useEffect, useState } from 'react';
import { useClient } from '@objectstack/client-react';

export interface OrganizationMember {
  /** Row id in `sys_member` — pass this to updateMemberRole / removeMember. */
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

export interface OrganizationInvitation {
  id: string;
  email: string;
  organizationId: string;
  role: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'canceled';
  inviterId: string;
  expiresAt: string;
  createdAt?: string;
  teamId?: string | null;
}

/**
 * Members of an organization. Owner/admin gating is enforced server-side
 * by better-auth; the hook surfaces the raw error so the UI can toast.
 */
export function useOrganizationMembers(organizationId: string | undefined) {
  const client = useClient() as any;
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMembers = useCallback(async () => {
    if (!organizationId || !client?.organizations) return;
    setLoading(true);
    setError(null);
    try {
      const res = await client.organizations.listMembers(organizationId);
      const list = res?.members ?? res?.data?.members ?? (Array.isArray(res) ? res : []);
      setMembers(list);
    } catch (err) {
      setError(err as Error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [client, organizationId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const inviteMember = useCallback(
    async (email: string, role: string = 'member') => {
      if (!organizationId || !client?.organizations) {
        throw new Error('Organization ID or client not available');
      }
      const res = await client.organizations.invite({ email, role, organizationId });
      await loadMembers();
      return res;
    },
    [client, organizationId, loadMembers],
  );

  /**
   * Remove a member. `memberIdOrEmail` is the **member-row id** (or the
   * member's email) — better-auth requires the membership identifier, not
   * the bare userId.
   */
  const removeMember = useCallback(
    async (memberIdOrEmail: string) => {
      if (!organizationId || !client?.organizations?.removeMember) {
        throw new Error('Organization ID or client not available');
      }
      const res = await client.organizations.removeMember(organizationId, { memberIdOrEmail });
      await loadMembers();
      return res;
    },
    [client, organizationId, loadMembers],
  );

  /**
   * Change a member's role. `memberId` is the row id in `sys_member`.
   */
  const updateMemberRole = useCallback(
    async (memberId: string, newRole: string) => {
      if (!organizationId || !client?.organizations?.updateMemberRole) {
        throw new Error('Organization ID or client not available');
      }
      const res = await client.organizations.updateMemberRole(organizationId, {
        memberId,
        role: newRole,
      });
      await loadMembers();
      return res;
    },
    [client, organizationId, loadMembers],
  );

  return {
    members,
    loading,
    error,
    reload: loadMembers,
    inviteMember,
    removeMember,
    updateMemberRole,
  };
}

/**
 * Invitations for a given organization. Always sourced from better-auth's
 * `/organization/list-invitations` — never from a direct query against the
 * `sys_invitation` table.
 */
export function useOrganizationInvitations(organizationId: string | undefined) {
  const client = useClient() as any;
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadInvitations = useCallback(async () => {
    if (!organizationId || !client?.organizations?.invitations) return;
    setLoading(true);
    setError(null);
    try {
      const res = await client.organizations.invitations.list(organizationId);
      const list = res?.invitations ?? res?.data?.invitations ?? (Array.isArray(res) ? res : []);
      setInvitations(list);
    } catch (err) {
      setError(err as Error);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  }, [client, organizationId]);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  const cancelInvitation = useCallback(
    async (invitationId: string) => {
      if (!client?.organizations?.invitations?.cancel) {
        throw new Error('Client not available');
      }
      const res = await client.organizations.invitations.cancel(invitationId);
      await loadInvitations();
      return res;
    },
    [client, loadInvitations],
  );

  /**
   * Re-issue an invitation. better-auth has no first-class resend
   * endpoint, so the SDK implements it as cancel + re-invite. Pass the
   * full invitation row so we can preserve the role.
   */
  const resendInvitation = useCallback(
    async (invitation: OrganizationInvitation) => {
      if (!client?.organizations?.invitations?.resend) {
        throw new Error('Client not available');
      }
      const res = await client.organizations.invitations.resend({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        organizationId: invitation.organizationId,
        teamId: invitation.teamId ?? null,
      });
      await loadInvitations();
      return res;
    },
    [client, loadInvitations],
  );

  return {
    invitations,
    loading,
    error,
    reload: loadInvitations,
    cancelInvitation,
    resendInvitation,
  };
}

/**
 * The current user's incoming invitations across every organisation.
 * Backed by `/organization/list-user-invitations`. Used by the per-user
 * Invitations inbox page.
 */
export function useMyInvitations() {
  const client = useClient() as any;
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!client?.organizations?.invitations?.listMine) return;
    setLoading(true);
    setError(null);
    try {
      const res = await client.organizations.invitations.listMine();
      const list = res?.invitations ?? res?.data?.invitations ?? (Array.isArray(res) ? res : []);
      setInvitations(list);
    } catch (err) {
      setError(err as Error);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    reload();
  }, [reload]);

  const accept = useCallback(
    async (invitationId: string) => {
      const res = await client.organizations.invitations.accept(invitationId);
      await reload();
      return res;
    },
    [client, reload],
  );

  const reject = useCallback(
    async (invitationId: string) => {
      const res = await client.organizations.invitations.reject(invitationId);
      await reload();
      return res;
    },
    [client, reload],
  );

  return { invitations, loading, error, reload, accept, reject };
}
