// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * GlobalSidebar
 *
 * Top-level navigation shell rendered on routes that are NOT scoped to a
 * specific package (i.e. outside `/$package/*` and
 * `/environments/:envId/:package/*`). Provides stable entry points to
 * organizations, environments, packages, and the library of templates &
 * examples — mirroring the v0.app-style left rail.
 *
 * When the user drills into a package, the package-scoped `AppSidebar`
 * takes over instead. The two sidebars are mutually exclusive and share
 * the same `SidebarProvider` in `routes/__root.tsx`.
 */

import { useMemo } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
  Building2,
  Check,
  ChevronsUpDown,
  Plus,
  Home,
  Boxes,
  Package as PackageIcon,
  LayoutTemplate,
  Sparkles,
  Settings,
  Terminal,
  MapPin,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOrganizations, useSession } from '@/hooks/useSession';
import { useEnvironments } from '@/hooks/useEnvironments';
import { toast } from '@/hooks/use-toast';

const MAX_ENV_ITEMS = 6;

/** Header: active organization + switcher. */
function OrgHeader() {
  const { organizations, loading, reload } = useOrganizations();
  const { session, setActiveOrganization } = useSession();
  const activeId = session?.activeOrganizationId ?? undefined;
  const active = useMemo(
    () => organizations.find((o) => o.id === activeId) ?? null,
    [organizations, activeId],
  );

  const handleSelect = async (id: string) => {
    if (id === activeId) return;
    try {
      await setActiveOrganization(id);
      await reload();
      toast({ title: 'Organization switched' });
    } catch (err) {
      toast({
        title: 'Failed to switch organization',
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <SidebarHeader className="border-b">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {active?.name ?? (loading ? 'Loading…' : 'Select organization')}
                  </span>
                  {active?.slug && (
                    <span className="truncate text-xs text-muted-foreground">
                      {active.slug}
                    </span>
                  )}
                </div>
                <ChevronsUpDown className="ml-auto size-4 opacity-60" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
              align="start"
              side="bottom"
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Organizations
              </DropdownMenuLabel>
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSelect(org.id);
                  }}
                  className="gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{org.name}</div>
                    {org.slug && (
                      <code className="font-mono text-[11px] text-muted-foreground">
                        {org.slug}
                      </code>
                    )}
                  </div>
                  {org.id === activeId && (
                    <Check className="size-3.5 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/orgs/new" className="gap-2">
                  <Plus className="size-3.5" />
                  New organization…
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/orgs" className="gap-2 text-muted-foreground">
                  Manage organizations
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefix?: string;
}

const WORKSPACE_ITEMS: NavItem[] = [
  { label: 'Home', to: '/', icon: Home, matchPrefix: '/' },
  { label: 'Organizations', to: '/orgs', icon: Building2, matchPrefix: '/orgs' },
];

const PACKAGE_ITEMS: NavItem[] = [
  { label: 'Packages', to: '/packages', icon: PackageIcon, matchPrefix: '/packages' },
  {
    label: 'API Console',
    to: '/api-console',
    icon: Terminal,
    matchPrefix: '/api-console',
  },
];

const LIBRARY_ITEMS: NavItem[] = [
  { label: 'Templates', to: '/templates', icon: LayoutTemplate, matchPrefix: '/templates' },
  { label: 'Examples', to: '/examples', icon: Sparkles, matchPrefix: '/examples' },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.matchPrefix === '/') return pathname === '/';
  if (!item.matchPrefix) return pathname === item.to;
  return pathname === item.matchPrefix || pathname.startsWith(item.matchPrefix + '/');
}

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton asChild isActive={isActive(pathname, item)}>
                  <Link to={item.to}>
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function EnvironmentsSection({ pathname }: { pathname: string }) {
  const { environments, loading } = useEnvironments();
  const envsActive =
    pathname === '/environments' || pathname.startsWith('/environments/');

  const shown = environments.slice(0, MAX_ENV_ITEMS);
  const hasMore = environments.length > MAX_ENV_ITEMS;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Environments</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={envsActive && shown.length === 0}>
              <Link to="/environments">
                <Boxes className="size-4" />
                <span>All environments</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {loading && environments.length === 0 && (
            <>
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
            </>
          )}
          {shown.length > 0 && (
            <SidebarMenuSub>
              {shown.map((env) => {
                const href = `/environments/${env.id}`;
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                  <SidebarMenuSubItem key={env.id}>
                    <SidebarMenuSubButton asChild isActive={active}>
                      <Link
                        to="/environments/$environmentId"
                        params={{ environmentId: env.id }}
                      >
                        <MapPin className="size-3.5 opacity-60" />
                        <span className="truncate">
                          {env.displayName || env.name || env.id}
                        </span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
              {hasMore && (
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <Link to="/environments">
                      <span className="text-muted-foreground">
                        View all ({environments.length})…
                      </span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )}
            </SidebarMenuSub>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function GlobalSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { session } = useSession();
  const activeOrgId = session?.activeOrganizationId ?? undefined;

  return (
    <Sidebar collapsible="icon">
      <OrgHeader />
      <SidebarContent>
        <NavSection label="Workspace" items={WORKSPACE_ITEMS} pathname={pathname} />
        <EnvironmentsSection pathname={pathname} />
        <NavSection label="Packages" items={PACKAGE_ITEMS} pathname={pathname} />
        <NavSection label="Library" items={LIBRARY_ITEMS} pathname={pathname} />
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === `/orgs/${activeOrgId}`}>
                  {activeOrgId ? (
                    <Link to="/orgs/$orgId" params={{ orgId: activeOrgId }}>
                      <Settings className="size-4" />
                      <span>Settings</span>
                    </Link>
                  ) : (
                    <Link to="/orgs">
                      <Settings className="size-4" />
                      <span>Settings</span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
