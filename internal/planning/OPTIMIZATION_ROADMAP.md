# ObjectStack Protocol - Optimization Roadmap

> **Date:** 2026-01-23  
> **Phase:** Post-Review Implementation Plan  
> **Timeline:** Q1 2026 - Q4 2026  
> **Priority Framework:** Critical → High → Medium → Low

---

## 🎯 Overview

This roadmap addresses the gaps identified in the **[PROTOCOL_REVIEW.md](./PROTOCOL_REVIEW.md)** comprehensive assessment. Tasks are organized by priority and estimated effort.

### Priority Definitions

- **🔴 CRITICAL:** Blocking production deployment, compliance/security risks
- **🟡 HIGH:** Significant impact on developer experience or feature completeness
- **🟢 MEDIUM:** Quality of life improvements, nice-to-have features
- **⚪ LOW:** Future enhancements, edge cases

---

## 📅 Q1 2026: Foundation & Compliance

### Sprint 1 (Weeks 1-2): Audit & Security

#### 🔴 CRITICAL: Audit Log Schema
**File:** `packages/spec/src/system/audit.zod.ts`  
**Effort:** 3 days  
**Owner:** System Protocol Team

**Implementation:**
```typescript
// packages/spec/src/system/audit.zod.ts
import { z } from 'zod'

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  
  // WHO performed the action
  actor: z.object({
    userId: z.string(),
    username: z.string(),
    roleId: z.string(),
    impersonating: z.boolean().default(false),
  }),
  
  // WHAT action was performed
  action: z.enum([
    // Data operations
    'create', 'read', 'update', 'delete', 'undelete',
    'export', 'import', 'bulk_update', 'bulk_delete',
    
    // Authentication
    'login', 'logout', 'login_failed', 'password_reset',
    'mfa_enabled', 'mfa_disabled',
    
    // Authorization
    'permission_granted', 'permission_revoked',
    'role_assigned', 'role_removed',
    
    // API access
    'api_key_created', 'api_key_revoked',
    'oauth_token_issued', 'oauth_token_revoked',
    
    // Configuration changes
    'object_created', 'object_modified', 'object_deleted',
    'field_created', 'field_modified', 'field_deleted',
    'workflow_activated', 'workflow_deactivated',
  ]),
  
  // WHERE (resource affected)
  resource: z.object({
    type: z.enum(['record', 'object', 'field', 'user', 'role', 'permission', 'api_key', 'workflow', 'flow']),
    objectName: z.string().optional(),
    recordId: z.string().optional(),
    fieldName: z.string().optional(),
  }),
  
  // WHEN
  timestamp: z.string().datetime(),
  
  // HOW (context)
  metadata: z.object({
    ipAddress: z.string(),
    userAgent: z.string(),
    requestId: z.string().uuid(),
    sessionId: z.string(),
    
    // Change tracking
    oldValue: z.any().nullable(),
    newValue: z.any().nullable(),
    changeReason: z.string().optional(), // User-provided audit reason
    
    // Geolocation (optional)
    geoLocation: z.object({
      country: z.string(),
      region: z.string(),
      city: z.string(),
    }).optional(),
  }),
})

export const AuditConfigSchema = z.object({
  enabled: z.boolean().default(true),
  
  // Retention
  retentionDays: z.number().default(180), // 6 months (GDPR)
  archiveAfterDays: z.number().default(90), // Move to cold storage
  archiveDestination: z.enum(['s3', 'glacier', 'database']).default('s3'),
  
  // Tracking granularity
  trackReads: z.boolean().default(false), // Expensive! Only for sensitive data
  trackFieldChanges: z.boolean().default(true),
  trackLogins: z.boolean().default(true),
  
  // Exclusions
  excludeObjects: z.array(z.string()).optional(), // Objects to skip
  excludeFields: z.array(z.string()).optional(), // Fields to skip (e.g., password)
  excludeUsers: z.array(z.string()).optional(), // System users
  
  // Alerting
  alertOnSuspiciousActivity: z.boolean().default(true),
  suspiciousPatterns: z.array(z.object({
    name: z.string(),
    condition: z.string(), // Formula: "COUNT(login_failed) > 5 IN LAST 10 MINUTES"
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    alertRecipients: z.array(z.string()), // Email addresses
    webhookUrl: z.string().url().optional(),
  })).optional(),
})

export type AuditLog = z.infer<typeof AuditLogSchema>
export type AuditConfig = z.infer<typeof AuditConfigSchema>
```

**Acceptance Criteria:**
- [ ] Schema validates all common audit scenarios
- [ ] Supports SOX, HIPAA, GDPR compliance requirements
- [ ] JSON schema generated correctly
- [ ] Unit tests with 90%+ coverage
- [ ] Documentation with examples

