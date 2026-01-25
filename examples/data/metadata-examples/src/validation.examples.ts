// @ts-nocheck
import { ValidationRule } from '@objectstack/spec/data';

/**
 * Validation Examples - Demonstrating ObjectStack Validation Protocol
 * 
 * Validation rules enforce data integrity and business logic at the data layer.
 * Inspired by Salesforce Validation Rules and ServiceNow Business Rules.
 */

// ============================================================================
// SCRIPT/EXPRESSION VALIDATION
// ============================================================================

/**
 * Example 1: Required Field Validation
 * Ensure field is not empty
 * Use Case: Opportunity must have account
 * 
 * Salesforce: ISBLANK(AccountId)
 */
export const RequiredFieldValidation: ValidationRule = {
  type: 'script',
  name: 'account_required',
  label: 'Account Required',
  message: 'Account is required for all opportunities',
  condition: 'account_id = null OR account_id = ""',
  severity: 'error',
  events: ['insert', 'update'],
  active: true,
};

/**
 * Example 2: Positive Amount Validation
 * Ensure numeric value is positive
 * Use Case: Amount must be greater than zero
 * 
 * Salesforce: Amount <= 0
 */
export const PositiveAmountValidation: ValidationRule = {
  type: 'script',
  name: 'amount_positive',
  label: 'Amount Must Be Positive',
  message: 'Amount must be greater than zero',
  condition: 'amount <= 0',
  severity: 'error',
  events: ['insert', 'update'],
  active: true,
};

/**
 * Example 3: Percentage Range Validation
 * Ensure value is within valid percentage range
 * Use Case: Discount cannot exceed 100%
 * 
 * Salesforce: Discount__c < 0 || Discount__c > 100
 */
export const PercentageRangeValidation: ValidationRule = {
  type: 'script',
  name: 'discount_range',
  label: 'Discount Percentage Range',
  message: 'Discount must be between 0% and 100%',
  condition: 'discount_percent < 0 OR discount_percent > 100',
  severity: 'error',
  events: ['insert', 'update'],
  active: true,
};

/**
 * Example 4: Maximum Discount Validation
 * Business rule: discount cannot exceed threshold
 * Use Case: Protect profit margins
 * 
 * Salesforce: Discount_Percent__c > 0.40
 */
export const MaxDiscountValidation: ValidationRule = {
  type: 'script',
  name: 'max_discount_40_percent',
  label: 'Maximum Discount 40%',
  description: 'Sales reps cannot offer discounts exceeding 40% without approval',
  message: 'Discount cannot exceed 40%. Please contact your manager for approval.',
  condition: 'discount_percent > 0.40',
  severity: 'error',
  events: ['insert', 'update'],
  tags: ['sales', 'pricing'],
  active: true,
};

// ============================================================================
// UNIQUENESS VALIDATION
// ============================================================================

/**
 * Example 5: Unique Email Validation
 * Ensure email is unique across active records
 * Use Case: No duplicate emails
 */
export const UniqueEmailValidation: ValidationRule = {
  type: 'unique',
  name: 'unique_email',
  label: 'Unique Email Address',
  message: 'A contact with this email address already exists',
  fields: ['email'],
  scope: 'is_active = true',
  caseSensitive: false,
  severity: 'error',
  events: ['insert', 'update'],
  active: true,
};

/**
 * Example 6: Compound Unique Validation
 * Multiple fields must be unique together
 * Use Case: Unique product SKU per warehouse
 */
export const CompoundUniqueValidation: ValidationRule = {
  type: 'unique',
  name: 'unique_sku_per_warehouse',
  label: 'Unique SKU per Warehouse',
  message: 'This SKU already exists in the selected warehouse',
  fields: ['sku', 'warehouse_id'],
  caseSensitive: true,
  severity: 'error',
  events: ['insert', 'update'],
  active: true,
};

// ============================================================================
// STATE MACHINE VALIDATION
// ============================================================================

/**
 * Example 7: Opportunity Stage Validation
 * Control valid stage transitions
 * Use Case: Sales pipeline workflow
 */
export const OpportunityStageValidation: ValidationRule = {
  type: 'state_machine',
  name: 'opportunity_stage_flow',
  label: 'Opportunity Stage Workflow',
  description: 'Enforces valid stage transitions in sales pipeline',
  message: 'Invalid stage transition. Please follow the sales process.',
  field: 'stage',
  transitions: {
    qualification: ['proposal', 'closed_lost'],
    proposal: ['qualification', 'negotiation', 'closed_lost'],
    negotiation: ['proposal', 'closed_won', 'closed_lost'],
    closed_won: [],
    closed_lost: ['qualification'],
  },
  severity: 'error',
  events: ['update'],
  tags: ['sales', 'workflow'],
  active: true,
};

