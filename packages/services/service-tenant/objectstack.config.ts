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
} from '@objectstack/platform-objects/tenant';

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