**Compliance Impact:**
- SOX: ✅ Tracks all financial record changes
- HIPAA: ✅ Tracks all PHI access
- GDPR: ✅ Tracks all PII processing

---

#### 🔴 CRITICAL: Multi-Tenancy Isolation Strategy
**File:** `packages/spec/src/system/tenant.zod.ts` (expand existing)  
**Effort:** 5 days  
**Owner:** System Protocol Team

**Implementation:**
```typescript
// packages/spec/src/system/tenant.zod.ts
import { z } from 'zod'

export const TenantIsolationStrategySchema = z.enum([
  'row_level',      // Add tenant_id to every table + PostgreSQL RLS
  'schema_level',   // CREATE SCHEMA tenant_123 for each tenant
  'database_level', // CREATE DATABASE tenant_123_db for each tenant
])

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/), // tenant1, acme-corp
  
  // Isolation configuration
  isolation: z.object({
    strategy: TenantIsolationStrategySchema.default('row_level'),
    
    // Row-level configuration
    tenantIdColumn: z.string().default('tenant_id'),
    enforceRLS: z.boolean().default(true), // PostgreSQL Row-Level Security
    
    // Schema-level configuration
    schemaPrefix: z.string().default('tenant_'),
    
    // Database-level configuration
    databasePrefix: z.string().default('tenant_'),
    databaseHost: z.string().optional(), // Separate DB host for enterprise
  }),
  
  // Resource quotas
  quotas: z.object({
    maxUsers: z.number().default(100),
    maxRecords: z.number().default(1000000),
    maxStorageGb: z.number().default(100),
    maxApiCallsPerMonth: z.number().default(1000000),
    maxConcurrentJobs: z.number().default(10),
    maxObjectsPerTenant: z.number().default(100),
    maxWorkflowsPerObject: z.number().default(10),
  }),
  
  // Feature flags
  features: z.object({
    enableAI: z.boolean().default(false),
    enableAPI: z.boolean().default(true),
    enableWebhooks: z.boolean().default(true),
    enableRealtime: z.boolean().default(false),
    enableAdvancedReports: z.boolean().default(false),
    enableMobileApp: z.boolean().default(true),
  }),
  
  // Status & lifecycle
  status: z.enum(['trial', 'active', 'suspended', 'churned']),
  tier: z.enum(['free', 'starter', 'professional', 'enterprise']),
  trialEndsAt: z.string().datetime().optional(),
  
  // Metadata
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string(),
})

export const TenantIsolationPolicySchema = z.object({
  // Security policies
  enforceRLS: z.boolean().default(true),
  preventCrossTenantQueries: z.boolean().default(true),
  auditCrossTenantAttempts: z.boolean().default(true),
  
  // Data residency
  dataResidency: z.object({
    region: z.string(), // "us-east-1", "eu-west-1"
    allowCrossRegionReplication: z.boolean().default(false),
  }).optional(),
  
  // Backup & disaster recovery
  backup: z.object({
    enabled: z.boolean().default(true),
    frequency: z.enum(['hourly', 'daily', 'weekly']).default('daily'),
    retentionDays: z.number().default(30),
  }),
})

export type Tenant = z.infer<typeof TenantSchema>
export type TenantIsolationPolicy = z.infer<typeof TenantIsolationPolicySchema>
```

**Documentation Required:**
Create `content/docs/specifications/multi-tenancy.mdx`:

```markdown
# Multi-Tenancy Architecture

## Isolation Strategies

### Row-Level (Recommended for Most Use Cases)
- Add `tenant_id` column to every table
- Use PostgreSQL Row-Level Security (RLS) policies
- ✅ Pros: Simple backups, cost-efficient, easy migrations
- ❌ Cons: Risk of data leakage if RLS misconfigured

### Schema-Level (Enterprise Tier)
- CREATE SCHEMA tenant_123 for each tenant
- ✅ Pros: Better isolation, easier debugging
- ❌ Cons: Complex backups, expensive migrations

### Database-Level (Regulated Industries)
- CREATE DATABASE tenant_123_db for each tenant
- ✅ Pros: Perfect isolation, regulatory compliance
- ❌ Cons: Expensive, connection pool limits

## Implementation Guide

### Row-Level Security Example (PostgreSQL)
\`\`\`sql
-- Enable RLS on table
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY tenant_isolation ON accounts
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Set tenant context
SET app.current_tenant = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
\`\`\`
```

**Acceptance Criteria:**
- [ ] All three strategies documented
- [ ] Migration guide for switching strategies
- [ ] Security best practices documented
- [ ] Unit tests for each strategy
- [ ] JSON schema generated

