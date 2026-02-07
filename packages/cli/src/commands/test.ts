import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { QA as CoreQA } from '@objectstack/core';
import { QA } from '@objectstack/spec';

export const testCommand = new Command('test')
  .description('Run Quality Protocol test scenarios against a running server')
  .argument('[files]', 'Glob pattern for test files (e.g. "qa/*.test.json")', 'qa/*.test.json')
  .option('--url <url>', 'Target base URL', 'http://localhost:3000')
  .option('--token <token>', 'Authentication token')
  .action(async (filesPattern, options) => {
    console.log(chalk.bold(`\n🧪 ObjectStack Quality Protocol Runner`));
    console.log(chalk.dim(`-------------------------------------`));
    console.log(`Target: ${chalk.blue(options.url)}`);
    
    // 1. Setup Runner
    const adapter = new CoreQA.HttpTestAdapter(options.url, options.token);
    const runner = new CoreQA.TestRunner(adapter);

    // 2. Find Files (Simple implementation for now)
    // TODO: Use glob
    const cwd = process.cwd();
    const testFiles: string[] = [];
    
    // Very basic file finding for demo - assume explicit path or check local dir
    if (fs.existsSync(filesPattern)) {
        testFiles.push(filesPattern);
    } else {
        // Simple directory scan
        const dir = path.dirname(filesPattern);
        const ext = path.extname(filesPattern);
        if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir).filter(f => f.endsWith(ext) || f.endsWith('.json'));
            files.forEach(f => testFiles.push(path.join(dir, f)));
        }
    }

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
  });
