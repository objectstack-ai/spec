import { Command } from 'commander';
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
export const studioCommand = new Command('studio')
  .description('Launch Studio UI with development server')
  .argument('[config]', 'Configuration file path', 'objectstack.config.ts')
  .option('-p, --port <port>', 'Server port', '3000')
  .action(async (configPath, options) => {
    printHeader('Studio');
    printKV('Mode', 'dev + ui', '🎨');
    printStep('Delegating to serve --dev --ui …');
    console.log('');

    // Delegate to the serve command with --dev --ui flags
    const binPath = process.argv[1];
    const args = [
      binPath,
      'serve',
      configPath,
      '--dev',
      '--ui',
      '--port', options.port,
    ];

    const child = spawn(process.execPath, args, {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' },
    });

    child.on('exit', (code) => process.exit(code ?? 0));
  });
