// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Command } from 'commander';
import chalk from 'chalk';
import { ZodError } from 'zod';
import { ObjectStackDefinitionSchema } from '@objectstack/spec';
import { loadConfig } from '../utils/config.js';
import {
  printHeader,
  printKV,
  printSuccess,
  printError,
  printStep,
  createTimer,
  formatZodErrors,
  collectMetadataStats,
  printMetadataStats,
} from '../utils/format.js';

export const validateCommand = new Command('validate')
  .description('Validate ObjectStack configuration against the protocol schema')
  .argument('[config]', 'Configuration file path')
  .option('--strict', 'Treat warnings as errors')
  .option('--json', 'Output results as JSON')
  .action(async (configPath, options) => {
    const timer = createTimer();
    
    if (!options.json) {
      printHeader('Validate');
    }

    try {
      // 1. Load configuration
      if (!options.json) printStep('Loading configuration...');
      const { config, absolutePath, duration } = await loadConfig(configPath);
      
      if (!options.json) {
        printKV('Config', absolutePath);
        printKV('Load time', `${duration}ms`);
      }

      // 2. Validate against schema
      if (!options.json) printStep('Validating against ObjectStack Protocol...');
      const result = ObjectStackDefinitionSchema.safeParse(config);

      if (!result.success) {
        if (options.json) {
          console.log(JSON.stringify({
            valid: false,
            errors: (result.error as unknown as ZodError).issues,
            duration: timer.elapsed(),
          }, null, 2));
          process.exit(1);
        }

        console.log('');
        printError('Validation failed');
        formatZodErrors(result.error as unknown as ZodError);
        process.exit(1);
      }

      // 3. Collect and display stats
      const stats = collectMetadataStats(config);

      if (options.json) {
        console.log(JSON.stringify({
          valid: true,
          manifest: config.manifest,
          stats,
          duration: timer.elapsed(),
        }, null, 2));
        return;
      }

      // 4. Warnings (non-blocking)
      const warnings: string[] = [];
      
      if (stats.objects === 0) {
        warnings.push('No objects defined — this stack has no data model');
      }
      if (stats.apps === 0 && stats.plugins === 0) {
        warnings.push('No apps or plugins defined — this stack may not do much');
      }
      if (!config.manifest?.id) {
        warnings.push('Missing manifest.id — required for deployment');
      }
      if (!config.manifest?.namespace) {
        warnings.push('Missing manifest.namespace — required for multi-app hosting');
      }

      // 5. Display results
      console.log('');
      printSuccess(`Validation passed ${chalk.dim(`(${timer.display()})`)}`);
      console.log('');

      if (config.manifest) {
        console.log(`  ${chalk.bold(config.manifest.name || config.manifest.id || 'Unnamed')} ${chalk.dim(`v${config.manifest.version || '0.0.0'}`)}`);
        if (config.manifest.description) {
          console.log(chalk.dim(`  ${config.manifest.description}`));
        }
        console.log('');
      }

      printMetadataStats(stats);

      if (warnings.length > 0) {
        console.log('');
        for (const w of warnings) {
          console.log(chalk.yellow(`  ⚠ ${w}`));
        }
        if (options.strict) {
          console.log('');
          printError('Strict mode: warnings treated as errors');
          process.exit(1);
        }
      }

      console.log('');
    } catch (error: any) {
      if (options.json) {
        console.log(JSON.stringify({
          valid: false,
          error: error.message,
          duration: timer.elapsed(),
        }, null, 2));
        process.exit(1);
      }
      console.log('');
      printError(error.message || String(error));
      process.exit(1);
    }
  });
