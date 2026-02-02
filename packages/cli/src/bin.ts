import { Command } from 'commander';
import { compileCommand } from './commands/compile.js';
import { devCommand } from './commands/dev.js';
import { doctorCommand } from './commands/doctor.js';
import { createCommand } from './commands/create.js';
import { serveCommand } from './commands/serve.js';
import { testCommand } from './commands/test.js';

const program = new Command();

program
  .name('objectstack')
  .description('CLI for ObjectStack Protocol - Development Tools for Microkernel Architecture')
  .version('0.8.0');

// Add all commands
program.addCommand(compileCommand);
program.addCommand(serveCommand);
program.addCommand(devCommand);
program.addCommand(doctorCommand);
program.addCommand(createCommand);
program.addCommand(testCommand);

program.parse(process.argv);
