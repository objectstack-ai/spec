// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createFileRoute } from '@tanstack/react-router';
import { SiteHeader } from '@/components/site-header';
import { PluginHost } from '../plugins';
import { useEnvAwarePackages } from '../hooks/useEnvAwarePackages';

function EnvObjectViewComponent() {
  const { environmentId, package: packageId, name } = Route.useParams();
  const { selectedPackage } = useEnvAwarePackages(environmentId);

  // Use selectedPackage?.manifest?.id (full ID) for PluginHost; fall back to URL param.
  const resolvedPkgId = selectedPackage?.manifest?.id ?? packageId;

  return (
    <>
      <SiteHeader
        selectedObject={name}
        selectedView="object"
        packageLabel={selectedPackage?.manifest?.name || selectedPackage?.manifest?.id}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <PluginHost
          metadataType="object"
          metadataName={name}
          packageId={resolvedPkgId}
        />
      </div>
    </>
  );
}

export const Route = createFileRoute(
  '/environments/$environmentId/$package/objects/$name',
)({
  component: EnvObjectViewComponent,
});