/**
 * Example 8: Order Status Validation
 * Control order lifecycle
 * Use Case: Order fulfillment workflow
 */
export const OrderStatusValidation: ValidationRule = {
  type: 'state_machine',
  name: 'order_status_flow',
  label: 'Order Status Workflow',
  message: 'Invalid order status transition',
  field: 'status',
  transitions: {
    draft: ['submitted', 'cancelled'],
    submitted: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'returned'],
    delivered: ['returned'],
    cancelled: [],
    returned: [],
  },
  severity: 'error',
  events: ['update'],
  active: true,
};

// ============================================================================
// FORMAT VALIDATION
// ============================================================================

/**
 * Example 9: Phone Format Validation
 * Validate phone number format
 * Use Case: Consistent phone formatting
 */
export const PhoneFormatValidation: ValidationRule = {
  type: 'format',
  name: 'phone_format',
  label: 'Phone Number Format',
  message: 'Phone number must be in format: (XXX) XXX-XXXX',
  field: 'phone',
  regex: '^\\(\\d{3}\\) \\d{3}-\\d{4}$',
  severity: 'error',
  events: ['insert', 'update'],
  active: true,
};

/**
 * Example 10: Custom ID Format Validation
 * Validate custom identifier pattern
 * Use Case: Project codes follow naming convention
 */
export const ProjectCodeFormatValidation: ValidationRule = {
  type: 'format',
  name: 'project_code_format',
  label: 'Project Code Format',
  description: 'Project codes must start with PRJ- followed by year and 4 digits',
  message: 'Project code must follow format: PRJ-YYYY-NNNN (e.g., PRJ-2024-0001)',
  field: 'project_code',
  regex: '^PRJ-\\d{4}-\\d{4}$',
  severity: 'error',
  events: ['insert', 'update'],
  active: true,
};

// ============================================================================
// CROSS-FIELD VALIDATION
// ============================================================================

/**
 * Example 11: Date Range Validation
 * End date must be after start date
 * Use Case: Project timelines, events
 * 
 * Salesforce: End_Date__c < Start_Date__c
 */
export const DateRangeValidation: ValidationRule = {
  type: 'cross_field',
  name: 'end_date_after_start',
  label: 'End Date After Start Date',
  message: 'End date must be after start date',
  condition: 'end_date <= start_date',
  fields: ['start_date', 'end_date'],
  severity: 'error',
  events: ['insert', 'update'],
  active: true,
};

/**
 * Example 12: Discount Amount Validation
 * Discount cannot exceed total
 * Use Case: Order discounts
 * 
 * Salesforce: Discount__c > Amount__c
 */
export const DiscountAmountValidation: ValidationRule = {
  type: 'cross_field',
  name: 'discount_not_exceed_amount',
  label: 'Discount Within Amount',
  message: 'Discount cannot exceed the total amount',
  condition: 'discount_amount > total_amount',
  fields: ['discount_amount', 'total_amount'],
  severity: 'error',
  events: ['insert', 'update'],
  active: true,
};

/**
 * Example 13: Close Date Future Validation
 * Opportunity close date must be in future
 * Use Case: Sales forecasting
 * 
 * Salesforce: CloseDate < TODAY()
 */
export const CloseDateFutureValidation: ValidationRule = {
  type: 'cross_field',
  name: 'close_date_future',
  label: 'Close Date in Future',
  message: 'Close date must be today or in the future',
  condition: 'close_date < TODAY()',
  fields: ['close_date'],
  severity: 'warning',
  events: ['insert', 'update'],
  active: true,
};

// ============================================================================
// ASYNC VALIDATION
// ============================================================================

/**
 * Example 14: Email Uniqueness Check
 * Validate email availability via API
 * Use Case: Real-time duplicate checking
 */
export const AsyncEmailValidation: ValidationRule = {
  type: 'async',
  name: 'check_email_availability',
  label: 'Email Availability',
  message: 'This email address is already registered',
  field: 'email',
  validatorUrl: '/api/users/check-email',
  method: 'GET',
  timeout: 3000,
  debounce: 500,
  severity: 'error',
  events: ['insert', 'update'],
  active: true,
};

/**
 * Example 15: Tax ID Validation
 * Validate tax ID with external service
 * Use Case: Government compliance
 */
