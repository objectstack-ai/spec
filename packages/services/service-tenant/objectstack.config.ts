// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineStack } from '@objectstack/spec';
import { tenantObjects, tenantServiceManifestHeader } from './src/manifest';

export default defineStack({
  manifest: tenantServiceManifestHeader,
  objects: tenantObjects,
});
