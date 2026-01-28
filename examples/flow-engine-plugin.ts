/**
 * Flow Engine Plugin Example
 * 
 * Demonstrates event-driven architecture:
 * - Listens to data:record:afterCreate events
 * - Triggers automated workflows based on data changes
 * - Completely decoupled from Data Engine
 */

import { Plugin, PluginContext } from '@objectstack/runtime';

export class FlowEnginePlugin implements Plugin {
    name = 'com.objectstack.engine.flow';
    version = '1.0.0';

    async init(ctx: PluginContext) {
        // Register Flow Engine service (for programmatic access)
        const flowEngine = {
            executeFlow: async (flowName: string, data: any) => {
                ctx.logger.log(`[Flow] Executing flow: ${flowName}`, data);
                // Flow execution logic here
            }
        };
        
        ctx.registerService('flow-engine', flowEngine);
        ctx.logger.log('[Flow] Flow Engine service registered');
    }

    async start(ctx: PluginContext) {
        // Listen to data creation events
        ctx.hook('data:record:afterCreate', async ({ table, data }) => {
            ctx.logger.log(`[Flow] 📨 Detected new record in ${table}`);
            
            // Example: Trigger order processing workflow
            if (table === 'orders' && data.status === 'pending') {
                ctx.logger.log(`[Flow] ⚡️ Triggering 'Order Processing' flow for Order #${data.id}`);
                
                // Get flow engine service
                const flowEngine = ctx.getService<any>('flow-engine');
                await flowEngine.executeFlow('process_order', data);
            }
            
            // Example: Trigger notification workflow
            if (table === 'contacts' && data.email) {
                ctx.logger.log(`[Flow] 📧 Triggering 'Welcome Email' flow for ${data.email}`);
                const flowEngine = ctx.getService<any>('flow-engine');
                await flowEngine.executeFlow('send_welcome_email', data);
            }
        });

        // Listen to data update events
        ctx.hook('data:record:afterUpdate', async ({ table, data, changes }) => {
            ctx.logger.log(`[Flow] 📝 Detected update in ${table}`, changes);
            
            if (table === 'orders' && changes.status === 'shipped') {
                ctx.logger.log(`[Flow] 📦 Triggering 'Shipping Notification' flow`);
                const flowEngine = ctx.getService<any>('flow-engine');
                await flowEngine.executeFlow('notify_shipping', data);
            }
        });

        ctx.logger.log('[Flow] ✅ Flow Engine initialized and listening to data events');
    }

    async destroy() {
        console.log('[Flow] Flow Engine stopped');
    }
}
