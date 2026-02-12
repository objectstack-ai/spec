// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineStack } from '@objectstack/spec';
import * as objects from './src/objects';

/**
 * ObjectStack Configuration for plugin-auth
 * 
 * This configuration defines the authentication and identity kernel objects
 * for the ObjectStack platform.
 */
export default defineStack({
  manifest: {
    id: 'com.objectstack.plugin-auth',
    namespace: 'auth',
    version: '3.0.1',
    type: 'plugin',
    name: 'Authentication & Identity Plugin',
    description: 'Core authentication objects for ObjectStack (User, Session, Account, Verification)',
  },

  // Export all authentication kernel objects
  objects: Object.values(objects),
});
