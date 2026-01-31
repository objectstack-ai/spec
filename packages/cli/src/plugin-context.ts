import chalk from 'chalk';
import { spawn, exec as execCallback } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import type { CLIPluginContext } from '@objectstack/spec/cli';

const exec = promisify(execCallback);

/**
 * Configuration Manager
 * Manages CLI configuration stored in user's home directory
 */
class ConfigManager {
  private configPath: string;
  private config: Record<string, any> = {};

  constructor(configPath: string) {
    this.configPath = configPath;
  }

  async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(data);
    } catch (error) {
      // Config file doesn't exist yet, start with empty config
      this.config = {};
    }
  }

  get(key: string): any {
    return this.config[key];
  }

  async set(key: string, value: any): Promise<void> {
    this.config[key] = value;
    await this.save();
  }

  has(key: string): boolean {
    return key in this.config;
  }

  private async save(): Promise<void> {
    const dir = path.dirname(this.configPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
  }
}

/**
 * Logger Implementation
 */
class Logger {
  log(message: string): void {
    console.log(message);
  }

  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  error(message: string): void {
    console.log(chalk.red('✖'), message);
  }

  debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(chalk.gray('🔍'), message);
    }
  }

  success(message: string): void {
    console.log(chalk.green('✓'), message);
  }
}

/**
 * Utility Functions
 */
class Utils {
  async spawn(command: string, args: string[], options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'inherit',
        ...options,
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ code });
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });

      child.on('error', reject);
    });
  }

  async exec(command: string): Promise<string> {
    const { stdout } = await exec(command);
    return stdout.trim();
  }

  async readFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf-8');
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async mkdir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Detect package manager
 */
async function detectPackageManager(): Promise<'npm' | 'pnpm' | 'yarn' | 'bun'> {
  // Check for lock files
  const cwd = process.cwd();
  
  try {
    await fs.access(path.join(cwd, 'pnpm-lock.yaml'));
    return 'pnpm';
  } catch {}

  try {
    await fs.access(path.join(cwd, 'yarn.lock'));
    return 'yarn';
  } catch {}

  try {
    await fs.access(path.join(cwd, 'bun.lockb'));
    return 'bun';
  } catch {}

  return 'npm';
}

/**
 * Create CLI Plugin Context
 */
export async function createPluginContext(): Promise<CLIPluginContext> {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const configPath = path.join(homeDir, '.objectstack', 'config.json');
  
  const configManager = new ConfigManager(configPath);
  await configManager.load();

  const logger = new Logger();
  const utils = new Utils();
  const packageManager = await detectPackageManager();

  return {
    cwd: process.cwd(),
    logger: logger as any,
    config: {
      get: (key: string) => configManager.get(key),
      set: (key: string, value: any) => configManager.set(key, value),
      has: (key: string) => configManager.has(key),
    } as any,
    packageManager,
    utils: {
      spawn: (command: string, args: string[], options?: any) => utils.spawn(command, args, options),
      exec: (command: string) => utils.exec(command),
      readFile: (filePath: string) => utils.readFile(filePath),
      writeFile: (filePath: string, content: string) => utils.writeFile(filePath, content),
      fileExists: (filePath: string) => utils.fileExists(filePath),
      mkdir: (dirPath: string) => utils.mkdir(dirPath),
    } as any,
  };
}
