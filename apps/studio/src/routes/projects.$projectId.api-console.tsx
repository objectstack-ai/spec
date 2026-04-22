// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * /projects/$projectId/api-console — per-project API Console.
 *
 * Renders the API Console scoped to the selected project so that discovery,
 * endpoint listings and request execution all hit `/api/v1/projects/:projectId/*`.
 */

import { createFileRoute, useParams } from '@tanstack/react-router';
import { ApiConsolePage } from '@/components/ApiConsolePage';

function ProjectApiConsoleComponent() {
  const { projectId } = useParams({ from: '/projects/$projectId' });
  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="flex flex-1 flex-col overflow-hidden">
        <ApiConsolePage projectId={projectId} />
      </div>
    </main>
  );
}

export const Route = createFileRoute('/projects/$projectId/api-console')({
  component: ProjectApiConsoleComponent,
});
