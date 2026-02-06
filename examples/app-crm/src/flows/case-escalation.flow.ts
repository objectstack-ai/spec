import type { Flow } from '@objectstack/spec/automation';

export const CaseEscalationFlow: Flow = {
  name: 'case_escalation',
  label: 'Case Escalation Process',
  description: 'Automatically escalate high-priority cases',
  type: 'autolaunched',
  triggerType: 'on_create',
  objectName: 'case',
  criteria: 'priority = "critical" OR (priority = "high" AND account.type = "customer")',
  
  variables: [
    { name: 'caseId', type: 'text', required: true },
  ],
  
  steps: [
    {
      id: 'get_case',
      type: 'record_lookup',
      label: 'Get Case Record',
      objectName: 'case',
      filter: { id: '{caseId}' },
      outputVariable: 'caseRecord',
    },
    {
      id: 'assign_senior_agent',
      type: 'record_update',
      label: 'Assign to Senior Agent',
      recordId: '{caseId}',
      objectName: 'case',
      fields: {
        owner: '{caseRecord.owner.manager}',
        is_escalated: true,
        escalated_date: '{NOW()}',
      },
    },
    {
      id: 'create_task',
      type: 'record_create',
      label: 'Create Follow-up Task',
      objectName: 'task',
      fields: {
        subject: 'Follow up on escalated case: {caseRecord.case_number}',
        related_to: '{caseId}',
        owner: '{caseRecord.owner}',
        priority: 'high',
        status: 'not_started',
        due_date: '{TODAY() + 1}',
      },
    },
    {
      id: 'notify_team',
      type: 'email_alert',
      label: 'Notify Support Team',
      template: 'case_escalated',
      recipients: ['{caseRecord.owner}', '{caseRecord.owner.manager}', 'support-team@example.com'],
      variables: {
        caseNumber: '{caseRecord.case_number}',
        priority: '{caseRecord.priority}',
        accountName: '{caseRecord.account.name}',
      },
    },
  ],
};
