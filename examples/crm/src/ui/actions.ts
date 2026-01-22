import type { Action } from '@objectstack/spec/ui';

// Convert Lead to Account, Contact, and Opportunity
export const ConvertLeadAction: Action = {
  name: 'convert_lead',
  label: 'Convert Lead',
  icon: 'arrow-right-circle',
  type: 'flow',
  target: 'lead_conversion_flow',
  locations: ['record_header', 'list_item'],
  visible: 'status = "qualified" AND is_converted = false',
  confirmText: 'Are you sure you want to convert this lead?',
  successMessage: 'Lead converted successfully!',
  refreshAfter: true,
};

// Clone Opportunity
export const CloneOpportunityAction: Action = {
  name: 'clone_opportunity',
  label: 'Clone Opportunity',
  icon: 'copy',
  type: 'script',
  execute: 'cloneRecord',
  locations: ['record_header', 'record_more'],
  successMessage: 'Opportunity cloned successfully!',
  refreshAfter: true,
};

// Mark Contact as Primary
export const MarkPrimaryContactAction: Action = {
  name: 'mark_primary',
  label: 'Mark as Primary Contact',
  icon: 'star',
  type: 'script',
  execute: 'markAsPrimaryContact',
  locations: ['record_header', 'list_item'],
  visible: 'is_primary = false',
  confirmText: 'Mark this contact as the primary contact for the account?',
  successMessage: 'Contact marked as primary!',
  refreshAfter: true,
};

// Send Email to Contact
export const SendEmailAction: Action = {
  name: 'send_email',
  label: 'Send Email',
  icon: 'mail',
  type: 'modal',
  target: 'email_composer',
  locations: ['record_header', 'list_item'],
  visible: 'email_opt_out = false',
  refreshAfter: false,
};

// Log a Call
export const LogCallAction: Action = {
  name: 'log_call',
  label: 'Log a Call',
  icon: 'phone',
  type: 'modal',
  target: 'call_log_modal',
  locations: ['record_header', 'list_item', 'record_related'],
  params: [
    {
      name: 'subject',
      label: 'Call Subject',
      type: 'text',
      required: true,
    },
    {
      name: 'duration',
      label: 'Duration (minutes)',
      type: 'number',
      required: true,
    },
    {
      name: 'notes',
      label: 'Call Notes',
      type: 'textarea',
      required: false,
    }
  ],
  successMessage: 'Call logged successfully!',
  refreshAfter: true,
};

// Escalate Case
export const EscalateCaseAction: Action = {
  name: 'escalate_case',
  label: 'Escalate Case',
  icon: 'alert-triangle',
  type: 'modal',
  target: 'escalate_case_modal',
  locations: ['record_header', 'list_item'],
  visible: 'is_escalated = false AND is_closed = false',
  params: [
    {
      name: 'reason',
      label: 'Escalation Reason',
      type: 'textarea',
      required: true,
    }
  ],
  confirmText: 'This will escalate the case to the escalation team. Continue?',
  successMessage: 'Case escalated successfully!',
  refreshAfter: true,
};

// Close Case
export const CloseCaseAction: Action = {
  name: 'close_case',
  label: 'Close Case',
  icon: 'check-circle',
  type: 'modal',
  target: 'close_case_modal',
  locations: ['record_header'],
  visible: 'is_closed = false',
  params: [
    {
      name: 'resolution',
      label: 'Resolution',
      type: 'textarea',
      required: true,
    }
  ],
  confirmText: 'Are you sure you want to close this case?',
  successMessage: 'Case closed successfully!',
  refreshAfter: true,
};

// Mass Update Opportunity Stage
export const MassUpdateStageAction: Action = {
  name: 'mass_update_stage',
  label: 'Update Stage',
  icon: 'layers',
  type: 'modal',
  target: 'mass_update_stage_modal',
  locations: ['list_toolbar'],
  params: [
    {
      name: 'stage',
      label: 'New Stage',
      type: 'select',
      required: true,
      options: [
        { label: 'Prospecting', value: 'prospecting' },
        { label: 'Qualification', value: 'qualification' },
        { label: 'Needs Analysis', value: 'needs_analysis' },
        { label: 'Proposal', value: 'proposal' },
        { label: 'Negotiation', value: 'negotiation' },
        { label: 'Closed Won', value: 'closed_won' },
        { label: 'Closed Lost', value: 'closed_lost' },
      ]
    }
  ],
  successMessage: 'Opportunities updated successfully!',
  refreshAfter: true,
};

// Export to CSV
export const ExportToCsvAction: Action = {
  name: 'export_csv',
  label: 'Export to CSV',
  icon: 'download',
  type: 'script',
  execute: 'exportToCSV',
  locations: ['list_toolbar'],
  successMessage: 'Export completed!',
  refreshAfter: false,
};

// Create Campaign from Leads
export const CreateCampaignAction: Action = {
  name: 'create_campaign',
  label: 'Add to Campaign',
  icon: 'send',
  type: 'modal',
  target: 'add_to_campaign_modal',
  locations: ['list_toolbar'],
  params: [
    {
      name: 'campaign',
      label: 'Campaign',
      type: 'lookup',
      required: true,
    }
  ],
  successMessage: 'Leads added to campaign!',
  refreshAfter: true,
};

export const CrmActions = {
  ConvertLeadAction,
  CloneOpportunityAction,
  MarkPrimaryContactAction,
  SendEmailAction,
  LogCallAction,
  EscalateCaseAction,
  CloseCaseAction,
  MassUpdateStageAction,
  ExportToCsvAction,
  CreateCampaignAction,
};
