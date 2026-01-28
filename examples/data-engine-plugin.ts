/**
 * Enhanced Data Engine Plugin Example
 * 
 * Demonstrates event emission:
 * - Triggers hooks before/after data operations
 * - Allows other plugins (like Flow Engine) to react
 * - Implements the event producer pattern
 */

import { Plugin, PluginContext } from '@objectstack/runtime';

export class DataEnginePlugin implements Plugin {
    name = 'com.objectstack.engine.data';
    version = '1.0.0';

    async init(ctx: PluginContext) {
        // Create enhanced database service with event hooks
        const db = {
            // Insert with event hooks
            insert: async (table: string, data: any) => {
                ctx.logger.log(`[DB] Preparing to insert into ${table}...`);
                
                // 1. Trigger "before" hook - allows modification
                await ctx.trigger('data:record:beforeCreate', { table, data });
                
                // Simulate database insertion
                const record = { id: Math.random().toString(36).substr(2, 9), ...data };
                ctx.logger.log(`[DB] ✅ Inserted:`, record);
                
                // 2. Trigger "after" hook - for automation (non-blocking)
                // Use fire-and-forget to avoid blocking the main flow
                ctx.trigger('data:record:afterCreate', { table, data: record })
                    .catch(err => ctx.logger.error('[DB] Error in afterCreate hook:', err));
                
                return record;
            },

            // Update with event hooks
            update: async (table: string, id: string, data: any) => {
                ctx.logger.log(`[DB] Updating ${table}/${id}...`);
                
                // Simulate getting old record
                const oldRecord = { id, ...data };
                
                // Trigger "before" hook
                await ctx.trigger('data:record:beforeUpdate', { table, id, data, oldRecord });
                
                // Simulate update
                const updatedRecord = { ...oldRecord, ...data };
                ctx.logger.log(`[DB] ✅ Updated:`, updatedRecord);
                
                // Trigger "after" hook with changes
                const changes = data; // In real implementation, compute actual changes
                ctx.trigger('data:record:afterUpdate', { table, id, data: updatedRecord, changes })
                    .catch(err => ctx.logger.error('[DB] Error in afterUpdate hook:', err));
                
                return updatedRecord;
            },

            // Delete with event hooks
            delete: async (table: string, id: string) => {
                ctx.logger.log(`[DB] Deleting ${table}/${id}...`);
                
                // Trigger "before" hook
                await ctx.trigger('data:record:beforeDelete', { table, id });
                
                // Simulate deletion
                ctx.logger.log(`[DB] ✅ Deleted ${table}/${id}`);
                
                // Trigger "after" hook
                ctx.trigger('data:record:afterDelete', { table, id })
                    .catch(err => ctx.logger.error('[DB] Error in afterDelete hook:', err));
                
                return { id };
            },

            // Query method (without events for now)
            query: (sql: string) => {
                ctx.logger.log(`[DB] Executing query: ${sql}`);
                return [];
            }
        };
        
        ctx.registerService('db', db);
        ctx.logger.log('[DB] Enhanced Data Engine service registered with event hooks');
    }

    async start(ctx: PluginContext) {
        const db = ctx.getService<any>('db');
        ctx.logger.log('[DB] Data Engine ready');
    }
}
