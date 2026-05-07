// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Agent } from '@objectstack/spec/ai';

/**
 * Agent Definitions Barrel
 *
 * After the move to the Universal Assistant pattern, the CRM ships
 * two persona-level Agents (Sales Copilot, Service Copilot) that
 * compose capabilities via Skills. The previous task-specific agents
 * (email_campaign, lead_enrichment, revenue_intelligence,
 * sales_assistant, service_agent) have been refactored into Skills
 * under `../skills/`.
 */
export { SalesCopilotAgent } from './sales-copilot.agent';
export { ServiceCopilotAgent } from './service-copilot.agent';

import { SalesCopilotAgent } from './sales-copilot.agent';
import { ServiceCopilotAgent } from './service-copilot.agent';

export const allAgents: Agent[] = [
  SalesCopilotAgent,
  ServiceCopilotAgent,
];
