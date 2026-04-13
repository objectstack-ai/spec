// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Flow } from '@objectstack/spec/automation';

/**
 * Flow Definitions Barrel
 */
export {
  TaskReminderFlow,
  OverdueEscalationFlow,
  TaskCompletionFlow,
  QuickAddTaskFlow,
} from './task.flow';

import {
  TaskReminderFlow,
  OverdueEscalationFlow,
  TaskCompletionFlow,
  QuickAddTaskFlow,
} from './task.flow';

/** All flow definitions as a typed array for defineStack() */
export const allFlows: Flow[] = [
  TaskReminderFlow,
  OverdueEscalationFlow,
  TaskCompletionFlow,
  QuickAddTaskFlow,
];
