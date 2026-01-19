import { ObjectSchema, Field } from '@objectstack/spec';

export const Opportunity = ObjectSchema.create({
  name: 'opportunity',
  label: 'Opportunity',
  icon: 'dollar-sign',
  fields: {
    name: Field.text({ required: true }),
    account: Field.lookup('account', { required: true }),
    amount: Field.currency(),
    close_date: Field.date(),
    
    stage: Field.select([
      'Prospecting',
      'Qualification',
      'Proposal',
      'Negotiation',
      'Closed Won',
      'Closed Lost'
    ]),
    
    probability: Field.percent(),
  },
  enable: {
    trackHistory: true, // Track history of Stage changes
    // workflow: true
  }
});