---

### Sprint 2 (Weeks 3-4): Workflow & Formula Enhancements

#### 🟡 HIGH: Workflow Action Expansion
**File:** `packages/spec/src/data/workflow.zod.ts` (expand existing)  
**Effort:** 3 days  
**Owner:** Data Protocol Team

**Implementation:**
```typescript
// packages/spec/src/data/workflow.zod.ts
export const WorkflowActionSchema = z.discriminatedUnion('type', [
  // Existing actions
  z.object({ 
    type: z.literal('fieldUpdate'), 
    field: z.string(), 
    value: z.any() 
  }),
  z.object({ 
    type: z.literal('email'), 
    template: z.string(), 
    recipients: z.array(z.string()) 
  }),
  
  // NEW: Communication actions
  z.object({ 
    type: z.literal('sms'),
    phoneNumberField: z.string(),
    messageTemplate: z.string(),
    provider: z.enum(['twilio', 'vonage', 'aws_sns']).optional(),
  }),
  z.object({ 
    type: z.literal('slack'),
    channel: z.string(), // #sales or @username
    messageTemplate: z.string(),
    attachments: z.array(z.object({
      title: z.string(),
      text: z.string(),
      color: z.string().optional(),
    })).optional(),
  }),
  z.object({ 
    type: z.literal('teams'),
    webhookUrl: z.string().url(),
    messageTemplate: z.string(),
    theme: z.enum(['default', 'success', 'warning', 'error']).optional(),
  }),
  
  // NEW: Integration actions
  z.object({ 
    type: z.literal('httpCallout'),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
    url: z.string().url(),
    headers: z.record(z.string()).optional(),
    body: z.any().optional(),
    timeout: z.number().default(30),
    retryOnFailure: z.boolean().default(false),
  }),
  z.object({ 
    type: z.literal('webhook'),
    webhookId: z.string(), // Reference to webhook.zod.ts
    payload: z.any().optional(),
  }),
  
  // NEW: Task creation
  z.object({ 
    type: z.literal('createTask'),
    subject: z.string(),
    description: z.string().optional(),
    assignedTo: z.string(), // User ID or formula
    dueDate: z.string().optional(), // ISO date or formula
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
  }),
  
  // NEW: System actions
  z.object({ 
    type: z.literal('customScript'),
    scriptName: z.string(),
    parameters: z.record(z.any()).optional(),
  }),
  z.object({ 
    type: z.literal('pushNotification'),
    title: z.string(),
    body: z.string(),
    recipients: z.array(z.string()), // User IDs
    actionUrl: z.string().url().optional(),
  }),
])
```

**Acceptance Criteria:**
- [ ] 10+ action types supported
- [ ] Examples for each action type in docs
- [ ] Integration tests with mock providers
- [ ] Error handling for failed actions

---

#### 🟡 HIGH: Formula Function Library Documentation
**File:** `content/docs/references/formula-functions.mdx`  
**Effort:** 4 days  
**Owner:** Documentation Team

