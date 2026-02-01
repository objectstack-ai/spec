import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';

export const devCommand = new Command('dev')
  .description('Start development mode for a package')
  .argument('[package]', 'Package name (without @objectstack/ prefix)', 'all')
  .option('-w, --watch', 'Enable watch mode (default)', true)
  .option('-v, --verbose', 'Verbose output')
  .action(async (packageName, options) => {
    console.log(chalk.bold(`\n🚀 ObjectStack Development Mode`));
    console.log(chalk.dim(`-------------------------------`));
    
    try {
      const cwd = process.cwd();
      const filter = packageName === 'all' ? '' : `--filter @objectstack/${packageName}`;
      
      console.log(`📦 Package: ${chalk.blue(packageName === 'all' ? 'All packages' : `@objectstack/${packageName}`)}`);
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
