// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { printHeader, printSuccess, printError, printStep, printKV, printInfo } from '../utils/format.js';

const TEMPLATES: Record<string, {
  description: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  configContent: (name: string) => string;
  srcFiles: Record<string, (name: string) => string>;
}> = {
  app: {
    description: 'Full application with objects, views, and actions',
    dependencies: {
      '@objectstack/spec': 'workspace:*',
      '@objectstack/runtime': 'workspace:^',
      '@objectstack/objectql': 'workspace:^',
      '@objectstack/driver-memory': 'workspace:^',
    },
    devDependencies: {
      '@objectstack/cli': 'workspace:*',
      'typescript': '^5.3.0',
    },
    scripts: {
      dev: 'objectstack dev',
      start: 'objectstack serve',
      build: 'objectstack compile',
      validate: 'objectstack validate',
      typecheck: 'tsc --noEmit',
    },
    configContent: (name: string) => `import { defineStack } from '@objectstack/spec';
import * as objects from './src/objects';

export default defineStack({
  manifest: {
    id: 'com.example.${name}',
    namespace: '${name}',
    version: '0.1.0',
    type: 'app',
    name: '${toTitleCase(name)}',
    description: '${toTitleCase(name)} application built with ObjectStack',
  },

  objects: Object.values(objects),
});
`,
    srcFiles: {
      'src/objects/index.ts': (name) => `export { default as ${toCamelCase(name)} } from './${name}';
`,
      'src/objects/__name__.ts': (name) => `import { Data } from '@objectstack/spec';

const ${toCamelCase(name)}: Data.Object = {
  name: '${name}',
  label: '${toTitleCase(name)}',
  ownership: 'own',
  fields: {
    name: {
      type: 'text',
      label: 'Name',
      required: true,
    },
    description: {
      type: 'textarea',
      label: 'Description',
    },
    status: {
      type: 'select',
      label: 'Status',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
    },
  },
};

export default ${toCamelCase(name)};
`,
    },
  },

  plugin: {
    description: 'Reusable plugin with objects and extensions',
    dependencies: {
      '@objectstack/spec': 'workspace:*',
    },
    devDependencies: {
      'typescript': '^5.3.0',
      'vitest': '^4.0.18',
    },
    scripts: {
      build: 'objectstack compile',
      validate: 'objectstack validate',
      test: 'vitest run',
      typecheck: 'tsc --noEmit',
    },
    configContent: (name: string) => `import { defineStack } from '@objectstack/spec';
import * as objects from './src/objects';

export default defineStack({
  manifest: {
    id: 'com.objectstack.plugin-${name}',
    namespace: 'plugin_${name}',
    version: '0.1.0',
    type: 'plugin',
    name: '${toTitleCase(name)} Plugin',
    description: 'ObjectStack Plugin: ${toTitleCase(name)}',
  },

  objects: Object.values(objects),
});
`,
    srcFiles: {
      'src/objects/index.ts': (name) => `export { default as ${toCamelCase(name)} } from './${name}';
`,
      'src/objects/__name__.ts': (name) => `import { Data } from '@objectstack/spec';

const ${toCamelCase(name)}: Data.Object = {
  name: '${name}',
  label: '${toTitleCase(name)}',
  ownership: 'own',
  fields: {
    name: {
      type: 'text',
      label: 'Name',
      required: true,
    },
  },
};

export default ${toCamelCase(name)};
`,
    },
  },

  empty: {
    description: 'Minimal project with just a config file',
    dependencies: {
      '@objectstack/spec': 'workspace:*',
    },
    devDependencies: {
      '@objectstack/cli': 'workspace:*',
      'typescript': '^5.3.0',
    },
    scripts: {
      build: 'objectstack compile',
      validate: 'objectstack validate',
      typecheck: 'tsc --noEmit',
    },
    configContent: (name: string) => `import { defineStack } from '@objectstack/spec';

export default defineStack({
  manifest: {
    id: 'com.example.${name}',
    namespace: '${name}',
    version: '0.1.0',
    type: 'app',
    name: '${toTitleCase(name)}',
    description: '',
  },
});
`,
    srcFiles: {},
  },
};

function toCamelCase(str: string): string {
  return str.replace(/[-_]([a-z])/g, (_, c) => c.toUpperCase());
}

