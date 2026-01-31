import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';
import chalk from 'chalk';
import type {
  CLIPlugin,
  CLIPluginContext,
  CLICommandDefinition,
  CLIPluginRegistryEntry,
} from '@objectstack/spec/cli';

/**
 * CLI Plugin Loader
 * Discovers, loads, and manages CLI plugins
 */
export class CLIPluginLoader {
  private loadedPlugins: Map<string, CLIPlugin> = new Map();
  private pluginPaths: string[] = [];
  private context: CLIPluginContext;

  constructor(context: CLIPluginContext) {
    this.context = context;
  }

  /**
   * Add a plugin search path
   */
  addPluginPath(pluginPath: string): void {
    if (!this.pluginPaths.includes(pluginPath)) {
      this.pluginPaths.push(pluginPath);
    }
  }

  /**
   * Discover plugins in search paths
   */
  async discoverPlugins(): Promise<string[]> {
    const discovered: string[] = [];

    for (const searchPath of this.pluginPaths) {
      try {
        const exists = await fs.stat(searchPath).then(() => true).catch(() => false);
        if (!exists) continue;

        const entries = await fs.readdir(searchPath, { withFileTypes: true });
        
        for (const entry of entries) {
          // Check if it's a directory or a symlink to a directory
          const entryPath = path.join(searchPath, entry.name);
          const stats = await fs.stat(entryPath);
          
          if (stats.isDirectory() && entry.name.startsWith('cli-plugin-')) {
            discovered.push(entryPath);
          }
        }
      } catch (error) {
        this.context.logger.debug(`Error scanning plugin path ${searchPath}: ${(error as Error).message}`);
      }
    }

    return discovered;
  }

  /**
   * Load a plugin from a path
   */
  async loadPlugin(pluginPath: string): Promise<CLIPlugin | null> {
    try {
      // Check for package.json
      const packageJsonPath = path.join(pluginPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      // Look for main entry point
      const entryPoint = packageJson.main || 'index.js';
      const pluginFile = path.join(pluginPath, entryPoint);

      // Load the plugin module
      const pluginUrl = pathToFileURL(pluginFile).href;
      const pluginModule = await import(pluginUrl);
      
      const plugin = pluginModule.default || pluginModule.plugin;

      if (!plugin) {
        throw new Error('Plugin does not export a default or named "plugin" export');
      }

      // Validate plugin structure
      if (!plugin.metadata || !plugin.commands) {
        throw new Error('Invalid plugin structure: missing metadata or commands');
      }

      // Call onLoad hook if defined
      if (plugin.hooks?.onLoad) {
        await plugin.hooks.onLoad(this.context);
      }

      // Store the loaded plugin
      this.loadedPlugins.set(plugin.metadata.id, plugin);

      this.context.logger.info(`Loaded plugin: ${plugin.metadata.name} (${plugin.metadata.version})`);
      
      return plugin;
    } catch (error) {
      this.context.logger.error(`Failed to load plugin from ${pluginPath}: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Load all discovered plugins
   */
  async loadAllPlugins(): Promise<void> {
    const discovered = await this.discoverPlugins();
    
    for (const pluginPath of discovered) {
      await this.loadPlugin(pluginPath);
    }
  }

  /**
   * Register plugin commands with Commander program
   */
  registerCommands(program: Command): void {
    for (const [id, plugin] of this.loadedPlugins.entries()) {
      for (const cmdDef of plugin.commands) {
        try {
          this.registerCommand(program, cmdDef, plugin);
        } catch (error) {
          this.context.logger.error(
            `Failed to register command ${cmdDef.name} from plugin ${id}: ${(error as Error).message}`
          );
        }
      }
    }
  }

  /**
   * Register a single command
   */
  private registerCommand(
    parent: Command,
    cmdDef: CLICommandDefinition,
    plugin: CLIPlugin
  ): void {
    const cmd = new Command(cmdDef.name);

    cmd.description(cmdDef.description);

    if (cmdDef.alias) {
      cmd.alias(cmdDef.alias);
    }

    // Add arguments
    if (cmdDef.arguments) {
      for (const arg of cmdDef.arguments) {
        const argNotation = arg.variadic
          ? `[${arg.name}...]`
          : arg.required
          ? `<${arg.name}>`
          : `[${arg.name}]`;
        
        cmd.argument(argNotation, arg.description || '', arg.defaultValue);
      }
    }

    // Add options
    if (cmdDef.options) {
      for (const opt of cmdDef.options) {
        cmd.option(opt.flags, opt.description || '', opt.defaultValue);
      }
    }

    // Add examples
    if (cmdDef.examples) {
      for (const example of cmdDef.examples) {
        cmd.addHelpText('after', `\n  Example: ${example.command}\n    ${example.description}`);
      }
    }

    if (cmdDef.hidden) {
      // Use optional chaining to safely call hideHelp if it exists
      // Some versions of Commander may not have this method
      const hideHelp = (cmd as any).hideHelp;
      if (typeof hideHelp === 'function') {
        hideHelp.call(cmd);
      }
    }

    // Add subcommands recursively
    if (cmdDef.subcommands) {
      for (const subCmd of cmdDef.subcommands) {
        this.registerCommand(cmd, subCmd, plugin);
      }
    }

    parent.addCommand(cmd);
  }

  /**
   * Get all loaded plugins
   */
  getLoadedPlugins(): Map<string, CLIPlugin> {
    return new Map(this.loadedPlugins);
  }

  /**
   * Get a specific plugin by ID
   */
  getPlugin(id: string): CLIPlugin | undefined {
    return this.loadedPlugins.get(id);
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(id: string): Promise<void> {
    const plugin = this.loadedPlugins.get(id);
    
    if (!plugin) {
      throw new Error(`Plugin ${id} not loaded`);
    }

    // Call onUnload hook if defined
    if (plugin.hooks?.onUnload) {
      await plugin.hooks.onUnload(this.context);
    }

    this.loadedPlugins.delete(id);
    this.context.logger.info(`Unloaded plugin: ${plugin.metadata.name}`);
  }

  /**
   * Unload all plugins
   */
  async unloadAll(): Promise<void> {
    for (const id of this.loadedPlugins.keys()) {
      await this.unloadPlugin(id);
    }
  }
}
