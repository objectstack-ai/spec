import { ApiEndpoint } from '@objectstack/spec/api';

/** POST /api/v1/crm/leads/convert */
export const LeadConvertApi = ApiEndpoint.create({
  name: 'lead_convert',
  path: '/api/v1/crm/leads/convert',
  method: 'POST',
  summary: 'Convert Lead to Account/Contact',
  type: 'flow',
  target: 'flow_lead_conversion_v2',
  inputMapping: [
    { source: 'body.leadId', target: 'leadRecordId' },
    { source: 'body.ownerId', target: 'newOwnerId' },
  ],
});
