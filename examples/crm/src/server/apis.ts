import { ApiEndpoint } from '@objectstack/spec/api';

/**
 * Custom API: Close Won Opportunities
 * A business-specific endpoint that encapsulates complex logic.
 * Path: GET /api/v1/crm/stats/pipeline
 */
export const PipelineStatsApi = ApiEndpoint.create({
  name: 'get_pipeline_stats',
  path: '/api/v1/crm/stats/pipeline',
  method: 'GET',
  summary: 'Get Pipeline Statistics',
  description: 'Returns the total value of open opportunities grouped by stage',
  
  type: 'script',
  target: 'server/scripts/pipeline_stats.ts', // Hypothetical script path
  
  authRequired: true,
  cacheTtl: 300, // Cache for 5 minutes
});

/**
 * Custom API: Quick Lead Conversion (RPC Style)
 * Path: POST /api/v1/crm/leads/convert
 */
export const LeadConvertApi = ApiEndpoint.create({
  name: 'lead_convert',
  path: '/api/v1/crm/leads/convert',
  method: 'POST',
  summary: 'Convert Lead to Account/Contact',
  
  type: 'flow',
  target: 'flow_lead_conversion_v2',
  
  inputMapping: [
    { source: 'body.leadId', target: 'leadRecordId' },
    { source: 'body.ownerId', target: 'newOwnerId' }
  ]
});
