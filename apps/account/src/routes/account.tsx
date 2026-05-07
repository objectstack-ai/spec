// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * /account — Account settings layout.
 *
 * Pure layout route. The four sub-sections (Profile / Security / Sessions /
 * Two-Factor) are exposed as top-level entries on the global Account
 * sidebar; this layout simply renders the page header plus an `<Outlet/>`
 * for the active sub-route.
 */

import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useObjectTranslation } from '@object-ui/i18n';
import { useSession } from '@/hooks/useSession';

export const Route = createFileRoute('/account')({
  component: AccountLayout,
});

function AccountLayout() {
  const { t } = useObjectTranslation();
  const { user } = useSession();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">{t('topBar.breadcrumb.account')}</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
