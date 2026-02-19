// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Plugin, PluginContext } from '@objectstack/core';
import { FileI18nAdapter } from './file-i18n-adapter.js';
import type { FileI18nAdapterOptions } from './file-i18n-adapter.js';

/**
 * Configuration options for the I18nServicePlugin.
 */
export interface I18nServicePluginOptions {
  /** Default locale (default: 'en') */
  defaultLocale?: string;
  /** Directory containing locale JSON files */
  localesDir?: string;
  /** Fallback locale for missing translations */
  fallbackLocale?: string;
}

/**
 * I18nServicePlugin — Production II18nService implementation.
 *
 * Registers an i18n service with the kernel during the init phase.
 * Uses file-based locale loading with JSON files.
 *
 * @example
 * ```ts
 * import { ObjectKernel } from '@objectstack/core';
 * import { I18nServicePlugin } from '@objectstack/service-i18n';
 *
 * const kernel = new ObjectKernel();
 * kernel.use(new I18nServicePlugin({
 *   defaultLocale: 'en',
 *   localesDir: './i18n',
 *   fallbackLocale: 'en',
 * }));
 * await kernel.bootstrap();
 *
 * const i18n = kernel.getService('i18n');
 * i18n.t('objects.account.label', 'en'); // 'Account'
 * ```
 */
export class I18nServicePlugin implements Plugin {
  name = 'com.objectstack.service.i18n';
  version = '1.0.0';
  type = 'standard';

  private readonly options: I18nServicePluginOptions;

  constructor(options: I18nServicePluginOptions = {}) {
    this.options = options;
  }

  async init(ctx: PluginContext): Promise<void> {
    const adapterOptions: FileI18nAdapterOptions = {
      defaultLocale: this.options.defaultLocale,
      localesDir: this.options.localesDir,
      fallbackLocale: this.options.fallbackLocale,
    };

    const i18n = new FileI18nAdapter(adapterOptions);
    ctx.registerService('i18n', i18n);
    ctx.logger.info(
      `I18nServicePlugin: registered file-based i18n adapter (default: ${i18n.getDefaultLocale()})`,
    );
  }
}
