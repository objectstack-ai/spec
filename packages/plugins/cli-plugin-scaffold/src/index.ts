import type { CLIPlugin, CLIPluginContext } from '@objectstack/spec/cli';
import chalk from 'chalk';

/**
 * Scaffold Plugin
 * Provides scaffolding commands for ObjectStack projects
 */
const plugin: CLIPlugin = {
  metadata: {
    id: '@objectstack/cli-plugin-scaffold',
    name: 'ObjectStack Scaffold Plugin',
    version: '0.1.0',
    description: 'Scaffolding and code generation for ObjectStack',
    author: 'ObjectStack Team',
    license: 'MIT',
    keywords: ['scaffold', 'codegen', 'generate'],
  },

  commands: [
    {
      name: 'init',
      description: 'Initialize a new ObjectStack project',
      options: [
        {
          flags: '-t, --template <template>',
          description: 'Project template (crm, helpdesk, custom)',
          defaultValue: 'custom',
        },
        {
          flags: '--skip-git',
          description: 'Skip git initialization',
        },
        {
          flags: '--skip-install',
          description: 'Skip dependency installation',
        },
      ],
      examples: [
        {
          command: 'os init --template crm',
          description: 'Initialize a CRM project',
        },
        {
          command: 'os init --template helpdesk',
          description: 'Initialize a Helpdesk project',
        },
      ],
    },
    {
      name: 'generate',
      description: 'Generate ObjectStack components',
      alias: 'g',
      subcommands: [
        {
          name: 'object',
          description: 'Generate an object definition',
          arguments: [
            {
              name: 'name',
              description: 'Object name (snake_case)',
              required: true,
            },
          ],
          options: [
            {
              flags: '-o, --output <path>',
              description: 'Output file path',
            },
          ],
          examples: [
            {
              command: 'os generate object project_task',
              description: 'Generate a project_task object definition',
            },
          ],
        },
        {
          name: 'view',
          description: 'Generate a view configuration',
          arguments: [
            {
              name: 'name',
              description: 'View name',
              required: true,
            },
          ],
          options: [
            {
              flags: '-t, --type <type>',
              description: 'View type (grid, form, kanban, calendar)',
              defaultValue: 'grid',
            },
            {
              flags: '-o, --output <path>',
              description: 'Output file path',
            },
          ],
          examples: [
            {
              command: 'os generate view task_list --type grid',
              description: 'Generate a grid view for tasks',
            },
          ],
        },
        {
          name: 'app',
          description: 'Generate an app configuration',
          arguments: [
            {
              name: 'name',
              description: 'App name',
              required: true,
            },
          ],
          options: [
            {
              flags: '-o, --output <path>',
              description: 'Output file path',
            },
          ],
          examples: [
            {
              command: 'os generate app sales',
              description: 'Generate a sales app configuration',
            },
          ],
        },
        {
          name: 'plugin',
          description: 'Generate a plugin skeleton',
          arguments: [
            {
              name: 'name',
              description: 'Plugin name',
              required: true,
            },
          ],
          options: [
            {
              flags: '-t, --type <type>',
              description: 'Plugin type (cli, runtime, driver)',
              defaultValue: 'runtime',
            },
            {
              flags: '-o, --output <path>',
              description: 'Output directory',
            },
          ],
          examples: [
            {
              command: 'os generate plugin my-integration --type runtime',
              description: 'Generate a runtime plugin skeleton',
            },
            {
              command: 'os generate plugin my-command --type cli',
              description: 'Generate a CLI plugin skeleton',
            },
          ],
        },
      ],
    },
    {
      name: 'config',
      description: 'Manage CLI configuration',
      subcommands: [
        {
          name: 'list',
          description: 'List all configuration values',
        },
        {
          name: 'get',
          description: 'Get a configuration value',
          arguments: [
            {
              name: 'key',
              description: 'Configuration key',
              required: true,
            },
          ],
        },
        {
          name: 'set',
          description: 'Set a configuration value',
          arguments: [
            {
              name: 'key',
              description: 'Configuration key',
              required: true,
            },
            {
              name: 'value',
              description: 'Configuration value',
              required: true,
            },
          ],
        },
      ],
    },
  ],

  hooks: {
    onLoad: async (context: CLIPluginContext) => {
      context.logger.debug('Scaffold plugin loaded');
    },
    onUnload: async (context: CLIPluginContext) => {
      context.logger.debug('Scaffold plugin unloaded');
    },
  },
};

export default plugin;
