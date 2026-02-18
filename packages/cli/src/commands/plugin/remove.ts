// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Args, Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { resolveConfigPath } from '../../utils/config.js';
import { printHeader, printSuccess, printError } from '../../utils/format.js';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Remove a plugin reference from objectstack.config.ts.
 *
 * Removes matching import line and the entry from the plugins array.
 */
function removePluginFromConfig(configPath: string, pluginName: string): void {
  let content = fs.readFileSync(configPath, 'utf-8');

  // Remove the import line that references this plugin (exact package name match)
  const importRegex = new RegExp(`^import .+['"]${escapeRegex(pluginName)}['"]\\s*;?\\s*$\\n?`, 'gm');
  const hadImport = importRegex.test(content);
  // Reset regex lastIndex after test()
  importRegex.lastIndex = 0;
  content = content.replace(importRegex, '');

  // Also try to remove by a derived variable name
  const shortName = pluginName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const varName = shortName.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()) + 'Plugin';

  // Remove import by variable name if it wasn't caught above
  if (!hadImport) {
    const varImportRegex = new RegExp(`^import .* ${escapeRegex(varName)} .+$\\n?`, 'gm');
    content = content.replace(varImportRegex, '');
  }

  // Remove the entry from the plugins array
  // Match: varName, or 'package-name', or "package-name"
  const entryPatterns = [
    new RegExp(`\\s*${escapeRegex(varName)},?\\n?`, 'g'),
    new RegExp(`\\s*['"]${escapeRegex(pluginName)}['"],?\\n?`, 'g'),
  ];

  for (const pattern of entryPatterns) {
    content = content.replace(pattern, '\n');
  }

  // Clean up empty plugins array: plugins: [\n  ],
  content = content.replace(/plugins\s*:\s*\[\s*\],?\n?/g, '');

  fs.writeFileSync(configPath, content);
}

export { removePluginFromConfig };

export default class PluginRemove extends Command {
  static override description = 'Remove a plugin from objectstack.config.ts';

  static override aliases = ['plugin rm'];

  static override args = {
    name: Args.string({ description: 'Plugin name or package name to remove', required: true }),
  };

  static override flags = {
    config: Flags.string({ char: 'c', description: 'Configuration file path' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(PluginRemove);

    try {
      const configPath = resolveConfigPath(flags.config);

      printHeader('Remove Plugin');
      console.log(`  ${chalk.dim('Plugin:')} ${chalk.white(args.name)}`);
      console.log(`  ${chalk.dim('Config:')} ${chalk.white(path.relative(process.cwd(), configPath))}`);
      console.log('');

      removePluginFromConfig(configPath, args.name);
      printSuccess(`Removed ${chalk.cyan(args.name)} from config`);

      console.log('');
      console.log(chalk.dim('  Tip: Run `pnpm remove ' + args.name + '` to uninstall the package'));
      console.log('');
    } catch (error: any) {
      printError(error.message || String(error));
      this.exit(1);
    }
  }
}
