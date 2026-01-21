"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmActions = exports.CreateCampaignAction = exports.ExportToCsvAction = exports.MassUpdateStageAction = exports.CloseCaseAction = exports.EscalateCaseAction = exports.LogCallAction = exports.SendEmailAction = exports.MarkPrimaryContactAction = exports.CloneOpportunityAction = exports.ConvertLeadAction = void 0;
// Convert Lead to Account, Contact, and Opportunity
exports.ConvertLeadAction = {
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
exports.CloneOpportunityAction = {
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
exports.MarkPrimaryContactAction = {
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
exports.SendEmailAction = {
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
exports.LogCallAction = {
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
exports.EscalateCaseAction = {
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
exports.CloseCaseAction = {
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
exports.MassUpdateStageAction = {
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
exports.ExportToCsvAction = {
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
exports.CreateCampaignAction = {
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
exports.CrmActions = {
    ConvertLeadAction: exports.ConvertLeadAction,
    CloneOpportunityAction: exports.CloneOpportunityAction,
    MarkPrimaryContactAction: exports.MarkPrimaryContactAction,
    SendEmailAction: exports.SendEmailAction,
    LogCallAction: exports.LogCallAction,
    EscalateCaseAction: exports.EscalateCaseAction,
    CloseCaseAction: exports.CloseCaseAction,
    MassUpdateStageAction: exports.MassUpdateStageAction,
    ExportToCsvAction: exports.ExportToCsvAction,
    CreateCampaignAction: exports.CreateCampaignAction,
};
