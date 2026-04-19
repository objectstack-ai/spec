// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createFileRoute } from '@tanstack/react-router';
import { SiteHeader } from '@/components/site-header';
import { DeveloperOverview } from '../components/DeveloperOverview';
import { useEnvAwarePackages } from '../hooks/useEnvAwarePackages';

function EnvPackageIndexComponent() {
  const { environmentId } = Route.useParams();
  const { packages, selectedPackage } = useEnvAwarePackages(environmentId);

  return (
    <>
      <SiteHeader
        selectedView="overview"
        packageLabel={selectedPackage?.manifest?.name || selectedPackage?.manifest?.id}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DeveloperOverview packages={packages} selectedPackage={selectedPackage} />
      </div>
    </>
  );
}

export const Route = createFileRoute('/environments/$environmentId/$package/')({
  component: EnvPackageIndexComponent,
});
