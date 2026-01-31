import { Command } from 'commander';
import path from 'path';
import { compileCommand } from './commands/compile.js';
import { pluginCommand } from './commands/plugin.js';
import { CLIPluginLoader } from './plugin-loader.js';
import { createPluginContext } from './plugin-context.js';

const program = new Command();

program
  .name('objectstack')
  .description('CLI for ObjectStack Protocol')
  .version('0.1.0');

// Add built-in commands
program.addCommand(compileCommand);
program.addCommand(pluginCommand);

// Initialize plugin system
async function initPlugins() {
  try {
    const context = await createPluginContext();
    const loader = new CLIPluginLoader(context);

    // Add plugin search paths
    // 1. Global plugins in user's home directory
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    if (homeDir) {
      loader.addPluginPath(path.join(homeDir, '.objectstack', 'plugins'));
    }

    // 2. Project-local plugins
    loader.addPluginPath(path.join(process.cwd(), 'node_modules'));
    loader.addPluginPath(path.join(process.cwd(), '.objectstack', 'plugins'));

    // Load all plugins
    await loader.loadAllPlugins();

    // Register plugin commands
    loader.registerCommands(program);

    // Parse command line
    program.parse(process.argv);
  } catch (error) {
    console.error('Error initializing plugins:', (error as Error).message);
    program.parse(process.argv);
  }
}

// Start the CLI
initPlugins();
