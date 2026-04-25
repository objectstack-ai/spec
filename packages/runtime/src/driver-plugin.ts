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
export interface DriverPluginOptions {
    /**
     * If set, registers a named datasource so packages declaring
     * `defaultDatasource: '<name>'` resolve to this driver.
     */
    datasourceName?: string;
    /**
     * If `true` (default), registers this driver as the `default` datasource
     * when none exists. Set to `false` for proxy drivers (e.g. cloud proxy)
     * that should never become the default.
     */
    registerAsDefault?: boolean;
}

export class DriverPlugin implements Plugin {
    name: string;
    type = 'driver';
    version = '1.0.0';

    private driver: any;
    private options: DriverPluginOptions;

    constructor(driver: any, driverNameOrOptions?: string | DriverPluginOptions, options?: DriverPluginOptions) {
        this.driver = driver;
        const driverName = typeof driverNameOrOptions === 'string' ? driverNameOrOptions : undefined;
        this.options = (typeof driverNameOrOptions === 'object' ? driverNameOrOptions : options) ?? {};
        this.name = `com.objectstack.driver.${driverName || driver.name || 'unknown'}`;
    }

    init = async (ctx: PluginContext) => {
        const serviceName = `driver.${this.driver.name || 'unknown'}`;
        ctx.registerService(serviceName, this.driver);
        ctx.logger.info('Driver service registered', { 
            serviceName, 
            driverName: this.driver.name,
            driverVersion: this.driver.version 
        });
    }

    start = async (ctx: PluginContext) => {
        try {
            const metadata = ctx.getService<any>('metadata');
            if (!metadata?.addDatasource) return;

            // Register a named datasource for this driver (e.g. 'cloud').
            if (this.options.datasourceName) {
                await metadata.addDatasource({
                    name: this.options.datasourceName,
                    driver: this.driver.name,
                });
                ctx.logger.info(`[DriverPlugin] Registered named datasource '${this.options.datasourceName}'`, { driver: this.driver.name });
            }

            // Auto-register as 'default' datasource unless explicitly disabled.
            if (this.options.registerAsDefault !== false) {
                const datasources = metadata.getDatasources ? metadata.getDatasources() : [];
                const hasDefault = datasources.some((ds: any) => ds.name === 'default');
                if (!hasDefault) {
                    ctx.logger.info(`[DriverPlugin] No 'default' datasource found — registering '${this.driver.name}' as default.`);
                    await metadata.addDatasource({ name: 'default', driver: this.driver.name });
                }
            }
        } catch (e) {
            ctx.logger.debug('[DriverPlugin] Failed to configure datasource (metadata service missing?)', { error: e });
        }

        ctx.logger.debug('Driver plugin started', { driverName: this.driver.name || 'unknown' });
    }
}