**Create comprehensive function library:**
```markdown
# Formula Function Library

## Text Functions

### UPPER(text)
Converts text to uppercase.
\`\`\`
UPPER("hello") → "HELLO"
\`\`\`

### LOWER(text)
Converts text to lowercase.

### CONCATENATE(text1, text2, ...)
Joins text strings.
\`\`\`
CONCATENATE(first_name, " ", last_name) → "John Doe"
\`\`\`

### TEXT(number)
Converts number to text.

### VALUE(text)
Converts text to number.

### LEN(text)
Returns text length.

### TRIM(text)
Removes leading/trailing spaces.

### LEFT(text, num_chars)
Returns leftmost characters.

### RIGHT(text, num_chars)
Returns rightmost characters.

### MID(text, start, length)
Returns substring.

### FIND(search, text)
Returns position of substring (1-based).

### REPLACE(text, old, new)
Replaces text.

## Math Functions

### SUM(number1, number2, ...)
Adds numbers.

### AVERAGE(number1, number2, ...)
Calculates average.

### ROUND(number, decimals)
Rounds to decimal places.

### CEILING(number)
Rounds up.

### FLOOR(number)
Rounds down.

### ABS(number)
Absolute value.

### MIN(number1, number2, ...)
Returns minimum.

### MAX(number1, number2, ...)
Returns maximum.

### POWER(base, exponent)
Raises to power.

### SQRT(number)
Square root.

### MOD(number, divisor)
Modulo (remainder).

## Date Functions

### TODAY()
Current date (no time).

### NOW()
Current date and time.

### YEAR(date)
Extract year.

### MONTH(date)
Extract month (1-12).

### DAY(date)
Extract day (1-31).

### ADDDAYS(date, days)
Add days to date.
\`\`\`
ADDDAYS(TODAY(), 7) → 7 days from now
\`\`\`

### ADDMONTHS(date, months)
Add months.

### ADDYEARS(date, years)
Add years.

### DATE(year, month, day)
Create date.

### DATEVALUE(text)
Parse date from text.

### TIMEDIFF(date1, date2, unit)
Difference between dates.
\`\`\`
TIMEDIFF(due_date, TODAY(), "days") → days until due
\`\`\`
Units: "seconds", "minutes", "hours", "days", "months", "years"

## Logical Functions

### IF(condition, true_value, false_value)
Conditional logic.
\`\`\`
IF(amount > 1000, "High", "Low")
\`\`\`

### AND(condition1, condition2, ...)
Logical AND.

### OR(condition1, condition2, ...)
Logical OR.

### NOT(condition)
Logical NOT.

### ISBLANK(field)
Check if null/empty.

### ISNUMBER(value)
Check if numeric.

### CASE(expression, value1, result1, value2, result2, ..., default)
Switch-case logic.
\`\`\`
CASE(status, "new", 0, "in_progress", 50, "done", 100, 0)
\`\`\`

## Lookup Functions

### LOOKUP(field)
Get related field value.
\`\`\`
LOOKUP(account.industry) → Industry of related account
\`\`\`

### ROLLUP(related_object, field, function)
Aggregate related records.
\`\`\`
ROLLUP(opportunities, amount, SUM) → Total opportunity amount
\`\`\`
Functions: SUM, AVG, MIN, MAX, COUNT

### PARENT(field)
Get parent record field (master-detail).

## Advanced Functions

### REGEX(text, pattern)
Regular expression match.
\`\`\`
REGEX(email, "^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$")
\`\`\`

### JSON(path, json_string)
Extract from JSON.
\`\`\`
JSON("address.city", custom_data) → "San Francisco"
\`\`\`

### HASH(text, algorithm)
Hash text.
\`\`\`
HASH(email, "sha256") → "a665a45920..."
\`\`\`

### ENCRYPT(text, key)
Encrypt text (AES-256).

### DECRYPT(encrypted, key)
Decrypt text.

## Type Conversion

### TEXT(value)
Convert to text.

### VALUE(text)
Convert to number.

### DATE(value)
Convert to date.

### BOOLEAN(value)
Convert to boolean.
```

**Acceptance Criteria:**
- [ ] All 50+ functions documented
- [ ] Examples for each function
- [ ] Type compatibility matrix
- [ ] Error cases documented

---

## 📅 Q2 2026: UI & Page Components

### Sprint 3 (Weeks 5-6): Page Component System

#### 🟡 HIGH: Page Component Schema
**File:** `packages/spec/src/ui/page.zod.ts` (expand existing)  
**Effort:** 5 days  
**Owner:** UI Protocol Team

