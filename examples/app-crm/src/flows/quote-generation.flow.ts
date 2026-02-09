// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Automation } from '@objectstack/spec';
type Flow = Automation.Flow;

/** Quote Generation — screen flow to create a quote from an opportunity */
export const QuoteGenerationFlow: Flow = {
  name: 'quote_generation',
  label: 'Generate Quote from Opportunity',
  description: 'Create a quote based on opportunity details',
  type: 'screen',

  variables: [
    { name: 'opportunityId', type: 'text', isInput: true, isOutput: false },
    { name: 'quoteName', type: 'text', isInput: true, isOutput: false },
    { name: 'expirationDays', type: 'number', isInput: true, isOutput: false },
    { name: 'discount', type: 'number', isInput: true, isOutput: false },
  ],

  nodes: [
    { id: 'start', type: 'start', label: 'Start', config: { objectName: 'opportunity' } },
    {
      id: 'screen_1', type: 'screen', label: 'Quote Details',
      config: {
        fields: [
          { name: 'quoteName', label: 'Quote Name', type: 'text', required: true },
          { name: 'expirationDays', label: 'Valid For (Days)', type: 'number', required: true, defaultValue: 30 },
          { name: 'discount', label: 'Discount %', type: 'percent', defaultValue: 0 },
        ],
      },
    },
    {
      id: 'get_opportunity', type: 'get_record', label: 'Get Opportunity',
      config: { objectName: 'opportunity', filter: { id: '{opportunityId}' }, outputVariable: 'oppRecord' },
    },
    {
      id: 'create_quote', type: 'create_record', label: 'Create Quote',
      config: {
        objectName: 'quote',
        fields: {
          name: '{quoteName}', opportunity: '{opportunityId}',
          account: '{oppRecord.account}', contact: '{oppRecord.contact}',
          owner: '{$User.Id}', status: 'draft',
          quote_date: '{TODAY()}', expiration_date: '{TODAY() + expirationDays}',
          subtotal: '{oppRecord.amount}', discount: '{discount}',
          discount_amount: '{oppRecord.amount * (discount / 100)}',
          total_price: '{oppRecord.amount * (1 - discount / 100)}',
          payment_terms: 'net_30',
        },
        outputVariable: 'quoteId',
      },
    },
    {
      id: 'update_opportunity', type: 'update_record', label: 'Update Opportunity',
      config: {
        objectName: 'opportunity', filter: { id: '{opportunityId}' },
        fields: { stage: 'proposal', last_activity_date: '{TODAY()}' },
      },
    },
    {
      id: 'notify_owner', type: 'script', label: 'Send Notification',
      config: {
        actionType: 'email', template: 'quote_created',
        recipients: ['{$User.Email}'],
        variables: { quoteName: '{quoteName}', quoteId: '{quoteId}' },
      },
    },
    { id: 'end', type: 'end', label: 'End' },
  ],

  edges: [
    { id: 'e1', source: 'start', target: 'screen_1', type: 'default' },
    { id: 'e2', source: 'screen_1', target: 'get_opportunity', type: 'default' },
    { id: 'e3', source: 'get_opportunity', target: 'create_quote', type: 'default' },
    { id: 'e4', source: 'create_quote', target: 'update_opportunity', type: 'default' },
    { id: 'e5', source: 'update_opportunity', target: 'notify_owner', type: 'default' },
    { id: 'e6', source: 'notify_owner', target: 'end', type: 'default' },
  ],
};
