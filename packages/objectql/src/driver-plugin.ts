import { Plugin, PluginContext } from './plugin';

/**
 * Driver Plugin
 * 
 * Generic plugin wrapper for ObjectQL drivers.
 * Registers a driver with the ObjectQL engine.
 * 
 * Dependencies: ['com.objectstack.engine.objectql']
 * Services: None (modifies objectql service)
 * 
 * @example
 * const memoryDriver = new InMemoryDriver();
 * const driverPlugin = new DriverPlugin(memoryDriver, 'memory');
 * kernel.use(driverPlugin);
 */
export class DriverPlugin implements Plugin {
    name: string;
    version = '1.0.0';
    dependencies = ['com.objectstack.engine.objectql'];

    private driver: any;

    constructor(driver: any, driverName?: string) {
        this.driver = driver;
        this.name = `com.objectstack.driver.${driverName || driver.name || 'unknown'}`;
    }

    async init(ctx: PluginContext) {
        // Get ObjectQL service
        const objectql = ctx.getService<any>('objectql');
        
        // Register driver
        objectql.registerDriver(this.driver);
        ctx.logger.log(`[DriverPlugin] Registered driver: ${this.driver.name || 'unknown'}`);
    }

    async start(ctx: PluginContext) {
        // Drivers don't need start phase, initialization happens in init
        ctx.logger.log(`[DriverPlugin] Driver ready: ${this.driver.name || 'unknown'}`);
    }
}
