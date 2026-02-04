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

    init = async (ctx: PluginContext) => {
        // Register driver as a service instead of directly to objectql
        const serviceName = `driver.${this.driver.name || 'unknown'}`;
        ctx.registerService(serviceName, this.driver);
        ctx.logger.info('Driver service registered', { 
            serviceName, 
            driverName: this.driver.name,
            driverVersion: this.driver.version 
        });
    }

    start = async (ctx: PluginContext) => {
        // Drivers don't need start phase, initialization happens in init
        ctx.logger.debug('Driver plugin started', { driverName: this.driver.name || 'unknown' });
    }
}
