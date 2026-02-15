// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { ZodError } from 'zod';
import { ObjectStackDefinitionSchema, normalizeStackInput } from '@objectstack/spec';
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

export const compileCommand = new Command('compile')
  .description('Compile ObjectStack configuration to JSON artifact')
  .argument('[config]', 'Source configuration file')
  .option('-o, --output <path>', 'Output JSON file', 'dist/objectstack.json')
  .option('--json', 'Output compile result as JSON (for CI)')
  .action(async (configPath, options) => {
    const timer = createTimer();

    if (!options.json) {
      printHeader('Compile');
    }

    try {
      // 1. Load Configuration
      if (!options.json) printStep('Loading configuration...');
      const { config, absolutePath, duration } = await loadConfig(configPath);

      if (!options.json) {
        printKV('Config', path.relative(process.cwd(), absolutePath));
        printKV('Load time', `${duration}ms`);
      }

      // 2. Normalize map-formatted stack definition and validate against Protocol
      if (!options.json) printStep('Validating protocol compliance...');
      const normalized = normalizeStackInput(config as Record<string, unknown>);
      const result = ObjectStackDefinitionSchema.safeParse(normalized);

      if (!result.success) {
        if (options.json) {
          console.log(JSON.stringify({ success: false, errors: (result.error as unknown as ZodError).issues }));
          process.exit(1);
        }
        console.log('');
        printError('Validation failed');
        formatZodErrors(result.error as unknown as ZodError);
        process.exit(1);
      }

      // 3. Generate Artifact
      if (!options.json) printStep('Writing artifact...');
      const output = options.output;
      const artifactPath = path.resolve(process.cwd(), output);
      const artifactDir = path.dirname(artifactPath);

      if (!fs.existsSync(artifactDir)) {
        fs.mkdirSync(artifactDir, { recursive: true });
      }

      const jsonContent = JSON.stringify(result.data, null, 2);
      fs.writeFileSync(artifactPath, jsonContent);

      const sizeKB = (jsonContent.length / 1024).toFixed(1);
      const stats = collectMetadataStats(config);

      if (options.json) {
        console.log(JSON.stringify({
          success: true,
          output: artifactPath,
          size: jsonContent.length,
          stats,
          duration: timer.elapsed(),
        }));
        return;
      }

      // 4. Summary
      console.log('');
      printSuccess(`Build complete ${chalk.dim(`(${timer.display()})`)}`);
      console.log('');
      printMetadataStats(stats);
      console.log('');
      printKV('Artifact', `${output} ${chalk.dim(`(${sizeKB} KB`)})`);
      console.log('');

    } catch (error: any) {
      if (options.json) {
        console.log(JSON.stringify({ success: false, error: error.message }));
        process.exit(1);
      }
      console.log('');
      printError(error.message || String(error));
      process.exit(1);
    }
  });
