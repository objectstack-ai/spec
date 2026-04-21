// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * GlobalSidebar
 *
 * Top-level navigation shell rendered on routes that are NOT scoped to a
 * specific package — i.e. the home page, organization management, the
 * environments list, an environment's overview page, and the per-environment
 * packages management page.
 *
 * The sidebar deliberately exposes only two navigation entries:
 *
 *   1. **Environments** — links to `/environments` (browse / pick an env).
 *   2. **Packages** — links to `/environments/:envId/packages`. Disabled
 *      until the user has selected an environment.
 *
 * Once the user drills into a specific package
 * (`/environments/:envId/:package/*`), the package-scoped {@link AppSidebar}
 * takes over instead. The two sidebars are mutually exclusive and share the
 * same `SidebarProvider` in `routes/__root.tsx`.
 *
 * Organization switching is now handled in the TopBar, so this sidebar only
 * focuses on functional navigation.
 */

import { useMemo } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
  Boxes,
  Globe,
  Package as PackageIcon,
  Settings,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useSession } from '@/hooks/useSession';

/**
 * Extract the `:envId` segment from the current pathname when the user is
 * anywhere under `/environments/:envId(...)`. Returns undefined on the
 * environments list page (`/environments`) or any non-environment route.
 */
function useActiveEnvironmentId(): string | undefined {
  const location = useLocation();
  return useMemo(() => {
    const m = location.pathname.match(/^\/environments\/([^/]+)/);
    return m?.[1];
  }, [location.pathname]);
}

export function GlobalSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { session } = useSession();
  const activeOrgId = session?.activeOrganizationId ?? undefined;
  const envId = useActiveEnvironmentId();

  const envsActive = pathname === '/environments';
  const packagesHref = envId ? `/environments/${envId}/packages` : undefined;
  const packagesActive = !!packagesHref && pathname === packagesHref;
  const apiConsoleActive = pathname === '/api-console';

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Environments — single-row entry, no expansion. */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={envsActive} tooltip="Environments">
                  <Link to="/environments">
                    <Boxes className="size-4" />
                    <span>Environments</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Packages — single-row entry. Depends on a selected environment;
                  disabled and tooltipped when none is selected. */}
              <SidebarMenuItem>
                {envId ? (
                  <SidebarMenuButton
                    asChild
                    isActive={packagesActive}
                    tooltip="Packages"
                  >
                    <Link
                      to="/environments/$environmentId/packages"
                      params={{ environmentId: envId }}
                    >
                      <PackageIcon className="size-4" />
                      <span>Packages</span>
                    </Link>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    disabled
                    aria-disabled="true"
                    tooltip="Select an environment first"
                    className="cursor-not-allowed opacity-50"
                  >
                    <PackageIcon className="size-4" />
                    <span>Packages</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>

              {/* API Console — always available; the console discovers
                  endpoints dynamically from the active client/environment. */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={apiConsoleActive} tooltip="API Console">
                  <Link to="/api-console">
                    <Globe className="size-4" />
                    <span>API Console</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/orgs/${activeOrgId}`}
                  tooltip="Settings"
                >
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
