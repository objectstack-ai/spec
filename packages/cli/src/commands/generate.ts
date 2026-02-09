// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { printHeader, printSuccess, printError, printInfo } from '../utils/format.js';

// ─── Metadata Type Templates ────────────────────────────────────────

const GENERATORS: Record<string, {
  description: string;
  defaultDir: string;
  generate: (name: string) => string;
}> = {
  object: {
    description: 'Business data object',
    defaultDir: 'src/objects',
    generate: (name: string) => `import { Data } from '@objectstack/spec';

/**
 * ${toTitleCase(name)} Object
 */
const ${toCamelCase(name)}: Data.Object = {
  name: '${toSnakeCase(name)}',
  label: '${toTitleCase(name)}',
  pluralLabel: '${toTitleCase(name)}s',
  ownership: 'own',
  fields: {
    name: {
      type: 'text',
      label: 'Name',
      required: true,
      maxLength: 255,
    },
    description: {
      type: 'textarea',
      label: 'Description',
    },
  },
};

export default ${toCamelCase(name)};
`,
  },

  view: {
    description: 'List or form view',
    defaultDir: 'src/views',
    generate: (name: string) => `import { UI } from '@objectstack/spec';

/**
 * ${toTitleCase(name)} List View
 */
const ${toCamelCase(name)}ListView: UI.View = {
  name: '${toSnakeCase(name)}_list',
  label: '${toTitleCase(name)} List',
  type: 'list',
  objectName: '${toSnakeCase(name)}',
  list: {
    type: 'grid',
    columns: [
      { field: 'name', width: 200 },
    ],
    defaultSort: { field: 'name', direction: 'asc' },
    pageSize: 25,
  },
};

export default ${toCamelCase(name)}ListView;
`,
  },

  action: {
    description: 'Button or batch action',
    defaultDir: 'src/actions',
    generate: (name: string) => `import { UI } from '@objectstack/spec';

/**
 * ${toTitleCase(name)} Action
 */
const ${toCamelCase(name)}Action: UI.Action = {
  name: '${toSnakeCase(name)}',
  label: '${toTitleCase(name)}',
  type: 'custom',
  objectName: '${toSnakeCase(name)}',
  handler: {
    type: 'flow',
    target: '${toSnakeCase(name)}_flow',
  },
};

export default ${toCamelCase(name)}Action;
`,
  },

  flow: {
    description: 'Automation flow',
    defaultDir: 'src/flows',
    generate: (name: string) => `import { Automation } from '@objectstack/spec';

/**
 * ${toTitleCase(name)} Flow
 */
const ${toCamelCase(name)}Flow: Automation.Flow = {
  name: '${toSnakeCase(name)}_flow',
  label: '${toTitleCase(name)} Flow',
  type: 'autolaunched',
  status: 'draft',
  trigger: {
    type: 'record_change',
    object: '${toSnakeCase(name)}',
    events: ['after_insert', 'after_update'],
  },
  nodes: [
    {
      id: 'start',
      type: 'start',
      name: 'Start',
      next: 'end',
    },
  ],
};

export default ${toCamelCase(name)}Flow;
`,
  },

  agent: {
    description: 'AI agent',
    defaultDir: 'src/agents',
    generate: (name: string) => `import { AI } from '@objectstack/spec';

/**
 * ${toTitleCase(name)} Agent
 */
const ${toCamelCase(name)}Agent: AI.Agent = {
  name: '${toSnakeCase(name)}_agent',
  label: '${toTitleCase(name)} Agent',
  role: '${toTitleCase(name)} assistant',
  instructions: 'You are a helpful ${toTitleCase(name).toLowerCase()} assistant.',
  model: {
    provider: 'openai',
    model: 'gpt-4o',
  },
  tools: [],
};

export default ${toCamelCase(name)}Agent;
`,
  },

  dashboard: {
    description: 'Analytics dashboard',
    defaultDir: 'src/dashboards',
    generate: (name: string) => `import { UI } from '@objectstack/spec';

/**
 * ${toTitleCase(name)} Dashboard
 */
const ${toCamelCase(name)}Dashboard: UI.Dashboard = {
  name: '${toSnakeCase(name)}_dashboard',
  label: '${toTitleCase(name)} Dashboard',
  widgets: [],
};

export default ${toCamelCase(name)}Dashboard;
`,
  },

  app: {
    description: 'Application navigation',
    defaultDir: 'src/apps',
    generate: (name: string) => `import { UI } from '@objectstack/spec';

/**
 * ${toTitleCase(name)} App
 */
const ${toCamelCase(name)}App: UI.App = {
  name: '${toSnakeCase(name)}_app',
  label: '${toTitleCase(name)}',
  navigation: {
    type: 'sidebar',
    items: [],
  },
};

export default ${toCamelCase(name)}App;
`,
  },
};

