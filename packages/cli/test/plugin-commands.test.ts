import { describe, it, expect } from 'vitest';

/**
 * The custom loadPluginCommands mechanism has been removed.
 * Plugin command extension is now handled by oclif's built-in plugin system.
 *
 * Plugins extend the CLI by:
 * 1. Including `oclif` config in their package.json
 * 2. Exporting oclif Command classes from `src/commands/`
 * 3. Being installed via `os plugins install <package>`
 *
 * The objectstack.config.ts no longer determines CLI command availability.
 */

describe('oclif Plugin System', () => {
  it('should have oclif plugins configured in package.json', async () => {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const pkg = require('../package.json');

    expect(pkg.oclif).toBeDefined();
    expect(pkg.oclif.plugins).toContain('@oclif/plugin-help');
    expect(pkg.oclif.plugins).toContain('@oclif/plugin-plugins');
  });

  it('should have oclif command discovery configured', async () => {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const pkg = require('../package.json');

    expect(pkg.oclif.commands).toBeDefined();
    expect(pkg.oclif.commands.strategy).toBe('pattern');
    expect(pkg.oclif.commands.target).toBe('./dist/commands');
  });

  it('should have bin entries pointing to oclif runner', async () => {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const pkg = require('../package.json');

    expect(pkg.bin.os).toBe('./bin/run.js');
    expect(pkg.bin.objectstack).toBe('./bin/run.js');
  });
});
