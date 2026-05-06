// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * AccountSidebar — global left navigation for the Account portal.
 *
 * Three semantic groups:
 *
 *   Account
 *   ├─ Profile
 *   ├─ Security
 *   ├─ Sessions
 *   └─ Two-Factor
 *
 *   Organization
 *   ├─ Overview        (/organizations)
 *   ├─ General         (/organizations/:id/general — only when an org is active)
 *   └─ Members         (/organizations/:id/members — only when an org is active)
 *
 *   Developer
 *   └─ OAuth Apps      (/account/oauth-applications)
 *
 * The active org's name is intentionally NOT used as a group label —
 * the top-bar OrganizationSwitcher already shows it prominently. When
 * collapsed to icon-only the labels hide automatically.
 */

import { Link, useLocation } from '@tanstack/react-router';
import {
  Building2,
  KeyRound,
  Monitor,
  PanelLeft,
  Settings,
  Shield,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { useObjectTranslation } from '@object-ui/i18n';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { useOrganizations } from '@/hooks/useSession';

interface NavItem {
  to:
    | '/account/profile'
    | '/account/security'
    | '/account/sessions'
    | '/account/two-factor'
    | '/account/oauth-applications'
    | '/organizations';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ACCOUNT_ITEMS: NavItem[] = [
  { to: '/account/profile', label: 'profile', icon: User },
  { to: '/account/security', label: 'security', icon: Shield },
  { to: '/account/sessions', label: 'sessions', icon: Monitor },
  { to: '/account/two-factor', label: 'twoFactor', icon: ShieldCheck },
];

export function AccountSidebar() {
  const { t } = useObjectTranslation();
  const { pathname } = useLocation();
  const { organizations } = useOrganizations();

  // /account on its own redirects to /account/profile, so treat the bare
  // path as the profile page for active-state purposes.
  const normalised = pathname === '/account' ? '/account/profile' : pathname;

  // Detect /organizations/<orgId>/* — used to surface the org-scoped sub-items.
  const orgMatch = pathname.match(/^\/organizations\/([^/]+)(?:\/.*)?$/);
  const activeOrgId =
    orgMatch && organizations.some((o) => o.id === orgMatch[1]) ? orgMatch[1] : null;

  return (
    <Sidebar collapsible="icon" className="h-full">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebar.groups.account')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ACCOUNT_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = normalised === item.to || normalised.startsWith(`${item.to}/`);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={t(`sidebar.items.${item.label}`)}>
                      <Link to={item.to}>
                        <Icon className="size-4" />
                        <span>{t(`sidebar.items.${item.label}`)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebar.groups.organization')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/organizations'}
                  tooltip={t('sidebar.items.overview')}
                >
                  <Link to="/organizations">
                    <Building2 className="size-4" />
                    <span>{t('sidebar.items.overview')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {activeOrgId && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/organizations/${activeOrgId}/general`}
                      tooltip={t('sidebar.items.general')}
                    >
                      <Link to="/organizations/$orgId/general" params={{ orgId: activeOrgId }}>
                        <Settings className="size-4" />
                        <span>{t('sidebar.items.general')}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/organizations/${activeOrgId}/members`}
                      tooltip={t('sidebar.items.members')}
                    >
                      <Link to="/organizations/$orgId/members" params={{ orgId: activeOrgId }}>
                        <Users className="size-4" />
                        <span>{t('sidebar.items.members')}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebar.groups.developer')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith('/account/oauth-applications')}
                  tooltip={t('sidebar.items.oauthApps')}
                >
                  <Link to="/account/oauth-applications">
                    <KeyRound className="size-4" />
                    <span>{t('sidebar.items.oauthApps')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <CollapseButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function CollapseButton() {
  const { t } = useObjectTranslation();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';
  const label = collapsed ? t('sidebar.expand') : t('sidebar.collapse');
  return (
    <SidebarMenuButton
      onClick={toggleSidebar}
      tooltip={label}
      aria-label={label}
    >
      <PanelLeft className="size-4" />
    </SidebarMenuButton>
  );
}
