import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

/**
 * Plugin Registry Manager
 * Manages installed plugins registry
 */
class PluginRegistry {
  private registryPath: string;

  constructor() {
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    this.registryPath = path.join(homeDir, '.objectstack', 'plugins.json');
  }

  async load(): Promise<any> {
    try {
      const data = await fs.readFile(this.registryPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return { plugins: [] };
    }
  }

  async save(data: any): Promise<void> {
    const dir = path.dirname(this.registryPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.registryPath, JSON.stringify(data, null, 2));
  }
}

export const pluginCommand = new Command('plugin')
  .description('Manage CLI plugins')
  .addCommand(
    new Command('list')
      .description('List all discovered plugins')
      .option('-a, --all', 'Show all plugins including disabled')
      .action(async (options) => {
        console.log(chalk.bold('\n📦 ObjectStack CLI Plugins\n'));
        console.log(chalk.dim('──────────────────────────────────'));

        const searchPaths = [
          path.join(process.env.HOME || process.env.USERPROFILE || '', '.objectstack', 'plugins'),
          path.join(process.cwd(), 'node_modules'),
          path.join(process.cwd(), '.objectstack', 'plugins'),
        ];

        const discovered: any[] = [];

        for (const searchPath of searchPaths) {
          try {
            const exists = await fs.stat(searchPath).then(() => true).catch(() => false);
            if (!exists) continue;

            const entries = await fs.readdir(searchPath, { withFileTypes: true });

            for (const entry of entries) {
              const entryPath = path.join(searchPath, entry.name);
              const stats = await fs.stat(entryPath);

              if (stats.isDirectory() && entry.name.startsWith('cli-plugin-')) {
                try {
                  const packageJsonPath = path.join(entryPath, 'package.json');
                  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

                  discovered.push({
                    id: packageJson.name,
                    name: entry.name,
                    version: packageJson.version,
                    description: packageJson.description,
                    path: entryPath,
                    location: searchPath.includes('.objectstack/plugins')
                      ? searchPath.includes(process.cwd())
                        ? 'local'
                        : 'global'
                      : 'node_modules',
                  });
                } catch (error) {
                  // Skip invalid plugins
                }
              }
            }
          } catch (error) {
            // Skip invalid search paths
          }
        }

        if (discovered.length === 0) {
          console.log(chalk.yellow('No plugins found.'));
          console.log(chalk.dim('\nInstall plugins with:'));
          console.log(chalk.blue('  npm install -g @objectstack/cli-plugin-scaffold'));
          return;
        }

        for (const plugin of discovered) {
          const locationBadge =
            plugin.location === 'global'
              ? chalk.cyan('[global]')
              : plugin.location === 'local'
              ? chalk.green('[local]')
              : chalk.gray('[node_modules]');

          console.log(`\n${chalk.green('✓')} ${chalk.bold(plugin.id)} ${chalk.dim(`v${plugin.version}`)} ${locationBadge}`);
          if (plugin.description) {
            console.log(`  ${chalk.dim(plugin.description)}`);
          }
          if (options.all) {
            console.log(`  ${chalk.dim(`Path: ${plugin.path}`)}`);
          }
        }

        console.log(chalk.dim('\n──────────────────────────────────'));
        console.log(chalk.dim(`Total: ${discovered.length} plugin(s) found\n`));
      })
  )
  .addCommand(
    new Command('info')
      .description('Show information about a specific plugin')
      .argument('<name>', 'Plugin name or ID')
      .action(async (name) => {
        console.log(chalk.bold(`\n📋 Plugin Information: ${name}\n`));
        console.log(chalk.dim('──────────────────────────────────'));

        const searchPaths = [
          path.join(process.env.HOME || process.env.USERPROFILE || '', '.objectstack', 'plugins'),
          path.join(process.cwd(), 'node_modules'),
          path.join(process.cwd(), '.objectstack', 'plugins'),
        ];

        for (const searchPath of searchPaths) {
          try {
            const entries = await fs.readdir(searchPath, { withFileTypes: true });

            for (const entry of entries) {
              if (entry.name.startsWith('cli-plugin-') && (entry.name === name || entry.name.includes(name))) {
                const entryPath = path.join(searchPath, entry.name);
                const stats = await fs.stat(entryPath);

                if (stats.isDirectory()) {
                  const packageJsonPath = path.join(entryPath, 'package.json');
                  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

                  console.log(`${chalk.bold('Name:')} ${packageJson.name}`);
                  console.log(`${chalk.bold('Version:')} ${packageJson.version}`);
                  console.log(`${chalk.bold('Description:')} ${packageJson.description || 'N/A'}`);
                  console.log(`${chalk.bold('Author:')} ${packageJson.author || 'N/A'}`);
                  console.log(`${chalk.bold('License:')} ${packageJson.license || 'N/A'}`);
                  console.log(`${chalk.bold('Path:')} ${entryPath}`);

                  if (packageJson.keywords) {
                    console.log(`${chalk.bold('Keywords:')} ${packageJson.keywords.join(', ')}`);
                  }

                  if (packageJson.homepage) {
                    console.log(`${chalk.bold('Homepage:')} ${packageJson.homepage}`);
                  }

                  console.log(chalk.dim('\n──────────────────────────────────\n'));
                  return;
                }
              }
            }
          } catch (error) {
            // Skip
          }
        }

        console.log(chalk.red(`Plugin "${name}" not found.\n`));
      })
  );
