// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { LogOut, Monitor } from 'lucide-react';
import { useObjectTranslation } from '@object-ui/i18n';
import { useClient } from '@objectstack/client-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';

export const Route = createFileRoute('/account/sessions')({
  component: SessionsPage,
});

interface SessionRecord {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  expiresAt: string;
  token: string;
}

function SessionsPage() {
  const { t } = useObjectTranslation();
  const client = useClient() as any;
  const { session: currentSession } = useSession();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);

  const loadSessions = async () => {
    try {
      const res = await client.auth.sessions.list();
      setSessions((res?.sessions ?? []) as SessionRecord[]);
    } catch (err) {
      toast({
        title: t('sessions.loadFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRevoke = async (token: string) => {
    setRevoking(token);
    try {
      await client.auth.sessions.revoke(token);
      toast({ title: t('sessions.revoked') });
      await loadSessions();
    } catch (err) {
      toast({
        title: t('sessions.revokeFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeOthers = async () => {
    setRevokingOthers(true);
    try {
      await client.auth.sessions.revokeOthers();
      toast({ title: t('sessions.othersRevoked') });
      await loadSessions();
    } catch (err) {
      toast({
        title: t('sessions.revokeOthersFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setRevokingOthers(false);
    }
  };

  const currentToken = currentSession?.token;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{t('sessions.title')}</CardTitle>
            <CardDescription>{t('sessions.description')}</CardDescription>
          </div>
          {sessions.length > 1 && (
            <Button variant="outline" size="sm" onClick={handleRevokeOthers} disabled={revokingOthers}>
              {revokingOthers ? t('sessions.revokingOthers') : t('sessions.revokeOthers')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-xs text-muted-foreground">{t('sessions.loading')}</p>}
        {!loading && sessions.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('sessions.empty')}</p>
        )}
        {!loading && sessions.length > 0 && (
          <div className="divide-y">
            {sessions.map((s) => {
              const isCurrent = currentToken && s.token === currentToken;
              return (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm font-medium">
                        {s.userAgent ?? t('sessions.unknownDevice')}
                      </span>
                      {isCurrent && (
                        <Badge variant="outline" className="border-green-600 text-green-600">
                          {t('sessions.current')}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 space-x-3 text-xs text-muted-foreground">
                      {s.ipAddress && <span>{s.ipAddress}</span>}
                      <span>{t('sessions.expires', { date: new Date(s.expiresAt).toLocaleDateString() })}</span>
                    </div>
                  </div>
                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevoke(s.token)}
                      disabled={revoking === s.token}
                      className="ml-3 shrink-0"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