**Implementation:**
```typescript
// packages/spec/src/ui/page.zod.ts
import { z } from 'zod'

export const PageRegionSchema = z.object({
  name: z.string(),
  type: z.enum(['header', 'sidebar_left', 'sidebar_right', 'main', 'footer']),
  width: z.number().min(1).max(12).optional(), // Grid columns
  minHeight: z.number().optional(), // Pixels
  components: z.array(z.lazy(() => PageComponentSchema)),
  
  // Responsive behavior
  mobile: z.object({
    hidden: z.boolean().default(false),
    stackComponents: z.boolean().default(true),
  }).optional(),
})

export const PageComponentSchema = z.discriminatedUnion('type', [
  // Record components
  z.object({ 
    type: z.literal('record_detail'),
    objectName: z.string(),
    recordId: z.string().optional(), // Formula or parameter
    layout: z.enum(['simple', 'tabbed', 'wizard']).default('simple'),
  }),
  z.object({ 
    type: z.literal('related_list'),
    objectName: z.string(),
    relationshipName: z.string(),
    viewName: z.string().optional(),
    maxRecords: z.number().default(10),
    enableInlineEdit: z.boolean().default(false),
  }),
  
  // Analytics components
  z.object({ 
    type: z.literal('dashboard_widget'),
    widgetId: z.string(),
    refreshInterval: z.number().optional(), // Seconds
  }),
  z.object({ 
    type: z.literal('report'),
    reportId: z.string(),
    chartType: z.enum(['table', 'bar', 'line', 'pie']).optional(),
  }),
  z.object({ 
    type: z.literal('metric_card'),
    title: z.string(),
    formula: z.string(), // e.g., "COUNT(opportunity WHERE status = 'won')"
    format: z.enum(['number', 'currency', 'percent']).default('number'),
    trend: z.boolean().default(false), // Show trend arrow
  }),
  
  // Custom content
  z.object({ 
    type: z.literal('custom_html'),
    html: z.string(),
  }),
  z.object({ 
    type: z.literal('iframe'),
    url: z.string().url(),
    height: z.number().default(600),
  }),
  z.object({ 
    type: z.literal('markdown'),
    content: z.string(),
  }),
  
  // Navigation components
  z.object({ 
    type: z.literal('recent_items'),
    objectNames: z.array(z.string()).optional(),
    maxItems: z.number().default(10),
  }),
  z.object({ 
    type: z.literal('global_search'),
    placeholder: z.string().optional(),
  }),
  
  // Collaboration
  z.object({ 
    type: z.literal('activity_timeline'),
    recordId: z.string().optional(),
    objectName: z.string().optional(),
    maxItems: z.number().default(20),
  }),
  z.object({ 
    type: z.literal('comments'),
    recordId: z.string().optional(),
    enableMentions: z.boolean().default(true),
  }),
])

export const PageSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(['record', 'home', 'app', 'utility']),
  
  // Object-specific pages
  objectName: z.string().optional(),
  recordId: z.string().optional(),
  
  // Layout
  layout: z.enum(['one_column', 'two_column_left', 'two_column_right', 'three_column']).default('one_column'),
  regions: z.array(PageRegionSchema),
  
  // Permissions
  permissions: z.array(z.string()).optional(), // Role names
  
  // Metadata
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

export type Page = z.infer<typeof PageSchema>
export type PageRegion = z.infer<typeof PageRegionSchema>
export type PageComponent = z.infer<typeof PageComponentSchema>
```

**Acceptance Criteria:**
- [ ] 15+ component types supported
- [ ] FlexiPage-style regions (header, sidebars, main, footer)
- [ ] Responsive behavior defined
- [ ] Examples for common page layouts
- [ ] JSON schema generated

---

### Sprint 4 (Weeks 7-8): Report Enhancements

#### 🟢 MEDIUM: Report Grouping & Subtotals
**File:** `packages/spec/src/ui/report.zod.ts` (expand existing)  
**Effort:** 3 days  
**Owner:** UI Protocol Team

**Implementation:**
```typescript
// packages/spec/src/ui/report.zod.ts
export const ReportGroupingSchema = z.object({
  field: z.string(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  
  // Date grouping (for date fields)
  dateGrouping: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
  
  // Subtotals
  subtotals: z.array(z.object({
    field: z.string(),
    function: z.enum(['sum', 'avg', 'count', 'min', 'max', 'median']),
    label: z.string().optional(),
  })),
})

export const ReportFilterSchema = z.object({
  field: z.string(),
  operator: z.enum([
    'equals', 'not_equals', 
    'greater_than', 'greater_than_or_equal',
    'less_than', 'less_than_or_equal',
    'contains', 'not_contains',
    'starts_with', 'ends_with',
    'in', 'not_in',
    'between',
    'is_null', 'is_not_null',
  ]),
  value: z.any().optional(),
  values: z.array(z.any()).optional(), // For 'in' operator
  
  // Filter logic
  filterLogic: z.string().optional(), // "1 AND (2 OR 3)"
})

export const ReportSchema = z.object({
  // ... existing fields
  
  // Grouping (max 3 levels)
  groupings: z.array(ReportGroupingSchema).max(3),
  
  // Filters
  filters: z.array(ReportFilterSchema),
  
  // Cross-filters (related objects)
  crossFilters: z.array(z.object({
    relatedObject: z.string(),
    hasRecords: z.boolean(), // "Has Opportunities" vs "Has No Opportunities"
    relationshipName: z.string(),
  })).optional(),
  
  // Custom summary formulas
  customSummaryFormulas: z.array(z.object({
    name: z.string(),
    label: z.string(),
    formula: z.string(), // e.g., "SUM(amount) / COUNT(id)"
    format: z.enum(['number', 'currency', 'percent']).default('number'),
  })).optional(),
  
  // Chart settings
  chart: z.object({
    type: z.enum(['bar', 'line', 'pie', 'donut', 'funnel', 'scatter']),
    xAxis: z.string(),
    yAxis: z.string(),
    legend: z.boolean().default(true),
  }).optional(),
})
```

**Acceptance Criteria:**
- [ ] 3-level grouping support
- [ ] Subtotal functions (sum, avg, count, min, max, median)
- [ ] Cross-filter support
- [ ] Custom summary formulas
- [ ] Examples for common report patterns

