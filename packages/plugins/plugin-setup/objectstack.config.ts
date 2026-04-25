// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineStack } from '@objectstack/spec';
import { SETUP_APP_DEFAULTS } from './src/setup-app';
import { SETUP_AREAS } from './src/setup-areas';

// Declares the Setup App skeleton with all four built-in areas (empty navigation).
// At runtime, SetupPlugin merges contributions from other plugins into the areas
// and registers the final composed app via the manifest service.
export default defineStack({
  manifest: {
    id: 'com.objectstack.plugin-setup',
    namespace: 'sys',
    version: '3.3.1',
    type: 'plugin',
    scope: 'project',
    name: 'Platform Setup Plugin',
    description: 'Owns and composes the platform Setup App with area-based navigation contributed by other plugins',
  },

  apps: [
    {
      ...SETUP_APP_DEFAULTS,
      areas: [...SETUP_AREAS],
    },
  ],
});
