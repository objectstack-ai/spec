// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/** Share escalated/critical cases with service managers */
export const CaseEscalationSharingRule = {
  name: 'case_escalation_sharing',
  label: 'Escalated Cases Sharing',
  object: 'case',
  type: 'criteria' as const,
  condition: 'priority = "critical" AND is_closed = false',
  accessLevel: 'edit',
  sharedWith: { type: 'role_and_subordinates', value: 'service_manager' },
};
