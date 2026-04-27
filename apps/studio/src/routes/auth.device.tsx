// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';
import { CheckCircle2, GalleryVerticalEnd } from 'lucide-react';

export const Route = createFileRoute('/auth/device')({
  validateSearch: (search: Record<string, unknown>) => ({
    code: (search.code as string) ?? '',
  }),
  component: DeviceAuthPage,
});

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          ObjectStack
        </a>
        <div className="flex flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}

function DeviceAuthPage() {
  const { code } = Route.useSearch();
  const { user, loading } = useSession();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState('');

  if (!code) {
    return (
      <PageShell>
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Invalid Request</CardTitle>
            <CardDescription>No device code provided. Please re-run the CLI command.</CardDescription>
          </CardHeader>
        </Card>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell>
        <Card>
          <CardHeader className="text-center">
            <CardDescription>Loading…</CardDescription>
          </CardHeader>
        </Card>
      </PageShell>
    );
  }

  if (!user) {
    return <Navigate to="/login" search={{ redirect: `/auth/device?code=${encodeURIComponent(code)}` }} />;
  }

  if (approved) {
    return (
      <PageShell>
        <Card>
          <CardHeader className="text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
            <CardTitle>CLI Authorized</CardTitle>
            <CardDescription>You can close this tab.</CardDescription>
          </CardHeader>
        </Card>
      </PageShell>
    );
  }

  const handleApprove = async () => {
    setError('');
    setSubmitting(true);
    try {
      const sessionRes = await fetch('/api/v1/auth/get-session', { credentials: 'include' });
      const sessionData = await sessionRes.json() as any;
      const token = sessionData?.session?.token;
      if (!token) throw new Error('No active session');

      const res = await fetch('/api/v1/auth/device/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, token }),
      });
      const data = await res.json() as any;
      if (!data.success) throw new Error(data.error?.message ?? 'Approval failed');

      setApproved(true);
      toast({ title: 'CLI login approved', description: 'The CLI has been authenticated.' });
    } catch (err: any) {
      setError(err?.message ?? 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>CLI Login Request</CardTitle>
          <CardDescription>Approve CLI access for {user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border bg-background px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Device Code</p>
            <p className="font-mono font-semibold tracking-widest text-lg">{code}</p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Logged in as <span className="font-medium text-foreground">{user.email}</span>
            </p>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button onClick={handleApprove} className="w-full" disabled={submitting}>
              {submitting ? 'Approving…' : 'Approve CLI Access'}
            </Button>
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                onClick={() => navigate({ to: '/' })}
              >
                Cancel
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
