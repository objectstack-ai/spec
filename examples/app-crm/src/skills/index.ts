// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Skill } from '@objectstack/spec/ai';

export { LeadQualificationSkill } from './lead-qualification.skill';
export { EmailDraftingSkill } from './email-drafting.skill';
export { RevenueForecastingSkill } from './revenue-forecasting.skill';
export { CaseTriageSkill } from './case-triage.skill';
export { Customer360Skill } from './customer-360.skill';

import { LeadQualificationSkill } from './lead-qualification.skill';
import { EmailDraftingSkill } from './email-drafting.skill';
import { RevenueForecastingSkill } from './revenue-forecasting.skill';
import { CaseTriageSkill } from './case-triage.skill';
import { Customer360Skill } from './customer-360.skill';

/** All CRM skill definitions, typed for `defineStack({ skills })`. */
export const allSkills: Skill[] = [
  LeadQualificationSkill,
  EmailDraftingSkill,
  RevenueForecastingSkill,
  CaseTriageSkill,
  Customer360Skill,
];