// ─── Helpers ────────────────────────────────────────────────────────

function toCamelCase(str: string): string {
  return str.replace(/[-_]([a-z])/g, (_, c) => c.toUpperCase());
}

function toTitleCase(str: string): string {
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function toSnakeCase(str: string): string {
  return str.replace(/[-]/g, '_').replace(/[A-Z]/g, c => `_${c.toLowerCase()}`).replace(/^_/, '');
}

// ─── Command ────────────────────────────────────────────────────────

export const generateCommand = new Command('generate')
  .alias('g')
  .description('Generate metadata files (object, view, action, flow, agent, dashboard, app)')
  .argument('<type>', 'Metadata type to generate')
  .argument('<name>', 'Name for the metadata (use kebab-case)')
  .option('-d, --dir <directory>', 'Target directory (overrides default)')
  .option('--dry-run', 'Show what would be created without writing files')
  .action(async (type: string, name: string, options) => {
    printHeader('Generate');

    const generator = GENERATORS[type];
    if (!generator) {
      printError(`Unknown type: ${type}`);
      console.log('');
      console.log(chalk.bold('  Available types:'));
      for (const [key, gen] of Object.entries(GENERATORS)) {
        console.log(`    ${chalk.cyan(key.padEnd(12))} ${chalk.dim(gen.description)}`);
      }
      console.log('');
      console.log(chalk.dim('  Usage: objectstack generate <type> <name>'));
      console.log(chalk.dim('  Example: objectstack generate object project'));
      console.log(chalk.dim('  Alias: os g object project'));
      process.exit(1);
    }

    const dir = options.dir || generator.defaultDir;
    const fileName = `${toSnakeCase(name)}.ts`;
    const filePath = path.join(process.cwd(), dir, fileName);

    console.log(`  ${chalk.dim('Type:')}  ${chalk.cyan(type)} — ${generator.description}`);
    console.log(`  ${chalk.dim('Name:')}  ${chalk.white(name)}`);
    console.log(`  ${chalk.dim('File:')}  ${chalk.white(path.join(dir, fileName))}`);
    console.log('');

    if (options.dryRun) {
      printInfo('Dry run — no files written');
      console.log('');
      console.log(chalk.dim('  Content:'));
      console.log(chalk.dim('  ' + '-'.repeat(38)));
      const content = generator.generate(name);
      for (const line of content.split('\n')) {
        console.log(chalk.dim(`  ${line}`));
      }
      console.log('');
      return;
    }

    // Check if file exists
    if (fs.existsSync(filePath)) {
      printError(`File already exists: ${filePath}`);
      process.exit(1);
    }

    try {
      // Create directory
      const fullDir = path.dirname(filePath);
      if (!fs.existsSync(fullDir)) {
        fs.mkdirSync(fullDir, { recursive: true });
      }

      // Write file
      const content = generator.generate(name);
      fs.writeFileSync(filePath, content);
      printSuccess(`Created ${path.join(dir, fileName)}`);

      // Check for barrel index
      const indexPath = path.join(process.cwd(), dir, 'index.ts');
      if (fs.existsSync(indexPath)) {
        const indexContent = fs.readFileSync(indexPath, 'utf-8');
        const exportLine = `export { default as ${toCamelCase(name)} } from './${toSnakeCase(name)}';`;
        
        if (!indexContent.includes(toCamelCase(name))) {
          fs.appendFileSync(indexPath, exportLine + '\n');
          printSuccess(`Updated ${dir}/index.ts with export`);
        }
      } else {
        // Create barrel index
        const exportLine = `export { default as ${toCamelCase(name)} } from './${toSnakeCase(name)}';\n`;
        fs.writeFileSync(indexPath, exportLine);
        printSuccess(`Created ${dir}/index.ts`);
      }

      console.log('');
      console.log(chalk.dim(`  Tip: Run \`objectstack validate\` to check your config`));
      console.log('');

    } catch (error: any) {
      printError(error.message || String(error));
      process.exit(1);
    }
  });
