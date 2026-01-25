// @ts-nocheck
import { Action } from '@objectstack/spec/ui';

/**
 * Action Examples - Demonstrating ObjectStack Action Protocol
 * 
 * Actions define user interactions and operations on data.
 * Inspired by Salesforce Quick Actions and ServiceNow UI Actions.
 */

// ============================================================================
// MODAL ACTIONS (Dialog-based Actions)
// ============================================================================

/**
 * Example 1: Simple Modal Action
 * Opens a modal dialog for user input
 * Use Case: Quick data entry, simple forms
 */
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
    },
  ],
  successMessage: 'Call logged successfully!',
  refreshAfter: true,
};

/**
 * Example 2: Modal Action with Confirmation
 * Requires user confirmation before executing
 * Use Case: Destructive or important operations
 */
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
    },
    {
      name: 'escalate_to',
      label: 'Escalate To',
      type: 'lookup',
      required: true,
    },
  ],
  confirmText: 'This will escalate the case to the escalation team. Continue?',
  successMessage: 'Case escalated successfully!',
  refreshAfter: true,
};

/**
 * Example 3: Modal Action with Multiple Parameters
 * Complex form in modal with various field types
 * Use Case: Multi-step processes requiring detailed input
 */
export const ScheduleMeetingAction: Action = {
  name: 'schedule_meeting',
  label: 'Schedule Meeting',
  icon: 'calendar',
  type: 'modal',
  target: 'meeting_scheduler',
  locations: ['record_header', 'list_toolbar'],
  params: [
    {
      name: 'meeting_title',
      label: 'Meeting Title',
      type: 'text',
      required: true,
    },
    {
      name: 'start_datetime',
      label: 'Start Date & Time',
      type: 'datetime',
      required: true,
    },
    {
      name: 'duration',
      label: 'Duration',
      type: 'select',
      required: true,
      options: [
        { label: '15 minutes', value: '15' },
        { label: '30 minutes', value: '30' },
        { label: '1 hour', value: '60' },
        { label: '2 hours', value: '120' },
      ],
    },
    {
      name: 'attendees',
      label: 'Attendees',
      type: 'lookup',
      required: true,
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text',
      required: false,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
    },
  ],
  successMessage: 'Meeting scheduled and invites sent!',
  refreshAfter: true,
};

// ============================================================================
// FLOW ACTIONS (Visual Workflow Actions)
// ============================================================================

/**
 * Example 4: Flow Action for Complex Process
 * Launches a visual flow for multi-step processes
 * Use Case: Lead conversion, order processing, approval workflows
 * Inspired by: Salesforce Screen Flows
 */
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

/**
 * Example 5: Approval Flow Action
 * Submits record for approval workflow
 * Use Case: Approval processes, review workflows
 */
export const SubmitForApprovalAction: Action = {
  name: 'submit_approval',
  label: 'Submit for Approval',
  icon: 'check-square',
  type: 'flow',
  target: 'approval_submission_flow',
  locations: ['record_header'],
  visible: 'status = "draft" AND approval_status = null',
  confirmText: 'Submit this record for approval?',
  successMessage: 'Submitted for approval',
  refreshAfter: true,
};

/**
 * Example 6: Onboarding Flow Action
 * Guided onboarding process for new customers
 * Use Case: Customer onboarding, employee onboarding
 */
export const StartOnboardingAction: Action = {
  name: 'start_onboarding',
  label: 'Start Onboarding',
  icon: 'user-plus',
  type: 'flow',
  target: 'customer_onboarding_flow',
  locations: ['record_header'],
  visible: 'onboarding_status = "not_started"',
  successMessage: 'Onboarding process initiated',
  refreshAfter: true,
};

// ============================================================================
// SCRIPT ACTIONS (Custom JavaScript Actions)
// ============================================================================

/**
 * Example 7: Simple Script Action
 * Executes custom JavaScript function
 * Use Case: Custom business logic, calculations, integrations
 */
export const CloneRecordAction: Action = {
  name: 'clone_record',
  label: 'Clone',
  icon: 'copy',
  type: 'script',
  execute: 'cloneRecord',
  locations: ['record_header', 'record_more'],
  successMessage: 'Record cloned successfully!',
  refreshAfter: true,
};

