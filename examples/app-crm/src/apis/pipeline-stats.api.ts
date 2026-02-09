// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ApiEndpoint } from '@objectstack/spec/api';

/** GET /api/v1/crm/stats/pipeline */
export const PipelineStatsApi = ApiEndpoint.create({
  name: 'get_pipeline_stats',
  path: '/api/v1/crm/stats/pipeline',
  method: 'GET',
  summary: 'Get Pipeline Statistics',
  description: 'Returns the total value of open opportunities grouped by stage',
  type: 'script',
  target: 'server/scripts/pipeline_stats.ts',
  authRequired: true,
  cacheTtl: 300,
});
