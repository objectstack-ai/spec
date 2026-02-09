// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { QA } from '@objectstack/spec';
import { TestExecutionAdapter } from './adapter.js';

export interface TestResult {
  scenarioId: string;
  passed: boolean;
  steps: StepResult[];
  error?: unknown;
  duration: number;
}

export interface StepResult {
  stepName: string;
  passed: boolean;
  error?: unknown;
  output?: unknown;
  duration: number;
}

export class TestRunner {
  constructor(private adapter: TestExecutionAdapter) {}

  async runSuite(suite: QA.TestSuite): Promise<TestResult[]> {
    const results: TestResult[] = [];
    for (const scenario of suite.scenarios) {
      results.push(await this.runScenario(scenario));
    }
    return results;
  }

  async runScenario(scenario: QA.TestScenario): Promise<TestResult> {
    const startTime = Date.now();
    const context: Record<string, unknown> = {}; // Variable context
    
    // Initialize context from initial payload if needed? Currently schema doesn't have initial context prop on Scenario
    // But we defined TestContextSchema separately.
    
    // Setup
    if (scenario.setup) {
      for (const step of scenario.setup) {
        try {
          await this.runStep(step, context);
        } catch (e) {
           return {
             scenarioId: scenario.id,
             passed: false,
             steps: [],
             error: `Setup failed: ${e instanceof Error ? e.message : String(e)}`,
             duration: Date.now() - startTime
           };
        }
      }
    }

    const stepResults: StepResult[] = [];
    let scenarioPassed = true;
    let scenarioError: unknown = undefined;

    // Main Steps
    for (const step of scenario.steps) {
      const stepStartTime = Date.now();
      try {
        const output = await this.runStep(step, context);
        stepResults.push({
          stepName: step.name,
          passed: true,
          output,
          duration: Date.now() - stepStartTime
        });
      } catch (e) {
        scenarioPassed = false;
        scenarioError = e;
        stepResults.push({
          stepName: step.name,
          passed: false,
          error: e,
          duration: Date.now() - stepStartTime
        });
        break; // Stop on first failure
      }
    }

    // Teardown (run even if failed)
    if (scenario.teardown) {
      for (const step of scenario.teardown) {
        try {
          await this.runStep(step, context);
        } catch (e) {
          // Log teardown failure but don't override main failure if it exists
          if (scenarioPassed) {
             scenarioPassed = false;
             scenarioError = `Teardown failed: ${e instanceof Error ? e.message : String(e)}`;
          }
        }
      }
    }

    return {
      scenarioId: scenario.id,
      passed: scenarioPassed,
      steps: stepResults,
      error: scenarioError,
      duration: Date.now() - startTime
    };
  }

  private async runStep(step: QA.TestStep, context: Record<string, unknown>): Promise<unknown> {
    // 1. Resolve Variables with Context (Simple interpolation or just pass context?)
    // For now, assume adpater handles context resolution or we do basic replacement
    const resolvedAction = this.resolveVariables(step.action, context);

    // 2. Execute Action
    const result = await this.adapter.execute(resolvedAction, context);

    // 3. Capture Outputs
    if (step.capture) {
      for (const [varName, path] of Object.entries(step.capture)) {
        context[varName] = this.getValueByPath(result, path);
      }
    }

    // 4. Run Assertions
    if (step.assertions) {
      for (const assertion of step.assertions) {
        this.assert(result, assertion, context);
      }
    }

    return result;
  }

  private resolveVariables(action: QA.TestAction, context: Record<string, unknown>): QA.TestAction {
    const actionStr = JSON.stringify(action);
    const resolved = actionStr.replace(/\{\{([^}]+)\}\}/g, (_match, varPath: string) => {
      const value = this.getValueByPath(context, varPath.trim());
      if (value === undefined) return _match; // Keep unresolved
      return typeof value === 'string' ? value : JSON.stringify(value);
    });
    try {
      return JSON.parse(resolved) as QA.TestAction;
    } catch {
      return action; // Fallback to original if parse fails
    }
  }

  private getValueByPath(obj: unknown, path: string): unknown {
    if (!path) return obj;
    const parts = path.split('.');
    let current: any = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }
    return current;
  }

  private assert(result: unknown, assertion: QA.TestAssertion, _context: Record<string, unknown>) {
    const actual = this.getValueByPath(result, assertion.field);
    // Resolve expected value if it's a variable ref? 
    const expected = assertion.expectedValue; // Simplify for now

    switch (assertion.operator) {
      case 'equals':
        if (actual !== expected) throw new Error(`Assertion failed: ${assertion.field} expected ${expected}, got ${actual}`);
        break;
      case 'not_equals':
        if (actual === expected) throw new Error(`Assertion failed: ${assertion.field} expected not ${expected}, got ${actual}`);
        break;
      case 'contains':
         if (Array.isArray(actual)) {
             if (!actual.includes(expected)) throw new Error(`Assertion failed: ${assertion.field} array does not contain ${expected}`);
         } else if (typeof actual === 'string') {
             if (!actual.includes(String(expected))) throw new Error(`Assertion failed: ${assertion.field} string does not contain ${expected}`);
         }
         break;
      case 'not_null':
        if (actual === null || actual === undefined) throw new Error(`Assertion failed: ${assertion.field} is null`);
        break;
      case 'is_null':
         if (actual !== null && actual !== undefined) throw new Error(`Assertion failed: ${assertion.field} is not null`);
         break;
      // ... Add other operators
      default:
        throw new Error(`Unknown assertion operator: ${assertion.operator}`);
    }
  }
}
