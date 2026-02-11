// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';

/**
 * # CLI Extension Protocol
 * 
 * Defines the contract for plugins that extend the ObjectStack CLI with
 * custom commands. This enables third-party packages (e.g., marketplace,
 * deployment tools) to register new top-level or nested CLI commands.
 * 
 * ## How It Works
 * 
 * 1. **Declare** — Plugin's manifest declares `contributes.commands` entries.
 * 2. **Discover** — The CLI scans installed plugins for command contributions.
 * 3. **Load** — The CLI dynamically imports the plugin module and registers
 *    exported Commander.js `Command` instances.
 * 
 * ## Plugin Module Contract
 * 
 * The plugin must export commands in one of these forms:
 * 
 * ```typescript
 * // Form 1: Named export array
 * export const commands = [marketplaceCommand, deployCommand];
 * 
 * // Form 2: Default export (single command)
 * export default marketplaceCommand;
 * 
 * // Form 3: Default export (array)
 * export default [marketplaceCommand, deployCommand];
 * ```
 * 
 * @example
 * ```typescript
 * // In @acme/plugin-marketplace/src/cli.ts
 * import { Command } from 'commander';
 * 
 * const marketplaceCommand = new Command('marketplace')
 *   .description('Manage marketplace applications')
 *   .addCommand(
 *     new Command('publish')
 *       .description('Publish app to marketplace')
 *       .action(async () => { ... })
 *   )
 *   .addCommand(
 *     new Command('search')
 *       .description('Search marketplace apps')
 *       .argument('<query>', 'Search query')
 *       .action(async (query) => { ... })
 *   );
 * 
 * export const commands = [marketplaceCommand];
 * ```
 */

/**
 * Schema for a CLI Command Contribution declaration in the manifest.
 * 
 * This is the declarative metadata — the actual Commander.js `Command`
 * objects are loaded at runtime from the plugin's module.
 */
export const CLICommandContributionSchema = z.object({
  /** 
   * CLI command name. Must be a valid identifier: lowercase alphanumeric with hyphens.
   * This becomes a top-level subcommand of the `os` CLI.
   * 
   * @example "marketplace"
   * @example "deploy"
   * @example "cloud-sync"
   */
  name: z.string()
    .regex(/^[a-z][a-z0-9-]*$/, 'Command name must be lowercase alphanumeric with hyphens')
    .describe('CLI command name'),

  /** Brief description shown in `os --help` output. */
  description: z.string().optional().describe('Command description for help text'),

  /** 
   * Module path that exports the Commander.js command(s).
   * Relative to the plugin package root. If omitted, the CLI 
   * imports from the package's main entry point.
   * 
   * The module must export one of:
   * - `export const commands: Command[]`
   * - `export default Command | Command[]`
   * 
   * @example "./dist/cli.js"
   * @example "./cli"
   */
  module: z.string().optional().describe('Module path exporting Commander.js commands'),
});

/**
 * Schema for the CLI Extension module contract.
 * Validates the shape of what a plugin module should export for CLI integration.
 */
export const CLIExtensionExportSchema = z.object({
  /** Named export: array of Commander.js Command instances */
  commands: z.array(z.unknown()).optional()
    .describe('Array of Commander.js Command instances'),

  /** Default export: single Command or array of Commands */
  default: z.union([
    z.unknown(),
    z.array(z.unknown()),
  ]).optional()
    .describe('Default export: Command or Command[]'),
});

// ─── Types ───────────────────────────────────────────────────────────

export type CLICommandContribution = z.infer<typeof CLICommandContributionSchema>;
export type CLIExtensionExport = z.infer<typeof CLIExtensionExportSchema>;
