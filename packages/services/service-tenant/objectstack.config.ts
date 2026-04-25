// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineStack } from '@objectstack/spec';
import {
  SysProject,
  SysProjectCredential,
  SysProjectMember,
  SysPackage,
  SysPackageVersion,
  SysPackageInstallation,
  SysApp,
} from './src/objects';

// SysTenantDatabase is a v4.x deprecation shim and is excluded here.
// It is conditionally added at runtime via TenantPluginConfig.registerLegacyTenantDatabase.

export default defineStack({
  manifest: {
    id: 'com.objectstack.service-tenant',
    namespace: 'sys',
    version: '0.2.0',
    type: 'plugin',
    scope: 'cloud',
    name: 'Tenant Service',
    description: 'Multi-tenant project registry, package catalog, and org-scoped app metadata',
  },

  objects: [
    SysProject,
    SysProjectCredential,
    SysProjectMember,
    SysPackage,
    SysPackageVersion,
    SysPackageInstallation,
    SysApp,
  ],
});
