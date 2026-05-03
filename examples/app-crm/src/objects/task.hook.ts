// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';

/**
 * Task lifecycle hook.
 *
 * - On `completed` transition, stamps `completed_date` and `progress_percent=100`.
 * - Warns when `reminder_date` is after `due_date`.
 * - Bubbles `last_activity_date` to the polymorphic parent (account/opportunity/lead).
 */

type ApiShape = {
  object: (n: string) => {
    update: (id: string, doc: Record<string, unknown>) => Promise<unknown>;
  };
};

const taskValidation: Hook = {
  name: 'task_completion',
  object: 'task',
  events: ['beforeUpdate'],
  priority: 200,
  description: 'Stamp completed_date/progress on completion and validate reminder timing.',
  handler: async (ctx: HookContext) => {
    const { input } = ctx;
    const previous = ctx.previous;

    if (input.status === 'completed' && previous?.status !== 'completed') {
      if (!input.completed_date) input.completed_date = new Date().toISOString();
      if (typeof input.progress_percent !== 'number') input.progress_percent = 100;
      input.is_completed = true;
    }

    const reminder =
      (typeof input.reminder_date === 'string' && input.reminder_date) ||
      (typeof previous?.reminder_date === 'string' && (previous.reminder_date as string)) ||
      undefined;
    const due =
      (typeof input.due_date === 'string' && input.due_date) ||
      (typeof previous?.due_date === 'string' && (previous.due_date as string)) ||
      undefined;
    if (reminder && due && reminder.slice(0, 10) > due) {
      throw new Error(
        `Reminder (${reminder}) is after the due date (${due}); reminders should fire before the deadline.`,
      );
    }
  },
};

const taskBubble: Hook = {
  name: 'task_activity_bubble',
  object: 'task',
  events: ['afterUpdate'],
  priority: 800,
  async: true,
  onError: 'log',
  description: 'Bubble last_activity_date to the polymorphic parent record.',
  handler: async (ctx: HookContext) => {
    const { input } = ctx;
    const previous = ctx.previous;
    const api = ctx.api as ApiShape | undefined;
    if (!api) return;

    const today = new Date().toISOString().slice(0, 10);
    const targetType =
      (typeof input.related_to_type === 'string' && input.related_to_type) ||
      (typeof previous?.related_to_type === 'string' && (previous.related_to_type as string)) ||
      undefined;
    if (!targetType) return;

    const fieldByType: Record<string, string> = {
      account: 'related_to_account',
      contact: 'related_to_contact',
      opportunity: 'related_to_opportunity',
      lead: 'related_to_lead',
      case: 'related_to_case',
    };
    const refField = fieldByType[targetType];
    if (!refField) return;
    const targetId =
      (typeof input[refField] === 'string' && (input[refField] as string)) ||
      (typeof previous?.[refField] === 'string' && (previous[refField] as string)) ||
      undefined;
    if (!targetId) return;

    // Only bubble to objects that have a `last_activity_date` field (account/lead).
    if (targetType !== 'account' && targetType !== 'lead') return;
    try {
      await api.object(targetType).update(targetId, { last_activity_date: today });
    } catch (err) {
      console.warn('[task_activity_bubble] update failed:', err);
    }
  },
};

export default [taskValidation, taskBubble];
