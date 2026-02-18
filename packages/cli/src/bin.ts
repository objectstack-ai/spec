// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createRequire } from 'module';
import { Command } from 'commander';
import chalk from 'chalk';

// Commands
import { devCommand } from './commands/dev.js';
import { doctorCommand } from './commands/doctor.js';
import { createCommand } from './commands/create.js';
import { serveCommand } from './commands/serve.js';
import { studioCommand } from './commands/studio.js';
import { testCommand } from './commands/test.js';
import { validateCommand } from './commands/validate.js';

import { infoCommand } from './commands/info.js';
import { generateCommand } from './commands/generate.js';
import { pluginCommand } from './commands/plugin.js';
import { diffCommand } from './commands/diff.js';
import { lintCommand } from './commands/lint.js';
import { loadPluginCommands } from './utils/plugin-commands.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

// ─── Global Error Handling ──────────────────────────────────────────
process.on('unhandledRejection', (err: any) => {
  console.error(chalk.red(`\n  ✗ Unhandled error: ${err?.message || err}`));
  if (err?.stack && process.env.DEBUG) {
    console.error(chalk.dim(err.stack));
  }
  process.exit(1);
});

// ─── Program Definition ─────────────────────────────────────────────
const program = new Command();

program
  .name('objectstack')
  .description('ObjectStack CLI — Build metadata-driven apps with the ObjectStack Protocol')
  .version(pkg.version, '-v, --version')
  .configureHelp({
    sortSubcommands: false,
  })
  .addHelpText('before', `
${chalk.bold.cyan('◆ ObjectStack CLI')} ${chalk.dim(`v${pkg.version}`)}
`)
  .addHelpText('after', `
${chalk.bold('Workflow:')}
  ${chalk.dim('$')} os init                      ${chalk.dim('# Create a new project')}
  ${chalk.dim('$')} os generate object task       ${chalk.dim('# Add metadata')}
  ${chalk.dim('$')} os plugin add <package>       ${chalk.dim('# Add a plugin')}
  ${chalk.dim('$')} os validate                   ${chalk.dim('# Check configuration')}
  ${chalk.dim('$')} os dev                        ${chalk.dim('# Start dev server')}
  ${chalk.dim('$')} os studio                     ${chalk.dim('# Dev server + Studio UI')}
  ${chalk.dim('$')} os compile                    ${chalk.dim('# Build for production')}

${chalk.dim('Aliases: objectstack | os')}
${chalk.dim('Docs: https://objectstack.dev')}
`);

// ── Development ──
// initCommand has been migrated to oclif (auto-discovered from commands/)
program.addCommand(devCommand);
program.addCommand(serveCommand);
program.addCommand(studioCommand);

// ── Build & Validate ──
// compileCommand has been migrated to oclif (auto-discovered from commands/)
program.addCommand(validateCommand);
program.addCommand(infoCommand);

// ── Scaffolding ──
program.addCommand(generateCommand);
program.addCommand(createCommand);

// ── Plugin Management ──
program.addCommand(pluginCommand);

// ── Quality ──
program.addCommand(testCommand);
program.addCommand(doctorCommand);
program.addCommand(lintCommand);
program.addCommand(diffCommand);

// ── Reference ──
// explainCommand has been migrated to oclif (auto-discovered from commands/)

// ── Code Transforms ──
// codemodCommand has been migrated to oclif (auto-discovered from commands/codemod/)

// ── Plugin-Contributed Commands ──
// Load commands from installed plugins that declare `contributes.commands` in their manifest.
// This must complete before `program.parse()` so that plugin commands are available.
loadPluginCommands(program).then(() => {
  program.parse(process.argv);
}).catch((err) => {
  // If plugin command loading fails, still parse with built-in commands
  if (process.env.DEBUG) {
    console.error(chalk.yellow(`\n  ⚠ Plugin command loading failed: ${err?.message || err}`));
  }
  program.parse(process.argv);
});
