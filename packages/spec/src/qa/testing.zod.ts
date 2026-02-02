import { z } from 'zod';

// --- Building Blocks ---

export const TestContextSchema = z.record(z.string(), z.unknown()).describe('Initial context or variables for the test');

// Action Types
export const TestActionTypeSchema = z.enum([
  'create_record',
  'update_record',
  'delete_record',
  'read_record',
  'query_records',
  'api_call',
  'run_script',
  'wait' // Testing async processes
]);

export const TestActionSchema = z.object({
  type: TestActionTypeSchema,
  target: z.string().describe('Target Object, API Endpoint, or Function Name'),
  payload: z.record(z.string(), z.unknown()).optional().describe('Data to send or use'),
  user: z.string().optional().describe('Run as specific user/role') // Impersonation
});

// Assertion Types
export const TestAssertionTypeSchema = z.enum([
  'equals',
  'not_equals',
  'contains',
  'not_contains',
  'is_null',
  'not_null',
  'gt',
  'gte',
  'lt',
  'lte',
  'error' // Expecting an error
]);

export const TestAssertionSchema = z.object({
  field: z.string().describe('Field path in the result to check (e.g. "body.data.0.status")'),
  operator: TestAssertionTypeSchema,
  expectedValue: z.unknown()
});

// --- Test Structure ---

export const TestStepSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  action: TestActionSchema,
  assertions: z.array(TestAssertionSchema).optional(),
  // Capture outputs to variables for subsequent steps
  capture: z.record(z.string(), z.string()).optional().describe('Map result fields to context variables: { "newId": "body._id" }')
});

export const TestScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(), // e.g. "critical", "regression", "crm"
  
  setup: z.array(TestStepSchema).optional().describe('Steps to run before main test'),
  steps: z.array(TestStepSchema).describe('Main test sequence'),
  teardown: z.array(TestStepSchema).optional().describe('Steps to cleanup'),
  
  // Environment requirements
  requires: z.object({
    params: z.array(z.string()).optional(), // Required env vars or params
    plugins: z.array(z.string()).optional()
  }).optional()
});

export const TestSuiteSchema = z.object({
  name: z.string(),
  scenarios: z.array(TestScenarioSchema)
});

export type TestScenario = z.infer<typeof TestScenarioSchema>;
export type TestStep = z.infer<typeof TestStepSchema>;
export type TestAction = z.infer<typeof TestActionSchema>;
export type TestAssertion = z.infer<typeof TestAssertionSchema>;
