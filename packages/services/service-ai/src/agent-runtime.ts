// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type {
  ModelMessage,
  AIRequestOptions,
  AIToolDefinition,
  IMetadataService,
} from '@objectstack/spec/contracts';
import type { Agent, Skill } from '@objectstack/spec/ai';
import { AgentSchema } from '@objectstack/spec/ai';
import { SkillRegistry, type SkillContext } from './skill-registry.js';

/**
 * Context passed alongside a user message when chatting with an agent.
 *
 * UI clients set these fields to tell the agent which object, record,
 * or view the user is currently looking at so it can provide contextual
 * answers without additional tool calls.
 *
 * Extends {@link SkillContext} so the same context object can drive
 * skill activation in the {@link SkillRegistry}.
 */
export interface AgentChatContext extends SkillContext {
  /** Current object the user is viewing (e.g. "account") */
  objectName?: string;
  /** Currently selected record ID */
  recordId?: string;
  /** Current view name */
  viewName?: string;
}

/**
 * AgentRuntime — Resolves an agent definition into runnable chat parameters.
 *
 * Responsibilities:
 * 1. Load & validate agent metadata from the metadata service.
 * 2. Build the system prompt from agent `instructions` + UI context
 *    + active skill instructions.
 * 3. Derive {@link AIRequestOptions} from agent `model`, `tools`, and
 *    resolved skills.
 * 4. Map agent tool references to concrete {@link AIToolDefinition}s
 *    registered in the {@link ToolRegistry}.
 *
 * When constructed with a {@link SkillRegistry} the runtime supports
 * the Agent → Skill → Tool composition model. When the registry is
 * omitted (legacy / test mode) only the agent's inline `tools[]` are
 * used.
 */
export class AgentRuntime {
  constructor(
    private readonly metadataService: IMetadataService,
    private readonly skillRegistry?: SkillRegistry,
  ) {}

  // ── Public API ────────────────────────────────────────────────

  /**
   * List all active agents registered in the metadata service.
   *
   * Returns a summary for each agent (name, label, role) suitable
   * for populating an agent selector dropdown in the UI.
   */
  async listAgents(): Promise<Array<{ name: string; label: string; role: string }>> {
    const rawItems = await this.metadataService.list('agent');
    const agents: Array<{ name: string; label: string; role: string }> = [];

    for (const raw of rawItems) {
      const result = AgentSchema.safeParse(raw);
      if (result.success && result.data.active) {
        agents.push({
          name: result.data.name,
          label: result.data.label,
          role: result.data.role,
        });
      }
    }

    return agents;
  }

  /**
   * Load and validate an agent definition by name.
   *
   * The raw metadata is validated through {@link AgentSchema} to ensure
   * required fields (`instructions`, `name`, `role`, etc.) are present
   * and well-typed.  Returns `undefined` when the agent does not exist
   * or validation fails.
   */
  async loadAgent(agentName: string): Promise<Agent | undefined> {
    const raw = await this.metadataService.get('agent', agentName);
    if (!raw) return undefined;

    const result = AgentSchema.safeParse(raw);
    if (!result.success) {
      return undefined;
    }
    return result.data;
  }

  /**
   * Build the system message(s) that should be prepended to the
   * conversation when chatting with the given agent.
   *
   * The composed prompt has up to three sections:
   * 1. The agent's base `instructions` (its persona / prime directives).
   * 2. UI context hints from {@link AgentChatContext} (current object,
   *    record, view) so the agent can tailor responses without extra
   *    tool calls.
   * 3. An "Active Skills" block describing the capabilities currently
   *    available — only populated when `activeSkills` is provided.
   */
  buildSystemMessages(
    agent: Agent,
    context?: AgentChatContext,
    activeSkills?: readonly Skill[],
  ): ModelMessage[] {
    const parts: string[] = [];

    // Base instructions
    parts.push(agent.instructions);

    // Contextual hints from the user's current UI state
    if (context) {
      const ctx: string[] = [];
      if (context.appName) ctx.push(`Current app: ${context.appName}`);
      if (context.objectName) ctx.push(`Current object: ${context.objectName}`);
      if (context.recordId) ctx.push(`Selected record ID: ${context.recordId}`);
      if (context.viewName) ctx.push(`Current view: ${context.viewName}`);
      if (ctx.length > 0) {
        parts.push('\n--- Current Context ---\n' + ctx.join('\n'));
      }
    }

    // Active skill bundle
    if (activeSkills && activeSkills.length > 0 && this.skillRegistry) {
      const block = this.skillRegistry.composeInstructionsBlock(activeSkills);
      if (block) parts.push(block);
    }

    return [{ role: 'system' as const, content: parts.join('\n') }];
  }

