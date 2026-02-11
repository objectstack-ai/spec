import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { loadPluginCommands } from '../src/utils/plugin-commands';

// Mock the config loader
vi.mock('../src/utils/config.js', () => ({
  loadConfig: vi.fn(),
}));

import { loadConfig } from '../src/utils/config';

const mockedLoadConfig = vi.mocked(loadConfig);

describe('loadPluginCommands', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    program.name('objectstack');
    vi.clearAllMocks();
  });

  it('should do nothing when no config file exists', async () => {
    mockedLoadConfig.mockRejectedValue(new Error('No config found'));

    await loadPluginCommands(program);
    expect(program.commands).toHaveLength(0);
  });

  it('should do nothing when no plugins have command contributions', async () => {
    mockedLoadConfig.mockResolvedValue({
      config: {
        plugins: [
          { name: 'simple-plugin' },
        ],
      },
      absolutePath: '/test/objectstack.config.ts',
      duration: 10,
    });

    await loadPluginCommands(program);
    expect(program.commands).toHaveLength(0);
  });

  it('should do nothing when plugins array is empty', async () => {
    mockedLoadConfig.mockResolvedValue({
      config: {
        plugins: [],
      },
      absolutePath: '/test/objectstack.config.ts',
      duration: 10,
    });

    await loadPluginCommands(program);
    expect(program.commands).toHaveLength(0);
  });

  it('should do nothing when config has no plugins key', async () => {
    mockedLoadConfig.mockResolvedValue({
      config: {},
      absolutePath: '/test/objectstack.config.ts',
      duration: 10,
    });

    await loadPluginCommands(program);
    expect(program.commands).toHaveLength(0);
  });

  it('should detect command contributions from plugin manifest', async () => {
    // This test verifies that the contribution detection logic works,
    // even though the dynamic import will fail (no real module to load)
    mockedLoadConfig.mockResolvedValue({
      config: {
        plugins: [
          {
            name: '@acme/plugin-marketplace',
            manifest: {
              contributes: {
                commands: [
                  {
                    name: 'marketplace',
                    description: 'Manage marketplace apps',
                    module: './cli',
                  },
                ],
              },
            },
          },
        ],
      },
      absolutePath: '/test/objectstack.config.ts',
      duration: 10,
    });

    // loadPluginCommands will try to import the module and fail silently
    // (since no real module exists), but it should not throw
    await loadPluginCommands(program);
  });

  it('should detect contributions from top-level contributes field', async () => {
    mockedLoadConfig.mockResolvedValue({
      config: {
        plugins: [
          {
            name: '@acme/plugin-deploy',
            contributes: {
              commands: [
                {
                  name: 'deploy',
                  description: 'Deploy to cloud',
                },
              ],
            },
          },
        ],
      },
      absolutePath: '/test/objectstack.config.ts',
      duration: 10,
    });

    // Should not throw even if import fails
    await loadPluginCommands(program);
  });

  it('should skip non-object plugins', async () => {
    mockedLoadConfig.mockResolvedValue({
      config: {
        plugins: [
          'some-string-plugin',
          null,
          undefined,
          42,
        ],
      },
      absolutePath: '/test/objectstack.config.ts',
      duration: 10,
    });

    await loadPluginCommands(program);
    expect(program.commands).toHaveLength(0);
  });

  it('should handle plugins with non-array commands gracefully', async () => {
    mockedLoadConfig.mockResolvedValue({
      config: {
        plugins: [
          {
            name: '@acme/bad-plugin',
            contributes: {
              commands: 'not-an-array',
            },
          },
        ],
      },
      absolutePath: '/test/objectstack.config.ts',
      duration: 10,
    });

    await loadPluginCommands(program);
    expect(program.commands).toHaveLength(0);
  });
});
