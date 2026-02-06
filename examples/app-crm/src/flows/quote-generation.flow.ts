import type { Flow } from '@objectstack/spec/automation';

export const QuoteGenerationFlow: Flow = {
  name: 'quote_generation',
  label: 'Generate Quote from Opportunity',
  description: 'Create a quote based on opportunity details',
  type: 'screen',
  triggerType: 'manual',
  objectName: 'opportunity',
  
  variables: [
    { name: 'opportunityId', type: 'text', required: true },
    { name: 'quoteName', type: 'text' },
    { name: 'expirationDays', type: 'number', defaultValue: 30 },
    { name: 'discount', type: 'percent', defaultValue: 0 },
  ],
  
  steps: [
    {
      id: 'screen_1',
      type: 'screen',
      label: 'Quote Details',
      fields: [
        { name: 'quoteName', label: 'Quote Name', type: 'text', required: true },
        { name: 'expirationDays', label: 'Valid For (Days)', type: 'number', required: true, defaultValue: 30 },
        { name: 'discount', label: 'Discount %', type: 'percent', defaultValue: 0 },
      ],
    },
    {
      id: 'get_opportunity',
      type: 'record_lookup',
      label: 'Get Opportunity',
      objectName: 'opportunity',
      filter: { id: '{opportunityId}' },
      outputVariable: 'oppRecord',
    },
    {
      id: 'create_quote',
      type: 'record_create',
      label: 'Create Quote',
      objectName: 'quote',
      fields: {
        name: '{quoteName}',
        opportunity: '{opportunityId}',
        account: '{oppRecord.account}',
        contact: '{oppRecord.contact}',
        owner: '{$User.Id}',
        status: 'draft',
        quote_date: '{TODAY()}',
        expiration_date: '{TODAY() + expirationDays}',
        subtotal: '{oppRecord.amount}',
        discount: '{discount}',
        discount_amount: '{oppRecord.amount * (discount / 100)}',
        total_price: '{oppRecord.amount * (1 - discount / 100)}',
        payment_terms: 'net_30',
      },
      outputVariable: 'quoteId',
    },
    {
      id: 'update_opportunity',
      type: 'record_update',
      label: 'Update Opportunity',
      recordId: '{opportunityId}',
      objectName: 'opportunity',
      fields: { stage: 'proposal', last_activity_date: '{TODAY()}' },
    },
    {
      id: 'notify_owner',
      type: 'email_alert',
      label: 'Send Notification',
      template: 'quote_created',
      recipients: ['{$User.Email}'],
      variables: { quoteName: '{quoteName}', quoteId: '{quoteId}' },
    },
  ],
};
