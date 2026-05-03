// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';

/**
 * Contract lifecycle hook.
 *
 * - Validates `end_date` ≈ `start_date + contract_term_months`.
 * - Rejects shrinking `end_date` after activation.
 * - On `activated`: stamps `signed_date` (if missing), promotes the account to `customer`,
 *   and schedules a renewal task 60 days before `end_date`.
 */

type ApiShape = {
  object: (n: string) => {
    findOne: (q: { filter: Record<string, unknown> }) => Promise<Record<string, unknown> | null>;
    update: (id: string, doc: Record<string, unknown>) => Promise<unknown>;
    insert: (doc: Record<string, unknown>) => Promise<unknown>;
  };
};

function monthsBetween(startISO: string, endISO: string): number {
  const s = new Date(startISO);
  const e = new Date(endISO);
  return (
    (e.getFullYear() - s.getFullYear()) * 12 +
    (e.getMonth() - s.getMonth()) +
    (e.getDate() >= s.getDate() ? 0 : -1)
  );
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const contractValidation: Hook = {
  name: 'contract_validation',
  object: 'contract',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 200,
  description: 'Enforce contract term math and prevent shrinking end_date once activated.',
  handler: async (ctx: HookContext) => {
    const { event, input } = ctx;
    const previous = ctx.previous;

    const startDate =
      (typeof input.start_date === 'string' && input.start_date) ||
      (typeof previous?.start_date === 'string' && previous.start_date) ||
      undefined;
    const endDate =
      (typeof input.end_date === 'string' && input.end_date) ||
      (typeof previous?.end_date === 'string' && previous.end_date) ||
      undefined;
    const term =
      (typeof input.contract_term_months === 'number' && input.contract_term_months) ||
      (typeof previous?.contract_term_months === 'number' &&
        (previous.contract_term_months as number)) ||
      undefined;

    if (startDate && endDate && term) {
      const calc = monthsBetween(startDate, endDate);
      if (Math.abs(calc - term) > 1) {
        throw new Error(
          `Contract term (${term} months) does not match date range (${calc} months from ${startDate} to ${endDate}).`,
        );
      }
    }

    if (event === 'beforeUpdate' && previous?.status === 'activated') {
      if (
        typeof input.end_date === 'string' &&
        typeof previous.end_date === 'string' &&
        input.end_date < previous.end_date
      ) {
        throw new Error(
          `Cannot shrink end_date (${previous.end_date as string} → ${input.end_date}) after activation. Use a termination/amendment workflow instead.`,
        );
      }
    }
  },
};

const contractActivation: Hook = {
  name: 'contract_on_activation',
  object: 'contract',
  events: ['afterUpdate'],
  priority: 800,
  async: true,
  onError: 'log',
  description: 'On activation: stamp signed_date, promote account, schedule renewal task.',
  handler: async (ctx: HookContext) => {
    const { input } = ctx;
    const previous = ctx.previous;
    if (input.status !== 'activated' || previous?.status === 'activated') return;
    const api = ctx.api as ApiShape | undefined;
    if (!api) return;

    const id =
      (typeof input.id === 'string' && input.id) ||
      (typeof previous?.id === 'string' ? (previous.id as string) : undefined);
    const accountId =
      (typeof input.account === 'string' && input.account) ||
      (typeof previous?.account === 'string' && previous.account) ||
      undefined;
    const endDate =
      (typeof input.end_date === 'string' && input.end_date) ||
      (typeof previous?.end_date === 'string' && (previous.end_date as string)) ||
      undefined;

    if (id && !input.signed_date && !previous?.signed_date) {
      await api.object('contract').update(id, { signed_date: new Date().toISOString().slice(0, 10) });
    }

    if (accountId) {
      const account = await api.object('account').findOne({ filter: { id: accountId } });
      if (account && account.type !== 'customer') {
        await api.object('account').update(accountId, { type: 'customer' });
      }
    }

    if (endDate) {
      const renewalDue = addDays(endDate, -60);
      await api.object('task').insert({
        subject: `Renewal review for contract ${id ?? ''}`.trim(),
        status: 'not_started',
        priority: 'high',
        type: 'follow_up',
        due_date: renewalDue,
        owner:
          (typeof input.owner === 'string' && input.owner) ||
          (typeof previous?.owner === 'string' && previous.owner) ||
          ctx.user?.id,
        related_to_type: 'account',
        related_to_account: accountId,
      });
    }
  },
};

export default [contractValidation, contractActivation];
