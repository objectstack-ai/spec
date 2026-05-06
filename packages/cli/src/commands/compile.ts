// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Args, Command, Flags } from '@oclif/core';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { ZodError } from 'zod';
import { ObjectStackDefinitionSchema, normalizeStackInput } from '@objectstack/spec';
import { loadConfig } from '../utils/config.js';
import { lowerCallables } from '../utils/lower-callables.js';
import { buildRuntimeBundle, cleanupOldRuntimeBundles } from '../utils/build-runtime.js';
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

      // 2. Normalize map-formatted stack definition.
      if (!flags.json) printStep('Normalizing stack definition...');
      const normalized = normalizeStackInput(config as Record<string, unknown>);

      // 2b. Lower inline `function` handlers (Hook.handler, top-level
      //     `functions`) to stable string refs BEFORE Zod parse. This
      //     guarantees we extract the user's real function identity (Zod's
      //     `z.function()` wraps callables and would otherwise break the
      //     mapping). The originals are bundled into a sibling ESM module
      //     by esbuild — without this step `JSON.stringify` would silently
      //     drop every handler and the production server would boot with
      //     all hooks disabled.
      if (!flags.json) printStep('Lowering inline handlers...');
      const lowering = lowerCallables(normalized);

      // 3. Validate the lowered (JSON-safe) stack against the Protocol.
      if (!flags.json) printStep('Validating protocol compliance...');
      const result = ObjectStackDefinitionSchema.safeParse(lowering.lowered);

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

      // 4. Generate Artifact
      if (!flags.json) printStep('Writing artifact...');
      const output = flags.output!;
      const artifactPath = path.resolve(process.cwd(), output);
      const artifactDir = path.dirname(artifactPath);

      if (!fs.existsSync(artifactDir)) {
        fs.mkdirSync(artifactDir, { recursive: true });
      }

      const finalBundle: Record<string, unknown> = { ...(result.data as Record<string, unknown>) };

      // 4b. Bundle handler functions into `<artifactDir>/objectstack-runtime.{hash}.mjs`
      //     and stamp the relative path into the JSON so the runtime can
      //     dynamic-import it at boot.
      let runtimeBundle: { outputFileName: string; hash: string; size: number } | null = null;
      if (lowering.count > 0) {
        if (!flags.json) printStep(`Bundling ${lowering.count} handler${lowering.count === 1 ? '' : 's'}...`);
        try {
          runtimeBundle = await buildRuntimeBundle({
            sourceConfigPath: absolutePath,
            refs: Object.keys(lowering.functions),
            outputDir: artifactDir,
          });
          finalBundle.runtimeModule = `./${runtimeBundle.outputFileName}`;
          cleanupOldRuntimeBundles(artifactDir, runtimeBundle.outputFileName);
        } catch (err: any) {
          if (flags.json) {
            console.log(JSON.stringify({ success: false, error: `runtime bundle failed: ${err.message}` }));
            this.exit(1);
          }
          console.log('');
          printError(`Runtime bundle failed: ${err.message}`);
          this.error(err.message);
        }
      }

      const jsonContent = JSON.stringify(finalBundle, null, 2);
      fs.writeFileSync(artifactPath, jsonContent);

      const sizeKB = (jsonContent.length / 1024).toFixed(1);
      const stats = collectMetadataStats(config);

      if (flags.json) {
        console.log(JSON.stringify({
          success: true,
          output: artifactPath,
          size: jsonContent.length,
          handlersBundled: lowering.count,
          runtimeModule: runtimeBundle?.outputFileName ?? null,
          runtimeModuleSize: runtimeBundle?.size ?? 0,
          stats,
          duration: timer.elapsed(),
        }));
        return;
      }

      // 5. Summary
      console.log('');
      printSuccess(`Build complete ${chalk.dim(`(${timer.display()})`)}`);
      console.log('');
      printMetadataStats(stats);
      console.log('');
      printKV('Artifact', `${output} ${chalk.dim(`(${sizeKB} KB`)})`);
      if (runtimeBundle) {
        const runtimeKB = (runtimeBundle.size / 1024).toFixed(1);
        printKV(
          'Runtime',
          `${path.join(path.dirname(output), runtimeBundle.outputFileName)} ${chalk.dim(`(${runtimeKB} KB, ${lowering.count} handler${lowering.count === 1 ? '' : 's'})`)}`,
        );
      }
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
