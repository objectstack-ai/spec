// @ts-nocheck
import { Hook } from '@objectstack/spec/data';

/**
 * Hook Examples - Demonstrating ObjectStack Hook Protocol
 * 
 * Hooks provide lifecycle interception points for injecting custom logic
 * during data operations.
 * Inspired by Mongoose Middleware, Sequelize Hooks, and Salesforce Triggers.
 */

// ============================================================================
// BEFORE INSERT HOOKS
// ============================================================================

/**
 * Example 1: Set Default Values
 * Populate default fields before insert
 * Use Case: Auto-populate created_at, created_by
 * 
 * Salesforce: Before Insert Trigger
 */
export const SetDefaultValuesHook: Hook = {
  name: 'set_default_values',
  label: 'Set Default Values',
  object: 'account',
  events: ['beforeInsert'],
  priority: 100,
  async: false,
  onError: 'abort',
  handler: 'setDefaultValues',
};

/**
 * Example 2: Generate Auto Number
 * Create sequential ID before insert
 * Use Case: Invoice numbers, ticket IDs
 */
export const GenerateAutoNumberHook: Hook = {
  name: 'generate_invoice_number',
  label: 'Generate Invoice Number',
  object: 'invoice',
  events: ['beforeInsert'],
  priority: 50,
  async: false,
  onError: 'abort',
  handler: 'generateInvoiceNumber',
};

/**
 * Example 3: Validate Business Rules
 * Complex validation before insert
 * Use Case: Credit limit check
 */
export const ValidateBusinessRulesHook: Hook = {
  name: 'validate_credit_limit',
  label: 'Validate Credit Limit',
  object: 'order',
  events: ['beforeInsert'],
  priority: 200,
  async: false,
  onError: 'abort',
  handler: 'validateCreditLimit',
};

// ============================================================================
// AFTER INSERT HOOKS
// ============================================================================

/**
 * Example 4: Send Notification
 * Send email after record creation
 * Use Case: New lead notification
 * 
 * Salesforce: After Insert Trigger
 */
export const SendNotificationHook: Hook = {
  name: 'send_new_lead_email',
  label: 'Send New Lead Notification',
  object: 'lead',
  events: ['afterInsert'],
  priority: 100,
  async: true,
  onError: 'log',
  handler: 'sendNewLeadEmail',
};

/**
 * Example 5: Create Related Records
 * Auto-create child records
 * Use Case: Create default tasks for new opportunities
 */
export const CreateRelatedRecordsHook: Hook = {
  name: 'create_default_tasks',
  label: 'Create Default Tasks',
  object: 'opportunity',
  events: ['afterInsert'],
  priority: 100,
  async: false,
  onError: 'log',
  handler: 'createDefaultTasks',
};

/**
 * Example 6: Sync to External System
 * Push data to external API
 * Use Case: Sync to CRM, ERP, or data warehouse
 */
export const SyncExternalSystemHook: Hook = {
  name: 'sync_to_salesforce',
  label: 'Sync to Salesforce',
  object: ['account', 'contact', 'opportunity'],
  events: ['afterInsert', 'afterUpdate'],
  priority: 300,
  async: true,
  onError: 'log',
  handler: 'syncToSalesforce',
};

// ============================================================================
// BEFORE UPDATE HOOKS
// ============================================================================

/**
 * Example 7: Track Modified Fields
 * Record which fields changed
 * Use Case: Audit trail, change history
 */
export const TrackModifiedFieldsHook: Hook = {
  name: 'track_modified_fields',
  label: 'Track Modified Fields',
  object: '*',
  events: ['beforeUpdate'],
  priority: 10,
  async: false,
  onError: 'log',
  handler: 'trackModifiedFields',
};

/**
 * Example 8: Validate State Transition
 * Ensure valid status changes
 * Use Case: Workflow enforcement
 */
export const ValidateStateTransitionHook: Hook = {
  name: 'validate_status_transition',
  label: 'Validate Status Transition',
  object: 'order',
  events: ['beforeUpdate'],
  priority: 100,
  async: false,
  onError: 'abort',
  handler: 'validateStatusTransition',
};

/**
 * Example 9: Update Modified Timestamp
 * Set updated_at field
 * Use Case: Standard timestamp tracking
 */
export const UpdateTimestampHook: Hook = {
  name: 'update_timestamp',
  label: 'Update Modified Timestamp',
  object: '*',
  events: ['beforeUpdate'],
  priority: 50,
  async: false,
  onError: 'log',
  handler: 'updateModifiedTimestamp',
};

// ============================================================================
// AFTER UPDATE HOOKS
// ============================================================================

/**
 * Example 10: Send Change Notification
 * Notify users of important changes
 * Use Case: Status change alerts
 */
export const ChangeNotificationHook: Hook = {
  name: 'send_status_change_email',
  label: 'Send Status Change Notification',
  object: 'support_ticket',
  events: ['afterUpdate'],
  priority: 100,
  async: true,
  onError: 'log',
  handler: 'sendStatusChangeEmail',
};

