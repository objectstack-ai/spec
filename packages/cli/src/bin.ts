import { createRequire } from 'module';
import { Command } from 'commander';
import { compileCommand } from './commands/compile.js';
import { devCommand } from './commands/dev.js';
import { doctorCommand } from './commands/doctor.js';
import { createCommand } from './commands/create.js';
import { serveCommand } from './commands/serve.js';
import { testCommand } from './commands/test.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const program = new Command();

program
  .name('objectstack')
  .description('CLI for ObjectStack Protocol - Development Tools for Microkernel Architecture')
  .version(pkg.version);

// Add all commands
program.addCommand(compileCommand);
program.addCommand(serveCommand);
program.addCommand(devCommand);
program.addCommand(doctorCommand);
program.addCommand(createCommand);
program.addCommand(testCommand);

program.parse(process.argv);
