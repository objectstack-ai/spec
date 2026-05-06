// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';

/**
 * Opportunity lifecycle hook.
 *
 * - Re-derives `expected_revenue` from `amount * stageProbability` when either changes.
 * - Freezes most fields after stage is closed (won/lost) — only narrative fields editable.
 * - On `closed_won`: stamps `close_date=today`, promotes the parent account to `customer`,
 *   and asynchronously schedules an "Activate customer" task.
 */

type ApiShape = {
  object: (n: string) => {
    findOne: (q: { filter: Record<string, unknown> }) => Promise<Record<string, unknown> | null>;
    update: (id: string, doc: Record<string, unknown>) => Promise<unknown>;
    insert: (doc: Record<string, unknown>) => Promise<unknown>;
  };
};

const STAGE_PROBABILITY: Record<string, number> = {
  prospecting: 10,
  qualification: 25,
  needs_analysis: 40,
  proposal: 60,
  negotiation: 80,
  closed_won: 100,
  closed_lost: 0,
};

const NARRATIVE_FIELDS = new Set(['description', 'next_step', 'notes']);

const opportunityValidationHook: Hook = {
  name: 'opportunity_lifecycle',
  object: 'opportunity',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 200,
  description:
    'Recompute expected_revenue, freeze closed opportunities except narrative fields.',
  handler: async (ctx: HookContext) => {
    const { event, input } = ctx;
    const previous = ctx.previous;

    const STAGE_PROBABILITY: Record<string, number> = {
      prospecting: 10,
      qualification: 25,
      needs_analysis: 40,
      proposal: 60,
      negotiation: 80,
      closed_won: 100,
      closed_lost: 0,
    };
    const NARRATIVE_FIELDS = new Set(['description', 'next_step', 'notes']);

    // Recompute expected_revenue
    const amount =
      typeof input.amount === 'number'
        ? input.amount
        : typeof previous?.amount === 'number'
          ? (previous.amount as number)
          : undefined;
    const stage =
      typeof input.stage === 'string'
        ? input.stage
        : typeof previous?.stage === 'string'
          ? (previous.stage as string)
          : undefined;
    if (typeof amount === 'number' && stage && STAGE_PROBABILITY[stage] !== undefined) {
      input.expected_revenue = Math.round(amount * STAGE_PROBABILITY[stage]) / 100;
    }

    if (event === 'beforeUpdate' && previous) {
      const prevStage = previous.stage as string | undefined;
      const isClosed = prevStage === 'closed_won' || prevStage === 'closed_lost';
      if (isClosed) {
        const violating = Object.keys(input).filter(
          (k) => !NARRATIVE_FIELDS.has(k) && input[k] !== previous[k],
        );
        if (violating.length > 0) {
          throw new Error(
            `Opportunity is closed (${prevStage}); only ${[...NARRATIVE_FIELDS].join(', ')} may be edited. Attempted: ${violating.join(', ')}.`,
          );
        }
      }

      // Stamp close_date when transitioning into closed_won
      if (input.stage === 'closed_won' && prevStage !== 'closed_won' && !input.close_date) {
        input.close_date = new Date().toISOString().slice(0, 10);
      }
    }
  },
};

const opportunityWonHook: Hook = {
  name: 'opportunity_promote_account',
  object: 'opportunity',
  events: ['afterUpdate'],
  priority: 800,
  async: true,
  onError: 'log',
  description:
    'On closed_won: promote linked account to customer and create activation task.',
  handler: async (ctx: HookContext) => {
    const { input } = ctx;
    const previous = ctx.previous;
    const becameWon = input.stage === 'closed_won' && previous?.stage !== 'closed_won';
    if (!becameWon) return;
    const api = ctx.api as ApiShape | undefined;
    if (!api) return;

    const accountId =
      (typeof input.account === 'string' && input.account) ||
      (typeof previous?.account === 'string' && previous.account) ||
      undefined;
    if (!accountId) return;

    const account = await api.object('account').findOne({ filter: { id: accountId } });
    if (account && account.type !== 'customer') {
      await api.object('account').update(accountId, { type: 'customer' });
    }

    const oppId = (typeof input.id === 'string' && input.id) || previous?.id;
    const ownerId =
      (typeof input.owner === 'string' && input.owner) ||
      (typeof previous?.owner === 'string' && previous.owner) ||
      ctx.user?.id;
    const due = new Date();
    due.setDate(due.getDate() + 3);
    await api.object('task').insert({
      subject: `Activate new customer for opportunity ${oppId ?? ''}`.trim(),
      status: 'not_started',
      priority: 'high',
      type: 'follow_up',
      due_date: due.toISOString().slice(0, 10),
      owner: ownerId,
      related_to_type: 'opportunity',
      related_to_opportunity: oppId,
      related_to_account: accountId,
    });
  },
};

export default [opportunityValidationHook, opportunityWonHook];
