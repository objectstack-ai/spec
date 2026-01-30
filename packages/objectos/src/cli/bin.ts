#!/usr/bin/env node
import { Command } from 'commander';
import { compileCommand } from './commands/compile.js';

const program = new Command();

program
  .name('objectstack')
  .description('CLI for ObjectStack Protocol')
  .version('0.1.0');

program.addCommand(compileCommand);

program.parse(process.argv);
