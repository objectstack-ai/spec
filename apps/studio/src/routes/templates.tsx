// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * /templates — placeholder page for the template gallery.
 *
 * Reachable from the global sidebar's "Library" section. Content will be
 * filled in as the template publishing pipeline lands.
 */

import { createFileRoute } from '@tanstack/react-router';
import { LayoutTemplate } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';

function TemplatesComponent() {
  return (
    <main className="flex min-w-0 flex-1 flex-col h-svh overflow-hidden bg-background">
      <SiteHeader selectedView="templates" />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <LayoutTemplate className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-semibold">Templates</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            A curated gallery of starter templates is coming soon. You&apos;ll
            be able to clone a template into a new environment with a single
            click.
          </p>
        </div>
      </div>
    </main>
  );
}

export const Route = createFileRoute('/templates')({
  component: TemplatesComponent,
});
