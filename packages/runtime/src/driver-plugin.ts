// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

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
    type = 'driver';
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
        // Auto-configure alias for shorter access if it follows reverse domain standard
        if (this.name.startsWith('com.objectstack.driver.')) {
            // const shortName = this.name.split('.').pop();
            // Optional: ctx.registerService(`driver.${shortName}`, this.driver);
        }

        // Auto-configure 'default' datasource if none exists
        // We do this in 'start' phase to ensure metadata service is likely available
        try {
            const metadata = ctx.getService<any>('metadata');
            if (metadata && metadata.addDatasource) {
                // Check if default datasource exists
                const datasources = metadata.getDatasources ? metadata.getDatasources() : [];
                const hasDefault = datasources.some((ds: any) => ds.name === 'default');

                if (!hasDefault) {
                    ctx.logger.info(`[DriverPlugin] No 'default' datasource found. Auto-configuring '${this.driver.name}' as default.`);
                    await metadata.addDatasource({
                        name: 'default',
                        driver: this.driver.name, // The driver's internal name (e.g. com.objectstack.driver.memory)
                    });
                }
            }
        } catch (e) {
            // Metadata service might not be ready or available, which is fine
            // We just skip auto-configuration
            ctx.logger.debug('[DriverPlugin] Failed to auto-configure default datasource (Metadata service missing?)', { error: e });
        }

        ctx.logger.debug('Driver plugin started', { driverName: this.driver.name || 'unknown' });
    }
}
