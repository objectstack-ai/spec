import { Command } from 'commander';
import { compileCommand } from './commands/compile.js';
import { devCommand } from './commands/dev.js';
import { doctorCommand } from './commands/doctor.js';
import { createCommand } from './commands/create.js';

const program = new Command();

program
  .name('objectstack')
  .description('CLI for ObjectStack Protocol - Development Tools for Microkernel Architecture')
  .version('0.7.1');

// Add all commands
program.addCommand(compileCommand);
program.addCommand(devCommand);
program.addCommand(doctorCommand);
program.addCommand(createCommand);

program.parse(process.argv);
