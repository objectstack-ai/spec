// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Args, Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { QA as CoreQA } from '@objectstack/core';
import { QA } from '@objectstack/spec';

/**
 * Resolve a glob-like pattern to matching file paths.
 * Supports `*` (single segment wildcard) and `**` (recursive wildcard).
 * Falls back to direct file path if no glob characters are present.
 */
function resolveGlob(pattern: string): string[] {
  // Direct file path — no wildcards
  if (!pattern.includes('*')) {
    return fs.existsSync(pattern) ? [pattern] : [];
  }

  // Split pattern into the static base directory and the glob portion
  const parts = pattern.split(path.sep.replace('\\', '/'));
  // Also handle forward-slash on Windows
  const segments = pattern.includes('/') ? pattern.split('/') : parts;

  let baseDir = '.';
  let globStart = 0;
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].includes('*')) {
      globStart = i;
      break;
    }
    baseDir = i === 0 ? segments[i] : path.join(baseDir, segments[i]);
  }

  if (!fs.existsSync(baseDir)) return [];

  // Convert the glob portion into a RegExp
  const globPortion = segments.slice(globStart).join('/');
  const regexStr = globPortion
    .replace(/\./g, '\\.')           // escape dots
    .replace(/\*\*\//g, '(.+/)?')   // ** matches any directory depth
    .replace(/\*\*/g, '.*')         // trailing ** without slash
    .replace(/\*/g, '[^/]*');       // * matches within a single segment
  const regex = new RegExp(`^${regexStr}$`);

  // Recursively read all files under baseDir
  const entries = fs.readdirSync(baseDir, { recursive: true, encoding: 'utf-8' }) as string[];
  return entries
    .filter(entry => regex.test(entry.replace(/\\/g, '/')))
    .map(entry => path.join(baseDir, entry))
    .filter(fullPath => fs.statSync(fullPath).isFile());
}

export default class Test extends Command {
  static override description = 'Run Quality Protocol test scenarios against a running server';

  static override args = {
    files: Args.string({ description: 'Glob pattern for test files (e.g. "qa/*.test.json")', required: false, default: 'qa/*.test.json' }),
  };

  static override flags = {
    url: Flags.string({ description: 'Target base URL', default: 'http://localhost:3000' }),
    token: Flags.string({ description: 'Authentication token' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Test);
    const filesPattern = args.files;

    console.log(chalk.bold(`\n🧪 ObjectStack Quality Protocol Runner`));
    console.log(chalk.dim(`-------------------------------------`));
    console.log(`Target: ${chalk.blue(flags.url)}`);
    
    // 1. Setup Runner
    const adapter = new CoreQA.HttpTestAdapter(flags.url, flags.token);
    const runner = new CoreQA.TestRunner(adapter);

    // 2. Find test files using glob-style pattern matching
    const testFiles: string[] = resolveGlob(filesPattern);

    if (testFiles.length === 0) {
        console.warn(chalk.yellow(`No test files found matching: ${filesPattern}`));
        // Create a demo test file if none exist?
        return;
    }

    console.log(`Found ${testFiles.length} test suites.`);

    // 3. Run Tests
    let totalPassed = 0;
    let totalFailed = 0;

    for (const file of testFiles) {
        console.log(`\n📄 Running suite: ${chalk.bold(path.basename(file))}`);
        try {
            const content = fs.readFileSync(file, 'utf-8');
            const suite = JSON.parse(content) as QA.TestSuite; // Should validate with Zod
            
            const results = await runner.runSuite(suite);
            
            for (const result of results) {
                const icon = result.passed ? '✅' : '❌';
                console.log(`  ${icon} Scenario: ${result.scenarioId} (${result.duration}ms)`);
                if (!result.passed) {
                   console.error(chalk.red(`     Error: ${result.error}`));
                   result.steps.forEach(step => {
                       if (!step.passed) {
                           console.error(chalk.red(`     Step Failed: ${step.stepName}`));
                           if (step.output) console.error(`     Output:`, step.output);
                           if (step.error) console.error(`     Error:`, step.error);
                       }
                   });
                   totalFailed++;
                } else {
                    totalPassed++;
                }
            }
        } catch (e) {
            console.error(chalk.red(`Failed to load or run suite ${file}: ${e}`));
            totalFailed++; // Count suite failure
        }
    }

    // 4. Summary
    console.log(chalk.dim(`\n-------------------------------------`));
    if (totalFailed > 0) {
        console.log(chalk.red(`FAILED: ${totalFailed} scenarios failed. ${totalPassed} passed.`));
        process.exit(1);
    } else {
        console.log(chalk.green(`SUCCESS: All ${totalPassed} scenarios passed.`));
        process.exit(0);
    }
  }
}
