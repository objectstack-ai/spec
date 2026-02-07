import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { printHeader, printSuccess, printWarning, printError } from '../utils/format.js';

interface HealthCheckResult {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  fix?: string;
}

export const doctorCommand = new Command('doctor')
  .description('Check development environment health')
  .option('-v, --verbose', 'Show detailed information')
  .action(async (options) => {
    printHeader('Environment Health Check');
    
    const results: HealthCheckResult[] = [];
    
    // Check Node.js version
    try {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      
      if (majorVersion >= 18) {
        results.push({
          name: 'Node.js',
          status: 'ok',
          message: `Version ${nodeVersion}`,
        });
      } else {
        results.push({
          name: 'Node.js',
          status: 'error',
          message: `Version ${nodeVersion} (requires >= 18.0.0)`,
          fix: 'Upgrade Node.js: https://nodejs.org',
        });
      }
    } catch (error) {
      results.push({
        name: 'Node.js',
        status: 'error',
        message: 'Not found',
        fix: 'Install Node.js: https://nodejs.org',
      });
    }
    
    // Check pnpm
    try {
      const pnpmVersion = execSync('pnpm -v', { encoding: 'utf-8' }).trim();
      results.push({
        name: 'pnpm',
        status: 'ok',
        message: `Version ${pnpmVersion}`,
      });
    } catch (error) {
      results.push({
        name: 'pnpm',
        status: 'error',
        message: 'Not found',
        fix: 'Install pnpm: npm install -g pnpm@10.28.1',
      });
    }
    
    // Check TypeScript
    try {
      const tscVersion = execSync('tsc -v', { encoding: 'utf-8' }).trim();
      results.push({
        name: 'TypeScript',
        status: 'ok',
        message: tscVersion,
      });
    } catch (error) {
      results.push({
        name: 'TypeScript',
        status: 'warning',
        message: 'Not found in PATH',
        fix: 'Installed locally via pnpm',
      });
    }
    
    // Check if dependencies are installed
    const cwd = process.cwd();
    const nodeModulesPath = path.join(cwd, 'node_modules');
    
    if (fs.existsSync(nodeModulesPath)) {
      results.push({
        name: 'Dependencies',
        status: 'ok',
        message: 'Installed',
      });
    } else {
      results.push({
        name: 'Dependencies',
        status: 'error',
        message: 'Not installed',
        fix: 'Run: pnpm install',
      });
    }
    
    // Check if spec package is built
    const specDistPath = path.join(cwd, 'packages/spec/dist');
    
    if (fs.existsSync(specDistPath)) {
      results.push({
        name: '@objectstack/spec',
        status: 'ok',
        message: 'Built',
      });
    } else {
      results.push({
        name: '@objectstack/spec',
        status: 'warning',
        message: 'Not built',
        fix: 'Run: pnpm --filter @objectstack/spec build',
      });
    }
    
    // Check Git
    try {
      const gitVersion = execSync('git --version', { encoding: 'utf-8' }).trim();
      results.push({
        name: 'Git',
        status: 'ok',
        message: gitVersion,
      });
    } catch (error) {
      results.push({
        name: 'Git',
        status: 'warning',
        message: 'Not found',
        fix: 'Install Git for version control',
      });
    }
    
    // Display results
    let hasErrors = false;
    let hasWarnings = false;
    
    console.log('');
    results.forEach((result) => {
      const padded = result.name.padEnd(20);
      if (result.status === 'ok') {
        printSuccess(`${padded} ${result.message}`);
      } else if (result.status === 'warning') {
        printWarning(`${padded} ${result.message}`);
      } else {
        printError(`${padded} ${result.message}`);
      }
      
      if (result.fix && (options.verbose || result.status === 'error')) {
        console.log(chalk.dim(`      → ${result.fix}`));
      }
      
      if (result.status === 'error') hasErrors = true;
      if (result.status === 'warning') hasWarnings = true;
    });
    
    console.log('');
    
    // Summary
    if (hasErrors) {
      console.log(chalk.red('❌ Some critical issues found. Please fix them before continuing.'));
      results
        .filter(r => r.status === 'error' && r.fix)
        .forEach(r => console.log(chalk.dim(`   ${r.fix}`)));
      process.exit(1);
    } else if (hasWarnings) {
      console.log(chalk.yellow('⚠️  Environment is functional but has some warnings.'));
      console.log(chalk.dim('   Run with --verbose to see fix suggestions.'));
    } else {
      console.log(chalk.green('✅ Environment is healthy and ready for development!'));
    }
    
    console.log('');
  });
