import { describe, it, expect } from 'vitest';
import {
  CLICommandContributionSchema,
  CLIExtensionExportSchema,
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
      module: './dist/cli.js',
    });
    expect(result.module).toBe('./dist/cli.js');
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

describe('CLIExtensionExportSchema', () => {
  it('should accept named commands export', () => {
    const result = CLIExtensionExportSchema.parse({
      commands: [{}, {}],
    });
    expect(result.commands).toHaveLength(2);
  });

  it('should accept default export', () => {
    const result = CLIExtensionExportSchema.parse({
      default: {},
    });
    expect(result.default).toBeDefined();
  });

  it('should accept default array export', () => {
    const result = CLIExtensionExportSchema.parse({
      default: [{}, {}],
    });
    expect(Array.isArray(result.default)).toBe(true);
  });

  it('should accept empty object', () => {
    const result = CLIExtensionExportSchema.parse({});
    expect(result).toBeDefined();
  });
});
