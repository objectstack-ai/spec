import { Command } from 'commander';
import chalk from 'chalk';
import { execSync, spawn } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';

export const devCommand = new Command('dev')
  .description('Start development mode for a package')
  .argument('[package]', 'Package name or filter pattern', 'all')
  .option('-w, --watch', 'Enable watch mode (default)', true)
  .option('-v, --verbose', 'Verbose output')
  .action(async (packageName, options) => {
    console.log(chalk.bold(`\n🚀 ObjectStack Development Mode`));
    console.log(chalk.dim(`-------------------------------`));
    
    // Check if we are running inside a package (Single Package Mode)
    // If "package" argument is 'all' (default) AND objectstack.config.ts exists in CWD
    const configPath = path.resolve(process.cwd(), 'objectstack.config.ts');
    if (packageName === 'all' && fs.existsSync(configPath)) {
       console.log(chalk.blue(`📂 Detected package config: ${configPath}`));
       console.log(chalk.green(`⚡ Starting Dev Server...`));
       console.log('');

       // Delegate to 'serve --dev'
       // We spawn a new process to ensure clean environment and watch capabilities (plugin-loader etc)
       // usage: objectstack serve --dev
       const binPath = process.argv[1]; // path to objectstack bin
       
       const child = spawn(process.execPath, [binPath, 'serve', '--dev', ...(options.verbose ? ['--verbose'] : [])], {
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
          console.error(chalk.red(`\n❌ Configuration file (objectstack.config.ts) not found in ${cwd}`));
          console.error(chalk.yellow(`   To start development mode, run this command in a directory with objectstack.config.ts`));
          console.error(chalk.yellow(`   OR run from the monorepo root to start all packages.`));
          process.exit(1);
      }

      const filter = packageName === 'all' ? '' : `--filter ${packageName}`;
      
      console.log(`📦 Package: ${chalk.blue(packageName === 'all' ? 'All packages' : packageName)}`);
      console.log(`🔄 Watch mode: ${chalk.green('enabled')}`);
      console.log('');
      
      // Start dev mode
      const command = `pnpm ${filter} dev`.trim();
      console.log(chalk.dim(`$ ${command}`));
      console.log('');
      
      execSync(command, { 
        stdio: 'inherit',
        cwd 
      });
      
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Development mode failed:`));
      console.error(error.message || error);
      process.exit(1);
    }
  });
