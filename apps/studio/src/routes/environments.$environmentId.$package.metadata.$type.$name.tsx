// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createFileRoute } from '@tanstack/react-router';
import { SiteHeader } from '@/components/site-header';
import { PluginHost } from '../plugins';
import { useEnvAwarePackages } from '../hooks/useEnvAwarePackages';

function EnvMetadataViewComponent() {
  const { environmentId, package: packageId, type, name } = Route.useParams();
  const { selectedPackage } = useEnvAwarePackages(environmentId);

  const resolvedPkgId = selectedPackage?.manifest?.id ?? packageId;

  return (
    <>
      <SiteHeader
        selectedMeta={{ type, name }}
        selectedView="metadata"
        packageLabel={selectedPackage?.manifest?.name || selectedPackage?.manifest?.id}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <PluginHost
          metadataType={type}
          metadataName={name}
          packageId={resolvedPkgId}
        />
      </div>
    </>
  );
}

export const Route = createFileRoute(
  '/environments/$environmentId/$package/metadata/$type/$name',
)({
  component: EnvMetadataViewComponent,
});
