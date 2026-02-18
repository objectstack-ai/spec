import { describe, it, expect } from 'vitest';
import Compile from '../src/commands/compile';
import { serveCommand } from '../src/commands/serve';
import { devCommand } from '../src/commands/dev';
import { doctorCommand } from '../src/commands/doctor';
import { createCommand } from '../src/commands/create';
import { testCommand } from '../src/commands/test';
import { validateCommand } from '../src/commands/validate';
import Init from '../src/commands/init';
import { infoCommand } from '../src/commands/info';
import { generateCommand } from '../src/commands/generate';
import { pluginCommand } from '../src/commands/plugin';

describe('CLI Commands', () => {
  it('should have compile command', () => {
    expect(Compile.description).toContain('Compile');
  });

  it('should have serve command', () => {
    expect(serveCommand.name()).toBe('serve');
    expect(serveCommand.description()).toContain('server');
  });

  it('should have dev command', () => {
    expect(devCommand.name()).toBe('dev');
    expect(devCommand.description()).toContain('development mode');
  });

  it('should have doctor command', () => {
    expect(doctorCommand.name()).toBe('doctor');
    expect(doctorCommand.description()).toContain('health');
  });

  it('should have create command', () => {
    expect(createCommand.name()).toBe('create');
    expect(createCommand.description()).toContain('Create');
  });

  it('should have test command', () => {
    expect(testCommand.name()).toBe('test');
    expect(testCommand.description()).toContain('Quality Protocol');
  });

  it('should have validate command', () => {
    expect(validateCommand.name()).toBe('validate');
    expect(validateCommand.description()).toContain('Validate');
  });

  it('should have init command', () => {
    expect(Init.id).toBe('init');
    expect(Init.description).toContain('Initialize');
  });

  it('should have info command', () => {
    expect(infoCommand.name()).toBe('info');
    expect(infoCommand.description()).toContain('summary');
  });

  it('should have generate command with alias', () => {
    expect(generateCommand.name()).toBe('generate');
    expect(generateCommand.alias()).toBe('g');
    expect(generateCommand.description()).toContain('Generate');
  });

  it('should have plugin command with subcommands', () => {
    expect(pluginCommand.name()).toBe('plugin');
    expect(pluginCommand.description()).toContain('plugin');
  });
});
