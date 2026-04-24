// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import * as QA from '@objectstack/spec/qa';

/**
 * Interface for executing test actions against a target system.
 * The target could be a local Kernel instance or a remote API.
 */
export interface TestExecutionAdapter {
  /**
   * Execute a single test action.
   * @param action The action to perform (create_record, api_call, etc.)
   * @returns The result of the action (e.g. created record, API response)
   */
  execute(action: QA.TestAction, context: Record<string, unknown>): Promise<unknown>;
}
