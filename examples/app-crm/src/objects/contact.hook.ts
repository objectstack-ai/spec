// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';

/**
 * Contact integrity hook.
 *
 * - On insert/update, dedupes by `email` within the same `account`.
 * - On email/phone change, propagates the new value to opportunities where this
 *   contact is the `primary_contact` (best-effort rollup).
 * - On delete, refuses if the contact is referenced by an active opportunity,
 *   open quote or active contract.
 */

type ApiShape = {
  object: (n: string) => {
    count: (q: { filter: Record<string, unknown> }) => Promise<number>;
    findOne: (q: { filter: Record<string, unknown> }) => Promise<Record<string, unknown> | null>;
    updateMany: (q: { filter: Record<string, unknown>; doc: Record<string, unknown> }) => Promise<unknown>;
  };
};

const contactHook: Hook = {
  name: 'contact_integrity',
  object: 'contact',
  events: ['beforeInsert', 'beforeUpdate', 'afterUpdate', 'beforeDelete'],
  priority: 200,
  description:
    'Dedupe contacts per account, propagate contact info to linked opportunities, and protect referenced contacts from deletion.',
  handler: async (ctx: HookContext) => {
    const { event, input } = ctx;
    const api = ctx.api as ApiShape | undefined;

    if ((event === 'beforeInsert' || event === 'beforeUpdate') && api) {
      const email = typeof input.email === 'string' ? input.email.toLowerCase() : '';
      const account = typeof input.account === 'string' ? input.account : ctx.previous?.account;
      if (email && account) {
        input.email = email;
        const dup = await api.object('contact').findOne({
          filter: { email, account },
        });
        const dupId = (dup as { id?: string } | null)?.id;
        const selfId = ctx.previous?.id ?? input.id;
        if (dup && dupId !== selfId) {
          throw new Error(
            `Another contact (${dupId}) with email ${email} already exists in this account.`,
          );
        }
      }
    }

    if (event === 'afterUpdate' && api) {
      const previous = ctx.previous;
      const id = previous?.id ?? input.id;
      if (!id) return;
      const patch: Record<string, unknown> = {};
      if (typeof input.email === 'string' && input.email !== previous?.email) {
        patch.contact_email = input.email;
      }
      if (typeof input.phone === 'string' && input.phone !== previous?.phone) {
        patch.contact_phone = input.phone;
      }
      if (Object.keys(patch).length === 0) return;
      try {
        await api.object('opportunity').updateMany({
          filter: { primary_contact: id },
          doc: patch,
        });
      } catch (err) {
        console.warn('[contact_integrity] propagate to opportunity failed:', err);
      }
    }

    if (event === 'beforeDelete' && api) {
      const id = ctx.previous?.id;
      if (!id) return;
      const [openOpps, openQuotes, activeContracts] = await Promise.all([
        api.object('opportunity').count({
          filter: { primary_contact: id, stage: { $nin: ['closed_won', 'closed_lost'] } },
        }),
        api.object('quote').count({
          filter: { contact: id, status: { $nin: ['rejected', 'expired'] } },
        }),
        api.object('contract').count({
          filter: { contact: id, status: 'activated' },
        }),
      ]);
      const total = openOpps + openQuotes + activeContracts;
      if (total > 0) {
        throw new Error(
          `Cannot delete contact: still referenced by ${openOpps} open opportunity(ies), ${openQuotes} active quote(s), ${activeContracts} active contract(s). Reassign first.`,
        );
      }
    }
  },
};

export default contactHook;
