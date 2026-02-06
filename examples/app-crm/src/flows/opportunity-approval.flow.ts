/** Opportunity Approval — multi-level approval for deals over $100K */
export const OpportunityApprovalFlow = {
  name: 'opportunity_approval',
  label: 'Large Deal Approval',
  description: 'Approval process for opportunities over $100K',
  type: 'autolaunched',
  triggerType: 'on_update',
  objectName: 'opportunity',
  criteria: 'amount > 100000 AND stage = "proposal"',

  variables: [
    { name: 'opportunityId', type: 'text', isInput: true, isOutput: false },
  ],

  steps: [
    {
      id: 'get_opportunity',
      type: 'record_lookup',
      label: 'Get Opportunity',
      objectName: 'opportunity',
      filter: { id: '{opportunityId}' },
      outputVariable: 'oppRecord',
    },
    {
      id: 'approval_step_manager',
      type: 'approval',
      label: 'Sales Manager Approval',
      approver: '{oppRecord.owner.manager}',
      emailTemplate: 'opportunity_approval_request',
      comments: 'required',
      onApprove: 'approval_step_director',
      onReject: 'notify_rejection',
    },
    {
      id: 'approval_step_director',
      type: 'approval',
      label: 'Sales Director Approval',
      approver: '{oppRecord.owner.manager.manager}',
      emailTemplate: 'opportunity_approval_request',
      onApprove: 'mark_approved',
      onReject: 'notify_rejection',
    },
    {
      id: 'mark_approved',
      type: 'record_update',
      label: 'Mark as Approved',
      recordId: '{opportunityId}',
      objectName: 'opportunity',
      fields: { approval_status: 'approved', approved_date: '{NOW()}' },
      nextStep: 'notify_approval',
    },
    {
      id: 'notify_approval',
      type: 'email_alert',
      label: 'Send Approval Notification',
      template: 'opportunity_approved',
      recipients: ['{oppRecord.owner}'],
    },
    {
      id: 'notify_rejection',
      type: 'email_alert',
      label: 'Send Rejection Notification',
      template: 'opportunity_rejected',
      recipients: ['{oppRecord.owner}'],
    },
  ],
};