/**
 * Example 11: Update Summary Fields
 * Recalculate roll-up summaries
 * Use Case: Update opportunity total when line items change
 */
export const UpdateSummaryFieldsHook: Hook = {
  name: 'update_opportunity_total',
  label: 'Update Opportunity Total',
  object: 'opportunity_line_item',
  events: ['afterInsert', 'afterUpdate', 'afterDelete'],
  priority: 100,
  async: false,
  onError: 'log',
  handler: 'updateOpportunityTotal',
};

// ============================================================================
// BEFORE DELETE HOOKS
// ============================================================================

/**
 * Example 12: Prevent Delete with Children
 * Block deletion if related records exist
 * Use Case: Cannot delete account with active opportunities
 */
export const PreventDeleteHook: Hook = {
  name: 'prevent_delete_with_opportunities',
  label: 'Prevent Delete with Active Opportunities',
  object: 'account',
  events: ['beforeDelete'],
  priority: 100,
  async: false,
  onError: 'abort',
  handler: 'preventDeleteWithChildren',
};

/**
 * Example 13: Archive Before Delete
 * Move to archive instead of deleting
 * Use Case: Soft delete implementation
 */
export const ArchiveBeforeDeleteHook: Hook = {
  name: 'archive_before_delete',
  label: 'Archive Record Before Delete',
  object: ['lead', 'opportunity', 'case'],
  events: ['beforeDelete'],
  priority: 50,
  async: false,
  onError: 'log',
  handler: 'archiveRecord',
};

// ============================================================================
// AFTER DELETE HOOKS
// ============================================================================

/**
 * Example 14: Cleanup Related Records
 * Delete orphaned child records
 * Use Case: Cascade delete implementation
 */
export const CleanupRelatedHook: Hook = {
  name: 'cleanup_related_records',
  label: 'Cleanup Related Records',
  object: 'project',
  events: ['afterDelete'],
  priority: 100,
  async: false,
  onError: 'log',
  handler: 'cleanupRelatedRecords',
};

/**
 * Example 15: Log Deletion
 * Audit log for deleted records
 * Use Case: Compliance, audit trail
 */
export const LogDeletionHook: Hook = {
  name: 'log_deletion',
  label: 'Log Record Deletion',
  object: '*',
  events: ['afterDelete'],
  priority: 200,
  async: true,
  onError: 'log',
  handler: 'logDeletion',
};

// ============================================================================
// READ HOOKS
// ============================================================================

/**
 * Example 16: Filter by Security
 * Apply row-level security on queries
 * Use Case: Multi-tenant data isolation
 */
export const SecurityFilterHook: Hook = {
  name: 'apply_tenant_filter',
  label: 'Apply Tenant Security Filter',
  object: '*',
  events: ['beforeFind', 'beforeFindOne'],
  priority: 10,
  async: false,
  onError: 'abort',
  handler: 'applyTenantFilter',
};

/**
 * Example 17: Enrich Result Data
 * Add computed fields to query results
 * Use Case: Add calculated values
 */
export const EnrichResultHook: Hook = {
  name: 'add_computed_fields',
  label: 'Add Computed Fields',
  object: 'product',
  events: ['afterFind', 'afterFindOne'],
  priority: 100,
  async: false,
  onError: 'log',
  handler: 'addComputedFields',
};

// ============================================================================
// MULTI-EVENT HOOKS
// ============================================================================

/**
 * Example 18: Full Audit Trail
 * Track all changes to sensitive objects
 * Use Case: Compliance, GDPR
 */
export const AuditTrailHook: Hook = {
  name: 'audit_trail',
  label: 'Audit Trail Logger',
  object: ['account', 'contact', 'opportunity'],
  events: [
    'afterInsert',
    'afterUpdate',
    'afterDelete',
  ],
  priority: 500,
  async: true,
  onError: 'log',
  handler: 'logAuditTrail',
};

/**
 * Example 19: Real-time Sync
 * Keep external system in sync
 * Use Case: Data warehouse, analytics platform
 */
export const RealtimeSyncHook: Hook = {
  name: 'sync_to_warehouse',
  label: 'Sync to Data Warehouse',
  object: '*',
  events: [
    'afterInsert',
    'afterUpdate',
    'afterDelete',
  ],
  priority: 1000,
  async: true,
  onError: 'log',
  handler: 'syncToWarehouse',
};

/**
 * Example 20: Comprehensive Data Validation
 * Complex multi-stage validation
 * Use Case: Financial transaction validation
 */
export const ComprehensiveValidationHook: Hook = {
  name: 'validate_transaction',
  label: 'Comprehensive Transaction Validation',
  object: 'financial_transaction',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  async: false,
  onError: 'abort',
  handler: 'validateFinancialTransaction',
};
