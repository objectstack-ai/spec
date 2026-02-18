// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Args, Command } from '@oclif/core';
import chalk from 'chalk';
import { loadConfig } from '../../utils/config.js';
import { printHeader, printError, printInfo, printKV } from '../../utils/format.js';
import { resolvePluginName, resolvePluginVersion, resolvePluginType } from '../../utils/plugin-helpers.js';

export default class PluginInfo extends Command {
  static override description = 'Show detailed information about a plugin';

  static override args = {
    name: Args.string({ description: 'Plugin name or package name', required: true }),
    config: Args.string({ description: 'Configuration file path', required: false }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(PluginInfo);

    try {
      const { config } = await loadConfig(args.config);
      const allPlugins: unknown[] = [
        ...(config.plugins || []),
        ...(config.devPlugins || []),
      ];

      const found = allPlugins.find((p) => {
        const pName = resolvePluginName(p);
        return pName === args.name || pName.includes(args.name);
      });

      if (!found) {
        printError(`Plugin '${args.name}' not found in configuration`);
        console.log('');
        console.log(chalk.dim('  Available plugins:'));
        for (const p of allPlugins) {
          console.log(chalk.dim(`    - ${resolvePluginName(p)}`));
        }
        console.log('');
        this.exit(1);
      }

      printHeader(`Plugin: ${resolvePluginName(found)}`);

      printKV('Name', resolvePluginName(found));
      printKV('Version', resolvePluginVersion(found));
      printKV('Type', resolvePluginType(found));

      const isDev = (config.devPlugins || []).includes(found);
      printKV('Environment', isDev ? 'development' : 'production');

      if (found && typeof found === 'object') {
        const p = found as Record<string, unknown>;

        if (typeof p.description === 'string') {
          printKV('Description', p.description);
        }

        if (Array.isArray(p.dependencies) && p.dependencies.length > 0) {
          printKV('Dependencies', p.dependencies.join(', '));
        }

        // Show services if it's a loaded plugin instance
        if (typeof p.init === 'function') {
          printInfo('This is a runtime plugin instance (has init function)');
        }
      }

      if (typeof found === 'string') {
        printInfo('This is a string reference (will be imported at runtime)');
      }

      console.log('');
    } catch (error: any) {
      printError(error.message || String(error));
      this.exit(1);
    }
  }
}
