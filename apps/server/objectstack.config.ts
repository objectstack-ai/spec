// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Shared ObjectStack Server Configuration
 *
 * Single source of truth for all plugins — used by both:
 *   - `objectstack serve` (local dev via CLI)
 *   - `server/index.ts` (Vercel serverless deployment)
 */

import { defineStack } from '@objectstack/spec';
import { AppPlugin, DriverPlugin } from '@objectstack/runtime';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { InMemoryDriver } from '@objectstack/driver-memory';
import { TursoDriver } from '@objectstack/driver-turso';
import { AuthPlugin } from '@objectstack/plugin-auth';
import { SecurityPlugin } from '@objectstack/plugin-security';
import { AuditPlugin } from '@objectstack/plugin-audit';
import { SetupPlugin } from '@objectstack/plugin-setup';
import { FeedServicePlugin } from '@objectstack/service-feed';
import { MetadataPlugin } from '@objectstack/metadata';
import { AIServicePlugin } from '@objectstack/service-ai';
import { AutomationServicePlugin } from '@objectstack/service-automation';
import { AnalyticsServicePlugin } from '@objectstack/service-analytics';
import CrmApp from '../../examples/app-crm/objectstack.config';
import TodoApp from '../../examples/app-todo/objectstack.config';
import BiPluginManifest from '../../examples/plugin-bi/objectstack.config';

// Resolve base URL: explicit env > Vercel production URL > Vercel preview URL > localhost
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined)
  ?? (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}` : undefined)
  ?? 'http://localhost:3000';

// Turso persistent storage — enabled when env vars are configured
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;
const useTurso = !!(tursoUrl && tursoToken);

const driverPlugins = useTurso
  ? [
      new DriverPlugin(new InMemoryDriver(), 'memory'),
      new DriverPlugin(new TursoDriver({ url: tursoUrl!, authToken: tursoToken! }), 'turso'),
    ]
  : [new DriverPlugin(new InMemoryDriver(), 'memory')];

export default defineStack({
  manifest: {
    id: 'com.objectstack.server',
    namespace: 'server',
    name: 'ObjectStack Server',
    version: '1.0.0',
    description: 'Production server aggregating CRM, Todo and BI plugins',
    type: 'app',
  },
  plugins: [
    new ObjectQLPlugin(),
    ...driverPlugins,
    new AppPlugin(CrmApp),
    new AppPlugin(TodoApp),
    new AppPlugin(BiPluginManifest),
    new SetupPlugin(),
    new AuthPlugin({
      secret: process.env.AUTH_SECRET ?? 'dev-secret-please-change-in-production-min-32-chars',
      baseUrl,
    }),
    new SecurityPlugin(),
    new AuditPlugin(),
    new FeedServicePlugin(),
    new MetadataPlugin({ watch: false }),
    new AIServicePlugin(),
    new AutomationServicePlugin(),
    new AnalyticsServicePlugin(),
  ],
  // When Turso is configured, route sys namespace to persistent storage
  ...(useTurso && {
    datasourceMapping: [
      { namespace: 'sys', datasource: 'turso' },
      { default: true, datasource: 'memory' },
    ],
  }),
});