/**
 * Example 8: Script Action with Confirmation
 * Destructive operation requiring confirmation
 * Use Case: Delete, archive, mass updates
 */
export const DeleteRecordAction: Action = {
  name: 'delete_record',
  label: 'Delete',
  icon: 'trash-2',
  type: 'script',
  execute: 'deleteRecord',
  locations: ['record_more'],
  confirmText: 'Are you sure you want to delete this record? This cannot be undone.',
  successMessage: 'Record deleted successfully!',
  refreshAfter: false,
};

/**
 * Example 9: Export Script Action
 * Exports data to external format
 * Use Case: Data export, reporting, integrations
 */
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

/**
 * Example 10: Print Action
 * Generates printable version
 * Use Case: Print reports, invoices, documents
 */
export const PrintRecordAction: Action = {
  name: 'print_record',
  label: 'Print',
  icon: 'printer',
  type: 'script',
  execute: 'printRecord',
  locations: ['record_header', 'record_more'],
  refreshAfter: false,
};

// ============================================================================
// URL ACTIONS (Navigation Actions)
// ============================================================================

/**
 * Example 11: External URL Action
 * Opens external link in new tab
 * Use Case: External integrations, documentation links
 */
export const ViewInExternalSystemAction: Action = {
  name: 'view_external',
  label: 'View in CRM',
  icon: 'external-link',
  type: 'url',
  url: 'https://crm.example.com/accounts/{account_id}',
  target: '_blank',
  locations: ['record_header'],
};

/**
 * Example 12: Help Documentation Action
 * Opens help documentation
 * Use Case: Contextual help, user guides
 */
export const OpenHelpAction: Action = {
  name: 'open_help',
  label: 'Help',
  icon: 'help-circle',
  type: 'url',
  url: 'https://docs.example.com/help/{object_name}',
  target: '_blank',
  locations: ['record_header', 'list_toolbar'],
};

// ============================================================================
// BATCH ACTIONS (Mass Operations)
// ============================================================================

/**
 * Example 13: Mass Update Action
 * Updates multiple records at once
 * Use Case: Bulk operations, mass data updates
 * Inspired by: Salesforce Mass Update
 */
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
      ],
    },
  ],
  confirmText: 'Update stage for selected records?',
  successMessage: 'Records updated successfully!',
  refreshAfter: true,
};

/**
 * Example 14: Mass Assign Action
 * Assigns multiple records to a user
 * Use Case: Workload distribution, team reassignment
 */
export const MassAssignAction: Action = {
  name: 'mass_assign',
  label: 'Assign To',
  icon: 'user-check',
  type: 'modal',
  target: 'mass_assign_modal',
  locations: ['list_toolbar'],
  params: [
    {
      name: 'owner',
      label: 'Assign To',
      type: 'lookup',
      required: true,
    },
    {
      name: 'send_notification',
      label: 'Send Notification',
      type: 'checkbox',
      required: false,
    },
  ],
  confirmText: 'Assign selected records?',
  successMessage: 'Records assigned successfully!',
  refreshAfter: true,
};

/**
 * Example 15: Mass Delete Action
 * Deletes multiple records
 * Use Case: Bulk cleanup, data purging
 */
export const MassDeleteAction: Action = {
  name: 'mass_delete',
  label: 'Delete Selected',
  icon: 'trash-2',
  type: 'script',
  execute: 'massDeleteRecords',
  locations: ['list_toolbar'],
  visible: 'user.role = "admin"',
  confirmText: 'Are you sure you want to delete the selected records? This cannot be undone.',
  successMessage: 'Records deleted successfully!',
  refreshAfter: true,
};

// ============================================================================
// CAMPAIGN & MARKETING ACTIONS
// ============================================================================

/**
 * Example 16: Add to Campaign Action
 * Adds records to a marketing campaign
 * Use Case: Marketing campaigns, email blasts
 */
export const AddToCampaignAction: Action = {
  name: 'add_to_campaign',
  label: 'Add to Campaign',
  icon: 'send',
  type: 'modal',
  target: 'add_to_campaign_modal',
  locations: ['list_toolbar', 'record_header'],
  params: [
    {
      name: 'campaign',
      label: 'Campaign',
      type: 'lookup',
      required: true,
    },
    {
      name: 'member_status',
      label: 'Member Status',
      type: 'select',
      required: true,
      options: [
        { label: 'Sent', value: 'sent' },
        { label: 'Responded', value: 'responded' },
        { label: 'Subscribed', value: 'subscribed' },
      ],
    },
  ],
  successMessage: 'Added to campaign successfully!',
  refreshAfter: true,
};

