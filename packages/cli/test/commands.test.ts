import { describe, it, expect } from 'vitest';
import { compileCommand } from '../src/commands/compile';
import { serveCommand } from '../src/commands/serve';
import { devCommand } from '../src/commands/dev';
import { doctorCommand } from '../src/commands/doctor';
import { createCommand } from '../src/commands/create';
import { testCommand } from '../src/commands/test';

describe('CLI Commands', () => {
  it('should have compile command', () => {
    expect(compileCommand.name()).toBe('compile');
    expect(compileCommand.description()).toContain('Compile');
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
    expect(testCommand.name()).toBe('test:run');
    expect(testCommand.description()).toContain('Quality Protocol');
  });
});
