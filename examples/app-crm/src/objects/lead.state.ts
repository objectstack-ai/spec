import { StateMachineConfig } from '@objectstack/spec/automation';

/**
 * Lead Lifecycle State Machine
 * 
 * Defines the strict status transitions for Leads to prevent invalid operations
 * and guide AI agents.
 */
export const LeadStateMachine: StateMachineConfig = {
  id: 'lead_process',
  initial: 'new',
  states: {
    new: {
      on: {
        CONTACT: { target: 'contacted', description: 'Log initial contact' },
        DISQUALIFY: { target: 'unqualified', description: 'Mark as unqualified early' }
      },
      meta: {
        aiInstructions: 'New lead. Verify email and phone before contacting. Do not change status until contact is made.'
      }
    },
    contacted: {
      on: {
        QUALIFY: { target: 'qualified', cond: 'has_budget_and_authority' },
        DISQUALIFY: { target: 'unqualified' }
      },
      meta: {
        aiInstructions: 'Engage with the lead. Qualify by asking about budget, authority, need, and timeline (BANT).'
      }
    },
    qualified: {
      on: {
        CONVERT: { target: 'converted', cond: 'is_ready_to_buy' },
        DISQUALIFY: { target: 'unqualified' }
      },
      meta: {
        aiInstructions: 'Lead is qualified. Prepare for conversion to Deal/Opportunity. Check for existing accounts.'
      }
    },
    unqualified: {
      on: {
        REOPEN: { target: 'new', description: 'Re-evaluate lead' }
      },
      meta: {
        aiInstructions: 'Lead is dead. Do not contact unless new information surfaces.'
      }
    },
    converted: {
      type: 'final',
      meta: {
        aiInstructions: 'Lead is converted. No further actions allowed on this record.'
      }
    }
  }
};
