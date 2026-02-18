// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Args, Command, Flags } from '@oclif/core';
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

export default class Compile extends Command {
  static override description = 'Compile ObjectStack configuration to JSON artifact';

  static override args = {
    config: Args.string({ description: 'Source configuration file', required: false }),
  };

  static override flags = {
    output: Flags.string({ char: 'o', description: 'Output JSON file', default: 'dist/objectstack.json' }),
    json: Flags.boolean({ description: 'Output compile result as JSON (for CI)' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Compile);
    const timer = createTimer();

    if (!flags.json) {
      printHeader('Compile');
    }

    try {
      // 1. Load Configuration
      if (!flags.json) printStep('Loading configuration...');
      const { config, absolutePath, duration } = await loadConfig(args.config);

      if (!flags.json) {
        printKV('Config', path.relative(process.cwd(), absolutePath));
        printKV('Load time', `${duration}ms`);
      }

      // 2. Normalize map-formatted stack definition and validate against Protocol
      if (!flags.json) printStep('Validating protocol compliance...');
      const normalized = normalizeStackInput(config as Record<string, unknown>);
      const result = ObjectStackDefinitionSchema.safeParse(normalized);

      if (!result.success) {
        if (flags.json) {
          console.log(JSON.stringify({ success: false, errors: (result.error as unknown as ZodError).issues }));
          this.exit(1);
        }
        console.log('');
        printError('Validation failed');
        formatZodErrors(result.error as unknown as ZodError);
        this.exit(1);
      }

      // 3. Generate Artifact
      if (!flags.json) printStep('Writing artifact...');
      const output = flags.output!;
      const artifactPath = path.resolve(process.cwd(), output);
      const artifactDir = path.dirname(artifactPath);

      if (!fs.existsSync(artifactDir)) {
        fs.mkdirSync(artifactDir, { recursive: true });
      }

      const jsonContent = JSON.stringify(result.data, null, 2);
      fs.writeFileSync(artifactPath, jsonContent);

      const sizeKB = (jsonContent.length / 1024).toFixed(1);
      const stats = collectMetadataStats(config);

      if (flags.json) {
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
      if (flags.json) {
        console.log(JSON.stringify({ success: false, error: error.message }));
        this.exit(1);
      }
      console.log('');
      printError(error.message || String(error));
      this.error(error.message || String(error));
    }
  }
}
