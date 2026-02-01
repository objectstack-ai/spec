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
      const { ObjectKernel } = await import('@objectstack/core');
      
      // Create kernel instance
      console.log(chalk.yellow(`🔧 Initializing ObjectStack kernel...`));
      const kernel = new ObjectKernel({
        metadata: config.metadata || {},
        objects: config.objects || {},
      });

      // Load plugins from configuration
      const plugins = config.plugins || [];
      
      if (plugins.length > 0) {
        console.log(chalk.yellow(`📦 Loading ${plugins.length} plugin(s)...`));
        
        for (const plugin of plugins) {
          try {
            kernel.use(plugin);
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

      // Boot the kernel
      console.log(chalk.yellow(`\n🚀 Starting ObjectStack...`));
      await kernel.bootstrap();

      console.log(chalk.green(`\n✅ ObjectStack server is running!`));
      console.log(chalk.dim(`   Press Ctrl+C to stop\n`));

      // Keep process alive
      process.on('SIGINT', async () => {
        console.log(chalk.yellow(`\n\n⏹  Stopping server...`));
        await kernel.shutdown();
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
