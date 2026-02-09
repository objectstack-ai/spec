// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig } from '../utils/config.js';
import {
  printHeader,
  printKV,
  printSuccess,
  printError,
  printStep,
  createTimer,
  collectMetadataStats,
  printMetadataStats,
} from '../utils/format.js';

export const infoCommand = new Command('info')
  .description('Display metadata summary of an ObjectStack configuration')
  .argument('[config]', 'Configuration file path')
  .option('--json', 'Output as JSON')
  .action(async (configPath, options) => {
    const timer = createTimer();

    if (!options.json) {
      printHeader('Info');
    }

    try {
      const { config, absolutePath, duration } = await loadConfig(configPath);
      const stats = collectMetadataStats(config);

      if (options.json) {
        console.log(JSON.stringify({
          config: absolutePath,
          manifest: config.manifest || null,
          stats,
          objects: (config.objects || []).map((o: any) => ({
            name: o.name,
            label: o.label,
            fields: o.fields ? Object.keys(o.fields).length : 0,
          })),
          loadTime: duration,
        }, null, 2));
        return;
      }

      // Manifest
      if (config.manifest) {
        const m = config.manifest;
        console.log('');
        console.log(`  ${chalk.bold(m.name || m.id || 'Unnamed')} ${chalk.dim(`v${m.version || '0.0.0'}`)}`);
        if (m.id) console.log(chalk.dim(`  ${m.id}`));
        if (m.description) console.log(chalk.dim(`  ${m.description}`));
        if (m.namespace) printKV('  Namespace', m.namespace);
        if (m.type) printKV('  Type', m.type);
      }

      console.log('');
      printMetadataStats(stats);

      // Object details
      if (config.objects && config.objects.length > 0) {
        console.log('');
        console.log(chalk.bold('  Objects:'));
        for (const obj of config.objects) {
          const fieldCount = obj.fields ? Object.keys(obj.fields).length : 0;
          const ownership = obj.ownership || 'own';
          console.log(
            `    ${chalk.cyan(obj.name || '?')}` +
            chalk.dim(` (${fieldCount} fields, ${ownership})`) +
            (obj.label ? chalk.dim(` — ${obj.label}`) : '')
          );
        }
      }

      // Agent details
      if (config.agents && config.agents.length > 0) {
        console.log('');
        console.log(chalk.bold('  Agents:'));
        for (const agent of config.agents) {
          console.log(
            `    ${chalk.magenta(agent.name || '?')}` +
            (agent.role ? chalk.dim(` — ${agent.role}`) : '')
          );
        }
      }

      // App details
      if (config.apps && config.apps.length > 0) {
        console.log('');
        console.log(chalk.bold('  Apps:'));
        for (const app of config.apps) {
          console.log(
            `    ${chalk.green(app.name || '?')}` +
            (app.label ? chalk.dim(` — ${app.label}`) : '')
          );
        }
      }

      console.log('');
      console.log(chalk.dim(`  Loaded in ${duration}ms`));
      console.log('');

    } catch (error: any) {
      if (options.json) {
        console.log(JSON.stringify({ error: error.message }));
        process.exit(1);
      }
      console.log('');
      printError(error.message || String(error));
      process.exit(1);
    }
  });
