// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Account → Invitations inbox — shows pending invitations addressed to
 * the current user across all organizations. User can accept or reject.
 */

import { createFileRoute } from '@tanstack/react-router';
import { Check, Inbox, X } from 'lucide-react';
import { useObjectTranslation } from '@object-ui/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useMyInvitations } from '@/hooks/useOrganizationMembers';

export const Route = createFileRoute('/account/invitations')({
  component: InvitationsPage,
});

function InvitationsPage() {
  const { t } = useObjectTranslation();
  const { invitations, loading, accept, reject } = useMyInvitations();

  const pending = invitations.filter((i) => i.status === 'pending');

  const handleAccept = async (id: string) => {
    try {
      await accept(id);
      toast({ title: t('invitations.accepted') });
    } catch (err) {
      toast({
        title: t('invitations.acceptFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await reject(id);
      toast({ title: t('invitations.rejected') });
    } catch (err) {
      toast({
        title: t('invitations.rejectFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('invitations.title')}</CardTitle>
        <CardDescription>{t('invitations.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {!loading && pending.length === 0 && (
          <div className="text-center py-8">
            <Inbox className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">{t('invitations.empty')}</p>
          </div>
        )}
        {!loading && pending.length > 0 && (
          <div className="divide-y">
            {pending.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {inv.organizationId}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {t(`common.roles.${inv.role}`)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {t('invitations.expires', {
                        date: new Date(inv.expiresAt).toLocaleDateString(),
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAccept(inv.id)}>
                    <Check className="mr-1 h-4 w-4" />
                    {t('invitations.accept')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(inv.id)}>
                    <X className="mr-1 h-4 w-4" />
                    {t('invitations.reject')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
