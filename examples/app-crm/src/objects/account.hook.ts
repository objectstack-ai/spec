// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';

/**
 * Account protection hook.
 *
 * - Normalizes `account_number` (uppercase) on insert.
 * - Validates `website` format and `annual_revenue` non-negative.
 * - Refuses to delete a `customer` account that still has open opportunities.
 */
const accountHook: Hook = {
  name: 'account_protection',
  object: 'account',
  events: ['beforeInsert', 'beforeUpdate', 'beforeDelete'],
  priority: 200,
  description:
    'Validate account fields and protect customer accounts with open opportunities from deletion.',
  handler: async (ctx: HookContext) => {
    const { event, input } = ctx;

    if (event === 'beforeInsert' || event === 'beforeUpdate') {
      if (typeof input.website === 'string' && input.website.length > 0) {
        if (!/^https?:\/\//i.test(input.website)) {
          throw new Error('Website must start with http:// or https://');
        }
      }
      if (typeof input.annual_revenue === 'number' && input.annual_revenue < 0) {
        throw new Error('Annual Revenue must be greater than or equal to 0');
      }
    }

    if (event === 'beforeInsert') {
      if (typeof input.account_number === 'string') {
        input.account_number = input.account_number.toUpperCase();
      }
    }

    if (event === 'beforeDelete') {
      const previous = ctx.previous;
      if (!previous || previous.type !== 'customer') return;
      const api = ctx.api as
        | {
            object: (n: string) => {
              count: (q: { filter: Record<string, unknown> }) => Promise<number>;
            };
          }
        | undefined;
      if (!api) return;
      const openOpps = await api.object('opportunity').count({
        filter: {
          account: previous.id,
          stage: { $nin: ['closed_won', 'closed_lost'] },
        },
      });
      if (openOpps > 0) {
        throw new Error(
          `Cannot delete customer account: ${openOpps} open opportunit${openOpps === 1 ? 'y' : 'ies'} still reference it. Close or reassign them first.`,
        );
      }
    }
  },
};

export default accountHook;