export const TaxIdValidation: ValidationRule = {
  type: 'async',
  name: 'validate_tax_id',
  label: 'Tax ID Validation',
  message: 'Invalid Tax ID number',
  field: 'tax_id',
  validatorFunction: 'validateTaxIdWithIRS',
  timeout: 10000,
  params: {
    country: 'US',
    format: 'EIN',
  },
  severity: 'error',
  events: ['insert', 'update'],
  active: true,
};

// ============================================================================
// CONDITIONAL VALIDATION
// ============================================================================

/**
 * Example 16: Conditional Required Field
 * Field required only in certain conditions
 * Use Case: Shipping address required for physical products
 */
export const ConditionalRequiredValidation: ValidationRule = {
  type: 'conditional',
  name: 'shipping_address_when_physical',
  label: 'Shipping Address for Physical Products',
  description: 'Shipping address is required when product type is physical',
  when: 'product_type = "physical"',
  message: 'Validation for physical products',
  then: {
    type: 'script',
    name: 'shipping_address_required',
    message: 'Shipping address is required for physical products',
    condition: 'shipping_address = null OR shipping_address = ""',
    severity: 'error',
    events: ['insert', 'update'],
    active: true,
  },
  severity: 'error',
  events: ['insert', 'update'],
  active: true,
};

/**
 * Example 17: Conditional Approval Required
 * High-value orders require approval
 * Use Case: Manager approval workflow
 */
export const ConditionalApprovalValidation: ValidationRule = {
  type: 'conditional',
  name: 'high_value_approval',
  label: 'High Value Order Approval',
  description: 'Orders over $10,000 require manager approval',
  when: 'total_amount > 10000',
  message: 'High value order validation',
  then: {
    type: 'script',
    name: 'manager_approval_required',
    message: 'Orders over $10,000 require manager approval',
    condition: 'manager_approval_id = null',
    severity: 'error',
    events: ['insert', 'update'],
    active: true,
  },
  otherwise: {
    type: 'script',
    name: 'payment_method_required',
    message: 'Payment method is required',
    condition: 'payment_method = null',
    severity: 'error',
    events: ['insert', 'update'],
    active: true,
  },
  severity: 'error',
  events: ['insert', 'update'],
  active: true,
};

/**
 * Example 18: Regional Compliance Validation
 * Different rules for different regions
 * Use Case: GDPR compliance for EU customers
 */
export const RegionalComplianceValidation: ValidationRule = {
  type: 'conditional',
  name: 'regional_compliance',
  label: 'Regional Compliance Rules',
  description: 'Apply region-specific compliance validation',
  when: 'region = "EU"',
  message: 'EU compliance validation',
  then: {
    type: 'script',
    name: 'gdpr_consent',
    message: 'GDPR consent is required for EU customers',
    condition: 'gdpr_consent_given = false',
    severity: 'error',
    events: ['insert', 'update'],
    active: true,
  },
  otherwise: {
    type: 'script',
    name: 'tos_acceptance',
    message: 'Terms of Service acceptance required',
    condition: 'tos_accepted = false',
    severity: 'error',
    events: ['insert', 'update'],
    active: true,
  },
  severity: 'error',
  events: ['insert', 'update'],
  tags: ['compliance', 'legal'],
  active: true,
};

// ============================================================================
// CUSTOM VALIDATION
// ============================================================================

/**
 * Example 19: Custom Business Logic Validation
 * Complex validation requiring custom code
 * Use Case: Credit limit check
 */
export const CustomCreditCheckValidation: ValidationRule = {
  type: 'custom',
  name: 'credit_limit_check',
  label: 'Credit Limit Check',
  description: 'Validate customer has sufficient credit for order',
  message: 'Customer credit limit exceeded',
  handler: 'validateCreditLimit',
  params: {
    includeOutstanding: true,
    includePending: true,
  },
  severity: 'error',
  events: ['insert', 'update'],
  tags: ['finance', 'credit'],
  active: true,
};

/**
 * Example 20: Custom Inventory Validation
 * Check product availability
 * Use Case: Prevent overselling
 */
export const CustomInventoryValidation: ValidationRule = {
  type: 'custom',
  name: 'inventory_availability',
  label: 'Inventory Availability',
  description: 'Verify sufficient inventory for order',
  message: 'Insufficient inventory for requested quantity',
  handler: 'checkInventoryAvailability',
  params: {
    reserveInventory: false,
    checkAllWarehouses: true,
  },
  severity: 'error',
  events: ['insert', 'update'],
  tags: ['inventory', 'fulfillment'],
  active: true,
};
