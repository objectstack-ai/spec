// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Args, Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { resolveConfigPath } from '../../utils/config.js';
import { printHeader, printSuccess, printError } from '../../utils/format.js';

/**
 * Add a plugin import and entry to objectstack.config.ts.
 *
 * This performs a simple text-based transformation:
 * 1. Adds an import statement for the package at the top of the file.
 * 2. Inserts the imported identifier into the `plugins` array, creating one if absent.
 */
function addPluginToConfig(configPath: string, packageName: string): void {
  let content = fs.readFileSync(configPath, 'utf-8');

  // Derive a variable name from the package name
  // e.g. "@objectstack/plugin-auth" → "authPlugin"
  const shortName = packageName
    .replace(/^@[^/]+\//, '')        // strip scope
    .replace(/^plugin-/, '')          // strip "plugin-" prefix
    .replace(/-+/g, '-')             // collapse consecutive hyphens
    .replace(/^-|-$/g, '');          // trim leading/trailing hyphens
  const varName = shortName.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()) + 'Plugin';

  // 1. Add import
  const importLine = `import ${varName} from '${packageName}';\n`;

  if (content.includes(packageName)) {
    throw new Error(`Plugin '${packageName}' is already referenced in the config`);
  }

  // Insert import after the last existing import
  const importRegex = /^import .+$/gm;
  let lastImportEnd = 0;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    lastImportEnd = match.index + match[0].length;
  }

  if (lastImportEnd > 0) {
    content = content.slice(0, lastImportEnd) + '\n' + importLine + content.slice(lastImportEnd);
  } else {
    content = importLine + '\n' + content;
  }

  // 2. Add to plugins array (target only the first plugins: [ within defineStack)
  if (/plugins\s*:\s*\[/.test(content)) {
    // plugins array exists — append to it (first occurrence only)
    let replaced = false;
    content = content.replace(
      /(plugins\s*:\s*\[)/,
      (match) => {
        if (replaced) return match;
        replaced = true;
        return `${match}\n    ${varName},`;
      }
    );
  } else {
    // No plugins array — add one before the closing of defineStack({...})
    // Look for the last property before the closing `})` or `})`
    content = content.replace(
      /(defineStack\(\{[\s\S]*?)(}\s*\))/,
      `$1  plugins: [\n    ${varName},\n  ],\n$2`
    );
  }

  fs.writeFileSync(configPath, content);
}

export { addPluginToConfig };

export default class PluginAdd extends Command {
  static override description = 'Add a plugin to objectstack.config.ts';

  static override args = {
    package: Args.string({ description: 'Plugin package name (e.g. @objectstack/plugin-auth)', required: true }),
  };

  static override flags = {
    dev: Flags.boolean({ char: 'd', description: 'Add as a dev-only plugin' }),
    config: Flags.string({ char: 'c', description: 'Configuration file path' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(PluginAdd);

    try {
      const configPath = resolveConfigPath(flags.config);

      printHeader('Add Plugin');
      console.log(`  ${chalk.dim('Package:')} ${chalk.white(args.package)}`);
      console.log(`  ${chalk.dim('Config:')}  ${chalk.white(path.relative(process.cwd(), configPath))}`);
      console.log('');

      addPluginToConfig(configPath, args.package);
      printSuccess(`Added ${chalk.cyan(args.package)} to config`);

      console.log('');
      console.log(chalk.dim('  Next steps:'));
      console.log(chalk.dim(`  1. Install the package: pnpm add ${args.package}`));
      console.log(chalk.dim('  2. Run: os validate'));
      console.log('');
    } catch (error: any) {
      printError(error.message || String(error));
      this.exit(1);
    }
  }
}
