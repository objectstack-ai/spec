// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * MSW Browser Worker Setup via ObjectStack Service
 * 
 * This creates a complete ObjectStack environment in the browser using the In-Memory Driver
 * and the MSW Plugin which automatically exposes the API.
 * 
 * App configs are loaded dynamically from objectstack.config.ts at the project root.
 * The UI itself fetches apps via `GET /api/v1/meta/apps` — not from these imports.
 */
import { ObjectKernel } from '@objectstack/runtime';
import studioConfig from '../../objectstack.config';
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
 * Boot config loaded dynamically from objectstack.config.ts.
 * The UI never reads this directly — it discovers apps via the meta API.
 */
const bootConfigs = [
  resolveConfig(studioConfig),
];

export async function startMockServer() {
  if (kernel) return;

  console.log('[MSW] Starting ObjectStack Runtime (Browser Mode)...');

  // Use shared factory — app list comes from objectstack.config.ts
  kernel = await createKernel({
    appConfigs: bootConfigs,
    enableBrowser: true
  });

  return kernel;
}

