// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Agent } from '@objectstack/spec/ai';

/**
 * Agent Definitions Barrel
 */
export { EmailCampaignAgent } from './email-campaign.agent';
export { LeadEnrichmentAgent } from './lead-enrichment.agent';
export { RevenueIntelligenceAgent } from './revenue-intelligence.agent';
export { SalesAssistantAgent } from './sales.agent';
export { ServiceAgent } from './service.agent';

import { EmailCampaignAgent } from './email-campaign.agent';
import { LeadEnrichmentAgent } from './lead-enrichment.agent';
import { RevenueIntelligenceAgent } from './revenue-intelligence.agent';
import { SalesAssistantAgent } from './sales.agent';
import { ServiceAgent } from './service.agent';

/** All agent definitions as a typed array for defineStack() */
export const allAgents: Agent[] = [
  EmailCampaignAgent,
  LeadEnrichmentAgent,
  RevenueIntelligenceAgent,
  SalesAssistantAgent,
  ServiceAgent,
];