/**
 * Example 17: Send Email Action
 * Sends email to selected records
 * Use Case: Email communications, notifications
 */
export const SendEmailAction: Action = {
  name: 'send_email',
  label: 'Send Email',
  icon: 'mail',
  type: 'modal',
  target: 'email_composer',
  locations: ['record_header', 'list_toolbar'],
  visible: 'email_opt_out = false',
  params: [
    {
      name: 'template',
      label: 'Email Template',
      type: 'select',
      required: false,
    },
    {
      name: 'subject',
      label: 'Subject',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      label: 'Message',
      type: 'textarea',
      required: true,
    },
  ],
  successMessage: 'Email sent successfully!',
  refreshAfter: false,
};

// ============================================================================
// STATUS CHANGE ACTIONS
// ============================================================================

/**
 * Example 18: Mark as Complete Action
 * Changes status to completed
 * Use Case: Task completion, status updates
 */
export const MarkCompleteAction: Action = {
  name: 'mark_complete',
  label: 'Mark Complete',
  icon: 'check-circle',
  type: 'script',
  execute: 'markAsComplete',
  locations: ['record_header', 'list_item'],
  visible: 'is_completed = false',
  successMessage: 'Marked as complete!',
  refreshAfter: true,
};

/**
 * Example 19: Close Case Action
 * Closes support case with resolution
 * Use Case: Support case management
 */
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
    },
    {
      name: 'resolution_type',
      label: 'Resolution Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Resolved', value: 'resolved' },
        { label: 'Workaround Provided', value: 'workaround' },
        { label: 'Not a Bug', value: 'not_a_bug' },
        { label: 'Duplicate', value: 'duplicate' },
      ],
    },
  ],
  confirmText: 'Are you sure you want to close this case?',
  successMessage: 'Case closed successfully!',
  refreshAfter: true,
};

/**
 * Example 20: Reopen Case Action
 * Reopens a closed case
 * Use Case: Case management, issue tracking
 */
export const ReopenCaseAction: Action = {
  name: 'reopen_case',
  label: 'Reopen Case',
  icon: 'refresh-cw',
  type: 'modal',
  target: 'reopen_case_modal',
  locations: ['record_header'],
  visible: 'is_closed = true',
  params: [
    {
      name: 'reason',
      label: 'Reason for Reopening',
      type: 'textarea',
      required: true,
    },
  ],
  confirmText: 'Reopen this case?',
  successMessage: 'Case reopened!',
  refreshAfter: true,
};

// ============================================================================
// RELATIONSHIP ACTIONS
// ============================================================================

/**
 * Example 21: Mark as Primary Contact
 * Sets contact as primary for account
 * Use Case: Relationship management
 */
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

/**
 * Example 22: Create Related Record Action
 * Creates a related child record
 * Use Case: Creating related data quickly
 */
export const CreateRelatedOpportunityAction: Action = {
  name: 'create_opportunity',
  label: 'New Opportunity',
  icon: 'plus-circle',
  type: 'modal',
  target: 'new_opportunity_modal',
  locations: ['record_related'],
  successMessage: 'Opportunity created!',
  refreshAfter: true,
};

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export const ActionExamples = {
  // Modal Actions
  LogCallAction,
  EscalateCaseAction,
  ScheduleMeetingAction,
  
  // Flow Actions
  ConvertLeadAction,
  SubmitForApprovalAction,
  StartOnboardingAction,
  
  // Script Actions
  CloneRecordAction,
  DeleteRecordAction,
  ExportToCsvAction,
  PrintRecordAction,
  
  // URL Actions
  ViewInExternalSystemAction,
  OpenHelpAction,
  
  // Batch Actions
  MassUpdateStageAction,
  MassAssignAction,
  MassDeleteAction,
  
  // Campaign Actions
  AddToCampaignAction,
  SendEmailAction,
  
  // Status Actions
  MarkCompleteAction,
  CloseCaseAction,
  ReopenCaseAction,
  
  // Relationship Actions
  MarkPrimaryContactAction,
  CreateRelatedOpportunityAction,
};
