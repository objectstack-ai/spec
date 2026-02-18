// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Args, Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { loadConfig } from '../../utils/config.js';
import { printHeader, printInfo, printError } from '../../utils/format.js';
import { resolvePluginName, resolvePluginVersion, resolvePluginType } from '../../utils/plugin-helpers.js';

export default class PluginList extends Command {
  static override description = 'List plugins defined in the configuration';

  static override aliases = ['plugin ls'];

  static override args = {
    config: Args.string({ description: 'Configuration file path', required: false }),
  };

  static override flags = {
    json: Flags.boolean({ description: 'Output as JSON' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(PluginList);

    try {
      const { config } = await loadConfig(args.config);
      const plugins: unknown[] = config.plugins || [];
      const devPlugins: unknown[] = config.devPlugins || [];

      if (flags.json) {
        const data = {
          plugins: plugins.map(p => ({
            name: resolvePluginName(p),
            version: resolvePluginVersion(p),
            type: resolvePluginType(p),
            dev: false,
          })),
          devPlugins: devPlugins.map(p => ({
            name: resolvePluginName(p),
            version: resolvePluginVersion(p),
            type: resolvePluginType(p),
            dev: true,
          })),
        };
        console.log(JSON.stringify(data, null, 2));
        return;
      }

      printHeader('Plugins');

      if (plugins.length === 0 && devPlugins.length === 0) {
        printInfo('No plugins configured');
        console.log('');
        console.log(chalk.dim('  Hint: Add plugins to your objectstack.config.ts'));
        console.log(chalk.dim('  Or run: os plugin add <package-name>'));
        console.log('');
        return;
      }

      if (plugins.length > 0) {
        console.log(chalk.bold(`\n  Plugins (${plugins.length}):`));
        for (const plugin of plugins) {
          const name = resolvePluginName(plugin);
          const version = resolvePluginVersion(plugin);
          const type = resolvePluginType(plugin);
          console.log(
            `    ${chalk.cyan('●')} ${chalk.white(name)}` +
            (version !== '-' ? chalk.dim(` v${version}`) : '') +
            (type !== 'standard' ? chalk.dim(` [${type}]`) : '')
          );
        }
      }

      if (devPlugins.length > 0) {
        console.log(chalk.bold(`\n  Dev Plugins (${devPlugins.length}):`));
        for (const plugin of devPlugins) {
          const name = resolvePluginName(plugin);
          const version = resolvePluginVersion(plugin);
          console.log(
            `    ${chalk.yellow('●')} ${chalk.white(name)}` +
            (version !== '-' ? chalk.dim(` v${version}`) : '') +
            chalk.dim(' [dev]')
          );
        }
      }

      console.log('');
    } catch (error: any) {
      printError(error.message || String(error));
      this.exit(1);
    }
  }
}
