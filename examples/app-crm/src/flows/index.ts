// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Flow } from '@objectstack/spec/automation';

/**
 * Flow Definitions Barrel
 */
export { CampaignEnrollmentFlow } from './campaign-enrollment.flow';
export { CaseEscalationFlow } from './case-escalation.flow';
export { LeadConversionFlow } from './lead-conversion.flow';
export { OpportunityApprovalFlow } from './opportunity-approval.flow';
export { QuoteGenerationFlow } from './quote-generation.flow';

import { CampaignEnrollmentFlow } from './campaign-enrollment.flow';
import { CaseEscalationFlow } from './case-escalation.flow';
import { LeadConversionFlow } from './lead-conversion.flow';
import { OpportunityApprovalFlow } from './opportunity-approval.flow';
import { QuoteGenerationFlow } from './quote-generation.flow';

/** All flow definitions as a typed array for defineStack() */
export const allFlows: Flow[] = [
  CampaignEnrollmentFlow,
  CaseEscalationFlow,
  LeadConversionFlow,
  OpportunityApprovalFlow,
  QuoteGenerationFlow,
];
