# Business Logic Guide

Complete guide to implementing business rules, validations, and automated processes in ObjectStack.

## Table of Contents

1. [Validation Rules](#validation-rules)
2. [Workflow Rules](#workflow-rules)
3. [Triggers](#triggers)
4. [Approval Processes](#approval-processes)
5. [Formula Logic](#formula-logic)
6. [Best Practices](#best-practices)

---

## Validation Rules

Validation rules ensure data quality by preventing invalid data from being saved.

### Script Validation

Use JavaScript-like expressions to validate data:

```typescript
validations: [
  {
    name: 'close_date_future',
    type: 'script',
    severity: 'error',
    message: 'Close Date must be in the future',
    condition: 'close_date <= TODAY()',
  },
  
  {
    name: 'discount_limit',
    type: 'script',
    severity: 'warning',
    message: 'Discount exceeds 20%',
    condition: 'discount > 20',
  },
]
```

### Unique Validation

Ensure field values are unique across records:

```typescript
{
  name: 'email_unique',
  type: 'unique',
  severity: 'error',
  message: 'Email address must be unique',
  fields: ['email'],
  caseSensitive: false,
}

// Compound unique constraint
{
  name: 'account_product_unique',
  type: 'unique',
  severity: 'error',
  message: 'Product already exists for this account',
  fields: ['account', 'product'],
}
```

### Required Field Validation

Mark fields as required at the field level:

```typescript
Field.text({
  label: 'Name',
  required: true,
})

// Conditional required (use validation rule)
{
  name: 'contact_required_for_customer',
  type: 'script',
  severity: 'error',
  message: 'Contact is required for customer accounts',
  condition: 'type = "customer" AND ISBLANK(primary_contact)',
}
```

### Validation Functions

| Function | Description | Example |
|----------|-------------|---------|
| `ISBLANK(field)` | Check if field is empty | `ISBLANK(phone)` |
| `ISCHANGED(field)` | Check if field changed | `ISCHANGED(stage)` |
| `ISNEW()` | Check if record is new | `ISNEW()` |
| `PRIORVALUE(field)` | Get previous value | `PRIORVALUE(status)` |
| `AND(expr1, expr2)` | Logical AND | `AND(is_active, amount > 0)` |
| `OR(expr1, expr2)` | Logical OR | `OR(status="new", status="pending")` |
| `NOT(expr)` | Logical NOT | `NOT(is_deleted)` |
| `TODAY()` | Current date | `TODAY()` |
| `NOW()` | Current datetime | `NOW()` |

---

## Workflow Rules

Workflow rules automate standard internal procedures and processes to save time.

### Field Update Workflow

Automatically update fields when conditions are met:

```typescript
workflows: [
  {
    name: 'update_last_activity',
    objectName: 'account',
    triggerType: 'on_update',
    criteria: 'ISCHANGED(owner) OR ISCHANGED(type)',
    actions: [
      {
        name: 'set_activity_date',
        type: 'field_update',
        field: 'last_activity_date',
        value: 'TODAY()',
      }
    ],
    active: true,
  }
]
```

### Email Alert Workflow

Send emails when conditions are met:

```typescript
{
  name: 'notify_high_value_opportunity',
  objectName: 'opportunity',
  triggerType: 'on_create',
  criteria: 'amount > 100000',
  actions: [
    {
      name: 'notify_manager',
      type: 'email_alert',
      template: 'high_value_opportunity',
      recipients: ['{owner.manager}'],
    }
  ],
  active: true,
}
```

### Task Creation Workflow

Automatically create tasks:

```typescript
{
  name: 'create_follow_up_task',
  objectName: 'lead',
  triggerType: 'on_create',
  criteria: 'rating = "hot"',
  actions: [
    {
      name: 'create_task',
      type: 'task_create',
      subject: 'Follow up on hot lead: {name}',
      relatedTo: '{id}',
      assignedTo: '{owner}',
      dueDate: '{TODAY() + 1}',
      priority: 'high',
    }
  ],
  active: true,
}
```

### Scheduled Workflow

Run workflows on a schedule:

```typescript
{
  name: 'contract_expiration_check',
  objectName: 'contract',
  triggerType: 'scheduled',
  schedule: '0 0 * * *', // Daily at midnight
  criteria: 'end_date <= TODAY() AND status = "activated"',
  actions: [
    {
      name: 'mark_expired',
      type: 'field_update',
      field: 'status',
      value: '"expired"',
    },
    {
      name: 'notify_owner',
      type: 'email_alert',
      template: 'contract_expired',
      recipients: ['{owner}'],
    }
  ],
  active: true,
}
```

### Trigger Types

| Type | When It Fires | Use Case |
|------|---------------|----------|
| `on_create` | Record created | Welcome emails, initial tasks |
| `on_update` | Record updated | Status changes, notifications |
| `on_delete` | Record deleted | Cleanup, archival |
| `on_read` | Record viewed | Lazy updates, calculations |
| `scheduled` | Cron schedule | Batch processing, cleanup |

---

## Triggers

Advanced event-driven automation with custom logic.

### Before Trigger

Modify records before they're saved:

```typescript
import { Trigger } from '@objectstack/spec/data';

export const AccountBeforeTrigger: Trigger = {
  name: 'account_before_insert_update',
  objectName: 'account',
  timing: 'before',
  operations: ['insert', 'update'],
  
  handler: async (context) => {
    for (const record of context.records) {
      // Normalize phone numbers
      if (record.phone) {
        record.phone = normalizePhone(record.phone);
      }
      
      // Auto-populate from website
      if (!record.industry && record.website) {
        record.industry = await lookupIndustry(record.website);
      }
    }
  },
};
```

### After Trigger

Perform actions after records are saved:

```typescript
export const OpportunityAfterTrigger: Trigger = {
  name: 'opportunity_after_update',
  objectName: 'opportunity',
  timing: 'after',
  operations: ['update'],
  
  handler: async (context) => {
    const wonOpps = context.records.filter(
      r => r.stage === 'closed_won' && 
           context.oldRecords[r.id].stage !== 'closed_won'
    );
    
    for (const opp of wonOpps) {
      // Create contract
      await context.create('contract', {
        account: opp.account,
        opportunity: opp.id,
        contract_value: opp.amount,
        start_date: new Date(),
      });
      
      // Send notification
      await context.sendEmail({
        to: opp.owner.email,
        template: 'opportunity_won',
        data: { opportunity: opp },
      });
    }
  },
};
```

### Trigger Context

Available in trigger handlers:

```typescript
context = {
  records: Record[],        // New records
  oldRecords: Map<id, Record>, // Original records (update/delete)
  operation: 'insert' | 'update' | 'delete',
  timing: 'before' | 'after',
  user: User,              // Current user
  
  // Operations
  create(objectName, data),
  update(objectName, id, data),
  delete(objectName, id),
  query(objectName, filter),
  
  // Utilities
  sendEmail(options),
  callAPI(url, options),
  log(message),
}
```

---

## Approval Processes

Multi-step approval workflows for business processes.

### Simple Approval

Single-step approval:

```typescript
{
  name: 'opportunity_approval',
  objectName: 'opportunity',
  triggerType: 'manual',
  entryConditions: 'amount > 50000',
  
  steps: [
    {
      name: 'manager_approval',
      approver: '{owner.manager}',
      approverType: 'user',
      emailTemplate: 'approval_request',
      requiresComments: true,
      
      approvalActions: [
        {
          type: 'field_update',
          field: 'approval_status',
          value: '"approved"',
        }
      ],
      
      rejectionActions: [
        {
          type: 'field_update',
          field: 'approval_status',
          value: '"rejected"',
        },
        {
          type: 'email_alert',
          template: 'approval_rejected',
          recipients: ['{owner}'],
        }
      ],
    }
  ],
  
  finalApprovalActions: [
    {
      type: 'field_update',
      field: 'stage',
      value: '"proposal"',
    }
  ],
  
  finalRejectionActions: [
    {
      type: 'field_update',
      field: 'stage',
      value: '"qualification"',
    }
  ],
}
```

### Multi-Step Approval

Sequential approval with multiple approvers:

```typescript
{
  name: 'contract_approval',
  objectName: 'contract',
  triggerType: 'manual',
  
  steps: [
    // Step 1: Sales Manager
    {
      name: 'sales_manager',
      approver: '{owner.manager}',
      emailTemplate: 'contract_approval_manager',
    },
    
    // Step 2: Legal Review
    {
      name: 'legal_review',
      approver: '{legal_team}',
      approverType: 'queue',
      emailTemplate: 'contract_approval_legal',
      requiresComments: true,
    },
    
    // Step 3: Finance Approval
    {
      name: 'finance_approval',
      approver: '{finance_director}',
      condition: 'contract_value > 100000',
      emailTemplate: 'contract_approval_finance',
    },
  ],
}
```

### Parallel Approval

Multiple approvers must approve:

```typescript
{
  name: 'discount_approval',
  objectName: 'quote',
  
  steps: [
    {
      name: 'dual_approval',
      approverType: 'all',
      approvers: [
        '{sales_manager}',
        '{pricing_manager}',
      ],
      emailTemplate: 'discount_approval_request',
    }
  ],
}
```

---

## Formula Logic

Complex calculations and logic in formula fields.

### Conditional Logic

```typescript
// Tiered pricing
Field.formula({
  label: 'Discount Tier',
  type: 'text',
  formula: `
    IF(amount > 1000000, "Platinum",
      IF(amount > 500000, "Gold",
        IF(amount > 100000, "Silver", "Bronze")
      )
    )
  `,
})

// Status indicator
Field.formula({
  label: 'Health Score',
  type: 'text',
  formula: `
    IF(AND(is_active, days_since_contact < 30), "Healthy",
      IF(days_since_contact < 90, "At Risk", "Critical")
    )
  `,
})
```

### Date Calculations

```typescript
// Days until close
Field.formula({
  label: 'Days to Close',
  type: 'number',
  formula: 'DAYS_DIFF(close_date, TODAY())',
})

// Contract end in 30 days
Field.formula({
  label: 'Expiring Soon',
  type: 'boolean',
  formula: 'AND(status = "active", DAYS_DIFF(end_date, TODAY()) <= 30)',
})

// Age in months
Field.formula({
  label: 'Age (Months)',
  type: 'number',
  formula: 'MONTH_DIFF(TODAY(), created_date)',
})
```

### Financial Calculations

```typescript
// Gross margin
Field.formula({
  label: 'Gross Margin %',
  type: 'percent',
  formula: 'IF(revenue > 0, ((revenue - cost) / revenue) * 100, 0)',
  scale: 2,
})

// Weighted pipeline
Field.formula({
  label: 'Weighted Amount',
  type: 'currency',
  formula: 'amount * (probability / 100)',
  scale: 2,
})

// Total with tax
Field.formula({
  label: 'Total with Tax',
  type: 'currency',
  formula: 'subtotal * 1.0825', // 8.25% tax
  scale: 2,
})
```

### Text Manipulation

```typescript
// Full name
Field.formula({
  label: 'Full Name',
  type: 'text',
  formula: 'CONCAT(first_name, " ", last_name)',
})

// Email domain
Field.formula({
  label: 'Email Domain',
  type: 'text',
  formula: 'SPLIT(email, "@")[1]',
})

// Uppercase
Field.formula({
  label: 'Code',
  type: 'text',
  formula: 'UPPER(sku)',
})
```

---

## Best Practices

### 1. Validation Rules

✅ **DO:**
- Validate at the lowest level possible (field > validation rule > trigger)
- Provide clear, actionable error messages
- Use appropriate severity levels
- Test with real-world data

❌ **DON'T:**
- Duplicate validations
- Create overly complex conditions
- Block legitimate edge cases
- Use triggers for simple validations

### 2. Workflow Rules

✅ **DO:**
- Keep workflows simple and focused
- Document the business logic
- Test workflow recursion
- Use scheduled workflows for batch updates

❌ **DON'T:**
- Create workflow loops
- Update too many fields in one workflow
- Use workflows for complex logic (use triggers)
- Mix concerns in one workflow

### 3. Triggers

✅ **DO:**
- Bulkify all trigger logic
- Use before triggers for field updates
- Use after triggers for related records
- Handle errors gracefully
- Add logging for debugging

❌ **DON'T:**
- Query in loops
- Create in loops
- Perform complex calculations in triggers
- Ignore governor limits

### 4. Approval Processes

✅ **DO:**
- Define clear entry criteria
- Set reasonable timeout periods
- Allow recall when appropriate
- Notify all stakeholders
- Track approval history

❌ **DON'T:**
- Create too many approval steps
- Make approvals too complex
- Forget rejection paths
- Hard-code approvers

### 5. Formula Fields

✅ **DO:**
- Keep formulas simple and readable
- Add comments for complex logic
- Test edge cases (null, zero, empty)
- Use appropriate data types

❌ **DON'T:**
- Create circular references
- Use formulas for frequently changing data
- Nest too many IF statements
- Ignore null handling

---

## Real-World Examples

### Lead Qualification Automation

```typescript
// Validation: Ensure valid data
validations: [
  {
    name: 'valid_email',
    type: 'script',
    severity: 'error',
    message: 'Invalid email address',
    condition: 'email != null AND !REGEX(email, "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")',
  },
],

// Workflow: Auto-assign hot leads
workflows: [
  {
    name: 'assign_hot_leads',
    triggerType: 'on_create',
    criteria: 'rating = "hot" AND lead_source = "web"',
    actions: [
      {
        type: 'field_update',
        field: 'owner',
        value: 'GET_ROUND_ROBIN_USER("sales_team")',
      },
      {
        type: 'task_create',
        subject: 'Contact hot lead: {name}',
        dueDate: '{NOW() + 2 hours}',
      },
    ],
  },
],

// Formula: Lead score
Field.formula({
  label: 'Lead Score',
  type: 'number',
  formula: `
    (IF(rating = "hot", 30, IF(rating = "warm", 20, 10))) +
    (IF(annual_revenue > 1000000, 25, 0)) +
    (IF(number_of_employees > 500, 20, 0)) +
    (IF(industry IN ("technology", "finance"), 15, 0))
  `,
})
```

### Opportunity Management

```typescript
// Validation: Stage progression
validations: [
  {
    name: 'valid_stage_change',
    type: 'script',
    severity: 'error',
    message: 'Cannot skip stages',
    condition: `
      AND(
        ISCHANGED(stage),
        NOT(ISNEW()),
        NOT(VALID_TRANSITION(PRIORVALUE(stage), stage))
      )
    `,
  },
],

// Workflow: Update probability
workflows: [
  {
    name: 'update_probability',
    triggerType: 'on_update',
    criteria: 'ISCHANGED(stage)',
    actions: [
      {
        type: 'field_update',
        field: 'probability',
        value: 'GET_STAGE_PROBABILITY(stage)',
      },
    ],
  },
],

// Approval: Large deals
// (See Approval Processes section above)
```

---

**Next:** [UI Design →](./03-ui-design.md)
