/**
 * Object Definitions Barrel
 * 
 * Re-exports all *.object.ts definitions for auto-registration.
 * Hooks (*.hook.ts) and state machines (*.state.ts) are excluded —
 * they are auto-associated by naming convention at runtime.
 */
export { Account } from './account.object';
export { Campaign } from './campaign.object';
export { Case } from './case.object';
export { Contact } from './contact.object';
export { Contract } from './contract.object';
export { Lead } from './lead.object';
export { Opportunity } from './opportunity.object';
export { Product } from './product.object';
export { Quote } from './quote.object';
export { Task } from './task.object';
