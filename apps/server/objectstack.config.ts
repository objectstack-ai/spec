// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineStack } from '@objectstack/spec';
import { AppPlugin, DriverPlugin } from '@objectstack/runtime';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { InMemoryDriver } from '@objectstack/driver-memory';
import { AuthPlugin } from '@objectstack/plugin-auth';
import CrmApp from '../../examples/app-crm/objectstack.config';
import TodoApp from '../../examples/app-todo/objectstack.config';
import BiPluginManifest from '../../examples/plugin-bi/objectstack.config';

// Production Server
// This project acts as a "Platform Server" that loads multiple apps and plugins.
// It effectively replaces the manual composition in `src/index.ts`.

// Shared authentication plugin — reads secrets from environment variables so the
// same config works both locally and on Vercel (where VERCEL_URL is injected).
const authPlugin = new AuthPlugin({
  secret: process.env.AUTH_SECRET ?? 'dev-secret-please-change-in-production-min-32-chars',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'),
});

export default defineStack({
  manifest: {
    id: 'com.objectstack.server',
    namespace: 'server',
    name: 'ObjectStack Server',
    version: '1.0.0',
    description: 'Production server aggregating CRM, Todo and BI plugins',
    type: 'app',
  },
  
  // Explicitly Load Plugins and Apps
  // The Runtime CLI will iterate this list and call kernel.use()
  plugins: [
    new ObjectQLPlugin(),
    // Register Default Driver (Memory)
    new DriverPlugin(new InMemoryDriver()),
    // Authentication — required for production (Vercel) deployments
    authPlugin,
    // Wrap Manifests/Stacks in AppPlugin adapter
    new AppPlugin(CrmApp),
    new AppPlugin(TodoApp),
    new AppPlugin(BiPluginManifest)
  ]
});
