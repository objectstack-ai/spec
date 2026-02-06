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
