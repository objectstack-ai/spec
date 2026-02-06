/**
 * MSW Browser Worker Setup via ObjectStack Service
 * 
 * This creates a complete ObjectStack environment in the browser using the In-Memory Driver
 * and the MSW Plugin which automatically exposes the API.
 * Supports multiple app packages (app-todo, app-crm, etc.)
 */
import { ObjectKernel } from '@objectstack/runtime';
import todoConfig from '@example/app-todo/objectstack.config';
import crmConfig from '@example/app-crm/objectstack.config';
import { createKernel } from './createKernel';

let kernel: ObjectKernel | null = null;

/** All available app packages */
export interface AppPackage {
  id: string;
  name: string;
  label: string;
  description?: string;
  icon?: string;
  config: any;
}

function resolveConfig(raw: any) {
  return (raw as any).default || raw;
}

export const appPackages: AppPackage[] = [
  {
    id: 'com.example.todo',
    name: 'todo_app',
    label: 'Todo App',
    description: 'A simple Todo example',
    icon: 'check-square',
    config: resolveConfig(todoConfig),
  },
  {
    id: 'com.example.crm',
    name: 'crm_app',
    label: 'Enterprise CRM',
    description: 'Comprehensive enterprise CRM',
    icon: 'briefcase',
    config: resolveConfig(crmConfig),
  },
];

export async function startMockServer() {
  if (kernel) return;

  console.log('[MSW] Starting ObjectStack Runtime (Browser Mode)...');
  console.log('[MSW] Loading apps:', appPackages.map(a => a.label));

  const appConfigs = appPackages.map(a => a.config);

  // Use shared factory with multi-app support
  kernel = await createKernel({
    appConfigs,
    enableBrowser: true
  });

  return kernel;
}

