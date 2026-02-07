/**
 * Root Development Configuration
 *
 * Aggregates all example apps for `pnpm studio` / `pnpm dev`.
 * This is NOT a deployable config — it's the monorepo dev entry point.
 */
import { defineStack } from '@objectstack/spec';
import { AppPlugin, DriverPlugin } from '@objectstack/runtime';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { InMemoryDriver } from '@objectstack/driver-memory';
import CrmApp from './examples/app-crm/objectstack.config';
import TodoApp from './examples/app-todo/objectstack.config';
import BiPlugin from './examples/plugin-bi/objectstack.config';

export default defineStack({
  manifest: {
    id: 'dev-workspace',
    name: 'dev_workspace',
    version: '0.0.0',
    description: 'ObjectStack monorepo development workspace',
    type: 'app',
  },
  plugins: [
    new ObjectQLPlugin(),
    new DriverPlugin(new InMemoryDriver()),
    new AppPlugin(CrmApp),
    new AppPlugin(TodoApp),
    new AppPlugin(BiPlugin),
  ],
});
