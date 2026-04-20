// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * /examples — placeholder page for the runnable examples index.
 *
 * Reachable from the global sidebar's "Library" section. Links will eventually
 * point at sandboxed reference implementations from `examples/`.
 */

import { createFileRoute } from '@tanstack/react-router';
import { BookOpen } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';

function ExamplesComponent() {
  return (
    <main className="flex min-w-0 flex-1 flex-col h-svh overflow-hidden bg-background">
      <SiteHeader selectedView="examples" />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-semibold">Examples</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Reference implementations from the ObjectStack monorepo will be
            browsable here. For now, see the{' '}
            <code className="font-mono text-xs">examples/</code> directory in
            the repository.
          </p>
        </div>
      </div>
    </main>
  );
}

export const Route = createFileRoute('/examples')({
  component: ExamplesComponent,
});
