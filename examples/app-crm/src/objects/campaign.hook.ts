// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';

/**
 * Campaign lifecycle hook.
 *
 * - Validates start/end date ordering and prevents `in_progress` without dates.
 * - On `completed`: snapshots the lead/opportunity counts attributed to the campaign
 *   into the campaign's metric fields.
 */

type ApiShape = {
  object: (n: string) => {
    count: (q: { filter: Record<string, unknown> }) => Promise<number>;
    update: (id: string, doc: Record<string, unknown>) => Promise<unknown>;
  };
};

const campaignValidation: Hook = {
  name: 'campaign_validation',
  object: 'campaign',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 200,
  description: 'Validate campaign date range and required fields per status.',
  handler: async (ctx: HookContext) => {
    const { input } = ctx;
    const previous = ctx.previous;
    const start =
      (typeof input.start_date === 'string' && input.start_date) ||
      (typeof previous?.start_date === 'string' && (previous.start_date as string)) ||
      undefined;
    const end =
      (typeof input.end_date === 'string' && input.end_date) ||
      (typeof previous?.end_date === 'string' && (previous.end_date as string)) ||
      undefined;
    if (start && end && start > end) {
      throw new Error(`Campaign start_date (${start}) must not be after end_date (${end}).`);
    }
    const status =
      (typeof input.status === 'string' && input.status) ||
      (typeof previous?.status === 'string' && (previous.status as string)) ||
      undefined;
    if (status === 'in_progress' && (!start || !end)) {
      throw new Error('Campaign cannot move to in_progress without both start_date and end_date.');
    }
  },
};

const campaignCompleted: Hook = {
  name: 'campaign_snapshot_metrics',
  object: 'campaign',
  events: ['afterUpdate'],
  priority: 800,
  async: true,
  onError: 'log',
  description: 'On completion, snapshot attributed lead/opportunity counts.',
  handler: async (ctx: HookContext) => {
    const { input } = ctx;
    const previous = ctx.previous;
    if (input.status !== 'completed' || previous?.status === 'completed') return;
    const api = ctx.api as ApiShape | undefined;
    if (!api) return;
    const id =
      (typeof input.id === 'string' && input.id) ||
      (typeof previous?.id === 'string' ? (previous.id as string) : undefined);
    if (!id) return;

    const [leads, convertedLeads, opportunities, wonOpps] = await Promise.all([
      api.object('lead').count({ filter: { campaign: id } }),
      api.object('lead').count({ filter: { campaign: id, is_converted: true } }),
      api.object('opportunity').count({ filter: { campaign: id } }),
      api.object('opportunity').count({ filter: { campaign: id, stage: 'closed_won' } }),
    ]);

    await api.object('campaign').update(id, {
      num_leads: leads,
      num_converted_leads: convertedLeads,
      num_opportunities: opportunities,
      num_won_opportunities: wonOpps,
    });
  },
};

export default [campaignValidation, campaignCompleted];
