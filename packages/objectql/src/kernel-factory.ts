// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectKernel } from '@objectstack/core';
import { ObjectQLPlugin } from './plugin.js';
import type { Plugin } from '@objectstack/core';

/**
 * Options for creating an ObjectQL Kernel.
 */
export interface ObjectQLKernelOptions {
  /**
   * Additional plugins to register with the kernel.
   */
  plugins?: Plugin[];
}

/**
 * Convenience factory for creating an ObjectQL-ready kernel.
 *
 * Creates an ObjectKernel pre-configured with the ObjectQLPlugin
 * (data engine, schema registry, protocol implementation) plus any
 * additional plugins provided.
 *
 * @example
 * ```typescript
 * import { createObjectQLKernel } from '@objectstack/objectql';
 *
 * const kernel = createObjectQLKernel({
 *   plugins: [myDriverPlugin, myAuthPlugin],
 * });
 * await kernel.bootstrap();
 * ```
 */
export async function createObjectQLKernel(options: ObjectQLKernelOptions = {}): Promise<ObjectKernel> {
  const kernel = new ObjectKernel();

  // Register the core ObjectQLPlugin first
  await kernel.use(new ObjectQLPlugin());

  // Register any additional plugins
  if (options.plugins) {
    for (const plugin of options.plugins) {
      await kernel.use(plugin);
    }
  }

  return kernel;
}
