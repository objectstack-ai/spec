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
  printServerReady,
} from '../utils/format.js';
import {
  STUDIO_PATH,
  resolveStudioPath,
  hasStudioDist,
  createStudioStaticPlugin,
} from '../utils/studio.js';

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
  .option('--ui', 'Enable Studio UI at /_studio/ (default: true in dev mode)')
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

    const absolutePath = path.resolve(process.cwd(), configPath);
    const relativeConfig = path.relative(process.cwd(), absolutePath);
    
    if (!fs.existsSync(absolutePath)) {
      printError(`Configuration file not found: ${absolutePath}`);
      console.log(chalk.dim('  Hint: Run `objectstack init` to create a new project'));
      process.exit(1);
    }

    // Quiet loading — only show a single spinner line
    console.log('');
    console.log(chalk.dim(`  Loading ${relativeConfig}...`));

    // Track loaded plugins for summary
    const loadedPlugins: string[] = [];
    const shortPluginName = (raw: string) => {
      // Map verbose internal IDs to short display names
      if (raw.includes('objectql')) return 'ObjectQL';
      if (raw.includes('driver') && raw.includes('memory')) return 'MemoryDriver';
      if (raw.startsWith('plugin.app.')) return raw.replace('plugin.app.', '').split('.').pop() || raw;
      if (raw.includes('hono')) return 'HonoServer';
      return raw;
    };
    const trackPlugin = (name: string) => { loadedPlugins.push(shortPluginName(name)); };

    // Save original console/stdout methods — we'll suppress noise during boot
    const originalConsoleLog = console.log;
    const originalConsoleDebug = console.debug;
    const origStdoutWrite = process.stdout.write.bind(process.stdout);
    let bootQuiet = false;

    const restoreOutput = () => {
      bootQuiet = false;
      process.stdout.write = origStdoutWrite;
      console.log = originalConsoleLog;
      console.debug = originalConsoleDebug;
    };

    const portShifted = parseInt(options.port) !== port;

    try {
      // ── Suppress ALL runtime noise during boot ────────────────────
      // Multiple sources write to stdout during startup:
      //   • Pino-pretty (direct process.stdout.write)
      //   • ObjectLogger browser fallback (console.log)
      //   • SchemaRegistry (console.log)
      // We capture stdout entirely, then restore after runtime.start().
      bootQuiet = true;
      process.stdout.write = (chunk: any, ...rest: any[]) => {
        if (bootQuiet) return true;  // swallow
        return (origStdoutWrite as any)(chunk, ...rest);
      };
      console.log = (...args: any[]) => { if (!bootQuiet) originalConsoleLog(...args); };
      console.debug = (...args: any[]) => { if (!bootQuiet) originalConsoleDebug(...args); };

      // Load configuration
      const { mod } = await bundleRequire({
        filepath: absolutePath,
      });

      const config = mod.default || mod;

      if (!config) {
        throw new Error(`No default export found in ${configPath}`);
      }

      // Import ObjectStack runtime
      const { Runtime } = await import('@objectstack/runtime');

      // Set kernel logger to 'silent' — the CLI manages its own output
      const loggerConfig = { level: 'silent' as const };

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
        plugins = [...plugins, ...config.devPlugins];
      }

      // 1. Auto-register ObjectQL Plugin if objects define but plugins missing
      const hasObjectQL = plugins.some((p: any) => p.name?.includes('objectql') || p.constructor?.name?.includes('ObjectQL'));
      if (config.objects && !hasObjectQL) {
         try {
           const { ObjectQLPlugin } = await import('@objectstack/objectql');
           await kernel.use(new ObjectQLPlugin());
           trackPlugin('ObjectQL');
         } catch (e: any) {
           // silent
         }
      }

      // 2. Auto-register Memory Driver if in Dev and no driver configured
      const hasDriver = plugins.some((p: any) => p.name?.includes('driver') || p.constructor?.name?.includes('Driver'));
      if (isDev && !hasDriver && config.objects) {
         try {
           const { DriverPlugin } = await import('@objectstack/runtime');
           const { InMemoryDriver } = await import('@objectstack/driver-memory');
           await kernel.use(new DriverPlugin(new InMemoryDriver()));
           trackPlugin('MemoryDriver');
         } catch (e: any) {
           // silent
         }
      }

      // 3. Auto-register AppPlugin if config contains app definitions
      if (config.objects || config.manifest || config.apps) {
        try {
           const { AppPlugin } = await import('@objectstack/runtime');
           await kernel.use(new AppPlugin(config));
           trackPlugin('App');
        } catch (e: any) {
           // silent
        }
      }

      
      if (plugins.length > 0) {
        for (const plugin of plugins) {
          try {
            let pluginToLoad = plugin;

            // Resolve string references (package names)
            if (typeof plugin === 'string') {
              try {
                 const imported = await import(plugin);
                 pluginToLoad = imported.default || imported;
              } catch (importError: any) {
                 throw new Error(`Failed to import plugin '${plugin}': ${importError.message}`);
              }
            }

            await kernel.use(pluginToLoad);
            const pluginName = plugin.name || plugin.constructor?.name || 'unnamed';
            trackPlugin(pluginName);
          } catch (e: any) {
            console.error(chalk.red(`  ✗ Failed to load plugin: ${e.message}`));
          }
        }
      }

      // Add HTTP server plugin if not disabled
      if (options.server !== false) {
        try {
          const { HonoServerPlugin } = await import('@objectstack/plugin-hono-server');
          const serverPlugin = new HonoServerPlugin({ port });
          await kernel.use(serverPlugin);
          trackPlugin('HonoServer');
        } catch (e: any) {
          console.warn(chalk.yellow(`  ⚠ HTTP server plugin not available: ${e.message}`));
        }

        // Register REST API plugin (consumes http.server + protocol services)
        try {
          const { createRestApiPlugin } = await import('@objectstack/rest');
          await kernel.use(createRestApiPlugin());
          trackPlugin('RestAPI');
        } catch (e: any) {
          // @objectstack/rest is optional
        }

        // Register Dispatcher plugin (auth, graphql, analytics, packages, hub, storage, automation)
        try {
          const { createDispatcherPlugin } = await import('@objectstack/runtime');
          await kernel.use(createDispatcherPlugin());
          trackPlugin('Dispatcher');
        } catch (e: any) {
          // optional
        }
      }

      // ── Studio UI ─────────────────────────────────────────────────
      // In dev mode, Studio UI is enabled by default (use --no-ui to disable).
      // Always serves the pre-built dist/ — no Vite dev server, no extra port.
      const enableUI = options.ui ?? isDev;

      if (enableUI) {
        const studioPath = resolveStudioPath();
        if (!studioPath) {
          console.warn(chalk.yellow(`  ⚠ @objectstack/studio not found — skipping UI`));
        } else if (hasStudioDist(studioPath)) {
          const distPath = path.join(studioPath, 'dist');
          await kernel.use(createStudioStaticPlugin(distPath));
          trackPlugin('StudioUI');
        } else {
          console.warn(chalk.yellow(`  ⚠ Studio dist not found — run "pnpm --filter @objectstack/studio build" first`));
        }
      }

      // Boot the runtime
      await runtime.start();

      // Wait briefly for pino worker thread buffers to flush, then restore
      await new Promise(r => setTimeout(r, 100));
      restoreOutput();

      // ── Clean startup summary ──────────────────────────────────────
      printServerReady({
        port,
        configFile: relativeConfig,
        isDev,
        pluginCount: loadedPlugins.length,
        pluginNames: loadedPlugins,
        uiEnabled: enableUI,
        studioPath: STUDIO_PATH,
      });

      // Keep process alive
      process.on('SIGINT', async () => {
        console.warn(chalk.yellow(`\n\n⏹  Stopping server...`));
        await runtime.getKernel().shutdown();
        console.log(chalk.green(`✅ Server stopped`));
        process.exit(0);
      });

    } catch (error: any) {
      restoreOutput();
      console.log('');
      printError(error.message || String(error));
      if (process.env.DEBUG) console.error(chalk.dim(error.stack));
      process.exit(1);
    }
  });