  /**
   * Derive {@link AIRequestOptions} from an agent definition.
   *
   * Tool references declared in `agent.tools` are resolved by name against
   * `availableTools` (i.e. the full set of ToolRegistry definitions).
   * Tools belonging to `activeSkills` are also resolved and merged into
   * the final tool list (deduplicated by name).
   *
   * Any unresolved references (tools the agent or skill declares but
   * that are not registered) are silently skipped — this is intentional
   * so that agents/skills can be defined before all tools are available.
   *
   * @param agent          - The agent definition to derive options from
   * @param availableTools - All tool definitions currently registered in the ToolRegistry
   * @param activeSkills   - Skills resolved from agent.skills[] + context filtering
   * @returns Request options with model config and resolved tool definitions
   */
  buildRequestOptions(
    agent: Agent,
    availableTools: readonly AIToolDefinition[],
    activeSkills?: readonly Skill[],
  ): AIRequestOptions {
    const options: AIRequestOptions = {};

    // Model config
    if (agent.model) {
      options.model = agent.model.model;
      options.temperature = agent.model.temperature;
      options.maxTokens = agent.model.maxTokens;
    }

    // Resolve agent tool references → concrete tool definitions
    const toolMap = new Map(availableTools.map((t) => [t.name, t]));
    const seen = new Set<string>();
    const resolved: AIToolDefinition[] = [];

    if (agent.tools && agent.tools.length > 0) {
      for (const ref of agent.tools) {
        if (seen.has(ref.name)) continue;
        const def = toolMap.get(ref.name);
        if (def) {
          resolved.push(def);
          seen.add(ref.name);
        }
      }
    }

    // Merge skill tools (deduplicated)
    if (activeSkills && activeSkills.length > 0 && this.skillRegistry) {
      const skillTools = this.skillRegistry.flattenToTools(activeSkills, availableTools);
      for (const def of skillTools) {
        if (seen.has(def.name)) continue;
        resolved.push(def);
        seen.add(def.name);
      }
    }

    if (resolved.length > 0) {
      options.tools = resolved;
      options.toolChoice = 'auto';
    }

    return options;
  }

  // ── Skill resolution helpers ─────────────────────────────────

  /**
   * Resolve the set of skills active for a given agent in a given
   * context. Combines:
   *
   * 1. The agent's declared `skills[]` whitelist (if any).
   * 2. Filtering by `triggerConditions` against the runtime context.
   *
   * When the agent declares no skills, returns the empty list (i.e.
   * the agent only uses its inline `tools[]`).
   *
   * Returns an empty array if no SkillRegistry was provided to the
   * runtime (legacy mode).
   */
  async resolveActiveSkills(agent: Agent, context?: AgentChatContext): Promise<Skill[]> {
    if (!this.skillRegistry) return [];
    if (!agent.skills || agent.skills.length === 0) return [];
    return this.skillRegistry.listActiveSkills(context ?? {}, agent.skills);
  }

  /**
   * Pick a default agent for the given context, used by the ambient
   * chat endpoint when the client doesn't specify an `agentName`.
   *
   * Resolution order:
   * 1. The `defaultAgent` of the app named by `context.appName`.
   * 2. The first active agent in the registry (deterministic fallback).
   * 3. `undefined` if no agents are registered.
   */
  async resolveDefaultAgent(context?: AgentChatContext): Promise<Agent | undefined> {
    if (context?.appName) {
      const rawApp = await this.metadataService.get('app', context.appName).catch(() => undefined);
      const defaultAgentName = (rawApp as { defaultAgent?: string } | undefined)?.defaultAgent;
      if (defaultAgentName) {
        const agent = await this.loadAgent(defaultAgentName);
        if (agent && agent.active !== false) return agent;
      }
    }

    // Fallback: first active agent in declaration order.
    const summaries = await this.listAgents();
    if (summaries.length === 0) return undefined;
    return this.loadAgent(summaries[0].name);
  }
}
