"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiEngine = void 0;
class BiEngine {
    constructor() {
        console.log('[BI Plugin] Engine Initialized');
    }
    registerDataset(path) {
        console.log(`[BI Plugin] Registered dataset: ${path}`);
    }
    runQuery(query) {
        console.log(`[BI Plugin] Running Query: ${query}`);
        return { result: 'Mock Data' };
    }
}
exports.BiEngine = BiEngine;
const plugin = {
    id: 'com.objectstack.bi',
    version: '1.0.0',
    onEnable: async (context) => {
        // 1. Destructure strict APIs
        const { logger, ql, os, app, storage, i18n } = context;
        logger.info('[BI Plugin] Enabling BI Plugin...');
        // 2. Use Configuration
        const config = await os.getConfig('com.objectstack.bi');
        if (config?.enableCache) {
            logger.info('Caching Enabled');
        }
        // 3. Register Service
        const engine = new BiEngine();
        // Access runtime capabilities not in strict schema
        // In a real implementation module augmentation would be used
        const runtime = context;
        if (runtime.services) {
            runtime.services.register('bi.engine', engine);
        }
        // 4. Register Route
        app.router.get('/bi/status', async () => {
            return { status: 'running', engine: 'v1' };
        });
        // 5. Use Storage
        await storage.set('started_at', Date.now());
        // 6. Demonstrate i18n & Data Access
        // (In a real app, this would be used in a route or job)
        if (Date.now() % 1000 === 0) {
            console.log(i18n.t('hello_world', {}));
            await ql.object('account').query('SELECT count() FROM account');
        }
        logger.info('[BI Plugin] Services registered.');
    }
};
exports.default = plugin;
