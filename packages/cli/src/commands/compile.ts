import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';
import chalk from 'chalk';
import { bundleRequire } from 'bundle-require';
import { ZodError } from 'zod';
import { ObjectStackDefinitionSchema } from '@objectstack/spec';

export const compileCommand = new Command('compile')
  .description('Compile ObjectStack configuration to JSON definition')
  .argument('[source]', 'Source configuration file', 'objectstack.config.ts')
  .argument('[output]', 'Output JSON file', 'dist/objectstack.json')
  .action(async (source, output) => {
    const start = Date.now();
    console.log(chalk.bold(`\n🔹 ObjectStack Compiler v0.1`));
    console.log(chalk.dim(`------------------------------`));
    console.log(`📂 Source: ${chalk.blue(source)}`);
    
    const absolutePath = path.resolve(process.cwd(), source);
    if (!fs.existsSync(absolutePath)) {
      console.error(chalk.red(`\n❌ Config file not found: ${absolutePath}`));
      process.exit(1);
    }

    try {
      // 1. Load Configuration
      console.log(chalk.yellow(`📦 Bundling Configuration...`));
      const { mod } = await bundleRequire({
        filepath: absolutePath,
      });

      const config = mod.default || mod;

      if (!config) {
        throw new Error(`Default export not found in ${source}`);
      }

      // 2. Validate against Protocol
      console.log(chalk.yellow(`🔍 Validating Protocol Compliance...`));
      const result = ObjectStackDefinitionSchema.safeParse(config);

      if (!result.success) {
        console.error(chalk.red(`\n❌ Validation Failed!`));
        
        const error = result.error as unknown as ZodError;
        error.issues.forEach((e: any) => {
          console.error(chalk.red(`   - [${e.path.join('.')}] ${e.message}`));
        });
        
        process.exit(1);
      }

      // 3. Generate Artifact
      const artifactPath = path.resolve(process.cwd(), output);
      const artifactDir = path.dirname(artifactPath);
      
      if (!fs.existsSync(artifactDir)) {
        fs.mkdirSync(artifactDir, { recursive: true });
      }
      
      const jsonContent = JSON.stringify(result.data, null, 2);
      fs.writeFileSync(artifactPath, jsonContent);

      const size = (jsonContent.length / 1024).toFixed(2);
      console.log(chalk.green(`\n✅ Build Success (${Date.now() - start}ms)`));
      console.log(`📦 Artifact: ${chalk.blue(output)} (${size} KB)`);
      console.log(chalk.magenta(`✨ Ready for Deployment`));

    } catch (error: any) {
      console.error(chalk.red(`\n❌ Compilation Error:`));
      console.error(error.message || error);
      process.exit(1);
    }
  });
