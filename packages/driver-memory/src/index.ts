import { InMemoryDriver } from './memory-driver';

export { InMemoryDriver }; // Export class for direct usage

// Note: In a real environment, you would import these from @objectstack/spec
// But distinct PluginDefinition interface might not be strictly defined in schema yet, 
// usually it mimics the Manifest structure + runtime hooks.

// For this example, we define a basic shape if not available, or use "any" to bypass strictness for the demo.
// In plugin-bi it imported: import { PluginDefinition, PluginContextData } from '@objectstack/spec';

// Let's rely on the environment being set up like plugin-bi.
// If types are missing, this is just an example file.

export default {
  id: 'com.objectstack.driver.memory',
  version: '1.0.0',

  onEnable: async (context: any) => {
    const { logger, config, drivers } = context;
    logger.info('[Memory Driver] Initializing...');

    // Simulate driver registration
    // This assumes the runtime exposes a 'drivers' registry
    if (drivers) {
       const driver = new InMemoryDriver(config); // Pass config to driver
       drivers.register(driver);
       logger.info(`[Memory Driver] Registered driver: ${driver.name}`);
    } else {
       logger.warn('[Memory Driver] No driver registry found in context.');
    }
  }
};
