// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineStack } from '@objectstack/spec';
import * as objects from './src/objects';

export default defineStack({
  manifest: {
    id: 'com.objectstack.plugin-security',
    namespace: 'sys',
    version: '1.0.0',
    type: 'plugin',
    scope: 'system',
    defaultDatasource: 'cloud',
    name: 'Security Plugin',
    description: 'RBAC roles and permission sets for ObjectStack (Role, PermissionSet)',
  },

  objects: Object.values(objects),
});
