import { z } from 'zod';
import { StateMachineSchema } from '../automation/state-machine.zod';

/**
 * AI Model Configuration
 */
export const AIModelConfigSchema = z.object({
  provider: z.enum(['openai', 'azure_openai', 'anthropic', 'local']).default('openai'),
  model: z.string().describe('Model name (e.g. gpt-4, claude-3-opus)'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().optional(),
  topP: z.number().optional(),
});

/**
 * AI Tool Definition
 * References to Actions, Flows, or Objects available to the Agent.
 */
export const AIToolSchema = z.object({
  type: z.enum(['action', 'flow', 'query', 'vector_search']),
  name: z.string().describe('Reference name (Action Name, Flow Name)'),
  description: z.string().optional().describe('Override description for the LLM'),
});

/**
 * AI Knowledge Base
 * RAG configuration.
 */
export const AIKnowledgeSchema = z.object({
  topics: z.array(z.string()).describe('Topics/Tags to recruit knowledge from'),
  indexes: z.array(z.string()).describe('Vector Store Indexes'),
});

/**
 * AI Agent Schema
 * Definition of an autonomous agent specialized for a domain.
 * 
 * @example Customer Support Agent
 * {
 *   name: "support_tier_1",
 *   label: "First Line Support",
 *   role: "Help Desk Assistant",
 *   instructions: "You are a helpful assistant. Always verify user identity first.",
 *   model: {
 *     provider: "openai",
 *     model: "gpt-4-turbo",
 *     temperature: 0.3
 *   },
 *   tools: [
 *     { type: "flow", name: "reset_password", description: "Trigger password reset email" },
 *     { type: "query", name: "get_order_status", description: "Check order shipping status" }
 *   ],
 *   knowledge: {
 *     topics: ["faq", "policies"],
 *     indexes: ["support_docs"]
 *   }
 * }
 */
export const AgentSchema = z.object({
  /** Identity */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Agent unique identifier'),
  label: z.string().describe('Agent display name'),
  avatar: z.string().optional(),
  role: z.string().describe('The persona/role (e.g. "Senior Support Engineer")'),
  
  /** Cognition */
  instructions: z.string().describe('System Prompt / Prime Directives'),
  model: AIModelConfigSchema.optional(),
  lifecycle: StateMachineSchema.optional().describe('State machine defining the agent conversation follow and constraints'),
  
  /** Capabilities */
  tools: z.array(AIToolSchema).optional().describe('Available tools'),
  knowledge: AIKnowledgeSchema.optional().describe('RAG access'),
  
  /** Interface */
  active: z.boolean().default(true),
  access: z.array(z.string()).optional().describe('Who can chat with this agent'),

  /** Multi-tenancy & Visibility */
  tenantId: z.string().optional().describe('Tenant/Organization ID'),
  visibility: z.enum(['global', 'organization', 'private']).default('organization'),
});

export type Agent = z.infer<typeof AgentSchema>;
export type AITool = z.infer<typeof AIToolSchema>;
