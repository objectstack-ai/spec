// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * EnvironmentSwitcher
 *
 * Power Platform-style environment picker, anchored on the left of the
 * site header. Lists every environment visible to the current session,
 * grouped by `envType`, and navigates to `/environments/:id/overview`
 * when one is selected. Also exposes a "+ New environment…" footer that
 * opens {@link NewEnvironmentDialog}.
 *
 * The switcher is intentionally stateless with respect to the active
 * environment — the URL is the source of truth, read via
 * `useParams({ strict: false })`. Persistence across reloads is handled
 * by `rememberActiveEnvironment()` in `useEnvironments` and is replayed
 * by `useObjectStackClient` during initial client construction.
 *
 * @see docs/adr/0002-environment-database-isolation.md
 */

import { useMemo, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ChevronsUpDown, Layers, Plus, Search, Check } from 'lucide-react';
import type { Environment, EnvironmentType } from '@objectstack/spec/cloud';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEnvironments } from '@/hooks/useEnvironments';
import { NewEnvironmentDialog } from '@/components/new-environment-dialog';
import { EnvironmentBadge } from '@/components/environment-badge';

const ENV_TYPE_ORDER: EnvironmentType[] = [
  'production',
  'staging',
  'sandbox',
  'development',
  'test',
  'preview',
  'trial',
];

const ENV_TYPE_LABEL: Record<EnvironmentType, string> = {
  production: 'Production',
  staging: 'Staging',
  sandbox: 'Sandbox',
  development: 'Development',
  test: 'Test',
  preview: 'Preview',
  trial: 'Trial',
};

export function EnvironmentSwitcher() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { environmentId?: string };
  const activeId = params.environmentId;
  const { environments, loading, reload } = useEnvironments();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const active = useMemo(
    () => environments.find((e) => e.id === activeId) ?? null,
    [environments, activeId],
  );

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? environments.filter(
          (e) =>
            e.slug.toLowerCase().includes(q) ||
            e.displayName.toLowerCase().includes(q) ||
            e.id.toLowerCase().includes(q),
        )
      : environments;
    const map = new Map<EnvironmentType, Environment[]>();
    for (const e of filtered) {
      const arr = map.get(e.envType) ?? [];
      arr.push(e);
      map.set(e.envType, arr);
    }
    return ENV_TYPE_ORDER.filter((t) => map.has(t)).map(
      (t) => [t, map.get(t)!] as const,
    );
  }, [environments, search]);

  const handleSelect = (id: string) => {
    setOpen(false);
    setSearch('');
    navigate({
      to: '/environments/$environmentId',
      params: { environmentId: id },
    });
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 px-2 text-sm font-medium"
          >
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            {active ? (
              <>
                <span className="max-w-[160px] truncate">
                  {active.displayName}
                </span>
                <EnvironmentBadge envType={active.envType} />
              </>
            ) : (
              <span className="text-muted-foreground">
                {loading ? 'Loading environments…' : 'Select environment'}
              </span>
            )}
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[340px] p-0"
          sideOffset={4}
        >
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search environments…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-7 text-sm"
              />
            </div>
          </div>

          <div className="max-h-[340px] overflow-y-auto py-1">
            {environments.length === 0 && !loading && (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                No environments yet.
              </div>
            )}
            {grouped.map(([envType, list]) => (
              <div key={envType}>
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {ENV_TYPE_LABEL[envType]}
                </DropdownMenuLabel>
                {list.map((env) => (
                  <DropdownMenuItem
                    key={env.id}
                    onSelect={(e) => {
                      e.preventDefault();
                      handleSelect(env.id);
                    }}
                    className="flex items-start gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">
                          {env.displayName}
                        </span>
                        {env.isDefault && (
                          <Badge
                            variant="outline"
                            className="h-4 px-1 text-[9px]"
                          >
                            default
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <code className="font-mono">{env.slug}</code>
                        {env.region && <span>· {env.region}</span>}
                        <span>· {env.status}</span>
                      </div>
                    </div>
                    <EnvironmentBadge envType={env.envType} />
                    {env.id === activeId && (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            ))}
          </div>

          <DropdownMenuSeparator className="m-0" />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setOpen(false);
              setCreateOpen(true);
            }}
            className="gap-2 text-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            New environment…
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setOpen(false);
              navigate({ to: '/environments' });
            }}
            className="gap-2 text-sm text-muted-foreground"
          >
            Manage all environments
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NewEnvironmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={async (env) => {
          await reload();
          navigate({
            to: '/environments/$environmentId',
            params: { environmentId: env.id },
          });
        }}
      />
    </>
  );
}