---

## 📅 Q3 2026: AI Safety & Advanced Features

### Sprint 5 (Weeks 9-10): AI Safety

#### 🔴 CRITICAL: AI Safety & Guardrails
**File:** `packages/spec/src/ai/safety.zod.ts` (new)  
**Effort:** 5 days  
**Owner:** AI Protocol Team

**Implementation:**
```typescript
// packages/spec/src/ai/safety.zod.ts
import { z } from 'zod'

export const SafetyGuardrailTypeSchema = z.enum([
  'prompt_injection_detection', // Detect malicious prompts
  'pii_detection',              // Prevent PII leakage
  'hallucination_detection',    // Check for factual errors
  'output_validation',          // Validate generated code/queries
  'content_moderation',         // Block offensive content
  'jailbreak_prevention',       // Prevent system prompt overrides
  'sql_injection_prevention',   // Prevent SQL injection in generated queries
  'xss_prevention',             // Prevent XSS in generated HTML/JS
])

export const SafetyGuardrailSchema = z.object({
  name: z.string(),
  type: SafetyGuardrailTypeSchema,
  enabled: z.boolean().default(true),
  action: z.enum(['block', 'warn', 'log']).default('block'),
  threshold: z.number().min(0).max(1).optional(), // Confidence threshold (0.0-1.0)
  
  // Custom validation
  validationScript: z.string().optional(), // JavaScript validator function
  
  // Error handling
  errorMessage: z.string().optional(),
  fallbackResponse: z.string().optional(),
})

export const PiiProtectionConfigSchema = z.object({
  enabled: z.boolean().default(true),
  
  // Redaction
  redactFromPrompts: z.boolean().default(true),
  redactFromResponses: z.boolean().default(true),
  redactionPlaceholder: z.string().default('[REDACTED]'),
  
  // PII types
  detectEmails: z.boolean().default(true),
  detectPhones: z.boolean().default(true),
  detectSSNs: z.boolean().default(true),
  detectCreditCards: z.boolean().default(true),
  detectPasswords: z.boolean().default(true),
  detectApiKeys: z.boolean().default(true),
  
  // Allowed PII (opt-in)
  allowedPiiTypes: z.array(z.enum(['email', 'phone', 'ssn', 'credit_card'])).optional(),
  
  // Custom PII patterns (regex)
  customPiiPatterns: z.array(z.object({
    name: z.string(),
    pattern: z.string(), // Regex pattern
    replacement: z.string().default('[REDACTED]'),
  })).optional(),
})

export const OutputValidationConfigSchema = z.object({
  enabled: z.boolean().default(true),
  
  // SQL validation
  validateSQLQueries: z.boolean().default(true),
  allowedSQLCommands: z.array(z.enum(['SELECT', 'INSERT', 'UPDATE', 'DELETE'])).default(['SELECT']),
  blockDangerousFunctions: z.boolean().default(true), // Block DROP, TRUNCATE, etc.
  
  // JavaScript validation
  validateJavaScript: z.boolean().default(true),
  allowEval: z.boolean().default(false),
  allowedFunctions: z.array(z.string()).optional(), // Whitelist
  
  // HTML validation
  validateHTML: z.boolean().default(true),
  allowedTags: z.array(z.string()).optional(), // e.g., ['p', 'div', 'span']
  blockScriptTags: z.boolean().default(true),
  
  // Sandbox execution
  sandboxGeneratedCode: z.boolean().default(true),
  sandboxTimeout: z.number().default(5000), // Milliseconds
})

export const RateLimitingConfigSchema = z.object({
  enabled: z.boolean().default(true),
  
  // Request limits
  maxRequestsPerMinute: z.number().default(10),
  maxRequestsPerHour: z.number().default(100),
  maxRequestsPerDay: z.number().default(1000),
  
  // Token limits
  maxTokensPerRequest: z.number().default(4000),
  maxTokensPerHour: z.number().default(100000),
  maxTokensPerDay: z.number().default(1000000),
  
  // Cost limits
  maxCostPerRequestUsd: z.number().optional(),
  maxCostPerDayUsd: z.number().optional(),
})

export const SafetyConfigSchema = z.object({
  // Guardrails
  guardrails: z.array(SafetyGuardrailSchema),
  
  // PII protection
  piiProtection: PiiProtectionConfigSchema,
  
  // Output validation
  outputValidation: OutputValidationConfigSchema,
  
  // Rate limiting
  rateLimiting: RateLimitingConfigSchema,
  
  // Monitoring & alerts
  monitoring: z.object({
    logAllRequests: z.boolean().default(true),
    logBlockedRequests: z.boolean().default(true),
    alertOnThresholdExceeded: z.boolean().default(true),
    alertRecipients: z.array(z.string()).optional(),
  }),
})

export type SafetyGuardrail = z.infer<typeof SafetyGuardrailSchema>
export type SafetyConfig = z.infer<typeof SafetyConfigSchema>
```

