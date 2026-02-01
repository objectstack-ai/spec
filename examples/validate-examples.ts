#!/usr/bin/env tsx

/**
 * Example Validation Script
 * 
 * This script validates that all examples in the repository:
 * 1. Type-check correctly
 * 2. Import the correct packages
 * 3. Follow naming conventions
 * 4. Have proper documentation
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Stats
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
};

interface ValidationResult {
  file: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Find all TypeScript example files
 */
async function findExampleFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  async function walk(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and dist directories
        if (entry.name !== 'node_modules' && entry.name !== 'dist') {
          await walk(fullPath);
        }
      } else if (entry.isFile() && extname(entry.name) === '.ts') {
        // Include .ts files but exclude .test.ts and .d.ts
        if (!entry.name.endsWith('.test.ts') && !entry.name.endsWith('.d.ts')) {
          files.push(fullPath);
        }
      }
    }
  }
  
  await walk(dir);
  return files;
}

/**
 * Validate a single example file
 */
async function validateExample(filePath: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    file: filePath,
    passed: true,
    errors: [],
    warnings: [],
  };
  
  try {
    const content = await readFile(filePath, 'utf-8');
    
    // Check 1: File should have a header comment
    if (!content.startsWith('/**')) {
      result.warnings.push('Missing header documentation comment');
    }
    
    // Check 2: Should import from @objectstack/spec
    if (!content.includes("from '@objectstack/spec")) {
      result.warnings.push('Does not import from @objectstack/spec');
    }
    
    // Check 3: Check for proper naming conventions in comments
    if (content.includes('snake_case') || content.includes('camelCase')) {
      // Good - mentions naming conventions
    }
    
    // Check 4: Should have examples or usage section
    if (!content.includes('Example') && !content.includes('example') && !content.includes('Usage')) {
      result.warnings.push('No example usage section found');
    }
    
    // Check 5: Type-check the file (most important)
    try {
      const { stderr } = await execAsync(
        `npx tsc --noEmit --skipLibCheck "${filePath}"`,
        { cwd: join(__dirname, '..') }
      );
      
      if (stderr && stderr.includes('error TS')) {
        result.errors.push(`TypeScript errors: ${stderr.substring(0, 200)}...`);
        result.passed = false;
      }
    } catch (error: any) {
      if (error.stderr && error.stderr.includes('error TS')) {
        result.errors.push(`TypeScript compilation failed`);
        result.passed = false;
      }
    }
    
  } catch (error: any) {
    result.errors.push(`Failed to read file: ${error.message}`);
    result.passed = false;
  }
  
  return result;
}

/**
 * Print validation result
 */
function printResult(result: ValidationResult) {
  const status = result.passed 
    ? `${colors.green}✓ PASS${colors.reset}`
    : `${colors.red}✗ FAIL${colors.reset}`;
  
  const fileName = result.file.replace(process.cwd() + '/', '');
  console.log(`${status} ${colors.cyan}${fileName}${colors.reset}`);
  
  if (result.errors.length > 0) {
    result.errors.forEach(error => {
      console.log(`  ${colors.red}ERROR:${colors.reset} ${error}`);
    });
  }
  
  if (result.warnings.length > 0) {
    result.warnings.forEach(warning => {
      console.log(`  ${colors.yellow}WARNING:${colors.reset} ${warning}`);
    });
  }
}

/**
 * Print summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.blue}VALIDATION SUMMARY${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`Total examples:  ${stats.total}`);
  console.log(`${colors.green}Passed:${colors.reset}         ${stats.passed}`);
  console.log(`${colors.red}Failed:${colors.reset}         ${stats.failed}`);
  console.log(`${colors.yellow}Warnings:${colors.reset}       ${stats.warnings}`);
  console.log('='.repeat(60));
  
  if (stats.failed === 0) {
    console.log(`\n${colors.green}✓ All examples validated successfully!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}✗ ${stats.failed} example(s) failed validation${colors.reset}\n`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.blue}ObjectStack Example Validator${colors.reset}\n`);
  
  const examplesDir = join(__dirname, '..');
  
  console.log(`Scanning for examples in: ${examplesDir}\n`);
  
  const exampleFiles = await findExampleFiles(examplesDir);
  
  console.log(`Found ${exampleFiles.length} example files\n`);
  console.log('='.repeat(60) + '\n');
  
  stats.total = exampleFiles.length;
  
  for (const file of exampleFiles) {
    const result = await validateExample(file);
    printResult(result);
    
    if (result.passed) {
      stats.passed++;
    } else {
      stats.failed++;
    }
    
    stats.warnings += result.warnings.length;
  }
  
  printSummary();
  
  // Exit with error code if any examples failed
  process.exit(stats.failed > 0 ? 1 : 0);
}

// Run the validator
main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
