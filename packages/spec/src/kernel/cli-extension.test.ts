import { describe, it, expect } from 'vitest';
import {
  CLICommandContributionSchema,
  OclifPluginConfigSchema,
} from './cli-extension.zod';

describe('CLICommandContributionSchema', () => {
  it('should accept valid command contribution', () => {
    const result = CLICommandContributionSchema.parse({
      name: 'marketplace',
      description: 'Manage marketplace applications',
    });
    expect(result.name).toBe('marketplace');
    expect(result.description).toBe('Manage marketplace applications');
  });

  it('should accept command with module path', () => {
    const result = CLICommandContributionSchema.parse({
      name: 'deploy',
      description: 'Deploy to cloud',
      module: './dist/commands/deploy.js',
    });
    expect(result.module).toBe('./dist/commands/deploy.js');
  });

  it('should accept minimal command (name only)', () => {
    const result = CLICommandContributionSchema.parse({
      name: 'sync',
    });
    expect(result.name).toBe('sync');
    expect(result.description).toBeUndefined();
    expect(result.module).toBeUndefined();
  });

  it('should accept hyphenated command names', () => {
    const result = CLICommandContributionSchema.parse({
      name: 'cloud-sync',
    });
    expect(result.name).toBe('cloud-sync');
  });

  it('should reject invalid command names', () => {
    const invalidNames = [
      'Uppercase',
      'has spaces',
      '123start',
      '-leading-hyphen',
      'special_underscore',
      'dot.name',
      '',
    ];

    invalidNames.forEach(name => {
      expect(() => CLICommandContributionSchema.parse({ name })).toThrow();
    });
  });

  it('should accept valid lowercase alphanumeric names', () => {
    const validNames = ['a', 'abc', 'a1', 'my-command', 'plugin2'];

    validNames.forEach(name => {
      expect(() => CLICommandContributionSchema.parse({ name })).not.toThrow();
    });
  });
});

describe('OclifPluginConfigSchema', () => {
  it('should accept valid oclif plugin config', () => {
    const result = OclifPluginConfigSchema.parse({
      commands: {
        strategy: 'pattern',
        target: './dist/commands',
        glob: '**/*.js',
      },
    });
    expect(result.commands?.strategy).toBe('pattern');
    expect(result.commands?.target).toBe('./dist/commands');
  });

  it('should accept config with topicSeparator', () => {
    const result = OclifPluginConfigSchema.parse({
      commands: { strategy: 'pattern' },
      topicSeparator: ' ',
    });
    expect(result.topicSeparator).toBe(' ');
  });

  it('should accept empty config', () => {
    const result = OclifPluginConfigSchema.parse({});
    expect(result).toBeDefined();
  });

  it('should accept config with only commands', () => {
    const result = OclifPluginConfigSchema.parse({
      commands: {
        strategy: 'explicit',
      },
    });
    expect(result.commands?.strategy).toBe('explicit');
  });

  it('should reject invalid strategy', () => {
    expect(() => OclifPluginConfigSchema.parse({
      commands: { strategy: 'invalid' },
    })).toThrow();
  });
});
