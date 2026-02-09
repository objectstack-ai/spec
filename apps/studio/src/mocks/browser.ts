// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * MSW Browser Worker Setup via ObjectStack Service
 * 
 * This creates a complete ObjectStack environment in the browser using the In-Memory Driver
 * and the MSW Plugin which automatically exposes the API.
 * 
 * NOTE: The console does NOT hardcode a list of app packages. The app list is
 * fetched dynamically from the server API via `GET /api/v1/meta/apps`.
 * The imports here are only used to boot the in-browser kernel (MSW mode).
 */
import { ObjectKernel } from '@objectstack/runtime';
import todoConfig from '@example/app-todo/objectstack.config';
import crmConfig from '@example/app-crm/objectstack.config';
import { createKernel } from './createKernel';

let kernel: ObjectKernel | null = null;

/**
 * AppPackage — derived from the `apps` metadata type (AppSchema in spec).
 * All fields come from the server API, NOT from frontend config.
 */
export interface AppPackage {
  /** Machine name (snake_case), e.g. 'crm_enterprise' */
  name: string;
  /** Display label, e.g. 'Enterprise CRM' */
  label: string;
  /** Description */
  description?: string;
  /** Icon name (Lucide) */
  icon?: string;
  /** Navigation tree */
  navigation?: any[];
  /** Branding */
  branding?: any;
  /** Whether app is active */
  active?: boolean;
}

function resolveConfig(raw: any) {
  return (raw as any).default || raw;
}

/**
 * App configs used ONLY for kernel bootstrapping in MSW (browser) mode.
 * The UI never reads this directly — it discovers apps via the meta API.
 */
const bootConfigs = [
  resolveConfig(todoConfig),
  resolveConfig(crmConfig),
];

export async function startMockServer() {
  if (kernel) return;

  console.log('[MSW] Starting ObjectStack Runtime (Browser Mode)...');

  // Use shared factory with multi-app support
  kernel = await createKernel({
    appConfigs: bootConfigs,
    enableBrowser: true
  });

  return kernel;
}

