
import { HookContext, Hook } from '@objectstack/spec/data';

const taskHook: Hook = {
    name: 'task_logic',
    object: 'task',
    events: ['beforeInsert', 'afterUpdate'],
    handler: async (ctx: HookContext) => {
        if (ctx.event === 'beforeInsert') {
            const { input } = ctx;
            // Default priority
            if (!input.priority) {
                input.priority = 'normal';
            }
            // Validation
            if (input.title && input.title.includes('spam')) {
                throw new Error('Spam tasks are not allowed');
            }
        }
        
        if (ctx.event === 'afterUpdate') {
            // Check if completed
            // logic: if input has done=true and previous was done=false
            if (ctx.input.done && ctx.previous && !ctx.previous.done) {
                 // ctx.session might be optional
                 console.log(`Task ${ctx.id} completed by ${ctx.session?.userId || 'unknown'}`);
            }
        }
    }
};

export default taskHook;
