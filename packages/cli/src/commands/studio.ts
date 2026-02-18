// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Args, Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { printHeader, printKV, printStep } from '../utils/format.js';

/**
 * `objectstack studio` — Launch the ObjectStack Studio UI.
 *
 * Alias for `objectstack serve --dev --ui`.
 * Starts the ObjectStack server in development mode with the Studio
 * UI available at http://localhost:<port>/_studio/
 */
export default class Studio extends Command {
  static override description = 'Launch Studio UI with development server';

  static override args = {
    config: Args.string({ description: 'Configuration file path', required: false, default: 'objectstack.config.ts' }),
  };

  static override flags = {
    port: Flags.string({ char: 'p', description: 'Server port', default: '3000' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Studio);

    printHeader('Studio');
    printKV('Mode', 'dev + ui', '🎨');
    printStep('Delegating to serve --dev --ui …');
    console.log('');

    // Delegate to the serve command with --dev --ui flags
    const binPath = process.argv[1];
    const spawnArgs = [
      binPath,
      'serve',
      args.config!,
      '--dev',
      '--ui',
      '--port', flags.port,
    ];

    const child = spawn(process.execPath, spawnArgs, {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' },
    });

    child.on('exit', (code) => process.exit(code ?? 0));
  }
}
