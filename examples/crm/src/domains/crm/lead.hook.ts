
import { HookContext, Hook } from '@steedos/spec';

const leadHook: Hook = {
    name: 'lead_automation',
    object: 'lead',
    events: ['beforeInsert', 'afterUpdate'],
    handler: async (ctx: HookContext) => {
        if (ctx.event === 'beforeInsert') {
            const { input } = ctx;
            // Auto-score logic (mock)
            let score = 0;
            if (input.email && typeof input.email === 'string' && input.email.endsWith('@enterprise.com')) {
                score += 50;
            }
            if (input.phone) {
                score += 20;
            }
            input.score = score;
        }

        if (ctx.event === 'afterUpdate') {
            const { input, previous } = ctx;
            // Detect status change to 'qualified'
            if (input.status === 'qualified' && previous && previous.status !== 'qualified') {
                console.log('Lead qualified! Ready for conversion.');
            }
        }
    }
};

export default leadHook;
