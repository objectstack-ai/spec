import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';
import { ObjectStackDefinitionSchema } from '../stack.zod';

async function compile(configPath: string, outputPath: string) {
  const start = Date.now();
  console.log(`\n🔹 ObjectStack Compiler v0.1`);
  console.log(`------------------------------`);
  console.log(`📂 Source: ${configPath}`);
  
  const absolutePath = path.resolve(process.cwd(), configPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Config file not found: ${absolutePath}`);
  }

  try {
    // 1. Load Configuration
    // We use dynamic import to load the TS/JS file. 
    // This expects the environment (tsx/node) to handle TS compilation if needed.
    const imported = await import(pathToFileURL(absolutePath).href);
    const config = imported.default || imported;

    if (!config) {
      throw new Error(`Default export not found in ${configPath}`);
    }

    // 2. Validate against Protocol
    console.log(`🔍 Validating Protocol Compliance...`);
    const result = ObjectStackDefinitionSchema.safeParse(config);

    if (!result.success) {
      console.error(`\n❌ Validation Failed!`);
      // Simpler error formatting
      const errors = result.error.errors.map(e => `   - [${e.path.join('.')}] ${e.message}`).join('\n');
      console.error(errors);
      process.exit(1);
    }

    // 3. Generate Artifact
    const artifactPath = path.resolve(process.cwd(), outputPath);
    const artifactDir = path.dirname(artifactPath);
    
    if (!fs.existsSync(artifactDir)) {
      fs.mkdirSync(artifactDir, { recursive: true });
    }
    
    const jsonContent = JSON.stringify(result.data, null, 2);
    fs.writeFileSync(artifactPath, jsonContent);

    const size = (jsonContent.length / 1024).toFixed(2);
    console.log(`✅ Build Success (${Date.now() - start}ms)`);
    console.log(`📦 Artifact: ${outputPath} (${size} KB)`);
    console.log(`✨ Ready for Deployment`);

  } catch (error: any) {
    console.error(`\n❌ Compilation Error:`);
    console.error(error.message || error);
    process.exit(1);
  }
}

// CLI Entrypoint
const args = process.argv.slice(2);
const configFile = args[0] || 'objectstack.config.ts';
const outputFile = args[1] || 'dist/objectstack.json';

compile(configFile, outputFile);
