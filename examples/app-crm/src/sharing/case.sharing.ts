import type { SharingRule } from '@objectstack/spec/security';

/** Share escalated/critical cases with service managers */
export const CaseEscalationSharingRule: SharingRule = {
  name: 'case_escalation_sharing',
  label: 'Escalated Cases Sharing',
  objectName: 'case',
  type: 'criteria_based',
  criteria: { priority: 'critical', is_closed: false },
  sharedWith: { type: 'role_and_subordinates', roles: ['service_manager'] },
  accessLevel: 'read_write',
};
