// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig } from './config.js';

/**
 * CLI Command Contribution resolved from a plugin manifest.
 */
interface ResolvedCommandContribution {
  /** CLI command name */
  name: string;
  /** Brief description */
  description?: string;
  /** Module path to import */
  module?: string;
  /** Source plugin package name */
  pluginName: string;
}

/**
 * Discover CLI command contributions from installed plugins.
 * 
 * Scans the project's `objectstack.config.ts` for plugins that declare
 * `contributes.commands` in their manifest, then dynamically imports
 * those plugin modules to register Commander.js commands.
 * 
 * @param program - The root Commander.js program to register commands on
 */
export async function loadPluginCommands(program: Command): Promise<void> {
  let config: any;

  try {
    const loaded = await loadConfig();
    config = loaded.config;
  } catch {
    // No config file found — nothing to load
    return;
  }

  const plugins: unknown[] = [
    ...(config.plugins || []),
    ...(config.devPlugins || []),
  ];

  // Collect command contributions from plugin manifests
  const contributions: ResolvedCommandContribution[] = [];

  for (const plugin of plugins) {
    if (!plugin || typeof plugin !== 'object') continue;
    const p = plugin as Record<string, unknown>;

    const manifest = p.manifest as Record<string, unknown> | undefined;
    const contributes = (manifest?.contributes ?? p.contributes) as Record<string, unknown> | undefined;
    if (!contributes) continue;

    const commands = contributes.commands as Array<Record<string, unknown>> | undefined;
    if (!Array.isArray(commands)) continue;

    const pluginName = resolvePluginName(p);

    for (const cmd of commands) {
      if (!cmd || typeof cmd.name !== 'string') continue;
      contributions.push({
        name: cmd.name,
        description: typeof cmd.description === 'string' ? cmd.description : undefined,
        module: typeof cmd.module === 'string' ? cmd.module : undefined,
        pluginName,
      });
    }
  }

  if (contributions.length === 0) return;

  // Load and register each contributed command
  for (const contribution of contributions) {
    try {
      const commands = await importPluginCommands(contribution);
      for (const cmd of commands) {
        program.addCommand(cmd);
      }
    } catch (error: any) {
      // Log warning but don't crash — plugin commands are optional
      if (process.env.DEBUG) {
        console.error(
          chalk.yellow(`  ⚠ Failed to load CLI command '${contribution.name}' from plugin '${contribution.pluginName}': ${error.message}`)
        );
      }
    }
  }
}

/**
 * Import Commander.js commands from a plugin module.
 * 
 * The module must export commands in one of these forms:
 * - `export const commands: Command[]`
 * - `export default Command`
 * - `export default Command[]`
 */
async function importPluginCommands(
  contribution: ResolvedCommandContribution
): Promise<Command[]> {
  // Resolve the module specifier
  const moduleId = contribution.module
    ? `${contribution.pluginName}/${contribution.module.replace(/^\.\//, '')}`
    : contribution.pluginName;

  const mod = await import(moduleId);

  // Form 1: Named export `commands`
  if (Array.isArray(mod.commands)) {
    return mod.commands.filter(isCommandInstance);
  }

  // Form 2: Default export (single or array)
  const defaultExport = mod.default;
  if (defaultExport) {
    if (Array.isArray(defaultExport)) {
      return defaultExport.filter(isCommandInstance);
    }
    if (isCommandInstance(defaultExport)) {
      return [defaultExport];
    }
  }

  // Fallback: search for any Command instances in module exports
  const commands: Command[] = [];
  for (const key of Object.keys(mod)) {
    if (isCommandInstance(mod[key])) {
      commands.push(mod[key]);
    }
  }

  return commands;
}

/**
 * Check if a value is a Commander.js Command instance.
 * Uses duck-typing to avoid import dependency issues.
 */
function isCommandInstance(value: unknown): value is Command {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as any).name === 'function' &&
    typeof (value as any).description === 'function' &&
    typeof (value as any).action === 'function' &&
    typeof (value as any).parse === 'function'
  );
}

/**
 * Resolve a human-readable name from a plugin object.
 */
function resolvePluginName(plugin: Record<string, unknown>): string {
  if (typeof plugin.name === 'string') return plugin.name;
  const manifest = plugin.manifest as Record<string, unknown> | undefined;
  if (manifest && typeof manifest.name === 'string') return manifest.name;
  if (plugin.constructor && plugin.constructor.name !== 'Object') return plugin.constructor.name;
  return 'unknown';
}