function toTitleCase(str: string): string {
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export const initCommand = new Command('init')
  .description('Initialize a new ObjectStack project in the current directory')
  .argument('[name]', 'Project name (defaults to directory name)')
  .option('-t, --template <template>', 'Template: app, plugin, empty', 'app')
  .option('--no-install', 'Skip dependency installation')
  .action(async (name, options) => {
    printHeader('Init');

    const cwd = process.cwd();
    const projectName = name || path.basename(cwd);
    const template = TEMPLATES[options.template];

    if (!template) {
      printError(`Unknown template: ${options.template}`);
      console.log(chalk.dim(`  Available: ${Object.keys(TEMPLATES).join(', ')}`));
      process.exit(1);
    }

    // Check for existing config
    if (fs.existsSync(path.join(cwd, 'objectstack.config.ts'))) {
      printError('objectstack.config.ts already exists in this directory');
      console.log(chalk.dim('  Use `objectstack generate` to add metadata to an existing project'));
      process.exit(1);
    }

    printKV('Project', projectName);
    printKV('Template', `${options.template} — ${template.description}`);
    printKV('Directory', cwd);
    console.log('');

    const createdFiles: string[] = [];

    try {
      // 1. Create package.json if missing
      const pkgPath = path.join(cwd, 'package.json');
      if (!fs.existsSync(pkgPath)) {
        const pkg = {
          name: projectName,
          version: '0.1.0',
          private: true,
          type: 'module',
          scripts: template.scripts,
          dependencies: template.dependencies,
          devDependencies: template.devDependencies,
        };
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
        createdFiles.push('package.json');
      } else {
        printInfo('package.json already exists, skipping');
      }

      // 2. Create objectstack.config.ts
      const configContent = template.configContent(projectName);
      fs.writeFileSync(path.join(cwd, 'objectstack.config.ts'), configContent);
      createdFiles.push('objectstack.config.ts');

      // 3. Create tsconfig.json if missing
      const tsconfigPath = path.join(cwd, 'tsconfig.json');
      if (!fs.existsSync(tsconfigPath)) {
        const tsconfig = {
          compilerOptions: {
            target: 'ES2022',
            module: 'ESNext',
            moduleResolution: 'bundler',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            outDir: 'dist',
            rootDir: '.',
            declaration: true,
          },
          include: ['*.ts', 'src/**/*'],
          exclude: ['dist', 'node_modules'],
        };
        fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
        createdFiles.push('tsconfig.json');
      }

      // 4. Create src files
      for (const [filePath, contentFn] of Object.entries(template.srcFiles)) {
        const resolvedPath = filePath.replace('__name__', projectName);
        const fullPath = path.join(cwd, resolvedPath);
        const dir = path.dirname(fullPath);

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(fullPath, contentFn(projectName));
        createdFiles.push(resolvedPath);
      }

      // 5. Create .gitignore if missing
      const gitignorePath = path.join(cwd, '.gitignore');
      if (!fs.existsSync(gitignorePath)) {
        fs.writeFileSync(gitignorePath, `node_modules/\ndist/\n*.tsbuildinfo\n`);
        createdFiles.push('.gitignore');
      }

      // Summary
      console.log(chalk.bold('  Created files:'));
      for (const f of createdFiles) {
        console.log(chalk.green(`    + ${f}`));
      }
      console.log('');

      // Install dependencies
      if (options.install !== false) {
        printStep('Installing dependencies...');
        const { execSync } = await import('child_process');
        try {
          execSync('pnpm install', { stdio: 'inherit', cwd });
        } catch {
          printWarning('Dependency installation failed. Run `pnpm install` manually.');
        }
      }

      printSuccess('Project initialized!');
      console.log('');
      console.log(chalk.bold('  Next steps:'));
      console.log(chalk.dim('    objectstack validate   # Check configuration'));
      console.log(chalk.dim('    objectstack dev        # Start development server'));
      console.log(chalk.dim('    objectstack generate   # Add objects, views, etc.'));
      console.log('');

    } catch (error: any) {
      printError(error.message || String(error));
      process.exit(1);
    }
  });

function printWarning(msg: string) {
  console.log(chalk.yellow(`  ⚠ ${msg}`));
}
