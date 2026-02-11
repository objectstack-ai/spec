// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { loadConfig, resolveConfigPath } from '../utils/config.js';
import { printHeader, printSuccess, printError, printInfo, printWarning, printKV } from '../utils/format.js';

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Resolve plugin display name from a plugin entry.
 * Plugins can be string package names, objects with `.name`, or class instances.
 */
function resolvePluginName(plugin: unknown): string {
  if (typeof plugin === 'string') return plugin;
  if (plugin && typeof plugin === 'object') {
    const p = plugin as Record<string, unknown>;
    if (typeof p.name === 'string') return p.name;
    if (p.constructor && p.constructor.name !== 'Object') return p.constructor.name;
  }
  return 'unknown';
}

/**
 * Resolve plugin version from a plugin entry.
 */
function resolvePluginVersion(plugin: unknown): string {
  if (plugin && typeof plugin === 'object') {
    const p = plugin as Record<string, unknown>;
    if (typeof p.version === 'string') return p.version;
  }
  return '-';
}

/**
 * Resolve plugin type from a plugin entry.
 */
function resolvePluginType(plugin: unknown): string {
  if (plugin && typeof plugin === 'object') {
    const p = plugin as Record<string, unknown>;
    if (typeof p.type === 'string') return p.type;
  }
  return 'standard';
}

/**
 * Read the raw text of the config file.
 */
function readConfigText(configPath: string): string {
  return fs.readFileSync(configPath, 'utf-8');
}

/**
 * Add a plugin import and entry to objectstack.config.ts.
 *
 * This performs a simple text-based transformation:
 * 1. Adds an import statement for the package at the top of the file.
 * 2. Inserts the imported identifier into the `plugins` array, creating one if absent.
 */
function addPluginToConfig(configPath: string, packageName: string): void {
  let content = readConfigText(configPath);

  // Derive a variable name from the package name
  // e.g. "@objectstack/plugin-auth" → "pluginAuth"
  const shortName = packageName
    .replace(/^@[^/]+\//, '')        // strip scope
    .replace(/^plugin-/, '');         // strip "plugin-" prefix
  const varName = shortName.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) + 'Plugin';

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

  // 2. Add to plugins array
  if (/plugins\s*:\s*\[/.test(content)) {
    // plugins array exists — append to it
    content = content.replace(
      /(plugins\s*:\s*\[)/,
      `$1\n    ${varName},`
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

/**
 * Remove a plugin reference from objectstack.config.ts.
 *
 * Removes matching import line and the entry from the plugins array.
 */
function removePluginFromConfig(configPath: string, pluginName: string): void {
  let content = readConfigText(configPath);

  // Remove the import line that references this plugin (by package name or variable)
  const importRegex = new RegExp(`^import .+['"]${escapeRegex(pluginName)}['"].*$\\n?`, 'gm');
  const hadImport = importRegex.test(content);
  content = content.replace(importRegex, '');

  // Also try to remove by a derived variable name
  const shortName = pluginName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '');
  const varName = shortName.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) + 'Plugin';

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

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Subcommands ────────────────────────────────────────────────────

const listCommand = new Command('list')
  .alias('ls')
  .description('List plugins defined in the configuration')
  .argument('[config]', 'Configuration file path')
  .option('--json', 'Output as JSON')
  .action(async (configSource?: string, options?: { json?: boolean }) => {
    try {
      const { config } = await loadConfig(configSource);
      const plugins: unknown[] = config.plugins || [];
      const devPlugins: unknown[] = config.devPlugins || [];

      if (options?.json) {
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
      process.exit(1);
    }
  });

const infoSubCommand = new Command('info')
  .description('Show detailed information about a plugin')
  .argument('<name>', 'Plugin name or package name')
  .argument('[config]', 'Configuration file path')
  .action(async (name: string, configSource?: string) => {
    try {
      const { config } = await loadConfig(configSource);
      const allPlugins: unknown[] = [
        ...(config.plugins || []),
        ...(config.devPlugins || []),
      ];

      const found = allPlugins.find((p) => {
        const pName = resolvePluginName(p);
        return pName === name || pName.includes(name);
      });

      if (!found) {
        printError(`Plugin '${name}' not found in configuration`);
        console.log('');
        console.log(chalk.dim('  Available plugins:'));
        for (const p of allPlugins) {
          console.log(chalk.dim(`    - ${resolvePluginName(p)}`));
        }
        console.log('');
        process.exit(1);
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
      process.exit(1);
    }
  });

const addCommand = new Command('add')
  .description('Add a plugin to objectstack.config.ts')
  .argument('<package>', 'Plugin package name (e.g. @objectstack/plugin-auth)')
  .option('-d, --dev', 'Add as a dev-only plugin')
  .option('-c, --config <path>', 'Configuration file path')
  .action(async (packageName: string, options?: { dev?: boolean; config?: string }) => {
    try {
      const configPath = resolveConfigPath(options?.config);

      printHeader('Add Plugin');
      console.log(`  ${chalk.dim('Package:')} ${chalk.white(packageName)}`);
      console.log(`  ${chalk.dim('Config:')}  ${chalk.white(path.relative(process.cwd(), configPath))}`);
      console.log('');

      addPluginToConfig(configPath, packageName);
      printSuccess(`Added ${chalk.cyan(packageName)} to config`);

      console.log('');
      console.log(chalk.dim('  Next steps:'));
      console.log(chalk.dim(`  1. Install the package: pnpm add ${packageName}`));
      console.log(chalk.dim('  2. Run: os validate'));
      console.log('');
    } catch (error: any) {
      printError(error.message || String(error));
      process.exit(1);
    }
  });

const removeCommand = new Command('remove')
  .alias('rm')
  .description('Remove a plugin from objectstack.config.ts')
  .argument('<name>', 'Plugin name or package name to remove')
  .option('-c, --config <path>', 'Configuration file path')
  .action(async (pluginName: string, options?: { config?: string }) => {
    try {
      const configPath = resolveConfigPath(options?.config);

      printHeader('Remove Plugin');
      console.log(`  ${chalk.dim('Plugin:')} ${chalk.white(pluginName)}`);
      console.log(`  ${chalk.dim('Config:')} ${chalk.white(path.relative(process.cwd(), configPath))}`);
      console.log('');

      removePluginFromConfig(configPath, pluginName);
      printSuccess(`Removed ${chalk.cyan(pluginName)} from config`);

      console.log('');
      console.log(chalk.dim('  Tip: Run `pnpm remove ' + pluginName + '` to uninstall the package'));
      console.log('');
    } catch (error: any) {
      printError(error.message || String(error));
      process.exit(1);
    }
  });

// ─── Main Plugin Command ────────────────────────────────────────────

export const pluginCommand = new Command('plugin')
  .description('Manage plugins (list, info, add, remove)')
  .addCommand(listCommand)
  .addCommand(infoSubCommand)
  .addCommand(addCommand)
  .addCommand(removeCommand);
