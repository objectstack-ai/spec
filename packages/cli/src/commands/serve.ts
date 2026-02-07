import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import net from 'net';
import chalk from 'chalk';
import { bundleRequire } from 'bundle-require';
import { loadConfig } from '../utils/config.js';
import {
  printHeader,
  printKV,
  printSuccess,
  printError,
  printStep,
  printInfo,
} from '../utils/format.js';
import {
  STUDIO_PATH,
  resolveConsolePath,
  hasConsoleDist,
  spawnViteDevServer,
  createConsoleProxyPlugin,
  createConsoleStaticPlugin,
} from '../utils/console.js';

// Helper to find available port
const getAvailablePort = async (startPort: number): Promise<number> => {
  const isPortAvailable = (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', (err: any) => {
        resolve(false);
      });
      server.once('listening', () => {
        server.close(() => resolve(true));
      });
      server.listen(port);
    });
  };

  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
    if (port > startPort + 100) {
       throw new Error(`Could not find an available port starting from ${startPort}`);
    }
  }
  return port;
};

export const serveCommand = new Command('serve')
  .description('Start ObjectStack server with plugins from configuration')
  .argument('[config]', 'Configuration file path', 'objectstack.config.ts')
  .option('-p, --port <port>', 'Server port', '3000')
  .option('--dev', 'Run in development mode (load devPlugins)')
  .option('--ui', 'Enable Console UI at /_studio/')
  .option('--no-server', 'Skip starting HTTP server plugin')
  .action(async (configPath, options) => {
    let port = parseInt(options.port);
    try {
      const availablePort = await getAvailablePort(port);
      if (availablePort !== port) {
        port = availablePort;
      }
    } catch (e) {
      // Ignore error and try with original port
    }

    const isDev = options.dev || process.env.NODE_ENV === 'development';
    printHeader(isDev ? 'Dev Server' : 'Serve');

    const absolutePath = path.resolve(process.cwd(), configPath);
    
    if (!fs.existsSync(absolutePath)) {
      printError(`Configuration file not found: ${absolutePath}`);
      console.log(chalk.dim('  Hint: Run `objectstack init` to create a new project'));
      process.exit(1);
    }

    printKV('Config', path.relative(process.cwd(), absolutePath));
    if (parseInt(options.port) !== port) {
      printKV('Port', `${port} ${chalk.yellow(`(${options.port} in use)`)}`);
    } else {
      printKV('Port', String(port));
    }
    if (isDev) printKV('Mode', 'development');
    console.log('');

    try {
      // Load configuration
      printStep('Loading configuration...');
      const { mod } = await bundleRequire({
        filepath: absolutePath,
      });

      const config = mod.default || mod;

      if (!config) {
        throw new Error(`No default export found in ${configPath}`);
      }

      printSuccess('Configuration loaded');

      // Import ObjectStack runtime
      const { Runtime } = await import('@objectstack/runtime');

      // Create runtime instance
      printStep('Initializing runtime...');
      
      // Auto-configure pretty logging in development mode
      const loggerConfig = isDev ? { format: 'pretty' as const } : undefined;

      const runtime = new Runtime({
        kernel: {
            logger: loggerConfig
        }
      });
      const kernel = runtime.getKernel();

      // Load plugins from configuration
      let plugins = config.plugins || [];

      // Merge devPlugins if in dev mode
      if (options.dev && config.devPlugins) {
        console.log(chalk.blue(`📦 Loading development plugins...`));
        plugins = [...plugins, ...config.devPlugins];
      }

      // 1. Auto-register ObjectQL Plugin if objects define but plugins missing
      const hasObjectQL = plugins.some((p: any) => p.name?.includes('objectql') || p.constructor?.name?.includes('ObjectQL'));
      if (config.objects && !hasObjectQL) {
         try {
           console.log(chalk.dim(`  Auto-injecting ObjectQL Engine...`));
           const { ObjectQLPlugin } = await import('@objectstack/objectql');
           await kernel.use(new ObjectQLPlugin());
           console.log(chalk.green(`  ✓ Registered ObjectQL Plugin (auto-detected)`));
         } catch (e: any) {
           console.warn(chalk.yellow(`  ⚠ Could not auto-load ObjectQL: ${e.message}`));
         }
      }

      // 2. Auto-register Memory Driver if in Dev and no driver configured
      const hasDriver = plugins.some((p: any) => p.name?.includes('driver') || p.constructor?.name?.includes('Driver'));
      if (isDev && !hasDriver && config.objects) {
         try {
           console.log(chalk.dim(`  Auto-injecting Memory Driver (Dev Mode)...`));
           const { DriverPlugin } = await import('@objectstack/runtime');
           const { InMemoryDriver } = await import('@objectstack/driver-memory');
           await kernel.use(new DriverPlugin(new InMemoryDriver()));
           console.log(chalk.green(`  ✓ Registered Memory Driver (auto-detected)`));
         } catch (e: any) {
           // Silent fail - maybe they don't want a driver or don't have the package
           console.log(chalk.dim(`  ℹ No default driver loaded: ${e.message}`));
         }
      }

      // 3. Auto-register AppPlugin if config contains app definitions
      if (config.objects || config.manifest || config.apps) {
        try {
           const { AppPlugin } = await import('@objectstack/runtime');
           await kernel.use(new AppPlugin(config));
           console.log(chalk.green(`  ✓ Registered App Plugin (auto-detected)`));
        } catch (e: any) {
           console.warn(chalk.yellow(`  ⚠ Could not auto-load AppPlugin: ${e.message}`));
        }
      }

      
      if (plugins.length > 0) {
        console.log(chalk.yellow(`📦 Loading ${plugins.length} plugin(s)...`));
        
        for (const plugin of plugins) {
          try {
            let pluginToLoad = plugin;

            // Resolve string references (package names)
            if (typeof plugin === 'string') {
              console.log(chalk.dim(`  Trying to resolve plugin: ${plugin}`));
              try {
                // Try dynamic import for packages
                 const imported = await import(plugin);
                 pluginToLoad = imported.default || imported;
              } catch (importError: any) {
                 // Fallback: try bundleRequire for local paths if needed, otherwise throw
                 throw new Error(`Failed to import plugin '${plugin}': ${importError.message}`);
              }
            }

            await kernel.use(pluginToLoad);
            const pluginName = plugin.name || plugin.constructor?.name || 'unnamed';
            console.log(chalk.green(`  ✓ Registered plugin: ${pluginName}`));
          } catch (e: any) {
            console.error(chalk.red(`  ✗ Failed to register plugin: ${e.message}`));
          }
        }
      }

      // Add HTTP server plugin if not disabled
      if (options.server !== false) {
        try {
          const { HonoServerPlugin } = await import('@objectstack/plugin-hono-server');
          const serverPlugin = new HonoServerPlugin({ port });
          await kernel.use(serverPlugin);
          console.log(chalk.green(`  ✓ Registered HTTP server plugin (port: ${port})`));
        } catch (e: any) {
          console.warn(chalk.yellow(`  ⚠ HTTP server plugin not available: ${e.message}`));
        }
      }

      // ── Console UI (--ui) ───────────────────────────────────────────
      let viteProcess: import('child_process').ChildProcess | null = null;

      if (options.ui) {
        const consolePath = resolveConsolePath();
        if (!consolePath) {
          console.log(chalk.yellow(`  ⚠ @objectstack/console not found — skipping UI`));
        } else if (isDev) {
          // Dev mode → spawn Vite dev server & proxy through Hono
          try {
            printStep('Starting Console UI (dev)…');
            const result = await spawnViteDevServer(consolePath, { serverPort: port });
            viteProcess = result.process;
            await kernel.use(createConsoleProxyPlugin(result.port));
            console.log(chalk.green(`  ✓ Console UI proxied from Vite :${result.port}`));
          } catch (e: any) {
            console.log(chalk.yellow(`  ⚠ Console UI failed to start: ${e.message}`));
          }
        } else {
          // Production mode → serve pre-built static files
          const distPath = path.join(consolePath, 'dist');
          if (hasConsoleDist(consolePath)) {
            await kernel.use(createConsoleStaticPlugin(distPath));
            console.log(chalk.green(`  ✓ Console UI served from ${chalk.dim(distPath)}`));
          } else {
            console.log(chalk.yellow(`  ⚠ Console dist not found — run "pnpm --filter @objectstack/console build" first`));
          }
        }
      }

      // Boot the runtime
      printStep('Starting server...');
      await runtime.start();

      console.log('');
      printSuccess(`Server running on port ${chalk.bold(String(port))}`);
      if (options.ui) {
        console.log(chalk.cyan(`  ➜ Console: ${chalk.bold(`http://localhost:${port}${STUDIO_PATH}/`)}`));
      }
      console.log(chalk.dim('  Press Ctrl+C to stop'));
      console.log('');

      // Keep process alive
      process.on('SIGINT', async () => {
        console.log(chalk.yellow(`\n\n⏹  Stopping server...`));
        if (viteProcess) {
          viteProcess.kill();
          viteProcess = null;
        }
        await runtime.getKernel().shutdown();
        console.log(chalk.green(`✅ Server stopped`));
        process.exit(0);
      });

    } catch (error: any) {
      console.log('');
      printError(error.message || String(error));
      if (process.env.DEBUG) console.error(chalk.dim(error.stack));
      process.exit(1);
    }
  });