**Acceptance Criteria:**
- [ ] 8+ guardrail types implemented
- [ ] PII detection with 90%+ accuracy
- [ ] SQL/XSS injection prevention
- [ ] Integration tests with attack scenarios
- [ ] Documentation with security best practices

---

### Sprint 6 (Weeks 11-12): AI Conversation & Cost Management

#### 🟡 HIGH: Conversation Memory Schema
**File:** `packages/spec/src/ai/conversation.zod.ts` (new)  
**Effort:** 3 days  
**Owner:** AI Protocol Team

**Implementation:**
```typescript
// packages/spec/src/ai/conversation.zod.ts
import { z } from 'zod'

export const ConversationMessageSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  timestamp: z.string().datetime(),
  
  // Token tracking
  promptTokens: z.number().optional(),
  completionTokens: z.number().optional(),
  totalTokens: z.number().optional(),
  
  // Tool calls
  toolCalls: z.array(z.object({
    id: z.string(),
    type: z.literal('function'),
    function: z.object({
      name: z.string(),
      arguments: z.string(), // JSON string
    }),
    result: z.any().optional(),
  })).optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
})

export const TokenBudgetSchema = z.object({
  maxTokensPerMessage: z.number().default(4000),
  maxTokensPerConversation: z.number().default(128000),
  maxMessagesPerConversation: z.number().default(100),
  
  totalTokensUsed: z.number(),
  estimatedCostUsd: z.number(),
  
  // Auto-summarization
  enableAutoSummarization: z.boolean().default(true),
  summarizeAfterTokens: z.number().default(100000), // Summarize old messages
})

export const ConversationSchema = z.object({
  id: z.string().uuid(),
  agentId: z.string(),
  userId: z.string(),
  
  // Messages
  messages: z.array(ConversationMessageSchema),
  
  // Token budget
  tokenBudget: TokenBudgetSchema,
  
  // Conversation state
  status: z.enum(['active', 'completed', 'failed', 'timeout']),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  
  // Context
  context: z.record(z.any()).optional(), // Persistent context across messages
  
  // Metadata
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
})

export type ConversationMessage = z.infer<typeof ConversationMessageSchema>
export type Conversation = z.infer<typeof ConversationSchema>
```

---

#### 🟡 HIGH: AI Cost Tracking
**File:** `packages/spec/src/ai/cost.zod.ts` (new)  
**Effort:** 3 days  
**Owner:** AI Protocol Team

**Implementation:**
```typescript
// packages/spec/src/ai/cost.zod.ts
import { z } from 'zod'

export const ModelPricingSchema = z.object({
  modelId: z.string(),
  provider: z.enum(['openai', 'anthropic', 'azure', 'google', 'cohere', 'huggingface']),
  
  pricing: z.object({
    promptTokensPer1k: z.number(), // USD per 1000 prompt tokens
    completionTokensPer1k: z.number(), // USD per 1000 completion tokens
    embeddingPer1k: z.number().optional(),
    fineTuningTrainingPer1k: z.number().optional(),
    fineTuningInferencePer1k: z.number().optional(),
  }),
  
  // Effective dates
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),
})

export const UsageCostSchema = z.object({
  tenantId: z.string(),
  period: z.string(), // "2024-01" (monthly)
  
  // Breakdown by model
  breakdown: z.array(z.object({
    modelId: z.string(),
    provider: z.string(),
    
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
    
    promptCostUsd: z.number(),
    completionCostUsd: z.number(),
    totalCostUsd: z.number(),
    
    requestCount: z.number(),
  })),
  
  // Totals
  totalPromptTokens: z.number(),
  totalCompletionTokens: z.number(),
  totalTokens: z.number(),
  totalCostUsd: z.number(),
  
  // Budget & alerts
  budgetLimitUsd: z.number().optional(),
  budgetUsedPercent: z.number(),
  budgetAlertThreshold: z.number().default(0.9), // Alert at 90%
  budgetExceeded: z.boolean(),
})

export type ModelPricing = z.infer<typeof ModelPricingSchema>
export type UsageCost = z.infer<typeof UsageCostSchema>
```

---

## 📅 Q4 2026: API Enhancements & Polish

### Sprint 7 (Weeks 13-14): API Improvements

