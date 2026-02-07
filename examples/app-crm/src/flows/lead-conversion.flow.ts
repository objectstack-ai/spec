import type { Automation } from '@objectstack/spec';
type Flow = Automation.Flow;

/** Lead Conversion — multi-step screen flow to convert qualified leads */
export const LeadConversionFlow: Flow = {
  name: 'lead_conversion',
  label: 'Lead Conversion Process',
  description: 'Automated flow to convert qualified leads to accounts, contacts, and opportunities',
  type: 'screen',

  variables: [
    { name: 'leadId', type: 'text', isInput: true, isOutput: false },
    { name: 'createOpportunity', type: 'boolean', isInput: true, isOutput: false },
    { name: 'opportunityName', type: 'text', isInput: true, isOutput: false },
    { name: 'opportunityAmount', type: 'text', isInput: true, isOutput: false },
  ],

  nodes: [
    { id: 'start', type: 'start', label: 'Start', config: { objectName: 'lead' } },
    {
      id: 'screen_1', type: 'screen', label: 'Conversion Details',
      config: {
        fields: [
          { name: 'createOpportunity', label: 'Create Opportunity?', type: 'boolean', required: true },
          { name: 'opportunityName', label: 'Opportunity Name', type: 'text', required: true, visibleWhen: '{createOpportunity} == true' },
          { name: 'opportunityAmount', label: 'Opportunity Amount', type: 'currency', visibleWhen: '{createOpportunity} == true' },
        ],
      },
    },
    {
      id: 'get_lead', type: 'get_record', label: 'Get Lead Record',
      config: { objectName: 'lead', filter: { id: '{leadId}' }, outputVariable: 'leadRecord' },
    },
    {
      id: 'create_account', type: 'create_record', label: 'Create Account',
      config: {
        objectName: 'account',
        fields: {
          name: '{leadRecord.company}', phone: '{leadRecord.phone}',
          website: '{leadRecord.website}', industry: '{leadRecord.industry}',
          annual_revenue: '{leadRecord.annual_revenue}',
          number_of_employees: '{leadRecord.number_of_employees}',
          billing_address: '{leadRecord.address}',
          owner: '{$User.Id}', is_active: true,
        },
        outputVariable: 'accountId',
      },
    },
    {
      id: 'create_contact', type: 'create_record', label: 'Create Contact',
      config: {
        objectName: 'contact',
        fields: {
          first_name: '{leadRecord.first_name}', last_name: '{leadRecord.last_name}',
          email: '{leadRecord.email}', phone: '{leadRecord.phone}',
          title: '{leadRecord.title}', account: '{accountId}',
          is_primary: true, owner: '{$User.Id}',
        },
        outputVariable: 'contactId',
      },
    },
    {
      id: 'decision_opportunity', type: 'decision', label: 'Create Opportunity?',
      config: { condition: '{createOpportunity} == true' },
    },
    {
      id: 'create_opportunity', type: 'create_record', label: 'Create Opportunity',
      config: {
        objectName: 'opportunity',
        fields: {
          name: '{opportunityName}', account: '{accountId}', contact: '{contactId}',
          amount: '{opportunityAmount}', stage: 'prospecting', probability: 10,
          lead_source: '{leadRecord.lead_source}', close_date: '{TODAY() + 90}', owner: '{$User.Id}',
        },
        outputVariable: 'opportunityId',
      },
    },
    {
      id: 'mark_converted', type: 'update_record', label: 'Mark Lead as Converted',
      config: {
        objectName: 'lead', filter: { id: '{leadId}' },
        fields: {
          is_converted: true, converted_date: '{NOW()}',
          converted_account: '{accountId}', converted_contact: '{contactId}',
          converted_opportunity: '{opportunityId}',
        },
      },
    },
    {
      id: 'send_notification', type: 'script', label: 'Send Confirmation Email',
      config: {
        actionType: 'email', template: 'lead_converted_notification',
        recipients: ['{$User.Email}'],
        variables: { leadName: '{leadRecord.full_name}', accountName: '{accountId.name}', contactName: '{contactId.full_name}' },
      },
    },
    { id: 'end', type: 'end', label: 'End' },
  ],

  edges: [
    { id: 'e1', source: 'start', target: 'screen_1', type: 'default' },
    { id: 'e2', source: 'screen_1', target: 'get_lead', type: 'default' },
    { id: 'e3', source: 'get_lead', target: 'create_account', type: 'default' },
    { id: 'e4', source: 'create_account', target: 'create_contact', type: 'default' },
    { id: 'e5', source: 'create_contact', target: 'decision_opportunity', type: 'default' },
    { id: 'e6', source: 'decision_opportunity', target: 'create_opportunity', type: 'default', condition: '{createOpportunity} == true', label: 'Yes' },
    { id: 'e7', source: 'decision_opportunity', target: 'mark_converted', type: 'default', condition: '{createOpportunity} != true', label: 'No' },
    { id: 'e8', source: 'create_opportunity', target: 'mark_converted', type: 'default' },
    { id: 'e9', source: 'mark_converted', target: 'send_notification', type: 'default' },
    { id: 'e10', source: 'send_notification', target: 'end', type: 'default' },
  ],
};
