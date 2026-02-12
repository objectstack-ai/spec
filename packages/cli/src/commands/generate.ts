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

// ─── Field Type Mapping ─────────────────────────────────────────────

const FIELD_TYPE_MAP: Record<string, string> = {
  text: 'string',
  textarea: 'string',
  richtext: 'string',
  html: 'string',
  markdown: 'string',
  number: 'number',
  integer: 'number',
  currency: 'number',
  percent: 'number',
  boolean: 'boolean',
  date: 'string',
  datetime: 'string',
  time: 'string',
  email: 'string',
  phone: 'string',
  url: 'string',
  select: 'string',
  multiselect: 'string[]',
  lookup: 'string',
  master_detail: 'string',
  formula: 'unknown',
  autonumber: 'string',
  json: 'Record<string, unknown>',
  file: 'string',
  image: 'string',
  password: 'string',
  slug: 'string',
  uuid: 'string',
  ip_address: 'string',
  color: 'string',
  rating: 'number',
  geo_point: '{ lat: number; lng: number }',
  vector: 'number[]',
  encrypted: 'string',
};

function fieldTypeToTs(fieldType: string, multiple?: boolean): string {
  const base = FIELD_TYPE_MAP[fieldType] || 'unknown';
  return multiple ? `${base}[]` : base;
}

function generateTypesFromConfig(config: Record<string, unknown>): string {
  const lines: string[] = [
    '// Auto-generated by ObjectStack CLI — do not edit manually',
    `// Generated at ${new Date().toISOString()}`,
    '',
    "import type { Data } from '@objectstack/spec';",
    '',
  ];

  // Extract objects from config (supports both top-level and nested)
  const objects: Record<string, unknown>[] = [];
  const rawObjects = (config as any).objects ?? (config as any).data?.objects ?? {};

  if (Array.isArray(rawObjects)) {
    objects.push(...rawObjects);
  } else if (typeof rawObjects === 'object') {
    for (const val of Object.values(rawObjects)) {
      if (val && typeof val === 'object') objects.push(val as Record<string, unknown>);
    }
  }

  if (objects.length === 0) {
    lines.push('// No objects found in configuration');
    return lines.join('\n') + '\n';
  }

  for (const obj of objects) {
    const name = String(obj.name || 'unknown');
    const typeName = name
      .split('_')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
    const fields = (obj.fields ?? {}) as Record<string, Record<string, unknown>>;

    lines.push(`/** ${String(obj.label || typeName)} record type */`);
    lines.push(`export interface ${typeName}Record {`);
    lines.push('  id: string;');

    for (const [fieldName, fieldDef] of Object.entries(fields)) {
      const fType = String(fieldDef.type || 'text');
      const tsType = fieldTypeToTs(fType, !!fieldDef.multiple);
      const required = fieldDef.required ? '' : '?';
      if (fieldDef.label) {
        lines.push(`  /** ${fieldDef.label} */`);
      }
      lines.push(`  ${fieldName}${required}: ${tsType};`);
    }

    lines.push('}');
    lines.push('');
  }

  return lines.join('\n') + '\n';
}

// ─── Command ────────────────────────────────────────────────────────

const generateMetadataCommand = new Command('metadata')
  .alias('m')
  .description('Generate metadata scaffold (object, view, action, flow, agent, dashboard, app)')
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

const generateTypesCommand = new Command('types')
  .description('Generate TypeScript type definitions from ObjectStack configuration')
  .argument('[config]', 'Configuration file path')
  .option('-o, --output <file>', 'Output file path', 'src/types/objectstack.d.ts')
  .option('--dry-run', 'Show what would be generated without writing files')
  .action(async (configPath, options) => {
    printHeader('Generate Types');

    try {
      const { loadConfig } = await import('../utils/config.js');
      printInfo('Loading configuration...');
      const { config, absolutePath } = await loadConfig(configPath);

      console.log(`  ${chalk.dim('Config:')} ${chalk.white(absolutePath)}`);
      console.log(`  ${chalk.dim('Output:')} ${chalk.white(options.output)}`);
      console.log('');

      const content = generateTypesFromConfig(config as Record<string, unknown>);

      if (options.dryRun) {
        printInfo('Dry run — no files written');
        console.log('');
        for (const line of content.split('\n')) {
          console.log(chalk.dim(`  ${line}`));
        }
        console.log('');
        return;
      }

      const outPath = path.resolve(process.cwd(), options.output);
      const outDir = path.dirname(outPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      fs.writeFileSync(outPath, content);
      printSuccess(`Generated types at ${options.output}`);
      console.log('');

    } catch (error: any) {
      printError(error.message || String(error));
      process.exit(1);
    }
  });

export const generateCommand = new Command('generate')
  .alias('g')
  .description('Generate metadata files or TypeScript types')
  .argument('[type]', 'Metadata type to generate (object, view, action, flow, agent, dashboard, app)')
  .argument('[name]', 'Name for the metadata (use kebab-case)')
  .option('-d, --dir <directory>', 'Target directory (overrides default)')
  .option('--dry-run', 'Show what would be created without writing files')
  .addCommand(generateTypesCommand)
  .action(async (type: string | undefined, name: string | undefined, options) => {
    if (!type) {
      printHeader('Generate');
      console.log(chalk.bold('  Sub-commands:'));
      console.log(`    ${chalk.cyan('types'.padEnd(12))} Generate TypeScript type definitions from config`);
      console.log('');
      console.log(chalk.bold('  Metadata types:'));
      for (const [key, gen] of Object.entries(GENERATORS)) {
        console.log(`    ${chalk.cyan(key.padEnd(12))} ${chalk.dim(gen.description)}`);
      }
      console.log('');
      console.log(chalk.dim('  Usage: objectstack generate <type> <name>'));
      console.log(chalk.dim('  Usage: objectstack generate types [config]'));
      return;
    }

    // Delegate to metadata command action
    if (!name) {
      printError('Missing required argument: <name>');
      console.log(chalk.dim('  Usage: objectstack generate <type> <name>'));
      process.exit(1);
    }

    // Execute metadata generation inline
    await generateMetadataCommand.parseAsync([type, name, ...process.argv.slice(4)], { from: 'user' });
  });
