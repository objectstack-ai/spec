import { Plugin, PluginContext } from '@objectstack/core';

/**
 * Driver Plugin
 * 
 * Generic plugin wrapper for ObjectQL drivers.
 * Registers a driver with the ObjectQL engine.
 * 
 * Dependencies: None (Registers service for ObjectQL to discover)
 * Services: driver.{name}
 * 
 * @example
 * const memoryDriver = new InMemoryDriver();
 * const driverPlugin = new DriverPlugin(memoryDriver, 'memory');
 * kernel.use(driverPlugin);
 */
export class DriverPlugin implements Plugin {
    name: string;
    version = '1.0.0';
    // dependencies = ['com.objectstack.engine.objectql']; // Removed: Driver is a producer, not strictly a consumer during init

    private driver: any;

    constructor(driver: any, driverName?: string) {
        this.driver = driver;
        this.name = `com.objectstack.driver.${driverName || driver.name || 'unknown'}`;
    }

    async init(ctx: PluginContext) {
        // Register driver as a service instead of directly to objectql
        const serviceName = `driver.${this.driver.name || 'unknown'}`;
        ctx.registerService(serviceName, this.driver);
        ctx.logger.log(`[DriverPlugin] Registered driver service: ${serviceName}`);
    }

    async start(ctx: PluginContext) {
        // Drivers don't need start phase, initialization happens in init
        ctx.logger.log(`[DriverPlugin] Driver ready: ${this.driver.name || 'unknown'}`);
    }
}
