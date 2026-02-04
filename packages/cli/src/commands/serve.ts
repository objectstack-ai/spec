import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import net from 'net';
import chalk from 'chalk';
import { bundleRequire } from 'bundle-require';

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
  .option('--no-server', 'Skip starting HTTP server plugin')
  .action(async (configPath, options) => {
    let port = parseInt(options.port);
    try {
      const availablePort = await getAvailablePort(port);
      if (availablePort !== port) {
        port = availablePort;
      }
    } catch (e) {
      // Ignore error and try with original port, or let it fail later
    }

    console.log(chalk.bold(`\n🚀 ObjectStack Server`));
    console.log(chalk.dim(`------------------------`));
    console.log(`📂 Config: ${chalk.blue(configPath)}`);
    if (parseInt(options.port) !== port) {
      console.log(`🌐 Port: ${chalk.blue(port)} ${chalk.yellow(`(requested: ${options.port} in use)`)}`);
    } else {
      console.log(`🌐 Port: ${chalk.blue(port)}`);
    }
    console.log('');


    const absolutePath = path.resolve(process.cwd(), configPath);
    
    if (!fs.existsSync(absolutePath)) {
      console.error(chalk.red(`\n❌ Configuration file not found: ${absolutePath}`));
      process.exit(1);
    }

    try {
      // Load configuration
      console.log(chalk.yellow(`📦 Loading configuration...`));
      const { mod } = await bundleRequire({
        filepath: absolutePath,
      });

      const config = mod.default || mod;

      if (!config) {
        throw new Error(`Default export not found in ${configPath}`);
      }

      console.log(chalk.green(`✓ Configuration loaded`));

      // Import ObjectStack runtime
      const { Runtime } = await import('@objectstack/runtime');
      
      // Create runtime instance
      console.log(chalk.yellow(`🔧 Initializing ObjectStack runtime...`));
      
      // Auto-configure pretty logging in development mode
      const isDev = options.dev || process.env.NODE_ENV === 'development';
      const loggerConfig = isDev ? { format: 'pretty' } : undefined;

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
           kernel.use(new ObjectQLPlugin());
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
           kernel.use(new DriverPlugin(new InMemoryDriver()));
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
           kernel.use(new AppPlugin(config));
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

            kernel.use(pluginToLoad);
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
          kernel.use(serverPlugin);
          console.log(chalk.green(`  ✓ Registered HTTP server plugin (port: ${port})`));
        } catch (e: any) {
          console.warn(chalk.yellow(`  ⚠ HTTP server plugin not available: ${e.message}`));
        }
      }

      // Boot the runtime
      console.log(chalk.yellow(`\n🚀 Starting ObjectStack...`));
      await runtime.start();

      console.log(chalk.green(`\n✅ ObjectStack server is running!`));
      console.log(chalk.dim(`   Press Ctrl+C to stop\n`));

      // Keep process alive
      process.on('SIGINT', async () => {
        console.log(chalk.yellow(`\n\n⏹  Stopping server...`));
        await runtime.getKernel().shutdown();
        console.log(chalk.green(`✅ Server stopped`));
        process.exit(0);
      });

    } catch (error: any) {
      console.error(chalk.red(`\n❌ Server Error:`));
      console.error(error.message || error);
      console.error(error.stack);
      process.exit(1);
    }
  });
