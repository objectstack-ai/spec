// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Args, Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { printHeader, printKV, printStep, printError } from '../utils/format.js';

export default class Dev extends Command {
  static override description = 'Start development mode with hot-reload';

  static override args = {
    package: Args.string({ description: 'Package name or filter pattern', default: 'all', required: false }),
  };

  static override flags = {
    watch: Flags.boolean({ char: 'w', description: 'Enable watch mode (default)', default: true }),
    ui: Flags.boolean({ description: 'Enable Studio UI at /_studio/' }),
    verbose: Flags.boolean({ char: 'v', description: 'Verbose output' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Dev);
    const packageName = args.package;

    printHeader('Development Mode');
    
    // Check if we are running inside a package (Single Package Mode)
    // If "package" argument is 'all' (default) AND objectstack.config.ts exists in CWD
    const configPath = path.resolve(process.cwd(), 'objectstack.config.ts');
    if (packageName === 'all' && fs.existsSync(configPath)) {
       printKV('Config', configPath, '📂');
       printStep('Starting dev server...');

       // Delegate to 'serve --dev'
       // We spawn a new process to ensure clean environment and watch capabilities (plugin-loader etc)
       // usage: objectstack serve --dev
       const binPath = process.argv[1]; // path to objectstack bin
       
       const child = spawn(process.execPath, [binPath, 'serve', '--dev', ...(flags.ui ? ['--ui'] : []), ...(flags.verbose ? ['--verbose'] : [])], {
         stdio: 'inherit',
         env: { ...process.env, NODE_ENV: 'development' }
       });

       return;
    }

    // Monorepo Orchestration Mode
    try {
      const cwd = process.cwd();
      
      // Only attempt monorepo orchestration if we are in a workspace root
      const workspaceConfigPath = path.resolve(cwd, 'pnpm-workspace.yaml');
      const isWorkspaceRoot = fs.existsSync(workspaceConfigPath);

      if (packageName === 'all' && !isWorkspaceRoot) {
          printError(`Config file not found in ${cwd}`);
          console.error(chalk.yellow('  Run in a directory with objectstack.config.ts, or from the monorepo root.'));
          process.exit(1);
      }

      const filter = packageName === 'all' ? '' : `--filter ${packageName}`;
      
      printKV('Package', packageName === 'all' ? 'All packages' : packageName, '📦');
      printKV('Watch', 'enabled', '🔄');
      
      // Start dev mode
      const command = `pnpm ${filter} dev`.trim();
      console.log(chalk.dim(`$ ${command}`));
      console.log('');
      
      execSync(command, { 
        stdio: 'inherit',
        cwd 
      });
      
    } catch (error: any) {
      printError(`Development mode failed: ${error.message || error}`);
      process.exit(1);
    }
  }
}
