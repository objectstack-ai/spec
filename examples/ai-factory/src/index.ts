/**
 * @objectstack/ai-factory
 * 
 * Autonomous agent system for building enterprise software with ObjectStack.
 * 
 * This package provides a complete AI-powered software factory that can:
 * - Analyze natural language requirements
 * - Design data models and UI
 * - Generate production-ready code
 * - Create comprehensive tests
 * - Deploy to production automatically
 * 
 * @example
 * ```typescript
 * import { AIFactory } from '@objectstack/ai-factory';
 * 
 * const factory = new AIFactory({
 *   openaiKey: process.env.OPENAI_API_KEY,
 * });
 * 
 * const result = await factory.generateApp({
 *   requirement: 'Build a CRM with accounts and contacts',
 *   includeTests: true,
 *   autoDeploy: true,
 * });
 * 
 * console.log('Generated:', result.files);
 * console.log('Preview:', result.deploymentUrl);
 * ```
 * 
 * @packageDocumentation
 */

// Agent Definitions
export { OrchestratorAgent } from './agents/orchestrator.agent';
export { DataArchitectAgent } from './agents/data-architect.agent';

// Orchestration Workflows
export { CRMGenerationOrchestration } from './orchestration/crm-generation.orchestration';

// Re-export types from @objectstack/spec
export type {
  Agent,
  AITool,
  AIOrchestration,
  AITask,
  AIOrchestrationExecutionResult,
} from '@objectstack/spec';