#### 🟢 MEDIUM: Cursor-Based Pagination
**File:** `packages/spec/src/api/contract.zod.ts` (expand)  
**Effort:** 2 days  
**Owner:** API Protocol Team

**Implementation:**
```typescript
// packages/spec/src/api/contract.zod.ts
export const CursorPaginationSchema = z.object({
  cursor: z.string().optional(), // Opaque cursor (base64-encoded)
  limit: z.number().min(1).max(100).default(25),
  hasMore: z.boolean(),
  nextCursor: z.string().optional(),
  previousCursor: z.string().optional(),
})

export const ListRecordResponseSchema = z.object({
  data: z.array(z.any()),
  
  // Support both offset and cursor pagination
  pagination: z.union([
    OffsetPaginationSchema,
    CursorPaginationSchema,
  ]),
  
  metadata: ResponseMetadataSchema,
})
```

---

#### 🟢 MEDIUM: Field Projection
**File:** `packages/spec/src/api/contract.zod.ts` (expand)  
**Effort:** 2 days  
**Owner:** API Protocol Team

**Implementation:**
```typescript
// packages/spec/src/api/contract.zod.ts
export const FieldProjectionSchema = z.object({
  fields: z.array(z.string()).optional(), // Include only these fields
  exclude: z.array(z.string()).optional(), // Exclude these fields
  include: z.object({
    relatedObjects: z.array(z.string()).optional(), // Include related objects
  }).optional(),
})

// Usage: GET /api/account/123?fields=name,email,phone&include=contacts
```

---

#### 🟢 MEDIUM: API Versioning
**File:** `packages/spec/src/system/api.zod.ts` (expand)  
**Effort:** 2 days  
**Owner:** System Protocol Team

**Implementation:**
```typescript
// packages/spec/src/system/api.zod.ts
export const ApiVersionSchema = z.object({
  version: z.string(), // "v1", "v2", "2024-01-15"
  status: z.enum(['stable', 'beta', 'deprecated', 'sunset']),
  
  deprecated: z.boolean().default(false),
  deprecationDate: z.string().datetime().optional(),
  sunsetDate: z.string().datetime().optional(), // When version will be removed
  
  // Versioning strategy
  versioningStrategy: z.enum(['header', 'url', 'query']).default('url'),
  // Header: X-API-Version: v1
  // URL: /api/v1/account/123
  // Query: /api/account/123?version=v1
  
  // Migration guide
  changelogUrl: z.string().url().optional(),
  migrationGuideUrl: z.string().url().optional(),
})
```

---

### Sprint 8 (Weeks 15-16): Final Polish

#### 🟢 MEDIUM: Documentation Cleanup
**Effort:** 5 days  
**Owner:** Documentation Team

**Tasks:**
- [ ] Update all MDX files with new schemas
- [ ] Add examples for every protocol file
- [ ] Create migration guides for breaking changes
- [ ] Add architecture diagrams for new features
- [ ] Review and update CONTRIBUTING.md

---

## 📊 Progress Tracking

### Key Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Protocol Completeness | 95% | 75% | 🟡 |
| Documentation Coverage | 90% | 60% | 🟡 |
| Unit Test Coverage | 85% | 70% | 🟡 |
| Schema Generation | 100% | 100% | ✅ |
| JSON Schema Validation | 100% | 100% | ✅ |

### Milestones

- **Q1 2026 End:** ✅ Audit, tenancy, workflow actions, formula docs
- **Q2 2026 End:** ✅ Page components, report enhancements
- **Q3 2026 End:** ✅ AI safety, conversation memory, cost tracking
- **Q4 2026 End:** ✅ API improvements, documentation polish

---

## 🚨 Risk Management

### High-Risk Items

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Multi-tenancy RLS misconfiguration | 🔴 Critical | Comprehensive testing, security audit, PostgreSQL expert review |
| AI safety bypasses | 🔴 Critical | Red team testing, external security review |
| Performance degradation (audit logs) | 🟡 High | Async logging, partitioned tables, archival strategy |
| Breaking changes in API | 🟡 High | Versioning strategy, deprecation notices, migration guides |

---

## 📞 Contact & Ownership

| Area | Team | Lead | Slack Channel |
|------|------|------|---------------|
| Data Protocol | @data-team | TBD | #protocol-data |
| UI Protocol | @ui-team | TBD | #protocol-ui |
| System Protocol | @system-team | TBD | #protocol-system |
| AI Protocol | @ai-team | TBD | #protocol-ai |
| API Protocol | @api-team | TBD | #protocol-api |
| Documentation | @docs-team | TBD | #protocol-docs |

---

**Document Status:** ✅ Complete  
**Last Updated:** 2026-01-23  
**Next Review:** End of Q1 2026
