// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { LogOut, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

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
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/v1/auth/list-sessions', { credentials: 'include' });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setSessions((data as any)?.sessions ?? data ?? []);
    } catch (err) {
      toast({
        title: 'Failed to load sessions',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleRevoke = async (token: string) => {
    setRevoking(token);
    try {
      const res = await fetch('/api/v1/auth/revoke-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any)?.message || `Request failed: ${res.status}`);
      }
      toast({ title: 'Session revoked' });
      await loadSessions();
    } catch (err) {
      toast({
        title: 'Failed to revoke session',
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
      const res = await fetch('/api/v1/auth/revoke-other-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any)?.message || `Request failed: ${res.status}`);
      }
      toast({ title: 'Other sessions revoked' });
      await loadSessions();
    } catch (err) {
      toast({
        title: 'Failed to revoke sessions',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setRevokingOthers(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Active sessions</CardTitle>
            <CardDescription>Manage devices that are signed in to your account.</CardDescription>
          </div>
          {sessions.length > 1 && (
            <Button variant="outline" size="sm" onClick={handleRevokeOthers} disabled={revokingOthers}>
              {revokingOthers ? 'Revoking…' : 'Revoke all others'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-xs text-muted-foreground">Loading sessions…</p>}
        {!loading && sessions.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">No active sessions found.</p>
        )}
        {!loading && sessions.length > 0 && (
          <div className="divide-y">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm font-medium">
                      {s.userAgent ?? 'Unknown device'}
                    </span>
                  </div>
                  <div className="mt-1 space-x-3 text-xs text-muted-foreground">
                    {s.ipAddress && <span>{s.ipAddress}</span>}
                    <span>Expires {new Date(s.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevoke(s.token)}
                  disabled={revoking === s.token}
                  className="ml-3 shrink-0"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
