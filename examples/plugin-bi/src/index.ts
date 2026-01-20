import { PluginDefinition, PluginContextData } from '@objectstack/spec';

export class BiEngine {
  constructor() {
    console.log('[BI Plugin] Engine Initialized');
  }

  registerDataset(path: string) {
    console.log(`[BI Plugin] Registered dataset: ${path}`);
  }

  runQuery(query: string) {
    console.log(`[BI Plugin] Running Query: ${query}`);
    return { result: 'Mock Data' };
  }
}

const plugin: PluginDefinition = {
  id: 'com.objectstack.bi',
  version: '1.0.0',

  onEnable: async (context: PluginContextData) => {
    const logger = context.logger || console;
    logger.info('[BI Plugin] Enabling BI Plugin...');
    
    // Register Service
    const engine = new BiEngine();
    
    // Access runtime capabilities not in strict schema
    const runtime = context as any;
    if (runtime.services) {
      runtime.services.register('bi.engine', engine);
    }

    logger.info('[BI Plugin] Services registered.');
  }
};

export default plugin;
