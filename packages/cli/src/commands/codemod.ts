// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { printHeader, printSuccess, printError, printInfo, printStep, createTimer } from '../utils/format.js';

// ─── Transform Definitions ──────────────────────────────────────────

interface Transform {
  pattern: RegExp;
  replacement: string;
  description: string;
}

const V2_TO_V3_TRANSFORMS: Transform[] = [
  {
    pattern: /\bEnhancedObjectKernel\b/g,
    replacement: 'ObjectKernel',
    description: 'EnhancedObjectKernel → ObjectKernel',
  },
  {
    pattern: /\bmax_length\b/g,
    replacement: 'maxLength',
    description: 'max_length → maxLength',
  },
  {
    pattern: /\breference_filters\b/g,
    replacement: 'referenceFilters',
    description: 'reference_filters → referenceFilters',
  },
  {
    pattern: /\bdefault_value\b/g,
    replacement: 'defaultValue',
    description: 'default_value → defaultValue',
  },
  {
    pattern: /\bmin_length\b/g,
    replacement: 'minLength',
    description: 'min_length → minLength',
  },
  {
    pattern: /\bunique_name\b/g,
    replacement: 'uniqueName',
    description: 'unique_name → uniqueName',
  },
  {
    pattern: /from\s+['"]@objectstack\/core\/enhanced['"]/g,
    replacement: "from '@objectstack/core'",
    description: 'Update import from @objectstack/core/enhanced',
  },
  {
    pattern: /from\s+['"]@objectstack\/spec\/dist\/[^'"]+['"]/g,
    replacement: "from '@objectstack/spec'",
    description: 'Update deep import from @objectstack/spec/dist/',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────

function walkDir(dir: string, ext: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath, ext));
    } else if (entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

// ─── v2-to-v3 Sub-Command ──────────────────────────────────────────

const v2ToV3Command = new Command('v2-to-v3')
  .description('Migrate ObjectStack v2 code patterns to v3')
  .option('--dir <directory>', 'Directory to scan', 'src/')
  .option('--dry-run', 'Show changes without writing files')
  .action(async (options) => {
    printHeader('Codemod: v2 → v3');

    const timer = createTimer();
    const dir = path.resolve(process.cwd(), options.dir);

    if (!fs.existsSync(dir)) {
      printError(`Directory not found: ${dir}`);
      process.exit(1);
    }

    console.log(`  ${chalk.dim('Directory:')} ${chalk.white(options.dir)}`);
    console.log(`  ${chalk.dim('Dry run:')}   ${chalk.white(options.dryRun ? 'yes' : 'no')}`);
    console.log('');

    printStep('Scanning TypeScript files...');
    const files = walkDir(dir, '.ts');

    if (files.length === 0) {
      printInfo('No .ts files found in directory');
      return;
    }

    printInfo(`Found ${files.length} TypeScript file(s)`);
    console.log('');

    let totalTransforms = 0;
    let filesModified = 0;
    const transformCounts: Record<string, number> = {};

    for (const file of files) {
      const original = fs.readFileSync(file, 'utf-8');
      let content = original;
      let fileTransforms = 0;

      for (const transform of V2_TO_V3_TRANSFORMS) {
        const matches = content.match(transform.pattern);
        if (matches) {
          const count = matches.length;
          content = content.replace(transform.pattern, transform.replacement);
          fileTransforms += count;
          transformCounts[transform.description] = (transformCounts[transform.description] || 0) + count;
        }
      }

      if (fileTransforms > 0) {
        const relPath = path.relative(process.cwd(), file);
        filesModified++;
        totalTransforms += fileTransforms;

        if (options.dryRun) {
          printInfo(`${relPath} — ${fileTransforms} change(s)`);
        } else {
          fs.writeFileSync(file, content);
          printSuccess(`${relPath} — ${fileTransforms} change(s)`);
        }
      }
    }

    console.log('');

    if (totalTransforms === 0) {
      printSuccess('No v2 patterns found — code is already v3 compatible');
    } else {
      console.log(chalk.bold('  Summary:'));
      for (const [desc, count] of Object.entries(transformCounts)) {
        console.log(`    ${chalk.dim(desc)}: ${chalk.white(count)}`);
      }
      console.log('');

      if (options.dryRun) {
        printInfo(`Would modify ${filesModified} file(s) with ${totalTransforms} total change(s)`);
        console.log(chalk.dim('  Run without --dry-run to apply changes'));
      } else {
        printSuccess(`Modified ${filesModified} file(s) with ${totalTransforms} total change(s) (${timer.display()})`);
      }
    }

    console.log('');
  });

// ─── Main Codemod Command ───────────────────────────────────────────

export const codemodCommand = new Command('codemod')
  .description('Run automated code transformations')
  .addCommand(v2ToV3Command)
  .action(() => {
    printHeader('Codemod');
    console.log(chalk.bold('  Available codemods:'));
    console.log(`    ${chalk.cyan('v2-to-v3'.padEnd(16))} Migrate ObjectStack v2 code patterns to v3`);
    console.log('');
    console.log(chalk.dim('  Usage: objectstack codemod v2-to-v3 [--dir src/] [--dry-run]'));
    console.log('');
  });
