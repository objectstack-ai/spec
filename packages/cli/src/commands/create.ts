import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export const templates = {
  plugin: {
    description: 'Create a new ObjectStack plugin',
    files: {
      'package.json': (name: string) => ({
        name: `@objectstack/plugin-${name}`,
        version: '0.1.0',
        description: `ObjectStack Plugin: ${name}`,
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        scripts: {
          build: 'tsc',
          dev: 'tsc --watch',
          test: 'vitest',
        },
        keywords: ['objectstack', 'plugin', name],
        author: '',
        license: 'MIT',
        dependencies: {
          '@objectstack/spec': 'workspace:*',
          zod: '^3.22.4',
        },
        devDependencies: {
          '@types/node': '^20.10.0',
          typescript: '^5.3.0',
          vitest: '^2.1.8',
        },
      }),
      'tsconfig.json': () => ({
        extends: '../../tsconfig.json',
        compilerOptions: {
          outDir: 'dist',
          rootDir: 'src',
        },
        include: ['src/**/*'],
      }),
      'src/index.ts': (name: string) => `import type { Plugin } from '@objectstack/spec';

/**
 * ${name} Plugin for ObjectStack
 */
export const ${toCamelCase(name)}Plugin: Plugin = {
  name: '${name}',
  version: '0.1.0',
  
  async initialize(context) {
    console.log('Initializing ${name} plugin...');
    // Plugin initialization logic
  },
  
  async destroy() {
    console.log('Destroying ${name} plugin...');
    // Plugin cleanup logic
  },
};

export default ${toCamelCase(name)}Plugin;
`,
      'README.md': (name: string) => `# @objectstack/plugin-${name}

ObjectStack Plugin: ${name}

## Installation

\`\`\`bash
pnpm add @objectstack/plugin-${name}
\`\`\`

## Usage

\`\`\`typescript
import { ${toCamelCase(name)}Plugin } from '@objectstack/plugin-${name}';

// Use the plugin in your ObjectStack configuration
export default {
  plugins: [
    ${toCamelCase(name)}Plugin,
  ],
};
\`\`\`

## License

MIT
`,
    },
  },
  
  example: {
    description: 'Create a new ObjectStack example application',
    files: {
      'package.json': (name: string) => ({
        name: `@example/${name}`,
        version: '0.1.0',
        private: true,
        description: `ObjectStack Example: ${name}`,
        scripts: {
          build: 'objectstack compile',
          dev: 'objectstack dev',
          test: 'vitest',
        },
        dependencies: {
          '@objectstack/spec': 'workspace:*',
          '@objectstack/cli': 'workspace:*',
          zod: '^3.22.4',
        },
        devDependencies: {
          '@types/node': '^20.10.0',
          tsx: '^4.21.0',
          typescript: '^5.3.0',
          vitest: '^2.1.8',
        },
      }),
      'objectstack.config.ts': (name: string) => `import { defineStack } from '@objectstack/spec';

export default defineStack({
  manifest: {
    name: '${name}',
    version: '0.1.0',
    description: '${name} example application',
  },
  
  objects: [
    // Define your data objects here
    // { name: 'my_object', fields: { ... } }
  ],
  
  apps: [
    // Define your apps here
  ],
});
`,
      'README.md': (name: string) => `# ${name} Example

ObjectStack example application: ${name}

## Quick Start

\`\`\`bash
# Build the configuration
pnpm build

# Run in development mode
pnpm dev
\`\`\`

## Structure

- \`objectstack.config.ts\` - Main configuration file
- \`dist/objectstack.json\` - Compiled artifact

## Learn More

- [ObjectStack Documentation](../../content/docs)
- [Examples](../)
`,
      'tsconfig.json': () => ({
        extends: '../../tsconfig.json',
        compilerOptions: {
          outDir: 'dist',
          rootDir: '.',
        },
        include: ['*.ts', 'src/**/*'],
      }),
    },
  },
};

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

export const createCommand = new Command('create')
  .description('Create a new package, plugin, or example from template')
  .argument('<type>', 'Type of project to create (plugin, example)')
  .argument('[name]', 'Name of the project')
  .option('-d, --dir <directory>', 'Target directory')
  .action(async (type: string, name?: string, options?: { dir?: string }) => {
    console.log(chalk.bold(`\n📦 ObjectStack Project Creator`));
    console.log(chalk.dim(`-------------------------------`));
    
    if (!templates[type as keyof typeof templates]) {
      console.error(chalk.red(`\n❌ Unknown type: ${type}`));
      console.log(chalk.dim('Available types: plugin, example'));
      process.exit(1);
    }
    
    if (!name) {
      console.error(chalk.red('\n❌ Project name is required'));
      console.log(chalk.dim(`Usage: objectstack create ${type} <name>`));
      process.exit(1);
    }
    
    const template = templates[type as keyof typeof templates];
    const cwd = process.cwd();
    
    // Determine target directory
    let targetDir: string;
    if (options?.dir) {
      targetDir = path.resolve(cwd, options.dir);
    } else {
      const baseDir = type === 'plugin' ? 'packages/plugins' : 'examples';
      const projectName = type === 'plugin' ? `plugin-${name}` : name;
      targetDir = path.join(cwd, baseDir, projectName);
    }
    
    // Check if directory already exists
    if (fs.existsSync(targetDir)) {
      console.error(chalk.red(`\n❌ Directory already exists: ${targetDir}`));
      process.exit(1);
    }
    
    console.log(`📁 Creating ${type}: ${chalk.blue(name)}`);
    console.log(`📂 Location: ${chalk.dim(targetDir)}`);
    console.log('');
    
    try {
      // Create directory
      fs.mkdirSync(targetDir, { recursive: true });
      
      // Create files from template
      for (const [filePath, contentFn] of Object.entries(template.files)) {
        const fullPath = path.join(targetDir, filePath);
        const dir = path.dirname(fullPath);
        
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        const content = contentFn(name);
        const fileContent = typeof content === 'string' 
          ? content 
          : JSON.stringify(content, null, 2);
        
        fs.writeFileSync(fullPath, fileContent);
        console.log(chalk.green(`✓ Created ${filePath}`));
      }
      
      console.log('');
      console.log(chalk.green('✅ Project created successfully!'));
      console.log('');
      console.log(chalk.bold('Next steps:'));
      console.log(chalk.dim(`  cd ${path.relative(cwd, targetDir)}`));
      console.log(chalk.dim('  pnpm install'));
      console.log(chalk.dim('  pnpm build'));
      console.log('');
      
    } catch (error: any) {
      console.error(chalk.red('\n❌ Failed to create project:'));
      console.error(error.message || error);
      
      // Clean up on error
      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true });
      }
      
      process.exit(1);
    }
  });
